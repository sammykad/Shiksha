// emails/templates/GeneralNoticeEmail.tsx
import * as React from "react";
import {
    BaseEmailLayout, EmailHeading, EmailSubheading,
    EmailParagraph, Badge, InfoRow, SectionLabel, Divider,
} from "../layout";
import { formatDateIN } from "@/lib/utils";

interface GeneralNoticeEmailProps {
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

const GeneralNoticeEmail = (props: GeneralNoticeEmailProps) => {
    const {
        organizationName, title, content, summary,
        noticeType, startDate, endDate, publishedBy, attachmentCount,
    } = props;

    return (
        <BaseEmailLayout
            preview={summary ?? title}
            organizationName={organizationName}
        >
            <Badge variant="default">{noticeType}</Badge>

            <EmailHeading>{title}</EmailHeading>
            {summary && <EmailSubheading>{summary}</EmailSubheading>}

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

export default GeneralNoticeEmail;

GeneralNoticeEmail.PreviewProps = {
    organizationName: "Springfield High School",
    title: "School Closed on March 20 — Holi Holiday",
    summary: "School will remain closed on Thursday, March 20 on account of Holi.",
    content: "Dear Students and Parents,\n\nThis is to inform you that the school will remain closed on Thursday, March 20, 2026 on account of the Holi festival. Classes will resume as usual on Friday, March 21, 2026.\n\nPlease plan accordingly.",
    noticeType: "Holiday",
    startDate: new Date("2026-03-20"),
    endDate: new Date("2026-03-20"),
    publishedBy: "Principal Skinner",
    attachmentCount: 0,
} satisfies GeneralNoticeEmailProps;