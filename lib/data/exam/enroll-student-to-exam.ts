'use server';

import { getCurrentUserByRole, getOrganizationId } from '@/lib/auth';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function enrollStudentToExam(examId: string) {
  const currentUser = await getCurrentUserByRole();

  if (!currentUser || currentUser.role !== "STUDENT" || !currentUser.studentId) {
    throw new Error("Unauthorized: Student account not found");
  }

  const studentId = currentUser.studentId;

  // 2) Check exam exists and belongs to current organization
  const organizationId = await getOrganizationId();
  const exam = await prisma.exam.findFirst({
    where: { id: examId, organizationId },
  });

  if (!exam) {
    return { error: 'Exam does not exist.' };
  }

  if (exam.status !== 'UPCOMING') {
    return { error: `Exam is already ${exam.status}` };
  }

  // 3) Check enrollment exists
  const existingEnrollment = await prisma.examEnrollment.findUnique({
    where: { studentId_examId: { studentId, examId } },
  });
  if (existingEnrollment) {
    return { success: false, error: "Already enrolled in this exam." };
  }

  // 4) Create enrollment
  await prisma.examEnrollment.create({
    data: {
      studentId,
      examId,
      status: 'ENROLLED',
    },
  });

  revalidatePath(`/dashboard/exams/${examId}`);

  return {
    success: true,
    message: "Successfully enrolled in exam"
  };

}
