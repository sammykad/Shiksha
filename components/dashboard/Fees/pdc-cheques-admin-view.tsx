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
  SearchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { ChequeStatus } from '@/generated/prisma/enums';
import { cn, formatCurrencyINWithSymbol, formatDateIN } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
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
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle>Resolve cheque</DialogTitle>
          <DialogDescription className="text-sm">
            {student.firstName} {student.lastName} &mdash; Cheque #{cheque.chequeNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
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
              <p className="text-xs text-muted-foreground mb-0.5">Issuing Bank</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {cheque.bankName}
                {cheque.branchName && (
                  <span className="ml-1.5 font-normal text-muted-foreground">&middot; {cheque.branchName}</span>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Cheque Date</p>
              <p className="text-sm font-medium mt-0.5">
                {new Date(cheque.chequeDate).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-bold mt-0.5 tabular-nums text-emerald-600 dark:text-emerald-400">
                ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receipt No</p>
              <p className="text-sm font-mono font-medium mt-0.5 text-muted-foreground">
                {cheque.feePayment.receiptNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cheque No</p>
              <p className="text-sm font-mono font-bold mt-0.5">#{cheque.chequeNumber}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Mark as</Label>
          <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLEARED">
                <span className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  Cleared &mdash; credit the fee
                </span>
              </SelectItem>
              <SelectItem value="BOUNCED">
                <span className="flex items-center gap-2 text-sm">
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                  Bounced &mdash; fee stays unpaid
                </span>
              </SelectItem>
              <SelectItem value="CANCELLED">
                <span className="flex items-center gap-2 text-sm">
                  <BanIcon className="h-4 w-4 text-muted-foreground" />
                  Cancelled
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {resolution === 'BOUNCED' && (
            <div className="space-y-1.5">
              <Label className="text-sm">
                Bounce reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={bounceReason}
                onChange={(e) => setBounceReason(e.target.value)}
                placeholder="e.g. Insufficient funds, Payment stopped..."
                className="resize-none h-20"
              />
            </div>
          )}

          {resolution === 'CLEARED' && (
            <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
              Fee will be credited by <span className="font-semibold text-foreground">₹{cheque.feePayment.amount.toLocaleString('en-IN')}</span> and the student account will be updated.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
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
  active,
  onClick,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'amber' | 'green' | 'red' | 'default';
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const colors = {
    amber: 'text-amber-700 dark:text-amber-400',
    green: 'text-green-700 dark:text-green-400',
    red: 'text-red-700 dark:text-red-400',
    default: 'text-foreground',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-lg bg-muted/50 p-3 space-y-0.5 text-left w-full',
        onClick && 'cursor-pointer hover:bg-muted/70 transition-colors',
        active && 'ring-2 ring-primary/40 bg-primary/5',
        className
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold', colors[accent ?? 'default'])}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </Tag>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PdcChequesAdminView({ cheques }: PdcChequesAdminViewProps) {
  const [rows, setRows] = useState(cheques);
  const [resolving, setResolving] = useState<PdcChequeRow | null>(null);
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [resolvedBankFilter, setResolvedBankFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'cleared' | 'bounced' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOpen, setPendingOpen] = useState(true);
  const [resolvedOpen, setResolvedOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [resolvedPage, setResolvedPage] = useState(1);
  const PAGE_SIZE = 5;

  const pending = rows.filter((c) => c.status === ChequeStatus.PENDING);
  const resolved = rows.filter((c) => c.status !== ChequeStatus.PENDING);
  const pendingValue = pending.reduce((s, c) => s + c.feePayment.amount, 0);
  const clearedCount = rows.filter((c) => c.status === ChequeStatus.CLEARED).length;
  const bouncedCount = rows.filter((c) => c.status === ChequeStatus.BOUNCED).length;
  const cancelledCount = rows.filter((c) => c.status === ChequeStatus.CANCELLED).length;
  const totalCount = rows.length;

  const uniqueBanks = Array.from(new Set(rows.map((c) => c.bankName)));

  const lowerSearch = searchQuery.toLowerCase();
  const matchesSearch = (c: PdcChequeRow) => {
    if (!searchQuery) return true;
    const s = c.feePayment.fee.student;
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(lowerSearch) ||
      c.chequeNumber.toLowerCase().includes(lowerSearch) ||
      c.bankName.toLowerCase().includes(lowerSearch) ||
      c.feePayment.fee.feeCategory.name.toLowerCase().includes(lowerSearch)
    );
  };

  const pendingFiltered = pending
    .filter(matchesSearch)
    .filter((c) => bankFilter === 'all' || c.bankName === bankFilter);

  const resolvedBase = resolved.filter((c) =>
    activeFilter === 'all' ? true : c.status.toLowerCase() === activeFilter
  );
  const resolvedFiltered = resolvedBase
    .filter(matchesSearch)
    .filter((c) => resolvedBankFilter === 'all' || c.bankName === resolvedBankFilter);

  const resolvedUniqueBanks = Array.from(new Set(resolvedFiltered.map((c) => c.bankName)));

  const paginatedPending = pendingFiltered.slice(0, pendingPage * PAGE_SIZE);
  const paginatedResolved = resolvedFiltered.slice(0, resolvedPage * PAGE_SIZE);

  const showPending = activeFilter === 'all' || activeFilter === 'pending';
  const showResolved = activeFilter === 'all' || activeFilter !== 'pending';

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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <MetricCard
            label="Total"
            value={totalCount}
            active={activeFilter === 'all'}
            onClick={() => {
              setActiveFilter('all');
              setPendingPage(1);
              setResolvedPage(1);
            }}
          />
          <MetricCard
            label="Pending"
            value={pending.length}
            accent="amber"
            active={activeFilter === 'pending'}
            onClick={() => {
              setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending');
              setPendingPage(1);
            }}
          />
          <MetricCard
            label="Cleared"
            value={clearedCount}
            accent="green"
            active={activeFilter === 'cleared'}
            onClick={() => {
              setActiveFilter(activeFilter === 'cleared' ? 'all' : 'cleared');
              setResolvedPage(1);
              setResolvedOpen(true);
            }}
          />
          <MetricCard
            label="Bounced"
            value={bouncedCount}
            accent="red"
            active={activeFilter === 'bounced'}
            onClick={() => {
              setActiveFilter(activeFilter === 'bounced' ? 'all' : 'bounced');
              setResolvedPage(1);
              setResolvedOpen(true);
            }}
          />
          <MetricCard
            label="Pending value"
            value={`₹${pendingValue.toLocaleString('en-IN')}`}
            accent="amber"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* ── Search ──────────────────────────────────────────────────── */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, cheque#, bank..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPendingPage(1);
              setResolvedPage(1);
            }}
            className="pl-8 h-9"
          />
        </div>

        {/* ── Pending cheques (collapsible + paginated) ─────────────── */}
        {showPending && (
          <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
            <div className="mb-3">
              <PageHeader
                title="Pending PDC cheques"
                description="Click 'Resolve' to mark cleared, bounced, or cancelled"
                icon={ClockIcon}
                actions={
                  <>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 max-sm:flex-none">
                        {pendingOpen ? (
                          <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">{pendingOpen ? 'Collapse' : 'Expand'}</span>
                      </Button>
                    </CollapsibleTrigger>
                    <Select value={bankFilter} onValueChange={(v) => { setBankFilter(v); setPendingPage(1); }}>
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
                  </>
                }
              />
            </div>

            <CollapsibleContent>
              <Card>
                <CardContent className="p-0">
                  {paginatedPending.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                      <ClockIcon className="h-5 w-5 opacity-30" />
                      <p className="text-sm">
                        {searchQuery
                          ? 'No matching cheques'
                          : bankFilter !== 'all'
                            ? 'No pending cheques for this bank'
                            : 'No pending cheques'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {paginatedPending.map((cheque) => {
                        const chequeDate = new Date(cheque.chequeDate);
                        chequeDate.setHours(0, 0, 0, 0);
                        const isDueToday = chequeDate.getTime() === today.getTime();
                        const isOverdue = chequeDate < today;
                        const student = cheque.feePayment.fee.student;

                        return (
                          <div key={cheque.id}>
                            {/* Mobile card layout */}
                            <div
                              className={cn(
                                'flex sm:hidden flex-col gap-1.5 px-4 py-3 border-b last:border-b-0',
                                (isDueToday || isOverdue) && 'bg-red-50/50 dark:bg-red-950/10'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {cheque.feePayment.fee.feeCategory.name}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-semibold tabular-nums">
                                    ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] text-muted-foreground truncate">
                                  #{cheque.chequeNumber} &middot;{' '}
                                  {new Date(cheque.chequeDate).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short',
                                  })}
                                </p>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <ChequeBadge status={cheque.status} />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => setResolving(cheque)}
                                  >
                                    Resolve
                                  </Button>
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {cheque.bankName}
                                {cheque.branchName ? ` — ${cheque.branchName}` : ''}
                                {isOverdue && <span className="text-red-500 ml-1">Overdue</span>}
                                {isDueToday && <span className="text-amber-600 ml-1">Due today</span>}
                              </p>
                            </div>

                            {/* Desktop row layout */}
                            <div
                              className={cn(
                                'hidden sm:flex items-center gap-4 px-4 py-2.5 hover:bg-muted/30 transition-colors',
                                (isDueToday || isOverdue) && 'bg-red-50/50 dark:bg-red-950/10'
                              )}
                            >
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

                              <div className="text-right flex-shrink-0 w-20">
                                <p className="text-xs text-muted-foreground">Cheque no.</p>
                                <p className="text-sm font-mono font-medium">
                                  #{cheque.chequeNumber}
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0 w-28">
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p
                                  className={cn(
                                    'text-xs font-medium',
                                    isOverdue || isDueToday ? 'text-red-600 dark:text-red-400' : ''
                                  )}
                                >
                                  {new Date(cheque.chequeDate).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                  })}
                                  {isDueToday && <span className="block text-[10px]">Due today</span>}
                                  {isOverdue && <span className="block text-[10px]">Overdue</span>}
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0 w-24">
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="text-sm font-semibold">
                                  ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
                                </p>
                              </div>

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
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pending pagination */}
                  {pendingFiltered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
                      <span>
                        Showing {Math.min(pendingPage * PAGE_SIZE, pendingFiltered.length)} of {pendingFiltered.length}
                      </span>
                      <div className="flex items-center gap-1">
                        {pendingPage * PAGE_SIZE < pendingFiltered.length ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setPendingPage((p) => p + 1)}
                          >
                            Show more
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setPendingPage(1)}
                          >
                            Show less
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* ── Resolved cheques (collapsible + paginated) ────────────── */}
        {showResolved && resolvedFiltered.length > 0 && (
          <Collapsible open={resolvedOpen} onOpenChange={setResolvedOpen}>
            <div className="mb-3">
              <PageHeader
                title={
                  activeFilter === 'all'
                    ? 'Resolved cheques'
                    : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} cheques`
                }
                description={
                  activeFilter === 'all'
                    ? 'Cleared, bounced, and cancelled cheques'
                    : activeFilter === 'cleared'
                      ? 'Cheques that have been successfully cleared'
                      : activeFilter === 'bounced'
                        ? 'Cheques that were returned unpaid'
                        : 'Cheques that were cancelled'
                }
                icon={activeFilter === 'bounced' ? XCircleIcon : activeFilter === 'cancelled' ? BanIcon : CheckCircleIcon}
                actions={
                  <>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 max-sm:flex-none">
                        {resolvedOpen ? (
                          <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">{resolvedOpen ? 'Collapse' : 'Expand'}</span>
                      </Button>
                    </CollapsibleTrigger>
                    <Select
                      value={resolvedBankFilter}
                      onValueChange={(v) => { setResolvedBankFilter(v); setResolvedPage(1); }}
                    >
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
                        {resolvedUniqueBanks.map((b) => {
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
                  </>
                }
              />
            </div>

            <CollapsibleContent>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {paginatedResolved.map((cheque) => {
                      const student = cheque.feePayment.fee.student;
                      return (
                        <div key={cheque.id}>
                          {/* Mobile card layout */}
                          <div className="flex sm:hidden flex-col gap-1.5 px-4 py-3 border-b last:border-b-0 opacity-75">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {cheque.bankName} &middot; #{cheque.chequeNumber}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-muted-foreground tabular-nums">
                                  ₹{cheque.feePayment.amount.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] text-muted-foreground">
                                {formatDateIN(cheque.chequeDate)}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <ChequeBadge status={cheque.status} />
                              </div>
                            </div>
                            {cheque.bounceReason && (
                              <p className="text-[10px] text-red-600 dark:text-red-400 truncate">
                                {cheque.bounceReason}
                              </p>
                            )}
                          </div>

                          {/* Desktop row layout */}
                          <div className="hidden sm:flex items-center gap-4 px-4 py-3 opacity-75">
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
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                {cheque.status === 'CLEARED' ? 'Cleared' : cheque.status === 'BOUNCED' ? 'Bounced' : 'Cancelled'}
                              </p>
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Resolved pagination */}
                  {resolvedFiltered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
                      <span>
                        Showing {Math.min(resolvedPage * PAGE_SIZE, resolvedFiltered.length)} of {resolvedFiltered.length}
                      </span>
                      <div className="flex items-center gap-1">
                        {resolvedPage * PAGE_SIZE < resolvedFiltered.length ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setResolvedPage((p) => p + 1)}
                          >
                            Show more
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setResolvedPage(1)}
                          >
                            Show less
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
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
