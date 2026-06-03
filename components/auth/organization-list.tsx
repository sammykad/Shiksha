"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Role } from "@/generated/prisma/enums";
import { authClient } from "@/lib/auth-client";
import {
    getUserOrganizationInvitations,
    getUserOrganizationMemberships,
} from "@/lib/data/organization/get-memberships";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";
import { BrandAuthHeader } from "./_components/brand";
import { OrganizationAvatar } from "./_components/organization-avatar";
import {
    CreateOrganizationRow,
    OrganizationActionButton,
    OrganizationRow,
} from "./_components/organization-row";
import { UserAvatar } from "./_components/user-avatar";
import type { OrganizationLike, OrgInvitation } from "./types";

interface OrganizationListProps {
    /** Hide the card shell/header/footer for compact surfaces like the sidebar switcher. */
    compact?: boolean;
    /** Show personal account option. */
    hidePersonalAccount?: boolean;
    /** Show the create organization row. */
    hideCreateOrganizationButton?: boolean;
    /** Exclude the active organization when a parent already renders it separately. */
    excludeActiveOrganization?: boolean;
    /** Show each organization role under the organization name. */
    showOrganizationRole?: boolean;
    /** Show the default check/arrow affordance on organization rows. */
    showDefaultActions?: boolean;
    /** Use larger rows for the sidebar/navbar switcher popover. */
    spaciousRows?: boolean;
    /** Redirect after selecting personal account. */
    afterSelectPersonalUrl?: string;
    /** Redirect after selecting an organization. */
    afterSelectOrganizationUrl?: string;
    /** Called when the create organization row is clicked. */
    onCreateOrganization?: () => void;
    /** Called when manage is clicked on the active organization row. */
    onManageOrganization?: () => void;
    /** Kept for API compatibility with the old component. */
    applicationName?: string;
}

export function OrganizationList({
    compact = false,
    hidePersonalAccount = false,
    hideCreateOrganizationButton = false,
    excludeActiveOrganization = false,
    showOrganizationRole = true,
    showDefaultActions = true,
    spaciousRows = false,
    afterSelectPersonalUrl,
    afterSelectOrganizationUrl,
    onCreateOrganization,
    onManageOrganization,
}: OrganizationListProps) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: orgs } = authClient.useListOrganizations();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [orgRoles, setOrgRoles] = useState<Record<string, string>>({});

    const user = session?.user;
    const orgList = ((orgs as OrganizationLike[] | undefined) ?? []).filter((org) => {
        if (!excludeActiveOrganization) return true;
        return org.id !== activeOrg?.id;
    });
    const [invitations, setInvitations] = useState<OrgInvitation[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadInvitations() {
            if (!user) {
                setInvitations([]);
                return;
            }

            try {
                const userInvitations = await getUserOrganizationInvitations();
                if (cancelled) return;
                setInvitations(userInvitations);
            } catch {
                if (cancelled) return;
                setInvitations([]);
            }
        }

        loadInvitations();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const fetchMemberships = useCallback(async () => {
        try {
            const memberships = await getUserOrganizationMemberships();
            const map: Record<string, string> = {};
            for (const m of memberships) {
                map[m.organizationId] = m.role;
            }
            setOrgRoles(map);
        } catch {
            // Server action may fail if auth context is not ready
        }
    }, []);

    useEffect(() => {
        fetchMemberships();
    }, [fetchMemberships]);

    const handleSelectOrg = async (orgId: string) => {
        if (loadingId) return;
        setLoadingId(orgId);
        try {
            const { error } = await authClient.organization.setActive({
                organizationId: orgId,
            });
            if (error) {
                toast.error("Failed to switch organization.");
                return;
            }
            fetchMemberships();
            if (afterSelectOrganizationUrl) {
                router.push(afterSelectOrganizationUrl);
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleSelectPersonal = async () => {
        if (loadingId) return;
        setLoadingId("personal");
        try {
            await authClient.organization.setActive({ organizationId: null as unknown as string });
        } catch {
            // Some Better Auth versions may not support null. Personal context is best-effort.
        } finally {
            setLoadingId(null);
        }
        if (afterSelectPersonalUrl) {
            router.push(afterSelectPersonalUrl);
        }
    };

    const handleAcceptInvitation = async (invitationId: string) => {
        if (loadingId) return;
        setLoadingId(invitationId);
        try {
            const { error } = await authClient.organization.acceptInvitation({
                invitationId,
            });
            if (error) {
                toast.error("Failed to accept invitation.");
            } else {
                toast.success("Invitation accepted!");
                setInvitations((current) => current.filter((invitation) => invitation.id !== invitationId));
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoadingId(null);
        }
    };

    const rows = (
        <div>
            {!hidePersonalAccount && user && (
                <OrganizationRow
                    muted
                    title="Personal account"
                    avatar={
                        <UserAvatar
                            name={user.name ?? user.email ?? "U"}
                            image={user.image}
                        />
                    }
                    loading={loadingId === "personal"}
                    active={!activeOrg}
                    hideDefaultAction={!showDefaultActions}
                    spacious={spaciousRows}
                    onClick={handleSelectPersonal}
                />
            )}

            {orgList.map((org) => {
                const isActive = org.id === activeOrg?.id;
                const role = orgRoles[org.id] ?? org.role ?? undefined;
                const activeAction = isActive && onManageOrganization && role?.toUpperCase() === Role.ADMIN ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onManageOrganization();
                        }}
                        className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
                    >
                        Manage
                    </button>
                ) : undefined;

                return (
                    <OrganizationRow
                        key={org.id}
                        title={org.name}
                        subtitle={showOrganizationRole ? role : undefined}
                        avatar={
                            <OrganizationAvatar
                                name={org.name}
                                logo={org.logo}
                                size={spaciousRows ? 52 : 36}
                                className={spaciousRows ? "size-[52px] rounded-[8px]" : undefined}
                            />
                        }
                        loading={loadingId === org.id}
                        active={isActive}
                        hideDefaultAction={!showDefaultActions}
                        spacious={spaciousRows}
                        action={activeAction}
                        onClick={() => handleSelectOrg(org.id)}
                    />
                );
            })}

            {invitations.map((invitation) => (
                <OrganizationRow
                    key={invitation.id}
                    title={invitation.organizationName}
                    subtitle={invitation.role}
                    avatar={
                        <OrganizationAvatar
                            name={invitation.organizationName}
                            logo={invitation.organizationLogo}
                        />
                    }
                    loading={loadingId === invitation.id}
                    action={
                        <OrganizationActionButton
                            disabled={loadingId === invitation.id}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleAcceptInvitation(invitation.id);
                            }}
                        >
                            Join
                        </OrganizationActionButton>
                    }
                    onClick={() => handleAcceptInvitation(invitation.id)}
                />
            ))}

            {!hideCreateOrganizationButton && onCreateOrganization && (
                <CreateOrganizationRow onClick={onCreateOrganization} />
            )}
        </div>
    );

    if (compact) return rows;

    return (
        <AuthCard data-slot="organization-list">
            <AuthCardPanel>
                <BrandAuthHeader />
                {rows}
            </AuthCardPanel>
            <AuthFooter />
        </AuthCard>
    );
}
