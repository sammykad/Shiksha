'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

// ─── Schema (mirrors client schema, re-validated server-side) ───────────────

const rowSchema = z.object({
  subjectId: z.string().min(1),
  gradeId: z.string().min(1),
  sectionId: z.string().min(1),
  isPrimary: z.boolean().default(false),
  weeklyPeriods: z.string().optional(),
});

const createAssignmentSchema = z.object({
  academicYearId: z.string().min(1),
  teacherId: z.string().min(1),
  rows: z.array(rowSchema).min(1),
});

type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

// ─── Return type used by modal ───────────────────────────────────────────────

interface ActionResult {
  success?: boolean;
  error?: string;
  message?: string;
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createTeachingAssignment(
  data: CreateAssignmentInput
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const parsed = createAssignmentSchema.safeParse(data);
    if (!parsed.success) {
      return { error: 'Invalid form data: ' + parsed.error.message };
    }

    const { teacherId, academicYearId, rows } = parsed.data;

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, organizationId, isActive: true },
    });
    if (!teacher) {
      return { error: 'Teacher not found or inactive.' };
    }

    let createdCount = 0;
    let duplicateCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        try {
          await tx.teachingAssignment.create({
            data: {
              organizationId,
              academicYearId,
              teacherId,
              subjectId: row.subjectId,
              gradeId: row.gradeId,
              sectionId: row.sectionId,
              status: 'ASSIGNED',
              // NOTE: isPrimary and weeklyPeriods are not in the current schema.
              // Add them to the TeachingAssignment model when ready:
              //   isPrimary     Boolean  @default(false)
              //   weeklyPeriods Int?
              // Then uncomment:
              // isPrimary: row.isPrimary,
              // weeklyPeriods: row.weeklyPeriods ? parseInt(row.weeklyPeriods) : null,
            },
          });
          createdCount++;
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002'
          ) {
            // Unique constraint violation — silently skip duplicate
            duplicateCount++;
            continue;
          }
          throw err;
        }
      }
    });

    revalidatePath('/dashboard/teaching-assignments');

    const message = duplicateCount > 0
      ? `Created ${createdCount} assignment(s). ${duplicateCount} duplicate(s) skipped.`
      : `Successfully created ${createdCount} assignment(s).`;

    return { success: true, message };
  } catch (error) {
    console.error('Error creating teaching assignments:', error);
    return { error: 'Failed to create teaching assignments. Please try again.' };
  }
}

// ─── Update status ────────────────────────────────────────────────────────────

export async function updateTeachingAssignmentStatus(
  assignmentId: string,
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'INACTIVE'
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id: assignmentId, organizationId },
    });
    if (!assignment) {
      return { error: 'Teaching assignment not found.' };
    }

    await prisma.teachingAssignment.update({
      where: { id: assignmentId },
      data: { status },
    });

    revalidatePath('/dashboard/teaching-assignments');
    return { success: true };
  } catch (error) {
    console.error('Error updating teaching assignment status:', error);
    return { error: 'Failed to update assignment status.' };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTeachingAssignment(
  assignmentId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id: assignmentId, organizationId },
    });
    if (!assignment) {
      return { error: 'Teaching assignment not found.' };
    }

    await prisma.teachingAssignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath('/dashboard/teaching-assignments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting teaching assignment:', error);
    return { error: 'Failed to delete assignment.' };
  }
}