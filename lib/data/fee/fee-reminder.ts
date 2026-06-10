'use server';

import {
  ReminderResult,
  SendReminderData,
} from '@/components/dashboard/Fees/SendFeesReminderDialog';
import prisma from '@/lib/db';
import {
  NotificationChannel,
  scheduledJobType,
} from '@/generated/prisma/enums';
import { inngest } from '@/lib/inngest/client';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUser } from '@/lib/user';
import { z } from 'zod';
import { notify } from '@/lib/notifications/notify';
import {
  getMonthlyFeeCounts,
  shouldSendManualFeeReminder,
} from '@/lib/notifications/throttle';

const reminderDataSchema = z.object({
  recipients: z.array(
    z.object({
      id: z.string(),
      studentId: z.string(),
      studentName: z.string(),
      grade: z.string(),
      section: z.string(),
      parentName: z.string(),
      parentEmail: z.string().email(),
      parentPhone: z.string(),
      parentWhatsAppNumber: z.string().optional(),
      parentUserId: z.string().nullable().optional(),
      parentId: z.string().nullable().optional(),
      status: z.enum(['UNPAID', 'OVERDUE']),
      amountDue: z.number(),
      dueDate: z.date(),
      feeCategoryName: z.string(),
      avatar: z.string().optional(),
      organizationName: z.string().optional(),
      organizationEmail: z.string().optional(),
      organizationPhone: z.string().optional(),
    })
  ),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  scheduleDate: z.date().nullable().optional(),
  scheduleTime: z.string().nullable().optional(),
  templateType: z.enum([
    'FEE_FRIENDLY_REMINDER',
    'FEE_DUE_TODAY',
    'FEE_OVERDUE',
  ]),
});



const TEMPLATE_MAP = {
  FEE_FRIENDLY_REMINDER: 'friendlyReminder',
  FEE_DUE_TODAY: 'dueToday',  // no separate engine template — uses friendly reminder
  FEE_OVERDUE: 'overdue',
} as const satisfies Record<string, 'friendlyReminder' | 'dueToday' | 'overdue'>;


export async function sendFeeReminders(data: SendReminderData): Promise<ReminderResult> {
  const organizationId = await getOrganizationId();
  const user = await getCurrentUser();
  const createdBy = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

  try {
    const validated = reminderDataSchema.parse(data);

    if (validated.scheduleDate && validated.scheduleTime) {
      return scheduleReminder(validated, organizationId, createdBy);
    }

    return executeReminders(validated, organizationId);
  } catch (error) {
    console.error('Failed to send reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function scheduleReminder(
  data: SendReminderData,
  organizationId: string,
  createdBy: string,
): Promise<ReminderResult> {
  if (!data.scheduleDate || !data.scheduleTime) {
    return { success: false, error: 'Schedule date and time must be provided' };
  }

  const dateOnly = data.scheduleDate.toISOString().split('T')[0];
  const scheduledDateTime = new Date(`${dateOnly}T${data.scheduleTime}:00+05:30`);
  const minFutureTime = new Date(Date.now() + 2 * 60 * 1000);

  if (scheduledDateTime <= minFutureTime) {
    return { success: false, error: 'Scheduled time must be at least 2 minutes in the future.' };
  }

  const scheduledJob = await prisma.scheduledJob.create({
    data: {
      organizationId,
      type: scheduledJobType.FEE_REMINDER,
      scheduledAt: scheduledDateTime,
      data: JSON.stringify(data),
      status: 'PENDING',
      createdBy,
      channels: data.channels
    },
  });

  await inngest.send({
    name: 'fee/reminder.scheduled',
    data: { data, scheduledDateTime, organizationId, jobId: scheduledJob.id },
  });

  return {
    success: true,
    sentCount: 0,
    scheduledJobId: scheduledJob.id,
    scheduledAt: scheduledDateTime,
    message: `Reminder scheduled for ${scheduledDateTime.toLocaleString()}`,
  };
}

export async function executeReminders(
  validated: SendReminderData,
  organizationId: string,
): Promise<ReminderResult> {
  const method = TEMPLATE_MAP[validated.templateType];
  const totals = {
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const monthlyCounts = await getMonthlyFeeCounts(
    validated.recipients.map((recipient) => recipient.studentId),
    organizationId,
  );

  for (const recipient of validated.recipients) {
    const policy = shouldSendManualFeeReminder({
      monthlyCount: monthlyCounts.get(recipient.studentId) ?? 0,
      templateType: validated.templateType,
    });

    if (!policy.allowed) {
      totals.skipped++;
      continue;
    }

    const result = await notify.fee[method]({
      feeId: recipient.id,  // stable per-recipient fee ID
      organizationId,
      recipients: [{
        // Pass contacts directly — engine skips DB resolution
        userId: recipient.parentUserId ?? undefined,
        parentId: recipient.parentId ?? undefined,
        studentId: recipient.studentId,
        email: recipient.parentEmail,
        phone: recipient.parentPhone,
        whatsappNumber: recipient.parentWhatsAppNumber ?? recipient.parentPhone,
      }],
      variables: {
        studentName: recipient.studentName,
        feeCategoryName: recipient.feeCategoryName,
        amount: recipient.amountDue,
        dueDate: recipient.dueDate,
        paymentLink: 'fees/pay',
      },
      channels: validated.channels,
    });

    if (result.ok) {
      totals.sent++;
    } else {
      if (isDuplicateResult(result)) {
        totals.skipped++;
      } else {
        totals.failed++;
      }
    }
  }

  const parts = [];
  if (totals.sent > 0) parts.push(`${totals.sent} sent`);
  if (totals.skipped > 0) parts.push(`${totals.skipped} skipped`);
  if (totals.failed > 0) parts.push(`${totals.failed} failed`);

  const summary = parts.length > 0 ? parts.join(', ') : 'No reminders sent';

  const isSuccess = totals.failed === 0 && totals.sent > 0;

  return {
    success: isSuccess,
    sentCount: totals.sent,
    message: summary,
    error: !isSuccess ? summary : undefined,
  };
}

function isDuplicateResult(result: Awaited<ReturnType<typeof notify.fee.friendlyReminder>>) {
  const channels = result.results?.flatMap((item) => item.channels) ?? [];
  return channels.length > 0 && channels.every((channel) => channel.error === 'Duplicate');
}
