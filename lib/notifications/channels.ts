// lib/notifications/channels.ts

import { NotificationChannel } from "@/generated/prisma/enums";
import admin from "firebase-admin";
import type { Message } from "firebase-admin/messaging";
import { Resend } from "resend";
import React from "react";
import type { NotificationBody } from "./template";
import {
  type WhatsAppTemplate,
  type WhatsAppWirePayload,
  type HeaderComponent,
  type ButtonComponent,
  type DocumentParameter,
  type ImageParameter,
  type TemplateComponent,
  type TextParameter,
  uploadBufferToMeta,
} from "./providers/whatsapp";

// https://developers.facebook.com/documentation/business-messaging/whatsapp/overview
// https://www.postman.com/meta/whatsapp-business-platform/request/13382743-60d83995-8d91-4661-bf97-b9961b0faa79
// https://dashboard.ccavenue.com/web/genregistration.do?command=navigateSchemeForm
// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED LOGGER
//
// Every log line follows one consistent format so you can grep by any axis:
//   [CHANNEL | TEMPLATE_ID → recipient] message
//
// Examples:
//   [EMAIL | STUDENT_ABSENT → dad@example.com] ✓ Delivered | resendId: re_abc
//   [PUSH  | FEE_OVERDUE    → parent:abc123]   ⚠ Stale token eZq9Xx… — deleting
// ─────────────────────────────────────────────────────────────────────────────
/**
 * channels.ts
 *
 * Channel providers — transport layer only.
 * No template strings, no WhatsApp template registry, no business logic.
 *
 * The engine builds the body/payload before calling these providers.
 * Adding a new notification template never requires touching this file.
 *
 * SMS is disabled — SMSProvider is stubbed and will return a hard failure
 * until a provider account is configured.
 */


// ─────────────────────────────────────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────────────────────────────────────

export interface LogContext {
  channel: NotificationChannel;
  templateId: string;
  recipientLabel: string;
  organizationId?: string;
}

const ICONS: Record<string, string> = { EMAIL: "📧", SMS: "💬", WHATSAPP: "💬", PUSH: "📱" };

function pfx(ctx: LogContext | undefined, channel: NotificationChannel): string {
  return `${ICONS[channel] ?? "⚡"} [${channel.padEnd(8)} | ${ctx?.templateId ?? "?"} → ${ctx?.recipientLabel ?? "?"}]`;
}

function preview(s: string, max = 72): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND RESULT
// ─────────────────────────────────────────────────────────────────────────────

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  /** PUSH only — token is permanently dead, engine should delete it */
  staleToken?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER INTERFACE
// ─────────────────────────────────────────────────────────────────────────────
export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface ChannelProvider {
  send(
    to: string,
    subject: string | undefined,
    body: NotificationBody,
    ctx?: LogContext,
    attachment?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }
  ): Promise<SendResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL  (Resend)
// ─────────────────────────────────────────────────────────────────────────────

class EmailProvider implements ChannelProvider {
  async send(
    to: string,
    subject: string | undefined,
    body: NotificationBody,
    ctx?: LogContext,
    attachment?: { filename: string; content: Buffer | string; contentType?: string }
  ): Promise<SendResult> {
    const p = pfx(ctx, "EMAIL");

    if (!to || !subject) {
      console.warn(`${p} Missing to/subject — skipping`);
      return { success: false, error: "Missing to address or subject" };
    }

    const isReactElement = body !== null && typeof body === "object" && "type" in (body as object);
    const emailPayload = isReactElement
      ? { react: body as React.ReactElement }
      : { html: String(body) };

    console.log(`${p} Sending → ${to} | subject: "${subject}" | kind: ${isReactElement ? "React" : "HTML"}`);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const { data, error } = await resend.emails.send({
        from: "no-reply@shiksha.cloud",
        to,
        subject,
        ...emailPayload,
        ...(attachment && {
          attachments: [{
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          }],
        }),
      });

      if (error) {
        console.error(`${p} Resend error: ${error.message}`);
        return { success: false, error: error.message };
      }

      console.log(`${p} ✓ Delivered | resendId: ${(data as any)?.id}`);
      return { success: true, messageId: (data as any)?.id };
    } catch (err) {
      console.error(`${p} Exception:`, (err as Error).message);
      return { success: false, error: (err as Error).message };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SMS  (disabled — no provider configured)
// ─────────────────────────────────────────────────────────────────────────────

class SMSProvider implements ChannelProvider {
  async send(_to: string, _subject: string | undefined, _body: NotificationBody, ctx?: LogContext): Promise<SendResult> {
    console.warn(`${pfx(ctx, "SMS")} SMS provider not configured — skipping`);
    return { success: false, error: "SMS provider not configured" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP  (Meta Cloud API)
//
// The engine passes either:
//   - A WhatsAppTemplatePayload object  → structured template send (preferred)
//   - A plain string                    → free-text fallback (24-h window only)
// ─────────────────────────────────────────────────────────────────────────────
function isHeaderComponent(c: TemplateComponent): c is HeaderComponent {
  return c.type === "header";
}
function injectIntoHeader(
  components: TemplateComponent[],
  param: DocumentParameter | ImageParameter
): TemplateComponent[] {
  const cloned = components.map((c) => ({ ...c })) as TemplateComponent[];
  const header = cloned.find(isHeaderComponent);
  if (header) {
    header.parameters = [param];
  } else {
    (cloned as any).unshift({ type: "header", parameters: [param] });
  }
  return cloned;
}

function normalizeWhatsAppRecipient(to: string, countryCode: string): string {
  const digits = to.replace(/\D/g, "");
  if (digits.startsWith(countryCode)) return digits;
  if (digits.length === 10) return `${countryCode}${digits}`;
  return digits;
}

class WhatsAppProvider implements ChannelProvider {
  constructor(private readonly countryCode = "91") { }

  async send(
    to: string,
    _subject: string | undefined,
    body: NotificationBody,
    ctx?: LogContext,
    attachment?: Attachment
  ): Promise<SendResult> {
    const p = pfx(ctx, "WHATSAPP");
    const fullTo = normalizeWhatsAppRecipient(to, this.countryCode);

    // 1. Determine mode — template object vs plain string
    const isTemplate =
      body !== null && typeof body === "object" && "name" in body;
    const requiresDocumentHeader =
      isTemplate && (body as WhatsAppTemplate).name === "payment_success";

    console.log(
      `${p} Sending → ${fullTo} | mode: ${isTemplate ? "template" : "free-text"}`
    );

    // 2. Build the correctly-typed wire payload
    //
    //    Template path: body IS the inner WhatsAppTemplate (name/language/components).
    //    We wrap it in the outer messaging_product/to/type envelope here.
    //    Free-text path: plain string, only valid inside a 24-h service window.
    let wirePayload: WhatsAppWirePayload = isTemplate
      ? {
        messaging_product: "whatsapp",
        to: fullTo,
        type: "template",
        template: body as WhatsAppTemplate,
      }
      : {
        messaging_product: "whatsapp",
        to: fullTo,
        type: "text",
        text: { body: String(body) },
      };

    // ── 3. Inject media into template header ──────────────────────────
    if (isTemplate && wirePayload.type === "template") {
      const tpl = wirePayload.template;

      // 3a. Document header (PDF receipt for payment_success)
      if (tpl.name === "payment_success" && attachment) {
        let docParam: DocumentParameter | null = null;

        try {
          const buf = Buffer.isBuffer(attachment.content)
            ? attachment.content
            : Buffer.from(attachment.content as string, "base64");

          const mediaId = await uploadBufferToMeta(
            buf, attachment.filename,
            attachment.contentType ?? "application/pdf", p
          );

          docParam = {
            type: "document",
            document: { id: mediaId, filename: attachment.filename },
          };
        } catch (err) {
          console.error(`${p} ✗ Meta upload failed:`, (err as Error).message);
          return {
            success: false,
            error: "Payment success WhatsApp template requires a receipt PDF attachment",
          };
        }

        wirePayload = {
          ...wirePayload,
          template: {
            ...tpl,
            components: injectIntoHeader(tpl.components, docParam),
          },
        };
      }

      // 3b. Image header (YouTube thumbnail for recorded_session_link)
      if (tpl.name === "recorded_session_link") {
        const buttonComp = tpl.components.find(
          (c): c is ButtonComponent => c.type === "button"
        );
        const videoId = (buttonComp?.parameters[0] as TextParameter | undefined)?.text;

        if (videoId) {
          wirePayload = {
            ...wirePayload,
            template: {
              ...tpl,
              components: injectIntoHeader(tpl.components, {
                type: "image",
                image: { link: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
              }),
            },
          };
        }
      }
    }

    // 4. Dispatch to Meta
    if (wirePayload.type === "template") {
      wirePayload.template.components = wirePayload.template.components.filter((c: any) => {
        if ("parameters" in c && (!c.parameters || c.parameters.length === 0)) return false;
        return true;
      });
    }

    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
      console.error(`${p} Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN in environment variables.`);
      return { success: false, error: "WhatsApp credentials (PHONE_NUMBER_ID/ACCESS_TOKEN) are not configured in the environment." };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(process.env.WHATSAPP_ACCESS_TOKEN || "").replace(/['"]/g, '').trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wirePayload),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        console.error(`${p} Meta API error:`, JSON.stringify(result, null, 2));
        return {
          success: false,
          error: result.error?.message || "Unknown Meta error",
        };
      }

      console.log(`${p} ✓ Delivered | waMsgId: ${result.messages?.[0]?.id}`);
      return { success: true, messageId: result.messages?.[0]?.id };
    } catch (err) {
      console.error(`${p} Request failed:`, (err as Error).message);
      return { success: false, error: (err as Error).message };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUSH  (Firebase FCM)
// ─────────────────────────────────────────────────────────────────────────────

const STALE_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

function getFirebaseApp(): admin.app.App {
  return admin.apps.length > 0 ? admin.app() : admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

class PushProvider implements ChannelProvider {
  async send(
    fcmToken: string,
    subject: string | undefined,
    body: NotificationBody,
    ctx?: LogContext
  ): Promise<SendResult> {
    const p = pfx(ctx, "PUSH");
    const shortToken = `${fcmToken.slice(0, 20)}…`;

    if (!fcmToken) {
      console.warn(`${p} No FCM token provided`);
      return { success: false, error: "FCM token is required" };
    }

    const bodyText = typeof body === "string" ? body : "You have a new notification";

    console.log(`${p} Sending → token: ${shortToken} | title: "${subject ?? "Notification"}" | body: "${preview(bodyText)}"`);

    try {
      const payload: Message = {
        token: fcmToken,
        notification: {
          title: subject ?? "Notification",
          body: bodyText,
        },
        webpush: {
          notification: {
            icon: "/logo.svg",
            badge: "/logo.svg",
          },
        },
        data: {
          notif_id: Math.random().toString(36).slice(2, 9),
          sent_at: new Date().toISOString(),
        },
      };

      const messageId = await admin.messaging(getFirebaseApp()).send(payload);
      console.log(`${p} ✓ Delivered | firebaseId: ${messageId}`);
      return { success: true, messageId };
    } catch (err: any) {
      const code: string = err?.errorInfo?.code ?? err?.code ?? "";

      if (STALE_TOKEN_CODES.has(code)) {
        console.warn(`${p} Stale token ${shortToken} | code: ${code}`);
        return { success: false, staleToken: true, error: `Stale FCM token (${code})` };
      }

      console.error(`${p} Firebase error for token ${shortToken}:`, { code: code || "(no code)", message: err?.message });
      return { success: false, error: err?.message ?? "Unknown push error" };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export class ChannelFactory {
  private static readonly providers = new Map<NotificationChannel, ChannelProvider>();

  static getProvider(channel: NotificationChannel): ChannelProvider {
    if (!this.providers.has(channel)) {
      this.providers.set(channel, ChannelFactory.create(channel));
    }
    return this.providers.get(channel)!;
  }

  private static create(channel: NotificationChannel): ChannelProvider {
    switch (channel) {
      case "EMAIL": return new EmailProvider();
      case "SMS": return new SMSProvider();
      case "WHATSAPP": return new WhatsAppProvider("91");
      case "PUSH": return new PushProvider();
      default: throw new Error(`Unsupported channel: ${channel}`);
    }
  }
}
