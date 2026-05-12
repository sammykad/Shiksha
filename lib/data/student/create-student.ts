'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { studentSchema } from '@/lib/schemas';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  AppError,
  ClerkUser,
  ParentInput,
  addMemberAndInvite,
  cleanupClerkUsers,
  extractErrorMessage,
  upsertClerkUser,
  upsertParentRecord,
  upsertUserRecord,
} from './student-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

type ValidatedStudent = z.infer<typeof studentSchema>;

// ─── Action ──────────────────────────────────────────────────────────────────

export async function createStudent(data: ValidatedStudent, leadId?: string) {
  const { userId: inviterUserId } = await auth();
  if (!inviterUserId) throw new AppError('Unauthenticated');

  const organizationId = await getOrganizationId();
  const client = await clerkClient();

  // Validate
  const parsed = studentSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  const input = parsed.data;
  const parents = input.parents ?? [];
  const createdClerkUserIds: string[] = [];

  try {
    // ── Student (Clerk) ──────────────────────────────────────────────────────

    const { user: studentClerkUser, created: studentCreated } = await upsertClerkUser(client, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.phoneNumber,
      role: 'STUDENT',
      externalIdPrefix: `student_${input.rollNumber}`,
      organizationId,
    });

    if (studentCreated) createdClerkUserIds.push(studentClerkUser.id);

    await addMemberAndInvite(client, {
      organizationId,
      userId: studentClerkUser.id,
      email: input.email,
      role: 'org:student',
      inviterUserId,
    });

    // ── Parents (Clerk) ──────────────────────────────────────────────────────

    const processedParents: Array<{ clerkUser: ClerkUser; data: ParentInput }> = [];

    for (const parentData of parents) {
      // Skip parent if email is missing (required for DB unique constraint)
      if (!parentData.email) {
        console.warn('Skipping parent record creation due to missing email:', parentData.firstName);
        continue;
      }

      const { user: parentClerkUser, created: parentCreated } = await upsertClerkUser(client, {
        email: parentData.email,
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        password: parentData.phoneNumber,
        role: 'PARENT',
        externalIdPrefix: `parent_${parentData.email}`,
        organizationId,
      });

      if (parentCreated) createdClerkUserIds.push(parentClerkUser.id);

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
      await upsertUserRecord(tx, {
        clerkId: studentClerkUser.id,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.phoneNumber,
        profileImage: input.profileImage || studentClerkUser.imageUrl || '',
        role: 'STUDENT',
        organizationId,
      });

      const newStudent = await tx.student.create({
        data: {
          userId: studentClerkUser.id,
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
          email: input.email,
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
            isPrimary: parentData.isPrimary,
            studentId: newStudent.id,
            parentId: parent.id,
          },
        });
      }
      // ✅ Convert lead — runs inside same transaction, rolls back if student creation fails
      if (leadId) {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            status: 'CONVERTED',
            convertedAt: new Date(),
            convertedToStudentId: newStudent.id, // ← proper link
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
            performedById: inviterUserId, // ← already available in scope
            performedAt: new Date(),
          },
        });
      }


      return newStudent;
    });

    revalidatePath('/dashboard/students');
    if (leadId) {
      revalidatePath(`/dashboard/leads/${leadId}`);
      revalidatePath('/dashboard/leads');
    }

    return { success: true, student, message: 'Student created successfully.' };

  } catch (error) {
    if (createdClerkUserIds.length > 0) {
      await cleanupClerkUsers(client, organizationId, createdClerkUserIds);
    }

    if (error instanceof AppError) throw error;

    throw new AppError(extractErrorMessage(error));
  }
}