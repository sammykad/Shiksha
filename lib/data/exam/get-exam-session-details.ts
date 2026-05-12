'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

/**
 * Get complete exam session details with all exams and statistics
 */
export async function getExamSessionDetails(sessionId: string) {
  const organizationId = await getOrganizationId();

  try {
    const session = await prisma.examSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        exams: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            grade: {
              select: {
                id: true,
                grade: true,
              },
            },
            section: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                examEnrollment: true,
                examResult: true,
              },
            },
          },
          orderBy: [
            { grade: { grade: 'asc' } },
            { section: { name: 'asc' } },
            { subject: { name: 'asc' } },
          ],
        },
      },
    });

    if (!session) {
      return { success: false as const, error: 'Exam session not found' };
    }

    // Calculate session-level statistics
    const totalExams = session.exams.length;
    const totalEnrollments = session.exams.reduce((sum, exam) => sum + exam._count.examEnrollment, 0);
    const totalResults = session.exams.reduce((sum, exam) => sum + exam._count.examResult, 0);
    const publishedExams = session.exams.filter((e) => e.isResultsPublished).length;
    const pendingExams = totalExams - publishedExams;

    return {
      success: true as const,
      data: {
        ...session,
        stats: {
          totalExams,
          totalEnrollments,
          totalResults,
          publishedExams,
          pendingExams,
          allPublished: totalExams > 0 && publishedExams === totalExams,
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch exam session details:', error);
    return { success: false as const, error: 'Failed to fetch exam session details' };
  }
}
