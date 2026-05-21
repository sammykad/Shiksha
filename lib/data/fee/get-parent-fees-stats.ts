'use server';

import prisma from '@/lib/db';
import { getSelectedChildId } from '@/lib/data/parent/selected-child';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserId } from '@/lib/user';
import { getStartOfMonthIST, getStartOfNextMonthIST, formatInIST } from '@/lib/utils';

export type SelectedChildStats = {
    feeSummary: {
        total: number;
        paid: number;
        pending: number;
        percentPaid: number;
    };
    attendanceSummary: {
        percentPresent: number;
        month: string;
    };
};

export type FamilyStats = {
    familyTotalFees: number;
    totalChildren: number;
};

const EMPTY_SELECTED: SelectedChildStats = {
    feeSummary: { total: 0, paid: 0, pending: 0, percentPaid: 0 },
    attendanceSummary: { percentPresent: 0, month: '' },
};

const EMPTY_FAMILY: FamilyStats = {
    familyTotalFees: 0,
    totalChildren: 0,
};

export async function getParentFeesStats(): Promise<[SelectedChildStats, FamilyStats]> {
    const userId = await getCurrentUserId();
    const organizationId = await getOrganizationId();
    const [selectedChildId, academicYearId] = await Promise.all([
        getSelectedChildId(),
        getActiveAcademicYearId(),
    ]);

    if (!selectedChildId || !academicYearId) return [EMPTY_SELECTED, EMPTY_FAMILY];

    const monthStart = getStartOfMonthIST();       // IST-safe midnight UTC
    const monthEnd = getStartOfNextMonthIST();     // exclusive upper bound (use lt: monthEnd)
    const month = formatInIST(new Date(), 'MMMM yyyy'); // "March 2026" in IST

    const [selectedChildFees, attendanceStats, familyFees, childCount] = await Promise.all([
        prisma.fee.aggregate({
            where: {
                studentId: selectedChildId,
                organizationId,
                academicYearId,
                student: {
                    organizationId,
                    parents: { some: { parent: { userId, organizationId } } },
                },
            },
            _sum: { totalFee: true, paidAmount: true },
        }),

        prisma.studentAttendance.groupBy({
            by: ['status'],
            where: {
                studentId: selectedChildId,
                student: { organizationId },
                date: { gte: monthStart, lt: monthEnd }, // lt instead of lte endOfMonth
            },
            _count: { status: true },
        }),

        prisma.fee.aggregate({
            where: {
                organizationId,
                academicYearId,
                student: {
                    organizationId,
                    parents: { some: { parent: { userId, organizationId } } },
                },
            },
            _sum: { totalFee: true },
        }),

        prisma.parentStudent.count({
            where: {
                parent: { userId, organizationId },
                student: { organizationId },
            },
        }),
    ]);

    const total = selectedChildFees._sum.totalFee ?? 0;
    const paid = selectedChildFees._sum.paidAmount ?? 0;
    const pending = Math.max(0, total - paid);
    const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;

    const presentCount = attendanceStats
        .filter((r) => r.status === 'PRESENT' || r.status === 'LATE')
        .reduce((sum, r) => sum + r._count.status, 0);

    const totalDays = attendanceStats.reduce((sum, r) => sum + r._count.status, 0);
    const percentPresent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

    return [
        {
            feeSummary: { total, paid, pending, percentPaid },
            attendanceSummary: { percentPresent, month },
        },
        {
            familyTotalFees: familyFees._sum.totalFee ?? 0,
            totalChildren: childCount,
        },
    ];
}
