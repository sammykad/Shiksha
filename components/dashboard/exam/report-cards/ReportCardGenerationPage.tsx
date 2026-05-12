'use client';

import { useState, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/page-header';
import { SessionStatusCard } from './SessionStatusCard';
import { ExamsListTable } from './ExamsListTable';
import { GenerateReportCardsSection } from './GenerateReportCardsSection';
import { GeneratedReportCardsList } from './GeneratedReportCardsList';
import { AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

type ExamSession = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  academicYear: {
    name: string;
  };
  exams: Array<{
    id: string;
    gradeId: string;
    sectionId: string;
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
    examResult: Array<{
      id: string;
      studentId: string;
      obtainedMarks: number | null;
      isPassed: boolean | null;
      isAbsent: boolean;
    }>;
  }>;
};

type ReportCardGenerationPageProps = {
  session: ExamSession;
};

export function ReportCardGenerationPage({ session }: ReportCardGenerationPageProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate session statistics
  const stats = useMemo(() => {
    const totalExams = session.exams.length;
    const publishedExams = session.exams.filter((e) => e.isResultsPublished).length;
    const pendingExams = session.exams.filter((e) => !e.isResultsPublished);
    const allPublished = totalExams > 0 && publishedExams === totalExams;

    return {
      totalExams,
      publishedExams,
      pendingExams,
      allPublished,
    };
  }, [session.exams]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Report Card Dashboard"
        description={`Manage results and generate official report cards for ${session.title}`}
        icon={FileText}
      />

      <div className="px-4 sm:px-0 space-y-6">
        {/* Warning if exams are pending */}
        {!stats.allPublished && (
          <Alert variant="destructive" className="border-orange-200 bg-orange-50/50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 text-xs sm:text-sm">
              <span className="font-medium">Action Required:</span> {stats.pendingExams.length} exam(s)
              have unpublished results. Publish all exam results to enable generation.
            </AlertDescription>
          </Alert>
        )}

        {/* Success indicator when all published */}
        {stats.allPublished && (
          <Alert className="border-emerald-200 bg-emerald-50/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900 text-xs sm:text-sm">
              <span className="font-medium">Ready to Generate!</span> All exams have published results. You can now
              proceed with batch generation.
            </AlertDescription>
          </Alert>
        )}

        {/* Session Status & Metrics */}
        <SessionStatusCard session={session} stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Actions & Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <GenerateReportCardsSection
              sessionId={session.id}
              exams={session.exams}
              allPublished={stats.allPublished}
              onGenerated={handleRefresh}
            />
            
            <div className="hidden lg:block">
               <ExamsListTable exams={session.exams} compact />
            </div>
          </div>

          {/* Right Column: Results & List */}
          <div className="lg:col-span-2 space-y-6">
            <GeneratedReportCardsList
              sessionId={session.id}
              refreshKey={refreshKey}
              onRefresh={handleRefresh}
            />
            
            <div className="lg:hidden">
               <ExamsListTable exams={session.exams} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
