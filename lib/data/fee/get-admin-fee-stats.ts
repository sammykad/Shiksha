'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationId } from '@/lib/organization';
import { getOrganizationFeeSummary } from './fee-balance';

export const getAdminFeesSummary = async () => {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  if (!academicYearId) {
    return {
      totalFees: 0,
      collectedFees: 0,
      pendingFees: 0,
      overdueFees: 0,
      totalStudents: 0,
      paidStudents: 0,
      unpaidStudents: 0,
    };
  }

  const summary = await getOrganizationFeeSummary(organizationId, academicYearId);

  return {
    totalFees: summary.totalAmount,
    collectedFees: summary.paidAmount,
    pendingFees: summary.dueAmount,
    overdueFees: summary.overdueAmount,
    totalStudents: summary.totalStudents,
    paidStudents: summary.paidStudents,
    unpaidStudents: summary.dueStudents,
  };
};
