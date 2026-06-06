'use server';

import prisma from '@/lib/db';
import { ChequeStatus, PaymentMethod, PaymentStatus } from '@/generated/prisma/enums';
import { getCurrentUserId } from '@/lib/user';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserByRole } from '@/lib/auth';
import { notify } from '@/lib/notifications/notify';
import { preparePaymentReceipt } from './preparePaymentReceipt';
import { syncFeeBalance } from './fee-balance';

const resolveSchema = z.object({
  chequeDetailId: z.string().min(1),
  resolution: z.enum(['CLEARED', 'BOUNCED', 'CANCELLED']),
  bounceReason: z.string().optional(),
});

export type ResolvePdcInput = z.infer<typeof resolveSchema>;

export const resolvePdcCheque = async (input: ResolvePdcInput) => {
  const currentUser = await getCurrentUserByRole();
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Only admins can resolve PDC cheques');
  }

  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId();
  const { chequeDetailId, resolution, bounceReason } = resolveSchema.parse(input);

  // Fetch cheque with all related data needed — scoped to organizationId
  const cheque = await prisma.chequeDetail.findFirst({
    where: {
      id: chequeDetailId,
      feePayment: { organizationId }
    },
    include: {
      feePayment: {
        include: {
          fee: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              feeCategory: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!cheque) throw new Error('Cheque record not found');
  if (cheque.status !== ChequeStatus.PENDING)
    throw new Error(`Cheque is already ${cheque.status.toLowerCase()}`);

  const feePayment = cheque.feePayment;
  const fee = feePayment.fee;

  await prisma.$transaction(async (tx) => {
    const now = new Date();

    if (resolution === 'CLEARED') {
      // ── Update cheque status ────────────────────────────────────────────
      await tx.chequeDetail.update({
        where: { id: chequeDetailId },
        data: {
          status: ChequeStatus.CLEARED,
          clearedAt: now,
          resolvedBy: userId,
        },
      });

      // ── Credit the payment — mirrors recordOfflinePayment logic exactly ─
      await tx.feePayment.update({
        where: { id: feePayment.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      await syncFeeBalance(fee.id, tx);
    } else if (resolution === 'BOUNCED') {
      if (!bounceReason?.trim()) throw new Error('Bounce reason is required');

      await tx.chequeDetail.update({
        where: { id: chequeDetailId },
        data: {
          status: ChequeStatus.BOUNCED,
          bounceReason: bounceReason.trim(),
          resolvedBy: userId,
        },
      });

      // Mark payment as FAILED — fee stays UNPAID (nothing to reverse)
      await tx.feePayment.update({
        where: { id: feePayment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await syncFeeBalance(fee.id, tx);
    } else {
      // CANCELLED
      await tx.chequeDetail.update({
        where: { id: chequeDetailId },
        data: {
          status: ChequeStatus.CANCELLED,
          cancelledAt: now,
          resolvedBy: userId,
        },
      });

      await tx.feePayment.update({
        where: { id: feePayment.id },
        data: { status: PaymentStatus.CANCELLED },
      });

      await syncFeeBalance(fee.id, tx);
    }
  });

  // ── 3. Post-Resolution: Notifications & Receipts ───────────────────────────
  if (resolution === 'CLEARED') {
    const { pdfBuffer } = await preparePaymentReceipt(fee.id, organizationId, {
      amount: feePayment.amount,
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.CHEQUE,
      receiptNumber: feePayment.receiptNumber,
      status: PaymentStatus.COMPLETED,
    });

    await notify.fee.paymentSuccess({
      feeId: fee.id,
      eventId: `pdc:cleared:${feePayment.receiptNumber}`,
      recipients: [{ studentId: fee.student.id }],
      attachment: {
        filename: `Receipt-${feePayment.receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
      variables: {
        studentName: `${fee.student.firstName} ${fee.student.lastName}`,
        receiptNumber: feePayment.receiptNumber,
        paymentMethod: PaymentMethod.CHEQUE,
        feeName: fee.feeCategory.name,
        amount: feePayment.amount,
        paidAt: new Date(),
        receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fees`,
      },
    });
  } else if (resolution === 'BOUNCED') {
    await notify.fee.pdc_cheque_bounced({
      feeId: fee.id,
      eventId: `pdc:bounced:${feePayment.receiptNumber}`,
      recipients: [{ studentId: fee.student.id }],
      variables: {
        studentName: `${fee.student.firstName} ${fee.student.lastName}`,
        amount: feePayment.amount,
        chequeNumber: cheque.chequeNumber,
        bankName: cheque.bankName,
        feeName: fee.feeCategory.name,
        bounceReason: bounceReason || 'Not specified',
      },
    });
  }

  revalidatePath('/dashboard/fees');
  revalidatePath('/dashboard/fees/admin');

  const messages = {
    CLEARED: 'Cheque marked as cleared. Fee has been credited.',
    BOUNCED: 'Cheque marked as bounced. Fee remains unpaid.',
    CANCELLED: 'Cheque cancelled.',
  };

  return { success: true, message: messages[resolution] };
};

export const getPdcCheques = async () => {
  const currentUser = await getCurrentUserByRole();
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Only admins can view PDC cheques');
  }
  const organizationId = await getOrganizationId();
  const pdcCheques = await prisma.chequeDetail.findMany({
    where: { feePayment: { organizationId } },
    orderBy: { chequeDate: 'asc' },
    include: {
      feePayment: {
        include: {
          fee: {
            include: {
              student: { select: { firstName: true, lastName: true } },
              feeCategory: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return pdcCheques;
};
