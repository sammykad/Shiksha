// /**
//  * Auto Fee Reconciliation Logic
//  * 
//  * Compares PhonePe settlement CSV data with internal FeePayment records
//  * to automatically identify mismatches, missing transactions, and calculate
//  * platform profits.
//  * 
//  * Flow:
//  * 1. Import PhonePe CSV → phonePeTransactions[]
//  * 2. Fetch internal FeePayment records for the same period
//  * 3. Match by transactionId / UTR / reference number
//  * 4. Identify:
//  *    - ✅ Matched transactions
//  *    - ⚠️ Amount mismatches
//  *    - ❌ Missing in PhonePe (not settled)
//  *    - ❌ Missing in Internal (not recorded)
//  * 5. Calculate Shiksha profit = platformFee - pgFee
//  * 6. Update FeePayment records with pgFee, netReceived, isReconciled
//  */

// 'use server'

// import prisma from '@/lib/db'
// import { startOfMonth, endOfMonth } from 'date-fns'

// export type PhonePeTransaction = {
//   transactionId: string
//   utr: string
//   transactionDate: string
//   transactionAmount: number
//   settlementAmount: number
//   pgFee: number
//   merchantTransactionId: string
//   paymentInstrumentType: string
//   status: string
// }

// export type ReconciliationMatch = {
//   status: 'MATCHED' | 'AMOUNT_MISMATCH' | 'MISSING_IN_PHONEPE' | 'MISSING_IN_INTERNAL'
//   internalRecord?: InternalFeePayment
//   phonePeRecord?: PhonePeTransaction
//   difference?: number
//   notes?: string
// }

// export type InternalFeePayment = {
//   id: string
//   receiptNumber: string
//   transactionId: string | null
//   amount: number
//   platformFee: number | null
//   netReceived: number | null
//   isReconciled: boolean
//   paymentDate: Date
//   paymentMethod: string
//   studentName: string
//   feeCategory: string
// }

// export type ReconciliationResult = {
//   summary: {
//     totalInternal: number
//     totalPhonePe: number
//     matched: number
//     amountMismatch: number
//     missingInPhonePe: number
//     missingInInternal: number
//     totalPlatformFee: number
//     totalPgFee: number
//     shikshaProfit: number
//   }
//   matches: ReconciliationMatch[]
// }

// /**
//  * Main reconciliation function
//  * Compares internal fee payments with PhonePe settlement data
//  */
// export async function autoReconcileFees(
//   organizationId: string,
//   month: Date,
//   phonePeTransactions: PhonePeTransaction[]
// ): Promise<ReconciliationResult> {
//   const from = startOfMonth(month)
//   const to = endOfMonth(month)

//   // 1. Fetch internal fee payments for the month
//   const internalPayments = await prisma.feePayment.findMany({
//     where: {
//       organizationId,
//       paymentDate: { gte: from, lte: to },
//       status: 'COMPLETED',
//     },
//     include: {
//       fee: {
//         include: {
//           feeCategory: true,
//           student: true,
//         },
//       },
//     },
//     orderBy: { paymentDate: 'asc' },
//   })

//   // 2. Transform internal payments for matching
//   const internalMap = new Map<string, InternalFeePayment>()
//   for (const payment of internalPayments) {
//     const key = payment.transactionId || payment.receiptNumber
//     internalMap.set(key, {
//       id: payment.id,
//       receiptNumber: payment.receiptNumber,
//       transactionId: payment.transactionId,
//       amount: payment.amount,
//       platformFee: payment.platformFee,
//       netReceived: payment.netReceived,
//       isReconciled: payment.isReconciled,
//       paymentDate: payment.paymentDate,
//       paymentMethod: payment.paymentMethod,
//       studentName: `${payment.fee.student.firstName} ${payment.fee.student.lastName}`,
//       feeCategory: payment.fee.feeCategory.name,
//     })
//   }

//   // 3. Create PhonePe transaction map (keyed by UTR/transactionId)
//   const phonePeMap = new Map<string, PhonePeTransaction>()
//   for (const txn of phonePeTransactions) {
//     const key = txn.utr || txn.transactionId
//     phonePeMap.set(key, txn)
//   }

//   const matches: ReconciliationMatch[] = []
//   let totalPlatformFee = 0
//   let totalPgFee = 0
//   const matchedPaymentIds: string[] = []

//   // 4. Match internal records with PhonePe
//   for (const [key, internal] of internalMap) {
//     const phonePe = phonePeMap.get(key)

//     if (!phonePe) {
//       // Internal record exists but not in PhonePe settlement
//       matches.push({
//         status: 'MISSING_IN_PHONEPE',
//         internalRecord: internal,
//         notes: 'Payment recorded internally but not found in PhonePe settlement',
//       })
//     } else {
//       // Both exist - check for amount mismatch
//       const difference = Math.abs(internal.amount - phonePe.transactionAmount)
//       const pgFeeAmount = phonePe.pgFee || 0
//       const netReceivedAmount = phonePe.settlementAmount || (phonePe.transactionAmount - pgFeeAmount)

//       if (difference > 1) { // Allow ₹1 tolerance
//         matches.push({
//           status: 'AMOUNT_MISMATCH',
//           internalRecord: internal,
//           phonePeRecord: phonePe,
//           difference,
//           notes: `Internal: ₹${internal.amount}, PhonePe: ₹${phonePe.transactionAmount}`,
//         })
//       } else {
//         // ✅ Perfect match - update database
//         matchedPaymentIds.push(internal.id)
//         matches.push({
//           status: 'MATCHED',
//           internalRecord: internal,
//           phonePeRecord: phonePe,
//         })
//         totalPgFee += pgFeeAmount
//       }

//       totalPlatformFee += internal.platformFee || 0
//       phonePeMap.delete(key) // Mark as processed
//     }
//   }

//   // 5. Find PhonePe transactions not in internal records
//   for (const [key, phonePe] of phonePeMap) {
//     matches.push({
//       status: 'MISSING_IN_INTERNAL',
//       phonePeRecord: phonePe,
//       notes: 'PhonePe settlement found but not recorded internally',
//     })
//   }

//   // 6. Calculate summary
//   const summary = {
//     totalInternal: internalMap.size,
//     totalPhonePe: phonePeTransactions.length,
//     matched: matches.filter(m => m.status === 'MATCHED').length,
//     amountMismatch: matches.filter(m => m.status === 'AMOUNT_MISMATCH').length,
//     missingInPhonePe: matches.filter(m => m.status === 'MISSING_IN_PHONEPE').length,
//     missingInInternal: matches.filter(m => m.status === 'MISSING_IN_INTERNAL').length,
//     totalPlatformFee,
//     totalPgFee,
//     shikshaProfit: totalPlatformFee - totalPgFee,
//   }

//   // 7. Auto-update matched payments with reconciliation data
//   if (matchedPaymentIds.length > 0) {
//     await updatePaymentsAfterReconciliation(matchedPaymentIds, phonePeMap)
//   }

//   return { summary, matches }
// }

// /**
//  * Get unreconciled payments (not yet matched with PhonePe)
//  * Useful for identifying pending settlements
//  */
// export async function getUnreconciledPayments(
//   organizationId: string,
//   fromDate: Date,
//   toDate: Date
// ): Promise<InternalFeePayment[]> {
//   const payments = await prisma.feePayment.findMany({
//     where: {
//       organizationId,
//       paymentDate: { gte: fromDate, lte: toDate },
//       status: 'COMPLETED',
//       isReconciled: false,
//     },
//     include: {
//       fee: {
//         include: {
//           feeCategory: true,
//           student: true,
//         },
//       },
//     },
//   })

//   return payments.map(p => ({
//     id: p.id,
//     receiptNumber: p.receiptNumber,
//     transactionId: p.transactionId,
//     amount: p.amount,
//     platformFee: p.platformFee,
//     pgFee: p.pgFee,
//     netReceived: p.netReceived,
//     isReconciled: p.isReconciled,
//     paymentDate: p.paymentDate,
//     paymentMethod: p.paymentMethod,
//     studentName: `${p.fee.student.firstName} ${p.fee.student.lastName}`,
//     feeCategory: p.fee.feeCategory.name,
//   }))
// }

// /**
//  * Update FeePayment records after successful reconciliation
//  * Sets pgFee, netReceived, isReconciled fields
//  */
// async function updatePaymentsAfterReconciliation(
//   paymentIds: string[],
//   phonePeMap: Map<string, PhonePeTransaction>
// ): Promise<void> {
//   // Update each payment with its corresponding PhonePe settlement data
//   const updates = paymentIds.map(async (id) => {
//     const payment = await prisma.feePayment.findUnique({
//       where: { id },
//       select: { transactionId: true, receiptNumber: true },
//     })

//     if (!payment) return

//     const key = payment.transactionId || payment.receiptNumber
//     const phonePe = phonePeMap.get(key)

//     if (!phonePe) return

//     const pgFee = phonePe.pgFee || 0
//     const netReceived = phonePe.settlementAmount || (phonePe.transactionAmount - pgFee)

//     await prisma.feePayment.update({
//       where: { id },
//       data: {
//         pgFee,
//         netReceived,
//         isReconciled: true,
//         reconciledAt: new Date(),
//         reconciliationNote: `Auto-reconciled with PhonePe UTR: ${phonePe.utr || 'N/A'}`,
//       },
//     })
//   })

//   await Promise.all(updates)
// }

// /**
//  * Parse PhonePe settlement CSV to structured data
//  * Expected CSV columns:
//  * - Transaction ID
//  * - UTR
//  * - Transaction Date
//  * - Transaction Amount
//  * - Settlement Amount
//  * - PG Fee
//  * - Merchant Transaction ID
//  * - Payment Instrument Type
//  * - Status
//  */
// export function parsePhonePeCSV(csvContent: string): PhonePeTransaction[] {
//   const lines = csvContent.trim().split('\n')
//   const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

//   const transactions: PhonePeTransaction[] = []

//   for (let i = 1; i < lines.length; i++) {
//     const values = parseCSVLine(lines[i])
//     if (values.length !== headers.length) continue

//     const row: Record<string, string> = {}
//     headers.forEach((header, idx) => {
//       row[header] = values[idx]
//     })

//     transactions.push({
//       transactionId: row['transaction id'] || row['transactionid'],
//       utr: row['utr'] || row['utr no'],
//       transactionDate: row['transaction date'] || row['date'],
//       transactionAmount: parseFloat(row['transaction amount'] || row['amount'] || '0'),
//       settlementAmount: parseFloat(row['settlement amount'] || '0'),
//       pgFee: parseFloat(row['pg fee'] || row['gateway fee'] || '0'),
//       merchantTransactionId: row['merchant transaction id'] || row['merchantid'],
//       paymentInstrumentType: row['payment instrument type'] || row['type'],
//       status: row['status'] || 'SUCCESS',
//     })
//   }

//   return transactions
// }

// /**
//  * Parse a single CSV line (handles quoted values with commas)
//  */
// function parseCSVLine(line: string): string[] {
//   const result: string[] = []
//   let current = ''
//   let inQuotes = false

//   for (let i = 0; i < line.length; i++) {
//     const char = line[i]

//     if (char === '"') {
//       inQuotes = !inQuotes
//     } else if (char === ',' && !inQuotes) {
//       result.push(current.trim())
//       current = ''
//     } else {
//       current += char
//     }
//   }

//   result.push(current.trim())
//   return result
// }

// /**
//  * Mark payments as reconciled after successful matching
//  * Call this after autoReconcileFees to update database
//  */
// export async function markPaymentsAsReconciled(
//   paymentIds: string[],
//   reconciledBy: string
// ): Promise<void> {
//   // TODO: Add 'reconciledAt' and 'reconciledBy' fields to FeePayment model
//   // await prisma.feePayment.updateMany({
//   //   where: { id: { in: paymentIds } },
//   //   data: {
//   //     reconciledAt: new Date(),
//   //     reconciledBy,
//   //   },
//   // })
//   console.log(`Marked ${paymentIds.length} payments as reconciled by ${reconciledBy}`)
// }

// /**
//  * Generate reconciliation report data for UI display
//  */
// export function generateReconciliationReportData(
//   matches: ReconciliationMatch[]
// ): {
//   matched: ReconciliationMatch[]
//   mismatches: ReconciliationMatch[]
//   missingInPhonePe: ReconciliationMatch[]
//   missingInInternal: ReconciliationMatch[]
// } {
//   return {
//     matched: matches.filter(m => m.status === 'MATCHED'),
//     mismatches: matches.filter(m => m.status === 'AMOUNT_MISMATCH'),
//     missingInPhonePe: matches.filter(m => m.status === 'MISSING_IN_PHONEPE'),
//     missingInInternal: matches.filter(m => m.status === 'MISSING_IN_INTERNAL'),
//   }
// }
