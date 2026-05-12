import { Suspense } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDateTimeIN, formatCurrencyINWithSymbol } from '@/lib/utils';
import {
  getOnlinePaymentReceiptRecord,
  getOnlinePaymentStatus,
} from '@/lib/data/fee/recordOnlinePayment';
import { PaymentStatus } from '@/generated/prisma/enums';
import { getCurrentUserByRole } from '@/lib/auth';
import { ReceiptDownloadButton } from '@/components/dashboard/Fees/ReceiptDownloadButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// ─── Role → fees URL ────────────────────────────────────────────────────────
function getFeesUrl(role: string) {
  const map: Record<string, string> = {
    STUDENT: '/dashboard/fees/student',
    PARENT: '/dashboard/fees/parent',
    ADMIN: '/dashboard/fees/admin',
    TEACHER: '/dashboard/fees/teacher',
  };
  return map[role] ?? '/dashboard';
}

// ─── Status configuration ────────────────────────────────────────────────────
type StatusVariant = 'completed' | 'failed' | 'pending' | 'unknown';

interface StatusConfig {
  variant: StatusVariant;
  Icon: React.ElementType;
  title: string;
  subtitle: string;
  label: string;
  accentClass: string;       // Tailwind ring / border color
  iconWrapClass: string;     // icon background
  iconClass: string;         // icon color + optional animation
  bannerClass: string;       // bottom info banner bg
  badgeClass: string;        // badge colour override
}

function getStatusConfig(status?: PaymentStatus): StatusConfig {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return {
        variant: 'completed',
        Icon: CheckCircle,
        title: 'Payment Confirmed',
        subtitle: 'Your transaction has been verified and recorded.',
        label: 'Completed',
        accentClass: 'ring-emerald-400/40 border-emerald-200',
        iconWrapClass: 'bg-emerald-50 ring-4 ring-emerald-200',
        iconClass: 'text-emerald-500',
        bannerClass: 'bg-emerald-50 border-emerald-100 text-emerald-800',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    case PaymentStatus.FAILED:
      return {
        variant: 'failed',
        Icon: XCircle,
        title: 'Payment Failed',
        subtitle: 'The transaction could not be completed.',
        label: 'Failed',
        accentClass: 'ring-rose-400/40 border-rose-200',
        iconWrapClass: 'bg-rose-50 ring-4 ring-rose-200',
        iconClass: 'text-rose-500',
        bannerClass: 'bg-rose-50 border-rose-100 text-rose-800',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      };
    case PaymentStatus.PENDING:
      return {
        variant: 'pending',
        Icon: RefreshCw,
        title: 'Awaiting Confirmation',
        subtitle: 'We are waiting for a response from your bank.',
        label: 'Processing',
        accentClass: 'ring-amber-400/40 border-amber-200',
        iconWrapClass: 'bg-amber-50 ring-4 ring-amber-200',
        iconClass: 'text-amber-500 animate-spin',
        bannerClass: 'bg-amber-50 border-amber-100 text-amber-800',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    default:
      return {
        variant: 'unknown',
        Icon: AlertCircle,
        title: 'Status Unknown',
        subtitle: 'We could not verify this transaction.',
        label: 'Unknown',
        accentClass: 'ring-slate-400/20 border-slate-200',
        iconWrapClass: 'bg-slate-100 ring-4 ring-slate-200',
        iconClass: 'text-slate-400',
        bannerClass: 'bg-slate-50 border-slate-200 text-slate-600',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      };
  }
}

// ─── Page content ────────────────────────────────────────────────────────────
async function PaymentStatusContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { txn: transactionId } = await searchParams;
  const { role } = await getCurrentUserByRole();
  const feesUrl = getFeesUrl(role);

  /* ── Missing transaction ID ── */
  if (!transactionId || typeof transactionId !== 'string') {
    return (
      <StatusShell>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="rounded-full bg-yellow-50 ring-4 ring-yellow-200 p-4">
            <AlertCircle className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            No Transaction ID
          </h1>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            We couldn't find a transaction reference to look up your payment.
          </p>
          <Button asChild className="mt-2 h-11 px-6 rounded-xl font-semibold">
            <Link href={feesUrl}>← View All Fees</Link>
          </Button>
        </div>
      </StatusShell>
    );
  }

  /* ── Fetch current local status. Verification happens via callback/retry route. ── */
  const payment = await getOnlinePaymentStatus(transactionId);

  const config = getStatusConfig(payment?.status);
  const { Icon } = config;
  const isPending = payment?.status === PaymentStatus.PENDING;
  const isCompleted = payment?.status === PaymentStatus.COMPLETED;
  const receiptRecord = isCompleted
    ? await getOnlinePaymentReceiptRecord(transactionId)
    : null;
  const isFailed =
    !isCompleted && !isPending;

  return (
    <StatusShell>
      {/* ── Header ── */}
      <div className="flex flex-col items-center gap-5 pt-2 pb-6 text-center">
        {/* Icon */}
        <div className={`rounded-full p-5 ${config.iconWrapClass} transition-transform duration-500 hover:scale-105`}>
          <Icon className={`h-12 w-12 ${config.iconClass}`} />
        </div>

        {/* Title + badge */}
        <div className="space-y-2">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 leading-tight">
            {config.title}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            {config.subtitle}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest ${config.badgeClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {config.label}
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* ── Transaction details ── */}
      <div className="py-6 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400 mb-4">
          Transaction Details
        </p>

        <DetailRow
          label="Transaction ID"
          value={
            <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 select-all">
              {transactionId}
            </span>
          }
        />

        {payment && (
          <>
            <DetailRow
              label="Amount Paid"
              value={
                <span className="text-base font-bold text-slate-900">
                  {formatCurrencyINWithSymbol(
                    payment.amount + (payment.platformFee ?? 0)
                  )}
                </span>
              }
            />
            <DetailRow
              label="Fee Category"
              value={
                <span className="font-semibold capitalize text-slate-800">
                  {payment.fee.feeCategory.name}
                </span>
              }
            />
          </>
        )}

        <DetailRow
          label="Date & Time"
          value={
            <span className="font-medium text-slate-700 text-sm">
              {formatDateTimeIN(
                payment?.paymentDate ?? payment?.createdAt ?? new Date()
              )}
            </span>
          }
        />
      </div>

      {/* ── Divider ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* ── Actions ── */}
      <div className="pt-6 space-y-4">
        {isCompleted && (
          <>
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium text-center leading-relaxed ${config.bannerClass}`}
            >
              Your records are updated. Download your official receipt below.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {receiptRecord && (
                <ReceiptDownloadButton
                  record={receiptRecord}
                  variant="default"
                  size="lg"
                  className="w-full sm:flex-1 min-h-11 rounded-xl px-5 py-0 text-sm font-semibold shadow-sm"
                />
              )}
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl font-semibold text-sm gap-2"
                asChild
              >
                <Link href={feesUrl}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Fees
                </Link>
              </Button>
            </div>
          </>
        )}

        {isPending && (
          <>
            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm font-medium">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking with your bank…</span>
            </div>
            <p className="text-xs text-slate-500 text-center max-w-xs mx-auto leading-relaxed">
              Completed the payment? It may take a moment to reflect. We're
              waiting for PhonePe confirmation.
            </p>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold text-sm gap-2"
              asChild
            >
              <Link href={`/api/phonepay-callback/${transactionId}?verify=1`}>
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Link>
            </Button>
          </>
        )}

        {isFailed && (
          <div className="flex flex-col gap-3">
            <Button
              className="h-11 rounded-xl font-semibold text-sm shadow-sm"
              asChild
              size="lg"
            >
              <Link href={feesUrl}>Try Again</Link>
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-xl text-sm text-slate-500 hover:text-slate-800"
              asChild
            >
              <Link href="/support">Contact Support</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
        <Shield className="h-3 w-3" />
        <span>Secured by PhonePe · Encrypted</span>
      </div>
    </StatusShell>
  );
}

// ─── Shell wrapper ────────────────────────────────────────────────────────────
function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/80 px-8 py-8">
        {children}
      </div>
    </div>
  );
}

// ─── Detail row ──────────────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <div className="text-right">{value}</div>
    </div>
  );
}

// ─── Skeleton fallback ────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl px-8 py-8 animate-pulse space-y-5">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-7 bg-slate-100 rounded-lg w-48 mx-auto" />
          <div className="h-4 bg-slate-100 rounded w-64 mx-auto" />
        </div>
        <div className="h-px bg-slate-100 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-slate-100 rounded w-28" />
              <div className="h-4 bg-slate-100 rounded w-32" />
            </div>
          ))}
        </div>
        <div className="h-px bg-slate-100 w-full" />
        <div className="h-11 bg-slate-100 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function PaymentStatusPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PaymentStatusContent searchParams={searchParams} />
    </Suspense>
  );
}
