'use client';

import { format } from 'date-fns';
import { Check, Eye, } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FeeReceiptCard } from './FeeReceiptCard';
import PayFeeButton from '@/components/dashboard/Fees/PayFeeButton';
import { formatCurrencyIN } from '@/lib/utils';
import { ChildFeeData } from '@/lib/data/fee/get-parent-fees-data';

function PendingFeesTable({ data }: { data: ChildFeeData }) {
  if (data.pendingFees.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-4">
            <div className="flex gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  All fees paid
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  There are no pending payments. Great job staying on top of it!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payments</CardTitle>
        <CardDescription>
          {data.pendingFees.length} payment{data.pendingFees.length !== 1 ? 's' : ''} due
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pendingFees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium capitalize truncate">{fee.feeCategoryName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(fee.dueDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>₹{formatCurrencyIN(fee.totalFee)}</TableCell>
                <TableCell className="text-green-600 dark:text-green-400">
                  ₹{formatCurrencyIN(fee.paidAmount)}
                </TableCell>
                <TableCell className="text-orange-600 dark:text-orange-400 font-medium">
                  ₹{formatCurrencyIN(fee.pendingAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={fee.status}>
                    {fee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <PayFeeButton
                    feeId={fee.id}
                    feeCategoryName={fee.feeCategoryName}
                    pendingAmount={fee.pendingAmount}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaymentHistoryTable({ data }: { data: ChildFeeData }) {
  if (data.paymentHistory.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Record of all previous fee payments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Receipt No</TableHead>
              <TableHead className='truncate'>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.paymentHistory.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {payment.receiptNumber}
                </TableCell>
                <TableCell className="capitalize truncate">{payment.feeCategoryName}</TableCell>
                <TableCell className="font-medium">
                  ₹{formatCurrencyIN(payment.amountPaid)}
                </TableCell>
                <TableCell className="capitalize">
                  {payment.paymentMethod.replace('_', ' ').toLowerCase()}
                  {payment.paymentMethod === 'CHEQUE' && payment.chequeDetail && (
                    <span className="ml-1.5 text-[10px] font-mono text-muted-foreground border bg-muted/30 px-1 rounded">
                      #{payment.chequeDetail.chequeNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={payment.status}>
                    {payment.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="overflow-y-auto max-h-screen">
                      <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                        <DialogDescription>
                          Receipt #{payment.receiptNumber}
                        </DialogDescription>
                      </DialogHeader>
                      <FeeReceiptCard receiptData={payment} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ParentFeesTable({ data }: { data: ChildFeeData }) {
  return (
    <div className="space-y-4">
      <PendingFeesTable data={data} />
      <PaymentHistoryTable data={data} />
    </div>
  );
}