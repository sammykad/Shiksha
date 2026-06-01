import { getActiveAcademicYearId } from "@/lib/academicYear";
import prisma from "@/lib/db";
import { getOrganizationId } from "@/lib/organization";
import { getCurrentUserId } from "@/lib/user";
import { toISTDate } from "@/lib/utils";
import { getFeesSummary } from "@/lib/data/fee/fee-balance";

export const getParentNotices = async () => {
    const [organizationId, userId, academicYearId] = await Promise.all([getOrganizationId(), getCurrentUserId(), getActiveAcademicYearId()])

    const notices = await prisma.notice.findMany({
        where: { organizationId, academicYearId, targetRoles: { has: 'PARENT' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    return notices;
}
export const getMyChildrenOverview = async () => {
    const [organizationId, userId, academicYearId] = await Promise.all([
        getOrganizationId(),
        getCurrentUserId(),
        getActiveAcademicYearId(),
    ]);

    const todayIST = toISTDate()

    const childrenOverview = await prisma.student.findMany({
        where: {
            organizationId,
            parents: { some: { parent: { userId, organizationId } } },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            profileImage: true,
            rollNumber: true,
            grade: { select: { id: true, grade: true } },
            section: { select: { id: true, name: true } },
            StudentAttendance: {
                where: {
                    academicYearId,
                    date: todayIST, // ✅ range instead of exact date
                },
                select: { status: true, date: true },
                take: 1, // only need today's record
            },
            Fee: {
                where: { organizationId, academicYearId },
                select: {
                    totalFee: true,
                    dueDate: true,
                    payments: { select: { amount: true, status: true } },
                },
            },
        },
    });

    return childrenOverview.map((child) => ({
        ...child,
        todayAttendance: (child.StudentAttendance[0]?.status as string) ?? "NOT_MARKED",
        pendingFees: getFeesSummary(child.Fee).dueAmount,
    }));
};

export async function getAttendanceSummaryForChild(
    studentId: string,
    months = 6
) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get all attendance records for the period
    const attendanceRecords = await prisma.studentAttendance.findMany({
        where: {
            studentId,
            date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
    });

    // Get student info
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            grade: true,
            section: true,
        },
    });

    // Group by month for monthly stats
    const monthlyStats = new Map();
    const weeklyStats = new Map();
    const dailyPattern = new Map(); // Day of week pattern

    attendanceRecords.forEach((record) => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const weekKey = getWeekKey(date);
        const dayOfWeek = date.getDay();

        // Monthly stats
        if (!monthlyStats.has(monthKey)) {
            monthlyStats.set(monthKey, { total: 0, present: 0, absent: 0, late: 0 });
        }
        const monthStat = monthlyStats.get(monthKey);
        monthStat.total++;
        if (record.status === 'PRESENT') monthStat.present++;
        else if (record.status === 'ABSENT') monthStat.absent++;
        if (record.status === 'LATE') monthStat.late++;

        // Weekly stats
        if (!weeklyStats.has(weekKey)) {
            weeklyStats.set(weekKey, {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                weekStart: getWeekStart(date),
            });
        }
        const weekStat = weeklyStats.get(weekKey);
        weekStat.total++;
        if (record.status === 'PRESENT') weekStat.present++;
        else if (record.status === 'ABSENT') weekStat.absent++;
        if (record.status === 'LATE') weekStat.late++;

        // Daily pattern (0 = Sunday, 1 = Monday, etc.)
        if (!dailyPattern.has(dayOfWeek)) {
            dailyPattern.set(dayOfWeek, { total: 0, present: 0 });
        }
        const dayPattern = dailyPattern.get(dayOfWeek);
        dayPattern.total++;
        if (record.status === 'PRESENT') dayPattern.present++;
        if (record.status === 'LATE') dayPattern.present++;
    });

    // Convert maps to arrays and calculate percentages
    const monthlyData = Array.from(monthlyStats.entries()).map(([key, stats]) => {
        const [year, month] = key.split('-').map(Number);
        return {
            month: new Date(year, month).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            }),
            total: stats.total,
            present: stats.present,
            absent: stats.absent,
            late: stats.late,
            percentage: stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0,
        };
    });

    const weeklyData = Array.from(weeklyStats.entries())
        .map(([key, stats]) => ({
            week: key,
            ...stats,
            percentage:
                stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0,
        }))
        .sort(
            (a, b) =>
                new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
        );

    const dayPatternData = Array.from(dailyPattern.entries())
        .map(([day, stats]) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
            dayNumber: day,
            ...stats,
            percentage:
                stats.total > 0 ? Math.round(((stats.present) / stats.total) * 100) : 0,
        }))
        .sort((a, b) => a.dayNumber - b.dayNumber);

    // Calculate overall stats
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const lateDays = attendanceRecords.filter((r) => r.status === 'LATE').length;
    const absentDays = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    
    const overallPercentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

    return {
        student,
        overallStats: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            percentage: overallPercentage,
        },
        monthlyData,
        weeklyData,
        dayPatternData,
        recentRecords: attendanceRecords.slice(-30), // Last 30 records
    };
}

function getWeekKey(date: Date): string {
    const weekStart = getWeekStart(date);
    return weekStart.toISOString().split('T')[0];
}

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}
