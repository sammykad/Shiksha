import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndianRupee, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrencyIN } from '@/lib/utils';
import { getParentFeesData } from '@/lib/data/fee/get-parent-fees-data';

async function FeesSummaryContent() {
  const feesData = await getParentFeesData();

  if (!feesData) return (
    <CardContent className="p-4 pt-2 text-center text-muted-foreground text-sm">
      No fee data found for this child.
    </CardContent>
  );

  const { totalFees, paidFees, pendingFees, paymentHistory } = feesData;

  // Total pending = total - paid (matches the fees page exactly)
  const totalPending = Math.max(0, totalFees - paidFees);

  // Overdue portion within pending
  const overdueAmount = pendingFees
    .filter(f => f.status === 'OVERDUE')
    .reduce((sum, f) => sum + f.pendingAmount, 0);

  return (
    <CardContent className="p-4 pt-2">
      <div className="space-y-6">
        <div className="space-y-3">
          {/* Status badge */}
          <div className="flex items-center justify-end">
            {overdueAmount > 0 ? (
              <Badge variant="OVERDUE" className="text-xs h-5 px-1.5 uppercase tracking-wide">
                Overdue
              </Badge>
            ) : totalPending > 0 ? (
              <Badge variant="UNPAID" className="text-xs h-5 px-1.5 uppercase tracking-wide">
                Pending
              </Badge>
            ) : (
              <Badge variant="PAID" className="text-xs h-5 px-1.5 uppercase tracking-wide">
                Cleared
              </Badge>
            )}
          </div>

          {/* Total / Paid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Total Fees</p>
              <p className="text-lg font-semibold">{formatCurrencyIN(totalFees)}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-semibold text-emerald-600">{formatCurrencyIN(paidFees)}</p>
            </div>
          </div>

          {/* Pending row — shows total outstanding */}
          {totalPending > 0 && (
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div>
                <p className="text-xs font-medium text-foreground">
                  Pending — {formatCurrencyIN(totalPending)}
                </p>
                {overdueAmount > 0 ? (
                  <p className="text-xs text-destructive mt-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {formatCurrencyIN(overdueAmount)} overdue
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upcoming due dates
                  </p>
                )}
              </div>
              <Link href="/dashboard/fees/parent">
                <Button
                  size="sm"
                  variant={overdueAmount > 0 ? "destructive" : "outline"}
                  className={overdueAmount > 0
                    ? "h-7 text-xs font-normal px-3"
                    : "h-7 text-xs font-normal px-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  }
                >
                  {overdueAmount > 0 ? 'Pay Now' : 'Pay'}
                </Button>
              </Link>
            </div>
          )}

          {/* Last payment */}
          {paymentHistory.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                <span className="truncate max-w-[140px]">
                  {paymentHistory[0].feeCategoryName}
                </span>
              </div>
              <span className="font-semibold text-foreground">{formatCurrencyIN(paymentHistory[0].amountPaid)}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
}

function FeesSummarySkeleton() {
  return (
    <CardContent className="p-4 pt-2 space-y-6">
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    </CardContent>
  );
}

export function FeesSummaryCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-4 flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg font-semibold">Fees Summary</CardTitle>
        </div>
        <Link href="/dashboard/fees/parent" className="text-xs text-primary hover:underline font-medium">
          History
        </Link>
      </CardHeader>
      <Suspense fallback={<FeesSummarySkeleton />}>
        <FeesSummaryContent />
      </Suspense>
    </Card>
  );
}
