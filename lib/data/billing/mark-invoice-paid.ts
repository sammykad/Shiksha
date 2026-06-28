"use server"

import prisma from "@/lib/prisma-base";
import { auth } from "@/lib/auth";
import { getInvoicePDFData } from "@/lib/subscription-billing";
import { generateSubscriptionInvoicePDFBuffer } from "@/lib/pdf-generator/generate-pdf-buffer";
import {
  InvoiceStatus,
  SubscriptionPaymentStatus,
  PaymentProvider,
  NotificationChannel,
} from "@/generated/prisma/enums";
import { sendNotification } from "@/lib/notifications/engine";
import { revalidatePath } from "next/cache";

export async function markInvoiceAsPaid(invoiceId: string, utr: string) {
  const { orgId, orgRole } = await auth();
  if (orgRole !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  if (!utr || utr.trim().length === 0) {
    return { success: false, error: "UTR (payment reference) is required" };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: { include: { plan: true } },
    },
  });

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.organizationId !== orgId) {
    return { success: false, error: "Forbidden" };
  }

  if (invoice.status !== InvoiceStatus.OPEN) {
    return { success: false, error: `Invoice is already ${invoice.status.toLowerCase()}` };
  }

  const now = new Date();

  try {
    await prisma.$transaction([
      prisma.subscriptionPayment.create({
        data: {
          subscriptionId: invoice.subscriptionId,
          invoiceId: invoice.id,
          provider: PaymentProvider.MANUAL,
          providerOrderId: utr.trim(),
          amount: invoice.total,
          status: SubscriptionPaymentStatus.SUCCESS,
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: now,
        },
      }),
    ]);

    await prisma.billingEvent.create({
      data: {
        subscriptionId: invoice.subscriptionId,
        type: "invoice_paid",
        message: `Invoice ${invoice.invoiceNumber} marked as paid. UTR: ${utr.trim()}.`,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          utr: utr.trim(),
          amount: invoice.total,
        },
      },
    });

    const pdfBuffer = await generateSubscriptionInvoicePDFBuffer(invoiceId);
    const pdfData = await getInvoicePDFData(invoiceId);

    const adminMember = await prisma.membership.findFirst({
      where: { organizationId: orgId, role: "ADMIN", status: "ACTIVE" },
      select: { userId: true },
    });

    if (adminMember?.userId) {
      await sendNotification({
        templateId: "BILLING_INVOICE_PAID",
        organizationId: orgId,
        eventId: `billing:${invoice.subscriptionId}:invoice:${invoice.invoiceNumber}:paid`,
        recipients: [{ userId: adminMember.userId }],
        channels: [NotificationChannel.WHATSAPP],
        variables: {
          planName: invoice.subscription.plan?.name ?? "Custom",
          amount: invoice.total,
          invoiceNumber: invoice.invoiceNumber ?? `INV-${invoice.id.slice(0, 8)}`,
          paidAt: now.toISOString(),
          paymentMethod: "Manual (UTR)",
          utr: utr.trim(),
          studentCount: invoice.studentCount,
          organizationName: pdfData.organizationName,
        },
        attachment: {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      });
    }

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: InvoiceStatus.PAID,
        paidAt: now.toISOString(),
        utr: utr.trim(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark invoice as paid",
    };
  }
}
