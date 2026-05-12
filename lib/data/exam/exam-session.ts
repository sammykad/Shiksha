'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserId } from '@/lib/user';
import { revalidatePath } from 'next/cache';

export async function createExamSession(data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    academicYearId: string;
}) {
    const organizationId = await getOrganizationId();
    const userId = await getCurrentUserId();

    try {
        const session = await prisma.examSession.create({
            data: {
                organizationId,
                academicYearId: data.academicYearId,
                title: data.title,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                createdAt: new Date(),
                createdBy: userId || 'system',
            },
        });

        revalidatePath('/dashboard/exam-sessions');
        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to create exam session:', error);
        return { success: false, error: 'Failed to create exam session' };
    }
}

export async function updateExamSession(id: string, data: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    try {
        const session = await prisma.examSession.update({
            where: { id },
            data,
        });

        revalidatePath('/dashboard/exam-sessions');
        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to update exam session:', error);
        return { success: false, error: 'Failed to update exam session' };
    }
}

export async function deleteExamSession(id: string) {

    try {
        await prisma.examSession.delete({
            where: { id },
        });
        revalidatePath('/dashboard/exam-sessions');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete exam session:', error);
        return { success: false, error: 'Failed to delete exam session' };
    }
}
