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
import { StudentLateVariables } from "@/lib/notifications/template";

const StudentLateEmail = (props: StudentLateVariables) => {
    const {
        organizationName,
        studentName,
        date,
        arrivalTime,
        grade,
        section,
    } = props;

    const displayDate = date instanceof Date
        ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : date;

    return (
        <BaseEmailLayout
            preview={`Late arrival notice: ${studentName} arrived late today`}
            organizationName={organizationName}
        >
            <Badge variant="warning">Late Arrival</Badge>

            <EmailHeading>Late Arrival Notice</EmailHeading>
            <EmailSubheading>
                Your child arrived after the scheduled start time today.
            </EmailSubheading>

            <EmailParagraph>Dear Parent / Guardian,</EmailParagraph>

            <AlertBox variant="warning">
                <strong>{studentName}</strong> was marked as <strong>late</strong> on{" "}
                {displayDate}. Punctuality helps maintain a focused learning environment for all
                students.
            </AlertBox>

            <Divider />

            <SectionLabel>Attendance Details</SectionLabel>

            <InfoRow label="Student Name" value={studentName} />
            <InfoRow label="Date" value={displayDate} highlight />
            <InfoRow label="Arrival Recorded At" value={arrivalTime} />
            <InfoRow label="Grade" value={grade} />
            <InfoRow label="Section" value={section} />

            <Divider />

            <EmailParagraph>
                Consistent punctuality ensures your child does not miss important
                instructions and transitions at the start of each school day. If there is a
                recurring reason for late arrivals, please reach out to the school so we can
                support accordingly.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default StudentLateEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

StudentLateEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    date: "07 Mar 2026",
    arrivalTime: "09:22 AM",
    grade: "Grade 8",
    section: "Section A",
} satisfies StudentLateVariables;