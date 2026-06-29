import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyIN, formatDateIN } from '@/lib/utils';
import prisma from '@/lib/db';
import {
  Activity,
  CreditCard,
  IndianRupee,
  PercentDiamond,
  Receipt,
  Wallet,
} from 'lucide-react';
import { ReceiptDownloadButton } from '@/components/dashboard/Fees/ReceiptDownloadButton';
import { getCurrentUserByRole } from '@/lib/auth';
import { EmptyState } from '@/components/ui/empty-state';
import PayFeeButton from '@/components/dashboard/Fees/PayFeeButton';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getFeeBalance, getFeesSummary } from '@/lib/data/fee/fee-balance';
import { PaymentStatus } from '@/generated/prisma/enums';

async function getStudentFeesByStudentId(studentId: string) {
  const academicYearId = await getActiveAcademicYearId();
  return await prisma.fee.findMany({
    where: {
      studentId: studentId,
      academicYearId,
    },
    include: {
      feeCategory: true,
      organization: true,
      academicYear: {
        select: {
          name: true
        }
      },
      student: {
        include: {
          grade: true,
          section: true,
          parents: {
            include: {
              parent: true,
            },
          },
        },
      },
      payments: {
        where: { status: PaymentStatus.COMPLETED },
        include: {
          payer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function StudentFeePage() {
  const currentUser = await getCurrentUserByRole();

  // ✅ Only allow students here
  if (currentUser.role !== 'STUDENT') {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg">
        Only students can access this page.
      </div>
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: currentUser.studentId,
    },
    select: {
      createdAt: true,
    },
  });

  const fees = await getStudentFeesByStudentId(currentUser.studentId);
  const feesWithBalance = fees.map((fee) => ({ ...fee, balance: getFeeBalance(fee) }));
  const feeSummary = getFeesSummary(fees);

  const totalFees = feeSummary.totalAmount;
  const paidFees = feeSummary.paidAmount;
  const pendingFees = feeSummary.dueAmount;
  const admissionDate = student?.createdAt;
  const monthsEnrolled = admissionDate
    ? Math.floor(
      (Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    : 0;

  return (
    <div className="space-y-3 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Fee Dashboard</CardTitle>
          <CardDescription>
            Manage and track student fee information
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Fees */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Fees</span>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-950/50 rounded-lg">
                <IndianRupee className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-foreground mb-0.5" />
              <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
                {formatCurrencyIN(totalFees)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {fees.length} fee records total
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* Paid Fees */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Paid Fees</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-foreground mb-0.5" />
              <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
                {formatCurrencyIN(paidFees)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalFees > 0 ? ((paidFees / totalFees) * 100).toFixed(1) : "0.0"}% of total fees
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Fee</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <PercentDiamond className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-foreground mb-0.5" />
              <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
                {formatCurrencyIN(pendingFees)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {feesWithBalance.filter((fee) => fee.balance.status === 'UNPAID').length} unpaid invoices
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* Admission Date */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground line-clamp-1">Admission Date</span>
              <div className="p-2 bg-violet-100 dark:bg-violet-950/50 rounded-lg">
                <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="text-2xl max-sm:text-lg font-bold">
              {formatDateIN(admissionDate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthsEnrolled} months enrolled
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-medium">Fee Records</h3>
        <Badge variant="outline" className="text-xs">
          {fees.length} Records
        </Badge>
      </div>
      <Separator className="my-4" />

      {fees.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <EmptyState
            title="No Fees Records Yet"
            description="No fees have been assigned to this student.
            Please contact the administration office for more information."
            icons={[Receipt, Wallet, CreditCard]}
            action={{
              label: 'Go to Dashboard',
              href: '/dashboard',
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {feesWithBalance.map((fee) => (
            <Card
              key={fee.id}
              className="overflow-hidden border-border/50 transition-all hover:shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base capitalize">
                      Fee : {fee.feeCategory.name}
                    </CardTitle>
                    <Badge variant={fee.balance.status} className="font-normal space-x-2 gap-2 flex items-center">
                      <span className='flex items-center space-x-2'>
                        <IndianRupee size={12} />
                        {formatCurrencyIN(fee.totalFee)}</span>
                      {fee.balance.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                  </div>
                </div>
                <CardDescription className="mt-1.5">
                  {fee.feeCategory.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Issue Date
                    </p>
                    <p className="text-sm mt-1">
                      {formatDateIN(fee.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Due Date
                    </p>
                    <p className="text-sm mt-1">{formatDateIN(fee.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="text-sm mt-1 capitalize">
                      {fee.feeCategory.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="text-sm mt-1">
                      {fee.balance.status === 'PAID'
                        ? `Paid ${formatCurrencyIN(fee.balance.paidAmount)}`
                        : 'Not paid yet'}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end pt-3 pb-4">
                {fee.balance.status !== 'PAID' ? (
                  <PayFeeButton 
                    feeId={fee.id} 
                    feeCategoryName={fee.feeCategory.name}
                    pendingAmount={fee.balance.dueAmount}
                  />
                ) : (
                  <ReceiptDownloadButton
                    record={{
                      fee: {
                        ...fee,
                        paidAmount: fee.balance.paidAmount,
                        pendingAmount: fee.balance.dueAmount,
                        status: fee.balance.status,
                        academicYearName: fee.academicYear.name,
                        organizationName: fee.organization.name || undefined,
                        organizationEmail: fee.organization.contactEmail || undefined,
                        organizationPhone: fee.organization.contactPhone || undefined,
                        organizationLogo: fee.organization.logo || undefined,
                      },
                      student: fee.student,
                      feeCategory: fee.feeCategory,
                      grade: fee.student.grade,
                      section: fee.student.section,
                      payments: fee.payments.map((payment) => ({
                        ...payment,
                        amountPaid: payment.amount,
                        transactionId: payment.transactionId,
                      })),
                    }}
                    variant="outline"
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
