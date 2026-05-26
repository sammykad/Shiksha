'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { getOrganizationId } from '../../organization';

interface FeeCategoryData {
  name: string;
  description?: string;
}

export async function createFeeCategory(data: FeeCategoryData) {
  const organizationId = await getOrganizationId();
  try {
    const result = await prisma.feeCategory.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId,
      },
    });

    revalidatePath('/dashboard/fees/admin/fee-categories');
    revalidatePath('/dashboard/fees/admin/assign');
    return result;
  } catch (error) {
    console.error('Failed to create fee category:', error);
    throw new Error('Failed to create fee category');
  }
}

export async function updateFeeCategory(id: string, data: FeeCategoryData) {
  try {
    const organizationId = await getOrganizationId();
    const result = await prisma.feeCategory.update({
      where: { id, organizationId },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    revalidatePath('/dashboard/fees/admin/fee-categories');
    return result;
  } catch (error) {
    console.error('Failed to update fee category:', error);
    throw new Error('Failed to update fee category');
  }
}

export async function deleteFeeCategory(id: string) {
  try {
    const organizationId = await getOrganizationId();
    await prisma.feeCategory.delete({
      where: { id, organizationId },
    });

    revalidatePath('/dashboard/fees/admin/fee-categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete fee category:', error);
    throw new Error('Failed to delete fee category');
  }
}
