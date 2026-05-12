/**
 * Type definitions for Student Academic Performance data
 * Ensures type safety across the entire performance tracking system
 */

// ==================== Exam Results ====================

export interface ExamResultWithDetails {
    id: string;
    obtainedMarks: number | null;
    percentage: number | null;
    gradeLabel: string | null;
    isPassed: boolean | null;
    isAbsent: boolean;
    remarks: string | null;
    createdAt: Date;
    updatedAt: Date;
    exam: {
        id: string;
        title: string;
        maxMarks: number;
        startDate: Date;
        endDate: Date;
        evaluationType: string;
        mode: string;
        subject: {
            id: string;
            name: string;
            code: string;
        };
        examSession: {
            id: string;
            title: string;
            academicYearId: string;
        };
        examSessionId: string;
        status: string;
    };
}

// ==================== Report Cards ====================

export interface ReportCardWithSession {
    id: string;
    totalMaxMarks: number;
    totalObtained: number;
    percentage: number;
    cgpa: number | null;
    overallGrade: string;
    resultStatus: string;
    classRank: number | null;
    gradeRank: number | null;
    rank: number | null;
    attendancePercent: number | null;
    conductGrade: string | null;
    remarks: string | null;
    principalRemarks: string | null;
    createdAt: Date;
    updatedAt: Date;
    examSession: {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date;
    };
}

// ==================== Upcoming Exams ====================

export interface UpcomingExamWithDetails {
    id: string;
    title: string;
    description: string | null;
    maxMarks: number;
    passingMarks: number | null;
    evaluationType: string;
    mode: string;
    status: string;
    startDate: Date;
    endDate: Date;
    venue: string | null;
    durationInMinutes: number | null;
    subject: {
        id: string;
        name: string;
        code: string;
    };
    examSession: {
        id: string;
        title: string;
        academicYearId: string;
    };
    examSessionId: string;
}

// ==================== Exam Enrollments ====================

export interface ExamEnrollmentWithDetails {
    id: string;
    status: string;
    enrolledAt: Date;
    hallTicketIssued: boolean;
    hallTicketIssuedAt: Date | null;
    exam: {
        id: string;
        title: string;
        startDate: Date;
        subject: {
            id: string;
            name: string;
        };
        status: string;
    };
}

// ==================== Aggregated Performance Data ====================

export interface StudentPerformanceData {
    examResults: ExamResultWithDetails[];
    reportCards: ReportCardWithSession[];
    upcomingExams: UpcomingExamWithDetails[];
    examEnrollments: ExamEnrollmentWithDetails[];
}

// ==================== Derived Analytics ====================

export interface SubjectPerformanceStats {
    name: string;
    average: number;
    icon: string;
    totalExams: number;
    passedExams: number;
    failedExams: number;
}

export interface AcademicTimelineEvent {
    date: Date;
    title: string;
    description: string;
    type: 'exam' | 'report' | 'upcoming';
}

export interface PerformanceInsightData {
    topSubjects: SubjectPerformanceStats[];
    weakSubjects: SubjectPerformanceStats[];
    overallAverage: number;
    totalExams: number;
    passRate: number;
    latestGrade: string | null;
    currentStanding: string;
    insightMessage: string;
}

// ==================== Assignments (Static for now) ====================

export interface AssignmentWithDetails {
    id: string;
    title: string;
    subject: string;
    dueDate: Date;
    status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
    grade?: string;
    maxMarks?: number;
    obtainedMarks?: number;
}
