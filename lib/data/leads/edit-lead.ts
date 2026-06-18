'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { Role } from '@/generated/prisma/enums';
import { editLeadFormData, editLeadSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function editLead(data: editLeadFormData) {
  try {
    const { orgId, orgRole } = await auth();

    if (orgRole !== Role.ADMIN && orgRole !== Role.TEACHER) {
      return { success: false, message: 'You do not have permission to edit leads. Only admins and teachers can edit leads.' };
    }

    const validatedData = editLeadSchema.parse(data);

    const lead = await prisma.lead.findFirst({
      where: { id: validatedData.id, organizationId: orgId },
    });
    if (!lead) return { success: false, message: 'Lead not found or does not belong to your organization.' };

    await prisma.lead.update({
      where: { id: validatedData.id },
      data: {
        studentName: validatedData.studentName,
        phone: validatedData.phone,
        enquiryFor: validatedData.enquiryFor,
        parentName: validatedData.parentName,
        email: validatedData.email,
        whatsappNumber: validatedData.whatsappNumber,
        currentSchool: validatedData.currentSchool,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        pinCode: validatedData.pinCode,
        source: validatedData.source,
        status: validatedData.status,
        priority: validatedData.priority,
        notes: validatedData.notes,
        requirements: validatedData.requirements,
        budgetRange: validatedData.budgetRange,
        communicationPreference: validatedData.communicationPreference,
      },
    });

    revalidatePath('/dashboard/leads');
    revalidatePath(`/dashboard/leads/${validatedData.id}/edit`);

    return { success: true, message: 'Lead updated successfully' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update lead',
    };
  }
}
