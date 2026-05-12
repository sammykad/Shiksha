import { AlertTriangle, Clock, FileText, CheckCircle2, ChevronRight, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import { AnonymousComplaint } from '@/generated/prisma/client';

const SEVERITY_COLORS = {
  LOW: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  CRITICAL: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

const STATUS_ICONS = {
  PENDING: Clock,
  UNDER_REVIEW: FileText,
  INVESTIGATING: AlertTriangle,
  RESOLVED: CheckCircle2,
  REJECTED: FileText,
  CLOSED: CheckCircle2,
};

export function ComplaintsWidget({ complaints, className }: { complaints: AnonymousComplaint[], className?: string }) {
  return (
    <Card className={cn("flex flex-col min-h-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>Latest issues reported</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="text-muted-foreground gap-0.5">
          <Link href="/dashboard/anonymous-complaints/manage">
            View All
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1 min-h-0">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <EmptyState
              title="No complaints"
              description="No complaints have been reported yet."
              icons={[MessageSquareWarning]}
              className="border-none p-6"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {complaints.map((complaint) => {
              const StatusIcon = STATUS_ICONS[complaint.currentStatus as keyof typeof STATUS_ICONS] || Clock;

              return (
                <Link
                  key={complaint.id}
                  href={`/dashboard/anonymousComplaints/manage?id=${complaint.trackingId}`}
                  className="group flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium dark:text-slate-200 leading-snug line-clamp-1">
                        {complaint.subject}
                      </p>
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0',
                        SEVERITY_COLORS[complaint.severity as keyof typeof SEVERITY_COLORS]
                      )}>
                        {complaint.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                      {complaint.description}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {complaint.currentStatus.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatDistanceToNow(new Date(complaint.submittedAt), { addSuffix: true })}
                      </span>
                      <span className="truncate max-w-[80px]">
                        ID: {complaint.trackingId}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
