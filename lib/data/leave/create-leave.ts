'use server';

import { getCurrentAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { notify } from '@/lib/notifications/notify';
// import { notify, sendNotification } from '@/lib/notifications/engine';
import { getOrganizationId } from '@/lib/organization';
import {
  LeaveCreateFromData,
  LeaveCreateSchema,
  ReviewActionFormData,
  ReviewActionSchema,
} from '@/lib/schemas';
import { getCurrentUser } from '@/lib/user';
import { revalidatePath } from 'next/cache';

function daysBetweenInclusive(start: Date, end: Date) {
  const ms = 1000 * 60 * 60 * 24;
  const startUTC = new Date(
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  );
  const endUTC = new Date(
    Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  );
  const diff = Math.round((endUTC.getTime() - startUTC.getTime()) / ms);
  return diff + 1;
}

export async function createLeaveAction(formData: LeaveCreateFromData) {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();

  const validatedData = LeaveCreateSchema.parse(formData);

  const totalDays = daysBetweenInclusive(
    validatedData.startDate,
    validatedData.endDate
  );

  // Wrap in transaction: create leave + initial timeline entry
  const result = await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.create({
      data: {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        totalDays,
        reason: validatedData.reason,
        type: validatedData.type,
        emergencyContact: validatedData.emergencyContact,
        currentStatus: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectedNote: null,
        userId: user.id,
        academicYearId,
        organizationId,
      },
    });

    await tx.leaveStatusTimeline.create({
      data: {
        leaveId: leave.id,
        status: 'PENDING',
        note: 'Applied',
        changedBy: user.id,
      },
    });

    return leave;
  });

  revalidatePath('/dashboard/leaves');
  revalidatePath('/dashboard/leaves/manage');

  return { id: result.id };
}

export async function approveLeaveAction(formDataData: ReviewActionFormData) {
  const parsed = ReviewActionSchema.safeParse(formDataData);
  if (!parsed.success) throw new Error('Invalid input');
  const { leaveId, rejectedNote } = parsed.data;

  const user = await getCurrentUser();
  const leave = await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.findUniqueOrThrow({
      where: { id: leaveId },
      select: {
        id: true,
        userId: true,
        totalDays: true,
        startDate: true,
        endDate: true,
        type: true,
        appliedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await tx.leave.update({
      where: { id: leaveId },
      data: {
        currentStatus: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        rejectedNote: null,
      },
    });

    await tx.leaveStatusTimeline.create({
      data: {
        leaveId,
        status: 'APPROVED',
        note: rejectedNote ?? 'Approved',
        changedBy: user.id,
      },
    });
    await tx.leaveStatusTimeline.create({
      data: {
        leaveId,
        status: 'APPROVED',
        note: rejectedNote ?? 'Approved',
        changedBy: user.id,
      },
    });

    return leave;
  });

  await notify.leave.approved({
    leaveId: leave.id,
    recipients: [{ userId: leave.userId }],
    variables: {
      appliedBy: `${leave.appliedBy.firstName} ${leave.appliedBy.lastName}`.trim(),
      leaveType: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      approvedBy: `${user.firstName} ${user.lastName}`.trim(),
      approvedAt: new Date(),
    },
  })

  revalidatePath('/dashboard/leaves');
  revalidatePath('/dashboard/leaves/manage');
  return { ok: true };
}

export async function rejectLeaveAction(formData: ReviewActionFormData) {
  const parsed = ReviewActionSchema.safeParse(formData);
  if (!parsed.success) throw new Error('Invalid input');
  const { leaveId, rejectedNote } = parsed.data;

  const user = await getCurrentUser();

  const leave = await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.findUniqueOrThrow({
      where: { id: leaveId },
      select: {
        id: true,
        userId: true,
        totalDays: true,
        startDate: true,
        endDate: true,
        reason: true,
        type: true,
        appliedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await tx.leave.update({
      where: { id: leaveId },
      data: {
        currentStatus: 'REJECTED',
        approvedBy: null,
        approvedAt: null,
        rejectedNote: rejectedNote ?? null,
      },
    });

    await tx.leaveStatusTimeline.create({
      data: {
        leaveId,
        status: 'REJECTED',
        note: rejectedNote ?? 'Rejected',
        changedBy: user.id,
      },
    });
    return leave;
  });

  await notify.leave.rejected({
    leaveId: leave.id,
    recipients: [{ userId: leave.userId }],
    variables: {
      appliedBy: `${leave.appliedBy.firstName} ${leave.appliedBy.lastName}`.trim(),
      leaveType: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      reason: leave.reason ?? undefined,
      rejectedNote: rejectedNote ?? "Rejected by system",
      rejectedBy: `${user.firstName} ${user.lastName}`.trim(),
    },
  });

  revalidatePath('/dashboard/leaves');
  revalidatePath('/dashboard/leaves/manage');
  return { ok: true };
}
