import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Calendar, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { TeacherStatsCards } from '@/components/dashboard/teacher/TeacherDashboardStatsCard';
import { RecentActivitiesCard } from '@/components/dashboard/teacher/RecentActivitiesCard';
import { TeacherTodaysClassScheduleCard } from './TeacherTodaysClassScheduleCard';

// import { MyClassesCard } from "@/components/teacher-dashboard/my-classes-card"
// import { RecentActivitiesCard } from "@/components/teacher-dashboard/recent-activities-card"
// import { StudentPerformanceCard } from "@/components/teacher-dashboard/student-performance-card"
// import { QuickActionsCard } from "@/components/teacher-dashboard/quick-actions-card"

// Available Sameer Kad Main V0.dev

export default async function TeacherDashboard() {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/10">
      <div className="px-2 space-y-3">
        {/* Header */}
        <PageHeader
          title="Teacher Dashboard"
          description="Manage your classes, students, and teaching activities"
          icon={GraduationCap}
          className="bg-gradient-to-r from-card via-card to-primary/5"
          actions={
            <>
              <Link href="/dashboard/attendance/mark">
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  Take Attendance
                </Button>
              </Link>
              <Link href="/dashboard/students">
                <Button size="sm" className="w-full">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  My Students
                </Button>
              </Link>
            </>
          }
        />

        {/* Stats Cards */}
        <TeacherStatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Today's Schedule */}
            <TeacherTodaysClassScheduleCard />

            {/* My Classes */}
            {/* <MyClassesCard /> */}

            {/* Quick Actions */}
            {/* <QuickActionsCard /> */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student Performance */}
            {/* <StudentPerformanceCard /> */}

            {/* Recent Activities */}
            <RecentActivitiesCard />
          </div>
        </div>

        {/* Teaching Tips */}
        {/* <Card className="border-0 bg-gradient-to-br from-card via-card to-green-50/20 dark:to-green-950/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Teaching Tips
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Daily Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Take attendance within first 20 minutes</li>
                  <li>• Review previous day&apos;s performance</li>
                  <li>• Prepare materials before class starts</li>
                  <li>• Engage with students regularly</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Student Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monitor attendance patterns</li>
                  <li>• Communicate with parents about concerns</li>
                  <li>• Provide regular feedback</li>
                  <li>• Maintain updated records</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
