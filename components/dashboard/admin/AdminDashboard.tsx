import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MonthlyFeeCollection } from '@/components/dashboard/Fees/MonthlyFeeCollection';
import { getMonthlyFeeData } from '@/lib/data/fee/getMonthlyFeeData';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import AdminQuickActions from '@/components/dashboard/admin/AdminQuickActions';
import AdminDashboardCards from '@/components/dashboard/admin/AdminDashboardCards';
import AdminRecentActivity from '@/components/dashboard/admin/RecentActivity';
import { getRecentAdminActivities } from '@/lib/data/admin/get-recent-activities';
import { getAdminNotices } from '@/lib/data/notice/get-admin-notices';
import { getComplaintsWithFilters } from '@/lib/data/complaints/complaint-actions';
import AiMonthlyReport from '@/components/dashboard/reports/AiMonthlyReport';
import { NoticesWidget } from '../parent/notices-widget';
import { ComplaintsWidget } from './complaints-widget';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard = async () => {
  const [activeAcademicYearId, data, activities, recentAdminNotices, complaintsRes] = await Promise.all([
    getActiveAcademicYearId(),
    getMonthlyFeeData(),
    getRecentAdminActivities(),
    getAdminNotices(),
    getComplaintsWithFilters({ page: 1, sort: 'submittedAt', order: 'desc' })
  ]);
  const recentComplaints = complaintsRes.complaints.slice(0, 5);

  return (
    <div className="space-y-6 px-2">
      <Card className="py-4 px-2 flex items-center justify-between   ">
        <div>
          <CardTitle className="text-lg">Admin Dashboard</CardTitle>
          <CardDescription className="text-sm">
            Dashboard for admin to manage the system
          </CardDescription>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <div className="">
            <AiMonthlyReport data={data.filter(d => d.academicYearId === activeAcademicYearId)} />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.8} />
                Quick Actions
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Quick Actions</DialogTitle>
                <DialogDescription>
                  Jump to any part of the system.
                </DialogDescription>
              </DialogHeader>
              <AdminQuickActions />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <AdminDashboardCards />
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-12 items-stretch">
        {/* Left Column - Charts */}
        <div className="xl:col-span-8 flex flex-col gap-4 sm:gap-6">
          <Suspense fallback={<ActivitySkeleton />}>
            <MonthlyFeeCollection
              data={data}
            />
          </Suspense>
          <Suspense fallback={<ActivitySkeleton className="flex-1" />}>
            <AdminRecentActivity activities={activities} className="flex-1" />
          </Suspense>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="xl:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-0">
          <Suspense fallback={<EventsSkeleton />}>
            <NoticesWidget notices={recentAdminNotices}
            />
          </Suspense>
          <Suspense fallback={<ComplaintsSkeleton className="flex-1" />}>
            <ComplaintsWidget complaints={recentComplaints} className="flex-1" />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

function ActivitySkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader>
        <div className="h-5 bg-muted rounded w-32"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EventsSkeleton() {
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

function ComplaintsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader>
        <div className="h-5 bg-muted rounded w-32"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-8"></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
