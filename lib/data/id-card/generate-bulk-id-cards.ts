'use server';

import { auth } from '@/lib/auth';
import { generateIdCard } from './generate-id-card';

const BATCH_SIZE = 5;

export async function generateBulkIdCards(params: {
  studentIds?: string[];
  teacherIds?: string[];
  academicYear: string;
}) {
  try {
    const { orgId, orgRole } = await auth();

    if (!orgId) return { success: false, error: 'No organization context' };
    if (orgRole !== 'ADMIN') return { success: false, error: 'Only administrators can generate ID cards' };

    const allIds = [
      ...(params.studentIds?.filter(Boolean).map(id => ({ id, type: 'student' as const })) || []),
      ...(params.teacherIds?.filter(Boolean).map(id => ({ id, type: 'teacher' as const })) || []),
    ];

    if (allIds.length === 0) return { success: false, error: 'No valid IDs provided' };

    const uniqueIds = new Map<string, { id: string; type: 'student' | 'teacher' }>();
    for (const item of allIds) {
      uniqueIds.set(item.id, item);
    }
    const deduplicatedIds = Array.from(uniqueIds.values());

    let succeeded = 0;
    let failed = 0;
    let reissued = 0;
    const errors: string[] = [];

    for (let i = 0; i < deduplicatedIds.length; i += BATCH_SIZE) {
      const batch = deduplicatedIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(item =>
          generateIdCard({
            studentId: item.type === 'student' ? item.id : undefined,
            teacherId: item.type === 'teacher' ? item.id : undefined,
            academicYear: params.academicYear,
          })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            succeeded++;
            if (result.value.reissued) reissued++;
          } else {
            failed++;
            if (result.value.error) errors.push(result.value.error);
          }
        } else {
          failed++;
          errors.push(result.reason?.message || 'Unknown error');
        }
      }
    }

    return { success: true, total: deduplicatedIds.length, succeeded, failed, reissued, errors: errors.slice(0, 5) };
  } catch (err) {
    console.error('Bulk ID card generation error:', err);
    return { success: false, error: 'Failed to generate bulk ID cards.' };
  }
}
