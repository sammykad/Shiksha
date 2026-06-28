import * as React from "react";
import {
    BaseEmailLayout,
    EmailHeading,
    EmailSubheading,
    EmailParagraph,
    Badge,
    AlertBox,
    InfoRow,
    SectionLabel,
    Divider,
    GreenDivider,
} from "../layout";
import { formatDateIN } from "@/lib/utils";
import { LeaveApprovedVariables } from "@/lib/notifications/template";

const LeaveApprovedEmail = (props: LeaveApprovedVariables) => {
    const {
        organizationName,
        appliedBy,
        startDate,
        endDate,
        totalDays,
        leaveType,
        approvedBy,
        approvedAt,
    } = props;

    return (
        <BaseEmailLayout
            preview={`Your ${leaveType} leave request has been approved`}
            organizationName={organizationName}
        >
            <Badge variant="success">Leave Approved</Badge>

            <EmailHeading>Leave Application Approved</EmailHeading>
            <EmailSubheading>
                Your request has been reviewed and approved.
            </EmailSubheading>

            <EmailParagraph>Dear {appliedBy},</EmailParagraph>

            <AlertBox variant="success">
                Your <strong>{leaveType}</strong> leave application for{" "}
                <strong>{totalDays} day{totalDays !== 1 ? "s" : ""}</strong> has been
                approved. Please ensure all pending responsibilities are handed over before
                your leave begins.
            </AlertBox>

            <Divider />

            <SectionLabel>Leave Details</SectionLabel>

            <InfoRow label="Leave Type" value={leaveType} />
            <InfoRow label="From" value={formatDateIN(startDate)} />
            <InfoRow label="To" value={formatDateIN(endDate)} />
            <InfoRow
                label="Duration"
                value={`${totalDays} day${totalDays !== 1 ? "s" : ""}`}
                highlight
            />

            {(approvedBy || approvedAt) && (
                <>
                    <GreenDivider />
                    <SectionLabel>Approval Details</SectionLabel>
                    {approvedBy && <InfoRow label="Approved By" value={approvedBy} />}
                    {approvedAt && <InfoRow label="Approved On" value={formatDateIN(approvedAt)} />}
                </>
            )}

            <Divider />

            <EmailParagraph>
                Please make the necessary arrangements before your leave period begins. If
                your plans change and you need to cancel or modify this leave, contact
                administration at the earliest.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default LeaveApprovedEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

LeaveApprovedEmail.PreviewProps = {
    organizationName: "Springfield High School",
    appliedBy: "Rajesh Kumar",
    startDate: new Date("2026-03-20"),
    endDate: new Date("2026-03-22"),
    totalDays: 3,
    leaveType: "CASUAL",
    approvedBy: "Head of Admin",
    approvedAt: new Date("2026-03-17"),
} satisfies LeaveApprovedVariables;