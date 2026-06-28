'use client';

import { useState } from 'react';
import {
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    ChevronDown,
    Info
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { pdf } from '@react-pdf/renderer';
import { AttendanceReportPDF } from '@/lib/pdf-generator/AttendanceReportPDF';
import { downloadBlob } from '@/lib/pdf-generator/pdf';


import { AttendanceExportProps } from '@/types/attendance-export';

export function AttendanceExport({
    records,
    organization,
    filename = 'attendance-report',
    title = 'Attendance Report',
    filters,
    variant = 'outline',
    size = 'sm',
    disabled = false
}: AttendanceExportProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExportCSV = () => {
        if (!records || records.length === 0) {
            toast.error('No records to export');
            return;
        }

        setIsExporting('csv');
        try {
            const formatDate = (date: Date | string | null | undefined) => {
                if (!date) return '-';
                try {
                    const d = typeof date === 'string' ? new Date(date) : date;
                    if (isNaN(d.getTime())) return '-';
                    // Format as DD-MMM-YYYY in IST for Excel compatibility
                    const istDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                    const day = istDate.getUTCDate().toString().padStart(2, '0');
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = months[istDate.getUTCMonth()];
                    const year = istDate.getUTCFullYear();
                    return `${day}-${month}-${year}`;
                } catch {
                    return '-';
                }
            };

            const csvData = records.map(record => ({
                'Date': formatDate(record.date),
                'Student Name': record.student ? `${record.student.firstName} ${record.student.lastName}` : (record.name || 'N/A'),
                'Roll Number': record.student?.rollNumber || record.rollNumber || 'N/A',
                'Grade': typeof record.grade === 'object' ? (record.grade as { grade: string }).grade : (record.grade || 'N/A'),
                'Section': typeof record.section === 'object' ? (record.section as { name: string }).name : (record.section || 'N/A'),
                'Status': (record.status || record.attendanceStatus || 'N/A').toString().toUpperCase(),
                'Note': record.note || record.notes || '',
                'Recorded By': record.recordedBy || 'System'
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            downloadBlob(blob, `${filename}-${new Date().getTime()}.csv`);
            toast.success('CSV exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportPDF = async () => {
        if (!records || records.length === 0) {
            toast.error('No records to export');
            return;
        }

        setIsExporting('pdf');
        try {
            const doc = <AttendanceReportPDF
                records={records}
                organization={organization}
                title={title}
                filters={filters}
            />;

            const blob = await pdf(doc).toBlob();
            downloadBlob(blob, `${filename}-${new Date().getTime()}.pdf`);
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled || isExporting !== null || records.length === 0}
                    className="gap-2 transition-all duration-200"
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {size !== 'icon' && (
                        <>
                            Export
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-xl border-muted/40 shadow-xl backdrop-blur-sm">
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Export Options
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-muted/40" />

                <DropdownMenuItem
                    onClick={handleExportCSV}
                    disabled={isExporting !== null}
                    className="group flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer focus:bg-primary/5"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 group-focus:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">Excel (CSV)</span>
                        <span className="text-xs text-muted-foreground">Standard spreadsheet format</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleExportPDF}
                    disabled={isExporting !== null}
                    className="group flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer focus:bg-primary/5"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100 group-focus:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">PDF Document</span>
                        <span className="text-xs text-muted-foreground">Professional print-ready report</span>
                    </div>
                </DropdownMenuItem>

                {records.length > 500 && (
                    <>
                        <DropdownMenuSeparator className="bg-muted/40" />
                        <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-amber-600 dark:text-amber-400">
                            <Info className="h-3 w-3" />
                            <span>Large dataset may take a moment</span>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
