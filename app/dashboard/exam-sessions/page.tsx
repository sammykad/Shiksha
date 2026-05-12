import { getCurrentUserByRole } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { redirect } from 'next/navigation';
import { ExamSessionsPage } from '@/components/dashboard/exam/ExamSessionsPage';

export default async function ExamSessionsRoute() {
    const organizationId = await getOrganizationId();
    const user = await getCurrentUserByRole();

    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
        return redirect('/dashboard/exams');
    }

    const sessions = await prisma.examSession.findMany({
        where: {
            academicYear: { organizationId },
        },
        include: {
            academicYear: {
                select: { name: true },
            },
            _count: {
                select: {
                    exams: true,
                    reportCards: true,
                },
            },
            // Enriched data for the drawer tabs
            exams: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    maxMarks: true,
                    subject: { select: { name: true } },
                    grade: { select: { grade: true } },
                    section: { select: { name: true } },
                    _count: {
                        select: {
                            examResult: true,
                            hallTickets: true,
                            examEnrollment: true,
                        },
                    },
                },
                orderBy: { startDate: 'asc' },
            },
            reportCards: {
                select: {
                    id: true,
                    studentId: true,
                    percentage: true,
                    overallGrade: true,
                    resultStatus: true,
                    pdfUrl: true,
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                            rollNumber: true,
                        },
                    },
                },
                orderBy: { percentage: 'desc' },
            },
            hallTickets: {
                select: {
                    studentId: true,
                    examId: true,
                    issuedAt: true,
                    pdfUrl: true,
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                            rollNumber: true,
                        },
                    },
                    exam: {
                        select: {
                            title: true,
                            subject: { select: { name: true } },
                        },
                    },
                },
                orderBy: { issuedAt: 'desc' },
            },
        },
        orderBy: { startDate: 'desc' },
    });

    return (
        <ExamSessionsPage
            sessions={sessions}
        />
    );
}