'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  Slash,
  IndianRupeeIcon,
} from 'lucide-react';
import { formatCurrencyINWithSymbol, formatDateIN } from '@/lib/utils';
import { PaymentStatus, PaymentMethod } from '@/generated/prisma/enums';

interface PaymentData {
  id: string;
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  note: string | null;
  transactionId: string | null;
  payerId: string;
  feeId: string;
  platformFee: number | null; // percentage
  status: PaymentStatus;
  recordedBy: string | null;
  organizationName: string;
  feeCategoryName?: string;
  createdAt: Date;
  updatedAt: Date;
  payer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  chequeDetail?: {
    chequeNumber: string;
    chequeDate: Date;
    bankName: string;
    status: string;
    bounceReason?: string | null;
  } | null;
}

interface FeeReceiptCardProps {
  receiptData: PaymentData;
}

export function FeeReceiptCard({ receiptData }: FeeReceiptCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);



  const getNetAmount = () => {
    return receiptData.amountPaid + (receiptData.platformFee ?? 0);
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'UNPAID':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REFUNDED':
        return <RefreshCcw className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED':
        return <Slash className="w-4 h-4 text-gray-500" />;
      case 'CHEQUE_PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'verified'; // Green ✅
      case 'UNPAID':
        return 'rejected'; // Red ❌
      case 'PENDING':
        return 'pending'; // Yellow ⏳
      case 'FAILED':
        return 'rejected'; // Red ❌
      case 'REFUNDED':
        return 'meta'; // Blue 🔁
      case 'CANCELLED':
        return 'outline'; // Grey 🚫
      case 'CHEQUE_PENDING':
        return 'pending'; // Amber/Yellow
      default:
        return 'outline'; // fallback
    }
  };

  // const handleDownload = async () => {
  //   setIsDownloading(true);
  //   try {
  //     const response = await generateReceiptPDF(receiptData.feeId);

  //     if (response) {
  //       const blob = await response.blob();
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.style.display = 'none';
  //       a.href = url;
  //       a.download = `receipt-${receiptData.receiptNumber}.pdf`;
  //       document.body.appendChild(a);
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //       document.body.removeChild(a);
  //     }
  //   } catch (error) {
  //     console.error('Error downloading receipt:', error);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                {receiptData.status === 'CHEQUE_PENDING' ? 'Provisional Receipt' : 'Payment Receipt'}
              </h2>
            </div>
            <p className="text-sm text-slate-500">Transaction confirmation</p>
          </div>
          <Badge
            variant={getStatusBadgeVariant(receiptData.status)}
            className="flex items-center gap-1"
          >
            {getStatusIcon(receiptData.status)}
            {receiptData.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Amount Section */}
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {formatCurrencyINWithSymbol(getNetAmount())}
          </div>
          {receiptData.status === 'CHEQUE_PENDING' && (
            <p className="text-[10px] text-amber-600 italic mb-1 font-medium">
              * Provisional Receipt: Subject to cheque clearance
            </p>
          )}
          <p className="text-sm text-slate-500">Total Paid Amount</p>
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Hash className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Receipt Number
                </p>
                <p className="text-sm font-mono text-slate-900 break-all">
                  {receiptData.receiptNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Payment Date
                </p>
                <p className="text-sm text-slate-900">
                  {formatDateIN(receiptData.paymentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Payment Method
                </p>
                <p className="text-sm text-slate-900">
                  {receiptData.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Receipt className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Transaction ID
                </p>
                <p className="text-sm font-mono text-slate-900">
                  {receiptData.transactionId || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Payer Name
                </p>
                <p className="text-sm font-mono text-slate-900 break-all">
                  {receiptData?.payer?.firstName ?? 'N/A'}{' '}
                  {receiptData?.payer?.lastName ?? ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Organization Name
                </p>
                <p className="text-sm font-mono text-slate-900 break-all">
                  {receiptData.organizationName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900">
              Amount Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between ">
                <span className="flex items-center gap-1">
                  <IndianRupeeIcon className="w-3 h-3" /> Fee Amount
                </span>
                <span className="font-medium">
                  {formatCurrencyINWithSymbol(receiptData.amountPaid)}
                </span>
              </div>

              <div className="flex justify-between text-blue-600">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Convenience Charge
                </span>
                <span className="font-medium">
                  + {formatCurrencyINWithSymbol(receiptData.platformFee ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total Paid</span>
                <span>{formatCurrencyINWithSymbol(getNetAmount())}</span>
              </div>
            </div>
          </div>
        </>

        {/* Cheque Details */}
        {receiptData.paymentMethod === 'CHEQUE' && receiptData.chequeDetail && (
          <>
            <Separator />
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <CreditCard className="w-4 h-4" />
                Cheque Information
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Cheque Number</p>
                  <p className="font-mono font-semibold text-amber-900">#{receiptData.chequeDetail.chequeNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Bank Name</p>
                  <p className="font-semibold text-amber-900">{receiptData.chequeDetail.bankName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Cheque Date</p>
                  <p className="text-amber-900">{formatDateIN(receiptData.chequeDetail.chequeDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Cheque Status</p>
                  <Badge variant={receiptData.chequeDetail.status === 'CLEARED' ? 'verified' : receiptData.chequeDetail.status === 'BOUNCED' ? 'rejected' : 'pending'} className="mt-0.5">
                    {receiptData.chequeDetail.status}
                  </Badge>
                </div>
              </div>
              {receiptData.chequeDetail.bounceReason && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Bounce Reason</p>
                  <p className="text-sm text-red-900 italic">"{receiptData.chequeDetail.bounceReason}"</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Note */}
        {receiptData.note && (
          <>
            <Separator />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Note:</span> {receiptData.note}
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500 space-y-1">
            <p>Created: {formatDateIN(receiptData.createdAt)}</p>
            <p>Updated: {formatDateIN(receiptData.updatedAt)}</p>
          </div>

          {/* <Button
            onClick={handleDownload}
            disabled={isDownloading}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button> */}
        </div>
      </div>
    </div>
  );
}
