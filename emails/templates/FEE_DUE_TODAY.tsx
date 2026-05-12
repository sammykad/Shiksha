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
import { FeeDueTodayVariables } from "@/lib/notifications/template";


interface FeeDueTodayEmailProps {
    organizationName: string;
    studentName: string;
    feeCategoryName: string;
    totalFee: number;
    dueDate: string;
    status: "UNPAID" | "OVERDUE";
}

const FeeDueTodayEmail = (props: FeeDueTodayVariables) => {
    const { organizationName, studentName, feeCategoryName, amount, dueDate } = props;

    return (
        <BaseEmailLayout
            preview={`Payment due today: ₹${formatCurrencyIN(amount)} — please pay now`}
            organizationName={organizationName}
        >
            <Badge variant="warning">Due Today</Badge>

            <EmailHeading>Payment Due Today</EmailHeading>
            <EmailSubheading>
                Your fee payment deadline is today. Please complete it before end of day.
            </EmailSubheading>

            <EmailParagraph>Dear {studentName},</EmailParagraph>

            <AlertBox variant="warning">
                Your fee of <strong>₹${formatCurrencyIN(amount)}</strong> is due{" "}
                <strong>today, {formatDateIN(dueDate)}</strong>. Payments not received by end of day may
                be marked as overdue.
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
                Please visit the student portal or accounts office immediately to complete
                your payment and avoid an overdue status on your account.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default FeeDueTodayEmail;

FeeDueTodayEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeCategoryName: "Annual Tuition Fee",
    amount: 45000,
    dueDate: new Date("2026-03-07"),
} satisfies FeeDueTodayVariables;