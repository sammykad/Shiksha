import * as React from "react";
import {
  BaseEmailLayout,
  EmailHeading,
  EmailParagraph,
  Badge,
  AlertBox,
  InfoRow,
  SectionLabel,
  Divider,
} from "../layout";
import { formatCurrencyIN } from "@/lib/utils";

export type FeeSenseReportProps = {
  organizationName: string;
  date: string;
  totalStudents: number;
  analysed: number;
  sent: number;
  skipped: number;
  errors: number;
  totalOverdue: number;
  voiceCalls: number;
  riskCounts: { LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number };
  topRisk: Array<{ studentName: string; riskLevel: string; pendingAmount: number; issue: string }>;
  neverPaidCount: number;
  nlSummary: string;
};

export default function FeeSenseReportEmail(props: FeeSenseReportProps) {
  const {
    organizationName, date, totalStudents, analysed, sent, skipped, errors,
    totalOverdue, voiceCalls, riskCounts, topRisk, neverPaidCount, nlSummary,
  } = props;

  const hasIssues = errors > 0 || riskCounts.CRITICAL > 0
  const hasNoData = analysed === 0

  return (
    <BaseEmailLayout
      preview={`FeeSense AI Report: ${analysed} students analysed, ${sent} reminders sent`}
      organizationName={organizationName}
    >
      <Badge variant={hasIssues ? 'warning' : 'success'}>
        {hasNoData ? 'No Activity' : hasIssues ? 'Issues Detected' : 'All Clear'}
      </Badge>

      <EmailHeading>
        {hasNoData
          ? 'No overdue fees to process today'
          : `FeeSense AI — ${date}`}
      </EmailHeading>

      {hasNoData ? (
        <>
          <EmailParagraph>
            FeeSense AI completed its scheduled run. No students had overdue fees, so no notifications were sent. Everything is up to date.
          </EmailParagraph>
          <Divider />
          <EmailParagraph muted>
            Regards,{'\n'}{organizationName}
          </EmailParagraph>
        </>
      ) : (
        <>
          <EmailParagraph>{nlSummary}</EmailParagraph>

          <Divider />

          <SectionLabel>Activity Summary</SectionLabel>
          <InfoRow label="Students processed" value={String(totalStudents)} />
          <InfoRow label="Reminders sent" value={String(sent)} highlight />
          <InfoRow label="Skipped" value={String(skipped)} />
          <InfoRow label="Voice calls scheduled" value={String(voiceCalls)} />
          <InfoRow label="Errors" value={String(errors)} />
          <InfoRow
            label="Total overdue"
            value={`₹${formatCurrencyIN(totalOverdue)}`}
            highlight
          />

          <Divider />

          <SectionLabel>Risk Breakdown</SectionLabel>
          <InfoRow label="Critical" value={String(riskCounts.CRITICAL)} />
          <InfoRow label="High" value={String(riskCounts.HIGH)} />
          <InfoRow label="Medium" value={String(riskCounts.MEDIUM)} />
          <InfoRow label="Low" value={String(riskCounts.LOW)} />

          {neverPaidCount > 0 && (
            <AlertBox variant="warning">
              {neverPaidCount} student(s) have never made a payment. Personal follow-up recommended.
            </AlertBox>
          )}

          {topRisk.length > 0 && (
            <>
              <Divider />
              <SectionLabel>Needs Attention</SectionLabel>
              {topRisk.slice(0, 5).map((s, i) => (
                <InfoRow
                  key={i}
                  label={s.studentName}
                  value={`${s.riskLevel} — ₹${formatCurrencyIN(s.pendingAmount)}`}
                  highlight={s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH'}
                />
              ))}
            </>
          )}

          {errors > 0 && (
            <AlertBox variant="error">
              {errors} notification(s) failed to send. Check the dashboard for details.
            </AlertBox>
          )}

          <Divider />

          <EmailParagraph muted>
            This report was generated automatically by FeeSense AI. No manual action was required.
          </EmailParagraph>
          <EmailParagraph muted>
            Regards,{'\n'}{organizationName}
          </EmailParagraph>
        </>
      )}
    </BaseEmailLayout>
  )
}
