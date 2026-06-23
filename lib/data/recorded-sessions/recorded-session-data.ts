'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { toISTDate } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { notify } from '@/lib/notifications/notify';

export async function sendRecordedSessionAction(data: {
  studentIds: string[];
  title: string;
  videoUrl: string;
  message?: string;
}) {
  const { user } = await auth();
  const teacherName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Teacher';

  const result = await notify.recordedSession.shared({
    sessionId: `share:${Date.now()}`,
    recipients: data.studentIds.map((id) => ({ studentId: id })),
    channels: ['WHATSAPP'],
    variables: {
      title: data.title,
      videoUrl: data.videoUrl,
      teacherName,
      message: data.message,
    },
  });

  return { success: result.ok, sent: result.totalSent, failed: result.totalFailed };
}

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
