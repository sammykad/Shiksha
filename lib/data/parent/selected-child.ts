'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/user';

const COOKIE_KEY = 'selectedChildId';
const COOKIE_OPTIONS = {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ChildSummary = {
    id: string;         // Student.id
    firstName: string;
    lastName: string;
    fullName: string | null;
    profileImage: string | null;
    rollNumber: string;
    relationship: string;
    grade: { id: string; grade: string };
    section: { id: string; name: string };
};

// ─────────────────────────────────────────────
// Cookie helpers (called from Server Components)
// ─────────────────────────────────────────────

export async function getSelectedChildId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_KEY)?.value ?? null;
}

export async function setSelectedChildId(studentId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEY, studentId, COOKIE_OPTIONS);
}

export async function clearSelectedChildId(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_KEY);
}

// ─────────────────────────────────────────────
// DB query — fetch children for the logged-in parent
// ─────────────────────────────────────────────

export async function getChildrenForParent(userId: string): Promise<ChildSummary[]> {
    const parentStudents = await prisma.parentStudent.findMany({
        where: {
            parent: { userId },
        },
        orderBy: [
            { isPrimary: 'desc' }, // primary child first
            { student: { firstName: 'asc' } },
        ],
        select: {
            relationship: true,
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    profileImage: true,
                    rollNumber: true,
                    grade: { select: { id: true, grade: true } },
                    section: { select: { id: true, name: true } },
                },
            },
        },
    });

    return parentStudents.map(({ relationship, student }) => ({
        ...student,
        relationship,
    }));
}

// ─────────────────────────────────────────────
// Server Action — called from Client Component (ChildSwitcher)
// ─────────────────────────────────────────────

export async function selectChildAction(studentId: string): Promise<void> {
    const userId = await getCurrentUserId();

    // Guard: ensure the student actually belongs to this parent
    const ownership = await prisma.parentStudent.findFirst({
        where: {
            studentId,
            parent: { userId },
        },
        select: { id: true },
    });

    if (!ownership) throw new Error('Child not found for this parent');

    await setSelectedChildId(studentId);
}