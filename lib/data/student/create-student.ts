'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Role } from '@/generated/prisma/enums';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { studentSchema } from '@/lib/schemas';
import {
  AppError,
  dedupeInviteTargets,
  extractErrorMessage,
  sendOrganizationRoleInvitation,
  upsertParentRecord,
  upsertUserRecord,
} from './student-helpers';

type ValidatedStudent = z.infer<typeof studentSchema>;

export async function createStudent(data: ValidatedStudent, leadId?: string) {
  const { userId: inviterUserId } = await auth();
  if (!inviterUserId) throw new AppError('Unauthenticated');

  const organizationId = await getOrganizationId();

  const parsed = studentSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  const input = parsed.data;
  const parents = input.parents ?? [];
  const studentEmail = input.email.trim().toLowerCase();
  const inviteTargets = dedupeInviteTargets([
    { email: studentEmail, role: Role.STUDENT },
    ...parents
      .filter((parent) => Boolean(parent.email))
      .map((parent) => ({
        email: parent.email,
        role: Role.PARENT,
        skipIfActive: true,
      })),
  ]);

  try {
    const student = await prisma.$transaction(async (tx) => {
      const studentUser = await upsertUserRecord(tx, {
        email: studentEmail,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.phoneNumber,
        profileImage: input.profileImage ?? null,
        role: Role.STUDENT,
        organizationId,
        createMembership: false,
      });

      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: studentUser.id,
            organizationId,
          },
        },
        select: {
          status: true,
        },
      });

      if (existingMembership?.status === 'ACTIVE') {
        throw new AppError(`${studentEmail} is already an active member of this organization.`);
      }

      const newStudent = await tx.student.create({
        data: {
          userId: studentUser.id,
          organizationId,
          rollNumber: input.rollNumber,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          motherName: input.motherName,
          fullName:
            input.fullName ??
            [input.firstName, input.middleName, input.lastName]
              .filter(Boolean)
              .join(' '),
          email: studentEmail,
          phoneNumber: input.phoneNumber,
          whatsAppNumber: input.whatsAppNumber,
          sectionId: input.sectionId,
          gradeId: input.gradeId,
          gender: input.gender,
          profileImage: input.profileImage,
          dateOfBirth: new Date(input.dateOfBirth),
          emergencyContact: input.emergencyContact,
        },
      });

      for (const parentData of parents) {
        if (!parentData.email) {
          console.warn('Skipping parent record creation due to missing email:', parentData.firstName);
          continue;
        }

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

        const parent = await upsertParentRecord(tx, parentUser.id, parentData);

        await tx.parentStudent.create({
          data: {
            relationship: parentData.relationship,
            isPrimary: parentData.isPrimary,
            studentId: newStudent.id,
            parentId: parent.id,
          },
        });
      }

      if (leadId) {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            status: 'CONVERTED',
            convertedAt: new Date(),
            convertedToStudentId: newStudent.id,
            nextFollowUpAt: null,
          },
        });

        await tx.leadActivity.create({
          data: {
            leadId,
            type: 'OTHER',
            title: 'Lead converted to student',
            description: `Student account created for ${newStudent.firstName} ${newStudent.lastName}`,
            outcome: 'CONVERTED',
            performedById: inviterUserId,
            performedAt: new Date(),
          },
        });
      }

      return newStudent;
    });

    let sentInvitations = 0;
    for (const target of inviteTargets) {
      const result = await sendOrganizationRoleInvitation({
        ...target,
        organizationId,
        inviterUserId,
      });

      if (result.sent) sentInvitations++;
    }

    revalidatePath('/dashboard/students');
    if (leadId) {
      revalidatePath(`/dashboard/leads/${leadId}`);
      revalidatePath('/dashboard/leads');
    }

    return {
      success: true,
      student,
      message:
        sentInvitations === 1
          ? `Student created and invitation sent to ${studentEmail}.`
          : `Student created and ${sentInvitations} invitations sent.`,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(extractErrorMessage(error));
  }
}
