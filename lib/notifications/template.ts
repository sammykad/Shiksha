import { NotificationType } from "@/generated/prisma/enums";
import React from "react";
import { WhatsAppTemplatePayload } from "./providers/whatsapp";

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL BODY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationBody = string | React.ReactElement | WhatsAppTemplatePayload;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE SHAPE  (used by registry.ts, not stored per-template)
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationTemplate<T = any> {
  type: NotificationType;
  subKey?: string;
  inboxTitle: string;
  inboxMessage: string;
  channels: {
    SMS?: {
      body: string;
    };
    PUSH?: {
      subject: string;
      body: string;
    };
    EMAIL?: {
      subject: string;
      /** React component — receives the full variables object as props */
      Component: React.ComponentType<T>;
    };
    WHATSAPP?: {
      /** Plain-text fallback used only inside the 24-h customer-service window */
      body: string;
      /** Pre-approved Meta template builder — preferred path */
      template?: (vars: T) => WhatsAppTemplatePayload;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIABLES
// ─────────────────────────────────────────────────────────────────────────────

export interface BaseVariables {
  organizationName: string;
}

export interface StudentAbsentVariables extends BaseVariables {
  studentName: string;
  date: string | Date;
  time: string;
  grade: string;
  section: string;
}

export interface StudentLateVariables extends BaseVariables {
  studentName: string;
  date: string | Date;
  arrivalTime: string;
  grade: string;
  section: string;
}

export interface FeeCreatedVariables extends BaseVariables {
  studentName: string;
  feeCategoryName: string;
  amount: number;
  dueDate: Date;
  status: "UNPAID" | "OVERDUE";
  paymentLink?: string;
}

export interface FeeFriendlyReminderVariables extends BaseVariables {
  studentName: string;
  feeCategoryName: string;
  amount: number;
  dueDate?: Date;
  paymentLink?: string;
}

export interface FeeDueTodayVariables extends BaseVariables {
  studentName: string;
  feeCategoryName: string;
  amount: number;
  dueDate?: Date;
  paymentLink?: string;
}

export interface FeeOverdueVariables extends BaseVariables {
  studentName: string;
  feeCategoryName: string;
  amount: number;
  dueDate?: Date;
  paymentLink?: string;
}

export interface PaymentSuccessVariables extends BaseVariables {
  studentName: string;
  amount: number;
  feeName: string;
  receiptNumber: string;
  paymentMethod?: string;
  receiptUrl?: string;
  paidAt: Date;
}

export interface PaymentFailedVariables extends BaseVariables {
  studentName: string;
  feeName: string;
  amount: number;
  transactionId: string;
  paymentLink?: string;
  failedAt: Date;
}

export interface PdcChequeRecordedVariables extends BaseVariables {
  studentName: string;
  amount: number;
  chequeNumber: string;
  chequeDate: Date;
  bankName: string;
  feeName: string;
}

export interface PdcChequeBouncedVariables extends BaseVariables {
  studentName: string;
  amount: number;
  chequeNumber: string;
  bankName: string;
  feeName: string;
  bounceReason: string;
}

export interface ExamCreatedVariables extends BaseVariables {
  examName: string;
  date?: string | Date;
  time?: string;
  examUrl?: string;
}

export interface ExamReminderVariables extends BaseVariables {
  examName: string;
  date?: string | Date;
  time?: string;
  venue?: string;
}

export interface ExamEnrollmentVariables extends BaseVariables {
  examName: string;
  date?: string | Date;
  time?: string;
  examUrl?: string;
}

export interface ExamHallTicketVariables extends BaseVariables {
  examName: string;
  date?: string | Date;
  hallTicketUrl?: string;
}

export interface ResultPublishedVariables extends BaseVariables {
  examName: string;
  percentage?: string | number;
  resultUrl?: string;
}

export interface GeneralNoticeVariables extends BaseVariables {
  title: string;
  summary?: string;
  content: string;
  noticeType: string;
  startDate: Date;
  endDate: Date;
  publishedBy?: string;
  attachmentCount?: number;
  noticeId: string;
}

export interface UrgentNoticeVariables extends BaseVariables {
  title: string;
  summary?: string;
  content: string;
  noticeType: string;
  startDate: Date;
  endDate: Date;
  publishedBy?: string;
  attachmentCount?: number;
  noticeId: string;
}

export interface LeaveApprovedVariables extends BaseVariables {
  appliedBy: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface LeaveRejectedVariables extends BaseVariables {
  appliedBy: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  rejectedNote?: string;
  rejectedBy?: string;
}

export interface DocumentMissingVariables extends BaseVariables {
  recipientName: string;
  documentType: string;
  documentName: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
}

export interface DocumentApprovedVariables extends BaseVariables {
  recipientName: string;
  documentType: string;
  documentName: string;
  documentUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  uploadedOn?: Date;
  fileSize?: string;
  address?: string;
}

export interface DocumentRejectedVariables extends BaseVariables {
  recipientName: string;
  documentType: string;
  documentName: string;
  rejectReason: string;
  documentUrl: string;
  supportEmail: string;
  supportPhone: string;
  fileSize?: string;
  uploadedOn?: Date;
  rejectedOn?: string;
  rejectedBy?: string;
  address?: string;
}

export interface MonthlyReportVariables extends BaseVariables {
  studentName: string;
  month: string;
  attendance?: string | number;
  performance?: string;
}

export interface BirthdayWishVariables extends BaseVariables {
  studentName: string;
}

export interface EmergencyHolidayVariables extends BaseVariables {
  holidayName: string;
  date: string;
  reason?: string;
  isEmergency: boolean;
}

export interface TeachingAssignmentVariables extends BaseVariables {
  teacherName: string;
  subject: string;
  grade: string;
  section: string;
  academicYear: string;
}

export interface ComplaintReceivedVariables extends BaseVariables {
  trackingId: string;
  category: string;
  submittedAt: Date;
}

export interface AdmissionConfirmedVariables extends BaseVariables {
  studentName: string;
  grade: string;
  section: string;
  admissionNumber: string;
  loginUrl?: string;
}

export interface StudentOnboardedVariables extends BaseVariables {
  studentName: string;
  grade: string;
  section: string;
  rollNumber: string;
  loginUrl?: string;
}

export interface CertificateIssuedVariables extends BaseVariables {
  studentName: string;
  certificateType: string;
  certificateNumber: string;
  grade: string;
  section: string;
  year: string;
  language: string;
  rollNo: string;
  issuedBy?: string;
  downloadUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE → VARIABLES MAP  (single source of truth for call-site types)
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateVariablesMap = {
  STUDENT_ABSENT: StudentAbsentVariables;
  STUDENT_LATE: StudentLateVariables;

  FEE_CREATED: FeeCreatedVariables;
  FEE_FRIENDLY_REMINDER: FeeFriendlyReminderVariables;
  FEE_DUE_TODAY: FeeDueTodayVariables;
  FEE_OVERDUE: FeeOverdueVariables;
  PAYMENT_SUCCESS: PaymentSuccessVariables;
  PAYMENT_FAILED: PaymentFailedVariables;

  EXAM_CREATED: ExamCreatedVariables;
  EXAM_REMINDER: ExamReminderVariables;
  EXAM_ENROLLMENT: ExamEnrollmentVariables;
  EXAM_HALL_TICKET: ExamHallTicketVariables;
  RESULT_PUBLISHED: ResultPublishedVariables;

  GENERAL_NOTICE: GeneralNoticeVariables;
  URGENT_NOTICE: UrgentNoticeVariables;

  LEAVE_APPROVED: LeaveApprovedVariables;
  LEAVE_REJECTED: LeaveRejectedVariables;

  DOCUMENT_MISSING: DocumentMissingVariables;
  DOCUMENT_APPROVED: DocumentApprovedVariables;
  DOCUMENT_REJECTED: DocumentRejectedVariables;

  MONTHLY_REPORT: MonthlyReportVariables;
  BIRTHDAY_WISH: BirthdayWishVariables;
  EMERGENCY_HOLIDAY: EmergencyHolidayVariables;
  TEACHING_ASSIGNMENT: TeachingAssignmentVariables;
  COMPLAINT_RECEIVED: ComplaintReceivedVariables;
  ADMISSION_CONFIRMED: AdmissionConfirmedVariables;
  STUDENT_ONBOARDED: StudentOnboardedVariables;
  CERTIFICATE_ISSUED: CertificateIssuedVariables;

  PDC_CHEQUE_RECORDED: PdcChequeRecordedVariables;
  PDC_CHEQUE_BOUNCED: PdcChequeBouncedVariables;
};

export type NotificationVariables = TemplateVariablesMap[keyof TemplateVariablesMap];
export type NotificationTemplateId = keyof TemplateVariablesMap;