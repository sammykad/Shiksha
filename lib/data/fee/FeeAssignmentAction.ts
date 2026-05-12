'use server';

import { feeAssignmentSchema } from '../../schemas';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getOrganizationId } from '../../organization';
import { revalidatePath } from 'next/cache';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { notify } from '@/lib/notifications/notify';
import { toISTDate } from '@/lib/utils';

export async function AssignFeeToStudents(data: z.infer<typeof feeAssignmentSchema>) {
  // ── 1. Validate input ──────────────────────────────────────────────────────
  const parsed = feeAssignmentSchema.safeParse(data);
  if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);

  // ── 2. Resolve org + academic year in parallel ─────────────────────────────
  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getCurrentAcademicYearId(),
  ]);

  const studentIds = Array.isArray(parsed.data.studentIds)
    ? parsed.data.studentIds
    : [parsed.data.studentIds];

  const dueDate = new Date(parsed.data.dueDate);
  const status = toISTDate(dueDate) < toISTDate() ? 'OVERDUE' : 'UNPAID';

  // ── 3. Fetch lookups before writing ───────────────────────────────────────
  // Always resolve org name + category before the DB write.
  // If these fail, we never write fees — no orphaned records.
  const [category, students] = await Promise.all([
    prisma.feeCategory.findUnique({
      where: { id: parsed.data.feeCategoryId },
      select: { name: true },
    }),
    prisma.student.findMany({
      where: { id: { in: studentIds }, organizationId },
      select: { id: true, fullName: true, firstName: true, lastName: true },
    }),
  ]);

  if (!category) throw new Error(`Fee category not found: ${parsed.data.feeCategoryId}`);

  const feeCategoryName = category.name;

  // ── 4. Create fees and get back real IDs ──────────────────────────────────
  const fees = await prisma.fee.createManyAndReturn({
    data: studentIds.map((studentId) => ({
      studentId,
      feeCategoryId: parsed.data.feeCategoryId,
      totalFee: parsed.data.feeAmount,
      pendingAmount: parsed.data.feeAmount,
      dueDate,
      status,
      organizationId,
      academicYearId,
    })),
    select: { id: true, studentId: true },
  });

  // ── 5. Map fee.id → studentId for O(1) lookup ─────────────────────────────
  const feeByStudentId = new Map(fees.map((f) => [f.studentId, f.id]));

  // ── 6. Fire notifications — one per student, fully isolated ───────────────
  const notificationResults = await Promise.allSettled(
    students.map((student) => {
      const feeId = feeByStudentId.get(student.id);

      // Guard: fee wasn't created for this student (e.g. duplicate constraint hit)
      if (!feeId) return Promise.resolve(null);

      return notify.fee.created({
        eventId: feeId,
        feeId,
        recipients: [{ studentId: student.id }],
        variables: {
          feeCategoryName,
          studentName: student.fullName ?? `${student.firstName} ${student.lastName}`.trim(),
          amount: parsed.data.feeAmount,
          paymentLink: 'fees/pay',
          dueDate,
          status,
        },
      });
    })
  );

  // ── 7. Surface notification failures to server logs (non-fatal) ───────────
  const failed = notificationResults.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  );
  if (failed.length > 0) {
    console.error(
      `[AssignFeeToStudents] ${failed.length}/${students.length} notification(s) failed`,
      failed.map((f) => f.reason)
    );
  }

  // ── 8. Revalidate affected pages ──────────────────────────────────────────
  revalidatePath('/dashboard/fees/admin/assign');
  revalidatePath('/dashboard/fees/student');

  return fees;
}
