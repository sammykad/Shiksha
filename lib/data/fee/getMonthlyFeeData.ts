import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { eachMonthOfInterval, format } from 'date-fns';
import { PaymentStatus } from '@/generated/prisma/enums';
export interface MonthlyFeeData {
  label: string;
  year: number;
  month: number;
  amount: number;
  count: number;
  academicYearId: string;
}

export async function getMonthlyFeeData(): Promise<MonthlyFeeData[]> {
  const organizationId = await getOrganizationId();
  const activeAcademicYearId = await getActiveAcademicYearId();

  if (!activeAcademicYearId) return [];

  const academicYear = await prisma.academicYear.findUnique({
    where: { id: activeAcademicYearId },
    select: { id: true, startDate: true, endDate: true },
  });

  if (!academicYear) return [];

  const payments = await prisma.feePayment.findMany({
    where: {
      organizationId,
      status: PaymentStatus.COMPLETED,
      fee: {
        academicYearId: activeAcademicYearId,
      },
    },
    select: {
      amount: true,
      paymentDate: true,
    },
  });

  const fees = await prisma.fee.findMany({
    where: {
      organizationId,
      academicYearId: activeAcademicYearId,
    },
    select: {
      paidAmount: true,
      updatedAt: true,
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        select: { amount: true },
      },
    },
  });

  // Group payments by yyyy-MM
  const paymentTotals = new Map<string, { amount: number; count: number }>();

  for (const payment of payments) {
    const key = format(payment.paymentDate, 'yyyy-MM');
    const existing = paymentTotals.get(key) ?? { amount: 0, count: 0 };
    paymentTotals.set(key, {
      amount: existing.amount + (payment.amount ?? 0),
      count: existing.count + 1,
    });
  }

  for (const fee of fees) {
    const ledgerPaid = fee.payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const legacyCollectionWithoutPaymentRows = Math.max((fee.paidAmount ?? 0) - ledgerPaid, 0);

    if (legacyCollectionWithoutPaymentRows <= 0) continue;

    const key = format(fee.updatedAt, 'yyyy-MM');
    const existing = paymentTotals.get(key) ?? { amount: 0, count: 0 };
    paymentTotals.set(key, {
      amount: existing.amount + legacyCollectionWithoutPaymentRows,
      count: existing.count + 1,
    });
  }

  // Generate a slot for every month in the academic year (even empty ones)
  const months = eachMonthOfInterval({
    start: academicYear.startDate,
    end: academicYear.endDate,
  });

  return months.map((monthDate) => {
    const key = format(monthDate, 'yyyy-MM');
    const totals = paymentTotals.get(key);

    return {
      label: format(monthDate, 'MMM yy'),
      year: monthDate.getFullYear(),
      month: monthDate.getMonth() + 1,
      amount: totals?.amount ?? 0,
      count: totals?.count ?? 0,
      academicYearId: academicYear.id,
    };
  });
}

