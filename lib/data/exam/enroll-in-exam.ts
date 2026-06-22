'use server';

import { getCurrentUserByRole, getOrganizationId } from '@/lib/auth';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

function resolveStudentId(
  user: Awaited<ReturnType<typeof getCurrentUserByRole>>,
  childId?: string,
): string {
  if (user.role === 'STUDENT') {
    if (!user.studentId) throw new Error("Unauthorized");
    return user.studentId;
  }
  if (user.role === 'PARENT') {
    if (!childId || !user.studentIds?.includes(childId)) throw new Error("Unauthorized");
    return childId;
  }
  throw new Error("Unauthorized");
}

export async function enrollInExam(examId: string, childId?: string) {
  const currentUser = await getCurrentUserByRole();
  const organizationId = await getOrganizationId();
  const studentId = resolveStudentId(currentUser, childId);

  const exam = await prisma.exam.findFirst({
    where: { id: examId, organizationId },
  });

  if (!exam) return { error: 'Exam does not exist.' };
  if (exam.status !== 'UPCOMING') return { error: `Exam is already ${exam.status}` };

  const existing = await prisma.examEnrollment.findUnique({
    where: { studentId_examId: { studentId, examId } },
  });
  if (existing) return { success: false, error: "Already enrolled in this exam." };

  await prisma.examEnrollment.create({
    data: { studentId, examId, status: 'ENROLLED', enrolledBy: currentUser.userId },
  });

  revalidatePath(`/dashboard/exams/${examId}`);
  revalidatePath(`/dashboard/exams/${examId}/hall-ticket`);

  return { success: true, message: "Successfully enrolled in exam" };
}
