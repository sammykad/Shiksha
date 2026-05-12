import { Suspense } from 'react';
import { StudentDashboardStatsCards } from './StudentDashboardStatsCards';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import prisma from '@/lib/db';
import StudentSubjectsRadar from './student-subjects-radar';
import { FeesQuickCard } from './FeesQuickCard';
import { CreditCard, Download, MessageSquare, Zap } from 'lucide-react';
import { getStudentNotices } from '@/lib/data/notice/get-student-notices';
import { getStudentPerformance } from '@/lib/data/student/get-student-performance';
import { getFeesStatus } from '@/lib/data/student/get-fees-status';
import { getCurrentUserByRole } from '@/lib/auth';
import { getOrganizationId } from '@/lib/organization';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { NoticesWidget } from '../parent/notices-widget';

const quickActions = [
  {
    title: 'Pay Fees',
    description: 'Online payments',
    icon: CreditCard,
    color:
      'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
    link: '/dashboard/fees/student',
  },
  {
    title: 'Download Receipt',
    description: 'Payment receipts',
    icon: Download,
    color:
      'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    link: '/dashboard/fees/student',
  },
  {
    title: 'Submit Complaint',
    description: 'Report issues',
    icon: MessageSquare,
    color:
      'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400',
    link: '/dashboard/anonymous-complaints',
  },
];

function QuickActionCard({ action }: { action: (typeof quickActions)[0] }) {
  return (
    <Link href={action.link} aria-label={action.title}>
      <Card className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.03] border-slate-200/60 dark:border-slate-700/60">
        <CardHeader className="flex flex-row items-center gap-3 p-4">
          <div
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
              action.color
            )}
          >
            <action.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {action.title}
            </CardTitle>
            <CardDescription className="text-sm truncate">
              {action.description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

const StudentDashboard = async () => {
  const [recentNotices, currentUser] = await Promise.all([
    getStudentNotices(),
    getCurrentUserByRole(),
  ]);

  if (currentUser.role !== 'STUDENT') {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg">
        Only students can access this page.
      </div>
    );
  }

  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getActiveAcademicYearId(),
  ]);
  const studentId = currentUser.studentId;
  const [student, feesData, performanceData, examSessions] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true },
    }),
    getFeesStatus(studentId),
    getStudentPerformance(studentId),
    prisma.examSession.findMany({
      where: { organizationId, academicYearId },
      select: { id: true, title: true, academicYearId: true },
      orderBy: { startDate: 'desc' },
    }),
  ]);

  const studentName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim();

  return (
    <div className="space-y-6 px-2">
      <StudentDashboardStatsCards studentId={currentUser.studentId} />


      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 min-w-0 flex flex-col gap-6">
          <div className="self-start w-full">
            <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-xl" />}>
              <StudentSubjectsRadar
                role="STUDENT"
                studentName={studentName}
                examResults={performanceData.examResults}
                reportCards={performanceData.reportCards}
                examSessions={examSessions}
                activeAcademicYearId={academicYearId}
              />
            </Suspense>

          </div>
          <Card className="overflow-hidden flex-1 flex flex-col">
            <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-950/20 dark:to-teal-950/20 rounded-t-lg border-b border-purple-200/30 dark:border-purple-800/30">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Frequently used features and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-1">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} action={action} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 min-w-0 flex flex-col gap-6 min-h-0">
          <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-xl" />}>
            <NoticesWidget notices={recentNotices} maxHeight={320} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-xl" />}>
            <FeesQuickCard feesData={feesData} className="flex-1" />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
