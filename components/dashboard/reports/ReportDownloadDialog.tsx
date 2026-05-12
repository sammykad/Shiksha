'use client';

import React, { useState } from 'react';
import {
    DownloadIcon,
    Loader2,
    FileTextIcon,
    CalendarIcon,
    Layers,
    LayoutGrid,
    FileSpreadsheet,
    FileText,
    X,
    Check,
    Sparkles,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type {
    ReportConfig,
    ReportFilters,
    ReportFormat,
    GradeOption,
    SectionOption,
} from '@/types/reports';
import { generateStudentReport, generateAttendanceReport, generateStaffReport } from '@/lib/reports/generate-reports';
import { downloadCSV, downloadExcel } from '@/lib/reports/download-utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ReportDownloadDialogProps {
    report: ReportConfig;
    grades: GradeOption[];
    sections: SectionOption[];
    trigger?: React.ReactNode;
}

export function ReportDownloadDialog({
    report,
    grades,
    sections,
    trigger,
}: ReportDownloadDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ReportFormat>(report.formats[0] || 'csv');
    const [localFilters, setLocalFilters] = useState<ReportFilters>({
        dateRange: report.id === 'attendance-summary'
            ? { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() }
            : undefined
    });

    const filteredSections = localFilters.gradeId
        ? sections.filter((s) => s.gradeId === localFilters.gradeId)
        : sections;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            let result;
            if (report.id === 'student-master') {
                result = await generateStudentReport(localFilters, selectedFormat);
            } else if (report.id === 'attendance-summary') {
                result = await generateAttendanceReport(localFilters, selectedFormat);
            } else if (report.id === 'teacher-list') {
                result = await generateStaffReport(selectedFormat);
            }

            if (result) {
                if (selectedFormat === 'csv') {
                    downloadCSV(result.data, result.filename);
                } else if (selectedFormat === 'excel') {
                    downloadExcel(result.data, result.filename);
                }
                toast.success(`${report.name} downloaded successfully`);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const hasActiveFilters = localFilters.gradeId || localFilters.sectionId;

    const clearFilters = () => {
        setLocalFilters({
            dateRange: report.id === 'attendance-summary'
                ? { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() }
                : undefined
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b px-6 py-6">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <DialogHeader className="relative space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20">
                                <FileTextIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle>
                                    {report.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Customize your report parameters and download format
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Date Range - Only for Attendance */}
                    {report.id === 'attendance-summary' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10">
                                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Date Range
                                </Label>
                                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                    Required
                                </Badge>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal h-12 hover:bg-muted/50 transition-colors',
                                            !localFilters.dateRange && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                                        {localFilters.dateRange?.from ? (
                                            localFilters.dateRange.to ? (
                                                <span className="font-medium">
                                                    {format(localFilters.dateRange.from, 'MMM dd, yyyy')} → {format(localFilters.dateRange.to, 'MMM dd, yyyy')}
                                                </span>
                                            ) : (
                                                <span className="font-medium">{format(localFilters.dateRange.from, 'MMM dd, yyyy')}</span>
                                            )
                                        ) : (
                                            <span>Select date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={localFilters.dateRange?.from}
                                        selected={{
                                            from: localFilters.dateRange?.from,
                                            to: localFilters.dateRange?.to,
                                        }}
                                        onSelect={(range) =>
                                            setLocalFilters(prev => ({
                                                ...prev,
                                                dateRange: range ? { from: range.from, to: range.to } : undefined
                                            }))
                                        }
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Filters Section - Only for reports that need Grade/Section filtering */}
                    {(report.category === 'student' || report.category === 'attendance' || report.category === 'academic') && (
                        <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-background">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-sm font-semibold">Optional Filters</h4>
                                    {hasActiveFilters && (
                                        <Badge variant="outline" className="text-xs h-5">
                                            {[localFilters.gradeId, localFilters.sectionId].filter(Boolean).length} Active
                                        </Badge>
                                    )}
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8 text-xs gap-1.5 hover:bg-background"
                                    >
                                        <X className="h-3 w-3" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Grade Filter */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Layers className="h-3 w-3" />
                                        Grade Level
                                    </Label>
                                    <Select
                                        value={localFilters.gradeId || 'all'}
                                        onValueChange={(val) =>
                                            setLocalFilters(prev => ({
                                                ...prev,
                                                gradeId: val === 'all' ? undefined : val,
                                                sectionId: undefined
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="h-11 bg-background hover:bg-muted/50 transition-colors">
                                            <SelectValue placeholder="All Grades" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                    All Grades
                                                </div>
                                            </SelectItem>
                                            {grades.map((grade) => (
                                                <SelectItem key={grade.id} value={grade.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        {grade.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Section Filter */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <LayoutGrid className="h-3 w-3" />
                                        Section
                                    </Label>
                                    <Select
                                        value={localFilters.sectionId || 'all'}
                                        onValueChange={(val) =>
                                            setLocalFilters(prev => ({
                                                ...prev,
                                                sectionId: val === 'all' ? undefined : val
                                            }))
                                        }
                                        disabled={!localFilters.gradeId}
                                    >
                                        <SelectTrigger className="h-11 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50">
                                            <SelectValue placeholder={localFilters.gradeId ? "All Sections" : "Select grade first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                    All Sections
                                                </div>
                                            </SelectItem>
                                            {filteredSections.map((section) => (
                                                <SelectItem key={section.id} value={section.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        {section.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <Label className="text-sm font-semibold">
                                Choose Download Format
                            </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {report.formats.map((f) => {
                                const isExcel = f === 'excel';
                                const isSelected = selectedFormat === f;
                                return (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setSelectedFormat(f)}
                                        className={cn(
                                            "group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                                            isSelected
                                                ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md scale-[1.02]"
                                                : "border-border hover:border-primary/30 hover:bg-muted/30 hover:scale-[1.01]"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className={cn(
                                            "p-2.5 rounded-lg transition-all duration-200",
                                            isSelected
                                                ? "bg-primary/20 shadow-sm"
                                                : "bg-muted group-hover:bg-muted/80"
                                        )}>
                                            {isExcel ? (
                                                <FileSpreadsheet className={cn(
                                                    "h-5 w-5 transition-colors duration-200",
                                                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                )} />
                                            ) : (
                                                <FileText className={cn(
                                                    "h-5 w-5 transition-colors duration-200",
                                                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                )} />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="text-left flex-1">
                                            <div className={cn(
                                                "text-sm font-semibold transition-colors duration-200",
                                                isSelected ? "text-primary" : "text-foreground"
                                            )}>
                                                {isExcel ? 'Excel Spreadsheet' : 'CSV File'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {isExcel ? 'Excel workbook' : 'Universal .csv format'}
                                            </div>
                                        </div>

                                        {/* Check indicator */}
                                        <div className={cn(
                                            "absolute -top-1.5 -right-1.5 p-1 rounded-full transition-all duration-200",
                                            isSelected
                                                ? "bg-primary text-white scale-100 opacity-100"
                                                : "bg-muted text-muted-foreground scale-0 opacity-0"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-muted/20 px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            disabled={isDownloading}
                            className="hover:bg-background"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Preparing Report...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Download Report
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
