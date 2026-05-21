'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function revokeIdCard(cardId: string, reason?: string) {
  try {
    const { userId, orgId, orgRole } = await auth();

    if (orgRole !== 'ADMIN') return { success: false, error: 'Only administrators can revoke ID cards' };

    const idCard = await prisma.idCard.findUnique({ where: { id: cardId, organizationId: orgId } });
    if (!idCard) return { success: false, error: 'Card not found' };
    if (idCard.revokedAt) return { success: false, error: 'Card already revoked' };

    await prisma.idCard.update({ where: { id: cardId }, data: { revokedAt: new Date(), revokedBy: userId, revokedReason: reason || 'Revoked by admin' } });
    return { success: true };
  } catch (err) {
    console.error('ID card revocation error:', err);
    return { success: false, error: 'Failed to revoke ID card.' };
  }
}

export async function reissueIdCard(cardId: string) {
  try {
    const { userId, orgId, orgRole } = await auth();

    if (orgRole !== 'ADMIN') return { success: false, error: 'Only administrators can reissue ID cards' };

    const existing = await prisma.idCard.findUnique({ where: { id: cardId, organizationId: orgId } });
    if (!existing) return { success: false, error: 'Card not found' };

    await prisma.idCard.update({
      where: { id: cardId },
      data: { revokedAt: new Date(), revokedBy: existing.generatedBy, revokedReason: 'Re-issued' },
    });

    const { generateIdCard } = await import('./generate-id-card');
    return await generateIdCard({
      studentId: existing.studentId || undefined,
      teacherId: existing.teacherId || undefined,
      academicYear: existing.academicYear,
    });
  } catch (err) {
    console.error('ID card re-issue error:', err);
    return { success: false, error: 'Failed to re-issue ID card.' };
  }
}
