'use client';

import React, { useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, Calendar, IndianRupee, BarChart3, Users,
  TrendingUp, TrendingDown, Target, FileText, Clock,
  Sparkles, ReceiptIndianRupee, Printer,
} from 'lucide-react';
import { generateAiMonthlyFeesReportAction } from '@/ai/gemini-monthly-fee-report';
import AIStateLoading from '@/components/AILoadingState';
import { formatDateIN } from '@/lib/utils';

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
  formattedAmount: string;
  percentage: number;
}

interface ParsedSummary {
  monthlyData: MonthlyData[];
  totalAmount: number;
  totalPayments: number;
  averagePerMonth: number;
  averagePerPayment: number;
  bestMonth: MonthlyData | null;
  worstMonth: MonthlyData | null;
  rawText: string;
  parsingSuccess: boolean;
}

interface Data {
  year: number;
  month: number;
  amount: number;
  count: number;
}

interface AiMonthlyReportProps {
  data: Data[];
  academicYearName?: string;
}

const AiMonthlyReport: React.FC<AiMonthlyReportProps> = ({ data, academicYearName }) => {
  const [reportObject, setReportObject] = React.useState<any>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  // In the empty state / below the generate button:
  {
    error && (
      <p className="mt-3 text-xs text-destructive text-center max-w-xs">
        {error}
      </p>
    )
  }
  const processReport = (obj: any): ParsedSummary => {
    if (!obj) {
      return {
        monthlyData: [], totalAmount: 0, totalPayments: 0,
        averagePerMonth: 0, averagePerPayment: 0,
        bestMonth: null, worstMonth: null, rawText: '', parsingSuccess: false,
      };
    }

    const monthlyData = obj.monthlyData.map((m: any) => ({
      ...m,
      formattedAmount: `₹${m.amount.toLocaleString('en-IN')}`,
      percentage: obj.totalAmount > 0 ? (m.amount / obj.totalAmount) * 100 : 0,
    }));

    const bestMonth = monthlyData.length > 0
      ? monthlyData.reduce((prev: any, current: any) => prev.amount > current.amount ? prev : current)
      : null;

    const worstMonth = monthlyData.length > 0
      ? monthlyData.reduce((prev: any, current: any) => prev.amount < current.amount ? prev : current)
      : null;

    return {
      monthlyData,
      totalAmount: obj.totalAmount,
      totalPayments: obj.totalPayments,
      averagePerMonth: obj.averagePaymentsPerMonth,
      averagePerPayment: obj.totalPayments > 0 ? Math.round(obj.totalAmount / obj.totalPayments) : 0,
      bestMonth,
      worstMonth,
      rawText: obj.summary,
      parsingSuccess: true,
    };
  };

  function formatFeeData(data: { year: number; month: number; amount: number; count: number }[]) {
    return data.map((item) => {
      const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long' });
      return `${monthName} ${item.year}: ₹${item.amount.toLocaleString('en-IN')} collected from ${item.count} payments`;
    }).join('\n');
  }

  const handleGenerate = async () => {
    startTransition(async () => {
      try {
        const formattedText = formatFeeData(data);
        const result = await generateAiMonthlyFeesReportAction(formattedText, academicYearName);
        setReportObject(result);
      } catch (error: any) {
        console.error('Error generating summary:', error);
        
        if (error?.statusCode === 429 || error?.message?.includes('429')) {
          setError("We've hit our AI usage limit for the day. Please try again tomorrow or upgrade the API plan.");
          return;
        }
        
        // Surface the real message to the user
        setError(error?.message ?? 'Failed to generate report. Please try again.');
      }
    });
  };

  const parsedData = processReport(reportObject);
  const reportDate = formatDateIN(new Date());
  const reportId = `FEE-RPT-${Date.now().toString().slice(-8)}`;
  const fiscalYear = data.length > 0 ? data[0].year : new Date().getFullYear();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ai" className="gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="sm:hidden">AI</span>
          <span className="hidden sm:inline">Generate Report</span>
        </Button>
      </DialogTrigger>

      {/* ✅ Fix 1: Full-screen on mobile, large modal on desktop */}
      <DialogContent className="
        w-full max-w-none h-full rounded-none p-0
        sm:h-auto sm:max-w-3xl sm:rounded-lg sm:max-h-[90vh]
        overflow-y-auto bg-white
      ">
        <DialogHeader className="sr-only">
          <DialogTitle>Monthly Fee Collection Report</DialogTitle>
          <DialogDescription>
            Comprehensive AI-powered analysis of monthly fee collections
          </DialogDescription>
        </DialogHeader>

        {/* Empty state */}
        {!reportObject && !isPending && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
              <ReceiptIndianRupee className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-center">Generate AI Fee Report</h3>
            <p className="text-muted-foreground text-center max-w-xs text-sm">
              Create a comprehensive AI-powered analysis of fee collections with detailed insights
            </p>
            <Button onClick={handleGenerate} disabled={isPending} className="mt-6 gap-2" size="sm">
              <Sparkles className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        )}

        {isPending && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <AIStateLoading />
          </div>
        )}

        {reportObject && !isPending && (
          <div className="flex flex-col bg-white">

            {/* ✅ Fix 2: Sticky header on mobile so title is always visible */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between sm:hidden">
              <span className="text-sm font-semibold text-slate-900">Fee Collection Report</span>
              <Badge variant="outline" className="text-xs border-primary/20">
                <Sparkles className="w-3 h-3 mr-1 text-primary" />
                AI
              </Badge>
            </div>

            {/* Report Header */}
            <div className="border-b-4 border-primary bg-slate-50 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <ReceiptIndianRupee className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                      Monthly Fee Collection Report
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">AI-Powered Financial Analysis</p>
                  </div>
                </div>
                {/* Hidden on mobile, shown on sm+ */}
                <Badge variant="outline" className="hidden sm:flex border-primary/20 flex-shrink-0">
                  <Sparkles className="w-3 h-3 mr-1 text-primary" />
                  AI Generated
                </Badge>
              </div>

              {/* ✅ Fix 3: Meta info as a simple list on mobile instead of grid */}
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                {/* Mobile: stacked, compact */}
                <div className="grid grid-cols-2 gap-3 sm:hidden text-xs text-slate-600">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">Period</span>
                    <span className="font-medium">{academicYearName || `FY ${fiscalYear}`}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">Months</span>
                    <span className="font-medium">{parsedData.monthlyData.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">Report ID</span>
                    <span className="font-medium">{reportId}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">Generated</span>
                    <span className="font-medium">{reportDate}</span>
                  </div>
                </div>
                {/* Desktop: 3-col grid */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Reporting Period</div>
                    <div className="text-sm font-semibold text-slate-900">{academicYearName || `Fiscal Year ${fiscalYear}`}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Total Months</div>
                    <div className="text-sm font-semibold text-slate-900">{parsedData.monthlyData.length} Months</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Report Type</div>
                    <div className="text-sm font-semibold text-slate-900">Comprehensive</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Executive Summary</h2>
              </div>

              {/* ✅ Fix 4: 2-col grid on mobile (not 4), 4-col on lg */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50">
                        <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mb-0.5">Total Collections</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      ₹{parsedData.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mb-0.5">Transactions</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {parsedData.totalPayments.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-violet-50">
                        <Calendar className="h-3.5 w-3.5 text-violet-600" />
                      </div>
                      <Target className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mb-0.5">Avg Txn/Month</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {typeof parsedData.averagePerMonth === 'number'
                        ? parsedData.averagePerMonth.toFixed(1)
                        : parsedData.averagePerMonth}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-50">
                        <Target className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mb-0.5">Avg/Transaction</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      ₹{parsedData.averagePerPayment.toLocaleString('en-IN')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Highlights */}
            {parsedData.bestMonth && parsedData.worstMonth && (
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Performance Highlights</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">Best Performance</div>
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-100">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-900 mb-2">{parsedData.bestMonth.month}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-emerald-700">Amount</span>
                          <span className="font-bold text-emerald-900">{parsedData.bestMonth.formattedAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-700">Transactions</span>
                          <span className="font-semibold text-emerald-800">{parsedData.bestMonth.count}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-emerald-200">
                          <span className="text-emerald-600">Share of Total</span>
                          <span className="font-semibold text-emerald-800">{parsedData.bestMonth.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-slate-50/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-medium text-slate-600 uppercase tracking-wide">Lowest Collection</div>
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100">
                          <TrendingDown className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mb-2">{parsedData.worstMonth.month}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-700">Amount</span>
                          <span className="font-bold text-slate-900">{parsedData.worstMonth.formattedAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Transactions</span>
                          <span className="font-semibold text-slate-800">{parsedData.worstMonth.count}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-600">Share of Total</span>
                          <span className="font-semibold text-slate-800">{parsedData.worstMonth.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Monthly Breakdown */}
            {parsedData.parsingSuccess && parsedData.monthlyData.length > 0 && (
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Monthly Breakdown</h2>
                </div>

                {/* ✅ Fix 5: Mobile uses card-style rows instead of a table */}
                <div className="sm:hidden space-y-2">
                  {parsedData.monthlyData.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">{item.month}</span>
                        <span className="text-sm font-bold text-slate-900">{item.formattedAmount}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={item.percentage} className="h-1.5 flex-1" />
                        <span className="text-xs text-slate-500 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{item.count} transactions</span>
                        <span>₹{item.count > 0 ? Math.round(item.amount / item.count).toLocaleString('en-IN') : '0'}/txn</span>
                      </div>
                    </div>
                  ))}
                  {/* Mobile total row */}
                  <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-3">
                    <div className="flex justify-between text-sm font-bold text-slate-900">
                      <span>Total</span>
                      <span>₹{parsedData.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{parsedData.totalPayments.toLocaleString()} transactions</div>
                  </div>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Month</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Count</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Avg/Txn</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.monthlyData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.month}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{item.formattedAmount}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className="text-xs">{item.count}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-600">
                            ₹{item.count > 0 ? Math.round(item.amount / item.count).toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={item.percentage} className="h-2 flex-1" />
                              <span className="text-xs font-medium text-slate-600 w-12 text-right">{item.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-300">
                        <td className="px-4 py-3 font-bold text-sm text-slate-900">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-slate-900">₹{parsedData.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-slate-900">{parsedData.totalPayments.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-slate-900">₹{parsedData.averagePerPayment.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Detailed AI Analysis</h2>
              </div>
              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="p-3 sm:p-5">
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 font-sans leading-relaxed">
                    {parsedData.rawText}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{reportDate}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{reportId}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />Powered by AI
                </span>
              </div>
            </div>

            {/* ✅ Fix 6: Action buttons — stack on mobile, row on sm+ */}
            <div className="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end p-3 sm:p-4 bg-white border-t border-slate-200 print:hidden">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button onClick={handleGenerate} disabled={isPending} className="w-full sm:w-auto gap-2">
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Regenerating...</> : <><Sparkles className="w-4 h-4" />Regenerate</>}
              </Button>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiMonthlyReport;