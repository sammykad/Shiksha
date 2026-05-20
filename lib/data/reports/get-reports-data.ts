'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import type {
    StudentReportData,
    AttendanceReportData,
    GradeOption,
    SectionOption,
    ReportFilters,
    StaffReportData,
} from '@/types/reports';

/**
 * Get grades and sections for filter dropdowns
 */
export async function getGradesAndSections(): Promise<{
    grades: GradeOption[];
    sections: SectionOption[];
}> {
    const organizationId = await getOrganizationId();

    const [grades, sections] = await Promise.all([
        prisma.grade.findMany({
            where: { organizationId },
            select: { id: true, grade: true },
            orderBy: { grade: 'asc' },
        }),
        prisma.section.findMany({
            where: { organizationId },
            select: { id: true, name: true, gradeId: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    return {
        grades: grades.map((g) => ({ id: g.id, name: g.grade })),
        sections: sections.map((s) => ({
            id: s.id,
            name: s.name,
            gradeId: s.gradeId,
        })),
    };
}

/**
 * Get student master list data for report generation
 */
export async function getStudentMasterListData(
    filters?: ReportFilters
): Promise<StudentReportData[]> {
    const organizationId = await getOrganizationId();

    const students = await prisma.student.findMany({
        where: {
            organizationId,
            ...(filters?.gradeId && { gradeId: filters.gradeId }),
            ...(filters?.sectionId && { sectionId: filters.sectionId }),
        },
        select: {
            id: true,
            rollNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            whatsAppNumber: true,
            gender: true,
            dateOfBirth: true,
            createdAt: true,
            grade: {
                select: { grade: true },
            },
            section: {
                select: { name: true },
            },
            parents: {
                where: { isPrimary: true },
                select: {
                    parent: {
                        select: {
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                        },
                    },
                },
                take: 1,
            },
        },
        orderBy: [{ grade: { grade: 'asc' } }, { section: { name: 'asc' } }, { rollNumber: 'asc' }],
    });

    return students.map((student) => ({
        id: student.id,
        rollNumber: student.rollNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        whatsAppNumber: student.whatsAppNumber,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        grade: student.grade.grade,
        section: student.section.name,
        parentName: student.parents[0]
            ? `${student.parents[0].parent.firstName} ${student.parents[0].parent.lastName}`
            : undefined,
        parentPhone: student.parents[0]?.parent.phoneNumber,
        createdAt: student.createdAt,
    }));
}

/**
 * Get attendance summary report data
 */
export async function getAttendanceReportData(
    filters?: ReportFilters
): Promise<AttendanceReportData[]> {
    const organizationId = await getOrganizationId();
    const academicYearId = await getActiveAcademicYearId();

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (filters?.dateRange?.from) {
        dateFilter.gte = filters.dateRange.from;
    }
    if (filters?.dateRange?.to) {
        dateFilter.lte = filters.dateRange.to;
    }

    // Get all students with their attendance
    const students = await prisma.student.findMany({
        where: {
            organizationId,
            ...(filters?.gradeId && { gradeId: filters.gradeId }),
            ...(filters?.sectionId && { sectionId: filters.sectionId }),
        },
        select: {
            id: true,
            rollNumber: true,
            firstName: true,
            lastName: true,
            grade: { select: { grade: true } },
            section: { select: { name: true } },
            StudentAttendance: {
                where: {
                    ...(academicYearId && { academicYearId }),
                    ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
                },
                select: {
                    status: true,
                },
            },
        },
        orderBy: [{ grade: { grade: 'asc' } }, { section: { name: 'asc' } }, { rollNumber: 'asc' }],
    });

    return students.map((student) => {
        const totalDays = student.StudentAttendance.length;
        const presentDays = student.StudentAttendance.filter(
            (a) => a.status === 'PRESENT' || a.status === 'LATE'
        ).length;
        const lateDays = student.StudentAttendance.filter((a) => a.status === 'LATE').length;
        const absentDays = student.StudentAttendance.filter((a) => a.status === 'ABSENT').length;

        return {
            studentId: student.id,
            rollNumber: student.rollNumber,
            studentName: `${student.firstName} ${student.lastName}`,
            grade: student.grade.grade,
            section: student.section.name,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
        };
    });
}

/**
 * Get report stats for the reports hub
 */
export async function getReportStats() {
    const organizationId = await getOrganizationId();

    const [totalStudents, totalTeachers, totalGrades] = await Promise.all([
        prisma.student.count({ where: { organizationId } }),
        prisma.teacher.count({ where: { organizationId } }),
        prisma.grade.count({ where: { organizationId } }),
    ]);

    return {
        totalStudents,
        totalTeachers,
        totalGrades,
    };
}

/**
 * Get staff directory data for report generation
 */
export async function getStaffDirectoryData(): Promise<StaffReportData[]> {
    const organizationId = await getOrganizationId();

    const staffRecords = await prisma.user.findMany({
        where: {
            isActive: true,
            memberships: {
                some: {
                    organizationId,
                    status: 'ACTIVE',
                    role: { in: ['ADMIN', 'TEACHER'] },
                },
            },
        },
        include: {
            memberships: {
                where: {
                    organizationId,
                    status: 'ACTIVE',
                },
                select: {
                    role: true,
                },
            },
            teacher: {
                where: { organizationId },
                include: {
                    profile: true,
                },
            },
        },
    });

    const staff = staffRecords.map((member) => {
        const activeMembership = member.memberships[0];
        if (!activeMembership) {
            throw new Error(`Critical: User ${member.id} has no active membership in organization ${organizationId}`);
        }

        return {
            id: member.id,
            employeeCode: member.teacher?.employeeCode || undefined,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            role: activeMembership.role,
            phone: member.teacher?.profile?.contactPhone || '-',
            employmentStatus: member.teacher?.employmentStatus || 'ACTIVE',
            joinedAt: member.teacher?.profile?.joinedAt || undefined,
            qualification: member.teacher?.profile?.qualification || '-',
            isActive: member.isActive,
        };
    });

    const ROLE_PRIORITY: Record<string, number> = {
        ADMIN: 1,
        TEACHER: 2,
    };

    // Sort by role hierarchy (ADMIN before TEACHER) and then by firstName
    staff.sort((a, b) => {
        const priorityA = ROLE_PRIORITY[a.role] ?? 99;
        const priorityB = ROLE_PRIORITY[b.role] ?? 99;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return a.firstName.localeCompare(b.firstName);
    });

    return staff;
}
