import { FeeStatus, PaymentStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/db';

type FeePaymentForBalance = {
  amount: number | null;
  status: PaymentStatus | string;
};

export type FeeForBalance = {
  id?: string;
  totalFee: number | null;
  dueDate: Date;
  payments?: FeePaymentForBalance[] | null;
};

export type FeeBalance = {
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: FeeStatus;
  collectionPercent: number;
};

export type FeesSummary = FeeBalance & {
  totalFeesCount: number;
  paidFeesCount: number;
  dueFeesCount: number;
  overdueAmount: number;
  overdueFeesCount: number;
  totalStudents: number;
  paidStudents: number;
  dueStudents: number;
};

function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function getFeeBalance(fee: FeeForBalance, now = new Date()): FeeBalance {
  const totalAmount = Math.max(roundMoney(fee.totalFee ?? 0), 0);
  const rawPaidAmount = (fee.payments ?? []).reduce((sum, payment) => {
    if (payment.status !== PaymentStatus.COMPLETED) return sum;
    return sum + Math.max(payment.amount ?? 0, 0);
  }, 0);
  const paidAmount = roundMoney(Math.min(rawPaidAmount, totalAmount));
  const dueAmount = roundMoney(Math.max(totalAmount - paidAmount, 0));
  const status =
    dueAmount === 0
      ? FeeStatus.PAID
      : fee.dueDate < now
        ? FeeStatus.OVERDUE
        : FeeStatus.UNPAID;

  return {
    totalAmount,
    paidAmount,
    dueAmount,
    status,
    collectionPercent: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
  };
}

export function getFeesSummary<T extends FeeForBalance & { studentId?: string | null }>(
  fees: T[],
  now = new Date(),
): FeesSummary {
  let totalAmount = 0;
  let paidAmount = 0;
  let dueAmount = 0;
  let paidFeesCount = 0;
  let dueFeesCount = 0;
  let overdueAmount = 0;
  let overdueFeesCount = 0;
  const studentDueAmounts = new Map<string, number>();

  for (const fee of fees) {
    const balance = getFeeBalance(fee, now);
    totalAmount += balance.totalAmount;
    paidAmount += balance.paidAmount;
    dueAmount += balance.dueAmount;

    if (balance.dueAmount <= 0) paidFeesCount += 1;
    else dueFeesCount += 1;

    if (balance.status === FeeStatus.OVERDUE) {
      overdueAmount += balance.dueAmount;
      overdueFeesCount += 1;
    }

    if (fee.studentId) {
      studentDueAmounts.set(
        fee.studentId,
        (studentDueAmounts.get(fee.studentId) ?? 0) + balance.dueAmount,
      );
    }
  }

  const totalStudents = studentDueAmounts.size;
  const paidStudents = Array.from(studentDueAmounts.values()).filter((amount) => amount <= 0).length;

  return {
    totalAmount,
    paidAmount,
    dueAmount,
    status: dueAmount === 0 ? FeeStatus.PAID : overdueAmount > 0 ? FeeStatus.OVERDUE : FeeStatus.UNPAID,
    collectionPercent: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
    totalFeesCount: fees.length,
    paidFeesCount,
    dueFeesCount,
    overdueAmount,
    overdueFeesCount,
    totalStudents,
    paidStudents,
    dueStudents: Math.max(totalStudents - paidStudents, 0),
  };
}

export async function getStudentFeeSummary(studentId: string, now = new Date()) {
  const fees = await prisma.fee.findMany({
    where: { studentId },
    select: feeBalanceSelect,
  });

  return getFeesSummary(fees, now);
}

export async function getOrganizationFeeSummary(
  organizationId: string,
  academicYearId: string,
  now = new Date(),
) {
  const fees = await prisma.fee.findMany({
    where: { organizationId, academicYearId },
    select: feeBalanceSelect,
  });

  return getFeesSummary(fees, now);
}

export async function syncFeeBalance(feeId: string, client: any = prisma) {
  const fee = await client.fee.findUnique({
    where: { id: feeId },
    select: feeBalanceSelect,
  });

  if (!fee) throw new Error('Fee not found');

  const balance = getFeeBalance(fee);

  await client.fee.update({
    where: { id: feeId },
    data: {
      paidAmount: balance.paidAmount,
      pendingAmount: balance.dueAmount,
      status: balance.status,
    },
  });

  return balance;
}

export async function syncOrganizationFeeBalances(
  organizationId: string,
  academicYearId: string,
  client: any = prisma,
) {
  const fees = await client.fee.findMany({
    where: { organizationId, academicYearId },
    select: feeBalanceSelect,
  });

  for (const fee of fees) {
    await syncFeeBalance(fee.id, client);
  }

  return getFeesSummary(fees);
}

export const feeBalanceSelect = {
  id: true,
  totalFee: true,
  dueDate: true,
  studentId: true,
  payments: {
    select: {
      amount: true,
      status: true,
    },
  },
} as const;
