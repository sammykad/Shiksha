'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { revalidatePath } from 'next/cache';
import { RoundingRule, PointsMode } from '@/generated/prisma/enums';

/**
 * Fetch all grading scales for the current organization
 */
export async function getGradingScales() {
  const organizationId = await getOrganizationId();

  try {
    const scales = await prisma.gradingScale.findMany({
      where: {
        organizationId,
      },
      include: {
        bands: {
          orderBy: {
            minPercentage: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: scales };
  } catch (error) {
    console.error('Failed to fetch grading scales:', error);
    return { success: false, error: 'Failed to fetch grading scales' };
  }
}

/**
 * Get a single grading scale by ID
 */
export async function getGradingScaleById(id: string) {
  const organizationId = await getOrganizationId();

  try {
    const scale = await prisma.gradingScale.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        bands: {
          orderBy: {
            minPercentage: 'desc',
          },
        },
      },
    });

    if (!scale) {
      return { success: false, error: 'Grading scale not found' };
    }

    return { success: true, data: scale };
  } catch (error) {
    console.error('Failed to fetch grading scale:', error);
    return { success: false, error: 'Failed to fetch grading scale' };
  }
}

export interface CreateGradingScaleInput {
  name: string;
  rounding: RoundingRule;
  passThreshold: number;
  pointsMode: PointsMode;
  allowGrace: boolean;
  maxGraceMarks: number;
  isDefault?: boolean;
  bands: Array<{
    label: string;
    minPercentage: number;
    maxPercentage: number;
    points?: number | null;
    description?: string | null;
  }>;
}

export interface UpdateGradingScaleInput {
  name?: string;
  rounding?: RoundingRule;
  passThreshold?: number;
  pointsMode?: PointsMode;
  allowGrace?: boolean;
  maxGraceMarks?: number;
  isDefault?: boolean;
  bands?: Array<{
    id?: string;
    label: string;
    minPercentage: number;
    maxPercentage: number;
    points?: number | null;
    description?: string | null;
  }>;
}

/**
 * Create a new grading scale with bands
 */
export async function createGradingScale(data: CreateGradingScaleInput) {
  const organizationId = await getOrganizationId();

  try {
    // If this is set to default, unset others first
    if (data.isDefault) {
      await prisma.gradingScale.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const scale = await prisma.gradingScale.create({
      data: {
        name: data.name,
        rounding: data.rounding,
        passThreshold: data.passThreshold,
        pointsMode: data.pointsMode,
        allowGrace: data.allowGrace,
        maxGraceMarks: data.maxGraceMarks,
        isDefault: data.isDefault || false,
        organizationId,
        bands: {
          create: data.bands,
        },
      },
      include: {
        bands: true,
      },
    });

    revalidatePath('/dashboard/admin/settings/grading');
    return { success: true, data: scale };
  } catch (error) {
    console.error('Failed to create grading scale:', error);
    return { success: false, error: 'Failed to create grading scale' };
  }
}

/**
 * Update an existing grading scale and its bands
 */
export async function updateGradingScale(
  id: string,
  data: UpdateGradingScaleInput
) {
  const organizationId = await getOrganizationId();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // If this is being set to default, unset others
      if (data.isDefault === true) {
        await tx.gradingScale.updateMany({
          where: { organizationId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      // Update main scale
      const scale = await tx.gradingScale.update({
        where: { id, organizationId },
        data: {
          name: data.name,
          rounding: data.rounding,
          passThreshold: data.passThreshold,
          pointsMode: data.pointsMode,
          allowGrace: data.allowGrace,
          maxGraceMarks: data.maxGraceMarks,
          isDefault: data.isDefault,
        },
      });

      // Update bands if provided
      if (data.bands) {
        await tx.gradeBand.deleteMany({
          where: { gradingScaleId: id },
        });

        await tx.gradeBand.createMany({
          data: data.bands.map((b) => ({
            label: b.label,
            minPercentage: b.minPercentage,
            maxPercentage: b.maxPercentage,
            points: b.points,
            description: b.description,
            gradingScaleId: id,
          })),
        });
      }

      return scale;
    });

    revalidatePath('/dashboard/admin/settings/grading');
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to update grading scale:', error);
    return { success: false, error: 'Failed to update grading scale' };
  }
}

/**
 * Set a grading scale as the organization default
 */
export async function setOrganizationDefaultGradingScale(scaleId: string) {
  const organizationId = await getOrganizationId();

  try {
    await prisma.$transaction([
      prisma.gradingScale.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.gradingScale.update({
        where: { id: scaleId, organizationId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath('/dashboard/admin/settings/grading');
    return { success: true };
  } catch (error) {
    console.error('Failed to set default grading scale:', error);
    return { success: false, error: 'Failed to set default grading scale' };
  }
}
