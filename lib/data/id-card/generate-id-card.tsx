'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { UTApi, UTFile } from 'uploadthing/server';
import { IdCardPDF, ROLE_COLORS } from './id-card-pdf';
import '@/lib/pdf-generator/tw';
import { generateVerificationQRCode } from './qr-code-generator';
import { ID_CARD_MOTTO } from '@/constants';

const utapi = new UTApi();

export async function generateIdCard(params: {
  studentId?: string;
  teacherId?: string;
  academicYear: string;
}) {
  try {
    const { userId, orgId, orgRole } = await auth();
    const organizationId = orgId;

    if (!params.studentId && !params.teacherId) {
      return { success: false, error: 'Either studentId or teacherId is required' };
    }

    if (orgRole === 'STUDENT' && params.studentId) {
      const student = await prisma.student.findUnique({ where: { id: params.studentId, organizationId } });
      if (!student || student.userId !== userId) return { success: false, error: 'Unauthorized' };
    }

    if (orgRole === 'PARENT' && params.studentId) {
      const link = await prisma.parentStudent.findFirst({ where: { studentId: params.studentId, parent: { userId, organizationId } } });
      if (!link) return { success: false, error: 'Unauthorized' };
    }

    let personData = null;
    let role: 'STUDENT' | 'TEACHER' = 'STUDENT';
    const details: Record<string, string> = {};

    if (params.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: params.studentId, organizationId },
        select: { firstName: true, lastName: true, profileImage: true, rollNumber: true, grade: { select: { grade: true } }, section: { select: { name: true } } },
      });
      if (!student) return { success: false, error: 'Student not found' };
      role = 'STUDENT';
      personData = { firstName: student.firstName, lastName: student.lastName, profileImage: student.profileImage };
      details['Grade'] = `${student.grade?.grade ?? '?'} - ${student.section?.name ?? '?'}`;
    }

    if (params.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: params.teacherId, organizationId },
        select: { employeeCode: true, user: { select: { firstName: true, lastName: true, profileImage: true } }, profile: { select: { qualification: true } } },
      });
      if (!teacher) return { success: false, error: 'Teacher not found' };
      role = 'TEACHER';
      personData = { firstName: teacher.user.firstName, lastName: teacher.user.lastName, profileImage: teacher.user.profileImage };
      details['Department'] = teacher.profile?.qualification || 'N/A';
    }

    const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true, logo: true, organizationType: true, contactPhone: true, website: true } });
    if (!organization) return { success: false, error: 'Organization not found' };

    const existingCard = await prisma.idCard.findFirst({
      where: params.studentId
        ? { studentId: params.studentId, organizationId, academicYear: params.academicYear }
        : { teacherId: params.teacherId, organizationId, academicYear: params.academicYear },
      orderBy: { version: 'desc' },
    });

    const prefix = organizationId.slice(-4).toUpperCase();
    const type = params.studentId ? 'S' : 'T';
    const cardNumber = existingCard
      ? existingCard.cardNumber
      : `${prefix}-${params.academicYear}-${type}-${String(await prisma.idCard.count({ where: { organizationId } }) + 1).padStart(5, '0')}`;

    const qrColor = ROLE_COLORS[role]?.primary || '#0f172a';
    const qrCodeDataUrl = await generateVerificationQRCode(cardNumber, qrColor);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(
        <IdCardPDF
          person={{ firstName: personData!.firstName, lastName: personData!.lastName, profileImage: personData!.profileImage || undefined, details }}
          organization={{ name: organization.name, logo: organization.logo || undefined, phone: organization.contactPhone || undefined, website: organization.website || undefined }}
          cardNumber={cardNumber}
          academicYear={params.academicYear}
          role={role}
          motto={ID_CARD_MOTTO[role] || ID_CARD_MOTTO.STUDENT}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
      return { success: false, error: 'Failed to generate PDF.' };
    }

    const pdfUrl = null; // TODO: Re-enable UploadThing upload when ready
    // const utFile = new UTFile([new Blob([new Uint8Array(pdfBuffer)])], `${cardNumber}.pdf`, { type: 'application/pdf' });
    // const uploadResult = await utapi.uploadFiles(utFile);
    // if (!uploadResult.data) {
    //   console.error('UploadThing upload failed:', uploadResult.error);
    //   return { success: false, error: 'Failed to upload PDF' };
    // }
    // const pdfUrl = uploadResult.data.url;

    const idCard = existingCard
      ? await prisma.idCard.update({
        where: { id: existingCard.id },
        data: { version: { increment: 1 }, qrCodeUrl: qrCodeDataUrl, cardPdfUrl: pdfUrl, revokedAt: null, revokedBy: null, revokedReason: null },
      })
      : await prisma.idCard.create({
        data: { cardNumber, studentId: params.studentId, teacherId: params.teacherId, organizationId, academicYear: params.academicYear, qrCodeUrl: qrCodeDataUrl, cardPdfUrl: pdfUrl, generatedBy: userId },
      });

    return { success: true, card: { ...idCard, cardPdfUrl: idCard.cardPdfUrl || undefined, qrCodeUrl: idCard.qrCodeUrl || undefined, cardImageUrl: idCard.cardImageUrl || undefined }, reissued: !!existingCard };
  } catch (err) {
    console.error('ID card generation error:', err);
    return { success: false, error: 'Failed to generate ID card.' };
  }
}
