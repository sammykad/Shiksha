'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function getAllIdCards(academicYear?: string) {
  try {
    const { orgId } = await auth();

    const cards = await prisma.idCard.findMany({
      where: {
        organizationId: orgId,
        ...(academicYear ? { academicYear } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, profileImage: true, rollNumber: true, grade: { select: { grade: true } }, section: { select: { name: true } } } },
        teacher: { select: { id: true, employeeCode: true, user: { select: { firstName: true, lastName: true, profileImage: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      cards: cards.map(c => ({
        id: c.id,
        cardNumber: c.cardNumber,
        academicYear: c.academicYear,
        version: c.version,
        createdAt: c.createdAt,
        qrCodeUrl: c.qrCodeUrl || undefined,
        cardPdfUrl: c.cardPdfUrl || undefined,
        cardImageUrl: c.cardImageUrl || undefined,
        revokedAt: c.revokedAt,
        revokedReason: c.revokedReason,
        role: c.studentId ? 'STUDENT' as const : 'TEACHER' as const,
        personName: c.student
          ? `${c.student.firstName ?? ''} ${c.student.lastName ?? ''}`.trim() || 'Unknown'
          : c.teacher?.user
            ? `${c.teacher.user.firstName ?? ''} ${c.teacher.user.lastName ?? ''}`.trim() || 'Unknown'
            : 'Unknown',
        personDetail: c.student
          ? `${c.student.grade?.grade ?? '?'} - ${c.student.section?.name ?? '?'} · ${c.student.rollNumber ?? 'N/A'}`
          : c.teacher?.employeeCode ? `Emp: ${c.teacher.employeeCode}` : 'No employee code',
        personImage: c.student?.profileImage || c.teacher?.user?.profileImage || null,
        personFirstName: c.student?.firstName ?? c.teacher?.user?.firstName ?? '',
        personLastName: c.student?.lastName ?? c.teacher?.user?.lastName ?? '',
        studentGrade: c.student?.grade?.grade ?? null,
        studentSection: c.student?.section?.name ?? null,
        studentRollNumber: c.student?.rollNumber ?? null,
        teacherEmployeeCode: c.teacher?.employeeCode ?? null,
      })),
    };
  } catch (err) {
    console.error('Get ID cards error:', err);
    return { success: false, error: 'Failed to fetch ID cards.', cards: [] };
  }
}

export async function getExistingCardStatus(params: { studentIds?: string[]; teacherIds?: string[]; academicYear: string }) {
  try {
    const { orgId } = await auth();

    const conditions: Record<string, unknown>[] = [];
    if (params.studentIds?.length) conditions.push({ studentId: { in: params.studentIds } });
    if (params.teacherIds?.length) conditions.push({ teacherId: { in: params.teacherIds } });

    const cards = await prisma.idCard.findMany({
      where: {
        organizationId: orgId,
        academicYear: params.academicYear,
        ...(conditions.length > 0 ? { OR: conditions } : {}),
      },
      select: { studentId: true, teacherId: true, version: true, revokedAt: true },
    });

    const map = new Map<string, { version: number; revoked: boolean }>();
    for (const card of cards) {
      const id = card.studentId || card.teacherId;
      if (id) map.set(id, { version: card.version, revoked: !!card.revokedAt });
    }

    return { success: true, map };
  } catch (err) {
    console.error('Get existing card status error:', err);
    return { success: false, map: new Map() };
  }
}

export async function getStudentIdCard(studentId: string) {
  try {
    const { orgId } = await auth();
    const card = await prisma.idCard.findFirst({ where: { studentId, organizationId: orgId, revokedAt: null }, orderBy: { version: 'desc' } });
    return { success: true, card: card ? { ...card, qrCodeUrl: card.qrCodeUrl || undefined, cardPdfUrl: card.cardPdfUrl || undefined } : null };
  } catch (err) {
    console.error('Get student ID card error:', err);
    return { success: false, error: 'Failed to fetch student ID card.', card: null };
  }
}

export async function getTeacherIdCard(teacherId: string) {
  try {
    const { orgId } = await auth();
    const card = await prisma.idCard.findFirst({ where: { teacherId, organizationId: orgId, revokedAt: null }, orderBy: { version: 'desc' } });
    return { success: true, card: card ? { ...card, qrCodeUrl: card.qrCodeUrl || undefined, cardPdfUrl: card.cardPdfUrl || undefined } : null };
  } catch (err) {
    console.error('Get teacher ID card error:', err);
    return { success: false, error: 'Failed to fetch teacher ID card.', card: null };
  }
}
