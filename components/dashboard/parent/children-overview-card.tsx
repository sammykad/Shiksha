import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, GraduationCap, ChevronRight } from 'lucide-react';
import { formatCurrencyIN } from '@/lib/utils';
import Link from 'next/link';
import { getMyChildrenOverview } from '@/lib/data/parent/parent-dashboard';

async function ChildrenOverviewContent() {
  const children = await getMyChildrenOverview();

  return (
    <CardContent className="p-0">
      <div className="space-y-1 p-2">
        {children.map((child) => (
          <Link
            key={child.id}
            href={`/dashboard/my-children`}
            className="group block"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={child.profileImage || ''} alt={child.fullName || ''} className='object-cover' />
                  <AvatarFallback className="bg-muted text-xs">
                    {(child.fullName || child.firstName)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${child.todayAttendance === 'PRESENT' ? 'bg-emerald-500' :
                  child.todayAttendance === 'LATE' ? 'bg-amber-500' :
                    child.todayAttendance === 'ABSENT' ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{child.fullName}</p>
                  <Badge
                    variant={child.todayAttendance === 'NOT_MARKED' ? 'outline' : child.todayAttendance as 'PRESENT' | 'ABSENT' | 'LATE'}
                    className="text-xs px-1.5 h-5"
                  >
                    {child.todayAttendance === 'NOT_MARKED' ? 'Not Marked' : child.todayAttendance}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Grade {child.grade.grade}-{child.section.name}</span>
                  </div>
                  {/* <span>{child.attendancePercentage}% Attendance</span> */}
                </div>

                {child.pendingFees > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Pending Fees: {formatCurrencyIN(child.pendingFees)}
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </CardContent>
  );
}

function ChildrenOverviewSkeleton() {
  return (
    <CardContent className="p-2 space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
        </div>
      ))}
    </CardContent>
  );
}

export function ChildrenOverviewCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-4 flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-lg font-semibold">My Children</CardTitle>
        </div>
        <Link href="/dashboard/my-children" className="text-xs text-primary hover:underline font-medium">
          View All
        </Link>
      </CardHeader>
      <Suspense fallback={<ChildrenOverviewSkeleton />}>
        <ChildrenOverviewContent />
      </Suspense>
    </Card>
  );
}