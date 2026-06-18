// app/actions/lead-assignment.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AssignLeadFormData, assignLeadSchema } from '@/lib/schemas';
import { getCurrentUserId } from '@/lib/user';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { Role } from '@/generated/prisma/enums';

export async function assignLead(data: AssignLeadFormData) {
  try {
    const currentUserId = await getCurrentUserId();

    const validatedData = assignLeadSchema.parse(data);

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
      select: { id: true, assignedToUserId: true },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // Verify assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: validatedData.assignedToUserId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!assignedUser) {
      return { success: false, error: 'Assigned user not found' };
    }

    // Update lead assignment
    const updatedLead = await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: {
        assignedToUserId: validatedData.assignedToUserId,
        assignedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Create an activity for the assignment
    await prisma.leadActivity.create({
      data: {
        leadId: validatedData.leadId,
        type: 'OTHER',
        title: 'Lead assignment updated',
        description: `Lead assigned to ${assignedUser.firstName} ${assignedUser.lastName}`,
        performedById: currentUserId,
        performedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/leads/${validatedData.leadId}`);
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      message: 'Lead assigned successfully',
      data: updatedLead,
    };
  } catch (error) {
    console.error('Error assigning lead:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to assign lead',
    };
  }
}

export async function unassignLead(leadId: string) {
  try {
    const currentUserId = await getCurrentUserId();

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, assignedToUserId: true },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }
    // Update lead to remove assignment
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedToUserId: null,
        assignedAt: null,
      },
    });

    // Create an activity for the unassignment
    await prisma.leadActivity.create({
      data: {
        leadId: leadId,
        type: 'OTHER',
        title: 'Lead unassigned',
        description: 'Lead removed from current assignment',
        performedById: currentUserId,
        performedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/leads/${leadId}`);
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      message: 'Lead unassigned successfully',
      data: updatedLead,
    };
  } catch (error) {
    console.error('Error unassigning lead:', error);
    return {
      success: false,
      error: 'Failed to unassign lead',
    };
  }
}

export async function getAvailableMembers() {
  try {
    const { orgRole, orgId } = await auth();

    if (!orgId) {
      return { success: false, error: 'No organization selected' };
    }

    if (orgRole !== Role.ADMIN && orgRole !== Role.TEACHER) {
      return { success: false, error: 'Only admins and teachers can assign leads' };
    }

    const memberships = await prisma.membership.findMany({
      where: {
        organizationId: orgId,
        status: 'ACTIVE',
        role: { in: ['ADMIN', 'TEACHER'] },
        user: { isActive: true },
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: [{ user: { firstName: 'asc' } }, { user: { lastName: 'asc' } }],
    });

    const mappedUsers = memberships
      .filter((m) => m.user !== null)
      .map((m) => ({
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        profileImage: m.user.profileImage,
        role: m.role,
      }));

    return { success: true, data: mappedUsers };
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      success: false,
      error: 'Failed to fetch members',
    };
  }
}
