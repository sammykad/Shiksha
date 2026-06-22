import { notFound, redirect } from 'next/navigation';
import { getOrganizationId } from '@/lib/organization';
import { HallTicketPDF } from '@/lib/pdf-generator/HallTicketPDF';
import { getCurrentUserByRole } from '@/lib/auth';
import { getHallTicketForStudentExam } from '@/lib/data/hall-ticket/get-hall-ticket-data';
import prisma from '@/lib/db';
import { EmptyState } from '@/components/ui/empty-state';
import { BookX, ArrowLeft } from 'lucide-react';

async function resolveStudentId(
  examId: string,
  organizationId: string,
): Promise<string> {
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role === 'STUDENT') {
    if (!currentUser.studentId) notFound();
    return currentUser.studentId;
  }

  if (currentUser.role === 'PARENT') {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, organizationId },
      select: { gradeId: true, sectionId: true },
    });
    if (!exam) notFound();

    const child = await prisma.student.findFirst({
      where: {
        id: { in: currentUser.studentIds },
        gradeId: exam.gradeId,
        sectionId: exam.sectionId,
        organizationId,
      },
      select: { id: true },
    });
    if (!child) notFound();
    return child.id;
  }

  redirect('/dashboard/exams');
}

export default async function HallTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;
  const organizationId = await getOrganizationId();
  const studentId = await resolveStudentId(examId, organizationId);

  const hallTicketData = await getHallTicketForStudentExam(studentId, examId);

  if (!hallTicketData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <EmptyState
          title="Hall Ticket Not Available"
          description="No hall ticket has been generated for this exam. Please contact the administration."
          icons={[BookX]}
          action={{
            label: "Back to Exam Details",
            href: `/dashboard/exams/${examId}`,
            icon: ArrowLeft,
          }}
        />
      </div>
    );
  }

  return <HallTicketPDF hallTicketData={hallTicketData}
  // onDownloadPDF={() => {
  //   // This could trigger a server action to generate/regenerate the PDF
  //   console.log('Download PDF requested');
  // }}
  />;;
}
