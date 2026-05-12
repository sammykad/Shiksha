'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';

type ExamsListTableProps = {
  exams: Array<{
    id: string;
    title: string;
    maxMarks: number;
    isResultsPublished: boolean;
    subject: {
      name: string;
      code: string;
    };
    grade: {
      grade: string;
    } | null;
    section: {
      name: string;
    } | null;
    examResult: Array<{
      id: string;
    }>;
  }>;
  compact?: boolean;
};

export function ExamsListTable({ exams, compact }: ExamsListTableProps) {
  if (compact) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 px-6 pt-6 bg-muted/20">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Exams Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-6">
          <div className="space-y-1">
            {exams.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground py-4">No exams scheduled.</p>
            ) : (
              exams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate">{exam.subject.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{exam.title}</span>
                  </div>
                  {exam.isResultsPublished ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
              ))
            )}
            {exams.length > 5 && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                + {exams.length - 5} more exams in session
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <BookOpen className="h-5 w-5 text-primary" />
          Session Curriculum & Exam Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/20 border-b">
                <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">Subject & Content</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">Assessment Title</TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">Target Audience</TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Weightage</TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Participation</TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-10 w-10 opacity-20" />
                      <p className="font-medium text-foreground/70">No Academic Records</p>
                      <p className="text-xs">No exams found mapped to this academic session.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{exam.subject.name}</span>
                        <code className="text-[9px] font-mono text-muted-foreground">
                          {exam.subject.code}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <span className="text-sm font-medium">{exam.title}</span>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          Gr. {exam.grade?.grade || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          Sec. {exam.section?.name || 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center font-medium">
                      {exam.maxMarks}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center uppercase text-[10px]">
                      {exam.examResult.length} Results
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      <Badge variant={exam.isResultsPublished ? 'PUBLISHED' : 'DRAFT'}>
                        {exam.isResultsPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
