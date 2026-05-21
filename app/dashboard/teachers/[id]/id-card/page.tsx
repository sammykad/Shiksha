import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateIdCard } from '@/lib/data/id-card/generate-id-card';
import { getTeacherIdCard } from '@/lib/data/id-card/get-id-card';
import { PageHeader } from '@/components/ui/page-header';
import { CreditCard, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import IdCardPreview from '@/components/dashboard/id-card/IdCardPreview';
import { ID_CARD_MOTTO } from '@/constants';

export const metadata = {
  title: 'Teacher ID Card | Shiksha Cloud',
};

async function generateCardAction(formData: FormData) {
  'use server';
  const teacherId = formData.get('teacherId') as string;
  const academicYear = new Date().getMonth() >= 3
    ? `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`
    : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(-2)}`;

  await generateIdCard({ teacherId, academicYear });
  revalidatePath(`/dashboard/teachers/${teacherId}/id-card`);
}

export default async function TeacherIdCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: teacherId } = await params;
  const { orgId } = await auth();

  const [teacher, organization] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: teacherId, organizationId: orgId },
      select: {
        id: true,
        employeeCode: true,
        joinedAt: true,
        user: { select: { firstName: true, lastName: true, profileImage: true } },
        profile: { select: { qualification: true, dateOfBirth: true } },
      },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, logo: true, organizationType: true, contactPhone: true, website: true },
    }),
  ]);

  if (!teacher) return notFound();

  const existingCardResult = await getTeacherIdCard(teacherId);
  const existingCard = existingCardResult.success ? existingCardResult.card : null;

  const details: Record<string, string> = {};
  if (teacher.employeeCode) details['Emp Code'] = teacher.employeeCode;
  if (teacher.profile?.qualification) details['Qualification'] = teacher.profile.qualification;
  if (teacher.joinedAt) details['Joined'] = teacher.joinedAt.toLocaleDateString('en-IN');
  if (teacher.profile?.dateOfBirth) details['DOB'] = teacher.profile.dateOfBirth.toLocaleDateString('en-IN');

  return (
    <div className="space-y-6 px-2">
      <PageHeader
        title="Teacher ID Card"
        description={`${teacher.user.firstName} ${teacher.user.lastName}`}
        icon={CreditCard}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/teachers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers
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
                  firstName: teacher.user.firstName,
                  lastName: teacher.user.lastName,
                  details: {
                    'Department': teacher.profile?.qualification || 'N/A',
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
                role="TEACHER"
                motto={ID_CARD_MOTTO.TEACHER}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <CreditCard className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No ID card generated yet</p>
                <form action={generateCardAction}>
                  <input type="hidden" name="teacherId" value={teacherId} />
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
            <CardTitle>Teacher Information</CardTitle>
            <CardDescription>Details that appear on the ID card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={teacher.user.profileImage || undefined} />
                <AvatarFallback className="text-lg">
                  {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {teacher.user.firstName} {teacher.user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {teacher.employeeCode || 'No employee code'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {Object.entries(details).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
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
                    <input type="hidden" name="teacherId" value={teacherId} />
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
