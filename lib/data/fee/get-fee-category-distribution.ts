'use server';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { PaymentStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getFeeBalance } from './fee-balance';

export const getFeeCategoryDistribution = async () => {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  if (!academicYearId) return [];

  const fees = await prisma.fee.findMany({
    where: {
      organizationId,
      academicYearId,
    },
    select: {
      feeCategoryId: true,
      totalFee: true,
      dueDate: true,
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        select: { amount: true, status: true },
      },
    },
  });

  const categories = await prisma.feeCategory.findMany({
    where: {
      id: { in: Array.from(new Set(fees.map((fee) => fee.feeCategoryId))) },
      organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const categoryTotals = new Map<string, { paidAmount: number; pendingAmount: number }>();

  for (const fee of fees) {
    const balance = getFeeBalance(fee);
    const current = categoryTotals.get(fee.feeCategoryId) ?? { paidAmount: 0, pendingAmount: 0 };
    categoryTotals.set(fee.feeCategoryId, {
      paidAmount: current.paidAmount + balance.paidAmount,
      pendingAmount: current.pendingAmount + balance.dueAmount,
    });
  }

  const data = Array.from(categoryTotals.entries()).map(([feeCategoryId, totals]) => {
    const category = categories.find((c) => c.id === feeCategoryId);
    return {
      name: category?.name ?? 'Unknown',
      paidAmount: totals.paidAmount,
      pendingAmount: totals.pendingAmount,
    };
  });

  return data;
};
