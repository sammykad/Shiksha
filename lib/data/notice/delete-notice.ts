'use server';

import { deleteMultipleFromCloudinary } from '@/lib/cloudinary-server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserByRole } from '@/lib/auth';

export const deleteNotice = async (noticeId: string) => {
  try {
    const [organizationId, { role }] = await Promise.all([
      getOrganizationId(),
      getCurrentUserByRole()
    ]);

    if (role !== 'ADMIN') {
      return { success: false, error: 'Only admins can delete notices' };
    }

    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, organizationId },
      include: { attachments: true },
    });

    if (!notice) {
      return { success: false, error: 'Notice not found or access denied' };
    }

    // 1. Delete attachments from Cloudinary (external service, not transactional)
    try {
      const publicIds = notice.attachments.map((att) => att.publicId);
      if (publicIds.length) {
        await deleteMultipleFromCloudinary(publicIds);
      }
    } catch (error) {
      console.error('Failed to delete attachments from Cloudinary:', error);
      // Continue with DB deletion even if Cloudinary fails
    }

    // 2 & 3. Delete attachments and notice in a single transaction
    await prisma.$transaction(async (tx) => {
      // Delete attachments from DB
      await tx.noticeAttachment.deleteMany({
        where: { noticeId: notice.id },
      });

      // Delete notice
      await tx.notice.delete({ where: { id: notice.id, organizationId } });
    });

    revalidatePath('/dashboard/notices');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete notice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};
