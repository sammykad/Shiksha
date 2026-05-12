import {
  sendEmailExamReminder,
} from '@/lib/data/exam/exam-reminders';
import { executeReminders } from '@/lib/data/fee/fee-reminder';
import prisma from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { toISTDate } from '@/lib/utils';

export const updateOverdueFeesAutomation = inngest.createFunction(
  { id: 'fee-status-overdue-automation' },
  { cron: '30 5 * * *' }, // Every day at 11:00 AM IST (UTC+5:30 → 05:30 UTC)
  async ({ step }) => {
    const affectedRows = await step.run('fetch-unpaid-overdue', async () => {
      const startOfTodayIST = toISTDate();

      return prisma.fee.updateMany({
        where: {
          status: 'UNPAID',
          dueDate: { lt: startOfTodayIST }, // strictly before today's midnight IST
        },
        data: {
          status: 'OVERDUE',
        },
      });
    });

    return {
      message: `${affectedRows.count} fees marked as OVERDUE.`,
    };
  }
);

export const updatePaymentStatus = inngest.createFunction(
  {
    id: 'payment-status-update',
  },
  { cron: '30 22 * * *' },
  async ({ step }) => {
    const affectedRows = await step.run('fetch-payment-status', async () =>
      prisma.feePayment.updateMany({
        where: {
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
        },
      })
    );
    return {
      message: `${affectedRows.count} payment Status mark as FAILED.`,
    };
  }
);

export const scheduledFeeReminder = inngest.createFunction(
  { id: 'scheduled-fee-reminder' },
  { event: 'fee/reminder.scheduled' },
  async ({ event, step }) => {
    const { data, organizationId, jobId, scheduledDateTime } = event.data;

    // Step 1: Update job status to processing
    await step.run('update-job-status', async () => {
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          updatedAt: new Date(),
        },
      });
    });

    await step.sleepUntil('wait-for-scheduledDateTime', `${scheduledDateTime}`);

    // Step 2: Execute the reminder sending logic
    const result = await step.run('send-reminders', async () => {
      console.log('📧 Starting to send reminders NOW');
      return await executeReminders(data, organizationId);
    });

    // Step 3: Update job completion status
    await step.run('complete-job', async () => {
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          result: JSON.stringify(result),
          updatedAt: new Date(),
        },
      });
    });

    return result;
  }
);

export const updateExamStatuses = inngest.createFunction(
  { id: 'exam-status-updater' },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const upcoming = await step.run('set-upcoming', async () => {
      const now = new Date();
      return prisma.exam.updateMany({
        where: {
          status: { notIn: ['CANCELLED', 'UPCOMING'] },
          startDate: { gt: now },
        },
        data: { status: 'UPCOMING' },
      });
    });

    const live = await step.run('set-live', async () => {
      const now = new Date();
      return prisma.exam.updateMany({
        where: {
          status: { notIn: ['CANCELLED', 'LIVE'] },
          startDate: { lte: now },
          endDate: { gte: now },
        },
        data: { status: 'LIVE' },
      });
    });

    const completed = await step.run('set-completed', async () => {
      const now = new Date();
      return prisma.exam.updateMany({
        where: {
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
          endDate: { lt: now },
        },
        data: { status: 'COMPLETED' },
      });
    });

    return {
      message: `Updated Exam statuses → UPCOMING: ${upcoming.count}, LIVE: ${live.count}, COMPLETED: ${completed.count}`,
    };
  }
);

export const sendExamReminder = inngest.createFunction(
  { id: 'exam-reminder' },
  { event: 'exam/reminder.scheduled' },
  async ({ event, step }) => {
    const { emails, jobId, scheduledDateTime } = event.data;

    await step.run('update-job-status', async () => {
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          updatedAt: new Date(),
        },
      });
    });
    await step.sleepUntil('wait-for-scheduledDateTime', `${scheduledDateTime}`);
    // Step 2: Execute the reminder sending logic
    const result = await step.run('send-exam-reminders', async () => {
      console.log('📧 Starting to send reminders NOW');
      return await sendEmailExamReminder(emails);
    });

    // Step 3: Update job completion status
    await step.run('complete-job', async () => {
      await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          result: JSON.stringify(result),
          updatedAt: new Date(),
        },
      });
    });

    return result;
  }
);

export const updateNoticeStatuses = inngest.createFunction(
  { id: 'notice-status-updater' },
  { cron: '29 18 * * *' }, // 11:59 PM IST
  async ({ step }) => {
    const expiredNotices = await step.run('mark-expired', async () => {
      const nowIST = toISTDate(); // ✅ inside step.run
      return prisma.notice.updateMany({
        where: {
          status: 'PUBLISHED',
          endDate: { lt: nowIST },
        },
        data: { status: 'EXPIRED' },
      });
    });

    return {
      message: `Notice statuses updated → EXPIRED: ${expiredNotices.count}`,
    };
  }
);