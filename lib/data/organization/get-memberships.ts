"use server";

import prisma from "@/lib/prisma-base";
import { auth, getSession } from "@/lib/auth";

export type OrgMembershipEntry = {
    organizationId: string;
    role: string;
};

export type OrgInvitationEntry = {
    id: string;
    organizationId: string;
    organizationName: string;
    organizationLogo: string | null;
    role: string;
    status: string;
};

export async function getUserOrganizationMemberships(): Promise<OrgMembershipEntry[]> {
    const { userId } = await auth();

    const memberships = await prisma.membership.findMany({
        where: { userId, status: "ACTIVE" },
        select: {
            organizationId: true,
            role: true,
        },
    });

    return memberships;
}

export async function getUserOrganizationMembershipRole(organizationId: string): Promise<string | null> {
    const session = await getSession();

    const membership = await prisma.membership.findFirst({
        where: {
            organizationId,
            userId: session.user.id,
            status: "ACTIVE",
        },
        select: {
            role: true,
        },
    });

    return membership?.role ?? null;
}

export async function getUserOrganizationInvitations(): Promise<OrgInvitationEntry[]> {
    const session = await getSession();

    const invitations = await prisma.invitation.findMany({
        where: {
            email: {
                equals: session.user.email,
                mode: "insensitive",
            },
            status: {
                not: "accepted",
            },
        },
        select: {
            id: true,
            organizationId: true,
            role: true,
            status: true,
            organization: {
                select: {
                    name: true,
                    logo: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return invitations.map((invitation) => ({
        id: invitation.id,
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        organizationLogo: invitation.organization.logo,
        role: invitation.role,
        status: invitation.status,
    }));
}
