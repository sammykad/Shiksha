import * as React from "react";
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
    pixelBasedPreset,
} from "@react-email/components";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export type AlertVariant = "success" | "warning" | "error" | "info";
export type ButtonVariant = "primary" | "ghost";

export interface BaseEmailLayoutProps {
    preview: string;
    organizationName: string;
    tagline?: string;
    supportEmail?: string;
    children: React.ReactNode;
}

// ─── Tailwind config ──────────────────────────────────────────────────────────

const twConfig = {
    presets: [pixelBasedPreset],
    theme: {
        extend: {
            colors: {
                canvas: "#FFFFFF",
                surface: "#FAFAFA",
                subtle: "#F4F4F5",
                border: "#E4E4E7",
                borderMd: "#D1D5DB",
                muted: "#71717A",
                dim: "#A1A1AA",
                ink: "#18181B",
                inkMid: "#3F3F46",
                green: "#16A34A",
                greenLight: "#DCFCE7",
                greenMid: "#BBF7D0",
                greenDark: "#14532D",
                greenSubtle: "#F0FDF4",
                amber: "#B45309",
                amberLight: "#FEF3C7",
                amberBdr: "#FDE68A",
                red: "#DC2626",
                redLight: "#FEF2F2",
                redBdr: "#FECACA",
                blue: "#2563EB",
                blueLight: "#EFF6FF",
                blueBdr: "#BFDBFE",
            },
            fontFamily: {
                sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "system-ui", "sans-serif"],
                mono: ["Geist Mono", "'JetBrains Mono'", "Menlo", "monospace"],
            },
        },
    },
};

// ─── Shared font stack ────────────────────────────────────────────────────────

export const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Layout ───────────────────────────────────────────────────────────────────

export function BaseEmailLayout({
    preview,
    organizationName,
    tagline = "Shiksha.cloud - Institute Management System",
    supportEmail,
    children,
}: BaseEmailLayoutProps) {
    const year = new Date().getFullYear();

    return (
        <Tailwind config={twConfig}>
            <Html lang="en" dir="ltr">
                <Head>
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

                        /* ── Mobile responsive overrides ── */
                        @media only screen and (max-width: 600px) {
                            .email-card {
                                border-radius: 0 !important;
                                border-left: none !important;
                                border-right: none !important;
                            }
                            .email-outer {
                                padding: 0 !important;
                            }
                            .email-header {
                                padding: 20px 20px 16px !important;
                            }
                            .email-content {
                                padding: 4px 20px 28px !important;
                            }
                            .email-footer {
                                padding: 16px 20px 20px !important;
                                border-radius: 0 !important;
                            }
                            .info-row-td-label {
                                font-size: 12px !important;
                            }
                            .info-row-td-value {
                                font-size: 12px !important;
                            }
                        }
                    `}</style>
                </Head>
                <Preview>{preview}</Preview>

                <Body
                    style={{
                        backgroundColor: "#F4F4F5",
                        margin: 0,
                        padding: 0,
                        fontFamily: FONT,
                        WebkitTextSizeAdjust: "100%",
                        MozTextSizeAdjust: "100%",
                    }}
                >
                    {/* ── Outer shell ── */}
                    <Section
                        className="email-outer"
                        style={{ padding: "32px 16px 48px", backgroundColor: "#F4F4F5" }}
                    >
                        <Container style={{ maxWidth: "580px", margin: "0 auto", width: "100%" }}>

                            {/* ═══ CARD ═══ */}
                            <Section
                                className="email-card"
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #E4E4E7",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                {/* Green gradient top bar */}
                                <div style={{
                                    background: "linear-gradient(90deg, #16A34A 0%, #4ADE80 100%)",
                                    height: "3px",
                                    width: "100%",
                                }} />

                                {/* ── HEADER ── */}
                                <Section
                                    className="email-header"
                                    style={{ padding: "24px 32px 18px", backgroundColor: "#FFFFFF" }}
                                >
                                    <table width="100%" cellPadding={0} cellSpacing={0}>
                                        <tbody>
                                            <tr>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <table cellPadding={0} cellSpacing={0}>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                                                                    <div style={{
                                                                        width: "7px",
                                                                        height: "7px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "#16A34A",
                                                                    }} />
                                                                </td>
                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    <Text style={{
                                                                        fontFamily: FONT,
                                                                        fontSize: "15px",
                                                                        fontWeight: 600,
                                                                        color: "#18181B",
                                                                        letterSpacing: "-0.2px",
                                                                        margin: 0,
                                                                        padding: 0,
                                                                        lineHeight: "1",
                                                                    }}>
                                                                        {organizationName}
                                                                    </Text>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <Text style={{
                                                        fontFamily: FONT,
                                                        fontSize: "11px",
                                                        color: "#A1A1AA",
                                                        letterSpacing: "0.3px",
                                                        margin: "5px 0 0 15px",
                                                        padding: 0,
                                                    }}>
                                                        {tagline}
                                                    </Text>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <Hr style={{ borderColor: "#F0FDF4", borderTopWidth: "1px", margin: "16px 0 0" }} />
                                </Section>

                                {/* ── CONTENT SLOT ── */}
                                <Section
                                    className="email-content"
                                    style={{ padding: "4px 32px 32px", backgroundColor: "#FFFFFF" }}
                                >
                                    {children}
                                </Section>

                                {/* ── FOOTER ── */}
                                <Section
                                    className="email-footer"
                                    style={{
                                        backgroundColor: "#F4F4F5",
                                        borderTop: "1px solid #E4E4E7",
                                        padding: "16px 32px 20px",
                                        borderRadius: "0 0 12px 12px",
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: FONT,
                                        fontSize: "11px",
                                        color: "#A1A1AA",
                                        textAlign: "center",
                                        margin: 0,
                                        padding: 0,
                                        lineHeight: "1.8",
                                    }}>
                                        © {year} {organizationName}. All rights reserved.
                                        <br />
                                        This is an automated message. Please do not reply.
                                        {supportEmail && (
                                            <>
                                                {" "}·{" "}
                                                <Link
                                                    href={`mailto:${supportEmail}`}
                                                    style={{ color: "#16A34A", textDecoration: "none" }}
                                                >
                                                    {supportEmail}
                                                </Link>
                                            </>
                                        )}
                                    </Text>
                                </Section>

                            </Section>
                            {/* ═══ /CARD ═══ */}

                        </Container>
                    </Section>
                </Body>
            </Html>
        </Tailwind>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═════════════════════════════════════════════════════════════════════════════

// ─── EmailHeading ─────────────────────────────────────────────────────────────

export function EmailHeading({ children }: { children: React.ReactNode }) {
    return (
        <Heading
            as="h2"
            style={{
                fontFamily: FONT,
                fontSize: "26px",
                fontWeight: 600,
                color: "#18181B",
                letterSpacing: "-0.4px",
                lineHeight: "1.2",
                margin: "0 0 6px",
                padding: 0,
            }}
        >
            {children}
        </Heading>
    );
}

// ─── EmailSubheading ──────────────────────────────────────────────────────────

export function EmailSubheading({ children }: { children: React.ReactNode }) {
    return (
        <Text
            style={{
                fontFamily: FONT,
                fontSize: "14px",
                color: "#71717A",
                lineHeight: "1.55",
                margin: "0 0 20px",
                padding: 0,
                fontWeight: 400,
            }}
        >
            {children}
        </Text>
    );
}

// ─── EmailParagraph ───────────────────────────────────────────────────────────

export function EmailParagraph({
    children,
    muted = false,
}: {
    children: React.ReactNode;
    muted?: boolean;
}) {
    return (
        <Text
            style={{
                fontFamily: FONT,
                fontSize: "14px",
                color: muted ? "#71717A" : "#3F3F46",
                lineHeight: "1.7",
                margin: "0 0 14px",
                padding: 0,
                fontWeight: 400,
            }}
        >
            {children}
        </Text>
    );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_MAP: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: "#F4F4F5", color: "#3F3F46", border: "1px solid #E4E4E7" },
    success: { background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" },
    warning: { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" },
    error: { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
    info: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
};

export function Badge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: BadgeVariant;
}) {
    return (
        <Text
            style={{
                fontFamily: FONT,
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.2px",
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "6px",
                margin: "0 0 14px",
                lineHeight: "1.5",
                ...BADGE_MAP[variant],
            }}
        >
            {children}
        </Text>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
    return <Hr style={{ borderColor: "#F4F4F5", borderTopWidth: "1px", margin: "18px 0" }} />;
}

// ─── GreenDivider ─────────────────────────────────────────────────────────────

export function GreenDivider() {
    return (
        <Section style={{ margin: "20px 0" }}>
            <div style={{
                height: "1px",
                background: "linear-gradient(90deg, #DCFCE7, #16A34A 50%, #DCFCE7)",
                width: "100%",
            }} />
        </Section>
    );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

export function InfoRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <Section
            style={{
                borderBottom: "1px solid #F4F4F5",
                padding: highlight ? "9px 8px" : "9px 0",
                backgroundColor: highlight ? "#F0FDF4" : "transparent",
                borderRadius: highlight ? "6px" : "0",
            }}
        >
            <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                    <tr>
                        <td
                            className="info-row-td-label"
                            style={{ width: "42%", verticalAlign: "top", paddingRight: "8px" }}
                        >
                            <Text style={{
                                fontFamily: FONT,
                                fontSize: "13px",
                                color: "#71717A",
                                margin: 0,
                                padding: 0,
                                fontWeight: 400,
                                lineHeight: "1.4",
                            }}>
                                {label}
                            </Text>
                        </td>
                        <td
                            className="info-row-td-value"
                            style={{ width: "58%", verticalAlign: "top", textAlign: "right" }}
                        >
                            <Text style={{
                                fontFamily: FONT,
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#18181B",
                                margin: 0,
                                padding: 0,
                                textAlign: "right",
                                lineHeight: "1.4",
                                wordBreak: "break-word",
                            }}>
                                {String(value ?? "—")}
                            </Text>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Section>
    );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Text
            style={{
                fontFamily: FONT,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "#16A34A",
                margin: "16px 0 6px",
                padding: 0,
                display: "block",
            }}
        >
            {children}
        </Text>
    );
}

// ─── AlertBox ─────────────────────────────────────────────────────────────────
// NOTE: No icon prefix text — just a clean left-border alert box.

const ALERT_MAP: Record<
    AlertVariant,
    { wrap: React.CSSProperties; textColor: string }
> = {
    success: {
        wrap: { background: "#F0FDF4", border: "1px solid #BBF7D0", borderLeft: "3px solid #16A34A" },
        textColor: "#166534",
    },
    warning: {
        wrap: { background: "#FFFBEB", border: "1px solid #FDE68A", borderLeft: "3px solid #F59E0B" },
        textColor: "#92400E",
    },
    error: {
        wrap: { background: "#FEF2F2", border: "1px solid #FECACA", borderLeft: "3px solid #DC2626" },
        textColor: "#991B1B",
    },
    info: {
        wrap: { background: "#EFF6FF", border: "1px solid #BFDBFE", borderLeft: "3px solid #2563EB" },
        textColor: "#1E40AF",
    },
};

export function AlertBox({
    variant,
    children,
}: {
    variant: AlertVariant;
    children: React.ReactNode;
}) {
    const s = ALERT_MAP[variant];
    return (
        <Section
            style={{
                borderRadius: "6px",
                padding: "12px 14px",
                marginBottom: "18px",
                ...s.wrap,
            }}
        >
            <Text
                style={{
                    fontFamily: FONT,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: s.textColor,
                    margin: 0,
                    padding: 0,
                    fontWeight: 400,
                }}
            >
                {children}
            </Text>
        </Section>
    );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────

export function ActionButton({
    href,
    children,
    variant = "primary",
}: {
    href: string;
    children: React.ReactNode;
    variant?: ButtonVariant;
}) {
    const isPrimary = variant === "primary";
    return (
        <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
            <Button
                href={href}
                style={{
                    fontFamily: FONT,
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.1px",
                    textDecoration: "none",
                    display: "inline-block",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    backgroundColor: isPrimary ? "#16A34A" : "transparent",
                    color: isPrimary ? "#FFFFFF" : "#16A34A",
                    border: "1.5px solid #16A34A",
                }}
            >
                {children}
            </Button>
        </Section>
    );
}