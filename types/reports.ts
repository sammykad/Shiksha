// Report Types for the Reports Download System

export type ReportFormat = 'csv' | 'excel' | 'pdf';

export type ReportStatus = 'available' | 'coming_soon';

export type ReportCategory = 'student' | 'attendance' | 'fee' | 'staff' | 'academic';

export interface ReportConfig {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    icon: string; // Lucide icon name
    status: ReportStatus;
    formats: ReportFormat[];
}

export interface ReportFilters {
    dateRange?: {
        from: Date | undefined;
        to: Date | undefined;
    };
    gradeId?: string;
    sectionId?: string;
}

// Student Master List Data Types
export interface StudentReportData {
    id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    whatsAppNumber: string;
    gender: string;
    dateOfBirth: Date;
    grade: string;
    section: string;
    parentName?: string;
    parentPhone?: string;
    createdAt: Date;
}

// Attendance Report Data Types
export interface AttendanceReportData {
    studentId: string;
    rollNumber: string;
    studentName: string;
    grade: string;
    section: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
}

// Staff Directory Data Types
export interface StaffReportData {
    id: string;
    employeeCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    employmentStatus: string;
    joinedAt?: Date;
    qualification?: string;
    isActive: boolean;
}

// Grade and Section for filters
export interface GradeOption {
    id: string;
    name: string;
}

export interface SectionOption {
    id: string;
    name: string;
    gradeId: string;
}

// Report download response
export interface ReportDownloadResponse {
    success: boolean;
    data?: Blob | string;
    filename?: string;
    error?: string;
}
