"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Role } from "@/generated/prisma/enums";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { OrgInvitation } from "./types";
import { cn } from "@/lib/utils";

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
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: orgs, isPending: isOrgsLoading, refetch: refetchOrgs } = authClient.useListOrganizations();

    // Fetch invitations manually - this is a Promise, not a hook
    const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
    const [isInvitationsLoading, setIsInvitationsLoading] = useState(true);

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const user = session?.user;
    const userId = user?.id;
    // Filter organizations if needed - no type cast required
    const orgList = (orgs ?? []).filter((org) => {
        if (!excludeActiveOrganization) return true;
        return org.id !== activeOrg?.id;
    });
    const isLoading = isSessionLoading || isOrgsLoading || isInvitationsLoading;

    const handleSelectOrg = async (orgId: string) => {
        if (loadingId) return;
        setLoadingId(orgId);
        try {
            const { error } = await authClient.organization.setActive({
                organizationId: orgId,
            });
            if (error) {
                toast.error("Failed to switch organization.");
            } else {
                if (afterSelectOrganizationUrl) {
                    router.push(afterSelectOrganizationUrl);
                }
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
            await authClient.organization.setActive({ organizationId: null });
            if (afterSelectPersonalUrl) {
                router.push(afterSelectPersonalUrl);
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoadingId(null);
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
                const refreshedInvites = await authClient.organization.listUserInvitations();
                if (refreshedInvites.data) setInvitations(refreshedInvites.data);
                await refetchOrgs();
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoadingId(null);
        }
    };
    // Fetch invitations on mount
    useEffect(() => {
        let cancelled = false;
        async function loadInvitations() {
            if (!userId) {
                setInvitations([]);
                setIsInvitationsLoading(false);
                return;
            }
            setIsInvitationsLoading(true);
            try {
                const { data: invitedUser } = await authClient.organization.listUserInvitations();
                if (cancelled) return;
                if (invitedUser) {
                    setInvitations(invitedUser);
                } else {
                    setInvitations([]);
                }
            } catch {
                if (cancelled) return;
                setInvitations([]);
            } finally {
                if (!cancelled) {
                    setIsInvitationsLoading(false);
                }
            }
        }
        loadInvitations(); return () => {
            cancelled = true;
        };
    }, [userId]);

    if (isLoading) {
        return compact ? (
            <OrganizationListSkeleton compact spaciousRows={spaciousRows} />
        ) : (
            <AuthCard>
                <AuthCardPanel>
                    <BrandAuthHeader />
                    <OrganizationListSkeleton spaciousRows={spaciousRows} />
                </AuthCardPanel>
                <AuthFooter />
            </AuthCard>
        );
    }
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
                const role =
                    (org as { role?: string | null }).role ??
                    activeOrg?.members.find(
                        (member) => member.organizationId === org.id && member.userId === userId
                    )?.role;
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

function OrganizationListSkeleton({
    compact = false,
    spaciousRows = false,
}: {
    compact?: boolean;
    spaciousRows?: boolean;
}) {
    const rowCount = compact ? 2 : 3;

    return (
        <div aria-hidden="true" className={compact ? "py-1" : undefined}>
            {Array.from({ length: rowCount }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex min-h-[68px] w-full items-center gap-3 border-b border-[rgba(0,0,0,0.055)] px-5 py-4",
                        spaciousRows && "min-h-[102px] gap-4 px-7 py-6",
                        compact && "border-b-0 px-4"
                    )}
                >
                    <Skeleton
                        className={cn(
                            "size-9 shrink-0 rounded-md",
                            spaciousRows && "size-[52px] rounded-[8px]"
                        )}
                    />
                    <div className="flex min-w-px flex-1 flex-col gap-2">
                        <Skeleton className={cn("h-4 w-36", spaciousRows && "h-5 w-44")} />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="size-6 shrink-0 rounded-full" />
                </div>
            ))}
        </div>
    );
}
