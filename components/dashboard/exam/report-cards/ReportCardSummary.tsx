'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import { useTerminology } from '@/context/terminology';

type ReportCardSummaryProps = {
  reportCards: Array<{
    percentage: number;
    resultStatus: string;
    overallGrade: string;
  }>;
};

export function ReportCardSummary({ reportCards }: ReportCardSummaryProps) {
  if (reportCards.length === 0) return null;

  const term = useTerminology();

  // Calculate statistics
  const totalStudents = reportCards.length;
  const passedStudents = reportCards.filter((r) => r.resultStatus === 'PASSED').length;
  const avgPercentage = reportCards.reduce((sum, card) => sum + card.percentage, 0) / totalStudents;

  const gradeDistribution = reportCards.reduce((acc, card) => {
    acc[card.overallGrade] = (acc[card.overallGrade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGradeEntry = Object.entries(gradeDistribution).sort((a, b) => b[1] - a[1])[0];
  const passPercentage = (passedStudents / totalStudents) * 100;

  const statsCards = [
    {
      title: `Total ${term.students}`,
      value: totalStudents.toString(),
      description: `${term.students} in this selection`,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500/5',
      progress: undefined,
    },
    {
      title: 'Success Rate',
      value: `${passPercentage.toFixed(1)}%`,
      description: `${passedStudents} of ${totalStudents} ${term.students.toLowerCase()} passed`,
      icon: Trophy,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500/5',
      progress: passPercentage,
    },
    {
      title: 'Average Score',
      value: `${avgPercentage.toFixed(1)}%`,
      description: `Average across all ${term.students.toLowerCase()}`,
      icon: TrendingUp,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500/5',
      progress: avgPercentage,
    },
    {
      title: 'Top Grade',
      value: topGradeEntry[0],
      description: `${topGradeEntry[1]} ${term.students.toLowerCase()} achieved this`,
      icon: Award,
      iconBg: 'bg-amber-100 dark:bg-amber-950/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500/5',
      progress: undefined,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-xl md:text-lg lg:text-2xl font-semibold tabular-nums">
                {stat.value}
              </div>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-1.5 mt-3" />
              )}
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>
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
