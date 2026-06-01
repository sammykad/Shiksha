/**
 * registry.ts
 *
 * Single source of truth for every notification template.
 *
 * To add a new template:
 *   1. Add its variables interface to template.ts
 *   2. Add it to TemplateVariablesMap in template.ts
 *   3. Add one entry here — channels, WhatsApp builder, and React component all in one place
 *
 * Rules:
 *   - EMAIL.Component   → React email component (receives full variables as props)
 *   - WHATSAPP.template → Pre-approved Meta template builder (preferred)
 *   - WHATSAPP.body     → Plain-text fallback (24-h customer-service window only)
 *   - SMS is disabled — omit SMS from every entry until the provider is live
 */

import type { NotificationTemplate, NotificationTemplateId, TemplateVariablesMap } from "@/lib/notifications/template";
import { formatCurrencyIN, formatCurrencyINWithSymbol, formatDateIN, formatTimeIN } from "@/lib/utils";

// ── React email components ────────────────────────────────────────────────────
import StudentAbsentEmail from "@/emails/templates/STUDENT_ABSENT";
import StudentLateEmail from "@/emails/templates/STUDENT_LATE";
import FeeCreatedEmail from "@/emails/templates/FEE_CREATED";
import FeeFriendlyReminderEmail from "@/emails/templates/FEE_FRIENDLY_REMINDER";
import FeeDueTodayEmail from "@/emails/templates/FEE_DUE_TODAY";
import FeeOverdueEmail from "@/emails/templates/FEE_OVERDUE";
import PaymentSuccessEmail from "@/emails/templates/PAYMENT_SUCCESS";
import PaymentFailedEmail from "@/emails/templates/PAYMENT_FAILED";
import LeaveApprovedEmail from "@/emails/templates/LeaveApprovedEmail";
import LeaveRejectedEmail from "@/emails/templates/LEAVE_REJECTED";
import DocumentApprovedEmail from "@/emails/templates/DocumentApproved";
import DocumentRejectionEmail from "@/components/templates/email-templates/documents/documentRejectedMail";
import GeneralNoticeEmail from "@/emails/templates/GENERAL_NOTICE";
import UrgentNoticeEmail from "@/emails/templates/URGENT_NOTICE";

function txt(text: string | number | undefined | null): { type: "text"; text: string } {
  return { type: "text", text: String(text ?? "") };
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

type Registry = { [K in NotificationTemplateId]: NotificationTemplate<TemplateVariablesMap[K]> };

export const NOTIFICATION_REGISTRY: Registry = {

  // ── ATTENDANCE ─────────────────────────────────────────────────────────────

  STUDENT_ABSENT: {
    type: "ATTENDANCE",
    inboxTitle: "{{studentName}} was absent",
    inboxMessage: "Marked absent on {{date}} in {{grade}}-{{section}}",
    channels: {
      PUSH: {
        subject: "Attendance Alert",
        body: "{{studentName}} was absent on {{date}}",
      },
      EMAIL: {
        subject: "Attendance Alert — {{studentName}}",
        Component: StudentAbsentEmail,
      },
      WHATSAPP: {
        body: "Attendance Alert: {{studentName}} was ABSENT on {{date}}. Class: {{grade}}-{{section}} — {{organizationName}}.",
        template: (v) => ({
          name: "student_absent",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },         // header {{1}}
            {
              type: "body", parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(formatDateIN(v.date)),                                   // {{2}}
                txt(v.time),                                                 // {{3}}
                txt(v.grade),                                                // {{4}}
                txt(v.section),                                              // {{5}}
                txt(v.organizationName),                                     // {{6}}
              ]
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  STUDENT_LATE: {
    type: "ATTENDANCE",
    inboxTitle: "{{studentName}} arrived late",
    inboxMessage: "Late arrival on {{date}} at {{arrivalTime}} in {{grade}}-{{section}}",
    channels: {
      PUSH: {
        subject: "Late Arrival",
        body: "{{studentName}} arrived late on {{date}} at {{arrivalTime}}",
      },
      EMAIL: {
        subject: "Late Arrival — {{studentName}}",
        Component: StudentLateEmail,
      },
      WHATSAPP: {
        body: "Attendance Alert: {{studentName}} arrived LATE on {{date}} at {{arrivalTime}}. Class: {{grade}}-{{section}} — {{organizationName}}.",
        template: (v) => ({
          name: "student_late",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body", parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(formatDateIN(v.date)),                                   // {{2}}
                txt(v.arrivalTime),                                          // {{3}}
                txt(v.grade),                                                // {{4}}
                txt(v.section),                                              // {{5}}
                txt(v.organizationName),                                     // {{6}}
              ]
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },
  // ── FEES ───────────────────────────────────────────────────────────────────

  FEE_CREATED: {
    type: "FEE",
    subKey: "fee_created",
    inboxTitle: "New fee created — {{studentName}}",
    inboxMessage: "{{amount}} due on {{dueDate}}",
    channels: {
      PUSH: {
        subject: "New Fee",
        body: "New fee {{amount}} due on {{dueDate}} for {{studentName}}",
      },
      EMAIL: {
        subject: "New Fee — {{studentName}}",
        Component: FeeCreatedEmail,
      },
      WHATSAPP: {
        body: "Fee Alert: A new fee of {{amount}} is due on {{dueDate}} for {{studentName}} — {{organizationName}}.",
        template: (v) => ({
          name: "fee_created",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },          // header {{1}}
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(v.feeCategoryName),                                      // {{2}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{3}}
                txt(formatDateIN(v.dueDate)),                                // {{4}}
                txt(v.status),                                               // {{5}}
                txt(v.organizationName),                                     // {{6}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.paymentLink ?? "")],      // button {{1}} (relative path)
            },
          ],
        }),
      },
    },
  },

  FEE_FRIENDLY_REMINDER: {
    type: "FEE",
    subKey: "friendly_reminder",
    inboxTitle: "Fee reminder — {{studentName}}",
    inboxMessage: "{{amount}} due on {{dueDate}}",
    channels: {
      PUSH: {
        subject: "Fee Reminder",
        body: "Fee {{amount}} due on {{dueDate}} for {{studentName}}",
      },
      EMAIL: {
        subject: "Fee Reminder — {{studentName}}",
        Component: FeeFriendlyReminderEmail,
      },
      WHATSAPP: {
        body: "Fee Reminder for {{studentName}}: {{amount}} due on {{dueDate}} — {{organizationName}}.",
        template: (v) => ({
          name: "fee_friendly_reminder",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },            // header {{1}}
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(v.feeCategoryName),                                      // {{2}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{3}}
                txt(v.dueDate ? formatDateIN(v.dueDate) : "soon"),           // {{4}}
                txt(v.organizationName),                                     // {{5}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.paymentLink ?? "")],      // button {{1}}
            },
          ],
        }),
      },
    },
  },

  FEE_DUE_TODAY: {
    type: "FEE",
    subKey: "payment_due_today",
    inboxTitle: "Fee due today — {{studentName}}",
    inboxMessage: "{{amount}} must be paid today",
    channels: {
      PUSH: {
        subject: "Fee Due Today",
        body: "Fee {{amount}} due today for {{studentName}}",
      },
      EMAIL: {
        subject: "Fee Due Today — {{studentName}}",
        Component: FeeDueTodayEmail,
      },
      WHATSAPP: {
        body: "Urgent Fee Reminder for {{studentName}}: {{amount}} is due today — {{organizationName}}.",
        template: (v) => ({
          name: "fee_due_today",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },            // header {{1}}
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(v.feeCategoryName),                                      // {{2}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{3}}
                txt(v.organizationName),                                     // {{4}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.paymentLink ?? "")],      // button {{1}}
            },
          ],
        }),
      },
    },
  },

  FEE_OVERDUE: {
    type: "FEE",
    subKey: "overdue_notice",
    inboxTitle: "Fee overdue — {{studentName}}",
    inboxMessage: "{{amount}} is overdue. Please pay immediately.",
    channels: {
      PUSH: {
        subject: "Fee Overdue",
        body: "URGENT: Fee {{amount}} overdue for {{studentName}}",
      },
      EMAIL: {
        subject: "Overdue Fee — {{studentName}}",
        Component: FeeOverdueEmail,
      },
      WHATSAPP: {
        body: "Overdue Alert for {{studentName}}: {{amount}} is now overdue — {{organizationName}}.",
        template: (v) => ({
          name: "fee_overdue",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },            // header {{1}}
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(v.feeCategoryName),                                      // {{2}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{3}}
                txt(v.dueDate ? formatDateIN(v.dueDate) : "past due date"), // {{4}}
                txt(v.organizationName),                                     // {{5}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.paymentLink ?? "")],      // button {{1}}
            },
          ],
        }),
      },
    },
  },

  PAYMENT_SUCCESS: {
    type: "FEE",
    subKey: "payment_success",
    inboxTitle: "Fee payment received — {{studentName}}",
    inboxMessage: "{{amount}} paid. Receipt: {{receiptNumber}}",
    channels: {
      PUSH: {
        subject: "Fee Payment Received",
        body: "{{amount}} received for {{studentName}}. Receipt: {{receiptNumber}}",
      },
      EMAIL: {
        subject: "Payment Receipt — {{receiptNumber}}",
        Component: PaymentSuccessEmail,
      },
      WHATSAPP: {
        body: "Payment of {{amount}} received for {{studentName}}. Receipt: {{receiptNumber}} — {{organizationName}}.",
        template: (v) => ({
          name: "payment_success",
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [],
            },
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(v.feeName),                                              // {{2}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{3}}
                txt(v.paymentMethod ?? "Online"),                            // {{4}}
                txt(v.receiptNumber),                                        // {{5}}
                txt(formatDateIN(v.paidAt)),                                 // {{6}}
                txt(v.organizationName),                                     // {{7}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [],                                                // static View Receipt
            },
          ],
        }),
      },
    },
  },

  PAYMENT_FAILED: {
    type: "FEE",
    subKey: "payment_failed",
    inboxTitle: "Payment failed — {{studentName}}",
    inboxMessage: "{{amount}} payment was not processed. Please retry.",
    channels: {
      PUSH: {
        subject: "Payment Failed",
        body: "Payment of {{amount}} failed for {{studentName}}. Please retry.",
      },
      EMAIL: {
        subject: "Payment Failed — {{studentName}}",
        Component: PaymentFailedEmail,
      },
      WHATSAPP: {
        body: "Payment Failed: The {{amount}} payment for {{studentName}} was not successful. Please retry — {{organizationName}}.",
        template: (v) => ({
          name: "payment_failed",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },                              // static
            {
              type: "body",
              parameters: [
                txt(v.studentName),                                          // {{1}}
                txt(formatCurrencyINWithSymbol(v.amount)),                   // {{2}}
                txt(v.feeName),                                              // {{3}}
                txt(v.transactionId ?? "N/A"),                               // {{4}}
                txt(v.organizationName),                                     // {{5}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [],                                                // static Retry
            },
          ],
        }),
      },
    },
  },

  // ── EXAMS ──────────────────────────────────────────────────────────────────

  EXAM_CREATED: {
    type: "EXAM",
    subKey: "exam_created",
    inboxTitle: "New exam scheduled — {{examName}}",
    inboxMessage: "Scheduled on {{date}} at {{time}}",
    channels: {
      PUSH: {
        subject: "New Exam Scheduled",
        body: "{{examName}} scheduled on {{date}}",
      },
      WHATSAPP: {
        body: "Exam Update: New exam {{examName}} scheduled on {{date}} at {{time}}. Details: {{examUrl}} — {{organizationName}}.",
      },
    },
  },

  EXAM_REMINDER: {
    type: "EXAM",
    subKey: "exam_reminder",
    inboxTitle: "Exam tomorrow — {{examName}}",
    inboxMessage: "At {{time}}, venue: {{venue}}",
    channels: {
      PUSH: {
        subject: "Exam Tomorrow",
        body: "{{examName}} is tomorrow at {{time}}",
      },
      WHATSAPP: {
        body: "Exam Reminder: {{examName}} is scheduled for tomorrow at {{time}}. Venue: {{venue}}. Good luck from {{organizationName}}!",
      },
    },
  },

  EXAM_ENROLLMENT: {
    type: "EXAM",
    subKey: "exam_enroll",
    inboxTitle: "Enrolled for {{examName}}",
    inboxMessage: "Exam on {{date}} at {{time}}",
    channels: {
      PUSH: {
        subject: "Exam Enrollment Confirmed",
        body: "Enrolled for {{examName}} on {{date}}",
      },
      WHATSAPP: {
        body: "Enrollment Confirmed: You are enrolled for {{examName}} on {{date}} at {{time}}. Details: {{examUrl}} — {{organizationName}}.",
      },
    },
  },

  EXAM_HALL_TICKET: {
    type: "EXAM",
    subKey: "exam_hall_ticket",
    inboxTitle: "Hall ticket ready — {{examName}}",
    inboxMessage: "Download your hall ticket for {{date}}",
    channels: {
      PUSH: {
        subject: "Hall Ticket Ready",
        body: "Hall ticket for {{examName}} is ready to download",
      },
      WHATSAPP: {
        body: "Hall Ticket Ready: Download your hall ticket for {{examName}} on {{date}}. Link: {{hallTicketUrl}} — {{organizationName}}.",
      },
    },
  },

  RESULT_PUBLISHED: {
    type: "EXAM",
    subKey: "exam_result",
    inboxTitle: "Results published — {{examName}}",
    inboxMessage: "Your score: {{percentage}}%",
    channels: {
      PUSH: {
        subject: "Results Published",
        body: "Results for {{examName}} are now available",
      },
      WHATSAPP: {
        body: "Exam Results: Results for {{examName}} have been published. Score: {{percentage}}%. View: {{resultUrl}} — {{organizationName}}.",
      },
    },
  },

  // ── NOTICES ────────────────────────────────────────────────────────────────

  GENERAL_NOTICE: {
    type: "NOTICE",
    subKey: "general_notice",
    inboxTitle: "{{title}}",
    inboxMessage: "{{summary}}",
    channels: {
      PUSH: {
        subject: "{{title}}",
        body: "{{summary}}",
      },
      EMAIL: {
        subject: "{{title}}",
        Component: GeneralNoticeEmail,
      },
      WHATSAPP: {
        body: "Official Notice from {{organizationName}}:\n\n*{{title}}*\n\n{{summary}}\n\nPlease check the portal for full details. Thank you.",
        template: (v) => ({
          name: "general_notice",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body",
              parameters: [
                txt(v.organizationName),                           // {{1}}
                txt(v.title),                                      // {{2}}
                txt(v.summary ?? v.content.slice(0, 100)),         // {{3}}
                txt(v.noticeType || "General Notice"),             // {{4}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.noticeId)],                        // button {{1}}
            },
          ],
        }),
      },
    },
  },


  URGENT_NOTICE: {
    type: "NOTICE",
    subKey: "urgent_notice",
    inboxTitle: "🚨 Urgent: {{title}}",
    inboxMessage: "{{summary}}",
    channels: {
      PUSH: {
        subject: "URGENT: {{title}}",
        body: "{{summary}}",
      },
      EMAIL: {
        subject: "URGENT: {{title}}",
        Component: UrgentNoticeEmail,
      },
      WHATSAPP: {
        body: "Urgent Announcement from {{organizationName}}:\n\n*{{title}}*\n\n{{summary}}\n\nPlease take immediate action as required. Thank you.",
        template: (v) => ({
          name: "general_notice",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body",
              parameters: [
                txt(v.organizationName),                         // {{1}}
                txt(v.title),                                    // {{2}}
                txt(v.summary ?? v.content.slice(0, 100)),        // {{3}}
                txt("Urgent Announcement"),                      // {{4}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [txt(v.noticeId)],                        // button {{1}}
            },
          ],
        }),
      },
    },
  },

  // ── LEAVE ──────────────────────────────────────────────────────────────────

  LEAVE_APPROVED: {
    type: "LEAVE",
    subKey: "leave_approved",
    inboxTitle: "Leave approved",
    inboxMessage: "{{leaveType}} from {{startDate}} to {{endDate}} ({{totalDays}} days)",
    channels: {
      PUSH: {
        subject: "Leave Approved",
        body: "{{leaveType}} approved from {{startDate}} to {{endDate}}",
      },
      EMAIL: {
        subject: "Leave Approved",
        Component: LeaveApprovedEmail,
      },
      WHATSAPP: {
        body: "Leave Approved: Your {{leaveType}} from {{startDate}} to {{endDate}} ({{totalDays}} days) has been approved by {{approvedBy}} — {{organizationName}}.",
        template: (v) => ({
          name: "leave_approved",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body",
              parameters: [
                txt(v.leaveType),                                            // {{1}}
                txt(v.appliedBy),                                            // {{2}}
                txt(v.approvedBy ?? "Administrator"),                        // {{3}}
                txt(formatDateIN(v.startDate)),                               // {{4}}
                txt(formatDateIN(v.endDate)),                                 // {{5}}
                txt(v.totalDays),                                            // {{6}}
                txt(v.organizationName),                                     // {{7}}
              ],
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  LEAVE_REJECTED: {
    type: "LEAVE",
    subKey: "leave_rejected",
    inboxTitle: "Leave rejected",
    inboxMessage: "{{leaveType}} from {{startDate}} to {{endDate}} was not approved",
    channels: {
      PUSH: {
        subject: "Leave Rejected",
        body: "Your {{leaveType}} application was rejected",
      },
      EMAIL: {
        subject: "Leave Rejected",
        Component: LeaveRejectedEmail,
      },
      WHATSAPP: {
        body: "Leave Rejected: Your {{leaveType}} from {{startDate}} to {{endDate}} was not approved. Reason: {{reason}} — {{organizationName}}.",
        template: (v) => ({
          name: "leave_rejected",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body",
              parameters: [
                txt(v.leaveType),                                            // {{1}}
                txt(v.appliedBy),                                            // {{2}}
                txt(formatDateIN(v.startDate)),                               // {{3}}
                txt(formatDateIN(v.endDate)),                                 // {{4}}
                txt(v.totalDays),                                            // {{5}}
                txt(v.reason ?? "Not specified"),                            // {{6}}
                txt(v.organizationName),                                     // {{7}}
              ],
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  // ── DOCUMENTS ──────────────────────────────────────────────────────────────

  DOCUMENT_MISSING: {
    type: "DOCUMENT",
    subKey: "document_missing",
    inboxTitle: "Document required — {{documentType}}",
    inboxMessage: "Please upload {{documentType}} for {{recipientName}}",
    channels: {
      PUSH: {
        subject: "Document Required",
        body: "{{documentType}} is required for {{recipientName}}",
      },
      WHATSAPP: {
        body: "Document Required: Please upload the required {{documentType}} for {{recipientName}} at your earliest convenience — {{organizationName}}.",
      },
    },
  },

  DOCUMENT_APPROVED: {
    type: "DOCUMENT",
    subKey: "document_verified",
    inboxTitle: "Document approved — {{documentType}}",
    inboxMessage: "{{documentType}} has been verified successfully",
    channels: {
      PUSH: {
        subject: "Document Approved",
        body: "{{documentType}} has been verified",
      },
      EMAIL: {
        subject: "Document Approved — {{documentType}}",
        Component: DocumentApprovedEmail,
      },
      WHATSAPP: {
        body: "Document Approved: Your {{documentType}} has been verified successfully by our team — {{organizationName}}.",
        template: (v) => ({
          name: "document_approved",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [txt(v.recipientName), txt(v.documentType), txt(v.organizationName)],
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  DOCUMENT_REJECTED: {
    type: "DOCUMENT",
    subKey: "document_rejected",
    inboxTitle: "Document rejected — {{documentType}}",
    inboxMessage: "Reason: {{rejectReason}}",
    channels: {
      PUSH: {
        subject: "Document Rejected",
        body: "{{documentType}} was rejected. Reason: {{rejectReason}}",
      },
      EMAIL: {
        subject: "Document Rejected — {{documentType}}",
        Component: DocumentRejectionEmail,
      },
      WHATSAPP: {
        body: "Document Rejected: Your {{documentType}} was not approved. Reason: {{rejectReason}}. Please re-upload via the portal — {{organizationName}}.",
        template: (v) => ({
          name: "document_rejected",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [] },
            {
              type: "body",
              parameters: [
                txt(v.recipientName),                    // {{1}}
                txt(v.documentType),                     // {{2}}
                txt(v.documentName),                     // {{3}}
                txt(v.organizationName),                 // {{4}}
                txt(v.rejectReason),                     // {{5}}
                txt(v.supportPhone),                     // {{6}}
              ],
            },
            { type: "footer", parameters: [] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [],                            // static URL, no token needed
            },
          ],
        }),
      },
    },
  },

  // ── MISC ───────────────────────────────────────────────────────────────────

  MONTHLY_REPORT: {
    type: "ACADEMIC_REPORT",
    inboxTitle: "Monthly report — {{studentName}}",
    inboxMessage: "{{month}} report is ready. Attendance: {{attendance}}%",
    channels: {
      PUSH: {
        subject: "Monthly Report Ready",
        body: "{{month}} report for {{studentName}} is ready",
      },
      WHATSAPP: {
        body: "Monthly Report: The report for {{studentName}} ({{month}}) is now ready. Attendance: {{attendance}}%. Please check the portal — {{organizationName}}.",
      },
    },
  },

  BIRTHDAY_WISH: {
    type: "GREETING",
    inboxTitle: "Happy Birthday {{studentName}}!",
    inboxMessage: "Wishing you a wonderful year ahead from {{organizationName}}",
    channels: {
      PUSH: {
        subject: "Happy Birthday!",
        body: "Happy Birthday {{studentName}}!",
      },
      WHATSAPP: {
        body: "Birthday Wishes: Happy Birthday {{studentName}}! Wishing you a fantastic day and a wonderful year ahead from {{organizationName}}.",
      },
    },
  },

  TEACHING_ASSIGNMENT: {
    type: "GENERAL",
    subKey: "teaching_assignment",
    inboxTitle: "Teaching assignment — {{subject}} ({{grade}}-{{section}})",
    inboxMessage: "You have been assigned to teach {{subject}} for {{grade}}-{{section}}",
    channels: {
      PUSH: {
        subject: "New Teaching Assignment",
        body: "Assigned: {{subject}} for {{grade}}-{{section}}",
      },
      WHATSAPP: {
        body: "Assignment Update: You have a teaching assignment for {{subject}} in {{grade}}-{{section}} for the year {{academicYear}} — {{organizationName}}.",
      },
    },
  },

  COMPLAINT_RECEIVED: {
    type: "GENERAL",
    subKey: "complaint_received",
    inboxTitle: "Complaint submitted — Tracking ID: {{trackingId}}",
    inboxMessage: "Your complaint has been received and is being reviewed.",
    channels: {
      PUSH: {
        subject: "Complaint Submitted",
        body: "Your complaint (ID: {{trackingId}}) has been received",
      },
      WHATSAPP: {
        body: "Complaint Status: Your complaint (Tracking ID: {{trackingId}}) has been received and is being reviewed. — {{organizationName}}.",
      },
    },
  },

  ADMISSION_CONFIRMED: {
    type: "GENERAL",
    subKey: "admission_confirmed",
    inboxTitle: "Admission confirmed — {{studentName}}",
    inboxMessage: "{{studentName}} has been enrolled in {{grade}}-{{section}}",
    channels: {
      PUSH: {
        subject: "Admission Confirmed",
        body: "{{studentName}} enrolled in {{grade}}-{{section}}",
      },
      WHATSAPP: {
        body: "Admission confirmed for {{studentName}} in {{grade}}-{{section}}. Admission No: {{admissionNumber}}. Welcome to {{organizationName}}!",
      },
    },
  },

  STUDENT_ONBOARDED: {
    type: "GENERAL",
    subKey: "student_onboarded",
    inboxTitle: "Welcome to {{organizationName}} — {{studentName}}",
    inboxMessage: "{{studentName}} has been onboarded in {{grade}}-{{section}} (Roll: {{rollNumber}})",
    channels: {
      PUSH: {
        subject: "Welcome!",
        body: "Welcome {{studentName}}! Onboarded in {{grade}}-{{section}}",
      },
      WHATSAPP: {
        body: "Welcome to {{organizationName}}! {{studentName}} onboarded in {{grade}}-{{section}}, Roll No: {{rollNumber}}.",
      },
    },
  },

  CERTIFICATE_ISSUED: {
    type: "GENERAL",
    subKey: "certificate_issued",
    inboxTitle: "Certificate Issued: {{certificateType}}",
    inboxMessage: "{{studentName}} has been issued a {{certificateType}} (No. {{certificateNumber}}) for {{year}}.",
    channels: {
      PUSH: {
        subject: "Certificate Issued",
        body: "{{certificateType}} issued to {{studentName}}",
      },
      WHATSAPP: {
        body: "Certificate Issued: The {{certificateType}} for {{studentName}} ({{grade}}-{{section}}) is ready. Cert No: {{certificateNumber}} — {{organizationName}}.",
      },
    },
  },

  PDC_CHEQUE_RECORDED: {
    type: "FEE",
    subKey: "pdc_cheque_recorded",
    inboxTitle: "Cheque recorded — {{studentName}}",
    inboxMessage: "PDC #{{chequeNumber}} for {{amount}} recorded for {{feeName}}",
    channels: {
      PUSH: {
        subject: "Cheque Recorded",
        body: "Cheque #{{chequeNumber}} for {{amount}} received for {{studentName}}",
      },
      WHATSAPP: {
        body: "Cheque Recorded: We received a cheque for {{studentName}}: #{{chequeNumber}} for {{amount}}, dated {{chequeDate}} ({{bankName}}) — System Alert: Shiksha.cloud",
        template: (v) => ({
          name: "pdc_cheque_recorded",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt(v.studentName)] },
            {
              type: "body",
              parameters: [
                txt(v.studentName),
                txt(v.chequeNumber),
                txt(formatCurrencyINWithSymbol(v.amount)),
                txt(formatDateIN(v.chequeDate)),
                txt(v.bankName),
                txt(v.organizationName),
              ],
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  PDC_CHEQUE_BOUNCED: {
    type: "FEE",
    subKey: "pdc_cheque_bounced",
    inboxTitle: "Cheque bounced — {{studentName}}",
    inboxMessage: "Cheque #{{chequeNumber}} for {{amount}} was returned. Reason: {{bounceReason}}",
    channels: {
      PUSH: {
        subject: "Cheque Bounced",
        body: "URGENT: Cheque #{{chequeNumber}} for {{studentName}} bounced",
      },
      WHATSAPP: {
        body: "Urgent Alert: Cheque bounced for {{studentName}}. Cheque #{{chequeNumber}} ({{amount}}) was returned by {{bankName}}. Reason: {{bounceReason}} — System Alert: Shiksha.cloud",
        template: (v) => ({
          name: "pdc_cheque_bounced",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [txt("Payment Alert")] },
            {
              type: "body",
              parameters: [
                txt(v.studentName),
                txt(v.chequeNumber),
                txt(formatCurrencyINWithSymbol(v.amount)),
                txt(v.bankName),
                txt(v.bounceReason),
                txt(v.organizationName),
              ],
            },
            { type: "footer", parameters: [] },
          ],
        }),
      },
    },
  },

  EMERGENCY_HOLIDAY: {
    type: "GENERAL",
    subKey: "emergency_holiday",
    inboxTitle: "🚨 EMERGENCY HOLIDAY: {{holidayName}}",
    inboxMessage: "IMPORTANT: The institution will remain closed on {{date}} due to {{holidayName}}. Reason: {{reason}}",
    channels: {
      PUSH: {
        subject: "Emergency Holiday Alert",
        body: "EMERGENCY HOLIDAY: {{holidayName}} on {{date}}. The institution will remain closed.",
      },
      WHATSAPP: {
        body: "*🚨 EMERGENCY HOLIDAY DECLARATION*\n\nIMPORTANT: We will remain closed on *{{date}}* due to *{{holidayName}}*.\n\nReason: {{reason}}\n\n— {{organizationName}}\nThanks.",
        template: (v) => ({
          name: "emergency_holiday",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                txt(v.date),
                txt(v.holidayName),
                txt(v.reason),
                txt(v.organizationName),
              ]
            },
            { type: "footer", parameters: [] },
          ]
        }),
      },
      SMS: {
        body: "EMERGENCY: School closed on {{date}} due to {{holidayName}}. — {{organizationName}}",
      },
    },
  },
};
