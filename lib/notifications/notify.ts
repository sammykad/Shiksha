import { NotificationChannel } from "@/generated/prisma/enums";
import {
    sendNotification,
    resolveContext,
    type RecipientInfo,
    type NotificationResult,
} from "./engine";

import type {
    TemplateVariablesMap,
    NotificationTemplateId,
} from "./template";

export type NotifyResult = NotificationResult & {
    ok: boolean;
    error?: string;
};

function enrich(r: NotificationResult): NotifyResult {
    return { ...r, ok: r.success, error: r.error };
}

const EMPTY_RESULT: NotifyResult = {
    ok: false,
    success: false,
    totalSent: 0,
    totalFailed: 0,
    totalAlreadySent: 0,
    totalCost: 0,
    results: [],
};

type Ctx = Awaited<ReturnType<typeof resolveContext>>;

type NotifyVars<K extends NotificationTemplateId> = Omit<
    TemplateVariablesMap[K],
    "organizationName"
>;

type NotifyParams<
    K extends NotificationTemplateId,
    Extra extends object = Record<never, never>,
> = Extra & {
    recipients: RecipientInfo[];
    variables: NotifyVars<K>;
    organizationId?: string;
    academicYearId?: string;
    eventId?: string;
    channels?: NotificationChannel[];
    attachment?: {
        filename: string;
        content: Buffer | string;
        contentType?: string;
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL SEND
// ─────────────────────────────────────────────────────────────────────────────

function cronDateKey(asOf?: Date): string {
    return (asOf ?? new Date()).toISOString().slice(0, 10);
}

async function send<K extends NotificationTemplateId>(
    templateId: K,
    extra: Omit<Parameters<typeof sendNotification<K>>[0], "templateId" | "variables" | "organizationId" | "academicYearId"> & {
        organizationId?: string;
        academicYearId?: string;
    },
    vars: (ctx: Ctx) => NotifyVars<K>,
): Promise<NotifyResult> {
    try {
        const ctx = await resolveContext();
        const result = enrich(await sendNotification<K>({
            ...extra,
            templateId,
            organizationId: extra.organizationId ?? ctx.organizationId,
            academicYearId: extra.academicYearId ?? ctx.academicYearId,
            variables: {
                ...vars(ctx),
                organizationName: ctx.organizationName,
            } as TemplateVariablesMap[K],
        }));

        // ✅ Centralized — fires for every notify.xxx.yyy() call automatically
        try {
            const bc = new BroadcastChannel("nexus-notification-summary");
            bc.postMessage({ templateId, ...result, timestamp: new Date() });
            bc.close();
        } catch { }

        return result;
    } catch (err) {
        console.error("[notify] Unhandled error", { error: (err as Error).message });
        return EMPTY_RESULT;
    }
}

export const notify = {
    attendance: {
        /**
         * @example
         * await notify.attendance.absent({
         *   attendanceId: attendance.id,
         *   recipients:   [{ studentId: student.id }],
         *   variables: {
         *     studentName: student.name,
         *     date:        new Date(),
         *     grade:       "10",
         *     section:     "A",
         *   },
         * })
         */
        absent(
            p: NotifyParams<"STUDENT_ABSENT", { attendanceId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "STUDENT_ABSENT",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `attendance:${p.attendanceId}:absent`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.attendance.late({
         *   attendanceId: attendance.id,
         *   recipients:   [{ studentId: student.id }],
         *   variables: {
         *     studentName: student.name,
         *     date:        new Date(),
         *     grade:       "10",
         *     section:     "A",
         *     time:        "09:42 AM",
         *   },
         * })
         */
        late(
            p: NotifyParams<"STUDENT_LATE", { attendanceId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "STUDENT_LATE",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `attendance:${p.attendanceId}:late`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    leave: {

        /**
         * @example
         * await notify.leave.approved({
         *   leaveId:    leave.id,
         *   recipients: [{ userId: staff.userId }],
         *   variables: {
         *     appliedBy:  staff.name,
         *     leaveType:  leave.type,
         *     startDate:  leave.startDate,
         *     endDate:    leave.endDate,
         *     totalDays:  leave.totalDays,
         *     approvedBy: approver.name,
         *     approvedAt: new Date(),
         *   },
         * })
         */
        approved(
            p: NotifyParams<"LEAVE_APPROVED", { leaveId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "LEAVE_APPROVED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `leave:${p.leaveId}:approved`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.leave.rejected({
         *   leaveId:    leave.id,
         *   recipients: [{ userId: staff.userId }],
         *   variables: {
         *     appliedBy:    staff.name,
         *     leaveType:    leave.type,
         *     startDate:    leave.startDate,
         *     endDate:      leave.endDate,
         *     totalDays:    leave.totalDays,
         *     reason:       leave.reason,
         *     rejectedNote: "Insufficient leave balance",
         *     rejectedBy:   approver.name,
         *   },
         * })
         */
        rejected(
            p: NotifyParams<"LEAVE_REJECTED", { leaveId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "LEAVE_REJECTED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `leave:${p.leaveId}:rejected`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    fee: {

        /**
         * @example
         * await notify.fee.created({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:     student.name,
         *     feeCategoryName: category.name,
         *     amount:          fee.amount,
         *     dueDate:         fee.dueDate,
         *     status:          "UNPAID",
         *     paymentLink:     "https://pay.example.com/fee/123",
         *   },
         * })
         */
        created(
            p: NotifyParams<"FEE_CREATED", { feeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "FEE_CREATED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:created`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * Fires at most once per fee per calendar day — safe to retry from cron.
         *
         * @example
         * await notify.fee.friendlyReminder({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:     student.name,
         *     feeCategoryName: category.name,
         *     amount:          fee.amount,
         *     dueDate:         fee.dueDate,
         *     paymentLink:     "https://pay.example.com/fee/123",
         *   },
         * })
         */
        friendlyReminder(
            p: NotifyParams<"FEE_FRIENDLY_REMINDER", { feeId: string; asOf?: Date }>,
        ): Promise<NotifyResult> {
            const day = cronDateKey(p.asOf);
            return send(
                "FEE_FRIENDLY_REMINDER",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:reminder:${day}`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * Fires at most once per fee per calendar day — safe to retry from cron.
         *
         * @example
         * await notify.fee.dueToday({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:     student.name,
         *     feeCategoryName: category.name,
         *     amount:          fee.amount,
         *     dueDate:         fee.dueDate,
         *     paymentLink:     "https://pay.example.com/fee/123",
         *   },
         * })
         */
        dueToday(
            p: NotifyParams<"FEE_DUE_TODAY", { feeId: string; asOf?: Date }>,
        ): Promise<NotifyResult> {
            const day = cronDateKey(p.asOf);
            return send(
                "FEE_DUE_TODAY",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:due-today:${day}`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * Fires at most once per fee per calendar day — safe to retry from cron.
         *
         * @example
         * await notify.fee.overdue({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:     student.name,
         *     feeCategoryName: category.name,
         *     amount:          fee.amount,
         *     dueDate:         fee.dueDate,
         *     paymentLink:     "https://pay.example.com/fee/123",
         *   },
         * })
         */
        overdue(
            p: NotifyParams<"FEE_OVERDUE", { feeId: string; asOf?: Date }>,
        ): Promise<NotifyResult> {
            const day = cronDateKey(p.asOf);
            return send(
                "FEE_OVERDUE",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:overdue:${day}`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.fee.paymentSuccess({
         *   feeId:      feePayment.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:   student.name,
         *     amount:        payment.amount,
         *     receiptNumber: payment.receiptNumber,
         *     receiptUrl:    "https://pay.example.com/receipt/123",
         *   },
         * })
         */
        paymentSuccess(
            p: NotifyParams<"PAYMENT_SUCCESS", { feeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "PAYMENT_SUCCESS",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:payment-success`,
                    recipients: p.recipients,
                    channels: p.channels,
                    attachment: p.attachment,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.fee.paymentFailed({
         *   feeId:      feePayment.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName: student.name,
         *     feeName:     fee.name,
         *     transactionId: payment.transactionId,
         *     amount:      payment.amount,
         *     paymentLink: "https://pay.example.com/fee/123",
         *     failedAt:    payment.failedAt,
         *   },
         * })
         */
        paymentFailed(
            p: NotifyParams<"PAYMENT_FAILED", { feeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "PAYMENT_FAILED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:payment-failed`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.fee.pdc_cheque_recorded({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:  student.name,
         *     amount:       1000,
         *     chequeNumber: "123456",
         *     chequeDate:   new Date(),
         *     bankName:     "HDFC",
         *     feeName:      "Tuition Fee",
         *   },
         * })
         */
        pdc_cheque_recorded(
            p: NotifyParams<"PDC_CHEQUE_RECORDED", { feeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "PDC_CHEQUE_RECORDED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:pdc-recorded`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.fee.pdc_cheque_bounced({
         *   feeId:      fee.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:  student.name,
         *     amount:       1000,
         *     chequeNumber: "123456",
         *     bankName:     "HDFC",
         *     feeName:      "Tuition Fee",
         *     bounceReason: "Insufficient funds",
         *   },
         * })
         */
        pdc_cheque_bounced(
            p: NotifyParams<"PDC_CHEQUE_BOUNCED", { feeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "PDC_CHEQUE_BOUNCED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `fee:${p.feeId}:pdc-bounced`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    exam: {

        /**
         * @example
         * await notify.exam.created({
         *   examId:     exam.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     examName: exam.name,
         *     date:     exam.date,
         *     time:     "10:00 AM",
         *     examUrl:  "https://example.com/exams/123",
         *   },
         * })
         */
        created(
            p: NotifyParams<"EXAM_CREATED", { examId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "EXAM_CREATED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `exam:${p.examId}:created`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.exam.reminder({
         *   examId:     exam.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     examName: exam.name,
         *     date:     exam.date,
         *     time:     "10:00 AM",
         *     venue:    "Hall A",
         *   },
         * })
         */
        reminder(
            p: NotifyParams<"EXAM_REMINDER", { examId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "EXAM_REMINDER",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `exam:${p.examId}:reminder`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.exam.enrollment({
         *   examId:     exam.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     examName: exam.name,
         *     date:     exam.date,
         *     time:     "10:00 AM",
         *     examUrl:  "https://example.com/exams/123",
         *   },
         * })
         */
        enrollment(
            p: NotifyParams<"EXAM_ENROLLMENT", { examId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "EXAM_ENROLLMENT",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `exam:${p.examId}:enrollment`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.exam.hallTicket({
         *   examId:     exam.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     examName:      exam.name,
         *     date:          exam.date,
         *     hallTicketUrl: "https://example.com/hall-tickets/123",
         *   },
         * })
         */
        hallTicket(
            p: NotifyParams<"EXAM_HALL_TICKET", { examId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "EXAM_HALL_TICKET",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `exam:${p.examId}:hall-ticket`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.exam.resultPublished({
         *   examId:     exam.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     examName:   exam.name,
         *     percentage: "87.5",
         *     resultUrl:  "https://example.com/results/123",
         *   },
         * })
         */
        resultPublished(
            p: NotifyParams<"RESULT_PUBLISHED", { examId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "RESULT_PUBLISHED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `exam:${p.examId}:result-published`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    notice: {

        /**
         * @example
         * await notify.notice.general({
         *   noticeId:   notice.id,
         *   recipients: [{ userId: user.id }],
         *   variables: {
         *     title:   notice.title,
         *     message: notice.body,
         *   },
         * })
         */
        general(
            p: NotifyParams<"GENERAL_NOTICE", { noticeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "GENERAL_NOTICE",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `notice:${p.noticeId}:general`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.notice.urgent({
         *   noticeId:   notice.id,
         *   recipients: [{ userId: user.id }],
         *   variables: {
         *     title:   notice.title,
         *     message: notice.body,
         *   },
         * })
         */
        urgent(
            p: NotifyParams<"URGENT_NOTICE", { noticeId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "URGENT_NOTICE",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `notice:${p.noticeId}:urgent`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    document: {

        /**
         * @example
         * await notify.document.missing({
         *   documentId: document.id,
         *   recipients: [{ userId: user.id }],
         *   variables: {
         *     recipientName: user.name,
         *     documentType:  "Aadhaar Card",
         *     documentName:  "aadhaar.pdf",
         *     supportEmail:  "support@school.com",
         *     supportPhone:  "9876543210",
         *   },
         * })
         */
        missing(
            p: NotifyParams<"DOCUMENT_MISSING", { documentId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "DOCUMENT_MISSING",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `document:${p.documentId}:missing`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.document.approved({
         *   documentId: document.id,
         *   recipients: [{ userId: user.id }],
         *   variables: {
         *     recipientName: user.name,
         *     documentType:  "Aadhaar Card",
         *     documentName:  "aadhaar.pdf",
         *     documentUrl:   "https://example.com/documents/123",
         *     uploadedOn:    new Date(),
         *   },
         * })
         */
        approved(
            p: NotifyParams<"DOCUMENT_APPROVED", { documentId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "DOCUMENT_APPROVED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `document:${p.documentId}:approved`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },

        /**
         * @example
         * await notify.document.rejected({
         *   documentId: document.id,
         *   recipients: [{ userId: user.id }],
         *   variables: {
         *     recipientName: user.name,
         *     documentType:  "Aadhaar Card",
         *     documentName:  "aadhaar.pdf",
         *     rejectReason:  "Document is blurry",
         *     documentUrl:   "https://example.com/documents/123",
         *     supportEmail:  "support@school.com",
         *     supportPhone:  "9876543210",
         *   },
         * })
         */
        rejected(
            p: NotifyParams<"DOCUMENT_REJECTED", { documentId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "DOCUMENT_REJECTED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `document:${p.documentId}:rejected`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    report: {

        /**
         * @example
         * await notify.report.monthly({
         *   reportId:   report.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName:  student.name,
         *     month:        "January 2025",
         *     attendance:   "92",
         *     performance:  "Good",
         *   },
         * })
         */
        monthly(
            p: NotifyParams<"MONTHLY_REPORT", { reportId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "MONTHLY_REPORT",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `report:${p.reportId}:monthly`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    greeting: {

        /**
         * @example
         * await notify.greeting.birthday({
         *   studentId:  student.id,
         *   recipients: [{ studentId: student.id }],
         *   variables: {
         *     studentName: student.name,
         *   },
         * })
         */
        birthday(
            p: NotifyParams<"BIRTHDAY_WISH", { studentId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "BIRTHDAY_WISH",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `greeting:${p.studentId}:birthday`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },

    certificate: {

        /**
         * @example
         * await notify.certificate.issued({
         *   certificateId: cert.id,
         *   recipients:    [{ studentId: student.id }],
         *   variables: {
         *     studentName:     student.name,
         *     certificateType: "BONAFIDE",
         *     certificateNumber: "CERT-001",
         *     grade:           "10",
         *     section:         "A",
         *     year:            "2025-2026",
         *     language:        "ENGLISH",
         *     issuedBy:        "John Doe",
         *   },
         *   attachment: {
         *     filename: "BONAFIDE_Student_Name.pdf",
         *     content:  pdfBuffer,
         *     contentType: "application/pdf",
         *   },
         * })
         */
        issued(
            p: NotifyParams<"CERTIFICATE_ISSUED", { certificateId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "CERTIFICATE_ISSUED",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `cert:${p.certificateId}`,
                    recipients: p.recipients,
                    channels: p.channels,
                    attachment: p.attachment,
                },
                () => p.variables,
            );
        },
    },

    holiday: {
        emergency(
            p: NotifyParams<"EMERGENCY_HOLIDAY", { holidayId: string }>,
        ): Promise<NotifyResult> {
            return send(
                "EMERGENCY_HOLIDAY",
                {
                    organizationId: p.organizationId,
                    academicYearId: p.academicYearId,
                    eventId: p.eventId ?? `holiday:${p.holidayId}:emergency`,
                    recipients: p.recipients,
                    channels: p.channels,
                },
                () => p.variables,
            );
        },
    },
} as const;

export type { RecipientInfo, NotificationResult };