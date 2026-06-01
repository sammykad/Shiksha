import { randomUUID } from 'crypto';
import { PaymentMethod, PaymentStatus } from '@/generated/prisma/enums';
import { adminPrisma } from '@/lib/db';
import { syncFeeBalance } from '@/lib/data/fee/fee-balance';

const MIGRATION_NOTE = 'Opening payment record created from existing fee paid amount';

async function main() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const fees = await adminPrisma.fee.findMany({
    where: { paidAmount: { gt: 0 } },
    select: {
      id: true,
      paidAmount: true,
      organizationId: true,
      student: {
        select: {
          userId: true,
          parents: {
            where: { isPrimary: true },
            select: { parent: { select: { userId: true } } },
            take: 1,
          },
        },
      },
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        select: { amount: true, note: true },
      },
    },
  });

  let repaired = 0;
  let skipped = 0;

  for (const fee of fees) {
    const existingPaymentTotal = fee.payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const alreadyRepaired = fee.payments.some((payment) => payment.note === MIGRATION_NOTE);
    const missingAmount = Math.max((fee.paidAmount ?? 0) - existingPaymentTotal, 0);

    if (missingAmount <= 0 || alreadyRepaired) {
      skipped += 1;
      continue;
    }

    const payerId = fee.student.parents[0]?.parent.userId ?? fee.student.userId;
    if (!payerId) {
      throw new Error(`Cannot repair fee ${fee.id}: no student or parent user found for payerId`);
    }

    await adminPrisma.$transaction(async (tx) => {
      await tx.feePayment.create({
        data: {
          feeId: fee.id,
          amount: missingAmount,
          status: PaymentStatus.COMPLETED,
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date(),
          receiptNumber: `MIG-${fee.id.slice(-8).toUpperCase()}-${today}`,
          transactionId: `MIG-${fee.id}-${randomUUID()}`,
          payerId,
          organizationId: fee.organizationId,
          platformFee: 0,
          note: MIGRATION_NOTE,
        },
      });

      await syncFeeBalance(fee.id, tx);
    });

    repaired += 1;
  }

  console.log(`Fee payment repair complete. Repaired: ${repaired}. Skipped: ${skipped}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await adminPrisma.$disconnect();
  });

