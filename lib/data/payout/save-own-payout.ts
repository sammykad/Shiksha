'use server';

import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function updateTeacherPayoutAction(data: {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string | null;
  upiId?: string | null;
  panNumber?: string | null;
}) {
  try {
    const { orgId, userId } = await auth();

    const teacher = await prisma.teacher.findFirst({
      where: { userId, organizationId: orgId },
      select: { id: true },
    });
    if (!teacher) {
      return { success: false, error: "Teacher profile not found." };
    }

    await prisma.teacherBankAccount.upsert({
      where: { teacherId: teacher.id },
      update: {
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        branchName: data.branchName ?? null,
        upiId: data.upiId ?? null,
        panNumber: data.panNumber ?? null,
      },
      create: {
        teacherId: teacher.id,
        organizationId: orgId,
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        branchName: data.branchName ?? null,
        upiId: data.upiId ?? null,
        panNumber: data.panNumber ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[updateTeacherPayoutAction] Error:", error);
    return { success: false, error: "Failed to save payout information." };
  }
}
