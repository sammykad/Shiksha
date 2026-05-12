import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, IndianRupeeIcon, Bell, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { AttendanceSummaryCard } from '@/components/dashboard/parent/attendance-summary-card';
import { FeesSummaryCard } from '@/components/dashboard/parent/fees-summary-card';
import { ChildrenOverviewCard } from '@/components/dashboard/parent/children-overview-card';
import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ChildSwitcher } from './child-switcher';
import { getParentNotices } from '@/lib/data/parent/parent-dashboard';
import { TodayTimeline } from './today-timeline';
import TransportMap from './transport-map';
import { NoticesWidget } from './notices-widget';

export default async function ParentDashboard() {
  const notices = await getParentNotices()
  return (
    <main className="px-2 space-y-3">
      <PageHeader
        title="Parent Dashboard"
        description="Monitor your children's academic progress and school activities"
        icon={LayoutDashboard}
        actions={
          <>
            <ChildSwitcher />
            {/* <Link href="/dashboard/my-children" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                My Children
              </Button>
            </Link> */}
            <Link href="/dashboard/fees/parent" className="w-full sm:w-auto">
              <Button size="sm" className="w-full">
                <IndianRupeeIcon className="w-4 h-4 mr-2" />
                Pay Fees
              </Button>
            </Link>
          </>
        }
      />
      {/* Main Content Grid */}
      <div className="grid gap-3 lg:grid-cols-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-3">
          <ChildrenOverviewCard />
          <AttendanceSummaryCard />
          <TransportMap
            height={500}
            className="w-full rounded-lg border "
            showFullscreen
            // showRotate 
            showLocate
          />

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <FeesSummaryCard />
          <TodayTimeline />

          <Suspense fallback={<RecentNoticesSkeleton />}>
            <NoticesWidget notices={notices} />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Link href="/dashboard/child-attendance">
              <Button variant="outline" className="w-full justify-start h-10">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                Attendance
              </Button>
            </Link>
            <Link href="/dashboard/fees/parent">
              <Button variant="outline" className="w-full justify-start h-10">
                <IndianRupeeIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                Pay Fees
              </Button>
            </Link>
            <Link href="/dashboard/notices">
              <Button variant="outline" className="w-full justify-start h-10">
                <Bell className="w-4 h-4 mr-2 text-muted-foreground" />
                Notices
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start h-10">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function RecentNoticesSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 bg-muted rounded w-32"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


// PhaseWhat's liveDashboard showsNowFees + Attendance + Exams + NoticesFull dashboard as built+TransportBus trackingLive bus ETA in Hero + Timeline+TimetableClass scheduleToday's classes in Timeline + LMSAssignmentsPending assignments pill + Timeline entry + BiometricEntry / exitExact timestamps in Hero + Timeline + AI ReportsPerformance trendsTrend arrows on stat pills + ChatTeacher messagesUnread badge on Quick Actions + HallTicketExam admit cardsConditional button in Hero during exam season