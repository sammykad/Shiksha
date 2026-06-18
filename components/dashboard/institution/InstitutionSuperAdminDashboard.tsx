import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CreditCard,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDateIN } from "@/lib/utils";
import type { InstitutionDashboardData, OrganizationDashboardItem } from "@/lib/data/institution/get-institution-dashboard";

type Status = "healthy" | "warning" | "critical";
type BranchStatus = "ready" | "multi" | "pending";

const STATUS_STYLES: Record<
  Status,
  { label: string; badge: string; dot: string; progress: string }
> = {
  healthy: {
    label: "Healthy",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    progress: "[&>div]:bg-emerald-500",
  },
  warning: {
    label: "Attention",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    progress: "[&>div]:bg-amber-500",
  },
  critical: {
    label: "Critical",
    badge: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
    progress: "[&>div]:bg-red-500",
  },
};

const BRANCH_STYLES: Record<BranchStatus, string> = {
  ready: "bg-muted text-muted-foreground border-border",
  multi: "bg-blue-50 text-blue-700 border-blue-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}K`;
  return `Rs ${amount.toLocaleString("en-IN")}`;
};

function StatusBadge({ status }: { status: Status }) {
  const style = STATUS_STYLES[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full px-2.5 py-1 text-[11px]", style.badge)}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </Badge>
  );
}

const SUBSCRIPTION_STYLES: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  TRIALING: { label: "Trial", badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  ACTIVE: { label: "Active", badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  PAST_DUE: { label: "Past Due", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  PAUSED: { label: "Paused", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  CANCELLED: { label: "Cancelled", badge: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  EXPIRED: { label: "Expired", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function SubscriptionBadge({ status, planName }: { status: string; planName: string }) {
  const style = SUBSCRIPTION_STYLES[status] ?? SUBSCRIPTION_STYLES.EXPIRED;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full px-2.5 py-1 text-[11px]", style.badge)}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {planName} &middot; {style.label}
    </Badge>
  );
}

function BillingAlertBanner({ organizations }: { organizations: OrganizationDashboardItem[] }) {
  const critical = organizations.filter(o => o.subscription?.billingStatus === 'critical');
  if (critical.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center gap-3 p-4">
        <CreditCard className="size-5 shrink-0 text-red-600" />
        <div className="min-w-0 text-sm text-red-800">
          <span className="font-semibold">{critical.length}</span>{' '}
          {critical.length === 1 ? 'organization has' : 'organizations have'} a billing issue:{' '}
          {critical.map(o => o.name).join(', ')}.
          <span className="ml-1 text-red-600">Review subscription details.</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 truncate text-2xl font-semibold tabular-nums text-foreground">
              {value}
            </p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function OrganizationMobileCard({ organization }: { organization: OrganizationDashboardItem }) {
  return (
    <Card className="overflow-hidden md:hidden">
      <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {organization.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {organization.organizationType} - {organization.location}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusBadge status={organization.status} />
              {organization.subscription && (
                <SubscriptionBadge
                  status={organization.subscription.status}
                  planName={organization.subscription.planName}
                />
              )}
            </div>
          </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Students" value={organization.students.toLocaleString("en-IN")} />
          <Metric label="Academic year" value={organization.academicYear} />
          <Metric label="Collected" value={formatCurrency(organization.feeCollected)} />
          <Metric label="Pending" value={formatCurrency(organization.pendingDues)} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Attendance</span>
            <span className="text-sm font-medium tabular-nums">
              {organization.attendance}%
            </span>
          </div>
          <Progress
            value={organization.attendance}
            className={cn("h-1.5", STATUS_STYLES[organization.status].progress)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5", BRANCH_STYLES[organization.branchStatus])}
          >
            <MapPinned className="size-3" />
            {organization.branchSummary}
          </Badge>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">
              Open dashboard
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type InstitutionSuperAdminDashboardProps = {
  data: InstitutionDashboardData;
};

export default function InstitutionSuperAdminDashboard({
  data,
}: InstitutionSuperAdminDashboardProps) {
  const { organizations, totals, attentionItems, institutionName } = data;

  return (
    <div className="flex flex-col gap-6 px-2">
      <PageHeader
        icon={Landmark}
        title="Institution Overview"
        description={`${institutionName} - ${organizations.length} organizations`}
        actions={
          <Button asChild size="sm">
            <Link href="/select-organization?returnUrl=/dashboard/institution">
              <Plus data-icon="inline-start" />
              Add organization
            </Link>
          </Button>
        }
      />

      <BillingAlertBanner organizations={organizations} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Organizations"
          value={organizations.length.toString()}
          description="Active units under this institution"
          icon={Building2}
        />
        <SummaryCard
          title="Students"
          value={totals.students.toLocaleString("en-IN")}
          description="Across all organizations"
          icon={Users}
        />
        <SummaryCard
          title="Fee Collected"
          value={formatCurrency(totals.feeCollected)}
          description="Current reporting period"
          icon={IndianRupee}
        />
        <SummaryCard
          title="Pending Dues"
          value={formatCurrency(totals.pendingDues)}
          description="Owner attention recommended"
          icon={AlertTriangle}
        />
        <SummaryCard
          title="Attendance"
          value={`${totals.attendance}%`}
          description="Weighted by student count"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Organization Health</CardTitle>
                <CardDescription>
                  Compare each organization before opening daily operations.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit gap-1.5">
                <LayoutDashboard className="size-3" />
                Read-only owner view
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Academic year</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="max-w-44 truncate font-medium text-foreground">
                            {org.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {org.organizationType} - {org.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {org.subscription ? (
                          <div className="flex flex-col gap-0.5">
                            <SubscriptionBadge
                              status={org.subscription.status}
                              planName={org.subscription.planName}
                            />
                            {org.subscription.periodEnd && (
                              <span className="text-[11px] text-muted-foreground">
                                Expires {formatDateIN(org.subscription.periodEnd)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {org.academicYear}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {org.students.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(org.feeCollected)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(org.pendingDues)}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-28 flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium tabular-nums">
                              {org.attendance}%
                            </span>
                          </div>
                          <Progress
                            value={org.attendance}
                            className={cn(
                              "h-1.5",
                              STATUS_STYLES[org.status].progress
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap gap-1.5",
                            BRANCH_STYLES[org.branchStatus]
                          )}
                        >
                          <MapPinned className="size-3" />
                          {org.branchSummary}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard">
                            Open
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 p-3 md:hidden">
              {organizations.map((org) => (
                <OrganizationMobileCard
                  key={org.id}
                  organization={org}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>
              Owner-level signals before entering an organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-lg border bg-muted/20 p-3"
              >
                <div
                  className={cn(
                    "mt-1 size-2 rounded-full",
                    STATUS_STYLES[item.status].dot
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.organization}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.item}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Comparison</CardTitle>
          <CardDescription>
            Collected and pending fee view by organization. Branch drill-down can
            plug into each row later.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {organizations.map((org) => {
            const total = org.feeCollected + org.pendingDues;
            const collectedPercent =
              total > 0 ? Math.round((org.feeCollected / total) * 100) : 0;

            return (
              <div key={org.id} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {org.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(org.feeCollected)} collected -{" "}
                      {formatCurrency(org.pendingDues)} pending
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {collectedPercent}% collected
                  </Badge>
                </div>
                <Progress value={collectedPercent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
