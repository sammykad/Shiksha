"use server";

import prisma from "@/lib/db";
import { NotificationChannel, NotificationType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { NOTIFICATION_REGISTRY as NOTIFICATION_TEMPLATES } from "@/lib/notifications/registry";
import { getOrganizationId } from "../organization";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED TYPES
//
// Every type here is derived from NOTIFICATION_TEMPLATES — the single source
// of truth. If you rename or add a subKey in template.ts, TypeScript will
// immediately error in DEFAULT_SETTINGS below.
// ─────────────────────────────────────────────────────────────────────────────

/** All subKey values that exist across every template. */
export type AllSubKeys = {
  [K in keyof typeof NOTIFICATION_TEMPLATES]:
  typeof NOTIFICATION_TEMPLATES[K] extends { subKey: infer S } ? S : never;
}[keyof typeof NOTIFICATION_TEMPLATES];
// → "fee_created" | "friendly_reminder" | "payment_due_today" | "overdue_notice"
//   | "payment_success" | "payment_failed" | "exam_created" | "exam_reminder"
//   | "exam_enroll" | "exam_hall_ticket" | "exam_result" | "general_notice"
//   | "urgent_notice" | "leave_approved" | "leave_rejected"
//   | "document_missing" | "document_verified" | "document_rejected"

/** Channel toggle for a single channel. */
interface ChannelToggle {
  enabled: boolean;
  locked: boolean;
}

/** Channels block for templates that have no subKey (flat). */
interface FlatChannels {
  SMS: ChannelToggle;
  WHATSAPP: ChannelToggle;
  EMAIL: ChannelToggle;
  PUSH: ChannelToggle;
}

/** Channels block for one subKey entry (includes a label). */
type SubKeyEntry = FlatChannels & { label: string };

/** Channels block for templates grouped under subKeys. */
type CategoryChannels = Partial<Record<AllSubKeys, SubKeyEntry>>;

/** One entry in DEFAULT_SETTINGS. */
interface SettingDef {
  type: NotificationType;
  label: string;
  description?: string;
  displayOrder: number;
  channels: FlatChannels | CategoryChannels;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT SETTINGS
//
// subKey strings (fee_created, friendly_reminder, …) are validated by
// AllSubKeys above. If NOTIFICATION_TEMPLATES changes, TypeScript errors here.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = [
  {
    type: NotificationType.ATTENDANCE,
    label: "Attendance Absent/Late",
    description: "Notify parents when student is absent or arrives late",
    displayOrder: 1,
    channels: {
      SMS: { enabled: false, locked: true },
      WHATSAPP: { enabled: true, locked: false },
      PUSH: { enabled: true, locked: false },
      EMAIL: { enabled: false, locked: false },
    },
  },
  {
    type: NotificationType.FEE,
    label: "Fees",
    description: "Payment reminders and receipts",
    displayOrder: 2,
    channels: {
      fee_created: {
        label: "Fee Created",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      friendly_reminder: {
        label: "Friendly Reminder",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      payment_due_today: {
        label: "Fee Due Today",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      overdue_notice: {
        label: "Fee Overdue",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      payment_success: {
        label: "Payment Success",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      payment_failed: {
        label: "Payment Failed",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      pdc_cheque_recorded: {
        label: "Cheque Recorded",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      pdc_cheque_bounced: {
        label: "Cheque Bounced",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
    },
  },
  {
    type: NotificationType.NOTICE,
    label: "Notice",
    description: "School announcements and notices",
    displayOrder: 3,
    channels: {
      urgent_notice: {
        label: "Urgent Notice",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      general_notice: {
        label: "General Notice",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
    },
  },
  {
    type: NotificationType.EXAM,
    label: "Exam Alerts",
    description: "Exam schedules, hall tickets, and results",
    displayOrder: 4,
    channels: {
      exam_created: {
        label: "Exam Created",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      exam_reminder: {
        label: "Exam Reminder (1 Day Before)",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      exam_enroll: {
        label: "Exam Enrollment",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: false, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      exam_hall_ticket: {
        label: "Hall Ticket Available",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      exam_result: {
        label: "Exam Result Published",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
    },
  },
  {
    type: NotificationType.DOCUMENT,
    label: "Document Updates",
    description: "Verification status and missing document alerts",
    displayOrder: 5,
    channels: {
      document_missing: {
        label: "Document Missing",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      document_verified: {
        label: "Document Verified",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: false, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      document_rejected: {
        label: "Document Rejected",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: false, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
    },
  },
  {
    type: NotificationType.LEAVE,
    label: "Leave Updates",
    description: "Status updates for leave requests",
    displayOrder: 6,
    channels: {
      leave_approved: {
        label: "Leave Approved",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: false, locked: false },
        PUSH: { enabled: false, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      leave_rejected: {
        label: "Leave Rejected",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: false, locked: false },
        PUSH: { enabled: false, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
    },
  },
  {
    type: NotificationType.ACADEMIC_REPORT,
    label: "Monthly Report",
    description: "Student performance summary",
    displayOrder: 7,
    channels: {
      SMS: { enabled: false, locked: true },
      WHATSAPP: { enabled: false, locked: true },
      PUSH: { enabled: false, locked: true },
      EMAIL: { enabled: false, locked: true },
    },
  },
  {
    type: NotificationType.GREETING,
    label: "Birthday Wishes",
    description: "Student birthday greetings",
    displayOrder: 8,
    channels: {
      SMS: { enabled: false, locked: true },
      WHATSAPP: { enabled: false, locked: true },
      PUSH: { enabled: false, locked: true },
      EMAIL: { enabled: false, locked: true },
    },
  },
  {
    type: NotificationType.GENERAL,
    label: "Administrative & General",
    description: "Holidays, certificates, and other administrative updates",
    displayOrder: 9,
    channels: {
      certificate_issued: {
        label: "Certificate Issued",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: true, locked: false },
      },
      emergency_holiday: {
        label: "Emergency Holiday",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      teaching_assignment: {
        label: "Teaching Assignment",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      complaint_received: {
        label: "Complaint Submitted",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      admission_confirmed: {
        label: "Admission Confirmed",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      student_onboarded: {
        label: "Student Onboarded",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: false },
      },
      recorded_session_link: {
        label: "Recorded Session Shared",
        SMS: { enabled: false, locked: true },
        WHATSAPP: { enabled: true, locked: false },
        PUSH: { enabled: true, locked: false },
        EMAIL: { enabled: false, locked: true },
      },
    },
  },
] as const satisfies SettingDef[];
//          ^^^^^^^^^^^^^^^^^^^^^^^^^^
// `satisfies` validates the shape without widening the type.
// TypeScript will error if any subKey doesn't exist in AllSubKeys,
// or if any channel block is missing a required field.

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const createOrganizationNotificationSettings = async (organizationId: string) => {
  for (const group of DEFAULT_SETTINGS) {
    await prisma.notificationSetting.create({
      data: {
        organizationId,
        notificationType: group.type,
        label: group.label,
        description: group.description,
        channels: group.channels as Prisma.JsonObject,
        isActive: true,
      },
    });
  }
};

export async function resetOrganizationNotificationSettings(): Promise<{ success: boolean; error?: string }> {
  try {
    const organizationId = await getOrganizationId();

    // Delete all existing settings then recreate from defaults
    await prisma.notificationSetting.deleteMany({ where: { organizationId } });
    await createOrganizationNotificationSettings(organizationId);

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to reset notification settings:", error);
    return { success: false, error: "Failed to reset settings" };
  }
}

export async function getOrganizationNotificationSettings(organizationId: string) {
  let settings = await prisma.notificationSetting.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });

  if (settings.length === 0) {
    await createOrganizationNotificationSettings(organizationId);
    settings = await prisma.notificationSetting.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });
  }

  return settings;
}

export async function updateNotificationSetting(
  settingId: string,
  channel: NotificationChannel,
  enabled: boolean,
  eventKey?: AllSubKeys,
) {
  try {
    const organizationId = await getOrganizationId();
    const setting = await prisma.notificationSetting.findUnique({
      where: { id: settingId, organizationId },
      select: { channels: true },
    });

    if (!setting) throw new Error("Setting not found");

    const currentChannels = (setting.channels as any) || {};

    if (eventKey) {
      if (!currentChannels[eventKey]) currentChannels[eventKey] = {};
      currentChannels[eventKey][channel] = {
        ...(currentChannels[eventKey][channel] || {}),
        enabled,
      };
    } else {
      currentChannels[channel] = {
        ...(currentChannels[channel] || {}),
        enabled,
      };
    }

    await prisma.notificationSetting.update({
      where: { id: settingId, organizationId },
      data: { channels: currentChannels },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update notification setting:", error);
    return { success: false, error: "Failed to update setting" };
  }
}