"use server"

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { generateInvoiceForOrganization } from "@/lib/subscription-billing";
import { SubscriptionInvoicePDF } from "@/lib/pdf-generator/SubscriptionInvoicePDF";
import { PaymentProvider } from "@/generated/prisma/enums";

type DocumentElement = Parameters<typeof renderToBuffer>[0];

export async function generateAdminSubscriptionInvoice(data: {
  organizationId: string;
  provider?: string;
  providerOrderId?: string;
  createdBy?: string;
  manualAmount?: number;
  apiKey: string;
}) {
  if (data.apiKey !== process.env.BILLING_API_KEY) {
    return { success: false as const, error: "Invalid or missing API key" };
  }

  try {
    const paymentProvider = Object.values(PaymentProvider).includes(data.provider as PaymentProvider)
      ? (data.provider as PaymentProvider)
      : PaymentProvider.MANUAL;

    const result = await generateInvoiceForOrganization({
      organizationId: data.organizationId,
      provider: paymentProvider,
      providerOrderId: data.providerOrderId ?? undefined,
      createdBy: data.createdBy ?? "API",
      manualAmount: data.manualAmount !== undefined ? Number(data.manualAmount) : undefined,
    });

    const pdfData = {
      invoiceNumber: result.invoice.invoiceNumber,
      createdAt: result.invoice.createdAt,
      organizationName: result.organization.name,
      organizationEmail: result.organization.email,
      planName: result.subscription.planName,
      studentCount: result.subscription.studentCount,
      unitPrice: result.subscription.unitPrice,
      periodStart: result.subscription.periodStart,
      periodEnd: result.subscription.periodEnd,
      subtotal: result.invoice.subtotal,
      discount: result.invoice.discount,
      total: result.invoice.total,
      status: result.invoice.status,
      paidAt: result.invoice.paidAt,
      paymentProvider: paymentProvider,
      paymentReference: data.providerOrderId ?? null,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(SubscriptionInvoicePDF, { data: pdfData }) as DocumentElement
    );

    return {
      success: true as const,
      base64: pdfBuffer.toString("base64"),
      invoiceNumber: result.invoice.invoiceNumber,
      total: result.invoice.total,
    };
  } catch (error) {
    console.error("Invoice generation failed:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Invoice generation failed",
    };
  }
}
