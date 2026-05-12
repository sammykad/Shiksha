export interface StudentAnalytics {
    id: string;
    name: string;
    rollNumber: string;
    attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
    notes?: string;
}

export interface SectionAttendanceDetails {
    id: string;
    section: string;
    grade: string;
    date: Date;
    reportedBy: string;
    status: 'completed' | 'in-progress' | 'pending';
    percentage: number;
    studentsPresent: number;
    totalStudents: number;
    students: StudentAnalytics[];
}
