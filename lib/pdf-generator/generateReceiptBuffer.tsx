// lib/pdf-generator/generateReceiptBuffer.tsx
import { renderToBuffer } from '@react-pdf/renderer';
import { FeeReceiptPDF } from './FeeReceiptPDF';
import type { FeeRecord } from '@/types';

export async function generateReceiptBuffer(record: FeeRecord): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <FeeReceiptPDF feeRecord={record} copyType="ORIGINAL" />
  );
  return buffer;
}