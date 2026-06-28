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
} from "../layout";
import { formatDateIN } from "@/lib/utils";
import { LeaveRejectedVariables } from "@/lib/notifications/template";

const LeaveRejectedEmail = (props: LeaveRejectedVariables) => {
    const {
        organizationName,
        appliedBy,
        startDate,
        endDate,
        totalDays,
        leaveType,
        rejectedNote,
        reason,
        rejectedBy,
    } = props;

    return (
        <BaseEmailLayout
            preview={`Your ${leaveType} leave request has not been approved`}
            organizationName={organizationName}
        >
            <Badge variant="error">Leave Rejected</Badge>

            <EmailHeading>Leave Application Rejected</EmailHeading>
            <EmailSubheading>
                Your request could not be approved at this time.
            </EmailSubheading>

            <EmailParagraph>Dear {appliedBy},</EmailParagraph>

            <AlertBox variant="error">
                Your {leaveType} leave application has been rejected.
                {rejectedNote ? ` ${rejectedNote}` : " Please contact administration for further details."}
            </AlertBox>

            <Divider />

            <SectionLabel>Leave Details</SectionLabel>

            <InfoRow label="Leave Type" value={leaveType} />
            <InfoRow label="From" value={formatDateIN(startDate)} />
            <InfoRow label="To" value={formatDateIN(endDate)} />
            <InfoRow label="Duration" value={`${totalDays} day${totalDays !== 1 ? "s" : ""}`} highlight />
            {reason && <InfoRow label="Applied Reason" value={reason} />}
            {rejectedBy && <InfoRow label="Reviewed By" value={rejectedBy} />}

            <Divider />

            <EmailParagraph>
                If you have any questions or would like to reapply with updated information,
                please contact the administration office.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default LeaveRejectedEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

LeaveRejectedEmail.PreviewProps = {
    organizationName: "Springfield High School",
    appliedBy: "Rajesh Kumar",
    startDate: new Date("2026-03-05"),
    endDate: new Date("2026-03-07"),
    totalDays: 3,
    leaveType: "CASUAL",
    rejectedNote: "Department will be understaffed during this period.",
    reason: "Family function out of town.",
    rejectedBy: "Head of Admin",
} satisfies LeaveRejectedVariables;