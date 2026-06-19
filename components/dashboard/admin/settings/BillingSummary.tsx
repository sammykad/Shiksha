"use client";

import { Progress } from "@/components/ui/progress";
import { formatCostINR } from "@/lib/utils";
import React from "react";
import { NotificationChannel } from "@/generated/prisma/enums";

// ── Types ────────────────────────────────────────────────────────────────────

type ChannelStats = {
  units: number;
  cost: number;
};

export type BillingSummaryData = {
  channelSummary: Record<NotificationChannel, ChannelStats>;
  totalMessages: number;
  totalStorageMB: number | string;
  totalCost: number;
  walletBalance: number;
  subscription: {
    id: string;
    status: string;
    pricingMode: string;
    planName: string;
    planCode: string | null;
    offerName: string | null;
    billingCycle: string;
    billingMetric: string;
    studentCount: number;
    studentLimit: number | null;
    price: number | null;
    unitPrice: number | null;
    customPrice: number | null;
    contractReference: string | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    nextInvoiceAmount: number;
    breakdown: string;
  } | null;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string | null;
    status: string;
    total: number;
    periodStart: string;
    periodEnd: string;
    paidAt: string | null;
  }>;
  recentPayments: Array<{
    id: string;
    provider: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  billingEvents: Array<{
    id: string;
    type: string;
    message: string | null;
    createdAt: string;
  }>;
};

export type BillingSummaryProps = {
  data: BillingSummaryData;
  className?: string;
};

// ── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  PUSH: "Push",
};

const CHANNEL_ORDER: NotificationChannel[] = ["EMAIL", "SMS", "WHATSAPP", "PUSH"];

const fmtUnits = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const mb = (v: number | string) =>
  `${typeof v === "string" ? v : Number(v).toFixed(2)} MB`;

// Proportion: exact one-decimal percentage, never rounded to a bogus integer.
// The last row absorbs any remainder so the column always sums to 100%.
function buildProportions(rows: { units: number }[], total: number): string[] {
  if (total === 0) return rows.map(() => "0.0");
  const raw = rows.map((r) => (r.units / total) * 100);
  // floor each to 1dp, track remainder
  const floored = raw.map((v) => Math.floor(v * 10) / 10);
  const sumFloored = floored.reduce((a, b) => a + b, 0);
  const remainder = parseFloat((100 - sumFloored).toFixed(1));
  // add remainder to the largest row
  const maxIdx = raw.indexOf(Math.max(...raw));
  floored[maxIdx] = parseFloat((floored[maxIdx] + remainder).toFixed(1));
  return floored.map((v) => v.toFixed(1));
}

// ── Component ────────────────────────────────────────────────────────────────

export const BillingSummary: React.FC<BillingSummaryProps> = ({ data, className }) => {
  const { channelSummary, totalMessages, totalStorageMB, totalCost } = data;

  const channelRows = CHANNEL_ORDER.map((ch) => ({
    channel: ch,
    label: CHANNEL_LABELS[ch],
    units: channelSummary[ch]?.units ?? 0,
    cost: channelSummary[ch]?.cost ?? 0,
  }));

  const proportions = buildProportions(channelRows, totalMessages);

  const storagePct = Math.min(
    100,
    (Number(totalStorageMB) / 1024) * 100
  );

  return (
    <section className={"w-full space-y-6 " + (className ?? "")}>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Storage */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Storage Used</div>
          <div className="mt-1 text-2xl font-semibold">{mb(totalStorageMB)}</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${storagePct.toFixed(2)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">vs 1 GB cap</p>
        </div>

        {/* Messages */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Messages Sent</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{fmtUnits(totalMessages)}</div>
          <p className="mt-1 text-xs text-muted-foreground">Across all channels</p>
        </div>

        {/* Cost */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Spend</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {formatCostINR(totalCost)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">All channels combined</p>
        </div>

      </div>

      {/* ── Channel usage table ── */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b p-4">
          <h3 className="text-base font-medium">Channel Usage</h3>
          <p className="text-sm text-muted-foreground">Units sent and exact cost per channel</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Channel</th>
                <th className="p-3 font-medium">Units</th>
                <th className="p-3 font-medium">Cost</th>
                <th className="p-3 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map((row, i) => (
                <tr key={row.channel} className="border-t">
                  <td className="p-3">{row.label}</td>
                  <td className="p-3 tabular-nums">{fmtUnits(row.units)}</td>
                  <td className="p-3 tabular-nums">{formatCostINR(row.cost)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Progress value={parseFloat(proportions[i])} className="h-2 flex-1" />
                      <span className="w-14 shrink-0 text-right tabular-nums text-muted-foreground">
                        {proportions[i]}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-medium">
                <td className="p-3">Total</td>
                <td className="p-3 tabular-nums">{fmtUnits(totalMessages)}</td>
                <td className="p-3 tabular-nums">{formatCostINR(totalCost)}</td>
                <td className="p-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </section>
  );
};

export default BillingSummary;
