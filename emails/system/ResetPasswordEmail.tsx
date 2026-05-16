import * as React from "react";
import {
    BaseEmailLayout,
    EmailHeading,
    EmailSubheading,
    EmailParagraph,
    Badge,
    AlertBox,
    Divider,
    ActionButton,
} from "../layout";

export interface ResetPasswordEmailProps {
    organizationName: string;
    url: string;
}

export const ResetPasswordEmail = ({ organizationName, url }: ResetPasswordEmailProps) => {
    return (
        <BaseEmailLayout
            preview="Reset your password"
            organizationName={organizationName}
        >
            <Badge variant="warning">Security Update</Badge>
            <EmailHeading>Reset your password</EmailHeading>
            <EmailSubheading>
                Click the button below to set a new password for your account.
            </EmailSubheading>

            <ActionButton href={url} variant="primary">
                Reset Password
            </ActionButton>

            <EmailParagraph muted>
                Link expires in <strong>30 minutes</strong>. If you didn't request this, ignore this email.
            </EmailParagraph>

            <Divider />

            <AlertBox variant="info">
                <strong>Security:</strong> If you didn't request a password reset, contact your administrator.
            </AlertBox>
        </BaseEmailLayout>
    );
};

export default ResetPasswordEmail;
