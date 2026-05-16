import * as React from "react";
import {
    BaseEmailLayout,
    EmailHeading,
    EmailSubheading,
    EmailParagraph,
    Badge,
    InfoRow,
    Divider,
    ActionButton,
    SectionLabel,
} from "../layout";

export interface InvitationEmailProps {
    organizationName: string;
    inviteUrl: string;
    inviterName: string;
    orgName: string;
    role: string;
}

export const InvitationEmail = ({
    organizationName,
    inviteUrl,
    inviterName,
    orgName,
    role,
}: InvitationEmailProps) => {
    return (
        <BaseEmailLayout
            preview={`You're invited to join ${orgName}`}
            organizationName={organizationName}
        >
            <Badge variant="info">Organization Invitation</Badge>
            <EmailHeading>You're invited to {orgName}</EmailHeading>
            <EmailSubheading>
                You've been invited to join <strong>{orgName}</strong> on {organizationName}.
            </EmailSubheading>

            <SectionLabel>Invitation Details</SectionLabel>
            <InfoRow label="Invited by" value={inviterName} />
            <InfoRow label="Role" value={role} highlight />

            <ActionButton href={inviteUrl} variant="primary">
                Accept Invitation
            </ActionButton>

            <EmailParagraph muted>
                Invitation expires in <strong>7 days</strong>.
            </EmailParagraph>

            <Divider />

            <EmailParagraph>
                Once you accept the invitation, you'll be able to access the organization's dashboard and collaborate with your team.
            </EmailParagraph>
            <EmailParagraph muted>
                First time signing in? Use this invited email address. If you do not know your password, choose reset password on the sign-in page.
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default InvitationEmail;
