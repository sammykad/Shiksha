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
    ActionButton,
} from "../layout";
import { Text } from "@react-email/components";
import { formatCurrencyIN, formatDateTimeIN } from "@/lib/utils";
import { PaymentFailedVariables } from "@/lib/notifications/template";

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PaymentFailedEmail = (props: PaymentFailedVariables) => {
    const {
        organizationName,
        studentName,
        amount,
        feeName,
        transactionId,
        paymentLink,
        failedAt,
    } = props;

    return (
        <BaseEmailLayout
            preview={`Payment failed — ₹${formatCurrencyIN(amount)} could not be processed for ${studentName}`}
            organizationName={organizationName}
        >
            <Badge variant="error">Payment Failed</Badge>

            {/* Large amount hero */}
            <Text style={{
                fontFamily: FONT,
                fontSize: "32px",
                fontWeight: 600,
                color: "#DC2626",
                textAlign: "center",
                margin: "8px 0 2px",
                letterSpacing: "-0.5px",
            }}>
                ₹{formatCurrencyIN(amount)}
            </Text>
            <Text style={{
                fontFamily: FONT,
                fontSize: "12px",
                color: "#71717A",
                textAlign: "center",
                margin: "0 0 20px",
            }}>
                attempted on {formatDateTimeIN(failedAt)}
            </Text>

            <EmailHeading>Payment Unsuccessful</EmailHeading>
            <EmailSubheading>
                We were unable to process your fee payment. No amount has been deducted
                from your account.
            </EmailSubheading>

            <AlertBox variant="error">
                Payment of <strong>₹{formatCurrencyIN(amount)}</strong> for{" "}
                <strong>{feeName}</strong> could not be completed. Please retry or
                contact your institution if the issue persists.
            </AlertBox>

            <Divider />
            <SectionLabel>Transaction Details</SectionLabel>

            <InfoRow label="Student name" value={studentName} />
            <InfoRow label="Amount" value={`₹${formatCurrencyIN(amount)}`} highlight />
            <InfoRow label="Fee category" value={feeName} />
            <InfoRow label="Transaction ID" value={transactionId} />
            <InfoRow label="Failed on" value={formatDateTimeIN(failedAt)} />
            <InfoRow label="Status" value="Failed" />

            <Divider />
            <SectionLabel>What to do next</SectionLabel>

            <EmailParagraph>
                You can retry your payment using the link below. If your account was
                charged, the amount will be refunded within 5–7 business days.
            </EmailParagraph>

            <EmailParagraph muted>
                If the problem continues, please reach out to your institution with the
                transaction ID above so they can assist you.
            </EmailParagraph>

            {paymentLink && (
                <ActionButton href={paymentLink} variant="primary">
                    Retry payment
                </ActionButton>
            )}

            <Divider />

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default PaymentFailedEmail;

PaymentFailedEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeName: "Annual Tuition Fee",
    amount: 45000,
    transactionId: "TXN-20260326143022-A1B2C3D4",
    paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    failedAt: new Date(),
} satisfies PaymentFailedVariables;