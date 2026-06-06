'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Info, ChevronRight, Calculator, ShieldCheck } from 'lucide-react';
import { phonePayInitPayment } from '@/lib/data/fee/recordOnlinePayment';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyINWithSymbol } from '@/lib/utils';
import { PLATFORM_FEE_PERCENT } from '@/constants';

type PayFeeButtonProps = {
  feeId: string;
  feeCategoryName: string;
  pendingAmount: number;
  instituteAbsorbsFee?: boolean;
};

const PayFeeButton = ({
  feeId,
  feeCategoryName,
  pendingAmount,
  instituteAbsorbsFee = false,
}: PayFeeButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const amount = Number(pendingAmount) || 0;
  const platformFee = parseFloat((amount * PLATFORM_FEE_PERCENT).toFixed(2));
  const totalPayable = instituteAbsorbsFee ? amount : amount + platformFee;

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await phonePayInitPayment(feeId);

        if (!result || typeof result !== 'object') {
          throw new Error('Invalid server response. Please try again.');
        }

        const { success, redirectUrl, transactionId } = result;

        if (!success) throw new Error('Payment initialization failed. Please try again.');
        if (!redirectUrl || typeof redirectUrl !== 'string') throw new Error('Payment gateway URL is missing.');

        setTimeout(() => router.push(redirectUrl), 50);
      } catch (error) {
        console.error('Payment error:', error);
        alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      }
    });
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="shadow-sm transition-all active:scale-95 px-4 gap-2"
            disabled={isPending}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CreditCard className="h-3.5 w-3.5" />
            }
            {isPending ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogTrigger>

        <DialogContent className="
          w-[90%] max-w-none rounded-lg p-0
          sm:h-auto sm:max-w-sm sm:rounded-xl
          overflow-hidden bg-background flex flex-col
        ">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  Payment Summary
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Review your details before continuing
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fee Category
              </span>
              <Badge variant="secondary" className="capitalize font-medium text-xs">
                {feeCategoryName}
              </Badge>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fee Amount</span>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrencyINWithSymbol(amount)}
                </span>
              </div>

              {!instituteAbsorbsFee ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    Convenience Charge ({(PLATFORM_FEE_PERCENT * 100).toFixed(1)}%)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="Why this charge?"
                          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                        This {(PLATFORM_FEE_PERCENT * 100).toFixed(1)}% charge covers secure payment gateway costs — not collected by your institute.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    + {formatCurrencyINWithSymbol(platformFee)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Convenience Charge</span>
                  <Badge
                    variant="outline"
                    className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
                  >
                    Covered by Institute
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold">Total Payable</span>
                <span className="text-2xl font-bold tabular-nums">
                  {formatCurrencyINWithSymbol(totalPayable)}
                </span>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Payments are encrypted with 256-bit SSL. You'll be redirected to PhonePe's secure checkout.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-6 py-4 border-t border-border bg-background">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClick}
              disabled={isPending}
              className="flex-[2] gap-2"
            >
              {isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ChevronRight className="w-4 h-4" />
              }
              {isPending ? 'Processing...' : `Pay ${formatCurrencyINWithSymbol(totalPayable)}`}
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default PayFeeButton;