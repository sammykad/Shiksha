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
  const { page = 1, pageSize = 50 } = options; // Default pageSize to 50 for analytics
  const organizationId = await getOrganizationId();
  const istDate = toISTDate(date);


  // Fetch all sections with basic info and attendance for the date
  // This allows us to calculate global stats and then slice for pagination
  const allSections = await prisma.section.findMany({
    where: { organizationId },
    include: {
      grade: {
        select: { grade: true },
      },
      students: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
      StudentAttendance: {
        where: {
          date: istDate
        },
        select: {
          studentId: true,
          status: true,
          note: true,
          recordedBy: true,
        },
      },
    },
    orderBy: [
      { grade: { grade: 'asc' } },
      { name: 'asc' }
    ]
  });

  let globalTotalStudents = 0;
  let globalTotalPresent = 0;
  let globalCompletedSections = 0;

  const sectionData = allSections.map((section) => {
    const totalStudents = section.students.length;
    globalTotalStudents += totalStudents;

    // Deduplicate attendance records by studentId
    const attendanceMap = new Map<string, any>();
    section.StudentAttendance.forEach((a) => attendanceMap.set(a.studentId, a));

    const recordedCount = attendanceMap.size;
    const presentCount = Array.from(attendanceMap.values()).filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    globalTotalPresent += presentCount;



    const completionPercentage = calculatePercentage(recordedCount, totalStudents);
    const reportedBy = section.StudentAttendance[0]?.recordedBy ?? 'Not recorded';

    // Determine status
    const status = completionPercentage === 100
      ? 'completed'
      : completionPercentage > 0
        ? 'in-progress'
        : 'pending';

    if (status === 'completed') {
      globalCompletedSections++;
    }

    // Map students with their attendance status
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
        note: attendance?.note,
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
      totalStudents,
      students,
    };
  });

  const totalSections = allSections.length;
  const paginatedSections = sectionData.slice((page - 1) * pageSize, page * pageSize);

  return {
    sections: paginatedSections,
    stats: {
      totalSections,
      completedSections: globalCompletedSections,
      pendingSections: totalSections - globalCompletedSections,
      totalStudents: globalTotalStudents,
      totalPresent: globalTotalPresent,
      completionPercentage: calculatePercentage(
        globalCompletedSections,
        totalSections
      ),
      attendancePercentage: calculatePercentage(
        globalTotalPresent,
        globalTotalStudents
      ),
      totalPages: Math.ceil(totalSections / pageSize),
      currentPage: page,
    },
  };
}
