import { notFound, redirect } from 'next/navigation';
import { getCurrentUserByRole } from '@/lib/auth';
import { getExamSessionDetails } from '@/lib/data/exam/get-exam-session-details';
import { ExamSessionDetailsPage } from '@/components/dashboard/exam/ExamSessionDetailsPage';

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role === 'PARENT' || currentUser.role === 'STUDENT') {
    redirect('/dashboard/exams');
  }

  const result = await getExamSessionDetails(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ExamSessionDetailsPage session={result.data} />;
}