import { redirect } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2, Clock3, IndianRupee, Search, Send, XCircle, type LucideIcon } from "lucide-react";
import type React from "react";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { getOrganizationId } from "@/lib/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationChannel, NotificationStatus, NotificationType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    channel?: string;
    status?: string;
    type?: string;
    from?: string;
    to?: string;
  }>;
};

type LogFilters = {
  q: string;
  channel: string;
  status: string;
  type: string;
  from: string;
  to: string;
};

const channels = Object.values(NotificationChannel);
const statuses = Object.values(NotificationStatus);
const types = Object.values(NotificationType);

export async function applyNotificationLogFilters(formData: FormData) {
  "use server";

  const params = new URLSearchParams();
  for (const key of ["q", "channel", "status", "type", "from", "to"]) {
    const value = String(formData.get(key) ?? "").trim();
    if (value && value !== "ALL") params.set(key, value);
  }

  const query = params.toString();
  redirect(`/dashboard/notification-logs${query ? `?${query}` : ""}`);
}

function parseDate(value: string, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setDate(date.getDate() + 1);
  return date;
}

function buildWhere(organizationId: string, filters: LogFilters) {
  const where: any = { organizationId };
  const and: any[] = [];

  if (channels.includes(filters.channel as NotificationChannel)) {
    where.channel = filters.channel;
  }

  if (statuses.includes(filters.status as NotificationStatus)) {
    where.status = filters.status;
  }

  if (types.includes(filters.type as NotificationType)) {
    where.notificationType = filters.type;
  }

  const fromDate = parseDate(filters.from);
  const toDate = parseDate(filters.to, true);
  if (fromDate || toDate) {
    where.sentAt = {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lt: toDate } : {}),
    };
  }

  if (filters.q) {
    and.push({
      OR: [
        { to: { contains: filters.q, mode: "insensitive" } },
        { errorMessage: { contains: filters.q, mode: "insensitive" } },
        { idempotencyKey: { contains: filters.q, mode: "insensitive" } },
        { notification: { title: { contains: filters.q, mode: "insensitive" } } },
        { notification: { message: { contains: filters.q, mode: "insensitive" } } },
      ],
    });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

async function getNotificationLogData(filters: LogFilters) {
  const organizationId = await getOrganizationId();
  const where = buildWhere(organizationId, filters);

  const [logs, total, sent, failed, pending, delivered, cost] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: 100,
      select: {
        id: true,
        notificationType: true,
        channel: true,
        status: true,
        to: true,
        cost: true,
        units: true,
        retryCount: true,
        errorMessage: true,
        sentAt: true,
        createdAt: true,
        idempotencyKey: true,
        notification: {
          select: {
            title: true,
            message: true,
            academicYear: { select: { name: true } },
            user: { select: { firstName: true, lastName: true, email: true } },
            student: { select: { firstName: true, lastName: true, rollNumber: true } },
            parent: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
          },
        },
      },
    }),
    prisma.notificationLog.count({ where }),
    prisma.notificationLog.count({ where: { ...where, status: "SENT" } }),
    prisma.notificationLog.count({ where: { ...where, status: "FAILED" } }),
    prisma.notificationLog.count({ where: { ...where, status: "PENDING" } }),
    prisma.notificationLog.count({ where: { ...where, status: "DELIVERED" } }),
    prisma.notificationLog.aggregate({ where, _sum: { cost: true, units: true } }),
  ]);

  return {
    logs,
    total,
    stats: {
      sent,
      failed,
      pending,
      delivered,
      cost: cost._sum.cost ?? 0,
      units: cost._sum.units ?? 0,
    },
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function recipientName(log: Awaited<ReturnType<typeof getNotificationLogData>>["logs"][number]) {
  const { user, student, parent } = log.notification;
  if (student) {
    return `${student.firstName} ${student.lastName}${student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}`;
  }
  if (parent) return `${parent.firstName} ${parent.lastName}`;
  if (user) return `${user.firstName} ${user.lastName}`.trim() || user.email;
  return "Unknown recipient";
}

function statusClass(status: NotificationStatus) {
  const classes: Record<NotificationStatus, string> = {
    SENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DELIVERED: "bg-blue-50 text-blue-700 border-blue-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
  };
  return classes[status];
}

function channelClass(channel: NotificationChannel) {
  const classes: Record<NotificationChannel, string> = {
    EMAIL: "bg-sky-50 text-sky-700 border-sky-200",
    SMS: "bg-violet-50 text-violet-700 border-violet-200",
    WHATSAPP: "bg-green-50 text-green-700 border-green-200",
    PUSH: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return classes[channel];
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className={cn("rounded-md p-2", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function NotificationLogsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (user.organizationRole !== "ADMIN") redirect("/dashboard/forbidden");

  const params = await searchParams;
  const filters: LogFilters = {
    q: params.q ?? "",
    channel: params.channel ?? "ALL",
    status: params.status ?? "ALL",
    type: params.type ?? "ALL",
    from: params.from ?? "",
    to: params.to ?? "",
  };

  const { logs, total, stats } = await getNotificationLogData(filters);

  return (
    <div className="space-y-6 px-2">
      <PageHeader
        title="Notification Logs"
        description="Inspect channel delivery, provider failures, retries, recipients, and billing units."
        icon={Activity}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Logs" value={total} icon={Activity} tone="bg-slate-100 text-slate-700" />
        <StatCard title="Sent" value={stats.sent + stats.delivered} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} tone="bg-red-50 text-red-700" />
        <StatCard title="Pending" value={stats.pending} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        <StatCard title="Cost" value={formatCurrency(stats.cost)} icon={IndianRupee} tone="bg-blue-50 text-blue-700" />
      </div>

      <Card className="rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={applyNotificationLogFilters} className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="q"
                defaultValue={filters.q}
                placeholder="Search recipient, message, error, key"
                className="pl-9"
              />
            </div>

            <select name="channel" defaultValue={filters.channel} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="ALL">All channels</option>
              {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>

            <select name="status" defaultValue={filters.status} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="ALL">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>

            <select name="type" defaultValue={filters.type} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="ALL">All types</option>
              {types.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>

            <Input name="from" type="date" defaultValue={filters.from} />
            <Input name="to" type="date" defaultValue={filters.to} />

            <Button type="submit" className="h-10">
              <Search className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg">
        <CardHeader className="border-b bg-slate-50/60 py-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Latest Delivery Attempts</CardTitle>
            <p className="text-sm text-slate-500">Showing {logs.length} of {total}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <AlertCircle className="mb-3 h-9 w-9 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No notification logs found</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">Try widening the date range or clearing one of the channel/status filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="min-w-[190px]">Time</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="min-w-[320px]">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={cn(
                      log.status === "FAILED" && "border-l-4 border-l-red-500 bg-red-50/30 hover:bg-red-50/60"
                    )}
                  >
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{formatDate(log.sentAt)}</div>
                      <div className="text-xs text-slate-500">{log.notification.academicYear?.name ?? "No academic year"}</div>
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <div className="flex items-center gap-2">
                        <Pill className="border-slate-200 bg-slate-50 text-slate-700">{log.notificationType}</Pill>
                      </div>
                      <div className="mt-2 truncate text-sm font-medium text-slate-950">{log.notification.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{log.notification.message}</div>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="truncate text-sm font-medium text-slate-900">{recipientName(log)}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{log.to ?? "No destination captured"}</div>
                    </TableCell>
                    <TableCell>
                      <Pill className={channelClass(log.channel)}>
                        <Send className="mr-1 h-3 w-3" />
                        {log.channel}
                      </Pill>
                    </TableCell>
                    <TableCell>
                      <Pill className={statusClass(log.status)}>{log.status}</Pill>
                      {log.retryCount > 0 && (
                        <div className="mt-1 text-xs text-slate-500">{log.retryCount} retry</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{log.units}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(log.cost)}</TableCell>
                    <TableCell className="max-w-[420px]">
                      {log.errorMessage ? (
                        <div className="rounded-md border border-red-200 bg-white p-3 shadow-sm">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Delivery error
                          </div>
                          <p className="whitespace-pre-wrap break-words text-xs font-medium leading-5 text-red-700">
                            {log.errorMessage}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
