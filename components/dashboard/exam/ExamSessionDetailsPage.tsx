'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  BookOpen,
  FileText,
  Users,
  CheckCircle,
  Clock,
  ChevronRight,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDateIN } from '@/lib/utils';

type ExamSessionDetailsPageProps = {
  session: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    academicYear: {
      id: string;
      name: string;
    };
    exams: Array<{
      id: string;
      title: string;
      maxMarks: number;
      isResultsPublished: boolean;
      subject: {
        id: string;
        name: string;
        code: string;
      };
      grade: {
        id: string;
        grade: string;
      } | null;
      section: {
        id: string;
        name: string;
      } | null;
      _count: {
        examEnrollment: number;
        examResult: number;
      };
    }>;
    stats: {
      totalExams: number;
      totalEnrollments: number;
      totalResults: number;
      publishedExams: number;
      pendingExams: number;
      allPublished: boolean;
    };
  };
};

export function ExamSessionDetailsPage({ session }: ExamSessionDetailsPageProps) {
  return (
    <Card className="mx-2 border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardContent className="space-y-6 px-2 sm:px-6 py-6">

        {/* Session Overview */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                </div>
                {session.description && (
                  <CardDescription className="text-base">{session.description}</CardDescription>
                )}
                <Badge variant="outline" className="mt-2">
                  {session.academicYear.name}
                </Badge>
              </div>
              <Badge variant={session.stats.allPublished ? 'APPROVED' : 'PENDING'}>
                {session.stats.allPublished ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All Published
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    {session.stats.pendingExams} Pending
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Date Range */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-blue-600 font-medium uppercase">Session Period</div>
                  <div className="font-semibold text-sm text-blue-900 truncate">
                    {formatDateIN(session.startDate)}
                  </div>
                  <div className="text-xs text-blue-700">to {formatDateIN(session.endDate)}</div>
                </div>
              </div>

              {/* Total Exams */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-medium uppercase">Total Exams</div>
                  <div className="font-bold text-2xl text-purple-900">{session.stats.totalExams}</div>
                </div>
              </div>

              {/* Total Enrollments */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-green-600 font-medium uppercase">Enrollments</div>
                  <div className="font-bold text-2xl text-green-900">
                    {session.stats.totalEnrollments}
                  </div>
                </div>
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  {session.stats.allPublished ? (
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-orange-600 font-medium uppercase">Published</div>
                  <div className="font-bold text-2xl text-orange-900">
                    {session.stats.publishedExams}/{session.stats.totalExams}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/dashboard/exam-sessions/${session.id}/reports`}>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report Cards
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Exams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Exams in This Session ({session.exams.length})
            </CardTitle>
            <CardDescription>
              Manage individual exams, enrollments, and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session.exams.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary opacity-50" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">No Exams Yet</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      This session doesn't have any exams. Add exams to get started.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Class</TableHead>
                      <TableHead className="text-center font-semibold">Max Marks</TableHead>
                      <TableHead className="text-center font-semibold">Enrolled</TableHead>
                      <TableHead className="text-center font-semibold">Results</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.exams.map((exam) => (
                      <TableRow key={exam.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{exam.subject.name}</div>
                            <Badge variant="outline" className="text-xs font-mono mt-1">
                              {exam.subject.code}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {exam.grade && exam.section ? (
                              <>
                                Grade {exam.grade.grade} - {exam.section.name}
                              </>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {exam.maxMarks}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{exam._count.examEnrollment}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{exam._count.examResult}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {exam.isResultsPublished ? (
                            <Badge variant="PUBLISHED" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="PENDING" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/exams/${exam.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Manage
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
