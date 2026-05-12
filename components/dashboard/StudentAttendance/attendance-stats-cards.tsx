import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';
import type { MyAttendanceData } from '@/lib/data/attendance/my-attendance';

interface AttendanceStatsCardsProps {
  data: Pick<MyAttendanceData, 'todayStatus' | 'monthlyStats' | 'annualStats' | 'overallStats'>;
}

export function AttendanceStatsCards({ data }: AttendanceStatsCardsProps) {
  const { todayStatus, monthlyStats, annualStats, overallStats } = data;

  const statsCards = [
    {
      title: "Today's Status",
      value: todayStatus === 'NOT_MARKED' ? 'Not Marked' : todayStatus,
      description: todayStatus === 'NOT_MARKED' ? 'Pending mark' : 'Attendance recorded',
      icon: Clock,
      iconBg:
        todayStatus === 'PRESENT'
          ? 'bg-green-100 dark:bg-green-950/50'
          : todayStatus === 'ABSENT'
            ? 'bg-red-100 dark:bg-red-950/50'
            : 'bg-gray-100 dark:bg-gray-950/50',
      iconColor:
        todayStatus === 'PRESENT'
          ? 'text-green-600 dark:text-green-400'
          : todayStatus === 'ABSENT'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400',
      gradient:
        todayStatus === 'PRESENT'
          ? 'from-green-500/5'
          : todayStatus === 'ABSENT'
            ? 'from-red-500/5'
            : 'from-gray-500/5',
      progress: undefined,
    },
    {
      title: 'This Month',
      value: `${monthlyStats.percentage}%`,
      description: `${monthlyStats.presentDays + monthlyStats.lateDays}/${monthlyStats.totalDays} days attended`,
      icon: Calendar,
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500/5',
      progress: monthlyStats.percentage,
    },
    {
      title: 'This Year',
      value: `${annualStats.percentage}%`,
      description: `${annualStats.presentDays + annualStats.lateDays}/${annualStats.totalDays} days attended`,
      icon: TrendingUp,
      iconBg: 'bg-purple-100 dark:bg-purple-950/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500/5',
      progress: annualStats.percentage,
    },
    {
      title: 'Overall',
      value: `${overallStats.percentage}%`,
      description: `${overallStats.presentDays + overallStats.lateDays}/${overallStats.totalDays} days attended`,
      icon: Target,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500/5',
      progress: overallStats.percentage,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
                {stat.value}
              </div>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-1.5 mt-3" />
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} to-transparent pointer-events-none`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}