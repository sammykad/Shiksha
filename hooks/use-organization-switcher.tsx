"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Role } from "@/generated/prisma/enums";

export type OrgRole = Role;

export interface OrgMember {
    id: string;
    userId: string;
    role: OrgRole;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

export interface OrgWithMembers {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    members?: OrgMember[];
}

function getAuthErrorMessage(error: unknown, fallback: string) {
    if (!error || typeof error !== "object") return fallback;
    const maybeError = error as { message?: unknown; code?: unknown; status?: unknown; statusText?: unknown };
    const parts = [
        typeof maybeError.message === "string" ? maybeError.message : null,
        typeof maybeError.code === "string" ? maybeError.code : null,
        typeof maybeError.status === "number" ? `HTTP ${maybeError.status}` : null,
        typeof maybeError.statusText === "string" ? maybeError.statusText : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" - ") : fallback;
}

export function useOrganizationSwitcher() {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: orgs } = authClient.useListOrganizations();

    const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [invitations, setInvitations] = useState<
        { id: string; email: string; role: OrgRole; status: string }[]
    >([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const switchOrganization = async (organizationId: string) => {
        if (organizationId === activeOrg?.id) return;
        setLoadingOrgId(organizationId);
        try {
            const { error } = await authClient.organization.setActive({
                organizationId,
            });
            if (error) {
                toast.error("Failed to switch organization");
            } else {
                toast.success("Organization switched");
            }
        } catch {
            toast.error("Failed to switch organization");
        } finally {
            setLoadingOrgId(null);
        }
    };

    const openManage = async () => {
        if (!activeOrg?.id) return;
        setIsManageOpen(true);
        setLoadingMembers(true);
        try {
            const { data, error } =
                await authClient.organization.getFullOrganization({
                    query: { organizationId: activeOrg.id },
                });
            if (error) {
                toast.error("Failed to load organization details");
            } else {
                setMembers((data?.members as OrgMember[]) ?? []);
                setInvitations(
                    (data as unknown as { invitations?: typeof invitations })
                        ?.invitations ?? []
                );
            }
        } catch {
            toast.error("Failed to load organization details");
        } finally {
            setLoadingMembers(false);
        }
    };

    const closeManage = () => setIsManageOpen(false);

    const inviteMember = async (email: string, role: OrgRole) => {
        if (!activeOrg?.id) return;
        const { error } = await authClient.organization.inviteMember({
            organizationId: activeOrg.id,
            email,
            role,
        });
        if (error) {
            toast.error("Failed to send invitation");
        } else {
            toast.success(`Invitation sent to ${email}`);
            await openManage(); // refresh
        }
    };

    const updateMemberRole = async (memberId: string, role: OrgRole) => {
        if (!activeOrg?.id) return;
        const { error } = await authClient.organization.updateMemberRole({
            organizationId: activeOrg.id,
            memberId,
            role,
        });
        if (error) {
            toast.error("Failed to update role");
        } else {
            toast.success("Role updated");
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role } : m))
            );
        }
    };

    const removeMember = async (memberId: string) => {
        if (!activeOrg?.id) return;
        const { error } = await authClient.organization.removeMember({
            organizationId: activeOrg.id,
            memberIdOrEmail: memberId,
        });
        if (error) {
            toast.error(getAuthErrorMessage(error, "Failed to remove member"));
        } else {
            toast.success("Member removed");
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        }
    };

    const leaveOrganization = async () => {
        if (!activeOrg?.id || !session?.user?.id) return;
        const { error } = await authClient.organization.leave({
            organizationId: activeOrg.id,
        });
        if (error) {
            toast.error("Failed to leave organization");
        } else {
            toast.success("Left organization");
            closeManage();
        }
    };

    const currentUserRole = members.find(
        (m) => m.userId === session?.user?.id
    )?.role;

    const isAdmin =
        currentUserRole === Role.ADMIN;

    return {
        session,
        activeOrg,
        organizations: (orgs as OrgWithMembers[]) ?? [],
        loadingOrgId,
        switchOrganization,
        isManageOpen,
        openManage,
        closeManage,
        members,
        invitations,
        loadingMembers,
        inviteMember,
        updateMemberRole,
        removeMember,
        leaveOrganization,
        currentUserRole,
        isAdmin,
    };
}
