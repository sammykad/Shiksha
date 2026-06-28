import React from "react";
import { renderToBuffer } from '@react-pdf/renderer';
import { FeeReceiptPDF } from './FeeReceiptPDF';
import { SubscriptionInvoicePDF } from './SubscriptionInvoicePDF';
import { getInvoicePDFData } from '@/lib/subscription-billing';
import type { FeeRecord } from '@/types';

type DocumentElement = Parameters<typeof renderToBuffer>[0];

export async function generateReceiptBuffer(record: FeeRecord): Promise<Buffer> {
  return renderToBuffer(React.createElement(FeeReceiptPDF, { feeRecord: record, copyType: "ORIGINAL" }) as DocumentElement);
}

export async function generateSubscriptionInvoicePDFBuffer(invoiceId: string): Promise<Buffer> {
  const data = await getInvoicePDFData(invoiceId);
  return renderToBuffer(React.createElement(SubscriptionInvoicePDF, { data }) as DocumentElement);
}

export async function generateSubscriptionInvoicePDFBufferFromData(data: Awaited<ReturnType<typeof getInvoicePDFData>>): Promise<Buffer> {
  return renderToBuffer(React.createElement(SubscriptionInvoicePDF, { data }) as DocumentElement);
}
