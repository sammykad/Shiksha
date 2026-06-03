'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Role } from '@/generated/prisma/enums';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { updateStudentSchema } from '@/lib/schemas';
import { getCurrentUserId } from '@/lib/user';
import {
  AppError,
  dedupeInviteTargets,
  extractErrorMessage,
  sendOrganizationRoleInvitation,
  upsertParentRecord,
  upsertUserRecord,
} from './student-helpers';

type ValidatedUpdate = z.infer<typeof updateStudentSchema>;

export async function updateStudent(data: ValidatedUpdate) {
  const inviterUserId = await getCurrentUserId();
  if (!inviterUserId) throw new AppError('Unauthenticated');

  const organizationId = await getOrganizationId();

  const parsed = updateStudentSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  const input = parsed.data;
  const parents = input.parents ?? [];
  const parentInviteTargets = dedupeInviteTargets(
    parents
      .filter((parent) => Boolean(parent.email))
      .map((parent) => ({
        email: parent.email,
        role: Role.PARENT,
        skipIfActive: true,
        skipIfPending: true,
      }))
  );

  try {
    const student = await prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: { id: input.id, organizationId },
        data: {
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          motherName: input.motherName,
          fullName:
            input.fullName ||
            [input.firstName, input.middleName, input.lastName]
              .filter(Boolean)
              .join(' '),
          email: input.email,
          phoneNumber: input.phoneNumber,
          whatsAppNumber: input.whatsAppNumber,
          rollNumber: input.rollNumber,
          emergencyContact: input.emergencyContact,
          profileImage: input.profileImage,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          grade: { connect: { id: input.gradeId } },
          section: { connect: { id: input.sectionId } },
        },
      });

      await tx.user.update({
        where: { id: updatedStudent.userId },
        data: {
          email: input.email.trim().toLowerCase(),
          name: [input.firstName, input.lastName].filter(Boolean).join(' '),
          firstName: input.firstName,
          lastName: input.lastName,
          profileImage: input.profileImage ?? undefined,
          updatedAt: new Date(),
        },
      });

      await tx.parentStudent.deleteMany({ where: { studentId: input.id } });

      for (const parentData of parents) {
        if (!parentData.email) continue;

        const parentUser = await upsertUserRecord(tx, {
          email: parentData.email,
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          password: parentData.phoneNumber,
          profileImage: null,
          role: Role.PARENT,
          organizationId,
          createMembership: false,
        });

        const parent = await upsertParentRecord(tx, parentUser.id, organizationId, parentData);

        await tx.parentStudent.create({
          data: {
            relationship: parentData.relationship,
            isPrimary: parentData.isPrimary ?? false,
            studentId: updatedStudent.id,
            parentId: parent.id,
          },
        });
      }

      return updatedStudent;
    });

    let sentInvitations = 0;
    const failures: string[] = [];
    for (const target of parentInviteTargets) {
      try {
        const result = await sendOrganizationRoleInvitation({
          ...target,
          organizationId,
          inviterUserId,
        });

        if (result.sent) sentInvitations++;
      } catch (err) {
        console.error(`[Invitation Error] Failed to invite parent ${target.email}:`, err);
        failures.push(target.email);
      }
    }

    revalidatePath('/dashboard/students');

    if (failures.length > 0) {
      return {
        success: true,
        student,
        message: `Student updated successfully, but we couldn't send parent invitations to: ${failures.join(', ')}.`,
      };
    }

    return {
      success: true,
      student,
      message:
        sentInvitations > 0
          ? `Student updated successfully. ${sentInvitations} parent invitation${sentInvitations === 1 ? '' : 's'} refreshed.`
          : 'Student updated successfully.',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(extractErrorMessage(error));
  }
}
