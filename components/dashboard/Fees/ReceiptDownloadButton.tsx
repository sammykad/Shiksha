'use client';

import { useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FeeRecord } from '@/types';
import { FeeReceiptPDF } from '@/lib/pdf-generator/FeeReceiptPDF';
import { pdf } from '@react-pdf/renderer';
import { downloadBlob } from '@/lib/pdf-generator/pdf';
import { cn } from '@/lib/utils';


interface ReceiptDownloadButtonProps {
  record: FeeRecord;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ReceiptDownloadButton({
  record,
  variant = 'outline',
  size = 'default',
  className,
}: ReceiptDownloadButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(async () => {
      try {
        const pdfDoc = <FeeReceiptPDF feeRecord={record} copyType="STUDENT COPY" />;
        const blob = await pdf(pdfDoc).toBlob();
        downloadBlob(blob, `fee-receipt-${record.student.firstName}-${record.student.lastName}.pdf`);

      } catch (error) {
        toast.error('Failed to generate receipt');
      }
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('inline-flex min-h-11 items-center justify-center gap-2 leading-none', className)}
      onClick={handleDownload}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      ) : (
        <Download className="h-4 w-4 shrink-0" />
      )}
      <span>{isPending ? 'Generating...' : 'Download Receipt'}</span>
    </Button>
  );
}
