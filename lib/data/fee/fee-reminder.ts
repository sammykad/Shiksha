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
import { checkTimeOfDay, getMonthlyFeeCount } from '@/lib/notifications/throttle';

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
  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  const timeCheck = checkTimeOfDay(false)

  for (const recipient of validated.recipients) {
    // Throttle check: monthly cap
    const monthlyCount = await getMonthlyFeeCount(recipient.studentId, organizationId)
    const isOverCap = monthlyCount >= 4

    if (isOverCap) {
      totalSkipped++
      console.log('[fee-reminder] SKIPPED (monthly cap)', {
        studentName: recipient.studentName,
        monthlyCount,
      })
      continue
    }

    // Time-of-day warning (block only for non-urgent templates)
    if (validated.templateType === 'FEE_FRIENDLY_REMINDER' && !timeCheck.allowed) {
      totalSkipped++
      console.log('[fee-reminder] SKIPPED (time-of-day)', {
        studentName: recipient.studentName,
        reason: timeCheck.reason,
      })
      continue
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
      totalSent++;
    } else {
      let isDuplicate = false;
      if (result.results && result.results.length > 0) {
        const allChannels = result.results.flatMap(r => r.channels);
        if (allChannels.length > 0 && allChannels.every(c => c.error === "Duplicate")) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        totalSkipped++;
      } else {
        totalFailed++;
      }
    }
  }

  const parts = [];
  if (totalSent > 0) parts.push(`${totalSent} sent`);
  if (totalSkipped > 0) parts.push(`${totalSkipped} already sent today`);
  if (totalFailed > 0) parts.push(`${totalFailed} failed`);

  const summary = parts.length > 0 ? parts.join(', ') : 'No reminders sent';

  const isSuccess = totalFailed === 0 && totalSent > 0;

  return {
    success: isSuccess,
    sentCount: totalSent,
    message: summary,
    error: !isSuccess ? summary : undefined,
  };
}
