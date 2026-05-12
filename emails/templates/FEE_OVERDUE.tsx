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
import { FeeOverdueVariables } from "@/lib/notifications/template";
import { formatDateIN } from "@/lib/utils";


const FeeOverdueEmail = (props: FeeOverdueVariables) => {
    const { organizationName, studentName, feeCategoryName, amount, dueDate } = props;

    return (
        <BaseEmailLayout
            preview={`Overdue: ₹${amount.toLocaleString("en-IN")} payment required immediately`}
            organizationName={organizationName}
        >
            <Badge variant="error">Overdue</Badge>

            <EmailHeading>Payment Overdue</EmailHeading>
            <EmailSubheading>
                Your fee payment was due on {formatDateIN(dueDate)} and has not been received.
            </EmailSubheading>

            <EmailParagraph>Dear {studentName},</EmailParagraph>

            <AlertBox variant="error">
                Your fee of <strong>₹{amount.toLocaleString("en-IN")}</strong> was due on{" "}
                <strong>{formatDateIN(dueDate)}</strong> and remains unpaid. Please settle this amount
                immediately to avoid further action on your account.
            </AlertBox>

            <Divider />

            <SectionLabel>Fee Details</SectionLabel>

            <InfoRow label="Fee Category" value={feeCategoryName} />
            <InfoRow
                label="Outstanding Amount"
                value={`₹${amount.toLocaleString("en-IN")}`}
                highlight
            />
            <InfoRow label="Original Due Date" value={formatDateIN(dueDate)} />
            <InfoRow label="Status" value="Overdue" />

            <Divider />

            <EmailParagraph>
                Continued non-payment may result in restrictions on your student account.
                Please visit the accounts office or contact administration as soon as
                possible to resolve this.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default FeeOverdueEmail;

FeeOverdueEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeCategoryName: "Annual Tuition Fee",
    amount: 45000,
    dueDate: new Date("2026-02-28"),
} satisfies FeeOverdueVariables;