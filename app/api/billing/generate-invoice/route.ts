import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { generateInvoiceForOrganization } from "@/lib/subscription-billing";
import { SubscriptionInvoicePDF } from "@/lib/pdf-generator/SubscriptionInvoicePDF";
import { PaymentProvider } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  if (request.headers.get("x-api-key") !== process.env.BILLING_API_KEY) {
    return NextResponse.json({ success: false, error: "Invalid or missing API key" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organizationId, provider, providerOrderId, createdBy, manualAmount } = body;

    if (!organizationId || typeof organizationId !== "string") {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 }
      );
    }

    const paymentProvider = Object.values(PaymentProvider).includes(provider)
      ? (provider as PaymentProvider)
      : PaymentProvider.MANUAL;

    const result = await generateInvoiceForOrganization({
      organizationId,
      provider: paymentProvider,
      providerOrderId: providerOrderId ?? undefined,
      createdBy: createdBy ?? "API",
      manualAmount: manualAmount !== undefined ? Number(manualAmount) : undefined,
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
      paymentReference: providerOrderId ?? null,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(SubscriptionInvoicePDF, { data: pdfData }) as any
    );

    return new NextResponse(pdfBuffer as unknown as Blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.invoice.invoiceNumber}.pdf"`,
        "X-Invoice-Number": result.invoice.invoiceNumber,
        "X-Invoice-Amount": String(result.invoice.total),
      },
    });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invoice generation failed",
      },
      { status: 500 }
    );
  }
}
