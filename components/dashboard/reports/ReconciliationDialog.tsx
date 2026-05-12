// components/reports/reconciliation-dialog.tsx

'use client'

import React, { useState } from 'react'
import {
  DownloadIcon, Loader2, CalendarIcon,
  FileSpreadsheet, FileText, Check, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { format, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { downloadCSV, downloadExcel } from '@/lib/reports/download-utils'
import type { ReportFormat } from '@/types/reports'
import { generateReconciliationReport } from '@/lib/data/reports/generate-reconciliation-report'

const PAYMENT_METHODS = ['ALL', 'UPI', 'CARD', 'CASH', 'CHEQUE', 'BANK_TRANSFER', 'ONLINE'] as const

interface ReconciliationDialogProps {
  organizationId: string
  academicYearId: string
  trigger?: React.ReactNode
}

export function ReconciliationDialog({
  organizationId,
  academicYearId,
  trigger,
}: ReconciliationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()))
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL')
  const [reportFormat, setReportFormat] = useState<ReportFormat>('excel')
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const result = await generateReconciliationReport(
        { month: selectedMonth, paymentMethod: paymentMethod as any, organizationId, academicYearId },
        reportFormat
      )
      if (reportFormat === 'csv') downloadCSV(result.data, result.filename)
      else downloadExcel(result.data, result.filename)
      toast.success('Reconciliation report downloaded')
      setIsOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <DownloadIcon className="h-4 w-4 mr-2" /> Download Report
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b px-6 py-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Fee Reconciliation Report</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Transaction-level breakdown with platform fee and net settlement
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">

          {/* PG Fee notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">PG Fee & Net Received</span> columns will show
              "Pending PhonePe import" until you upload the PhonePe settlement CSV.
              This is coming in Phase 2.
            </p>
          </div>

          {/* Month picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              Select Month
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                Required
              </Badge>
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-11 font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{format(selectedMonth, 'MMMM yyyy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* Month-only calendar — user picks any day, we use startOfMonth */}
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedMonth(startOfMonth(date))
                      setCalendarOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment method filter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === 'ALL' ? 'All Methods' : m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format picker */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Download Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['excel', 'csv'] as ReportFormat[]).map((f) => {
                const isSelected = reportFormat === f
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setReportFormat(f)}
                    className={cn(
                      'group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                      isSelected
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md scale-[1.02]'
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'p-2.5 rounded-lg transition-all',
                      isSelected ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      {f === 'excel'
                        ? <FileSpreadsheet className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        : <FileText className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      }
                    </div>
                    <div className="text-left flex-1">
                      <div className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-foreground')}>
                        {f === 'excel' ? 'Excel' : 'CSV'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {f === 'excel' ? 'Recommended' : 'Universal format'}
                      </div>
                    </div>
                    <div className={cn(
                      'absolute -top-1.5 -right-1.5 p-1 rounded-full transition-all',
                      isSelected ? 'bg-primary text-white scale-100' : 'scale-0'
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isDownloading}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="min-w-[180px] bg-gradient-to-r from-primary to-primary/90"
          >
            {isDownloading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing Report...</>
            ) : (
              <><DownloadIcon className="h-4 w-4 mr-2" /> Download Report</>
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}