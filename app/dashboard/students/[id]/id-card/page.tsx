import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateIdCard } from '@/lib/data/id-card/generate-id-card';
import { getStudentIdCard } from '@/lib/data/id-card/get-id-card';
import { PageHeader } from '@/components/ui/page-header';
import { CreditCard, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import IdCardPreview from '@/components/dashboard/id-card/IdCardPreview';
import { ID_CARD_MOTTO } from '@/constants';

export const metadata = {
  title: 'Student ID Card | Shiksha Cloud',
};

async function generateCardAction(formData: FormData) {
  'use server';
  const studentId = formData.get('studentId') as string;
  const academicYear = new Date().getMonth() >= 3
    ? `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`
    : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(-2)}`;

  await generateIdCard({ studentId, academicYear });
  revalidatePath(`/dashboard/students/${studentId}/id-card`);
}

export default async function StudentIdCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;
  const { orgId, orgRole, userId } = await auth();

  const [student, organization] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId, organizationId: orgId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        profileImage: true,
        rollNumber: true,
        dateOfBirth: true,
        bloodGroup: true,
        grade: { select: { grade: true } },
        section: { select: { name: true } },
        userId: true,
      },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, logo: true, organizationType: true, contactPhone: true, website: true },
    }),
  ]);

  if (!student) return notFound();

  if (orgRole === 'STUDENT' && student.userId !== userId) {
    redirect('/dashboard');
  }

  const existingCardResult = await getStudentIdCard(studentId);
  const existingCard = existingCardResult.success ? existingCardResult.card : null;

  return (
    <div className="space-y-6 px-2">
      <PageHeader
        title="Student ID Card"
        description={`${student.firstName} ${student.lastName} — ${student.grade.grade} ${student.section.name}`}
        icon={CreditCard}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/students/${studentId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Student
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ID Card Preview</CardTitle>
            <CardDescription>Live preview of the generated ID card</CardDescription>
          </CardHeader>
          <CardContent>
            {existingCard ? (
              <IdCardPreview
                person={{
                  firstName: student.firstName,
                  lastName: student.lastName,
                  details: {
                    'Grade': `${student.grade.grade} - ${student.section.name}`,
                    'ID No.': existingCard.cardNumber,
                  },
                }}
                organization={organization ? {
                  name: organization.name,
                  address: undefined,
                  phone: organization.contactPhone || undefined,
                  website: organization.website || undefined,
                } : undefined}
                cardNumber={existingCard.cardNumber}
                academicYear={existingCard.academicYear}
                role="STUDENT"
                motto={ID_CARD_MOTTO.STUDENT}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <CreditCard className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No ID card generated yet</p>
                <form action={generateCardAction}>
                  <input type="hidden" name="studentId" value={studentId} />
                  <Button type="submit" className="mt-3">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Generate ID Card
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Details that appear on the ID card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.profileImage || undefined} />
                <AvatarFallback className="text-lg">
                  {student.firstName[0]}{student.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {student.firstName} {student.middleName} {student.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {student.grade.grade} - {student.section.name} &middot; Roll: {student.rollNumber}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium">{student.dateOfBirth.toLocaleDateString('en-IN')}</span>
              </div>
              {student.bloodGroup && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Blood Group</span>
                  <Badge variant="secondary">{student.bloodGroup}</Badge>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Roll Number</span>
                <span className="font-medium">{student.rollNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium">{student.grade.grade} - {student.section.name}</span>
              </div>
            </div>

            {existingCard && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm py-2 border-t pt-3">
                  <span className="text-muted-foreground">Card Number</span>
                  <span className="font-mono text-xs">{existingCard.cardNumber}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Academic Year</span>
                  <span className="font-medium">{existingCard.academicYear}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {existingCard.cardPdfUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={existingCard.cardPdfUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  )}
                  <form action={generateCardAction}>
                    <input type="hidden" name="studentId" value={studentId} />
                    <Button type="submit" size="sm" variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Re-generate
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
