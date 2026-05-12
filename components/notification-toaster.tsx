// components/notification-toaster.tsx
"use client";

import { NotificationChannel, NotificationStatus } from "@/generated/prisma/enums";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export interface NotificationToasterEvent {
  templateId: string;
  recipientLabel: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  messageId?: string | null;
  error?: string | null;
  cost?: number;
  timestamp: Date;
}

export interface NotificationJobSummary {
  templateId: string;
  totalSent: number;
  totalFailed: number;
  totalCost: number;
  error?: string;
  timestamp: Date;
}

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  PUSH: "Push",
};

const TEMPLATE_NAMES: Record<string, string> = {
  FEE_CREATED: "Fee Created",
  FEE_OVERDUE: "Fee Overdue",
  FEE_FRIENDLY_REMINDER: "Fee Reminder",
  FEE_DUE_TODAY: "Fee Due Today",
  STUDENT_ABSENT: "Student Absent",
  STUDENT_LATE: "Student Late",
  PAYMENT_SUCCESS: "Payment Success",
  PAYMENT_FAILED: "Payment Failed",
  LEAVE_APPROVED: "Leave Approved",
  LEAVE_REJECTED: "Leave Rejected",
  DOCUMENT_APPROVED: "Document Approved",
  DOCUMENT_REJECTED: "Document Rejected",
  GENERAL_NOTICE: "Notice",
  URGENT_NOTICE: "Urgent Notice",
  EXAM_CREATED: "Exam Created",
  EXAM_REMINDER: "Exam Reminder",
  EXAM_ENROLLMENT: "Exam Enrollment",
  EXAM_HALL_TICKET: "Hall Ticket",
  RESULT_PUBLISHED: "Result Published",
  DOCUMENT_MISSING: "Document Missing",
  MONTHLY_REPORT: "Monthly Report",
  BIRTHDAY_WISH: "Birthday Wish",
  CERTIFICATE_ISSUED: "Certificate Issued",
};

// ─── Individual send event ────────────────────────────────────────────────────

export function NotificationToaster() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("nexus-notifications");

    channelRef.current.onmessage = (event: MessageEvent<NotificationToasterEvent>) => {
      const { templateId, channel, status, recipientLabel, error } = event.data;

      const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
      const channelLabel = CHANNEL_LABELS[channel] ?? channel;

      const description = `${recipientLabel} · ${channelLabel}`;

      if (status === "SENT") {
        toast.success(templateName, {
          description,
          duration: 2500,
        });
      } else if (status === "FAILED") {
        toast.error(`${templateName} failed`, {
          description: error ? `${description} — ${error}` : description,
          duration: 4000,
        });
      }
      // PENDING toasts are skipped — too noisy for large batches
    };

    return () => channelRef.current?.close();
  }, []);

  return null;
}

// ─── Job summary (fires once after all channels complete) ─────────────────────

export function NotificationSummaryToaster() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("nexus-notification-summary");

    channelRef.current.onmessage = (event: MessageEvent<NotificationJobSummary>) => {
      const { templateId, totalSent, totalFailed, totalCost, error } = event.data;

      const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
      const total = totalSent + totalFailed;
      const costStr = `₹${totalCost.toFixed(2)}`;

      // Wallet / org error — show once, prominently
      if (error === "INSUFFICIENT_BALANCE") {
        toast.error("Insufficient wallet balance", {
          description: `${templateName} — add funds and retry`,
          duration: 8000,
        });
        return;
      }

      if (totalFailed === 0 && totalSent > 0) {
        toast.success(`${templateName} sent`, {
          description: `${totalSent} notification${totalSent !== 1 ? "s" : ""} · ${costStr}`,
          duration: 3500,
        });
      } else if (totalSent > 0) {
        toast.warning(`${templateName} — partial`, {
          description: `${totalSent}/${total} sent · ${totalFailed} failed · ${costStr}`,
          duration: 5000,
        });
      } else {
        toast.error(`${templateName} — all failed`, {
          description: `${total} failed · ${costStr}`,
          duration: 6000,
        });
      }
    };

    return () => channelRef.current?.close();
  }, []);

  return null;
}