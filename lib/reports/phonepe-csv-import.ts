/**
 * PhonePe CSV Import Utilities
 * 
 * Expected PhonePe Settlement CSV Format:
 * 
 * Transaction ID,UTR,Transaction Date,Transaction Amount,Settlement Amount,PG Fee,Merchant Transaction ID,Payment Instrument Type,Status
 * TXN123456,UTR987654321,2024-03-15 14:30:00,1500.00,1460.00,40.00,MERCH123,UPI,SUCCESS
 * 
 * OR (PhonePe's actual format may vary):
 * 
 * Txn ID,UTR No,Date,Amount,Settlement,Gateway Fee,Merchant ID,Type,Status
 */

'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export type PhonePeCSVRow = {
  transactionId: string
  utr: string
  transactionDate: string
  transactionAmount: number
  settlementAmount: number
  pgFee: number
  merchantTransactionId: string
  paymentInstrumentType: string
  status: string
}

/**
 * Hook to handle PhonePe CSV file upload and parsing
 */
export function usePhonePeCSVImport() {
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<PhonePeCSVRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parseCSV = useCallback(async (file: File): Promise<PhonePeCSVRow[]> => {
    setIsParsing(true)
    setError(null)

    try {
      const text = await file.text()
      const rows = parsePhonePeCSV(text)

      if (rows.length === 0) {
        throw new Error('No valid data found in CSV file')
      }

      setParsedData(rows)
      return rows
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse CSV'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setIsParsing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setParsedData(null)
    setError(null)
  }, [])

  return {
    isParsing,
    parsedData,
    error,
    parseCSV,
    reset,
  }
}

/**
 * Parse PhonePe CSV content to structured data
 */
export function parsePhonePeCSV(content: string): PhonePeCSVRow[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have header and at least one data row')
  }

  const headers = parseCSVLine(lines[0]).map(h => normalizeHeader(h))
  const dataStartIndex = hasBOM(headers[0]) ? 1 : 0
  
  // Remove BOM if present
  if (dataStartIndex > 0) {
    lines[0] = lines[0].replace(/^\uFEFF/, '')
  }

  const transactions: PhonePeCSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length && values.length > 0) {
      console.warn(`Line ${i + 1}: Column count mismatch, skipping`)
      continue
    }

    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() || ''
    })

    const transaction = mapToPhonePeRow(row)
    if (transaction) {
      transactions.push(transaction)
    }
  }

  return transactions
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Normalize header names to lowercase snake_case
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Check if header has BOM character
 */
function hasBOM(header: string): boolean {
  return header.startsWith('\uFEFF')
}

/**
 * Map CSV row to PhonePeCSVRow structure
 * Handles different column name variations
 */
function mapToPhonePeRow(row: Record<string, string>): PhonePeCSVRow | null {
  const transactionId = row['transaction_id'] || row['txn_id'] || row['transactionid'] || ''
  const utr = row['utr'] || row['utr_no'] || row['utrno'] || ''
  const transactionDate = row['transaction_date'] || row['date'] || row['txn_date'] || ''
  const transactionAmount = parseFloat(row['transaction_amount'] || row['amount'] || row['txn_amount'] || '0')
  const settlementAmount = parseFloat(row['settlement_amount'] || row['settlement'] || row['net_amount'] || '0')
  const pgFee = parseFloat(row['pg_fee'] || row['gateway_fee'] || row['service_charge'] || '0')
  const merchantTransactionId = row['merchant_transaction_id'] || row['merchant_id'] || row['merchant_txn_id'] || ''
  const paymentInstrumentType = row['payment_instrument_type'] || row['payment_type'] || row['type'] || ''
  const status = row['status'] || 'SUCCESS'

  // Validate required fields
  if (!transactionId && !utr) {
    return null
  }

  return {
    transactionId,
    utr,
    transactionDate,
    transactionAmount,
    settlementAmount,
    pgFee,
    merchantTransactionId,
    paymentInstrumentType,
    status,
  }
}

/**
 * Validate PhonePe transactions before reconciliation
 */
export function validatePhonePeTransactions(transactions: PhonePeCSVRow[]): {
  valid: PhonePeCSVRow[]
  invalid: Array<{ row: PhonePeCSVRow; error: string }>
} {
  const valid: PhonePeCSVRow[] = []
  const invalid: Array<{ row: PhonePeCSVRow; error: string }> = []

  for (const txn of transactions) {
    const errors: string[] = []

    if (!txn.transactionId && !txn.utr) {
      errors.push('Missing transaction ID and UTR')
    }

    if (txn.transactionAmount <= 0) {
      errors.push('Invalid transaction amount')
    }

    if (!txn.transactionDate) {
      errors.push('Missing transaction date')
    }

    if (!['SUCCESS', 'FAILED', 'PENDING'].includes(txn.status.toUpperCase())) {
      errors.push(`Unknown status: ${txn.status}`)
    }

    if (errors.length > 0) {
      invalid.push({ row: txn, error: errors.join(', ') })
    } else {
      valid.push(txn)
    }
  }

  return { valid, invalid }
}

/**
 * Download sample PhonePe CSV template
 */
export function downloadSamplePhonePeCSV() {
  const sample = `Transaction ID,UTR,Transaction Date,Transaction Amount,Settlement Amount,PG Fee,Merchant Transaction ID,Payment Instrument Type,Status
TXN202403150001,UTR987654321,2024-03-15 14:30:00,1500.00,1460.00,40.00,MERCH123,UPI,SUCCESS
TXN202403150002,UTR987654322,2024-03-15 15:45:00,2500.00,2437.50,62.50,MERCH124,UPI,SUCCESS
TXN202403150003,UTR987654323,2024-03-15 16:20:00,3000.00,2925.00,75.00,MERCH125,CARD,SUCCESS`

  const blob = new Blob([sample], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'phonepe_sample_settlement.csv'
  a.click()
  URL.revokeObjectURL(url)
}
