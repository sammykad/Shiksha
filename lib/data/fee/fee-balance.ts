export {
  getInFlightPdcAmount,
  getMaxCollectible,
  getFeeBalance,
  getFeesSummary,
  type FeeForBalance,
  type FeeBalance,
  type FeesSummary,
} from './fee-balance-utils';

import prisma from '@/lib/db';
import { getFeeBalance, getFeesSummary, type FeeForBalance } from './fee-balance-utils';

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
