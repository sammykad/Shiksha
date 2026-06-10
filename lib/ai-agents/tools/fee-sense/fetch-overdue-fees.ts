import prisma from '@/lib/db'
import { getFeeBalance } from '@/lib/data/fee/fee-balance'
import { calculateDaysOverdue } from './helpers'
import type { StudentFeeData } from './execute-workflow'

const PAGE_SIZE = 50

export type FeePageResult = {
  students: StudentFeeData[]
  totalOverdue: number
  pageCount: number
  hasMore: boolean
}

/** Fetch one page of overdue fees with batch-loaded notification history. */
export async function fetchOverdueFeesPage(
  organizationId: string,
  academicYearId: string,
  page: number,
): Promise<FeePageResult> {
  const skip = page * PAGE_SIZE

  const [fees, totalFeeCount] = await Promise.all([
    prisma.fee.findMany({
      where: { organizationId, academicYearId },
      skip,
      take: PAGE_SIZE,
      orderBy: { dueDate: 'asc' },
      include: {
        student: {
          include: {
            parents: {
              where: { isPrimary: true },
              include: { parent: true },
              take: 1,
            },
          },
        },
        feeCategory: { select: { name: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    }),
    prisma.fee.count({ where: { organizationId, academicYearId } }),
  ])

  if (fees.length === 0) {
    return { students: [], totalOverdue: 0, pageCount: 0, hasMore: false }
  }

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  // Batch-fetch notifications for ALL students in this page (one query, not N+1)
  const studentIds = fees.map(f => f.studentId)
  const allNotifications = await prisma.notificationLog.findMany({
    where: {
      organizationId,
      notification: { studentId: { in: studentIds } },
      notificationType: 'FEE',
      sentAt: { gte: sixtyDaysAgo },
    },
    orderBy: { sentAt: 'desc' },
    include: { notification: true },
  })
  const notifMap = new Map<string, typeof allNotifications>()
  for (const n of allNotifications) {
    const sid = n.notification.studentId as string
    if (!notifMap.has(sid)) notifMap.set(sid, [])
    notifMap.get(sid)!.push(n)
  }

  const students: StudentFeeData[] = []
  let totalOverdue = 0

  for (const fee of fees) {
    const balance = getFeeBalance(fee)
    if (balance.dueAmount <= 0) continue

    const primaryParent = fee.student.parents[0]?.parent
    const notifs = notifMap.get(fee.studentId) ?? []

    const lastSent = notifs.find(n => n.status === 'SENT' || n.status === 'DELIVERED')
    const hoursSinceLastNotification = lastSent
      ? Math.round((Date.now() - lastSent.sentAt.getTime()) / (1000 * 60 * 60))
      : Infinity

    students.push({
      studentId: fee.student.id,
      studentName: `${fee.student.firstName} ${fee.student.lastName}`,
      studentEmail: fee.student.email ?? '',
      parentId: primaryParent?.userId ?? fee.student.userId,
      parentPhone: primaryParent?.phoneNumber ?? '',
      parentEmail: primaryParent?.email ?? '',
      feeId: fee.id,
      feeCategoryName: fee.feeCategory.name,
      pendingAmount: balance.dueAmount,
      totalFee: balance.totalAmount,
      daysOverdue: calculateDaysOverdue(fee.dueDate),
      dueDate: fee.dueDate.toISOString(),
      hoursSinceLastNotification,
      paymentHistory: fee.payments.map(p => ({
        id: p.id, amount: p.amount,
        paymentDate: p.paymentDate.toISOString(),
        status: p.status, method: p.paymentMethod,
      })),
      notificationHistory: notifs.map(n => ({
        id: n.id, channel: n.channel, status: n.status,
        sentAt: n.sentAt.toISOString(), type: n.notificationType,
      })),
    })
    totalOverdue += balance.dueAmount
  }

  const totalPages = Math.ceil(totalFeeCount / PAGE_SIZE)

  return {
    students,
    totalOverdue,
    pageCount: page + 1,
    hasMore: page + 1 < totalPages,
  }
}
