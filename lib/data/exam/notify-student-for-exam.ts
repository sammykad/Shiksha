'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { notify } from '@/lib/notifications/notify';

/**
 * Sends enrollment reminder notifications to students for a specific exam.
 * Batch-processed for efficiency and uses the internal notification engine.
 */
export async function notifyStudentsForExamEnrollment(
  studentIds: string[],
  examId: string
) {
  try {
    // 1. Fetch exam details with necessary metadata for the notification engine
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { 
        examSession: { select: { academicYearId: true } } 
      },
    });

    if (!exam) {
      return { success: false, error: 'Exam not found.' };
    }

    // 2. Filter out students who are already enrolled in this exam
    const existingEnrollments = await prisma.examEnrollment.findMany({
      where: {
        examId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const enrolledIds = new Set(existingEnrollments.map((e) => e.studentId));
    const studentsToNotify = studentIds.filter((id) => !enrolledIds.has(id));

    if (studentsToNotify.length === 0) {
      return {
        success: true,
        notifiedCount: 0,
        totalRequested: studentIds.length,
        message: 'All students are already enrolled or no recipients provided.',
      };
    }

    // 3. Prepare notification variables
    const enrollmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/exams/${examId}/enroll`;

    // 4. Send batch notification via internal engine
    // The engine handles recipient resolution (students + parents) and channel logic.
    const result = await notify.exam.enrollment({
      examId,
      organizationId: exam.organizationId,
      academicYearId: exam.examSession.academicYearId,
      recipients: studentsToNotify.map((id) => ({ studentId: id })),
      variables: {
        examName: exam.title,
        date: exam.startDate,
        examUrl: enrollmentUrl,
      },
    });

    revalidatePath(`/dashboard/exams/${examId}`);
    revalidatePath(`/dashboard/admin/exams/${examId}`);

    return {
      ...result,
      notifiedCount: studentsToNotify.length,
      totalRequested: studentIds.length,
    };
  } catch (error) {
    console.error('Error sending exam enrollment notifications:', error);
    return {
      success: false,
      error: 'Failed to send notifications. Please try again.',
    };
  }
}

/**
 * Sends a reminder to students who haven't enrolled yet (deadline approaching).
 */
export async function sendExamEnrollmentDeadlineReminder(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { gradeId: true, sectionId: true },
    });

    if (!exam || !exam.gradeId || !exam.sectionId) {
      return { success: false, error: 'Exam not found or missing target scope.' };
    }

    // Get all students in the targeted grade and section
    const students = await prisma.student.findMany({
      where: {
        gradeId: exam.gradeId,
        sectionId: exam.sectionId,
      },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);
    return await notifyStudentsForExamEnrollment(studentIds, examId);
  } catch (error) {
    console.error('Error sending deadline reminder:', error);
    return { success: false, error: 'Failed to send deadline reminder' };
  }
}

/**
 * Sends hall ticket availability notification to enrolled students.
 */
export async function notifyStudentsHallTicketIssued(
  studentIds: string[],
  examId: string
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { 
        examSession: { select: { academicYearId: true } } 
      },
    });

    if (!exam) {
      return { success: false, error: 'Exam not found.' };
    }

    const hallTicketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/exams/${examId}/hall-ticket`;

    // Send batch notification
    const result = await notify.exam.hallTicket({
      examId,
      organizationId: exam.organizationId,
      academicYearId: exam.examSession.academicYearId,
      recipients: studentIds.map((id) => ({ studentId: id })),
      variables: {
        examName: exam.title,
        date: exam.startDate,
        hallTicketUrl,
      },
    });

    revalidatePath(`/dashboard/exams/${examId}`);

    return {
      ...result,
      notifiedCount: studentIds.length,
    };
  } catch (error) {
    console.error('Error notifying hall ticket issued:', error);
    return { success: false, error: 'Failed to send hall ticket notifications' };
  }
}
