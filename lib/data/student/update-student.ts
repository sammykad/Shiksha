'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { updateStudentSchema } from '@/lib/schemas';
import { getCurrentUserId } from '@/lib/user';
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  AppError,
  ClerkUser,
  ParentInput,
  addMemberAndInvite,
  extractErrorMessage,
  upsertClerkUser,
  upsertParentRecord,
  upsertUserRecord,
} from './student-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

type ValidatedUpdate = z.infer<typeof updateStudentSchema>;

// ─── Action ──────────────────────────────────────────────────────────────────

export async function updateStudent(data: ValidatedUpdate) {
  const inviterUserId = await getCurrentUserId();
  if (!inviterUserId) throw new AppError('Unauthenticated');

  const organizationId = await getOrganizationId();
  const client = await clerkClient();

  // Validate
  const parsed = updateStudentSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  const input = parsed.data;
  const parents = input.parents ?? [];

  try {
    // ── Parents (Clerk) ──────────────────────────────────────────────────────
    // For each parent in the updated list: upsert Clerk user, add to org, send invite.
    // addMemberAndInvite already skips duplicate invitations — so existing parents
    // with unchanged emails won't get re-invited, but a new/changed email will.

    const processedParents: Array<{ clerkUser: ClerkUser; data: ParentInput }> = [];

    for (const parentData of parents) {
      const { user: parentClerkUser } = await upsertClerkUser(client, {
        email: parentData.email,
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        password: parentData.phoneNumber,
        role: 'PARENT',
        externalIdPrefix: `parent_${parentData.email}`,
        organizationId,
      });

      await addMemberAndInvite(client, {
        organizationId,
        userId: parentClerkUser.id,
        email: parentData.email,
        role: 'org:parent',
        inviterUserId,
      });

      processedParents.push({ clerkUser: parentClerkUser, data: parentData });
    }

    // ── Database Transaction ─────────────────────────────────────────────────

    const student = await prisma.$transaction(async (tx) => {
      // Update core student record
      const updatedStudent = await tx.student.update({
        where: { id: input.id },
        data: {
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          motherName: input.motherName,
          fullName:
            input.fullName ??
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

      // Replace all parent links for this student
      await tx.parentStudent.deleteMany({ where: { studentId: input.id } });

      for (const { clerkUser, data: parentData } of processedParents) {
        const parentUser = await upsertUserRecord(tx, {
          clerkId: clerkUser.id,
          email: parentData.email,
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          password: parentData.phoneNumber,
          profileImage: clerkUser.imageUrl || '',
          role: 'PARENT',
          organizationId,
        });

        const parent = await upsertParentRecord(tx, parentUser.id, parentData);

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

    revalidatePath('/dashboard/students');

    return { success: true, student, message: 'Student updated successfully.' };

  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(extractErrorMessage(error));
  }
}