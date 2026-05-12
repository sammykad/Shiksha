'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { toISTDate } from '@/lib/utils';

export async function getStudentsForRecording(sectionId: string) {
    const organizationId = await getOrganizationId();
    const academicYearId = await getActiveAcademicYearId();
    const today = toISTDate(new Date());

    // 1. Fetch all students in the section
    const students = await prisma.student.findMany({
        where: {
            organizationId,
            sectionId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            rollNumber: true,
            profileImage: true,
        },
        orderBy: {
            firstName: 'asc',
        },
    });

    // 2. Fetch today's attendance for this section
    const attendanceRecords = await prisma.studentAttendance.findMany({
        where: {
            sectionId,
            date: today,
            academicYearId,
        },
        select: {
            studentId: true,
            status: true,
        },
    });

    const attendanceMap = new Map(
        attendanceRecords.map((r) => [r.studentId, r.status])
    );

    // 3. Map students and identify absentees
    return students.map((student) => ({
        id: student.id,
        name: student.fullName || `${student.firstName} ${student.lastName}`,
        rollNo: student.rollNumber || 'N/A',
        profileImage: student.profileImage,
        isAbsent: attendanceMap.get(student.id) === 'ABSENT',
    }));
}
