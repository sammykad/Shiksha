// lib/reports/generate-reconciliation-report.ts

'use server'

import { format } from 'date-fns'
import { getReconciliationData, ReconciliationFilters } from './get-reconciliation-data';
import { ReportFormat } from '@/types/reports';


const PENDING_NOTE = 'Pending PhonePe import'

export async function generateReconciliationReport(
  filters: ReconciliationFilters,
  reportFormat: ReportFormat = 'csv'
): Promise<{ data: string; filename: string; mimeType: string }> {

  const { rows, summary } = await getReconciliationData(filters)

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm')
  const monthLabel = format(filters.month, 'MMM-yyyy')
  const filename = `fee_reconciliation_${monthLabel}_${timestamp}`

  // ── Headers ────────────────────────────────────────────────────────────────
  const headers = [
    'Date',
    'Receipt No',
    'Transaction ID',
    'Student Name',
    'Roll No',
    'Grade',
    'Section',
    'Fee Category',
    'Payment Method',
    'School Fee (₹)',
    'Platform Fee 2.5% (₹)',
    'Parent Paid (₹)',
    'PG Fee (₹)',           // 0 until PhonePe CSV import
    'Net Received (₹)',     // 0 until PhonePe CSV import
    'Status',
  ]

  // ── Data rows ──────────────────────────────────────────────────────────────
  const dataRows = rows.map((r) => [
    format(r.paymentDate, 'dd/MM/yyyy'),
    r.receiptNumber,
    r.transactionId ?? '-',
    r.studentName,
    r.rollNumber,
    r.grade,
    r.section,
    r.category,
    r.paymentMethod,
    r.amount.toFixed(2),
    r.platformFee.toFixed(2),
    r.parentPaid.toFixed(2),
    r.pgFee > 0 ? r.pgFee.toFixed(2) : PENDING_NOTE,
    r.netReceived > 0 ? r.netReceived.toFixed(2) : PENDING_NOTE,
    r.status,
  ])

  // ── Summary rows ───────────────────────────────────────────────────────────
  const blankRow = headers.map(() => '')
  const summaryRows = [
    blankRow,
    ['SUMMARY', '', '', '', '', '', '', '', '',
      summary.totalAmount.toFixed(2),
      summary.totalPlatformFee.toFixed(2),
      summary.totalParentPaid.toFixed(2),
      summary.totalPgFee > 0 ? summary.totalPgFee.toFixed(2) : PENDING_NOTE,
      summary.totalNetReceived > 0 ? summary.totalNetReceived.toFixed(2) : PENDING_NOTE,
      `${summary.txnCount} transactions`,
    ],
    blankRow,
    // Method breakdown
    ['BY METHOD', '', '', '', '', '', '', '', 'Method', 'School Fee', 'Platform Fee', 'Parent Paid', 'PG Fee', 'Net Received', 'Count'],
    ...summary.byMethod.map((m) => [
      '', '', '', '', '', '', '', '', m.method,
      m.totalAmount.toFixed(2),
      m.totalPlatformFee.toFixed(2),
      m.totalParentPaid.toFixed(2),
      m.totalPgFee > 0 ? m.totalPgFee.toFixed(2) : PENDING_NOTE,
      m.totalNetReceived > 0 ? m.totalNetReceived.toFixed(2) : PENDING_NOTE,
      String(m.count),
    ]),
  ]

  const allRows = [...dataRows, ...summaryRows]

  // ── CSV ────────────────────────────────────────────────────────────────────
  if (reportFormat === 'csv') {
    const csvContent = [
      headers.join(','),
      ...allRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return { data: csvContent, filename: `${filename}.csv`, mimeType: 'text/csv' }
  }

  // ── Excel ──────────────────────────────────────────────────────────────────
  if (reportFormat === 'excel') {
    return {
      data: JSON.stringify({
        sheetName: `Reconciliation ${monthLabel}`,
        headers,
        rows: allRows,
      }),
      filename: `${filename}.xlsx`,
      mimeType: 'application/json',
    }
  }

  throw new Error('Unsupported format for reconciliation report')
}