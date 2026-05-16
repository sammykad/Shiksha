"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Plus,
  School2,
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
import { cn } from "@/lib/utils";

type Status = "healthy" | "warning" | "critical";
type BranchStatus = "ready" | "multi" | "pending";

type Organization = {
  id: string;
  name: string;
  location: string;
  organizationType: "School" | "College" | "Coaching";
  academicYear: string;
  status: Status;
  students: number;
  feeCollected: number;
  pendingDues: number;
  attendance: number;
  campusCount: number;
  branchStatus: BranchStatus;
  branchSummary: string;
  attention: string[];
};

const ORGANIZATIONS: Organization[] = [
  {
    id: "shiksha-school",
    name: "Shiksha Vidyalaya",
    location: "Kothrud, Pune",
    organizationType: "School",
    academicYear: "2026-27",
    status: "healthy",
    students: 1240,
    feeCollected: 8200000,
    pendingDues: 1400000,
    attendance: 91,
    campusCount: 1,
    branchStatus: "ready",
    branchSummary: "1 campus",
    attention: [],
  },
  {
    id: "shiksha-college",
    name: "Shiksha Junior College",
    location: "Andheri West, Mumbai",
    organizationType: "College",
    academicYear: "2026-27",
    status: "warning",
    students: 2100,
    feeCollected: 11000000,
    pendingDues: 1800000,
    attendance: 84,
    campusCount: 3,
    branchStatus: "multi",
    branchSummary: "3 branches",
    attention: ["Pending dues are above target", "Attendance is trending down"],
  },
  {
    id: "shiksha-coaching",
    name: "Shiksha Coaching Center",
    location: "Gangapur Road, Nashik",
    organizationType: "Coaching",
    academicYear: "2026 batches",
    status: "critical",
    students: 1480,
    feeCollected: 4800000,
    pendingDues: 600000,
    attendance: 72,
    campusCount: 0,
    branchStatus: "pending",
    branchSummary: "Branch setup pending",
    attention: ["Payment account setup pending", "Attendance below 75%"],
  },
];

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

const totals = ORGANIZATIONS.reduce(
  (acc, organization) => ({
    students: acc.students + organization.students,
    feeCollected: acc.feeCollected + organization.feeCollected,
    pendingDues: acc.pendingDues + organization.pendingDues,
    attendance:
      acc.attendance + organization.attendance * organization.students,
  }),
  { students: 0, feeCollected: 0, pendingDues: 0, attendance: 0 }
);

const averageAttendance =
  totals.students > 0 ? Math.round(totals.attendance / totals.students) : 0;

const attentionItems = ORGANIZATIONS.flatMap((organization) =>
  organization.attention.map((item) => ({
    id: `${organization.id}-${item}`,
    organization: organization.name,
    item,
    status: organization.status,
  }))
);

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

function OrganizationMobileCard({ organization }: { organization: Organization }) {
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
          <StatusBadge status={organization.status} />
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

export default function InstitutionDashboard() {
  return (
    <div className="flex flex-col gap-6 px-2">
      <PageHeader
        icon={Landmark}
        title="Institution Overview"
        description="Shiksha Group - 3 organizations - May 2026"
        actions={
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Add organization
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Organizations"
          value={ORGANIZATIONS.length.toString()}
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
          value={`${averageAttendance}%`}
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
                    <TableHead>Academic year</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ORGANIZATIONS.map((organization) => (
                    <TableRow key={organization.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="max-w-52 truncate font-medium text-foreground">
                            {organization.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {organization.organizationType} - {organization.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {organization.academicYear}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {organization.students.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(organization.feeCollected)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(organization.pendingDues)}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-28 flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium tabular-nums">
                              {organization.attendance}%
                            </span>
                          </div>
                          <Progress
                            value={organization.attendance}
                            className={cn(
                              "h-1.5",
                              STATUS_STYLES[organization.status].progress
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap gap-1.5",
                            BRANCH_STYLES[organization.branchStatus]
                          )}
                        >
                          <MapPinned className="size-3" />
                          {organization.branchSummary}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={organization.status} />
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
              {ORGANIZATIONS.map((organization) => (
                <OrganizationMobileCard
                  key={organization.id}
                  organization={organization}
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
          {ORGANIZATIONS.map((organization) => {
            const total = organization.feeCollected + organization.pendingDues;
            const collectedPercent =
              total > 0 ? Math.round((organization.feeCollected / total) * 100) : 0;

            return (
              <div key={organization.id} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {organization.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(organization.feeCollected)} collected -{" "}
                      {formatCurrency(organization.pendingDues)} pending
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
