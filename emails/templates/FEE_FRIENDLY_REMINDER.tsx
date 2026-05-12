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
import { formatCurrencyIN, formatDateIN } from "@/lib/utils";
import { FeeFriendlyReminderVariables } from "@/lib/notifications/template";

const FeeReminderFriendlyEmail = (props: FeeFriendlyReminderVariables) => {
    const { organizationName, studentName, feeCategoryName, amount, dueDate } = props;

    return (
        <BaseEmailLayout
            preview={`Friendly reminder: ₹${formatCurrencyIN(amount)} due on ${formatDateIN(dueDate)}`}
            organizationName={organizationName}
        >
            <Badge variant="info">Payment Reminder</Badge>
            <EmailHeading>Just a Friendly Reminder</EmailHeading>
            <EmailSubheading>
                Your fee payment is coming up. Review the details below and make sure you're ready before the due date.
            </EmailSubheading>

            <EmailParagraph>Dear {studentName},</EmailParagraph>

            <AlertBox variant="info">
                You have an upcoming fee payment of{" "}
                <strong>₹{formatCurrencyIN(amount)}</strong> due on{" "}
                <strong>{formatDateIN(dueDate)}</strong>. Please ensure your payment is ready before the
                due date.
            </AlertBox>

            <Divider />

            <SectionLabel>Fee Details</SectionLabel>

            <InfoRow label="Fee Category" value={feeCategoryName} />
            <InfoRow
                label="Amount Due"
                value={`₹${formatCurrencyIN(amount)}`}
                highlight
            />
            <InfoRow label="Due Date" value={formatDateIN(dueDate)} />
            <InfoRow label="Status" value="Unpaid" />

            <Divider />

            <EmailParagraph>
                To make a payment in advance, visit the student portal or the accounts
                office at your convenience.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default FeeReminderFriendlyEmail;

FeeReminderFriendlyEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeCategoryName: "Annual Tuition Fee",
    amount: 45000,
    dueDate: new Date("2026-03-31"),
} satisfies FeeFriendlyReminderVariables;