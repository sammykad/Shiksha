import * as React from "react";
import { Resend } from "resend";
import AuthOtpEmail from "../emails/system/AuthOtpEmail";
import ResetPasswordEmail from "../emails/system/ResetPasswordEmail";
import InvitationEmail from "../emails/system/InvitationEmail";

const APP_NAME = "Shiksha Cloud";
const DEFAULT_FROM = "Shiksha Cloud <onboarding@resend.dev>";

// ─── Transport ────────────────────────────────────────────────────────────────

export async function sendAuthEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    const msg = `RESEND_API_KEY missing. Email not sent to ${to}.`;
    if (process.env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[Auth Email] ${msg}`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("[Auth Email] Resend error:", error);
    throw new Error("Failed to send auth email.");
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function buildOtpEmail({ otp, type }: { otp: string; type: string }) {
  return React.createElement(AuthOtpEmail, {
    organizationName: APP_NAME,
    otp,
    type,
  });
}

export function buildResetPasswordEmail({ url }: { url: string }) {
  return React.createElement(ResetPasswordEmail, {
    organizationName: APP_NAME,
    url,
  });
}

export function buildInvitationEmail({
  inviteUrl,
  inviterName,
  orgName,
  role,
}: {
  inviteUrl: string;
  inviterName: string;
  orgName: string;
  role: string;
}) {
  return React.createElement(InvitationEmail, {
    organizationName: APP_NAME,
    inviteUrl,
    inviterName,
    orgName,
    role,
  });
}

export const OTP_SUBJECTS: Record<string, string> = {
  "email-verification": "Verify your Shiksha Cloud email",
  "sign-in": "Your Shiksha Cloud sign-in code",
  "forget-password": "Reset your Shiksha Cloud password",
  "change-email": "Confirm your new Shiksha Cloud email",
};