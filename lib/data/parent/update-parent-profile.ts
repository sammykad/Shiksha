'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parentProfileSchema, type ParentProfileFormData } from '@/lib/schemas';
import prisma from '@/lib/db';
import { getCurrentUserByRole, getOrganizationId } from '@/lib/auth';

export async function updateParentProfile(data: ParentProfileFormData) {
  try {
    const userRole = await getCurrentUserByRole();
    const organizationId = await getOrganizationId();

    if (userRole.role !== 'PARENT') {
      return {
        success: false,
        error: 'Only parents can update their profile.',
      };
    }

    const validatedData = parentProfileSchema.parse(data);

    await prisma.parent.update({
      where: { id: userRole.parentId, organizationId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        whatsAppNumber: validatedData.whatsAppNumber,
      },
    });

    if (validatedData.profileImage) {
      await prisma.user.update({
        where: { id: userRole.userId },
        data: { profileImage: validatedData.profileImage },
      });
    }

    revalidatePath('/dashboard/settings');
    return {
      success: true,
      message: 'Profile updated successfully!',
    };
  } catch (error) {
    console.error('Error updating parent profile:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid form data. Please check your inputs.',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}
