'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Download,
    Lock,
    Users,
    CalendarCheck,
    IndianRupee,
    GraduationCap,
    UserCheck,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import type { ReportConfig, ReportFormat, GradeOption, SectionOption } from '@/types/reports';
import { ReportDownloadDialog } from './ReportDownloadDialog';

interface ReportCardProps {
    report: ReportConfig;
    grades: GradeOption[];
    sections: SectionOption[];
}

const iconMap: Record<string, React.ReactNode> = {
    users: <Users className="h-5 w-5" />,
    'calendar-check': <CalendarCheck className="h-5 w-5" />,
    'indian-rupee': <IndianRupee className="h-5 w-5" />,
    'graduation-cap': <GraduationCap className="h-5 w-5" />,
    'user-check': <UserCheck className="h-5 w-5" />,
};

const formatIcons: Record<ReportFormat, React.ReactNode> = {
    csv: <FileText className="h-3.5 w-3.5" />,
    excel: <FileSpreadsheet className="h-3.5 w-3.5" />,
    pdf: <FileText className="h-3.5 w-3.5" />,
};

const formatLabels: Record<ReportFormat, string> = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    student: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
    },
    attendance: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800'
    },
    fee: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800'
    },
    staff: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
    },
    academic: {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-700 dark:text-pink-400',
        border: 'border-pink-200 dark:border-pink-800'
    },
};

export function ReportCard({ report, grades, sections }: ReportCardProps) {
    const isAvailable = report.status === 'available';
    const colors = categoryColors[report.category] || categoryColors.student;

    return (
        <Card className={`group relative overflow-hidden transition-all duration-200 ${isAvailable
                ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                : 'opacity-60'
            }`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {iconMap[report.icon] || <FileText className="h-5 w-5" />}
                    </div>

                    {isAvailable ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                            Available
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                            <Lock className="h-3 w-3 mr-1" />
                            Soon
                        </Badge>
                    )}
                </div>

                <CardTitle className="text-base leading-tight">
                    {report.name}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-2">
                    {report.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
                {isAvailable ? (
                    <>
                        <ReportDownloadDialog
                            report={report}
                            grades={grades}
                            sections={sections}
                            trigger={
                                <Button className="w-full gap-2" size="sm">
                                    <Download className="h-4 w-4" />
                                    Download Report
                                </Button>
                            }
                        />

                        {/* Format badges */}
                        <div className="flex items-center justify-center gap-2 mt-3">
                            {report.formats.map((format) => (
                                <div
                                    key={format}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground text-xs"
                                >
                                    {formatIcons[format]}
                                    <span className="font-medium">{formatLabels[format]}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <Button className="w-full gap-2" variant="secondary" size="sm" disabled>
                        <Lock className="h-4 w-4" />
                        Coming Soon
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
