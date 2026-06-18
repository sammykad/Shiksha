import { inngest } from '@/lib/inngest/client';
import { serve } from 'inngest/next';
import {
  updateOverdueFeesAutomation,
  updatePaymentStatus,
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
    updatePaymentStatus,
    scheduledFeeReminder,
    updateExamStatuses,
    updateNoticeStatuses,
    expireTrials,
    generateRecurringInvoices,
  ],
});
