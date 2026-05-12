'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { revalidatePath } from 'next/cache';
import {
  calculateGradeLabel,
  calculateCGPA,
  determineResultStatus,
} from './grade-utils';

/**
 * Get exam session details with all exams
 */
export async function getExamSessionForReportCards(sessionId: string) {
  const organizationId = await getOrganizationId();

  try {
    const session = await prisma.examSession.findFirst({
      where: {
        id: sessionId,
        organizationId,
      },
      include: {
        exams: {
          include: {
            subject: true,
            grade: true,
            section: true,
            examResult: {
              select: {
                id: true,
                studentId: true,
                obtainedMarks: true,
                isPassed: true,
                isAbsent: true,
              },
            },
          },
        },
        academicYear: true,
      },
    });

    if (!session) {
      return { success: false, error: 'Exam session not found' };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error('Failed to fetch exam session:', error);
    return { success: false, error: 'Failed to fetch exam session' };
  }
}

/**
 * Get grades from exams in a session
 */
export async function getGradesInSession(sessionId: string) {
  const organizationId = await getOrganizationId();

  try {
    // Fetch grades that have at least one exam in this session
    const grades = await prisma.grade.findMany({
      where: {
        organizationId,
        exams: {
          some: {
            examSessionId: sessionId,
          },
        },
      },
      select: {
        id: true,
        grade: true,
      },
      orderBy: {
        grade: 'asc',
      },
    });

    return { success: true, data: grades };
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    return { success: false, error: 'Failed to fetch grades' };
  }
}

/**
 * Get sections for a specific grade
 */
export async function getSectionsInSessionGrade(sessionId: string, gradeId: string) {
  const organizationId = await getOrganizationId();

  try {
    // Fetch all sections belonging to the selected grade
    const sections = await prisma.section.findMany({
      where: {
        gradeId,
        organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, data: sections };
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return { success: false, error: 'Failed to fetch sections' };
  }
}

/**
 * Get students count for filters.
 * Returns the total enrollment in the selected grade/section.
 */
export async function getStudentsCountForReportCards(
  sessionId: string,
  gradeId: string,
  sectionId?: string
) {
  const organizationId = await getOrganizationId();

  try {
    const count = await prisma.student.count({
      where: {
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error('Failed to count students:', error);
    return { success: false, error: 'Failed to count students' };
  }
}

// Grade calculation utilities are imported from ./grade-utils.ts

/**
 * Preview calculation for one student
 */
export async function previewReportCardCalculation(
  sessionId: string,
  gradeId: string,
  sectionId?: string
) {
  const organizationId = await getOrganizationId();

  try {
    // Get the default grading scale for the organization
    const defaultScale = await prisma.gradingScale.findFirst({
      where: { organizationId, isDefault: true },
      include: { bands: true }
    });

    const scaleToUse = defaultScale || (undefined as any); // Fallback to utility default if not found
    // Get one student from the filters
    const student = await prisma.student.findFirst({
      where: {
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
      },
    });

    if (!student) {
      return { success: false, error: 'No students found with selected filters' };
    }

    // Get all exams in this session for this grade/section
    const exams = await prisma.exam.findMany({
      where: {
        examSessionId: sessionId,
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
      },
      select: {
        id: true,
        title: true,
        maxMarks: true,
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    // Get exam results for this student
    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        examId: {
          in: exams.map((e) => e.id),
        },
      },
      select: {
        examId: true,
        obtainedMarks: true,
        isPassed: true,
        isAbsent: true,
      },
    });

    // Create a map for easy lookup
    const resultsMap = new Map(examResults.map((r) => [r.examId, r]));

    // Calculate totals
    const totalMaxMarks = exams.reduce((sum, exam) => sum + exam.maxMarks, 0);
    const totalObtained = examResults.reduce(
      (sum, result) => sum + (result.obtainedMarks || 0),
      0
    );
    const percentage = (totalObtained / totalMaxMarks) * 100;
    const cgpa = calculateCGPA(percentage);
    const overallGrade = calculateGradeLabel(percentage, scaleToUse);
    const allPassed = examResults.every((r) => r.isPassed === true);
    const resultStatus = determineResultStatus(examResults, allPassed);

    // Build preview data
    const preview = {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
      },
      exams: exams.map((exam) => {
        const result = resultsMap.get(exam.id);
        return {
          subject: exam.subject.name,
          code: exam.subject.code,
          maxMarks: exam.maxMarks,
          obtainedMarks: result?.obtainedMarks || null,
          isAbsent: result?.isAbsent || false,
          isPassed: result?.isPassed || null,
        };
      }),
      calculation: {
        totalMaxMarks,
        totalObtained,
        percentage: Number(percentage.toFixed(2)),
        cgpa,
        overallGrade,
        resultStatus,
      },
    };

    return { success: true, data: preview };
  } catch (error) {
    console.error('Failed to preview calculation:', error);
    return { success: false, error: 'Failed to preview calculation' };
  }
}

/**
 * Generate report cards for selected students
 */
export async function generateReportCards(
  sessionId: string,
  gradeId: string,
  sectionId?: string
) {
  const organizationId = await getOrganizationId();

  try {
    // Get the default grading scale for the organization
    const defaultScale = await prisma.gradingScale.findFirst({
      where: { organizationId, isDefault: true },
      include: { bands: true }
    });

    const scaleToUse = defaultScale || (undefined as any);

    // Get the academic year ID from the exam session
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      select: { academicYearId: true }
    });

    if (!session) {
      return { success: false, error: 'Exam session not found' };
    }

    const academicYearId = session.academicYearId;

    // First, validate that all exams in this session have results published
    const unpublishedExams = await prisma.exam.findMany({
      where: {
        examSessionId: sessionId,
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
        isResultsPublished: false,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (unpublishedExams.length > 0) {
      return {
        success: false,
        error: 'Cannot generate report cards. Some exams have unpublished results.',
        unpublishedExams: unpublishedExams.map((e) => e.title),
      };
    }

    // Get all students matching filters
    const students = await prisma.student.findMany({
      where: {
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        sectionId: true,
      },
    });

    if (students.length === 0) {
      return { success: false, error: 'No students found with selected filters' };
    }

    // Get all exams in this session for this grade/section
    const exams = await prisma.exam.findMany({
      where: {
        examSessionId: sessionId,
        organizationId,
        gradeId,
        ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
      },
      select: {
        id: true,
        maxMarks: true,
      },
    });

    const examIds = exams.map((e) => e.id);

    // Get all exam results for these students
    const allExamResults = await prisma.examResult.findMany({
      where: {
        studentId: {
          in: students.map((s) => s.id),
        },
        examId: {
          in: examIds,
        },
      },
      select: {
        studentId: true,
        examId: true,
        obtainedMarks: true,
        isPassed: true,
        isAbsent: true,
      },
    });

    // Group results by student
    const resultsByStudent = new Map<string, typeof allExamResults>();
    allExamResults.forEach((result) => {
      const existing = resultsByStudent.get(result.studentId) || [];
      existing.push(result);
      resultsByStudent.set(result.studentId, existing);
    });

    // Calculate report cards for each student
    const reportCardsData: Array<{
      studentId: string;
      totalObtained: number;
      percentage: number;
      sectionId: string;
    }> = [];

    const generationResults = {
      success: 0,
      failed: 0,
      errors: [] as Array<{
        studentName: string;
        studentId: string;
        reason: string;
        details?: any;
      }>,
    };

    for (const student of students) {
      try {
        const studentResults = resultsByStudent.get(student.id) || [];

        // Validate that student has results for all exams
        if (studentResults.length !== exams.length) {
          const missingExamIds = examIds.filter(id => !studentResults.some(r => r.examId === id));
          const missingDetails = await prisma.exam.findMany({
            where: { id: { in: missingExamIds } },
            select: { title: true, subject: { select: { name: true } } }
          });

          generationResults.failed++;
          generationResults.errors.push({
            studentName: `${student.firstName} ${student.lastName}`,
            studentId: student.id,
            reason: 'Missing results',
            details: missingDetails.map((d) => `${d.subject.name} (${d.title})`),
          });
          continue;
        }

        // Check for null marks
        const hasNullMarks = studentResults.some((r) => r.obtainedMarks === null);
        if (hasNullMarks) {
          generationResults.failed++;
          generationResults.errors.push({
            studentName: `${student.firstName} ${student.lastName}`,
            studentId: student.id,
            reason: 'Null marks detected',
            details: 'Some exam results have null marks',
          });
          continue;
        }

        // Calculate totals
        const totalMaxMarks = exams.reduce((sum, exam) => sum + exam.maxMarks, 0);
        const totalObtained = studentResults.reduce(
          (sum, result) => sum + (result.obtainedMarks || 0),
          0
        );
        const percentage = (totalObtained / totalMaxMarks) * 100;
        const cgpa = calculateCGPA(percentage);
        const overallGrade = calculateGradeLabel(percentage, scaleToUse);
        const allPassed = studentResults.every((r) => r.isPassed === true);
        const resultStatus = determineResultStatus(studentResults, allPassed);

        reportCardsData.push({
          studentId: student.id,
          totalObtained,
          percentage,
          sectionId: student.sectionId,
        });

        // Create or update report card
        await prisma.reportCard.upsert({
          where: {
            studentId_examSessionId: {
              studentId: student.id,
              examSessionId: sessionId,
            },
          },
          create: {
            studentId: student.id,
            examSessionId: sessionId,
            academicYearId,
            organizationId,
            totalMaxMarks,
            totalObtained,
            percentage: Number(percentage.toFixed(2)),
            cgpa,
            overallGrade,
            resultStatus,
            pdfUrl: '', // Placeholder for PDF generation
          },
          update: {
            totalMaxMarks,
            totalObtained,
            percentage: Number(percentage.toFixed(2)),
            cgpa,
            overallGrade,
            resultStatus,
            academicYearId, // Ensure it's set if missing
            organizationId, // Ensure it's set if missing
          },
        });

        generationResults.success++;
      } catch (error) {
        console.error(`Failed to generate report card for student ${student.id}:`, error);
        generationResults.failed++;
        generationResults.errors.push({
          studentName: `${student.firstName} ${student.lastName}`,
          studentId: student.id,
          reason: 'Internal processing error',
        });
      }
    }

    // After generating/updating, we MUST recalculate ranks for ALL students in this grade and session
    // to ensure ranks are accurate regardless of filters used during generation.
    const allReportCardsForGrade = await prisma.reportCard.findMany({
      where: {
        examSessionId: sessionId,
        organizationId,
        student: {
          gradeId,
        }
      },
      select: {
        studentId: true,
        totalObtained: true,
        student: {
          select: {
            sectionId: true
          }
        }
      }
    });

    // 1. Recalculate Grade Rank (across all sections)
    const sortedByGradeObtained = [...allReportCardsForGrade].sort(
      (a, b) => b.totalObtained - a.totalObtained
    );

    for (let i = 0; i < sortedByGradeObtained.length; i++) {
      await prisma.reportCard.update({
        where: {
          studentId_examSessionId: {
            studentId: sortedByGradeObtained[i].studentId,
            examSessionId: sessionId,
          },
        },
        data: {
          gradeRank: i + 1,
        },
      });
    }

    // 2. Recalculate Class Rank (per section)
    const sectionIds = new Set(allReportCardsForGrade.map(rc => rc.student.sectionId));
    for (const sId of sectionIds) {
      if (!sId) continue;

      const cardsInSection = allReportCardsForGrade.filter(rc => rc.student.sectionId === sId);
      const sortedBySectionObtained = [...cardsInSection].sort(
        (a, b) => b.totalObtained - a.totalObtained
      );

      for (let i = 0; i < sortedBySectionObtained.length; i++) {
        await prisma.reportCard.update({
          where: {
            studentId_examSessionId: {
              studentId: sortedBySectionObtained[i].studentId,
              examSessionId: sessionId,
            },
          },
          data: {
            classRank: i + 1,
          },
        });
      }
    }

    revalidatePath(`/dashboard/exam-sessions/${sessionId}/reports`);

    return {
      success: true,
      data: {
        totalProcessed: students.length,
        successCount: generationResults.success,
        failedCount: generationResults.failed,
        errors: generationResults.errors,
      },
    };
  } catch (error) {
    console.error('Failed to generate report cards:', error);
    return { success: false, error: 'Failed to generate report cards' };
  }
}

/**
 * Get generated report cards for a session
 */
export async function getGeneratedReportCards(
  sessionId: string,
  gradeId?: string,
  sectionId?: string
) {
  const organizationId = await getOrganizationId();

  try {
    const reportCards = await prisma.reportCard.findMany({
      where: {
        examSessionId: sessionId,
        organizationId,
        student: {
          ...(gradeId ? { gradeId } : {}),
          ...(sectionId && sectionId !== 'all' ? { sectionId } : {}),
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            grade: {
              select: {
                grade: true,
              },
            },
            section: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        gradeRank: 'asc',
      },
    });

    return { success: true, data: reportCards };
  } catch (error) {
    console.error('Failed to fetch report cards:', error);
    return { success: false, error: 'Failed to fetch report cards' };
  }
}

/**
 * Delete a report card
 */
export async function deleteReportCard(reportCardId: string, sessionId: string) {
  const organizationId = await getOrganizationId();
  try {
    await prisma.reportCard.delete({
      where: {
        id: reportCardId,
        organizationId,
      },
    });

    revalidatePath(`/dashboard/exam-sessions/${sessionId}/reports`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete report card:', error);
    return { success: false, error: 'Failed to delete report card' };
  }
}
