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
import { FeeCreatedVariables } from "@/lib/notifications/template";

const FeeCreatedEmail = (props: FeeCreatedVariables) => {
    const {
        organizationName,
        studentName,
        feeCategoryName,
        amount,
        dueDate,
        status,
    } = props;

    const isOverdue = status === "OVERDUE";

    return (
        <BaseEmailLayout
            preview={`Fee assigned: ₹${formatCurrencyIN(amount)} due for ${studentName}`}
            organizationName={organizationName}
        >
            <Badge variant={isOverdue ? "error" : "info"}>
                {isOverdue ? "Fee Overdue" : "New Fee Assigned"}
            </Badge>

            <EmailHeading>Fee Payment Notice</EmailHeading>
            <EmailSubheading>
                A fee has been assigned to your account. Please review the details below.
            </EmailSubheading>

            <EmailParagraph>Dear {studentName},</EmailParagraph>

            {isOverdue ? (
                <AlertBox variant="error">
                    This fee was due on <strong>{formatDateIN(dueDate)}</strong> and is currently{" "}
                    <strong>overdue</strong>. Please clear the outstanding amount at the
                    earliest to avoid any penalties.
                </AlertBox>
            ) : (
                <AlertBox variant="info">
                    Please ensure payment is completed before <strong>{formatDateIN(dueDate)}</strong> to
                    avoid a late fee or overdue status.
                </AlertBox>
            )}

            <Divider />

            <SectionLabel>Fee Details</SectionLabel>

            <InfoRow label="Fee Category" value={feeCategoryName} />
            <InfoRow
                label="Amount Due"
                value={`₹${formatCurrencyIN(amount)}`}
                highlight
            />
            <InfoRow label="Due Date" value={formatDateIN(dueDate)} />
            <InfoRow label="Status" value={isOverdue ? "Overdue" : "Unpaid"} />

            <Divider />

            <EmailParagraph>
                To make a payment or view your fee history, please log in to the student
                portal or visit the accounts office.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default FeeCreatedEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

FeeCreatedEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeCategoryName: "Annual Tuition Fee",
    amount: 45000,
    dueDate: new Date("2026-03-31"),
    status: "UNPAID",
} satisfies FeeCreatedVariables;