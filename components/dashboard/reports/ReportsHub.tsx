'use client';

import React, { useState } from 'react';
import {
    Search,
    AlertCircle,
    ChevronRight,
    Info,
    CalendarDays,
    User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportCard } from './ReportCard';
import type {
    ReportConfig,
    GradeOption,
    SectionOption,
    ReportCategory
} from '@/types/reports';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { Badge } from '@/components/ui/badge';

interface ReportsHubProps {
    grades: GradeOption[];
    sections: SectionOption[];
    stats: {
        totalStudents: number;
        totalTeachers: number;
        totalGrades: number;
    };
    organizationId: string;
    academicYearId: string;
}

const REPORT_CONFIGS: ReportConfig[] = [
    {
        id: 'student-master',
        name: 'Student Master List',
        description: 'Complete directory of all students including contact details, grade, section, and primary parent information.',
        category: 'student',
        icon: 'users',
        status: 'available',
        formats: ['csv', 'excel'],
    },
    {
        id: 'attendance-summary',
        name: 'Attendance Summary',
        description: 'Detailed attendance statistics per student within a selected date range, including presence percentage.',
        category: 'attendance',
        icon: 'calendar-check',
        status: 'available',
        formats: ['csv', 'excel'],
    },
    {
        id: 'fee-collection',
        name: 'Fee Collection Report',
        description: 'Daily and monthly fee collection breakdown with payment method details.',
        category: 'fee',
        icon: 'indian-rupee',
        status: 'coming_soon',
        formats: ['csv', 'excel'],
    },
    {
        id: 'teacher-list',
        name: 'Staff Directory',
        description: 'Complete list of teaching and non-teaching staff with employment status.',
        category: 'staff',
        icon: 'users',
        status: 'available',
        formats: ['excel', 'csv'],
    },
    {
        id: 'result-analysis',
        name: 'Class-wise Result Analysis',
        description: 'Comprehensive analysis of examination marks with grade distribution and averages.',
        category: 'academic',
        icon: 'graduation-cap',
        status: 'coming_soon',
        formats: ['pdf', 'excel'],
    },
    // Fee Reconciliation Report
    {
        id: 'fee-reconciliation',
        name: 'Fee Reconciliation Report',
        description: 'Transaction-level breakdown with platform fee, PG fee, and net settlement per payment method.',
        category: 'fee',
        icon: 'indian-rupee',
        status: 'available',
        formats: ['csv', 'excel'],
    },
    {
        id: 'specific-student-report',
        name: 'Specific Student Report',
        description: 'Comprehensive report for an individual student including attendance, fees, and exam results.',
        category: 'student',
        icon: 'user-check',
        status: 'available',
        formats: ['pdf'],
    },
];

export function ReportsHub({ grades, sections, stats, organizationId, academicYearId }: ReportsHubProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { viewingYear, isViewingPastYear } = useAcademicYear();

    const filteredReports = REPORT_CONFIGS.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getByCategory = (category: ReportCategory | 'all') => {
        if (category === 'all') return filteredReports;
        return filteredReports.filter(r => r.category === category);
    };

    // Render report card - Fee Reconciliation links to dedicated page
    const renderReportCard = (report: ReportConfig) => {
        if (report.id === 'fee-reconciliation') {
            return (
                <ReconciliationCard
                    key={report.id}
                    report={report}
                />
            );
        }
        if (report.id === 'specific-student-report') {
            return (
                <SpecificStudentCard
                    key={report.id}
                    report={report}
                />
            );
        }
        return (
            <ReportCard
                key={report.id}
                report={report}
                grades={grades}
                sections={sections}
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* Academic Year Context Banner */}
            {viewingYear && (
                <div className={`rounded-xl border p-4 ${isViewingPastYear
                    ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                    : 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isViewingPastYear
                            ? 'bg-amber-100 dark:bg-amber-900/40'
                            : 'bg-blue-100 dark:bg-blue-900/40'
                            }`}>
                            <CalendarDays className={`h-5 w-5 ${isViewingPastYear
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-blue-600 dark:text-blue-400'
                                }`} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">
                                    {isViewingPastYear ? 'Viewing Historical Data' : 'Active Academic Year'}
                                </p>
                                <Badge variant={isViewingPastYear ? 'outline' : 'default'} className="text-xs">
                                    {viewingYear.name}
                                </Badge>
                            </div>
                            <p className={`text-xs ${isViewingPastYear
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-blue-700 dark:text-blue-300'
                                }`}>
                                {isViewingPastYear
                                    ? `All reports will contain data from ${viewingYear.name}. Switch to current year for latest records.`
                                    : `Reports will include all data from the current academic year ${viewingYear.name}.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Hub Section */}
            <Card className="border-2">
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="text-2xl">Reports Hub</CardTitle>
                            <CardDescription className="text-base">
                                Generate and download institutional data in standard formats
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search reports..."
                                className="pl-10 h-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                {stats.totalStudents}
                            </div>
                            <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium mt-1">
                                Total Students
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/50">
                            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                                {stats.totalTeachers}
                            </div>
                            <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium mt-1">
                                Total Teachers
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                                {stats.totalGrades}
                            </div>
                            <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-1">
                                Total Grades
                            </div>
                        </div>
                    </div>

                    {/* Categories Tabs */}
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList className="bg-muted/50 p-1.5 rounded-xl border h-auto flex-wrap">
                            <TabsTrigger value="all" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                All Reports
                            </TabsTrigger>
                            <TabsTrigger value="student" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Students
                            </TabsTrigger>
                            <TabsTrigger value="attendance" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Attendance
                            </TabsTrigger>
                            <TabsTrigger value="fee" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Finance
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Staff
                            </TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Academic
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {getByCategory('all').map(renderReportCard)}
                            </div>
                        </TabsContent>

                        {(['student', 'attendance', 'fee', 'staff', 'academic'] as ReportCategory[]).map((category) => (
                            <TabsContent key={category} value={category} className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {getByCategory(category).map(renderReportCard)}
                                </div>
                                {getByCategory(category).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                        <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                                        <p className="text-lg">No reports found in this category matching your search.</p>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-2 border-dashed bg-gradient-to-r from-background via-muted/5 to-background">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-1">Need a custom report?</h3>
                                <p className="text-muted-foreground text-sm">
                                    Contact support for specialized reports tailored to your institution's needs.
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="outline" className="gap-2 shrink-0">
                            <Link href="/support">
                                Contact Support
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ── ReconciliationCard ─────────────────────────────────────────────────────────
// Card for Fee Reconciliation Report - links to dedicated page

interface ReconciliationCardProps {
    report: ReportConfig;
}

function ReconciliationCard({ report }: { report: ReportConfig }) {
    return (
        // Outer shell intentionally matches ReportCard's structure
        // so the grid looks uniform. Tweak classNames to match your ReportCard.
        <div className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            {/* Status badge — top right */}
            <div className="absolute top-4 right-4">
                <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    Available
                </Badge>
            </div>

            {/* Icon */}
            <div className="mb-4 w-fit p-2.5 rounded-lg bg-primary/10">
                {/* Rupee icon — matches fee category */}
                <span className="text-primary font-bold text-base leading-none">₹</span>
            </div>

            {/* Title + description */}
            <div className="flex-1 space-y-1.5 mb-5">
                <h3 className="font-semibold text-sm leading-tight pr-16">{report.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
            </div>

            {/* Download button — links to dedicated Fee Reconciliation page */}
            <Button className="w-full" size="sm" asChild>
                <Link href="/dashboard/reports/fee-reconciliation">
                    Open Report
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>

            {/* Format pills — decorative, matches ReportCard footer */}
            <div className="flex items-center gap-2 mt-3">
                {report.formats.map((f) => (
                    <span key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="opacity-50">📄</span> {f.toUpperCase()}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── SpecificStudentCard ─────────────────────────────────────────────────────────
function SpecificStudentCard({ report }: { report: ReportConfig }) {
    return (
        <div className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="absolute top-4 right-4">
                <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    Available
                </Badge>
            </div>

            <div className="mb-4 w-fit p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                <User className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1.5 mb-5">
                <h3 className="font-semibold text-sm leading-tight pr-16">{report.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm" asChild>
                <Link href="/dashboard/students">
                    Select Student
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>

            <div className="flex items-center gap-2 mt-3">
                {report.formats.map((f) => (
                    <span key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="opacity-50">📄</span> {f.toUpperCase()}
                    </span>
                ))}
            </div>
        </div>
    );
}