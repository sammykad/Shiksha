"use server"

import { getActiveAcademicYearId } from '@/lib/academicYear';
import { createNoticeFormData, createNoticeSchema } from '@/lib/schemas';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUser } from '@/lib/user';

export const createNotice = async (data: createNoticeFormData) => {
  try {
    const validatedData = createNoticeSchema.parse(data);

    const [organizationId, user] = await Promise.all([
      getOrganizationId(),
      getCurrentUser(),
    ]);

    const academicYearId = await getActiveAcademicYearId();

    const notice = await prisma.notice.create({
      data: {
        noticeType: validatedData.noticeType,
        title: validatedData.title,
        isUrgent: validatedData.isUrgent,
        isPinned: validatedData.isPinned,
        summary: validatedData.summary,
        content: validatedData.content,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        targetRoles: validatedData.targetRoles,
        targetGrades: validatedData.targetGrades,
        targetSections: validatedData.targetSections,
        emailNotification: validatedData.emailNotification,
        pushNotification: validatedData.pushNotification,
        smsNotification: validatedData.smsNotification,
        whatsAppNotification: validatedData.whatsAppNotification,
        priority: validatedData.priority,
        status: 'PENDING_REVIEW',
        organizationId,
        academicYearId,
        createdBy:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.id || 'System',
        attachments: {
          createMany: {
            data: (validatedData.attachments || []).map((attachment) => ({
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
              fileUrl: attachment.url,
              publicId: attachment.publicId,
            })),
          },
        },
      },
    });
    return notice;
  } catch (error) {
    console.error('Error creating notice:', error);
    throw error instanceof Error ? error : new Error('Failed to create notice');
  }
};
