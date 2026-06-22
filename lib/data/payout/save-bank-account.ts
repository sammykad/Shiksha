'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { Role } from '@/generated/prisma/enums';

export async function saveBankAccount(data: {
  teacherId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  upiId?: string;
  panNumber?: string;
}) {
  const { orgRole, orgId } = await auth();
  if (orgRole !== Role.ADMIN) {
    return { success: false, error: 'Only admins can manage bank accounts.' };
  }

  const teacher = await prisma.teacher.findFirst({
    where: { id: data.teacherId, organizationId: orgId },
    select: { id: true },
  });
  if (!teacher) {
    return { success: false, error: 'Teacher not found.' };
  }

  await prisma.teacherBankAccount.upsert({
    where: { teacherId: data.teacherId },
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
      teacherId: data.teacherId,
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

  revalidatePath('/dashboard/teachers');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function deleteBankAccount(accountId: string) {
  const { orgRole } = await auth();
  if (orgRole !== Role.ADMIN) {
    return { success: false, error: 'Only admins can delete bank accounts.' };
  }

  await prisma.teacherBankAccount.delete({ where: { id: accountId } });
  revalidatePath('/dashboard/teachers');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function getTeacherBankAccounts(teacherId: string) {
  const { orgId } = await auth();
  return prisma.teacherBankAccount.findMany({
    where: { teacherId, organizationId: orgId, isActive: true },
  });
}
