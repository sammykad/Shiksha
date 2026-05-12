import prisma from '@/lib/db';

type ScaleContext = {
  examGradingScaleId?: string | null;
  sessionGradingScaleId?: string | null;
  organizationId: string;
};

/**
 * Resolves the effective grading scale for an exam based on the hierarchy:
 * 1. Exam-specific scale (highest priority)
 * 2. Session-level scale
 * 3. Organization default scale (lowest priority)
 * 
 * Returns the scale with all its bands included and ordered.
 */
export async function resolveEffectiveGradingScale(
  ctx: ScaleContext,
  tx = prisma,
) {
  // Priority 1 & 2: Exam or Session specific scale
  const scaleId = ctx.examGradingScaleId ?? ctx.sessionGradingScaleId;

  if (scaleId) {
    const scale = await tx.gradingScale.findUnique({
      where: { id: scaleId },
      include: {
        bands: {
          orderBy: {
            minPercentage: 'desc',
          },
        },
      },
    });
    
    if (scale) return scale;
  }

  // Priority 3: Organization default scale (lowest priority)
  // We look for the scale marked as 'isDefault' for this organization
  return tx.gradingScale.findFirst({
    where: { 
      organizationId: ctx.organizationId, 
      isDefault: true 
    },
    include: {
      bands: {
        orderBy: {
          minPercentage: 'desc',
        },
      },
    },
  });
}
