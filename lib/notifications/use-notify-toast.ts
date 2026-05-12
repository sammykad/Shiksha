// lib/notifications/use-notify-toast.ts
"use client";

import { toast } from "sonner";
import type { NotifyResult } from "@/lib/notifications/notify";

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
    EXAM_HALL_TICKET: "Hall Ticket",
    RESULT_PUBLISHED: "Result Published",
    MONTHLY_REPORT: "Monthly Report",
    BIRTHDAY_WISH: "Birthday Wish",
    CERTIFICATE_ISSUED: "Certificate Issued",
};

export function toastNotifyResult(templateId: string, result: NotifyResult) {
    const name = TEMPLATE_NAMES[templateId] ?? templateId;
    const costStr = `₹${result.totalCost.toFixed(2)}`;
    const total = result.totalSent + result.totalFailed + result.totalAlreadySent;

    if (result.error === "INSUFFICIENT_BALANCE") {
        toast.error("Insufficient wallet balance", {
            description: `${name} — add funds and retry`,
            duration: 8000,
        });
        return;
    }

    if (result.error === "ORGANIZATION_NOT_FOUND") {
        toast.error("Organization not found", { duration: 6000 });
        return;
    }

    if (total === 0) {
        toast.warning(`${name} — nothing sent`, {
            description: "No valid recipients or channels enabled",
            duration: 5000,
        });
        return;
    }

    if (result.totalSent === 0 && result.totalAlreadySent > 0 && result.totalFailed === 0) {
        toast.info(`${name} — up to date`, {
            description: `${result.totalAlreadySent} notification(s) were already sent today. No duplicates were dispatched.`,
            duration: 5000,
        });
        return;
    }

    if (result.totalFailed === 0) {
        let description = `${result.totalSent} notification${result.totalSent !== 1 ? "s" : ""} · ${costStr}`;
        if (result.totalAlreadySent > 0) {
            description = `${result.totalSent} sent · ${result.totalAlreadySent} already sent · ${costStr}`;
        }

        
        toast.success(`${name} sent`, {
            description,
            duration: 3500,
        });
    } else if (result.totalSent > 0 || result.totalAlreadySent > 0) {
        toast.warning(`${name} — partial`, {
            description: `${result.totalSent}/${total} sent · ${result.totalAlreadySent} already sent · ${result.totalFailed} failed · ${costStr}`,
            duration: 5000,
        });
    } else {
        toast.error(`${name} — all failed`, {
            description: `${total} failed · ${costStr}`,
            duration: 6000,
        });
    }
}