'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { pdf } from '@react-pdf/renderer';
import { IdCardPDF } from './id-card-pdf';
import { generateVerificationQRCode } from './qr-code-generator';
import { ID_CARD_MOTTO } from '@/constants';

export async function downloadIdCardPdf(cardId: string) {
  try {
    const { orgId } = await auth();

    const idCard = await prisma.idCard.findUnique({
      where: { id: cardId, organizationId: orgId },
      include: {
        student: {
          select: {
            firstName: true, lastName: true, profileImage: true, rollNumber: true,
            grade: { select: { grade: true } },
            section: { select: { name: true } },
          },
        },
        teacher: {
          select: {
            employeeCode: true,
            user: { select: { firstName: true, lastName: true, profileImage: true } },
            profile: { select: { qualification: true } },
          },
        },
        organization: {
          select: { name: true, logo: true, contactPhone: true, website: true },
        },
      },
    });

    if (!idCard) return { success: false, error: 'Card not found' };
    if (idCard.revokedAt) return { success: false, error: 'Cannot download revoked card' };

    const isStudent = !!idCard.studentId;
    const role = isStudent ? 'STUDENT' : 'TEACHER';

    const personData = isStudent
      ? {
          firstName: idCard.student?.firstName ?? '',
          lastName: idCard.student?.lastName ?? '',
          profileImage: idCard.student?.profileImage ?? undefined,
        }
      : {
          firstName: idCard.teacher?.user.firstName ?? '',
          lastName: idCard.teacher?.user.lastName ?? '',
          profileImage: idCard.teacher?.user.profileImage ?? undefined,
        };

    const details: Record<string, string> = isStudent
      ? {
          'Grade': `${idCard.student?.grade?.grade ?? '?'} - ${idCard.student?.section?.name ?? '?'}`,
          'Roll No.': idCard.student?.rollNumber ?? 'N/A',
          'Card No.': idCard.cardNumber,
        }
      : {
          'Employee Code': idCard.teacher?.employeeCode ?? 'N/A',
          'Department': idCard.teacher?.profile?.qualification ?? 'N/A',
          'Card No.': idCard.cardNumber,
        };

    const ROLE_COLORS: Record<string, { primary: string }> = {
      STUDENT: { primary: '#059669' },
      TEACHER: { primary: '#2563eb' },
      ADMIN: { primary: '#7c3aed' },
      PARENT: { primary: '#d97706' },
    };
    const qrColor = ROLE_COLORS[role]?.primary || '#0f172a';
    const qrCodeDataUrl = await generateVerificationQRCode(idCard.cardNumber, qrColor);

    const pdfDoc = pdf(
      <IdCardPDF
        person={{ firstName: personData.firstName, lastName: personData.lastName, profileImage: personData.profileImage, details }}
        organization={{
          name: idCard.organization?.name ?? 'School',
          logo: idCard.organization?.logo ?? undefined,
          phone: idCard.organization?.contactPhone ?? undefined,
          website: idCard.organization?.website ?? undefined,
        }}
        cardNumber={idCard.cardNumber}
        academicYear={idCard.academicYear}
        role={role}
        motto={ID_CARD_MOTTO[role] || ID_CARD_MOTTO.STUDENT}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    );

    const pdfStream = await pdfDoc.toBuffer();
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Uint8Array);
    }
    const pdfBuffer = Buffer.concat(chunks);

    const base64 = pdfBuffer.toString('base64');

    return { success: true, base64, filename: `${idCard.cardNumber}.pdf` };
  } catch (err) {
    console.error('PDF download error:', err);
    return { success: false, error: 'Failed to generate PDF.' };
  }
}
