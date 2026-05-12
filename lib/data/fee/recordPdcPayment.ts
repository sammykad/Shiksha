// app/actions/recordPdcPayment.ts
'use server';

import prisma from '@/lib/db';
import { ChequeStatus, FeeStatus, PaymentMethod, PaymentStatus } from '@/generated/prisma/enums';
import { getOrganizationId } from '@/lib/organization';
import { pdcPaymentSchema, PdcPaymentFormData } from '@/lib/schemas';
import { getCurrentUserId } from '@/lib/user';
import { formatCurrencyIN } from '@/lib/utils';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { notify } from '@/lib/notifications/notify';

export const recordPdcPayment = async (data: PdcPaymentFormData) => {
  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId();

  const validatedData = pdcPaymentSchema.parse(data);

  // ── 1. Fetch and validate fee ────────────────────────────────────────────
  const fee = await prisma.fee.findFirst({
    where: { id: validatedData.feeId, organizationId },
    include: {
      payments: {
        where: { status: PaymentStatus.CHEQUE_PENDING },
        select: { amount: true },
      },
      student: { select: { firstName: true, lastName: true } },
      feeCategory: { select: { name: true } },
    },
  });

  if (!fee) throw new Error('Fee not found');
  if (fee.status === FeeStatus.PAID) throw new Error('Fee is already fully paid');

  const currentPending = fee.pendingAmount ?? fee.totalFee - fee.paidAmount;
  if (currentPending <= 0) throw new Error('Fee already paid');

  // Sum of other PDC cheques that are recorded but not yet cleared
  const totalInFlightPdc = fee.payments.reduce((sum, p) => sum + p.amount, 0);
  const maxAllowable = Math.max(currentPending - totalInFlightPdc, 0);

  if (maxAllowable <= 0) {
    throw new Error(
      `This fee already has pending cheques worth ₹${formatCurrencyIN(totalInFlightPdc)} covering the remaining balance.`
    );
  }

  if (validatedData.amount > maxAllowable) {
    throw new Error(
      `Amount ₹${formatCurrencyIN(validatedData.amount)} exceeds the remaining allowable balance of ₹${formatCurrencyIN(maxAllowable)} (considering ₹${formatCurrencyIN(totalInFlightPdc)} in other pending cheques).`
    );
  }

  // Validate payer exists
  const payer = await prisma.user.findUnique({
    where: { id: validatedData.payerId },
    select: { id: true },
  });
  if (!payer) throw new Error(`Payer ID '${validatedData.payerId}' does not exist.`);

  const receiptNumber = `PDC-${randomUUID().slice(0, 8).toUpperCase()}`;

  // ── 2. Persist in transaction ────────────────────────────────────────────
  // Fee status stays UNPAID — PDC is not credited until cheque is CLEARED.
  // We create FeePayment with status CHEQUE_PENDING + a linked ChequeDetail record.
  await prisma.$transaction(async (tx) => {
    const feePayment = await tx.feePayment.create({
      data: {
        feeId: fee.id,
        amount: validatedData.amount,
        status: PaymentStatus.CHEQUE_PENDING,
        receiptNumber,
        transactionId: null,             // No gateway txn for cheque
        organizationId,
        note: validatedData.remarks ?? null,
        paymentMethod: PaymentMethod.CHEQUE,
        platformFee: 0,
        paymentDate: new Date(),         // Date school received cheque
        payerId: validatedData.payerId,
        recordedBy: userId,
      },
    });

    // Create linked ChequeDetail — normalized, single source of truth
    await tx.chequeDetail.create({
      data: {
        feePaymentId: feePayment.id,
        chequeNumber: validatedData.chequeNumber,
        chequeDate: validatedData.chequeDate,
        bankName: validatedData.bankName,
        branchName: validatedData.branchName ?? null,
        ifscCode: validatedData.ifscCode || null,
        micrCode: validatedData.micrCode || null,
        accountHolderName: validatedData.accountHolderName,
        accountNumberLast4: validatedData.accountNumberLast4 || null,
        status: ChequeStatus.PENDING,
        remarks: validatedData.remarks ?? null,
      },
    });

    // Fee record stays UNPAID — do NOT update paidAmount/pendingAmount yet.
    // Those are updated only when admin calls resolvePdcCheque with CLEARED status.
  });

  // ── 3. Send Notification (Parent) ───────────────────────────────────────────
  await notify.fee.pdc_cheque_recorded({
    feeId: fee.id,
    eventId: `pdc:${receiptNumber}`,
    recipients: [{ studentId: fee.studentId }],
    variables: {
      studentName: `${fee.student.firstName} ${fee.student.lastName}`,
      amount: validatedData.amount,
      chequeNumber: validatedData.chequeNumber,
      chequeDate: validatedData.chequeDate,
      bankName: validatedData.bankName,
      feeName: fee.feeCategory.name,
    },
  });

  revalidatePath('/dashboard/fees');
  revalidatePath('/dashboard/fees/admin');

  return {
    success: true,
    receiptNumber,
    message: `PDC cheque of ₹${formatCurrencyIN(validatedData.amount)} recorded. Fee will be credited once cheque clears.`,
  };
};