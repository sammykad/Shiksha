import prisma from "@/lib/db";
import { NotificationChannel } from "@/generated/prisma/enums";
import { ChannelFactory, LogContext } from "@/lib/notifications/channels";
import {
  NotificationTemplateId,
  NotificationVariables,
  TemplateVariablesMap,
  NotificationBody,
} from "./template";
import React from "react";
import { chunkArray, retry, sleep, calculateNotificationCost, getChannelUnitCost, formatDateIN, formatCurrencyIN } from "@/lib/utils";
import { createHash } from "crypto";
import { getOrganizationNotificationSettings } from "@/lib/notifications/organization-notification-settings";
import { getNotificationVariables, getOrganizationId } from "../organization";
import { getCurrentAcademicYearId } from "../academicYear";
import { NOTIFICATION_REGISTRY } from "@/lib/notifications/registry";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 100;
const MAX_CONCURRENT_RECIPIENTS = 10;
const INTER_BATCH_DELAY_MS = 500;
const INTER_RECIPIENT_DELAY_MS = 50;
const CHANNEL_SEND_DELAY_MS = 100;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RecipientInfo {
  userId?: string;
  studentId?: string;
  parentId?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  fcmTokens?: string[];
}

export interface NotificationPayload<T extends NotificationTemplateId> {
  templateId: T;
  variables: TemplateVariablesMap[T];
  recipients: RecipientInfo[];
  organizationId: string;
  academicYearId?: string;
  // Pass the business record id this notification is about.
  // This is used to build stable idempotency keys — never use a timestamp.
  //
  // Examples:
  //   fee overdue          → fee.id
  //   student absent       → `${studentId}:${attendanceDate}`
  //   exam scheduled       → exam.id
  //   leave approved       → `${leaveId}:APPROVED`
  //   notice published     → notice.id
  //   payment success      → feePayment.id
  eventId: string;
  channels?: NotificationChannel[];
  attachment?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  };
}

export interface ChannelResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  cost: number;
  units: number;
}

export interface NotificationResult {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  totalAlreadySent: number;
  totalCost: number;
  error?: "INSUFFICIENT_BALANCE" | string;
  results: { recipient: RecipientInfo; channels: ChannelResult[] }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────────────────────────────────────
function log(
  templateId: string,
  level: "info" | "warn" | "error" | "start" | "success" | "skip",
  message: string,
  extra?: Record<string, unknown>
): void {
  const symbols = {
    start: "🚀",
    success: "✅",
    skip: "🛡️",
    info: "🔹",
    warn: "⚠️",
    error: "❌",
  };

  const symbol = symbols[level] || "";
  const line = `${symbol} [ENGINE | ${templateId}] ${message}`;

  if (level === "error") extra ? console.error(line, extra) : console.error(line);
  else if (level === "warn") extra ? console.warn(line, extra) : console.warn(line);
  else extra ? console.log(line, extra) : console.log(line);
}

function recipientLabel(r: RecipientInfo): string {
  if (r.email) return r.email;
  if (r.userId) return `user:${r.userId.slice(0, 8)}`;
  if (r.studentId) return `student:${r.studentId.slice(0, 8)}`;
  if (r.parentId) return `parent:${r.parentId.slice(0, 8)}`;
  return "unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function isValidEmail(value: string | undefined | null): boolean {
  if (!value || typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function isValidPhone(value: string | undefined | null): boolean {
  if (!value || typeof value !== "string") return false;
  return /^\d{7,15}$/.test(value.replace(/[\s\-\+\(\)\.]/g, ""));
}

// ─────────────────────────────────────────────────────────────────────────────
// IDEMPOTENCY
//
// Two separate key spaces prevent duplicate inbox items AND duplicate sends
// independently of each other.
//
// Inbox key  — one per recipient per event regardless of channel count
//   sha256( inbox : orgId : templateId : recipientId : eventId )
//
// Log key    — one per recipient per channel per event
//   sha256( log : orgId : templateId : recipientId : channel : eventId )
//
// eventId must always be a stable business value passed by the caller.
// Never build a key from new Date() or a timestamp — that defeats the purpose.
// ─────────────────────────────────────────────────────────────────────────────

function buildInboxKey(organizationId: string, templateId: string, recipientId: string, eventId: string): string {
  return createHash("sha256")
    .update(`inbox:${organizationId}:${templateId}:${recipientId}:${eventId}`)
    .digest("hex");
}

function buildLogKey(organizationId: string, templateId: string, recipientId: string, channel: NotificationChannel, eventId: string): string {
  return createHash("sha256")
    .update(`log:${organizationId}:${templateId}:${recipientId}:${channel}:${eventId}`)
    .digest("hex");
}
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function replaceVars(template: string, variables: any): string {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const k = key.trim();
    const value = variables[k];

    if (value === undefined || value === null) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[NotificationEngine] Missing variable: "${k}" in template string`);
        return match; // Keep {{key}} in dev to spot bugs
      }
      return "";
    }

    if (value instanceof Date) return formatDateIN(value);

    // Auto-format currency for amount-related fields
    if (typeof value === "number" && /amount|fee|price|cost|balance/i.test(k)) {
      return `₹${formatCurrencyIN(value)}`;
    }

    if (typeof value === "number") return value.toLocaleString("en-IN");

    return String(value);
  });
}

function buildRecipientKey(r: RecipientInfo): string {
  return (
    [r.userId, r.studentId, r.parentId, r.email, r.phone, r.whatsappNumber]
      .filter(Boolean)
      .join("|") || "anonymous"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STALE FCM TOKEN CLEANUP
// Firebase returns staleToken: true when a token is permanently invalid.
// We delete it immediately so it is never retried across future sends.
// ─────────────────────────────────────────────────────────────────────────────

async function deleteStaleToken(token: string, templateId: string): Promise<void> {
  try {
    const { count } = await prisma.deviceToken.deleteMany({ where: { token } });
    log(templateId, "info", `Deleted ${count} stale FCM token: ${token.slice(0, 16)}…`);
  } catch (err) {
    log(templateId, "error", "Failed to delete stale FCM token", {
      error: (err as Error).message,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENABLED CHANNELS
// Reads from the org's NotificationSetting.channels JSON.
// template.subKey allows per-event-type channel control within a notification
// type — e.g. FEE has subKeys: fee_created, friendly_reminder, overdue_notice.
// Locked channels are excluded — they are system-required and fire separately.
// ─────────────────────────────────────────────────────────────────────────────

function getEnabledChannels(
  templateId: NotificationTemplateId,
  orgSettings: Awaited<ReturnType<typeof getOrganizationNotificationSettings>>
): NotificationChannel[] {
  const def = NOTIFICATION_REGISTRY[templateId];
  if (!def) return [];

  const setting = orgSettings.find((s) => s.notificationType === def.type);
  if (!setting?.isActive) return [];

  const channels = setting.channels as Record<string, any>;
  const src = def.subKey ? channels[def.subKey] : channels;
  if (!src) return [];

  const enabled: NotificationChannel[] = [];
  if (src.SMS?.enabled && !src.SMS?.locked) enabled.push("SMS");
  if (src.WHATSAPP?.enabled && !src.WHATSAPP?.locked) enabled.push("WHATSAPP");
  if (src.EMAIL?.enabled && !src.EMAIL?.locked) enabled.push("EMAIL");
  if (src.PUSH?.enabled && !src.PUSH?.locked) enabled.push("PUSH");
  return enabled;
}
// ─────────────────────────────────────────────────────────────────────────────
// RECIPIENT RESOLUTION
//
// Resolves studentId / userId / parentId stubs into full contact objects.
// FCM tokens are fetched eagerly here so the PUSH channel never hits the DB.
//
// When resolving a student, their primary parent is also resolved and added
// as a separate recipient — both get their own Notification inbox row.
// ─────────────────────────────────────────────────────────────────────────────
export interface NotifyContext {
  organizationId: string;
  academicYearId: string | undefined;
  organizationName: string;
}

export async function resolveContext(): Promise<NotifyContext> {
  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getCurrentAcademicYearId(),
  ]);
  const { organizationName } = await getNotificationVariables(organizationId);
  return { organizationId, academicYearId: academicYearId ?? undefined, organizationName };
}
async function resolveRecipients(
  recipients: RecipientInfo[],
  organizationId: string,
  templateId: string
): Promise<RecipientInfo[]> {
  const resolved: RecipientInfo[] = [];
  const studentIds = new Set<string>();
  const userIds = new Set<string>();
  const parentIds = new Set<string>();
  const direct: RecipientInfo[] = [];

  for (const r of recipients) {
    if (r.studentId) studentIds.add(r.studentId);
    else if (r.userId) userIds.add(r.userId);
    else if (r.parentId) parentIds.add(r.parentId);
    else direct.push(r);
  }

  if (studentIds.size > 0) {
    log(templateId, "info", `Resolving ${studentIds.size} student(s)…`);

    const students = await prisma.student.findMany({
      where: { id: { in: Array.from(studentIds) }, organizationId },
      include: {
        user: { include: { deviceTokens: true } },
        parents: {
          where: { isPrimary: true },
          include: {
            parent: { include: { user: { include: { deviceTokens: true } } } },
          },
        },
      },
    });

    for (const s of students) {
      resolved.push({
        userId: s.userId,
        studentId: s.id,
        email: s.email,
        phone: s.phoneNumber,
        whatsappNumber: s.whatsAppNumber,
        fcmTokens: s.user.deviceTokens.map((d) => d.token),
      });

      const parent = s.parents[0]?.parent;
      if (parent) {
        resolved.push({
          userId: parent.userId ?? undefined,
          parentId: parent.id,
          studentId: s.id,
          email: parent.email,
          phone: parent.phoneNumber,
          whatsappNumber: parent.whatsAppNumber,
          fcmTokens: parent.user?.deviceTokens.map((d) => d.token) ?? [],
        });
      }
    }
  }

  if (userIds.size > 0) {
    log(templateId, "info", `Resolving ${userIds.size} user(s)…`);

    const users = await prisma.user.findMany({
      where: {
        id: { in: Array.from(userIds) },
        memberships: {
          some: {
            organizationId,
            status: "ACTIVE",
          },
        },
      },
      include: { student: true, parent: true, deviceTokens: true },
    });

    for (const u of users) {
      resolved.push({
        userId: u.id,
        studentId: u.student?.id,
        parentId: u.parent?.id,
        email: u.email,
        phone: u.student?.phoneNumber ?? u.parent?.phoneNumber,
        whatsappNumber: u.student?.whatsAppNumber ?? u.parent?.whatsAppNumber,
        fcmTokens: u.deviceTokens.map((d) => d.token),
      });
    }
  }

  if (parentIds.size > 0) {
    log(templateId, "info", `Resolving ${parentIds.size} parent(s)…`);

    const parents = await prisma.parent.findMany({
      where: { id: { in: Array.from(parentIds) } },
      include: { user: { include: { deviceTokens: true } } },
    });

    for (const p of parents) {
      resolved.push({
        userId: p.userId ?? undefined,
        parentId: p.id,
        email: p.email,
        phone: p.phoneNumber,
        whatsappNumber: p.whatsAppNumber,
        fcmTokens: p.user?.deviceTokens.map((d) => d.token) ?? [],
      });
    }
  }

  for (const r of direct) {
    resolved.push({ ...r, fcmTokens: r.fcmTokens ?? [] });
  }

  return resolved;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPSERT INBOX ITEM
//
// Creates one Notification row per recipient per event.
// If the idempotency key already exists the upsert silently returns the
// existing row id — no duplicate inbox item, channels still fire normally.
//
// This is non-fatal by design. If the upsert fails, channels are skipped
// for this recipient only — no orphaned NotificationLog rows without a parent.
// ─────────────────────────────────────────────────────────────────────────────

async function upsertInboxItem(
  recipient: RecipientInfo,
  templateId: NotificationTemplateId,
  variables: NotificationVariables,
  organizationId: string,
  academicYearId: string | undefined,
  eventId: string
): Promise<string | null> {
  const def = NOTIFICATION_REGISTRY[templateId];
  if (!def) return null

  const recipientId =
    recipient.userId ?? recipient.parentId ?? recipient.studentId ?? recipient.email ?? "unknown";

  const inboxKey = buildInboxKey(organizationId, templateId, recipientId, eventId);
  const title = replaceVars(def.inboxTitle, variables);
  const message = replaceVars(def.inboxMessage, variables);


  try {
    const item = await prisma.notification.upsert({
      where: { idempotencyKey: inboxKey },
      update: {},
      create: {
        organizationId,
        academicYearId,
        userId: recipient.userId,
        studentId: recipient.studentId,
        parentId: recipient.parentId,
        type: def.type,
        title,
        message,
        idempotencyKey: inboxKey,
      },
    });
    return item.id;
  } catch (err) {
    log(templateId, "error", `upsertInboxItem failed for ${recipientLabel(recipient)}`, {
      error: (err as Error).message,
    });
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND VIA PUSH
//
// Push is handled separately because it fans out across multiple FCM tokens
// for a single logical recipient. One success across any token = SENT.
// Stale tokens are deleted immediately and never retried.
// Cost is 1 logical unit regardless of token count.
// ─────────────────────────────────────────────────────────────────────────────

async function sendViaPush(
  recipient: RecipientInfo,
  subject: string | undefined,
  body: NotificationBody,
  pendingLogId: string,
  templateId: NotificationTemplateId,
  variables?: NotificationVariables
): Promise<ChannelResult> {
  const tokens = recipient.fcmTokens ?? [];

  if (tokens.length === 0) {
    await prisma.notificationLog.update({
      where: { id: pendingLogId },
      data: { status: "FAILED", errorMessage: "No device tokens registered" },
    });
    return { channel: "PUSH", success: false, error: "No device tokens registered", cost: 0, units: 0 };
  }

  const provider = ChannelFactory.getProvider("PUSH");
  const ctx: LogContext = {
    channel: "PUSH",
    templateId,
    recipientLabel: recipientLabel(recipient),
  };

  let successCount = 0;
  let lastError = "";

  for (const token of tokens) {
    try {
      const result = await provider.send(token, subject, body, ctx);

      if (result.staleToken) {
        await deleteStaleToken(token, templateId);
        lastError = result.error ?? "Stale token";
        continue;
      }

      if (result.success) {
        successCount++;
      } else {
        const retried = await retry(() => provider.send(token, subject, body, ctx), RETRY_ATTEMPTS, RETRY_DELAY_MS);
        if (retried.success) successCount++;
        else lastError = retried.error ?? "Unknown error";
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  const success = successCount > 0;
  const cost = success ? calculateNotificationCost("PUSH", 1) : 0;

  await prisma.notificationLog.update({
    where: { id: pendingLogId },
    data: {
      status: success ? "SENT" : "FAILED",
      errorMessage: success ? undefined : lastError,
      units: success ? 1 : 0,
      cost,
      to: "push",
    },
  });

  return success
    ? { channel: "PUSH", success: true, messageId: `${successCount}/${tokens.length} delivered`, cost, units: 1 }
    : { channel: "PUSH", success: false, error: lastError, cost: 0, units: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND VIA CHANNEL
//
// Flow per channel:
//   1. Atomically claim idempotency slot — insert PENDING log row.
//      P2002 unique violation = already sent, bail out immediately.
//   2. Validate the contact address before touching any provider.
//   3. Send via provider with automatic retry on transient failures.
//   4. Update the log row to SENT or FAILED with cost and delivery detail.
// ─────────────────────────────────────────────────────────────────────────────

async function sendViaChannel(
  channel: NotificationChannel,
  recipient: RecipientInfo,
  subject: string | undefined,
  body: NotificationBody,
  logKey: string,
  notificationId: string,
  organizationId: string,
  templateId: NotificationTemplateId,
  variables?: NotificationVariables,
  attachment?: NotificationPayload<any>["attachment"]
): Promise<ChannelResult> {
  const def = NOTIFICATION_REGISTRY[templateId];
  if (!def) return { channel, success: false, error: "Template not found", cost: 0, units: 0 };


  const rLabel = recipientLabel(recipient);
  const ctx: LogContext = { channel, templateId, recipientLabel: rLabel, organizationId };

  // Atomically claim the idempotency slot
  let pendingLogId: string;
  try {
    const row = await prisma.notificationLog.create({
      data: {
        organizationId,
        notificationId,
        notificationType: def.type,
        channel,
        status: "PENDING",
        idempotencyKey: logKey,
        cost: 0,
        units: 0,
        retryCount: 0,
        maxRetries: RETRY_ATTEMPTS,
      },
      select: { id: true },
    });
    pendingLogId = row.id;
  } catch (err: any) {
    // Robust check for Prisma unique constraint violation (idempotency skip)
    const isDuplicate =
      err.code === "P2002" ||
      err.prismaCode === "P2002" ||
      (typeof err === 'object' && err?.code === 'P2002') ||
      (typeof err === 'object' && err?.prismaCode === 'P2002') ||
      JSON.stringify(err).includes("P2002");

    if (isDuplicate) {
      log(templateId, "skip", `[${channel.padEnd(8)} → ${rLabel}] Already processed, skipping`);
      return { channel, success: false, error: "ALREADY_SENT", cost: 0, units: 0 };
    }
    throw err;
  }

  // Convenience: mark log as failed and return a typed failure result
  const fail = async (reason: string): Promise<ChannelResult> => {
    await prisma.notificationLog.update({
      where: { id: pendingLogId },
      data: { status: "FAILED", errorMessage: reason },
    });
    log(templateId, "warn", `[${channel} → ${rLabel}] ${reason}`);
    return { channel, success: false, error: reason, cost: 0, units: 0 };
  };

  try {
    // PUSH is handled by its own function — fans out across multiple tokens
    if (channel === "PUSH") {
      return await sendViaPush(recipient, subject, body, pendingLogId, templateId, variables);
    }

    // EMAIL / SMS / WHATSAPP — resolve and validate contact address
    let to: string | undefined;

    switch (channel) {
      case "EMAIL": {
        if (!isValidEmail(recipient.email)) return fail("Invalid or missing email address");
        to = recipient.email!;
        break;
      }
      case "SMS": {
        if (!isValidPhone(recipient.phone)) return fail("Invalid or missing phone number");
        to = recipient.phone!;
        break;
      }
      case "WHATSAPP": {
        const wa = recipient.whatsappNumber ?? recipient.phone;
        if (!isValidPhone(wa)) return fail("Invalid or missing WhatsApp number");
        to = wa!;
        break;
      }
    }

    if (!to) return fail(`No contact address resolved for ${channel}`);

    const provider = ChannelFactory.getProvider(channel);
    const result = await retry(
      () => provider.send(to!, subject, body, ctx, attachment),
      RETRY_ATTEMPTS,
      RETRY_DELAY_MS
    );
    const cost = result.success ? calculateNotificationCost(channel, 1) : 0;

    await prisma.notificationLog.update({
      where: { id: pendingLogId },
      data: {
        status: result.success ? "SENT" : "FAILED",
        errorMessage: result.error,
        units: 1,
        cost,
        to,
      },
    });
    return { channel, success: result.success, messageId: result.messageId, error: result.error, cost, units: 1 };

  } catch (err) {
    const message = (err as Error).message;
    log(templateId, "error", `[${channel} → ${rLabel}] Unhandled exception`, { error: message });
    await prisma.notificationLog
      .update({ where: { id: pendingLogId }, data: { status: "FAILED", errorMessage: message } })
      .catch(() => { });
    return { channel, success: false, error: message, cost: 0, units: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND VIA ALL ENABLED CHANNELS
//
// Body is built here — once per channel per recipient — using the unified registry.
//
//   EMAIL    → React.createElement(Component, variables)
//   WHATSAPP → template(variables) if a builder exists, else replaceVars(body)
//   PUSH     → replaceVars(body)
//   SMS      → replaceVars(body)
// ─────────────────────────────────────────────────────────────────────────────

async function sendViaChannels<T extends NotificationTemplateId>(
  enabledChannels: NotificationChannel[],
  recipient: RecipientInfo,
  notificationId: string,
  templateId: T,
  variables: TemplateVariablesMap[T],
  organizationId: string,
  eventId: string,
  attachment?: NotificationPayload<any>["attachment"]
): Promise<ChannelResult[]> {
  const def = NOTIFICATION_REGISTRY[templateId];
  if (!def) return [];

  const recipientId =
    recipient.userId ?? recipient.parentId ?? recipient.studentId ?? recipient.email ?? "unknown";

  const results: ChannelResult[] = [];

  for (const channel of enabledChannels) {
    const channelDef = def.channels[channel];
    if (!channelDef) {
      log(templateId, "warn", `No ${channel} definition in registry — skipping`);
      continue;
    }

    let subject: string | undefined;
    let body: NotificationBody;

    switch (channel) {
      case "EMAIL": {
        const emailDef = channelDef as NonNullable<typeof def.channels.EMAIL>;
        subject = replaceVars(emailDef.subject, variables);
        body = React.createElement(emailDef.Component as any, variables);
        break;
      }
      case "WHATSAPP": {
        const waDef = channelDef as NonNullable<typeof def.channels.WHATSAPP>;
        subject = undefined;
        body = waDef.template
          ? waDef.template(variables as any)
          : replaceVars(waDef.body, variables);
        break;
      }
      case "PUSH": {
        const pushDef = channelDef as NonNullable<typeof def.channels.PUSH>;
        subject = replaceVars(pushDef.subject, variables);
        body = replaceVars(pushDef.body, variables);
        break;
      }
      case "SMS": {
        const smsDef = channelDef as NonNullable<typeof def.channels.SMS>;
        body = replaceVars(smsDef.body, variables);
        break;
      }
      default:
        continue;
    }

    const logKey = buildLogKey(organizationId, templateId, recipientId, channel, eventId);
    const result = await sendViaChannel(
      channel,
      recipient,
      subject,
      body,
      logKey,
      notificationId,
      organizationId,
      templateId,
      variables,
      attachment
    ).catch((err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);

      // If it's a P2002 that escaped sendViaChannel, handle it here too
      if (errorMsg.includes("P2002") || JSON.stringify(err).includes("P2002")) {
        log(templateId, "skip", `[${channel.padEnd(8)} → ${recipientLabel(recipient)}] Already processed (collision), skipping`);
        return { channel, success: false, error: "ALREADY_SENT", cost: 0, units: 0 };
      }

      log(templateId, "error", `Channel Crash [${channel}]: ${errorMsg}`);
      return { channel, success: false, error: errorMsg, cost: 0, units: 0 };
    });

    results.push(result);
    await sleep(CHANNEL_SEND_DELAY_MS);
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS SINGLE RECIPIENT
//
// Strict order — inbox item first, channels second.
// If inbox upsert fails, channels are skipped entirely.
// This guarantees every NotificationLog row has a valid parent Notification.
// ─────────────────────────────────────────────────────────────────────────────

async function processRecipient<T extends NotificationTemplateId>(
  recipient: RecipientInfo,
  enabledChannels: NotificationChannel[],
  templateId: T,
  variables: TemplateVariablesMap[T],
  organizationId: string,
  academicYearId: string | undefined,
  eventId: string,
  attachment?: NotificationPayload<any>["attachment"]
): Promise<NotificationResult["results"][0]> {
  try {
    const notificationId = await upsertInboxItem(
      recipient, templateId, variables, organizationId, academicYearId, eventId
    );

    if (!notificationId) {
      log(templateId, "warn", `Inbox upsert failed for ${recipientLabel(recipient)} — channels skipped`);
      return { recipient, channels: [] };
    }

    const channelResults = await sendViaChannels(
      enabledChannels, recipient, notificationId,
      templateId, variables, organizationId, eventId, attachment
    );

    return { recipient, channels: channelResults };
  } catch (err) {
    log(templateId, "error", `processRecipient failed for ${recipientLabel(recipient)}`, {
      error: (err as Error).message,
    });
    return { recipient, channels: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH PROCESSOR
// Processes recipients in parallel chunks of MAX_CONCURRENT_RECIPIENTS.
// A short delay between chunks prevents DB connection pool exhaustion.
// ─────────────────────────────────────────────────────────────────────────────

async function processBatch<T extends NotificationTemplateId>(
  recipients: RecipientInfo[],
  enabledChannels: NotificationChannel[],
  templateId: T,
  variables: TemplateVariablesMap[T],
  organizationId: string,
  academicYearId: string | undefined,
  eventId: string,
  attachment?: NotificationPayload<any>["attachment"],
): Promise<NotificationResult["results"]> {
  const batchResults: NotificationResult["results"] = [];
  const chunks = chunkArray(recipients, MAX_CONCURRENT_RECIPIENTS);

  for (let i = 0; i < chunks.length; i++) {
    const settled = await Promise.allSettled(
      chunks[i].map((r) =>
        processRecipient(
          r,
          enabledChannels,
          templateId,
          variables,
          organizationId,
          academicYearId,
          eventId,
          attachment,
        )
      )
    );

    for (const result of settled) {
      if (result.status === "fulfilled") batchResults.push(result.value);
    }

    if (i < chunks.length - 1) await sleep(INTER_RECIPIENT_DELAY_MS);
  }

  return batchResults;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

export async function sendNotification<T extends NotificationTemplateId>(
  payload: NotificationPayload<T>
): Promise<NotificationResult> {
  const { templateId, organizationId, academicYearId, recipients, variables, eventId, attachment } = payload;
  const def = NOTIFICATION_REGISTRY[templateId];

  log(templateId, "start", "──────────────────────────────────────────────────────");
  log(templateId, "start", `New Job | Event: ${eventId}`);
  log(templateId, "info", `Mode: ${recipients.length} student(s) via [${getEnabledChannels(templateId, []).join(", ")}]`);

  try {
    // 1. Load organization Notification channel settings or payload override
    const enabledChannels = payload.channels?.length
      ? payload.channels                                          // caller override
      : getEnabledChannels(templateId,                           // org settings (default)
        await getOrganizationNotificationSettings(organizationId));

    log(templateId, "info",
      `Channels: ${enabledChannels.length > 0 ? enabledChannels.join(", ") : "none enabled"}`
    );

    if (enabledChannels.length === 0) {
      log(templateId, "warn", "No channels enabled — aborting");
      return { success: false, totalSent: 0, totalFailed: 0, totalAlreadySent: 0, totalCost: 0, results: [] };
    }

    // 2. Deduplicate raw inputs before hitting the DB
    const uniqueInputs = Array.from(
      new Map(payload.recipients.map((r) => [buildRecipientKey(r), r])).values()
    );

    // 3. Resolve stubs to full contact objects
    const resolved = await resolveRecipients(uniqueInputs, organizationId, templateId);

    if (resolved.length === 0) {
      log(templateId, "warn", "No valid recipients after resolution — aborting");
      return { success: false, totalSent: 0, totalFailed: 0, totalAlreadySent: 0, totalCost: 0, results: [] };
    }

    // 4. Deduplicate again — a userId + studentId can resolve to the same person
    const uniqueRecipients = Array.from(
      new Map(resolved.map((r) => [buildRecipientKey(r), r])).values()
    );

    log(templateId, "info",
      `Dispatching to ${uniqueRecipients.length} recipient(s) via [${enabledChannels.join(", ")}]`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // WALLET BALANCE CHECK
    // ─────────────────────────────────────────────────────────────────────────
    const unitCostRupees = enabledChannels.map(ch => getChannelUnitCost(ch)); // rupees per channel
    const totalUnitCostRupees = unitCostRupees.reduce((sum, c) => sum + c, 0);
    const estimatedCostRupees = uniqueRecipients.length * totalUnitCostRupees;
    const estimatedCostPaise = Math.ceil(estimatedCostRupees * 100); // ← one and only ×100
    // ─── ATOMIC WALLET RESERVATION ─────────────────────────────────────────────
    // Reserve funds BEFORE sending. A single updateMany with a floor guard ensures
    // two concurrent jobs cannot both pass — whoever hits the DB second gets count=0.
    const { count } = await prisma.organization.updateMany({
      where: {
        id: organizationId,
        walletBalance: { gte: estimatedCostPaise },
      },
      data: {
        walletBalance: { decrement: estimatedCostPaise },
      },
    });

    if (count === 0) {
      // Either org doesn't exist OR balance was insufficient.
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { walletBalance: true, name: true },
      });

      if (!organization) {
        log(templateId, "error", `Organization ${organizationId} not found`);
        return {
          success: false, totalSent: 0, totalFailed: 0, totalAlreadySent: 0, totalCost: 0,
          results: [], error: "ORGANIZATION_NOT_FOUND"
        };
      }

      log(templateId, "warn",
        `Insufficient balance for ${organization.name}. ` +
        `Required: ${estimatedCostPaise} Paise, Available: ${organization.walletBalance} Paise`
      );
      return {
        success: false, totalSent: 0, totalFailed: 0, totalAlreadySent: 0, totalCost: 0,
        results: [], error: "INSUFFICIENT_BALANCE"
      };
    }

    log(templateId, "info", `Reserved ${estimatedCostPaise} Paise from wallet. Dispatching...`);

    // 5. Process in batches
    const batches = chunkArray(uniqueRecipients, BATCH_SIZE);
    const allResults: NotificationResult["results"] = [];


    for (let i = 0; i < batches.length; i++) {
      if (batches.length > 1) {
        log(templateId, "info", `Batch ${i + 1}/${batches.length} — ${batches[i].length} recipient(s)`);
      }

      const batchResults = await processBatch(
        batches[i],
        enabledChannels,
        templateId,
        payload.variables,
        organizationId,
        academicYearId,
        eventId,
        payload.attachment
      );

      allResults.push(...batchResults);
      if (i < batches.length - 1) await sleep(INTER_BATCH_DELAY_MS);
    }

    // 6. Aggregate totals
    let totalSent = 0, totalFailed = 0, totalAlreadySent = 0, totalCost = 0;
    for (const r of allResults) {
      for (const cr of r.channels) {
        if (cr.success) {
          totalSent++;
        } else if (cr.error === "ALREADY_SENT") {
          totalAlreadySent++;
        } else {
          totalFailed++;
        }
        totalCost += cr.cost;
      }
    }

    log(templateId, "info", `📊 SUMMARY | Sent: ${totalSent} | Failed: ${totalFailed} | Already Sent: ${totalAlreadySent} | Cost: ₹${totalCost.toFixed(2)}`);
    log(templateId, "info", "──────────────────────────────────────────────────────");

    // ─────────────────────────────────────────────────────────────────────────
    // WALLET RECONCILIATION (Refund difference if actual < estimated)
    // ─────────────────────────────────────────────────────────────────────────
    const actualCostPaise = Math.ceil(totalCost * 100);
    const refundPaise = estimatedCostPaise - actualCostPaise;

    if (refundPaise > 0) {
      try {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            walletBalance: { increment: refundPaise }
          }
        });
        log(templateId, "info", `Refunded ${refundPaise} Paise (Actual cost was lower than estimate).`);
      } catch (err) {
        log(templateId, "error", "Failed to refund wallet balance", { error: (err as Error).message });
      }
    }

    return {
      success: totalSent > 0 || totalAlreadySent > 0,
      totalSent,
      totalFailed,
      totalAlreadySent,
      totalCost: parseFloat(totalCost.toFixed(2)),
      results: allResults,
    };

  } catch (err) {
    log(templateId, "error", "Fatal unhandled error", { error: (err as Error).message });
    return { success: false, totalSent: 0, totalFailed: 0, totalAlreadySent: 0, totalCost: 0, results: [] };
  }
}

export const notify = sendNotification;
