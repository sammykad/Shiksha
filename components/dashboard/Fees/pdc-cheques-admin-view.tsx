'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { resolvePdcCheque } from '@/lib/data/fee/resolvePdcCheque';
import { toast } from 'sonner';
import {
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  ClockIcon,
  BuildingIcon,
  CalendarIcon,
  IndianRupeeIcon,
  HashIcon,
} from 'lucide-react';
import { ChequeStatus } from '@/generated/prisma/enums';
import { cn, formatCurrencyINWithSymbol, formatDateIN } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import banks from '@/public/bank/banks.json';
import Image from 'next/image';

// ── Types ────────────────────────────────────────────────────────────────────
// This is the shape your server component / page should fetch and pass down.
// Query: prisma.chequeDetail.findMany({ include: { feePayment: { include: { fee: { include: { student, feeCategory } } } } } })
export interface PdcChequeRow {
  id: string;
  chequeNumber: string;
  chequeDate: Date;
  bankName: string;
  branchName: string | null;
  ifscCode: string | null;
  micrCode: string | null;
  accountHolderName: string;
  accountNumberLast4: string | null;
  status: ChequeStatus;
  bounceReason: string | null;
  clearedAt: Date | null;
  cancelledAt: Date | null;
  remarks: string | null;
  feePayment: {
    id: string;
    amount: number;
    paymentDate: Date;
    receiptNumber: string;
    fee: {
      id: string;
      totalFee: number;
      student: { firstName: string; lastName: string };
      feeCategory: { name: string };
    };
  };
}

interface PdcChequesAdminViewProps {
  cheques: PdcChequeRow[];
}

// ── Status badge ─────────────────────────────────────────────────────────────
function ChequeBadge({ status }: { status: ChequeStatus }) {
  const config: Record<ChequeStatus, { label: string; className: string }> = {
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    CLEARED: {
      label: 'Cleared',
      className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    },
    BOUNCED: {
      label: 'Bounced',
      className: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    },
    CANCELLED: {
      label: 'Cancelled',
      className: 'bg-muted text-muted-foreground border-border',
    },
  };

  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  );
}

// ── Detail row helper ─────────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-muted-foreground w-32 flex-shrink-0 text-xs">{label}</span>
      <span className="font-medium text-xs">{value}</span>
    </div>
  );
}

// ── Resolve dialog ────────────────────────────────────────────────────────────
function ResolveDialog({
  cheque,
  open,
  onClose,
  onResolved,
}: {
  cheque: PdcChequeRow;
  open: boolean;
  onClose: () => void;
  onResolved: (id: string, resolution: 'CLEARED' | 'BOUNCED' | 'CANCELLED') => void;
}) {
  const [resolution, setResolution] = useState<'CLEARED' | 'BOUNCED' | 'CANCELLED'>('CLEARED');
  const [bounceReason, setBounceReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (resolution === 'BOUNCED' && !bounceReason.trim()) {
      toast.error('Please enter a bounce reason');
      return;
    }
    startTransition(async () => {
      try {
        const result = await resolvePdcCheque({
          chequeDetailId: cheque.id,
          resolution,
          bounceReason: resolution === 'BOUNCED' ? bounceReason : undefined,
        });
        toast.success(result.message);
        onResolved(cheque.id, resolution);
        onClose();
      } catch (err) {
        toast.error((err as Error).message ?? 'Failed to update cheque');
      }
    });
  };

  const student = cheque.feePayment.fee.student;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Resolve cheque</DialogTitle>
          <DialogDescription className="text-xs">
            {student.firstName} {student.lastName} — Cheque #{cheque.chequeNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Cheque summary — Re-organized for clarity */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4">
          {/* Bank Info — Full width header */}
          <div className="col-span-2 flex items-center gap-3 pb-3 border-b border-border/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border shadow-sm">
              {(() => {
                const bankEntry = Object.entries(banks).find(([_, name]) => name === cheque.bankName);
                const code = bankEntry?.[0];
                return code ? (
                  <img src={`/bank/${code}/symbol.svg`} className="h-5 w-5 object-contain" alt="" />
                ) : (
                  <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                );
              })()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">
                Issuing Bank
              </p>
              <p className="truncate text-xs font-semibold text-foreground">
                {cheque.bankName}
                {cheque.branchName && (
                  <span className="ml-1.5 font-normal text-muted-foreground opacity-70">
                    &middot; {cheque.branchName}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cheque Date
            </p>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">
                {new Date(cheque.chequeDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Amount
            </p>
            <div className="flex items-center gap-1.5">
              <IndianRupeeIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-foreground tabular-nums">
                ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Receipt No
            </p>
            <div className="flex items-center gap-1.5">
              <HashIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {cheque.feePayment.receiptNumber}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cheque No
            </p>
            <div className="flex items-center gap-1.5">
              <HashIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-mono font-bold text-foreground">
                #{cheque.chequeNumber}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Resolution selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Mark as</Label>
          <Select
            value={resolution}
            onValueChange={(v) => setResolution(v as typeof resolution)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLEARED">
                <span className="flex items-center gap-2">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />
                  Cleared — credit the fee
                </span>
              </SelectItem>
              <SelectItem value="BOUNCED">
                <span className="flex items-center gap-2">
                  <XCircleIcon className="h-3.5 w-3.5 text-red-600" />
                  Bounced — fee stays unpaid
                </span>
              </SelectItem>
              <SelectItem value="CANCELLED">
                <span className="flex items-center gap-2">
                  <BanIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Cancelled
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {resolution === 'BOUNCED' && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Bounce reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={bounceReason}
                onChange={(e) => setBounceReason(e.target.value)}
                placeholder="e.g. Insufficient funds, Payment stopped..."
                className="resize-none h-16 text-sm"
              />
            </div>
          )}

          {resolution === 'CLEARED' && (
            <p className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
              Fee will be credited by ₹{cheque.feePayment.amount.toLocaleString('en-IN')} and the student account will be updated.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Summary metric card ───────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'amber' | 'green' | 'red' | 'default';
}) {
  const colors = {
    amber: 'text-amber-700 dark:text-amber-400',
    green: 'text-green-700 dark:text-green-400',
    red: 'text-red-700 dark:text-red-400',
    default: 'text-foreground',
  };
  return (
    <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold', colors[accent ?? 'default'])}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PdcChequesAdminView({ cheques }: PdcChequesAdminViewProps) {
  const [rows, setRows] = useState(cheques);
  const [resolving, setResolving] = useState<PdcChequeRow | null>(null);
  const [bankFilter, setBankFilter] = useState<string>('all');

  const pending = rows.filter((c) => c.status === ChequeStatus.PENDING);
  const resolved = rows.filter((c) => c.status !== ChequeStatus.PENDING);
  const pendingValue = pending.reduce((s, c) => s + c.feePayment.amount, 0);
  const clearedCount = rows.filter((c) => c.status === ChequeStatus.CLEARED).length;
  const bouncedCount = rows.filter((c) => c.status === ChequeStatus.BOUNCED).length;

  const uniqueBanks = Array.from(new Set(rows.map((c) => c.bankName)));

  const filteredPending =
    bankFilter === 'all'
      ? pending
      : pending.filter((c) => c.bankName === bankFilter);

  const handleResolved = (
    id: string,
    resolution: 'CLEARED' | 'BOUNCED' | 'CANCELLED'
  ) => {
    setRows((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status: resolution as ChequeStatus,
            clearedAt: resolution === 'CLEARED' ? new Date() : c.clearedAt,
            cancelledAt: resolution === 'CANCELLED' ? new Date() : c.cancelledAt,
          }
          : c
      )
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDC Cheques</CardTitle>
        <CardDescription>View and manage PDC cheques</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* ── Summary metrics ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Pending cheques"
            value={pending.length}
            accent="amber"
          />
          <MetricCard
            label="Pending value"
            value={`₹${pendingValue.toLocaleString('en-IN')}`}
            accent="amber"
          />
          <MetricCard
            label="Cleared"
            value={clearedCount}
            accent="green"
          />
          <MetricCard
            label="Bounced"
            value={bouncedCount}
            accent="red"
          />
        </div>

        {/* ── Pending cheques ──────────────────────────────────────────── */}
        <PageHeader
          title="Pending PDC cheques"
          description="Click 'Resolve' to mark cleared, bounced, or cancelled"
          icon={ClockIcon}
          actions={
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="h-9 text-xs w-[180px] bg-white">
                <SelectValue placeholder="All banks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-3.5 w-3.5 opacity-50" />
                    <span>All banks</span>
                  </div>
                </SelectItem>
                {uniqueBanks.map((b) => {
                  const bankEntry = Object.entries(banks).find(([_, name]) => name === b);
                  const code = bankEntry?.[0];
                  return (
                    <SelectItem key={b} value={b} className="text-xs">
                      <div className="flex items-center gap-2 py-0.5">
                        {code ? (
                          <img
                            src={`/bank/${code}/symbol.svg`}
                            className="h-4 w-4 object-contain"
                            alt=""
                          />
                        ) : (
                          <BuildingIcon className="h-4 w-4 opacity-30" />
                        )}
                        <span>{b}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          }
        />

        <Card>
          <CardContent className="p-0">
            {filteredPending.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <ClockIcon className="h-5 w-5 opacity-30" />
                <p className="text-sm">
                  {bankFilter === 'all'
                    ? 'No pending cheques'
                    : 'No pending cheques for this bank'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPending.map((cheque) => {
                  const chequeDate = new Date(cheque.chequeDate);
                  chequeDate.setHours(0, 0, 0, 0);
                  const isDueToday = chequeDate.getTime() === today.getTime();
                  const isOverdue = chequeDate < today;
                  const student = cheque.feePayment.fee.student;

                  return (
                    <div
                      key={cheque.id}
                      className={cn(
                        'flex items-center gap-4 px-4 py-2.5 hover:bg-muted/30 transition-colors',
                        (isDueToday || isOverdue) && 'bg-red-50/50 dark:bg-red-950/10'
                      )}
                    >
                      {/* Student info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cheque.feePayment.fee.feeCategory.name} &middot;{' '}
                          {cheque.bankName}
                          {cheque.branchName ? ` — ${cheque.branchName}` : ''}
                        </p>
                      </div>

                      {/* Cheque number */}
                      <div className="hidden sm:block text-right flex-shrink-0 w-20">
                        <p className="text-xs text-muted-foreground">Cheque no.</p>
                        <p className="text-sm font-mono font-medium">
                          #{cheque.chequeNumber}
                        </p>
                      </div>

                      {/* Cheque date */}
                      <div className="hidden sm:block text-right flex-shrink-0 w-28">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p
                          className={cn(
                            'text-xs font-medium',
                            isOverdue || isDueToday
                              ? 'text-red-600 dark:text-red-400'
                              : ''
                          )}
                        >
                          {new Date(cheque.chequeDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {isDueToday && (
                            <span className="block text-[10px]">Due today</span>
                          )}
                          {isOverdue && (
                            <span className="block text-[10px]">Overdue</span>
                          )}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0 w-24">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-sm font-semibold">
                          ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Status + action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ChequeBadge status={cheque.status} />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setResolving(cheque)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Resolved cheques ─────────────────────────────────────────── */}
        {resolved.length > 0 && (
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-semibold">Recently resolved</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {resolved.map((cheque) => {
                  const student = cheque.feePayment.fee.student;
                  return (
                    <div
                      key={cheque.id}
                      className="flex items-center gap-4 px-4 py-3 opacity-75"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-lg border border-border flex items-center justify-center flex-shrink-0 bg-white dark:bg-muted/20">
                          {(() => {
                            const bankEntry = Object.entries(banks).find(([_, name]) => name === cheque.bankName);
                            const code = bankEntry?.[0];
                            return code ? (
                              <Image
                                src={`/bank/${code}/symbol.svg`}
                                className="h-5 w-5 object-contain"
                                alt={cheque.bankName}
                                width={50}
                                height={50}
                              />
                            ) : (
                              <BuildingIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
                            );
                          })()}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate italic">
                            {cheque.bankName} &middot; #{cheque.chequeNumber}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right flex-shrink-0 w-28">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Cleared</p>
                        <p className="text-xs font-medium">
                          {formatDateIN(cheque.chequeDate)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 w-24">
                        <p className="text-sm font-bold text-muted-foreground">
                          {formatCurrencyINWithSymbol(cheque.feePayment.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ChequeBadge status={cheque.status} />
                        {cheque.bounceReason && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 max-w-[100px] truncate">
                            {cheque.bounceReason}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Resolve dialog ───────────────────────────────────────────── */}
        {resolving && (
          <ResolveDialog
            cheque={resolving}
            open={!!resolving}
            onClose={() => setResolving(null)}
            onResolved={handleResolved}
          />
        )}
      </CardContent>
    </Card>
  );
}
