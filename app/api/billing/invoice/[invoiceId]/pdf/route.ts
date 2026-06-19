import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma-base";
import { getInvoicePDFData } from "@/lib/subscription-billing";
import { SubscriptionInvoicePDF } from "@/lib/pdf-generator/SubscriptionInvoicePDF";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { orgId, orgRole } = await auth();
    if (orgRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { invoiceId } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { organizationId: true },
    });
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const pdfData = await getInvoicePDFData(invoiceId);

    const pdfBuffer = await renderToBuffer(
      React.createElement(SubscriptionInvoicePDF, { data: pdfData }) as any
    );

    return new NextResponse(pdfBuffer as unknown as Blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF download failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "PDF generation failed",
      },
      { status: 500 }
    );
  }
}
