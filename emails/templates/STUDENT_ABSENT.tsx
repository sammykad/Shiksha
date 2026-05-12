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
import { StudentAbsentVariables } from "@/lib/notifications/template";
import { formatDateIN } from "@/lib/utils";



const StudentAbsentEmail = (props: StudentAbsentVariables) => {
    const {
        organizationName,
        studentName,
        date,
        time,
        grade,
        section,
    } = props;

    return (
        <BaseEmailLayout
            preview={`Attendance alert: ${studentName} was marked absent today`}
            organizationName={organizationName}
        >
            <Badge variant="error">Attendance Alert</Badge>

            <EmailHeading>Absence Notification</EmailHeading>
            <EmailSubheading>
                Your child was not present in school today.
            </EmailSubheading>

            <EmailParagraph>Dear Parent / Guardian,</EmailParagraph>

            <AlertBox variant="error">
                <strong>{studentName}</strong> has been marked <strong>absent</strong> for{" "}
                {formatDateIN(date)}. If this is an error or you have already informed the school,
                please disregard this message.
            </AlertBox>

            <Divider />

            <SectionLabel>Attendance Details</SectionLabel>

            <InfoRow label="Student Name" value={studentName} />
            <InfoRow label="Date" value={formatDateIN(date)} highlight />
            <InfoRow label="Recorded At" value={time} />
            <InfoRow label="Grade" value={grade} />
            <InfoRow label="Section" value={section} />

            <Divider />

            <EmailParagraph>
                Regular attendance is important for your child's academic progress. If your
                child is unwell or absent for a known reason, please notify the school at
                the earliest.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default StudentAbsentEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

StudentAbsentEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    date: "07 Mar 2026",
    time: "08:45 AM",
    grade: "Grade 8",
    section: "Section A",
} satisfies StudentAbsentVariables;