"use client";

import { useMemo } from "react";
import { BarChart3, PlusIcon, TrendingUp, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FunnelChart, type FunnelStage } from "@/components/dashboard/leads/funnel-chart";
import { LeadStatus } from "@/generated/prisma/enums";

interface LeadFunnelDialogProps {
  leads: Array<{
    status: LeadStatus;
  }>;
}

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const reachedStageStatuses = {
  contacted: [
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.INTERESTED,
    LeadStatus.VISIT_SCHEDULED,
    LeadStatus.VISITED,
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.NEGOTIATION,
    LeadStatus.CONVERTED,
  ],
  qualified: [
    LeadStatus.QUALIFIED,
    LeadStatus.VISIT_SCHEDULED,
    LeadStatus.VISITED,
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.NEGOTIATION,
    LeadStatus.CONVERTED,
  ],
  proposal: [
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.NEGOTIATION,
    LeadStatus.CONVERTED,
  ],
} as const;

function countByStatus(
  statusCounts: Map<LeadStatus, number>,
  statuses: readonly LeadStatus[]
) {
  return statuses.reduce((total, status) => total + (statusCounts.get(status) ?? 0), 0);
}

export function LeadFunnelDialog({ leads }: LeadFunnelDialogProps) {
  const funnelData = useMemo<FunnelStage[]>(() => {
    const statusCounts = leads.reduce((counts, lead) => {
      counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
      return counts;
    }, new Map<LeadStatus, number>());

    const totalLeads = leads.length;
    const contacted = countByStatus(statusCounts, reachedStageStatuses.contacted);
    const qualified = countByStatus(statusCounts, reachedStageStatuses.qualified);
    const proposal = countByStatus(statusCounts, reachedStageStatuses.proposal);
    const converted = statusCounts.get(LeadStatus.CONVERTED) ?? 0;

    return [
      { label: "Total", value: totalLeads, displayValue: compactNumberFormatter.format(totalLeads) },
      { label: "Contacted", value: contacted, displayValue: compactNumberFormatter.format(contacted) },
      { label: "Qualified", value: qualified, displayValue: compactNumberFormatter.format(qualified) },
      { label: "Proposal", value: proposal, displayValue: compactNumberFormatter.format(proposal) },
      { label: "Converted", value: converted, displayValue: compactNumberFormatter.format(converted) },
    ];
  }, [leads]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" aria-label="Open lead funnel">
          <BarChart3 size={16} className="opacity-60" aria-hidden="true" />
          <span className="max-sm:hidden">Funnel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(720px,calc(100vw-2rem))] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Lead Funnel</DialogTitle>
          <DialogDescription>
            A quick conversion view from enquiry volume to converted admissions.
          </DialogDescription>
        </DialogHeader>
        {leads.length > 0 ? (
          <div className="flex justify-center py-2">
            <FunnelChart
              className="min-h-[520px] w-full max-w-sm"
              color="hsl(var(--chart-1))"
              data={funnelData}
              gap={4}
              grid={{ bands: false, lines: true }}
              layers={3}
              orientation="vertical"
            />
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <EmptyState
              action={{
                href: "/dashboard/leads/create",
                icon: PlusIcon,
                label: "Create Lead",
              }}
              className="max-w-full p-8"
              compact
              description="Add your first enquiry to start seeing how leads move from contact to conversion."
              icons={[Users, TrendingUp, BarChart3]}
              title="Your lead funnel will appear here"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
