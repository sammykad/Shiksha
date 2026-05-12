// lib/data/reports/get-reconciliation-data.ts

'use server'

import { startOfMonth, endOfMonth } from 'date-fns'
import { PaymentMethod } from '@/generated/prisma/enums'
import prisma from '@/lib/db'
// types/reports.ts — ADD these

export type ReconciliationFilters = {
    month: Date                        // which month to report
    paymentMethod?: PaymentMethod | 'ALL'
    organizationId: string
    academicYearId: string
}

export type ReconciliationRow = {
    paymentDate: Date
    studentName: string
    rollNumber: string
    grade: string
    section: string
    category: string
    receiptNumber: string
    transactionId: string | null
    paymentMethod: string
    amount: number                     // school fee
    parentPaid: number                 // amount + platformFee
    platformFee: number                // Shiksha 2.5%
    pgFee: number                      // PhonePe cut (0 until CSV import)
    netReceived: number                // parentPaid - pgFee
    status: string
}

export type ReconciliationSummary = {
    txnCount: number
    totalAmount: number
    totalParentPaid: number
    totalPlatformFee: number
    totalPgFee: number
    totalNetReceived: number
    shikshaProfit: number
    byMethod: {
        method: string
        count: number
        totalAmount: number
        totalParentPaid: number
        totalPlatformFee: number
        totalPgFee: number
        totalNetReceived: number
    }[]
}
export async function getReconciliationData(filters: ReconciliationFilters): Promise<{
    rows: ReconciliationRow[]
    summary: ReconciliationSummary
}> {
    const from = startOfMonth(filters.month)
    const to = endOfMonth(filters.month)

    const payments = await prisma.feePayment.findMany({
        where: {
            organizationId: filters.organizationId,
            paymentDate: { gte: from, lte: to },
            status: 'COMPLETED',
            ...(filters.paymentMethod && filters.paymentMethod !== 'ALL'
                ? { paymentMethod: filters.paymentMethod }
                : {}),
        },
        include: {
            fee: {
                include: {
                    feeCategory: true,
                    student: {
                        include: {
                            grade: true,
                            section: true,
                        },
                    },
                },
            },
        },
        orderBy: { paymentDate: 'asc' },
    })

    const rows: ReconciliationRow[] = payments.map((p) => ({
        paymentDate: p.paymentDate,
        studentName: `${p.fee.student.firstName} ${p.fee.student.lastName}`,
        rollNumber: p.fee.student.rollNumber ?? '-',
        grade: p.fee.student.grade?.grade ?? '-',
        section: p.fee.student.section?.name ?? '-',
        category: p.fee.feeCategory.name,
        receiptNumber: p.receiptNumber,
        transactionId: p.transactionId,
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        parentPaid: p.amount,
        platformFee: p.platformFee ?? 0,
        pgFee: 0,
        netReceived: p.amount - (p.platformFee ?? 0),
        status: p.status,
    }))

    // ── Summary ────────────────────────────────────────────────────────────────
    const summary: ReconciliationSummary = {
        txnCount: rows.length,
        totalAmount: sum(rows, 'amount'),
        totalParentPaid: sum(rows, 'parentPaid'),
        totalPlatformFee: sum(rows, 'platformFee'),
        totalPgFee: sum(rows, 'pgFee'),
        totalNetReceived: sum(rows, 'netReceived'),
        shikshaProfit: sum(rows, 'platformFee') - sum(rows, 'pgFee'),
        byMethod: groupByMethod(rows),
    }

    return { rows, summary }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sum(rows: ReconciliationRow[], key: keyof ReconciliationRow): number {
    return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
}

function groupByMethod(rows: ReconciliationRow[]) {
    const map = new Map<string, ReconciliationRow[]>()
    for (const r of rows) {
        const group = map.get(r.paymentMethod) ?? []
        group.push(r)
        map.set(r.paymentMethod, group)
    }
    return Array.from(map.entries()).map(([method, group]) => ({
        method,
        count: group.length,
        totalAmount: sum(group, 'amount'),
        totalParentPaid: sum(group, 'parentPaid'),
        totalPlatformFee: sum(group, 'platformFee'),
        totalPgFee: sum(group, 'pgFee'),
        totalNetReceived: sum(group, 'netReceived'),
    }))
}