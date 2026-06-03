import { redirect } from 'next/navigation';
import { TrendingUp, Download, Book, School, Paperclip } from 'lucide-react';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ChildSwitcher } from '@/components/dashboard/parent/child-switcher';
import { StudentAttendanceCalendar } from '@/components/dashboard/StudentAttendance/attendance-calendar';
import { getChildAttendanceData } from '@/lib/data/attendance/get-child-attendance-data';
import { getActiveAcademicYear } from '@/lib/academicYear';

export default async function ChildAttendancePage() {
  const { orgRole } = await auth({
    organizationReturnUrl: '/dashboard/child-attendance',
  });
  if (orgRole !== 'PARENT') redirect('/dashboard');

  const childData = await getChildAttendanceData();

  if (!childData || !childData.student) {
    return (
      <main className="px-2 pb-6 flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          title="No Attendance Data"
          description="No student is linked to your account. Contact your institution administrator to link student profiles."
          icons={[Book, School, Paperclip]}
        />
      </main>
    );
  }

  const { attendanceData, holidayData, student } = childData;

  const activeAcademicYear = await getActiveAcademicYear();

  return (
    <main className="px-2 pb-6 space-y-4">
      <PageHeader
        title="Attendance"
        description={`${student.fullName || `${student.firstName} ${student.lastName}`} · ${student.grade.grade} · ${student.section.name}`}
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
