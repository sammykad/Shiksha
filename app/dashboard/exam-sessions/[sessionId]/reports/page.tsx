import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getExamSessionForReportCards } from '@/lib/data/exam/report-card-generation';
import { ReportCardGenerationPage } from '@/components/dashboard/exam/report-cards/ReportCardGenerationPage';

export default async function ExamSessionReportsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { orgRole: role } = await auth();

  if (role !== 'ADMIN' && role !== 'TEACHER') {
    redirect('/dashboard/exams');
  }

  const result = await getExamSessionForReportCards(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ReportCardGenerationPage session={result.data} />;
}
