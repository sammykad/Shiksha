import prisma from '@/lib/db';
import type { StudentPerformanceData } from '@/types/student-performance';

/**
 * Fetches comprehensive student performance data with optimized queries
 * @param studentId - The ID of the student
 * @returns Promise<StudentPerformanceData> - All performance-related data
 */
export async function getStudentPerformance(
    studentId: string
): Promise<StudentPerformanceData> {
    try {
        const [examResults, reportCards, upcomingExams, examEnrollments] =
            await Promise.all([
                prisma.examResult.findMany({
                    where: {
                        studentId,
                    },
                    select: {
                        id: true,
                        obtainedMarks: true,
                        percentage: true,
                        gradeLabel: true,
                        isPassed: true,
                        isAbsent: true,
                        remarks: true,
                        createdAt: true,
                        updatedAt: true,
                        exam: {
                            select: {
                                id: true,
                                title: true,
                                maxMarks: true,
                                startDate: true,
                                endDate: true,
                                evaluationType: true,
                                mode: true,
                                subject: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true,
                                    },
                                },
                                examSession: {
                                    select: {
                                        id: true,
                                        title: true,
                                        academicYearId: true,
                                    },
                                },
                                examSessionId: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        exam: {
                            startDate: 'desc',
                        },
                    },
                    take: 100, // Limit for performance
                }),

                prisma.reportCard.findMany({
                    where: {
                        studentId,
                    },
                    select: {
                        id: true,
                        totalMaxMarks: true,
                        totalObtained: true,
                        percentage: true,
                        cgpa: true,
                        overallGrade: true,
                        resultStatus: true,
                        classRank: true,
                        gradeRank: true,
                        rank: true,
                        attendancePercent: true,
                        conductGrade: true,
                        remarks: true,
                        principalRemarks: true,
                        createdAt: true,
                        updatedAt: true,
                        examSession: {
                            select: {
                                id: true,
                                title: true,
                                startDate: true,
                                endDate: true,
                            },
                        },
                    },
                    orderBy: {
                        examSession: {
                            startDate: 'desc',
                        },
                    },
                }),

                prisma.exam.findMany({
                    where: {
                        status: 'UPCOMING',
                        startDate: {
                            gte: new Date(),
                        },
                        // Filter by student's grade and section
                        OR: [
                            {
                                examEnrollment: {
                                    some: {
                                        studentId,
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        maxMarks: true,
                        passingMarks: true,
                        evaluationType: true,
                        mode: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                        venue: true,
                        durationInMinutes: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        examSession: {
                            select: {
                                id: true,
                                title: true,
                                academicYearId: true,
                            },
                        },
                        examSessionId: true,
                    },
                    orderBy: {
                        startDate: 'asc',
                    },
                    take: 20,
                }),

                prisma.examEnrollment.findMany({
                    where: {
                        studentId,
                    },
                    select: {
                        id: true,
                        status: true,
                        enrolledAt: true,
                        hallTicketIssued: true,
                        hallTicketIssuedAt: true,
                        exam: {
                            select: {
                                id: true,
                                title: true,
                                startDate: true,
                                subject: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        enrolledAt: 'desc',
                    },
                    take: 50,
                }),
            ]);


        return {
            examResults,
            reportCards,
            upcomingExams,
            examEnrollments,
        };
    } catch (error) {
        console.error('Error fetching student performance:', error);
        return {
            examResults: [],
            reportCards: [],
            upcomingExams: [],
            examEnrollments: [],
        };
    }
}


export async function getStudentUpcomingExams(
    studentId: string,
    limit: number = 5
) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { gradeId: true, sectionId: true },
    });

    if (!student) return [];

    return prisma.exam.findMany({
        where: {
            status: 'UPCOMING',
            startDate: { gte: new Date() },
            gradeId: student.gradeId,
            sectionId: student.sectionId,
        },
        select: {
            id: true,
            title: true,
            startDate: true,
            subject: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            examSession: {
                select: {
                    id: true,
                    title: true,
                    academicYearId: true,
                },
            },
            examSessionId: true,
        },
        orderBy: { startDate: 'asc' },
        take: limit,
    });
}
