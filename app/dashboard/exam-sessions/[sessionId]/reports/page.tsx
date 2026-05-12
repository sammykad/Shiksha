import { notFound } from 'next/navigation';
import { getExamSessionForReportCards } from '@/lib/data/exam/report-card-generation';
import { ReportCardGenerationPage } from '@/components/dashboard/exam/report-cards/ReportCardGenerationPage';

export default async function ExamSessionReportsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const result = await getExamSessionForReportCards(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ReportCardGenerationPage session={result.data} />;
}
