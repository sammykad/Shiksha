"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
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
}: OrganizationListProps) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: orgs } = authClient.useListOrganizations();

    const [loadingId, setLoadingId] = useState<string | null>(null);

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

            const { data, error } = await authClient.organization.listUserInvitations();
            if (cancelled) return;

            if (error) {
                setInvitations([]);
                return;
            }

            setInvitations(
                ((data ?? []) as Array<{
                    id: string;
                    organizationId?: string | null;
                    email?: string | null;
                    role?: string | null;
                    status?: string | null;
                    organization?: {
                        id?: string | null;
                        name?: string | null;
                        logo?: string | null;
                    } | null;
                }>)
                    .filter((invitation) => invitation.status !== "accepted")
                    .map((invitation) => ({
                        id: invitation.id,
                        organizationId: invitation.organizationId ?? invitation.organization?.id ?? "",
                        organizationName: invitation.organization?.name ?? "Organization invitation",
                        organizationLogo: invitation.organization?.logo,
                        role: invitation.role ?? "MEMBER",
                        status: invitation.status ?? "pending",
                    })),
            );
        }

        loadInvitations();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

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
                const role = org.role ?? "Admin";

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
