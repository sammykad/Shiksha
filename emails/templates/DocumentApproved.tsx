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
    GreenDivider,
    ActionButton,
} from "../layout";
import { formatDateIN } from "@/lib/utils";
import { DocumentApprovedVariables } from "@/lib/notifications/template";

const DocumentApprovedEmail = (props: DocumentApprovedVariables) => {
    const {
        organizationName,
        recipientName,
        documentType,
        documentName,
        documentUrl,
        supportEmail,
        supportPhone,
        uploadedOn,
        fileSize,
        address,
    } = props;

    const hasFileDetails = uploadedOn || fileSize;
    const hasSupport = supportEmail || supportPhone || address;

    return (
        <BaseEmailLayout
            preview={`Your ${documentType} has been approved and is ready`}
            organizationName={organizationName}
            supportEmail={supportEmail}
        >
            <Badge variant="success">Document Approved</Badge>

            <EmailHeading>Your Document is Ready</EmailHeading>
            <EmailSubheading>
                Your submitted document has been reviewed and approved.
            </EmailSubheading>

            <EmailParagraph>Dear {recipientName},</EmailParagraph>

            <AlertBox variant="success">
                Your <strong>{documentType}</strong> — <strong>{documentName}</strong> —
                has been approved. You may now download or access it using the link below.
            </AlertBox>

            <Divider />

            <SectionLabel>Document Details</SectionLabel>

            <InfoRow label="Document Type" value={documentType} />
            <InfoRow label="Document Name" value={documentName} highlight />
            {uploadedOn && (
                <InfoRow label="Uploaded On" value={formatDateIN(uploadedOn)} />
            )}
            {fileSize && <InfoRow label="File Size" value={fileSize} />}

            {documentUrl && (
                <ActionButton href={documentUrl} variant="primary">
                    Download Document
                </ActionButton>
            )}

            {hasSupport && (
                <>
                    <GreenDivider />
                    <SectionLabel>Need Help?</SectionLabel>
                    {address && <InfoRow label="Office Address" value={address} />}
                    {supportEmail && <InfoRow label="Email" value={supportEmail} />}
                    {supportPhone && <InfoRow label="Phone" value={supportPhone} />}
                </>
            )}

            <Divider />

            <EmailParagraph>
                If you believe this approval was made in error or have questions about your
                document, please reach out to the administration office.
            </EmailParagraph>

            <EmailParagraph muted>
                Regards,{"\n"}{organizationName}
            </EmailParagraph>
        </BaseEmailLayout>
    );
};

export default DocumentApprovedEmail;

// ─── Preview props (react-email dev server) ───────────────────────────────────

DocumentApprovedEmail.PreviewProps = {
    organizationName: "Springfield High School",
    recipientName: "Rajesh Kumar",
    documentType: "Transfer Certificate",
    documentName: "TC_RajeshKumar_2026.pdf",
    documentUrl: "https://shiksha.cloud/documents/tc-rajesh-2026.pdf",
    uploadedOn: new Date("2026-03-10"),
    fileSize: "284 KB",
    supportEmail: "admin@springfield.edu",
    supportPhone: "+91 98765 43210",
    address: "123 School Lane, Springfield, MH 411001",
} satisfies DocumentApprovedVariables;