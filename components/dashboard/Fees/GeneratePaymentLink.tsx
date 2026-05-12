'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  Link as LinkIcon,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateFeePaymentLink } from '@/lib/data/fee/generatePaymentLink';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/public/icons/WhatsAppIcon';

interface GeneratePaymentLinkProps {
  feeId: string;
  studentName: string;
  amount: number;
}

export const GeneratePaymentLink = ({
  feeId,
  studentName,
  amount,
}: GeneratePaymentLinkProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateFeePaymentLink(feeId);
      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        toast.success('Payment link generated successfully!');
      } else {
        toast.error('Failed to generate link', {
          description: result.message || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Internal Server Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!paymentUrl) return;
    const message = `Hello, here is the payment link for the fee of ${studentName}: ${paymentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Payment Link (Online)</Label>
        {!paymentUrl ? (
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Generate Shareable Payment Link
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={paymentUrl}
                  readOnly
                  className="pr-10 bg-muted/50 font-mono text-xs overflow-hidden text-ellipsis"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy URL'}
              </Button>
              <Button
                className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
                onClick={shareOnWhatsApp}
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </Button>
            </div>

            <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <p>
                This link is valid for 20 minutes. Please ask the parent to complete the payment immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
