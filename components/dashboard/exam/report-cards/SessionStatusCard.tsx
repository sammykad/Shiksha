'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  FileCheck,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Clock,
} from 'lucide-react';
import { formatDateIN } from '@/lib/utils';

type SessionStatusCardProps = {
  session: {
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    academicYear: {
      name: string;
    };
  };
  stats: {
    totalExams: number;
    publishedExams: number;
    pendingExams: Array<{
      title: string;
      subject: {
        name: string;
      };
    }>;
    allPublished: boolean;
  };
};

export function SessionStatusCard({ session, stats }: SessionStatusCardProps) {
  const completionPercentage = Math.round((stats.publishedExams / stats.totalExams) * 100) || 0;

  const statsCards = [
    {
      title: "Session Period",
      value: session.title,
      description: `${formatDateIN(session.startDate)} - ${formatDateIN(session.endDate)}`,
      icon: Calendar,
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500/5',
      progress: undefined,
    },
    {
      title: 'Total Exams',
      value: stats.totalExams.toString(),
      description: "Exams mapped to this session",
      icon: BookOpen,
      iconBg: 'bg-purple-100 dark:bg-purple-950/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500/5',
      progress: undefined,
    },
    {
      title: 'Published Status',
      value: `${completionPercentage}%`,
      description: `${stats.publishedExams} of ${stats.totalExams} results published`,
      icon: stats.allPublished ? CheckCircle : Clock,
      iconBg: stats.allPublished ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-amber-100 dark:bg-amber-950/50',
      iconColor: stats.allPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      gradient: stats.allPublished ? 'from-emerald-500/5' : 'from-amber-500/5',
      progress: completionPercentage,
    },
    {
      title: 'Pending Actions',
      value: stats.pendingExams.length.toString(),
      description: stats.pendingExams.length > 0 ? "Exams awaiting publication" : "All exam results are live",
      icon: AlertCircle,
      iconBg: stats.pendingExams.length > 0 ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-slate-100 dark:bg-slate-950/50',
      iconColor: stats.pendingExams.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400',
      gradient: stats.pendingExams.length > 0 ? 'from-rose-500/5' : 'from-slate-500/5',
      progress: undefined,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
