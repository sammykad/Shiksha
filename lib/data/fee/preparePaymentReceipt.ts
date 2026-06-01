import prisma from '@/lib/db';
import { PaymentStatus } from '@/generated/prisma/enums';
import { generateReceiptBuffer } from '@/lib/pdf-generator/generateReceiptBuffer';
import { FeeRecord } from '@/types';
import { randomUUID } from 'crypto';
import { getFeeBalance } from './fee-balance';

interface InFlightPayment {
  id?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: FeeRecord['payments'][number]['paymentMethod'];
  receiptNumber: string;
  transactionId?: string | null;
  status: PaymentStatus;
  payerId?: string | null;
}

interface PreparePaymentReceiptResult {
  feeRecord: FeeRecord;
  pdfBuffer: Buffer;
  receiptNumber: string;
}

/**
 * Fetches all data required for a payment receipt, builds a FeeRecord,
 * and generates a PDF buffer — ready to attach to an email or WhatsApp message.
 *
 * @param feeId          - The fee the payment belongs to.
 * @param organizationId - The organisation the fee belongs to.
 * @param payment        - The payment that was just recorded (may not be persisted yet).
 *
 * @example
 * // In a server action, after recording the payment in a transaction:
 * const { feeRecord, pdfBuffer, receiptNumber } = await preparePaymentReceipt(
 *   fee.id,
 *   organizationId,
 *   {
 *     amount: validatedData.amount,
 *     paymentDate: new Date(),
 *     paymentMethod: validatedData.method,
 *     receiptNumber,
 *     transactionId: validatedData.transactionId,
 *     status: PaymentStatus.COMPLETED,
 *     payerId: validatedData.payerId,
 *   },
 * );
 *
 * // Then send via email / WhatsApp:
 * notify.fee.paymentSuccess({
 *   attachment: { filename: `Receipt-${receiptNumber}.pdf`, content: pdfBuffer },
 *   ...
 * });
 */
export async function preparePaymentReceipt(
  feeId: string,
  organizationId: string,
  payment: InFlightPayment,
): Promise<PreparePaymentReceiptResult> {
  // ── 1. Fee + student + all persisted completed payments ───────────────────
  const fee = await prisma.fee.findUnique({
    where: { id: feeId },
    include: {
      academicYear: {
        select: {
          name: true,
        },
      },
      student: {
        select: {
          id: true,
          userId: true,
          profileImage: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          email: true,
          phoneNumber: true,
          gradeId: true,
          sectionId: true,
          grade: { select: { id: true, grade: true } },
          section: { select: { id: true, name: true } },
          parents: {
            select: {
              isPrimary: true,
              parent: {
                select: {
                  id: true,
                  userId: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  whatsAppNumber: true,
                },
              },
            },
          },
        },
      },
      feeCategory: {
        select: { id: true, name: true, description: true },
      },
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        include: {
          payer: { select: { firstName: true, lastName: true, email: true } },
          chequeDetail: {
            select: {
              chequeNumber: true,
              chequeDate: true,
              bankName: true,
              status: true,
              bounceReason: true,
            },
          },
        },
        orderBy: { paymentDate: 'asc' },
      },
    },
  });

  if (!fee) throw new Error(`Fee '${feeId}' not found`);

  // ── 2. Organisation branding (name, email, phone, logo) ───────────────────
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      contactEmail: true,
      contactPhone: true, // adjust to match your schema field name
      logo: true,  // adjust to match your schema field name
    },
  });

  // ── 3. Resolve payer details for the in-flight payment ────────────────────
  let payerDetails: FeeRecord['payments'][number]['payer'] = {
    firstName: '',
    lastName: '',
    email: '',
  };

  if (payment.payerId) {
    const payer = await prisma.user.findUnique({
      where: { id: payment.payerId },
      select: { firstName: true, lastName: true, email: true },
    });
    if (payer) payerDetails = payer;
  }

  // ── 4. Merge persisted payments with the in-flight payment ────────────────
  //       The in-flight payment may not be in the DB yet (recorded inside a tx),
  //       so we append it manually to ensure it appears on the receipt.
  const persistedPayments: FeeRecord['payments'] = fee.payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    paymentDate: p.paymentDate,
    paymentMethod: p.paymentMethod,
    receiptNumber: p.receiptNumber,
    transactionId: p.transactionId ?? null,
    feeId: p.feeId,
    status: p.status,
    payer: p.payer ?? { firstName: '', lastName: '', email: '' },
    chequeDetail: p.chequeDetail,
  }));

  // Avoid duplicating if the tx already committed before this function runs
  const alreadyPersisted = persistedPayments.some(
    (p) => p.receiptNumber === payment.receiptNumber,
  );

  const allPayments: FeeRecord['payments'] = alreadyPersisted
    ? persistedPayments
    : [
      ...persistedPayments,
      {
        id: payment.id ?? randomUUID(),
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        receiptNumber: payment.receiptNumber,
        transactionId: payment.transactionId ?? null,
        feeId: fee.id,
        status: payment.status,
        payer: payerDetails,
        chequeDetail: null, // In-flight payments in this context are usually just cleared, details are in persisted payments
      },
    ];

  // ── 5. Build FeeRecord ─────────────────────────────────────────────────────
  const balance = getFeeBalance({
    totalFee: fee.totalFee,
    dueDate: fee.dueDate,
    payments: allPayments.map((p) => ({ amount: p.amount, status: p.status })),
  });

  const feeRecord: FeeRecord = {
    fee: {
      id: fee.id,
      totalFee: fee.totalFee,
      academicYearName: fee.academicYear.name,
      paidAmount: balance.paidAmount,
      pendingAmount: balance.dueAmount,
      dueDate: fee.dueDate,
      status: balance.status as FeeRecord['fee']['status'],
      studentId: fee.studentId,
      feeCategoryId: fee.feeCategoryId,
      organizationId,
      organizationName: organization?.name ?? undefined,
      organizationEmail: organization?.contactEmail ?? undefined,
      organizationPhone: organization?.contactPhone ?? undefined,
      organizationLogo: organization?.logo ?? undefined,
      createdAt: fee.createdAt,
      updatedAt: fee.updatedAt,
    },
    student: {
      id: fee.student.id,
      userId: fee.student.userId,
      profileImage: fee.student.profileImage,
      firstName: fee.student.firstName,
      lastName: fee.student.lastName,
      rollNumber: fee.student.rollNumber,
      email: fee.student.email,
      phoneNumber: fee.student.phoneNumber,
      gradeId: fee.student.gradeId,
      sectionId: fee.student.sectionId,
      parents: fee.student.parents,
    },
    feeCategory: {
      id: fee.feeCategory.id,
      name: fee.feeCategory.name,
      description: fee.feeCategory.description,
    },
    grade: {
      id: fee.student.grade.id,
      grade: fee.student.grade.grade,
    },
    section: {
      id: fee.student.section.id,
      name: fee.student.section.name,
    },
    payments: allPayments,
  };

  // ── 6. Generate PDF buffer ─────────────────────────────────────────────────
  const pdfBuffer = await generateReceiptBuffer(feeRecord);

  return {
    feeRecord,
    pdfBuffer,
    receiptNumber: payment.receiptNumber,
  };
}
