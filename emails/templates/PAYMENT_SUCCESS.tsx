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
import { formatCurrencyIN, formatDateIN } from "@/lib/utils";
import { PaymentSuccessVariables } from "@/lib/notifications/template";

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PaymentSuccessEmail = (props: PaymentSuccessVariables) => {
    const {
        organizationName,
        studentName,
        amount,
        feeName,
        receiptNumber,
        receiptUrl,
        paidAt,
        // pendingAmount,
        paymentMethod,
    } = props;

    // const isFullyPaid = !pendingAmount || pendingAmount === 0;

    return (
        <BaseEmailLayout
            preview={`Payment confirmed — ₹${formatCurrencyIN(amount)} received for ${studentName}`}
            organizationName={organizationName}
        >
            <Badge variant="success">Payment Successful</Badge>

            {/* Large amount hero */}
            <Text style={{
                fontFamily: FONT,
                fontSize: "32px",
                fontWeight: 600,
                color: "#16A34A",
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
                received on {formatDateIN(paidAt)}
            </Text>

            <EmailHeading>Payment Confirmed</EmailHeading>
            <EmailSubheading>
                Your fee payment has been received. A PDF receipt is attached to this email.
            </EmailSubheading>

            <AlertBox variant="success">
                Payment of <strong>₹{formatCurrencyIN(amount)}</strong> for{" "}
                <strong>{feeName}</strong> has been successfully processed.
                A detailed receipt is attached to this email.
            </AlertBox>

            <Divider />
            <SectionLabel>Payment Details</SectionLabel>

            <InfoRow label="Student name" value={studentName} />
            <InfoRow label="Amount paid" value={`₹${formatCurrencyIN(amount)}`} highlight />
            <InfoRow label="Fee category" value={feeName} />
            <InfoRow
                label="Receipt number"
                value={receiptNumber}
            />
            {paymentMethod && (
                <InfoRow
                    label="Payment method"
                    value={paymentMethod.charAt(0) + paymentMethod.slice(1).toLowerCase().replace(/_/g, " ")}
                />
            )}
            <InfoRow label="Paid on" value={formatDateIN(paidAt)} />

            {/* Balance box */}
            {/* <Section style={{
                backgroundColor: "#F4F4F5",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "16px",
            }}>
                <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td>
                                <Text style={{
                                    fontFamily: FONT,
                                    fontSize: "12px",
                                    color: "#71717A",
                                    margin: 0,
                                }}>
                                    Remaining balance
                                </Text>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <Text style={{
                                    fontFamily: FONT,
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: isFullyPaid ? "#16A34A" : "#DC2626",
                                    margin: 0,
                                    textAlign: "right",
                                }}>
                                    {isFullyPaid
                                        ? "₹0 — Fully paid"
                                        : `₹${formatCurrencyIN(pendingAmount)} remaining`}
                                </Text>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Section> */}

            <Divider />
            <SectionLabel>Your Receipt</SectionLabel>

            <EmailParagraph muted>
                A detailed PDF receipt is attached to this email. You can also view or
                download it online anytime from your fee portal.
            </EmailParagraph>

            {receiptUrl && (
                <>
                    <ActionButton href={receiptUrl} variant="primary">
                        View receipt online
                    </ActionButton>
                    <ActionButton href={receiptUrl} variant="ghost">
                        Download PDF
                    </ActionButton>
                </>
            )}

            <Divider />

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default PaymentSuccessEmail;

PaymentSuccessEmail.PreviewProps = {
    organizationName: "Springfield High School",
    studentName: "Aarav Sharma",
    feeName: "Annual Tuition Fee",
    amount: 45000,
    // pendingAmount: 0,
    paymentMethod: "CASH",
    receiptNumber: "REC-A1B2C3D4",
    receiptUrl: "/dashboard/fees/payment-status?txn=FEE-20260326143022-A1B2C3D4",
    paidAt: new Date(),
} satisfies PaymentSuccessVariables;