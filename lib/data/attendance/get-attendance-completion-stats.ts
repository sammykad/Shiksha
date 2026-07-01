import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { toISTDate } from '@/lib/utils';
import { SectionAttendanceDetails, StudentAnalytics } from '@/types/attendance-analytics';

function calculatePercentage(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

export async function getAttendanceCompletionStats(
  date: Date = new Date(),
  options: { page?: number; pageSize?: number } = {}
) {
  const { page = 1, pageSize = 50 } = options;
  const organizationId = await getOrganizationId();
  const istDate = toISTDate(date);

  // Lightweight global stats — separate count queries, no student data loaded
  const [totalSections, totalStudents, todayAttendanceCount, completedSections, sections] = await Promise.all([
    prisma.section.count({ where: { organizationId } }),
    prisma.student.count({ where: { organizationId } }),
    prisma.studentAttendance.count({
      where: {
        date: istDate,
        status: { in: ['PRESENT', 'LATE'] },
        section: { organizationId },
      },
    }),
    // Sections where every student has an attendance record for the date
    prisma.section.count({
      where: {
        organizationId,
        students: {
          some: { id: { gt: '' } },
          none: {
            StudentAttendance: { none: { date: istDate } },
          },
        },
      },
    }),
    prisma.section.findMany({
      where: { organizationId },
      include: {
        grade: { select: { grade: true } },
        students: {
          select: { id: true, firstName: true, lastName: true, rollNumber: true },
        },
        StudentAttendance: {
          where: { date: istDate },
          select: { studentId: true, status: true, note: true, recordedBy: true },
        },
      },
      orderBy: [{ grade: { grade: 'asc' } }, { name: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const sectionData: SectionAttendanceDetails[] = sections.map((section) => {
    const totalStudentsInSection = section.students.length;

    const attendanceMap = new Map<string, (typeof section.StudentAttendance)[number]>();
    for (const a of section.StudentAttendance) {
      attendanceMap.set(a.studentId, a);
    }

    const recordedCount = attendanceMap.size;
    const presentCount = Array.from(attendanceMap.values()).filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;

    const completionPercentage = calculatePercentage(recordedCount, totalStudentsInSection);
    const reportedBy = section.StudentAttendance[0]?.recordedBy ?? 'Not recorded';

    const status = completionPercentage === 100
      ? 'completed'
      : completionPercentage > 0
        ? 'in-progress'
        : 'pending';

    const students: StudentAnalytics[] = section.students.map((student) => {
      const attendance = attendanceMap.get(student.id);
      const attendanceStatus: StudentAnalytics['attendanceStatus'] = attendance
        ? attendance.status as StudentAnalytics['attendanceStatus']
        : 'NOT_MARKED';

      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber || 'N/A',
        attendanceStatus,
        note: attendance?.note ?? undefined,
      };
    });

    return {
      id: section.id,
      section: section.name,
      grade: section.grade.grade,
      date: istDate,
      reportedBy,
      status: status as SectionAttendanceDetails['status'],
      percentage: completionPercentage,
      studentsPresent: presentCount,
      totalStudents: totalStudentsInSection,
      students,
    };
  });

  return {
    sections: sectionData,
    stats: {
      totalSections,
      completedSections,
      pendingSections: totalSections - completedSections,
      totalStudents,
      totalPresent: todayAttendanceCount,
      completionPercentage: calculatePercentage(completedSections, totalSections),
      attendancePercentage: calculatePercentage(todayAttendanceCount, totalStudents),
      totalPages: Math.ceil(totalSections / pageSize),
      currentPage: page,
    },
  };
}
