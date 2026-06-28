import { sendEmailExamReminder } from '@/lib/data/exam/exam-reminders';
import { executeReminders } from '@/lib/data/fee/fee-reminder';
import type { SendReminderData } from '@/components/dashboard/Fees/SendFeesReminderDialog';
import prisma from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { toISTDate } from '@/lib/utils';
import { addMonths } from 'date-fns';
import { createInvoice, handleExpiredTrials } from '@/lib/subscription-billing';
import { generateSubscriptionInvoicePDFBuffer } from '@/lib/pdf-generator/generate-pdf-buffer';
import { sendNotification } from '@/lib/notifications/engine';
import { NotificationChannel } from '@/generated/prisma/enums';
import {
  BillingCycle,
  ExamStatus,
  FeeStatus,
  NoticeStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@/generated/prisma/enums';

// ─── Fee ────────────────────────────────────────────────────────────────────

export const updateOverdueFeesAutomation = inngest.createFunction(
  { id: 'fee-status-overdue-automation' },
  { cron: '30 5 * * *' },
  async ({ step }) => {
    const count = await step.run('mark-overdue', async () => {
      const r = await prisma.fee.updateMany({
        where: { status: FeeStatus.UNPAID, dueDate: { lt: toISTDate() } },
        data: { status: FeeStatus.OVERDUE },
      });
      return r.count;
    });
    return { message: `${count} fees marked as OVERDUE.` };
  },
);

export const updatePaymentStatus = inngest.createFunction(
  { id: 'payment-status-update' },
  { cron: '30 22 * * *' },
  async ({ step }) => {
    const count = await step.run('fail-pending', async () => {
      const r = await prisma.feePayment.updateMany({
        where: { status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      return r.count;
    });
    return { message: `${count} payments marked as FAILED.` };
  },
);

export const scheduledFeeReminder = inngest.createFunction(
  { id: 'scheduled-fee-reminder' },
  { event: 'fee/reminder.scheduled' },
  async ({ event, step }) => {
    const { data, organizationId, jobId, scheduledDateTime } = event.data as {
      data: SendReminderData;
      organizationId: string;
      jobId: string;
      scheduledDateTime: string;
    };

    await step.sleepUntil('wait', scheduledDateTime);

    await step.run('processing', () =>
      prisma.scheduledJob.update({ where: { id: jobId }, data: { status: 'PROCESSING', updatedAt: new Date() } }),
    );

    const result = await step.run('send', () => executeReminders(data, organizationId));

    await step.run('complete', () =>
      prisma.scheduledJob.update({
        where: { id: jobId },
        data: { status: result.success ? 'COMPLETED' : 'FAILED', result: JSON.stringify(result), updatedAt: new Date() },
      }),
    );

    return result;
  },
);

// ─── Exam ────────────────────────────────────────────────────────────────────

export const updateExamStatuses = inngest.createFunction(
  { id: 'exam-status-updater' },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const now = new Date();

    const upcoming = await step.run('upcoming', () =>
      prisma.exam.updateMany({
        where: { status: { notIn: [ExamStatus.CANCELLED, ExamStatus.UPCOMING] }, startDate: { gt: now } },
        data: { status: ExamStatus.UPCOMING },
      }),
    );
    const live = await step.run('live', () =>
      prisma.exam.updateMany({
        where: { status: { notIn: [ExamStatus.CANCELLED, ExamStatus.LIVE] }, startDate: { lte: now }, endDate: { gte: now } },
        data: { status: ExamStatus.LIVE },
      }),
    );
    const completed = await step.run('completed', () =>
      prisma.exam.updateMany({
        where: { status: { notIn: [ExamStatus.CANCELLED, ExamStatus.COMPLETED] }, endDate: { lt: now } },
        data: { status: ExamStatus.COMPLETED },
      }),
    );

    return { message: `Exam statuses → UPCOMING: ${upcoming.count}, LIVE: ${live.count}, COMPLETED: ${completed.count}` };
  },
);

export const sendExamReminder = inngest.createFunction(
  { id: 'exam-reminder' },
  { event: 'exam/reminder.scheduled' },
  async ({ event, step }) => {
    const { emails, jobId, scheduledDateTime } = event.data as {
      emails: string[];
      jobId: string;
      scheduledDateTime: string;
    };

    await step.sleepUntil('wait', scheduledDateTime);

    await step.run('processing', () =>
      prisma.scheduledJob.update({ where: { id: jobId }, data: { status: 'PROCESSING', updatedAt: new Date() } }),
    );

    const result = await step.run('send', () => sendEmailExamReminder(emails));

    await step.run('complete', () =>
      prisma.scheduledJob.update({
        where: { id: jobId },
        data: { status: result.success ? 'COMPLETED' : 'FAILED', result: JSON.stringify(result), updatedAt: new Date() },
      }),
    );

    return result;
  },
);

// ─── Notice ──────────────────────────────────────────────────────────────────

export const updateNoticeStatuses = inngest.createFunction(
  { id: 'notice-status-updater' },
  { cron: '29 18 * * *' },
  async ({ step }) => {
    const count = await step.run('mark-expired', async () => {
      const r = await prisma.notice.updateMany({
        where: { status: NoticeStatus.PUBLISHED, endDate: { lt: toISTDate() } },
        data: { status: NoticeStatus.EXPIRED },
      });
      return r.count;
    });
    return { message: `Notice statuses → EXPIRED: ${count}` };
  },
);

// ─── Billing ─────────────────────────────────────────────────────────────────

export const expireTrials = inngest.createFunction(
  { id: 'expire-trials' },
  { cron: '0 0 * * *' },
  async ({ step }) => {
    const invoices = await step.run('expire-trials', () => handleExpiredTrials());

    for (const inv of invoices) {
      if (inv.adminUserId) {
        await step.run(`notify-${inv.subscriptionId}`, async () => {
          const pdfBuffer = await generateSubscriptionInvoicePDFBuffer(inv.invoiceId);
          await sendNotification({
            templateId: 'BILLING_INVOICE_GENERATED',
            organizationId: inv.organizationId,
            eventId: `billing:${inv.subscriptionId}:invoice:${inv.invoiceNumber}`,
            recipients: [{ userId: inv.adminUserId ?? undefined }],
            channels: [NotificationChannel.WHATSAPP],
            variables: {
              planName: inv.planName,
              amount: inv.amount,
              dueDate: inv.dueDate,
              invoiceNumber: inv.invoiceNumber,
              studentCount: inv.studentCount,
              organizationName: inv.orgName ?? 'Unknown',
            },
            attachment: {
              filename: `${inv.invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          });
        });
      }
    }

    return { expiredCount: invoices.length, invoices: invoices.map((i) => i.invoiceNumber) };
  },
);

export const generateRecurringInvoices = inngest.createFunction(
  { id: 'generate-recurring-invoices' },
  { cron: '0 2 * * *' },
  async ({ step }) => {
    const due = await step.run('find-due', () =>
      prisma.subscription.findMany({
        where: {
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
          currentPeriodEnd: { lte: new Date() },
        },
        select: { id: true, billingCycle: true, currentPeriodStart: true, currentPeriodEnd: true, organizationId: true },
      }),
    );

    const results: { subscriptionId: string; invoiceNumber: string | null; error?: string }[] = [];

    for (const sub of due) {
      try {
        const existing = await step.run(`existing-${sub.id}`, () =>
          prisma.invoice.findFirst({
            where: { subscriptionId: sub.id, periodStart: sub.currentPeriodStart ?? undefined, periodEnd: sub.currentPeriodEnd ?? undefined },
          }),
        );

        if (existing) {
          results.push({ subscriptionId: sub.id, invoiceNumber: existing.invoiceNumber });
          continue;
        }

        const invoice = await step.run(`invoice-${sub.id}`, () => createInvoice({ subscriptionId: sub.id }));

        await step.run(`advance-${sub.id}`, async () => {
          const newStart = new Date(sub.currentPeriodEnd ?? new Date());
          const newEnd = sub.billingCycle === BillingCycle.ANNUAL ? addMonths(newStart, 12) : addMonths(newStart, 1);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              currentPeriodStart: newStart,
              currentPeriodEnd: newEnd,
              events: { create: { type: 'invoice_generated', message: `Recurring invoice ${invoice.invoiceNumber} for ${newStart.toISOString().split('T')[0]} to ${newEnd.toISOString().split('T')[0]}.` } },
            },
          });
        });

        results.push({ subscriptionId: sub.id, invoiceNumber: invoice.invoiceNumber });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({ subscriptionId: sub.id, invoiceNumber: null, error: message });

        await step.run(`fail-${sub.id}`, () =>
          prisma.billingEvent.create({ data: { subscriptionId: sub.id, type: 'invoice_generation_failed', message } }),
        );
      }
    }

    return { processed: due.length, succeeded: results.filter((r) => !r.error).length, failed: results.filter((r) => r.error).length, results };
  },
);