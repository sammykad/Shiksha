import { GraduationCap, Book, School, Paperclip, IndianRupeeIcon } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { getChildrenByParent } from '@/lib/data/parent/get-all-children-by-parentId';
import { ChildCard } from '@/components/dashboard/parent/child-card';
import { ChildrenStats } from '@/components/dashboard/parent/parent-children-stats';

export function calcAttendanceRate(attendanceRecords: { status: string }[]): number {
  const totalDays = attendanceRecords.length;
  if (totalDays === 0) return 0;
  const presentDays = attendanceRecords.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length;
  return Math.round((presentDays / totalDays) * 100);
}

export default async function MyChildrenPage() {
  const children = await getChildrenByParent();

  const isEmpty = children.length === 0;

  return (
    <main className={cn("px-2 pb-6", isEmpty ? "flex flex-col items-center justify-center min-h-[60vh]" : "space-y-4")}>
      {!isEmpty && (
        <PageHeader
          title="My Children"
          description="Academic overview and attendance across all enrolled students"
          icon={GraduationCap}
          actions={
            <Link href="/dashboard/fees/parent" className="w-full sm:w-auto">
              <Button size="sm" className="w-full gap-2">
                <IndianRupeeIcon className="h-4 w-4" />
                Fee Details
              </Button>
            </Link>
          }
        />
      )}
      {isEmpty ? (
        <EmptyState
          title="No Children Linked"
          description="Contact your institution administrator to link student profiles to your account."
          icons={[Book, School, Paperclip]}
        />
      ) : (
        <>
          <ChildrenStats children={children} />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}