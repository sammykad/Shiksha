import prisma from '@/lib/db';
import { DEFAULT_GRADING_SCALE } from '@/lib/data/exam/grade-utils';

type ScaleContext = {
  examGradingScaleId?: string | null;
  sessionGradingScaleId?: string | null;
  organizationId: string;
};

export async function resolveEffectiveGradingScale(
  ctx: ScaleContext,
  tx = prisma,
) {
  const scaleId = ctx.examGradingScaleId ?? ctx.sessionGradingScaleId;

  if (scaleId) {
    const scale = await tx.gradingScale.findUnique({
      where: { id: scaleId },
      include: { bands: { orderBy: { minPercentage: 'desc' } } },
    });
    if (scale) return scale;
  }

  const orgDefault = await tx.gradingScale.findFirst({
    where: { organizationId: ctx.organizationId, isDefault: true },
    include: { bands: { orderBy: { minPercentage: 'desc' } } },
  });

  return orgDefault ?? DEFAULT_GRADING_SCALE;
}
