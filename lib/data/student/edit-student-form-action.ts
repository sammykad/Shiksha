'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { StudentProfileFormData, studentProfileSchema } from '@/lib/schemas';
import prisma from '@/lib/db';
import { getCurrentUserByRole, getOrganizationId } from '@/lib/auth';

export async function editStudentProfileForm(
  studentId: string,
  data: StudentProfileFormData
) {
  try {
    const userRole = await getCurrentUserByRole();
    const organizationId = await getOrganizationId();
    const validatedData = studentProfileSchema.parse(data);
    const isOwnProfile =
      userRole.role === 'STUDENT' && userRole.studentId === studentId;

    let isStudentParent = false;
    if (userRole.role === 'PARENT') {
      const parentStudentLink = await prisma.parentStudent.findFirst({
        where: {
          parentId: userRole.parentId,
          studentId: studentId,
        },
        select: { id: true },
      });
      isStudentParent = !!parentStudentLink;
    }

    if (!isOwnProfile && !isStudentParent) {
      return {
        success: false,
        error: "You don't have permission to edit this profile.",
      };
    }
    await prisma.student.update({
      where: { id: studentId, organizationId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        middleName: validatedData.middleName,
        motherName: validatedData.motherName,
        dateOfBirth: validatedData.dateOfBirth,
        bloodGroup: validatedData.bloodGroup,
        address: validatedData.address,
        caste: validatedData.caste,
        subCaste: validatedData.subCaste,
        gender: validatedData.gender,
        phoneNumber: validatedData.phoneNumber,
        whatsAppNumber: validatedData.whatsAppNumber,
        email: validatedData.email,
        emergencyContact: validatedData.emergencyContact,
        profileImage: validatedData.profileImage,
        fullName: `${validatedData.firstName} ${validatedData.middleName ? validatedData.middleName + ' ' : ''}${validatedData.lastName}`,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/settings');
    return {
      success: true,
      message: 'Profile updated successfully!',
    };
  } catch (error) {
    console.error('Error updating student profile:', error);

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
