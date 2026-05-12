'use server';

import { revalidatePath } from 'next/cache';
import { getOrganizationId } from '@/lib/organization';
import prisma from '@/lib/db';
import { decrypt } from '@/lib/data/integration/crypto';

// ─── Get all integration statuses for the current organization ───────────────────────
export async function getIntegrationStatuses() {
  const organizationId = await getOrganizationId();

  const meta = await
    prisma.metaIntegration.findUnique({
      where: { organizationId },
      select: {
        isActive: true,
        pageName: true,
        pageId: true,
        connectedAt: true,
        lastSyncAt: true,
      },
    })
  return meta;
}
// /smtp
// prisma.smtpIntegration.findUnique({
//   where: { organizationId },
//   select: {
//     isActive: true,
//     host: true,
//     email: true,
//     fromName: true,
//     connectedAt: true,
//   },
// }),
// ─── Disconnect Meta ─────────────────────────────────────────────────────────
export async function disconnectMeta() {

  const organizationId = await getOrganizationId();

  const integration = await prisma.metaIntegration.findUnique({
    where: { organizationId },
  });

  if (integration?.isActive) {
    try {
      const token = decrypt(integration.pageAccessToken);
      // Unsubscribe page from our webhook
      await fetch(
        `https://graph.facebook.com/v19.0/${integration.pageId}/subscribed_apps`,
        {
          method: 'DELETE',
          body: new URLSearchParams({ access_token: token }),
        }
      );
    } catch (e) {
      console.error('Failed to unsubscribe page from Meta webhook:', e);
    }

    await prisma.metaIntegration.update({
      where: { organizationId },
      data: { isActive: false },
    });
  }

  revalidatePath('/dashboard/integrations');
  return { success: true };
}

// ─── Save SMTP credentials ────────────────────────────────────────────────────
export async function saveSmtpIntegration(data: {
  host: string;
  port: number;
  email: string;
  password: string;
  fromName?: string;
  encryption?: string;
}) {
  const organizationId = await getOrganizationId();

  // Test SMTP connection before saving
  const testResult = await testSmtpConnection(data);
  if (!testResult.success) {
    return { success: false, error: testResult.error };
  }

  // await prisma.smtpIntegration.upsert({
  //   where: { organizationId: orgId },
  //   create: {
  //     organizationId: orgId,
  //     host: data.host,
  //     port: data.port,
  //     email: data.email,
  //     password: encrypt(data.password),  // encrypted!
  //     fromName: data.fromName ?? null,
  //     encryption: data.encryption ?? 'TLS',
  //     isActive: true,
  //     connectedAt: new Date(),
  //   },
  //   update: {
  //     host: data.host,
  //     port: data.port,
  //     email: data.email,
  //     password: encrypt(data.password),
  //     fromName: data.fromName ?? null,
  //     encryption: data.encryption ?? 'TLS',
  //     isActive: true,
  //     connectedAt: new Date(),
  //   },
  // });

  revalidatePath('/dashboard/integrations');
  return { success: true };
}

// ─── Disconnect SMTP ──────────────────────────────────────────────────────────
export async function disconnectSmtp() {
  const organizationId = await getOrganizationId();


  // await prisma.smtpIntegration.updateMany({
  //   where: { organizationId },
  //   data: { isActive: false },
  // });

  revalidatePath('/dashboard/integrations');
  return { success: true };
}

// ─── Test SMTP (internal helper) ─────────────────────────────────────────────
async function testSmtpConnection(data: {
  host: string; port: number; email: string; password: string; encryption?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Using nodemailer — add to package.json: npm i nodemailer @types/nodemailer
    // const nodemailer = await import('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: data.host,
    //   port: data.port,
    //   secure: data.port === 465,
    //   auth: { user: data.email, pass: data.password },
    // });
    // await transporter.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Connection failed' };
  }
}

// ─── Save Google Forms integration ───────────────────────────────────────────
export async function saveGoogleFormsIntegration(data: {
  apiKey: string;
  formId: string;
}) {
  const organizationId = await getOrganizationId();

  // Test the API key + form ID
  const testRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${data.formId}?key=${data.apiKey}`
  );
  if (!testRes.ok) {
    return { success: false, error: 'Invalid API Key or Form ID. Please check your credentials.' };
  }

  // await prisma.googleFormsIntegration.upsert({
  //   where: { organizationId },
  //   create: {
  //     organizationId,
  //     apiKey: encrypt(data.apiKey),
  //     formId: data.formId,
  //     isActive: true,
  //     connectedAt: new Date(),
  //   },
  //   update: {
  //     apiKey: encrypt(data.apiKey),
  //     formId: data.formId,
  //     isActive: true,
  //     connectedAt: new Date(),
  //   },
  // });

  revalidatePath('/dashboard/integrations');
  return { success: true };
}