export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    website?: string | null;
    organizationType?: 'SCHOOL' | 'COLLEGE' | 'COACHING_CLASS' | 'UNIVERSITY' | 'KINDERGARTEN' | 'TRAINING_INSTITUTE' | 'OTHER' | null;
    plan?: 'FREE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE' | null;
    planStartedAt?: Date | null;
    planExpiresAt?: Date | null;
    maxStudents?: number | null;
    isActive?: boolean | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    createdBy?: string | null;
}

export interface StudentAttendance {
    id: string;
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    note?: string | null;
    recordedBy: string;
    studentId: string;
    sectionId: string;
    academicYearId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AcademicCalendar {
    id: string;
    organizationId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    type: 'PLANNED' | 'EMERGENCY' | 'INSTITUTION_SPECIFIC';
    reason?: string | null;
    isRecurring: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    academicYearId?: string | null;
}

export interface AttendanceExportRecord {
    date: Date | string | null;
    student?: {
        firstName: string;
        lastName: string;
        rollNumber: string;
    };
    name?: string;
    rollNumber?: string;
    grade?: string | { id: string; grade: string };
    section?: string | { id: string; name: string };
    status?: string | 'PRESENT' | 'ABSENT' | 'LATE';
    attendanceStatus?: string | 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
    note?: string | null;
    notes?: string | null;
    recordedBy?: string;
}

export interface AttendanceExportFilters {
    grade?: string;
    section?: string;
    status?: string;
    dateRange?: string;
}

export interface AttendanceExportProps {
    records: AttendanceExportRecord[];
    organization?: Organization | null;
    filename?: string;
    title?: string;
    filters?: AttendanceExportFilters;
    variant?: 'outline' | 'default' | 'ghost' | 'secondary';
    size?: 'sm' | 'default' | 'lg' | 'icon';
    disabled?: boolean;
}
