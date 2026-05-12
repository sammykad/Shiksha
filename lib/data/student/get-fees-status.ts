import prisma from '@/lib/db';
import { FeeStatus } from '@/generated/prisma/enums';

export async function getFeesStatus(studentId: string) {
    try {
        const fees = await prisma.fee.findMany({
            where: { studentId },
            include: {
                payments: {
                    where: { status: 'COMPLETED' },
                    orderBy: { paymentDate: 'desc' },
                    take: 5,
                },
            },
        });

        let totalAnnualFee = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        let overdueFees = 0;
        let nextDueDate: Date | null = null;

        const allRecentPayments: any[] = [];

        for (const fee of fees) {
            totalAnnualFee += fee.totalFee;
            paidAmount += fee.paidAmount;
            pendingAmount += fee.pendingAmount || 0;

            if (fee.status === 'OVERDUE') {
                overdueFees++;
            }

            if (
                (fee.status === 'UNPAID' || fee.status === 'OVERDUE') &&
                (!nextDueDate || fee.dueDate < nextDueDate)
            ) {
                nextDueDate = fee.dueDate;
            }

            allRecentPayments.push(...fee.payments.map(p => ({
                id: p.id,
                amount: p.amount,
                paymentDate: p.paymentDate,
                method: p.paymentMethod,
                status: 'COMPLETED',
                receiptNumber: p.receiptNumber,
            })));
        }

        const recentPayments = allRecentPayments
            .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
            .slice(0, 3);

        const status: FeeStatus =
            pendingAmount === 0
                ? FeeStatus.PAID
                : paidAmount === 0
                    ? FeeStatus.UNPAID
                    : FeeStatus.OVERDUE;

        const paymentProgress = totalAnnualFee > 0 ? (paidAmount / totalAnnualFee) * 100 : 0;

        return {
            totalAnnualFee,
            paidAmount,
            pendingAmount,
            nextDueDate,
            status,
            recentPayments,
            overdueFees,
            paymentProgress,
        };
    } catch (error) {
        console.error('Error fetching fees status:', error);
        throw new Error('Failed to fetch fees data');
    }
}
