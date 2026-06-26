import * as React from "react";
import {
    BaseEmailLayout,
    EmailHeading,
    EmailSubheading,
    EmailParagraph,
    Badge,
    AlertBox,
    Divider,
} from "../layout";

export interface AuthOtpEmailProps {
    organizationName: string;
    otp: string;
    type: "email-verification" | "sign-in" | "forgot-password" | "change-email" | string;
}

const OTP_SUBTITLES: Record<string, string> = {
    "email-verification": "Verify your email address to complete your account setup",
    "sign-in": "Enter this code to sign in to your account",
    "forgot-password": "Use this code to reset your password",
    "change-email": "Confirm your email change request",
};

export const AuthOtpEmail = ({ organizationName, otp, type }: AuthOtpEmailProps) => {
    const subtitle = OTP_SUBTITLES[type] ?? "Use this code to continue";
    const display = otp.split("").join(" ");

    return (
        <BaseEmailLayout
            preview={`Your verification code: ${otp}`}
            organizationName={organizationName}
        >
            <Badge variant="success">Verification Code</Badge>
            <EmailHeading>Verification Code</EmailHeading>
            <EmailSubheading>{subtitle}</EmailSubheading>

            <div style={{
                background: "#F4F4F5",
                border: "1px solid #E4E4E7",
                borderRadius: "8px",
                padding: "20px 24px",
                textAlign: "center",
                margin: "24px 0"
            }}>
                <p style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#71717A",
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    margin: "0 0 12px"
                }}>Your code</p>
                <p style={{
                    fontSize: "32px",
                    fontWeight: 600,
                    color: "#18181B",
                    letterSpacing: "8px",
                    margin: 0
                }}>{display}</p>
            </div>

            <EmailParagraph muted>
                Expires in <strong>5 minutes</strong>. If you didn't request this, ignore this email.
            </EmailParagraph>

            <Divider />

            <AlertBox variant="error">
                <strong>Security:</strong> We will never ask you to share this code. Do not share it with anyone.
            </AlertBox>
        </BaseEmailLayout>
    );
};

export default AuthOtpEmail;
