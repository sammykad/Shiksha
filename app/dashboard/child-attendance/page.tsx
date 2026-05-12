import { redirect } from 'next/navigation';
import { TrendingUp, Download } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ChildSwitcher } from '@/components/dashboard/parent/child-switcher';
import { StudentAttendanceCalendar } from '@/components/dashboard/StudentAttendance/attendance-calendar';
import { getChildAttendanceData } from '@/lib/data/attendance/get-child-attendance-data';
import { getActiveAcademicYear } from '@/lib/academicYear';

export default async function ChildAttendancePage() {
  const { orgRole } = await auth();
  if (orgRole !== 'org:parent') redirect('/dashboard');

  const childData = await getChildAttendanceData();

  if (!childData || !childData.student) redirect('/dashboard');

  const { attendanceData, holidayData, student } = childData;

  const activeAcademicYear = await getActiveAcademicYear();

  return (
    <main className="px-2 pb-6 space-y-4">
      <PageHeader
        title="Attendance"
        description={`${student.fullName ?? `${student.firstName} ${student.lastName}`} · ${student.grade.grade} · ${student.section.name}`}
        icon={TrendingUp}
        actions={
          <>
            <ChildSwitcher />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </>
        }
      />
      <StudentAttendanceCalendar
        attendanceRecords={attendanceData}
        academicCalendarEvents={holidayData}
        activeAcademicYear={activeAcademicYear}
      />
    </main>
  );
}