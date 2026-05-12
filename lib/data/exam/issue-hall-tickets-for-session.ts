'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { revalidatePath } from 'next/cache';
import { issueHallTicketsForExam } from './issue-hall-tickets-for-exam';

/**
 * Issues hall tickets for ALL exams in a given session.
 * For each exam, fetches enrolled students and delegates to `issueHallTicketsForExam`.
 *
 * Returns an aggregate result.
 */
export async function issueHallTicketsForSession(sessionId: string) {
    const organizationId = await getOrganizationId();

    try {
        // Get all exams in this session
        const exams = await prisma.exam.findMany({
            where: {
                examSessionId: sessionId,
                organizationId,
            },
            select: {
                id: true,
                title: true,
            },
        });

        if (exams.length === 0) {
            return { success: false, error: 'No exams found in this session.' };
        }

        const results: Array<{
            examId: string;
            examTitle: string;
            issued: number;
            error?: string;
        }> = [];

        let totalIssued = 0;

        for (const exam of exams) {
            // Get all enrolled student IDs for this exam
            const enrollments = await prisma.examEnrollment.findMany({
                where: { examId: exam.id },
                select: { studentId: true },
            });

            if (enrollments.length === 0) {
                results.push({
                    examId: exam.id,
                    examTitle: exam.title,
                    issued: 0,
                    error: 'No enrolled students',
                });
                continue;
            }

            const studentIds = enrollments.map((e) => e.studentId);

            const result = await issueHallTicketsForExam(studentIds, exam.id);

            if ('error' in result && result.error) {
                results.push({
                    examId: exam.id,
                    examTitle: exam.title,
                    issued: 0,
                    error: result.error,
                });
            } else {
                const count = result.count ?? 0;
                totalIssued += count;
                results.push({
                    examId: exam.id,
                    examTitle: exam.title,
                    issued: count,
                });
            }
        }

        revalidatePath('/dashboard/exam-sessions');

        return {
            success: true,
            data: {
                totalExams: exams.length,
                totalIssued,
                perExam: results,
            },
        };
    } catch (error) {
        console.error('Failed to issue hall tickets for session:', error);
        return { success: false, error: 'Failed to issue hall tickets for session.' };
    }
}

/**
 * Issues hall tickets for a SINGLE exam within a session.
 * Fetches enrolled students and delegates to the existing action.
 */
export async function issueHallTicketsForSingleExam(examId: string) {
    try {
        // Get all enrolled student IDs for this exam
        const enrollments = await prisma.examEnrollment.findMany({
            where: { examId },
            select: { studentId: true },
        });

        if (enrollments.length === 0) {
            return { success: false, error: 'No students enrolled in this exam.' };
        }

        const studentIds = enrollments.map((e) => e.studentId);
        const result = await issueHallTicketsForExam(studentIds, examId);

        if ('error' in result && result.error) {
            return { success: false, error: result.error };
        }

        revalidatePath('/dashboard/exam-sessions');

        return {
            success: true,
            data: {
                issued: result.count ?? 0,
                hallTicketIds: result.hallTicketIds ?? [],
            },
        };
    } catch (error) {
        console.error('Failed to issue hall tickets for exam:', error);
        return { success: false, error: 'Failed to issue hall tickets.' };
    }
}
