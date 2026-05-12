import { notFound } from 'next/navigation';
import { getExamSessionDetails } from '@/lib/data/exam/get-exam-session-details';
import { ExamSessionDetailsPage } from '@/components/dashboard/exam/ExamSessionDetailsPage';

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const result = await getExamSessionDetails(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ExamSessionDetailsPage session={result.data} />;
}