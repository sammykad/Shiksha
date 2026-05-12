// emails/templates/UrgentNoticeEmail.tsx
import * as React from "react";
import {
    BaseEmailLayout, EmailHeading, EmailSubheading,
    EmailParagraph, Badge, AlertBox, InfoRow, SectionLabel, Divider,
} from "../layout";
import { formatDateIN } from "@/lib/utils";

interface UrgentNoticeEmailProps {
    organizationName: string;
    title: string;
    content: string;
    summary?: string;
    noticeType: string;
    startDate: Date;
    endDate: Date;
    publishedBy?: string;
    attachmentCount?: number;
}

const UrgentNoticeEmail = (props: UrgentNoticeEmailProps) => {
    const {
        organizationName, title, content, summary,
        noticeType, startDate, endDate, publishedBy, attachmentCount,
    } = props;

    return (
        <BaseEmailLayout
            preview={`URGENT: ${summary ?? title}`}
            organizationName={organizationName}
        >
            <Badge variant="error">Urgent Notice</Badge>

            <EmailHeading>{title}</EmailHeading>
            {summary && <EmailSubheading>{summary}</EmailSubheading>}

            <AlertBox variant="error">
                This is an urgent notice from {organizationName}. Please read carefully and act promptly.
            </AlertBox>

            <Divider />

            <EmailParagraph>{content}</EmailParagraph>

            <Divider />

            <SectionLabel>Notice Details</SectionLabel>
            <InfoRow label="Valid From" value={formatDateIN(startDate)} />
            <InfoRow label="Valid Until" value={formatDateIN(endDate)} highlight />
            {publishedBy && <InfoRow label="Published By" value={publishedBy} />}
            {attachmentCount && attachmentCount > 0 && (
                <InfoRow
                    label="Attachments"
                    value={`${attachmentCount} attachment${attachmentCount !== 1 ? "s" : ""} — check the portal`}
                />
            )}

            <Divider />

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default UrgentNoticeEmail;

UrgentNoticeEmail.PreviewProps = {
    organizationName: "Springfield High School",
    title: "Emergency School Closure — Water Supply Issue",
    summary: "School will be closed tomorrow due to a municipal water supply disruption.",
    content: "Dear Parents and Students,\n\nDue to an unexpected disruption in the municipal water supply, the school will remain closed tomorrow, March 15, 2026. All scheduled exams and activities have been postponed.\n\nWe will notify you once the situation is resolved. We apologize for the inconvenience.",
    noticeType: "Emergency",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-03-15"),
    publishedBy: "Principal Skinner",
    attachmentCount: 1,
} satisfies UrgentNoticeEmailProps;