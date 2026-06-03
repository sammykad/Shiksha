import { BrevoClient } from "@getbrevo/brevo";
import { render } from "@react-email/components";
import * as React from "react";

export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
  timeoutInSeconds: 10,
  maxRetries: 3,
});

export async function sendBrevoEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n📬 ======= [DEV BREVO EMAIL BYPASS] =======");
    console.log(`📧 To:      ${to}`);
    console.log(`✉️ Subject: ${subject}`);

    const props = (react as any)?.props;
    if (props?.otp) console.log(`🔑 OTP Code: ${props.otp}`);
    if (props?.url) console.log(`🔗 Link:     ${props.url}`);
    if (props?.inviteUrl) console.log(`🔗 Invite:   ${props.inviteUrl}`);
    console.log("=========================================\n");
    return;
  }

  const html = await render(react);

  await brevo.transactionalEmails.sendTransacEmail({
    subject,
    htmlContent: html,
    sender: {
      email: process.env.BREVO_SENDER_EMAIL ?? "shikshacloud.tech@gmail.com",
      name: "Shiksha.cloud",
    },
    to: [{ email: to }],
  });
}
