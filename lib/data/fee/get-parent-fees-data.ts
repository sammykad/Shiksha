'use server';

import prisma from '@/lib/db';
import { getSelectedChildId } from '@/lib/data/parent/selected-child';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { FeeStatus, PaymentStatus, PaymentMethod } from '@/generated/prisma/enums';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserId } from '@/lib/user';

export type PendingFee = {
  id: string;
  feeCategoryName: string;
  dueDate: Date;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  status: FeeStatus;
};

export type PaymentRecord = {
  id: string;
  receiptNumber: string;
  feeCategoryName: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionId: string | null;
  platformFee: number | null;
  note: string | null;
  status: PaymentStatus;
  payerId: string;
  feeId: string;
  recordedBy: string | null;
  organizationName: string,
  createdAt: Date;
  updatedAt: Date;
  payer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  chequeDetail?: {
    chequeNumber: string;
    chequeDate: Date;
    bankName: string;
    status: string;
    bounceReason?: string | null;
  } | null;
};

export type ChildFeeData = {
  totalFees: number;
  paidFees: number;
  pendingFees: PendingFee[];
  paymentHistory: PaymentRecord[];
};


export async function getParentFeesData(): Promise<ChildFeeData | null> {
  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId()
  const [selectedChildId, academicYearId] = await Promise.all([
    getSelectedChildId(),
    getActiveAcademicYearId(),
  ]);

  if (!selectedChildId || !academicYearId) return null;

  // Verify ownership + fetch in one query
  const fees = await prisma.fee.findMany({
    where: {
      studentId: selectedChildId,
      organizationId,
      academicYearId,
      student: {
        organizationId,
        parents: { some: { parent: { userId, organizationId } } }, // ownership guard
      },
    },
    select: {
      id: true,
      totalFee: true,
      paidAmount: true,
      pendingAmount: true,
      dueDate: true,
      status: true,
      feeCategory: { select: { name: true } },
      organization: { select: { name: true } },
      payments: {
        orderBy: { paymentDate: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          paymentMethod: true,
          paymentDate: true,
          receiptNumber: true,
          transactionId: true,
          platformFee: true,
          note: true,
          payer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          payerId: true,
          feeId: true,
          recordedBy: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
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
      },
    },
  });

  if (!fees.length) return null;

  // Summary totals from ALL fees (including PAID)
  const totalFees = fees.reduce((sum, f) => sum + f.totalFee, 0);
  const paidFees = fees.reduce((sum, f) => sum + f.paidAmount, 0);

  const pendingFees: PendingFee[] = fees
    .filter((f) => f.status !== 'PAID')
    .map((f) => ({
      id: f.id,
      feeCategoryName: f.feeCategory.name,
      dueDate: f.dueDate,
      totalFee: f.totalFee,
      paidAmount: f.paidAmount,
      pendingAmount: f.pendingAmount ?? Math.max(0, f.totalFee - f.paidAmount),
      status: f.status as 'UNPAID' | 'OVERDUE',
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const paymentHistory: PaymentRecord[] = fees
    .flatMap((f) =>
      f.payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        organizationName: f.organization.name,
        feeCategoryName: f.feeCategory.name,
        amountPaid: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        transactionId: p.transactionId,
        platformFee: p.platformFee,
        note: p.note,
        status: p.status,
        payerId: p.payerId,
        feeId: p.feeId,
        recordedBy: p.recordedBy,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        payer: p.payer,
        chequeDetail: p.chequeDetail,
      }))
    )
    .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());

  return { totalFees, paidFees, pendingFees, paymentHistory };
}
