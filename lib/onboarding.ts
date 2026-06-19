"use server"

import basePrisma from '@/lib/prisma-base';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentAcademicYearIdSafe } from '@/lib/academicYear';
import type { WizardData } from '@/components/onboarding/types';

export async function getOnboardingStatus() {
    const organizationId = await getOrganizationId();
    const academicYearId = await getCurrentAcademicYearIdSafe();
    return {
        organizationId,
        academicYearId,
        needsOnboarding: !academicYearId,
    };
}

export async function getOnboardingProgress(): Promise<WizardData> {
    const organizationId = await getOrganizationId();

    const [
        organization,
        gradesRaw,
        academicYear,
        studentsCount,
        teachersCount,
        subjectsCount,
        feeCatsCount,
        parentsCount,
        docsCount,
        assignmentsCount,
        feeAssignmentsCount
    ] = await Promise.all([
        basePrisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                name: true,
                organizationType: true,
                contactEmail: true,
                contactPhone: true,
            },
        }),
        basePrisma.grade.findMany({
            where: { organizationId },
            select: {
                id: true,
                grade: true,
                section: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        }),
        basePrisma.academicYear.findFirst({
            where: { organizationId, isCurrent: true },
            select: { id: true },
        }),
        basePrisma.student.count({ where: { organizationId } }),
        basePrisma.teacher.count({ where: { organizationId } }),
        basePrisma.subject.count({ where: { organizationId } }),
        basePrisma.feeCategory.count({ where: { organizationId } }),
        basePrisma.parentStudent.count({ where: { student: { organizationId } } }),
        basePrisma.studentDocument.count({ where: { organizationId } }),
        basePrisma.teachingAssignment.count({ where: { organizationId } }),
        basePrisma.fee.count({ where: { organizationId } }),
    ]);

    return {
        orgId: organizationId,
        orgName: organization?.name ?? '',
        orgType: (organization?.organizationType ?? undefined) as WizardData['orgType'],
        orgEmail: organization?.contactEmail ?? '',
        orgPhone: organization?.contactPhone ?? '',
        hasOrg: !!organization,
        academicYearId: academicYear?.id ?? null,
        grades: gradesRaw.map((g) => ({
            id: g.id,
            name: g.grade,
            sections: g.section.map((s) => ({ id: s.id, name: s.name })),
        })),
        studentsCount,
        teachersCount,
        subjectsCount,
        feeCategoriesCount: feeCatsCount,
        parentsCount,
        documentsCount: docsCount,
        teachingAssignmentsCount: assignmentsCount,
        feeAssignmentsCount,
    };
}
