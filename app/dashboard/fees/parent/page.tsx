import { ParentFeesStats } from '@/components/dashboard/parent/parent-fee-stats-cards';
import { PageHeader } from '@/components/ui/page-header';
import { IndianRupee, IndianRupeeIcon, Book, School, Paperclip } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ChildSwitcher } from '@/components/dashboard/parent/child-switcher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getParentFeesData } from '@/lib/data/fee/get-parent-fees-data';
import ParentFeesTable from '@/components/dashboard/Fees/ParentFeesTable';

export default async function ParentFeesDashboard() {
  const data = await getParentFeesData();

  if (!data) {
    return (
      <main className="px-2 pb-6 flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          title="No Fee Data"
          description="No student is linked to your account. Contact your institution administrator to link student profiles."
          icons={[Book, School, Paperclip]}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Fee Dashboard"
        description="Monitor your children's fee payments and fee history"
        icon={IndianRupee}
        actions={
          <>
            <ChildSwitcher />
            <Link href="/dashboard/fees/parent" className="w-full sm:w-auto">
              <Button size="sm" className="w-full">
                <IndianRupeeIcon className="w-4 h-4 mr-2" />
                Pay Fees
              </Button>
            </Link>
          </>
        }
      />
      <ParentFeesStats />
      <ParentFeesTable data={data} />
    </main>
  );
}
