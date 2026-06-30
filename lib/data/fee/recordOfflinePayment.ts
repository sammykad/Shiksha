'use server';

import prisma from '@/lib/db';
import { FeeStatus, PaymentStatus } from '@/generated/prisma/enums';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { offlinePaymentFormData, offlinePaymentSchema } from '@/lib/schemas';
import { getCurrentUserId } from '@/lib/user';
import { formatCurrencyIN } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { notify } from '@/lib/notifications/notify';
import { preparePaymentReceipt } from '@/lib/data/fee/preparePaymentReceipt';
import { getFeeBalance, syncFeeBalance } from '@/lib/data/fee/fee-balance';
import { generateReceiptNumber } from '@/lib/data/fee/receipt-number';
import { PrismaUserError } from '@/lib/prisma-error-extension';

export const recordOfflinePayment = async (data: offlinePaymentFormData) => {
  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();

  const validatedData = offlinePaymentSchema.parse(data);

  const fee = await prisma.fee.findFirst({
    where: { id: validatedData.feeId, organizationId, academicYearId },
    select: {
      id: true,
      status: true,
      totalFee: true,
      paidAmount: true,
      pendingAmount: true,
      dueDate: true,
      studentId: true,
      feeCategoryId: true,
      payments: { select: { amount: true, status: true } },
      student: { select: { firstName: true, lastName: true } },
      feeCategory: { select: { name: true } },
    },
  });

  if (!fee) {
    const existsOtherYear = await prisma.fee.findFirst({
      where: { id: validatedData.feeId, organizationId },
      select: { academicYearId: true },
    });
    if (existsOtherYear) {
      throw new Error('Fee exists in a different academic year. Switch academic year and try again.');
    }
    throw new Error('Fee not found');
  }
  const currentBalance = getFeeBalance(fee);
  if (currentBalance.status === FeeStatus.PAID) throw new Error('Fee is already fully paid');

  const pendingAmount = currentBalance.dueAmount;

  if (pendingAmount <= 0) throw new Error('Fee already paid');
  if (validatedData.amount > pendingAmount) throw new Error('Payment amount exceeds remaining balance');

  if (validatedData.payerId) {
    const payer = await prisma.user.findUnique({
      where: { id: validatedData.payerId },
      select: { id: true },
    });
    if (!payer) throw new Error(`Payer ID '${validatedData.payerId}' does not exist.`);
  }

  const receiptNumber = await generateReceiptNumber(organizationId, 'REC');

  // ── 2. Persist payment in a transaction ───────────────────────────────────
  const paymentAmount = validatedData.amount;
  try {
    await prisma.$transaction(async (tx) => {
      // Record the new payment
      await tx.feePayment.create({
        data: {
          feeId: fee.id,
          amount: paymentAmount,
          status: PaymentStatus.COMPLETED,
          receiptNumber,
          transactionId: validatedData.transactionId,
          organizationId,
          note: validatedData.note,
          paymentMethod: validatedData.method,
          platformFee: 0,
          paymentDate: new Date(),
          payerId: validatedData.payerId,
          recordedBy: userId,
        },
      });

      // Atomically increment paidAmount — prevents lost updates from concurrent payments
      await syncFeeBalance(fee.id, tx);
    });
  } catch (error) {
    if (error instanceof PrismaUserError && error.prismaCode === 'P2002' && error.modelName === 'FeePayment') {
      if (validatedData.transactionId) {
        throw new Error(
          `A payment with transaction reference "${validatedData.transactionId}" already exists for this fee. Use a different transaction ID or leave it blank.`,
        );
      }
      throw new Error('A payment with this receipt number already exists. Please try again.');
    }
    throw error;
  }

  // ── 3. Prepare receipt — fetches full data, builds FeeRecord, generates PDF ─
  const { feeRecord, pdfBuffer } = await preparePaymentReceipt(fee.id, organizationId, {
    amount: validatedData.amount,
    paymentDate: new Date(),
    paymentMethod: validatedData.method,
    receiptNumber,
    transactionId: validatedData.transactionId,
    status: PaymentStatus.COMPLETED,
    payerId: validatedData.payerId,
  });

  // ── 4. Send email + WhatsApp with the PDF attached ─────────────────────────
  await notify.fee.paymentSuccess({
    feeId: fee.id,
    eventId: `fee:${fee.id}:payment:${receiptNumber}`,
    recipients: [{ studentId: fee.studentId }],
    attachment: {
      filename: `Receipt-${receiptNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
    variables: {
      studentName: `${feeRecord.student.firstName} ${feeRecord.student.lastName}`,
      receiptNumber,
      paymentMethod: validatedData.method,
      receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fees/?txn=${validatedData.transactionId}`,
      feeName: feeRecord.feeCategory.name,
      amount: validatedData.amount,
      paidAt: new Date(),
    },
  });

  // Step 5: Revalidate pages
  revalidatePath('/dashboard/fees');
  revalidatePath('/dashboard/fees/admin');

  return {
    success: true,
    message: `Successfully recorded offline payment of ₹${formatCurrencyIN(validatedData.amount)}`,
  };
};
