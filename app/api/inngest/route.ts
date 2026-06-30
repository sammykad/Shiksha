import { inngest } from '@/lib/inngest/client';
import { serve } from 'inngest/next';
import {
  updateOverdueFeesAutomation,
  failStalePendingPayments,
  scheduledFeeReminder,
  updateExamStatuses,
  updateNoticeStatuses,
  expireTrials,
  generateRecurringInvoices,
} from './functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    updateOverdueFeesAutomation,
    failStalePendingPayments,
    scheduledFeeReminder,
    updateExamStatuses,
    updateNoticeStatuses,
    expireTrials,
    generateRecurringInvoices,
  ],
});
