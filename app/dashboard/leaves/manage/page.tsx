import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import ApproveRejectLeave from '@/components/dashboard/leaves/ApproveRejectLeave';
import { getCurrentUserByRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LeavesManagePage() {
  const { role } = await getCurrentUserByRole();

  if (role !== 'ADMIN') {
    redirect('/dashboard'); // Better than throwing error
  }
  const organizationId = await getOrganizationId();

  const pendingLeaves = await prisma.leave.findMany({
    where: {
      organizationId,
      currentStatus: 'PENDING',
    },
    include: {
      appliedBy: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
          student: {
            select: {
              grade: {
                select: {
                  grade: true,
                  section: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      statusTimeline: { orderBy: { changedAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="px-2 space-y-3">
      <Card className="py-4 px-2 flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Manage Leaves
          </CardTitle>
          <CardDescription className="text-sm">
            Review and take action on requested leaves.

          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/leaves">Own Leaves</Link>
        </Button>      </Card>
      <Card>
        <CardContent className='max-sm:p-2'>
          <ApproveRejectLeave leaves={pendingLeaves} />
        </CardContent>
      </Card>
    </main>
  );
}
