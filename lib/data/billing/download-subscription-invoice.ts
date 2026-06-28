"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma-base";
import { generateSubscriptionInvoicePDFBuffer } from "@/lib/pdf-generator/generate-pdf-buffer";

export async function downloadSubscriptionInvoicePdf(invoiceId: string) {
  try {
    const { orgId, orgRole } = await auth();
    if (orgRole !== "ADMIN") {
      return { success: false as const, error: "Forbidden" };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { organizationId: true, invoiceNumber: true },
    });
    if (!invoice) {
      return { success: false as const, error: "Invoice not found" };
    }
    if (invoice.organizationId !== orgId) {
      return { success: false as const, error: "Forbidden" };
    }

    const pdfBuffer = await generateSubscriptionInvoicePDFBuffer(invoiceId);

    return {
      success: true as const,
      base64: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`,
      filename: `${invoice.invoiceNumber}.pdf`,
    };
  } catch (error) {
    console.error("Invoice PDF download failed:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "PDF generation failed",
    };
  }
}
