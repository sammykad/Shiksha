'use server';

import { getStudentMasterListData, getAttendanceReportData, getStaffDirectoryData } from '@/lib/data/reports/get-reports-data';
import type { ReportFilters, ReportFormat } from '@/types/reports';
import { format } from 'date-fns';
import { formatDateIN } from '@/lib/utils';

/**
 * Standardize cell values for reports
 */
function sanitizeCell(value: any): string | number {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? '-' : trimmed;
    }
    return value;
}



/**
 * Generate Student Master List Report
 */
export async function generateStudentReport(
    filters?: ReportFilters,
    reportFormat: ReportFormat = 'csv'
): Promise<{ data: string; filename: string; mimeType: string }> {
    const students = await getStudentMasterListData(filters);

    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
    const filename = `student_master_list_${timestamp}`;

    const headers = [
        'Roll Number',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'WhatsApp',
        'Gender',
        'Date of Birth',
        'Grade',
        'Section',
        'Parent Name',
        'Parent Phone',
        'Admission Date',
    ];

    const mappedRows = students.map((s) => [
        sanitizeCell(s.rollNumber),
        sanitizeCell(s.firstName),
        sanitizeCell(s.lastName),
        sanitizeCell(s.email),
        sanitizeCell(s.phoneNumber),
        sanitizeCell(s.whatsAppNumber),
        sanitizeCell(s.gender),
        formatDateIN(s.dateOfBirth),
        sanitizeCell(s.grade),
        sanitizeCell(s.section),
        sanitizeCell(s.parentName),
        sanitizeCell(s.parentPhone),
        formatDateIN(s.createdAt),
    ]);

    if (reportFormat === 'csv') {
        const csvContent = [
            headers.join(','),
            ...mappedRows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        return {
            data: csvContent,
            filename: `${filename}.csv`,
            mimeType: 'text/csv',
        };
    }

    if (reportFormat === 'excel') {
        const excelData = {
            sheetName: 'Student Master List',
            headers: headers,
            rows: mappedRows,
        };

        return {
            data: JSON.stringify(excelData),
            filename: `${filename}.xlsx`,
            mimeType: 'application/json',
        };
    }

    throw new Error('Unsupported format for student report');
}

/**
 * Generate Attendance Summary Report
 */
export async function generateAttendanceReport(
    filters?: ReportFilters,
    reportFormat: ReportFormat = 'csv'
): Promise<{ data: string; filename: string; mimeType: string }> {
    const attendanceData = await getAttendanceReportData(filters);

    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
    const dateRangeStr = filters?.dateRange?.from && filters?.dateRange?.to
        ? `_${format(filters.dateRange.from, 'ddMMM')}-${format(filters.dateRange.to, 'ddMMM')}`
        : '';
    const filename = `attendance_report${dateRangeStr}_${timestamp}`;

    const headers = [
        'Roll Number',
        'Student Name',
        'Grade',
        'Section',
        'Total Days',
        'Present Days',
        'Absent Days',
        'Late Days',
        'Attendance %',
    ];

    const mappedRows = attendanceData.map((a) => [
        sanitizeCell(a.rollNumber),
        sanitizeCell(a.studentName),
        sanitizeCell(a.grade),
        sanitizeCell(a.section),
        sanitizeCell(a.totalDays),
        sanitizeCell(a.presentDays),
        sanitizeCell(a.absentDays),
        sanitizeCell(a.lateDays),
        reportFormat === 'csv' ? `${a.attendancePercentage}%` : a.attendancePercentage,
    ]);

    if (reportFormat === 'csv') {
        const csvContent = [
            headers.join(','),
            ...mappedRows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        return {
            data: csvContent,
            filename: `${filename}.csv`,
            mimeType: 'text/csv',
        };
    }

    if (reportFormat === 'excel') {
        const excelData = {
            sheetName: 'Attendance Report',
            headers: headers,
            rows: mappedRows,
        };

        return {
            data: JSON.stringify(excelData),
            filename: `${filename}.xlsx`,
            mimeType: 'application/json',
        };
    }

    throw new Error('Unsupported format for attendance report');
}

/**
 * Generate Staff Directory Report
 */
export async function generateStaffReport(
    reportFormat: ReportFormat = 'excel'
): Promise<{ data: string; filename: string; mimeType: string }> {
    const staff = await getStaffDirectoryData();

    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
    const filename = `staff_directory_${timestamp}`;

    const headers = [
        'Employee Code',
        'First Name',
        'Last Name',
        'Email',
        'Role',
        'Phone',
        'Employment Status',
        'Joining Date',
        'Qualification',
        'Account Status',
    ];

    const mappedRows = staff.map((s) => [
        sanitizeCell(s.employeeCode),
        sanitizeCell(s.firstName),
        sanitizeCell(s.lastName),
        sanitizeCell(s.email),
        sanitizeCell(s.role),
        sanitizeCell(s.phone),
        sanitizeCell(s.employmentStatus),
        s.joinedAt ? formatDateIN(s.joinedAt) : '-',
        sanitizeCell(s.qualification),
        s.isActive ? 'Active' : 'Inactive',
    ]);

    if (reportFormat === 'csv') {
        const csvContent = [
            headers.join(','),
            ...mappedRows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        return {
            data: csvContent,
            filename: `${filename}.csv`,
            mimeType: 'text/csv',
        };
    }

    if (reportFormat === 'excel') {
        const excelData = {
            sheetName: 'Staff Directory',
            headers: headers,
            rows: mappedRows,
        };

        return {
            data: JSON.stringify(excelData),
            filename: `${filename}.xlsx`,
            mimeType: 'application/json',
        };
    }

    throw new Error('Unsupported format for staff report');
}
