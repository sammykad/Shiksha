"use client";

/**
 * OrganizationProfile
 *
 * Mirrors Clerk's <OrganizationProfile /> for our Better Auth stack.
 * Opened from OrganizationSwitcher when the user clicks "Manage".
 *
 * Shared primitives come from components/auth/_components so profile,
 * switcher, and list stay consistent.
 */

import { useState, useEffect, type ElementType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    Menu,
    MoreHorizontal,
    Plus,
    Search,
    Users,
    Users2Icon,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatDateIN } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { getUserOrganizationMembershipRole } from "@/lib/data/organization/get-memberships";

// ─── Shared primitives (from organization-switcher) ───────────────────────────
import { ShikshaCloudWordmark } from "./_components/brand";
import { OrganizationAvatar } from "./_components/organization-avatar";
import { AuthDialog } from "./_components/auth-dialog";
import { CountBadge } from "./_components/count-badge";
import { UserAvatar } from "./_components/user-avatar";
import { RoleBadge } from "./role-badge";
import type { OrganizationLike } from "./types";

// ─── shadcn ──────────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "../ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";


// ─── Local types ──────────────────────────────────────────────────────────────

type Tab = "general" | "members";
type MembersSubTab = "members" | "invitations" | "requests";

type MemberRow = {
    id: string;
    userId: string;
    role: string;
    createdAt: string | Date;
    user: {
        name?: string | null;
        email: string;
        image?: string | null;
    };
};

type InvitationRow = {
    id: string;
    email: string;
    role: string;
    status?: string | null;
    createdAt?: string | Date | null;
    expiresAt?: string | Date | null;
};

// ─── Small shared atoms ───────────────────────────────────────────────────────

/** Role pill with chevron, used in the members table */
function RoleDropdown({
    role,
    memberId,
    orgId,
    onRoleChanged,
}: {
    role: string;
    memberId: string;
    orgId: string;
    onRoleChanged: () => Promise<void> | void;
}) {
    const label = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-7 gap-1 rounded-[6px] border-black/[0.1] bg-white px-2.5",
                        "text-[12px] font-[510] leading-4 text-[#212126]",
                        "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]",
                        "transition-transform duration-150 ease-out hover:bg-white active:scale-[0.96]",
                    )}
                >
                    {label}
                    <ChevronDown className="size-3 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32 rounded-[8px] p-1 text-[13px]">
                {INVITABLE_ROLES.map((r) => (
                    <DropdownMenuItem
                        key={r}
                        className="rounded-[6px] text-[13px]"
                        onClick={async () => {
                            const { error } = await authClient.organization.updateMemberRole({
                                organizationId: orgId,
                                memberId,
                                role: r,
                            });
                            if (error) {
                                toast.error(error.message ?? "Failed to update role.");
                            } else {
                                toast.success(`Role updated to ${r}.`);
                                await onRoleChanged();
                            }
                        }}
                    >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

function SidebarNavItem({
    icon: Icon,
    label,
    active,
    onClick,
}: {
    icon: ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex h-8 w-full items-center gap-3 rounded-[6px] px-3 text-[13px] font-[510] transition-colors duration-150",
                active
                    ? "bg-white text-[#212126] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]"
                    : "text-[#747686] hover:text-[#212126]",
            )}
        >
            <Icon className="size-4 shrink-0" />
            {label}
        </button>
    );
}

// ─── General tab ─────────────────────────────────────────────────────────────

function GeneralContent({
    org,
    onClose,
}: {
    org: OrganizationLike;
    onClose: () => void;
}) {
    const router = useRouter();
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const currentMemberRole = useCurrentOrganizationRole(org.id);

    const handleLeaveOrganization = async () => {
        setLeaving(true);
        try {
            const { error } = await authClient.organization.leave({ organizationId: org.id });

            if (error) {
                toast.error(error.message ?? "Failed to leave organization.");
                return;
            }

            toast.success("You left the organization.");
            setLeaveOpen(false);
            onClose();

            const listOrganizations = (authClient.organization as unknown as {
                list?: () => Promise<{ data?: OrganizationLike[] | null }>;
            }).list;
            const remaining = listOrganizations ? (await listOrganizations()).data ?? [] : [];
            router.push(remaining.length > 0 ? "/dashboard" : "/select-organization");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLeaving(false);
        }
    };

    return (
        <div className="flex h-full flex-col overflow-y-auto px-8 py-7 md:px-10 md:py-10">
            <h2 className="mb-6 text-[17px] font-bold tracking-[-0.17px] text-[#212126]">
                General
            </h2>
            <Separator className="mb-6 bg-black/[0.06]" />

            <div className="flex flex-col">
                {/* ── Profile + name + slug in one row ── */}
                <ProfileRow label="Organization">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <OrganizationAvatar name={org.name} logo={org.logo} />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[560] text-[#212126]">{org.name}</span>
                                {org.slug && (
                                    <span className="text-[12px] text-[#747686]">{org.slug}</span>
                                )}
                            </div>
                        </div>
                        {canManageOrganizationSettings(currentMemberRole) ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8 shrink-0 px-2 text-[12px] font-[510] text-[#212126] transition-transform duration-150 ease-out hover:bg-black/[0.04] active:scale-[0.96]"
                                onClick={() => {
                                    onClose();
                                    router.push("/dashboard/settings");
                                }}
                            >
                                Manage
                            </Button>
                        ) : null}
                    </div>
                </ProfileRow>

                <Separator className="bg-black/[0.06]" />

                {/* ── Leave organization ── */}
                <ProfileRow label="Danger zone">
                    <button
                        type="button"
                        className="text-[13px] font-[510] text-[#ef4444] transition-opacity duration-150 ease-out hover:opacity-80"
                        onClick={() => setLeaveOpen(true)}
                    >
                        Leave organization
                    </button>
                </ProfileRow>
            </div>

            <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Leave organization</DialogTitle>
                        <DialogDescription>
                            You will lose access to {org.name}. If you are the last admin, this action may be blocked.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLeaveOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLeaveOrganization} disabled={leaving} className="gap-2">
                            {leaving ? <Loader2 className="animate-spin" /> : null}
                            Leave organization
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/** Two-column label / content layout row used throughout General */
function ProfileRow({
    label,
    children,
    alignStart = false,
}: {
    label: string;
    children: ReactNode;
    alignStart?: boolean;
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 py-5 md:grid-cols-[200px_1fr] md:gap-6",
                alignStart ? "items-start" : "items-center",
            )}
        >
            <span className="text-[13px] font-[510] leading-[18px] text-[#212126]">{label}</span>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

// ─── Members tab ──────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50] as const;
const ADMIN_ROLE = "ADMIN";
const INVITABLE_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;

function parseInviteEmails(value: string) {
    return value
        .split(/[\s,;]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function getInvalidInviteEmails(emails: string[]) {
    return emails.filter((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function canManageOrganizationSettings(role?: string | null) {
    return role?.toUpperCase() === ADMIN_ROLE;
}

function useCurrentOrganizationRole(organizationId: string) {
    const { data: session } = authClient.useSession();
    const [currentMemberRole, setCurrentMemberRole] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadCurrentMemberRole() {
            if (!session?.user?.id) {
                setCurrentMemberRole(null);
                return;
            }

            try {
                const role = await getUserOrganizationMembershipRole(organizationId);
                if (!isCancelled) setCurrentMemberRole(role);
            } catch {
                if (!isCancelled) setCurrentMemberRole(null);
            }
        }

        loadCurrentMemberRole();

        return () => {
            isCancelled = true;
        };
    }, [organizationId, session?.user?.id]);

    return currentMemberRole;
}

function isPendingInvitation(invitation: InvitationRow) {
    const status = invitation.status?.toLowerCase();
    return !status || status === "pending";
}

function isRevokedInvitation(invitation: InvitationRow) {
    const status = invitation.status?.toLowerCase();
    return status === "revoked" || status === "canceled" || status === "cancelled";
}

function getInvitationStatusLabel(invitation: InvitationRow) {
    if (isRevokedInvitation(invitation)) return "Revoked";
    const status = invitation.status?.toLowerCase();
    if (!status || status === "pending") return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInvitationStatusClass(invitation: InvitationRow) {
    if (isRevokedInvitation(invitation)) {
        return "border-red-200 bg-red-50 text-red-700";
    }
    if (isPendingInvitation(invitation)) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
    return "border-slate-200 bg-slate-50 text-slate-700";
}

function MembersContent({ org }: { org: OrganizationLike }) {
    const [subTab, setSubTab] = useState<MembersSubTab>("members");
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState(1);
    const [inviteEmails, setInviteEmails] = useState("");
    const [inviteRole, setInviteRole] = useState<(typeof INVITABLE_ROLES)[number]>("ADMIN");
    const [inviting, setInviting] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const [members, setMembers] = useState<MemberRow[]>([]);
    const [memberCount, setMemberCount] = useState(0);
    const [invitations, setInvitations] = useState<InvitationRow[]>([]);
    const [isMembersPending, setIsMembersPending] = useState(true);
    const [isInvitationsPending, setIsInvitationsPending] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null);

    const { data: session } = authClient.useSession();
    const currentMemberRole = useCurrentOrganizationRole(org.id);
    const canManageMembers = canManageOrganizationSettings(currentMemberRole);

    const refreshMembers = async () => {
        setIsMembersPending(true);
        const { data, error } = await authClient.organization.listMembers({
            query: {
                organizationId: org.id,
                limit: pageSize,
                offset: (page - 1) * pageSize,
                sortBy: "createdAt",
                sortDirection: "desc",
            },
        });
        if (error) {
            setError(error.message ?? "Failed to load members.");
        } else {
            setMembers((data?.members ?? []) as MemberRow[]);
            setMemberCount(data?.total ?? 0);
            setError(null);
        }
        setIsMembersPending(false);
    };

    useEffect(() => {
        refreshMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [org.id, page, pageSize]); // Refetch when page/size changes

    const refreshInvitations = async (options?: { preserveRevoked?: boolean }) => {
        setIsInvitationsPending(true);
        const { data, error } = await authClient.organization.listInvitations({
            query: {
                organizationId: org.id,
            },
        });

        if (error) {
            toast.error(error.message ?? "Failed to load invitations.");
        } else {
            const nextInvitations = (data ?? []) as InvitationRow[];
            setInvitations((currentInvitations) => {
                if (!options?.preserveRevoked) return nextInvitations;

                const nextIds = new Set(nextInvitations.map((invitation) => invitation.id));
                const locallyRevoked = currentInvitations.filter(
                    (invitation) => isRevokedInvitation(invitation) && !nextIds.has(invitation.id),
                );

                return [...nextInvitations, ...locallyRevoked];
            });
        }

        setIsInvitationsPending(false);
    };

    useEffect(() => {
        refreshInvitations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [org.id]);

    const filtered = members.filter((m) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (m.user.name ?? "").toLowerCase().includes(q) ||
            m.user.email.toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil((search ? filtered.length : memberCount) / pageSize));
    const pageRows = filtered;

    const handleInvite = async () => {
        const emails = Array.from(new Set(parseInviteEmails(inviteEmails)));
        const invalidEmails = getInvalidInviteEmails(emails);
        if (emails.length === 0) {
            toast.error("Enter at least one email address.");
            return;
        }
        if (invalidEmails.length > 0) {
            toast.error(`Invalid email: ${invalidEmails[0]}`);
            return;
        }
        if (!canManageMembers) {
            toast.error("Only admins can invite members.");
            return;
        }

        const memberEmails = new Set(members.map((member) => normalizeEmail(member.user.email)));
        const pendingInvitationEmails = new Set(
            invitations
                .filter(isPendingInvitation)
                .map((invitation) => normalizeEmail(invitation.email)),
        );
        const existingMembers = emails.filter((email) => memberEmails.has(email));
        const alreadyInvited = emails.filter((email) => pendingInvitationEmails.has(email));
        const sendableEmails = emails.filter(
            (email) => !memberEmails.has(email) && !pendingInvitationEmails.has(email),
        );

        if (existingMembers.length > 0) {
            toast.error(
                existingMembers.length === 1
                    ? `${existingMembers[0]} is already a member.`
                    : `${existingMembers.length} emails are already members: ${existingMembers.slice(0, 3).join(", ")}${existingMembers.length > 3 ? "..." : ""}`,
            );
        }

        if (alreadyInvited.length > 0) {
            toast.warning(
                alreadyInvited.length === 1
                    ? `${alreadyInvited[0]} already has a pending invitation.`
                    : `${alreadyInvited.length} emails already have pending invitations: ${alreadyInvited.slice(0, 3).join(", ")}${alreadyInvited.length > 3 ? "..." : ""}`,
            );
        }

        if (sendableEmails.length === 0) {
            return;
        }

        setInviting(true);
        try {
            const results: Array<{ email: string; ok: boolean; message?: string }> = [];

            for (const email of sendableEmails) {
                const { error } = await authClient.organization.inviteMember({
                    organizationId: org.id,
                    email,
                    role: inviteRole,
                });
                results.push({
                    email,
                    ok: !error,
                    message: error ? error.message ?? "Invitation failed." : undefined,
                });
            }

            const succeeded = results.filter((result) => result.ok);
            const failed = results.filter((result) => !result.ok);

            if (succeeded.length > 0) {
                toast.success(
                    succeeded.length === 1
                        ? `Invitation sent to ${succeeded[0].email}.`
                        : `Sent ${succeeded.length} invitations.`,
                );
                setInviteEmails("");
                setInviteSuccess(true);
                await refreshInvitations();
                await refreshMembers();
            }

            if (failed.length > 0) {
                const firstFailure = failed[0];
                toast.error(
                    failed.length === 1
                        ? `${firstFailure.email}: ${firstFailure.message}`
                        : `${failed.length} invitations failed. First: ${firstFailure.email}: ${firstFailure.message}`,
                );
                setInviteSuccess(false);
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setInviting(false);
        }
    };

    const handleRevokeInvitation = async (invitationId: string) => {
        if (!canManageMembers) {
            toast.error("Only admins can revoke invitations.");
            return;
        }

        setRevokingInvitationId(invitationId);
        try {
            const { error } = await authClient.organization.cancelInvitation({
                invitationId,
            });
            if (error) {
                toast.error(error.message ?? "Failed to revoke invitation.");
                return;
            }

            toast.success("Invitation revoked.");
            setInvitations((currentInvitations) =>
                currentInvitations.map((invitation) =>
                    invitation.id === invitationId
                        ? { ...invitation, status: "revoked" }
                        : invitation,
                ),
            );
            await refreshInvitations({ preserveRevoked: true });
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setRevokingInvitationId(null);
        }
    };

    const subTabCounts: Record<MembersSubTab, number> = {
        members: memberCount,
        invitations: invitations.length,
        requests: 0,
    };

    return (
        <div className="flex h-full min-w-0 flex-col px-5 py-6 md:px-8 md:py-10 lg:px-10">
            {/* Heading */}
            <h2 className="mb-5 text-[17px] font-bold tracking-[-0.17px] text-[#212126]">
                Members
            </h2>

            {/* Sub-tabs */}
            <div className="mb-6 flex gap-6 overflow-x-auto border-b border-black/[0.06]">
                {(["members", "invitations", "requests"] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => { setSubTab(t); setPage(1); }}
                        className={cn(
                            "flex cursor-pointer items-center gap-1.5 pb-3 text-[13px] font-[510] transition-colors duration-150",
                            subTab === t
                                ? "border-b-[1.5px] border-[#212126] text-[#212126]"
                                : "text-[#747686] hover:text-[#212126]",
                        )}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        <CountBadge count={subTabCounts[t]} active={subTab === t} />
                    </button>
                ))}
            </div>

            {subTab === "members" && (
                <div className="flex min-w-0 flex-1 flex-col gap-5 max-md:overflow-y-auto scrollbar-hide overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full min-w-0 sm:max-w-[260px] sm:flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#747686]" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="h-8 rounded-[6px] border-black/[0.08] bg-white pl-9 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                            />
                        </div>

                        {canManageMembers ? (
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    setSubTab("invitations");
                                    setShowInvite(true);
                                    setInviteSuccess(false);
                                }}
                            >
                                Invite
                            </Button>
                        ) : null}
                    </div>

                    {/* Table (desktop only) */}
                    <ScrollArea className="min-w-0 flex-1 rounded-[8px] border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-md:hidden">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="h-[38px] border-black/[0.06] bg-black/[0.01] hover:bg-black/[0.01]">
                                    <TableHead className="px-4 py-2 text-[11px] font-[600] uppercase tracking-[0.05em] text-[#747686]">
                                        User
                                    </TableHead>
                                    <TableHead className="w-[112px] px-3 py-2 text-[11px] font-[600] uppercase tracking-[0.05em] text-[#747686]">
                                        Joined
                                    </TableHead>
                                    <TableHead className="w-[104px] px-3 py-2 text-[11px] font-[600] uppercase tracking-[0.05em] text-[#747686]">
                                        Role
                                    </TableHead>
                                    {canManageMembers ? (
                                        <TableHead className="w-[72px] px-3 py-2 text-right text-[11px] font-[600] uppercase tracking-[0.05em] text-[#747686]">
                                            Actions
                                        </TableHead>
                                    ) : null}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isMembersPending ? (
                                    <TableRow>
                                        <TableCell colSpan={canManageMembers ? 4 : 3} className="h-24 text-center text-[13px] text-[#9ca3af]">
                                            <Loader2 className="mx-auto size-4 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : pageRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canManageMembers ? 4 : 3} className="h-24 text-center text-[13px] text-[#9ca3af]">
                                            No members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageRows.map((m) => (
                                        <MemberTableRow
                                            key={m.id}
                                            member={m}
                                            orgId={org.id}
                                            currentUserId={session?.user?.id}
                                            canManageMembers={canManageMembers}
                                            onMembersChanged={refreshMembers}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>

                    {/* Mobile member cards */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {isMembersPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="rounded-[8px] border border-black/[0.08] bg-white p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-black/[0.07]" />
                                        <div className="flex-1">
                                            <div className="h-3 w-32 rounded bg-black/[0.07]" />
                                            <div className="mt-2 h-2.5 w-48 rounded bg-black/[0.05]" />
                                        </div>
                                    </div>
                                    <div className="mt-3 h-3 w-20 rounded bg-black/[0.06]" />
                                    <div className="mt-3 h-7 w-20 rounded bg-black/[0.05]" />
                                </div>
                            ))
                        ) : pageRows.length === 0 ? (
                            <div className="rounded-[8px] border border-black/[0.08] bg-white p-5 text-center text-[14px] text-[#212126]">
                                No members found.
                            </div>
                        ) : (
                            pageRows.map((m) => (
                                <MemberMobileCard
                                    key={m.id}
                                    member={m}
                                    orgId={org.id}
                                    currentUserId={session?.user?.id}
                                    canManageMembers={canManageMembers}
                                    onMembersChanged={refreshMembers}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination footer */}
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                        {/* Left: info + page size */}
                        <div className="flex items-center gap-3">
                            <span className="whitespace-nowrap text-[12px] text-[#747686]">
                                {memberCount > 0
                                    ? `Showing ${Math.min((page - 1) * pageSize + 1, memberCount)}–${Math.min(page * pageSize, memberCount)} of ${memberCount}`
                                    : "No results"}
                            </span>
                            <span className="hidden h-3 w-px bg-black/[0.08] sm:block" />
                            <div className="hidden items-center gap-1.5 sm:flex">
                                <span className="text-[12px] text-[#747686]">Per page</span>
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}
                                >
                                    <SelectTrigger className="h-7 w-14 rounded-[6px] border-black/[0.10] bg-white px-1.5 text-[12px] font-[510] text-[#212126] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        {PAGE_SIZES.map((s) => (
                                            <SelectItem key={s} value={String(s)} className="text-[13px]">
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right: page nav */}
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#747686]">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page <= 1}
                                    onClick={() => setPage(1)}
                                    className="size-7 rounded-[6px] border-black/[0.1] text-[#747686] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.92] disabled:opacity-30"
                                    aria-label="First page"
                                >
                                    <ChevronLeft className="size-3.5" />
                                    <ChevronLeft className="-ml-2 size-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="size-7 rounded-[6px] border-black/[0.1] text-[#747686] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.92] disabled:opacity-30"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="size-3.5" />
                                </Button>
                                <span className="flex size-7 items-center justify-center rounded-[6px] bg-black/[0.04] text-[12px] font-[600] text-[#212126]">
                                    {page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="size-7 rounded-[6px] border-black/[0.1] text-[#747686] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.92] disabled:opacity-30"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="size-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(totalPages)}
                                    className="size-7 rounded-[6px] border-black/[0.1] text-[#747686] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.92] disabled:opacity-30"
                                    aria-label="Last page"
                                >
                                    <ChevronRight className="size-3.5" />
                                    <ChevronRight className="-ml-2 size-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === "invitations" && (
                <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-auto overflow-x-hidden pr-1">
                    {canManageMembers && showInvite ? (
                        <div className="min-w-0 rounded-[8px] border border-black/[0.08] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-5">
                            {inviteSuccess ? (
                                <div className="flex min-h-[214px] flex-col">
                                    <h3 className="text-[15px] font-semibold leading-5 text-[#212126]">
                                        Invite new members
                                    </h3>
                                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                                        <div className="flex size-[72px] items-center justify-center rounded-full bg-black/[0.04] text-[#372f35]">
                                            <Mail className="size-5" />
                                        </div>
                                        <p className="text-[14px] leading-5 text-[#212126]">
                                            Invitations successfully sent
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={() => {
                                                setInviteSuccess(false);
                                                setShowInvite(false);
                                            }}
                                        >
                                            Finish
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <h3 className="text-[15px] font-semibold leading-5 text-[#212126]">
                                            Invite new members
                                        </h3>
                                        <p className="mt-1 text-[13px] leading-[18px] text-[#747686]">
                                            Enter or paste one or more email addresses, separated by spaces or commas.
                                        </p>
                                    </div>

                                    <Textarea
                                        autoFocus
                                        value={inviteEmails}
                                        onChange={(event) => setInviteEmails(event.target.value)}
                                        placeholder="teacher@school.edu, parent@example.com"
                                        className="min-h-[112px] resize-none rounded-[8px] border-black/[0.10] bg-white px-3.5 py-3 text-[14px] leading-5 shadow-none focus-visible:ring-2 focus-visible:ring-[#747686]/40"
                                    />

                                    <div className="grid min-w-0 gap-4 md:grid-cols-[190px_minmax(0,1fr)] md:items-end">
                                        <label className="grid min-w-0 gap-1.5 text-[13px] font-[510] text-[#212126]">
                                            Role
                                            <Select
                                                value={inviteRole}
                                                onValueChange={(value) => setInviteRole(value as typeof inviteRole)}
                                            >
                                                <SelectTrigger className="h-9 w-full rounded-[7px] border-black/[0.08] bg-white text-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent align="start">
                                                    {INVITABLE_ROLES.map((role) => (
                                                        <SelectItem key={role} value={role}>
                                                            {role}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </label>

                                        <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-9 rounded-[7px] px-3 text-[14px] font-[510]"
                                                onClick={() => {
                                                    setInviteEmails("");
                                                    setShowInvite(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={handleInvite}
                                                disabled={
                                                    inviting ||
                                                    parseInviteEmails(inviteEmails).length === 0 ||
                                                    getInvalidInviteEmails(parseInviteEmails(inviteEmails)).length > 0
                                                }
                                            >
                                                {inviting ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : null}
                                                <span>Send invitations</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : canManageMembers ? (
                        <PageHeader icon={Users2Icon} title="Invite new members" description="Send invitations by email." actions={<>
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setShowInvite(true)}
                            >
                                <Plus /> Invite
                            </Button>
                        </>} />
                    ) : null}

                    <div className="hidden min-w-0 overflow-hidden rounded-[8px] border border-black/[0.10] bg-white md:block">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="h-[38px] border-black/[0.06] hover:bg-transparent">
                                    <TableHead className="px-4 text-[13px] font-normal text-[#747686]">
                                        User
                                    </TableHead>
                                    <TableHead className="w-[116px] px-3 text-[13px] font-normal text-[#747686]">
                                        Invited
                                    </TableHead>
                                    <TableHead className="w-[100px] px-3 text-[13px] font-normal text-[#747686]">
                                        Role
                                    </TableHead>
                                    {canManageMembers ? (
                                        <TableHead className="w-[86px] px-3 text-right text-[13px] font-normal text-[#747686]">
                                            Actions
                                        </TableHead>
                                    ) : null}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isInvitationsPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index} className="h-[50px] border-black/[0.06]">
                                            <TableCell className="px-6">
                                                <div className="h-4 w-44 rounded bg-black/[0.07]" />
                                            </TableCell>
                                            <TableCell className="px-6">
                                                <div className="h-4 w-20 rounded bg-black/[0.06]" />
                                            </TableCell>
                                            <TableCell className="px-6">
                                                <div className="h-4 w-16 rounded bg-black/[0.06]" />
                                            </TableCell>
                                            {canManageMembers ? (
                                                <TableCell className="px-6">
                                                    <div className="size-8 rounded-[8px] bg-black/[0.06]" />
                                                </TableCell>
                                            ) : null}
                                        </TableRow>
                                    ))
                                ) : invitations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canManageMembers ? 4 : 3} className="h-14 text-center text-[14px] text-[#212126]">
                                            No invitations to display
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invitations.map((invitation) => (
                                        <TableRow key={invitation.id} className="h-[50px] border-black/[0.06]">
                                            <TableCell className="px-4">
                                                <div className="flex min-w-0 flex-col gap-1">
                                                    <span className="truncate text-[14px] font-[510] text-[#212126]">
                                                        {invitation.email}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-[560] leading-4",
                                                        getInvitationStatusClass(invitation),
                                                    )}>
                                                        {getInvitationStatusLabel(invitation)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 text-[13px] text-[#212126]">
                                                {formatDateIN(invitation.createdAt ?? invitation.expiresAt)}
                                            </TableCell>
                                            <TableCell className="px-3 text-[13px] text-[#212126]">
                                                {invitation.role}
                                            </TableCell>
                                            {canManageMembers ? (
                                                <TableCell className="px-3 text-right">
                                                    {isPendingInvitation(invitation) ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    disabled={revokingInvitationId === invitation.id}
                                                                    className="size-8 rounded-[8px] border-black/[0.08] text-[#747686]"
                                                                >
                                                                    {revokingInvitationId === invitation.id ? (
                                                                        <Loader2 className="animate-spin" />
                                                                    ) : (
                                                                        <MoreHorizontal />
                                                                    )}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40 rounded-[8px] p-1">
                                                                <DropdownMenuItem
                                                                    disabled={revokingInvitationId === invitation.id}
                                                                    className="rounded-[6px] text-[13px] text-red-600 focus:text-red-600"
                                                                    onClick={() => handleRevokeInvitation(invitation.id)}
                                                                >
                                                                    Revoke invitation
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : (
                                                        <span className="inline-flex h-8 w-8 items-center justify-center" aria-label="No available action">
                                                            <span className="h-px w-3 rounded-full bg-[#d1d5db]" />
                                                        </span>
                                                    )}
                                                </TableCell>
                                            ) : null}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-3 md:hidden">
                        {isInvitationsPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="rounded-[8px] border border-black/[0.08] bg-white p-4">
                                    <div className="h-4 w-48 rounded bg-black/[0.07]" />
                                    <div className="mt-3 h-3 w-24 rounded bg-black/[0.06]" />
                                    <div className="mt-4 h-8 w-full rounded bg-black/[0.05]" />
                                </div>
                            ))
                        ) : invitations.length === 0 ? (
                            <div className="rounded-[8px] border border-black/[0.08] bg-white p-5 text-center text-[14px] text-[#212126]">
                                No invitations to display
                            </div>
                        ) : (
                            invitations.map((invitation) => (
                                <div key={invitation.id} className="rounded-[8px] border border-black/[0.08] bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-[560] text-[#212126]">
                                                {invitation.email}
                                            </p>
                                            <p className="mt-1 text-[12px] text-[#747686]">
                                                Invited {formatDateIN(invitation.createdAt ?? invitation.expiresAt)} · {invitation.role}
                                            </p>
                                            <span className={cn(
                                                "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-[560] leading-4",
                                                getInvitationStatusClass(invitation),
                                            )}>
                                                {getInvitationStatusLabel(invitation)}
                                            </span>
                                        </div>
                                        {canManageMembers && isPendingInvitation(invitation) ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-8 shrink-0 px-2 text-[12px] font-[510] text-red-600 hover:text-red-600"
                                                disabled={revokingInvitationId === invitation.id}
                                                onClick={() => handleRevokeInvitation(invitation.id)}
                                            >
                                                {revokingInvitationId === invitation.id ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : null}
                                                <span>Revoke</span>
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {subTab === "requests" && (
                <div className="flex flex-1 items-center justify-center text-[13px] text-[#9ca3af]">
                    No join requests.
                </div>
            )}
        </div>
    );
}

function MemberTableRow({
    member,
    orgId,
    currentUserId,
    canManageMembers,
    onMembersChanged,
}: {
    member: MemberRow;
    orgId: string;
    currentUserId?: string;
    canManageMembers: boolean;
    onMembersChanged: () => Promise<void> | void;
}) {
    const isYou = member.userId === currentUserId;
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const memberName = member.user.name || member.user.email;

    const handleRemoveMember = async () => {
        setRemoving(true);
        try {
            const { error } = await authClient.organization.removeMember({
                organizationId: orgId,
                memberIdOrEmail: member.id,
            });
            if (error) {
                toast.error(error.message ?? "Failed to remove member.");
                return;
            }

            toast.success("Member removed.");
            setRemoveOpen(false);
            await onMembersChanged();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <TableRow className="h-[60px] border-black/[0.06]">
                {/* User */}
                <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            name={member.user.name ?? member.user.email}
                            image={member.user.image}
                            className="rounded-full border border-black/[0.06]"
                        />
                        <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="truncate text-[13px] font-[560] text-[#212126]">
                                    {member.user.name || "Unknown"}
                                </span>
                                {isYou && (
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-black/[0.04] px-1.5 py-px text-[10px] font-[560] leading-[14px] text-[#747686]">
                                        You
                                    </span>
                                )}
                            </div>
                            <span className="truncate text-[12px] text-[#747686]">
                                {member.user.email}
                            </span>
                        </div>
                    </div>
                </TableCell>

                {/* Joined */}
                <TableCell className="px-3 py-2 text-[13px] text-[#212126]">
                    {formatDateIN(member.createdAt)}
                </TableCell>

                {/* Role */}
                <TableCell className="px-3 py-2">
                    {canManageMembers ? (
                        <RoleDropdown
                            role={member.role}
                            memberId={member.id}
                            orgId={orgId}
                            onRoleChanged={onMembersChanged}
                        />
                    ) : (
                        <RoleBadge role={member.role} />
                    )}
                </TableCell>

                {canManageMembers ? (
                    <TableCell className="px-3 py-2 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-[6px] text-[#747686] transition-[color,background-color,transform] duration-150 ease-out hover:bg-black/[0.04] active:scale-[0.92]"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-[8px] p-1 text-[13px]">
                                <DropdownMenuItem
                                    className="rounded-[6px] text-[13px] text-[#ef4444] focus:text-[#ef4444]"
                                    onSelect={() => setRemoveOpen(true)}
                                >
                                    Remove member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                ) : null}
            </TableRow>

            <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Remove member</DialogTitle>
                        <DialogDescription>
                            Remove {memberName} from this organization? They will lose access immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={removing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveMember} disabled={removing} className="gap-2">
                            {removing ? <Loader2 className="animate-spin" /> : null}
                            <span>Remove member</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function MemberMobileCard({
    member,
    orgId,
    currentUserId,
    canManageMembers,
    onMembersChanged,
}: {
    member: MemberRow;
    orgId: string;
    currentUserId?: string;
    canManageMembers: boolean;
    onMembersChanged: () => Promise<void> | void;
}) {
    const isYou = member.userId === currentUserId;
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const memberName = member.user.name || member.user.email;

    const handleRemoveMember = async () => {
        setRemoving(true);
        try {
            const { error } = await authClient.organization.removeMember({
                organizationId: orgId,
                memberIdOrEmail: member.id,
            });
            if (error) {
                toast.error(error.message ?? "Failed to remove member.");
                return;
            }
            toast.success("Member removed.");
            setRemoveOpen(false);
            await onMembersChanged();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <div className="rounded-[8px] border border-black/[0.08] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                            name={member.user.name ?? member.user.email}
                            image={member.user.image}
                            className="size-8 shrink-0 rounded-full border border-black/[0.06]"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="truncate text-[14px] font-[560] text-[#212126]">
                                    {member.user.name || "Unknown"}
                                </span>
                                {isYou && (
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-black/[0.04] px-1.5 py-px text-[10px] font-[560] leading-[14px] text-[#747686]">
                                        You
                                    </span>
                                )}
                            </div>
                            <span className="block truncate text-[12px] text-[#747686]">
                                {member.user.email}
                            </span>
                        </div>
                    </div>
                    {canManageMembers ? (
                        <button
                            type="button"
                            onClick={() => setRemoveOpen(true)}
                            className="shrink-0 text-[12px] font-[510] text-red-600 hover:text-red-600"
                        >
                            Remove
                        </button>
                    ) : null}
                </div>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-[#747686]">
                    <span>Joined {formatDateIN(member.createdAt)}</span>
                </div>
                <div className="mt-2">
                    {canManageMembers ? (
                        <RoleDropdown
                            role={member.role}
                            memberId={member.id}
                            orgId={orgId}
                            onRoleChanged={onMembersChanged}
                        />
                    ) : (
                        <RoleBadge role={member.role} />
                    )}
                </div>
            </div>

            <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Remove member</DialogTitle>
                        <DialogDescription>
                            Remove {memberName} from this organization? They will lose access immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={removing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveMember} disabled={removing} className="gap-2">
                            {removing ? <Loader2 className="animate-spin" /> : null}
                            <span>Remove member</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── OrganizationProfile (main export) ───────────────────────────────────────

export function OrganizationProfile({
    org,
    open,
    onOpenChange,
}: {
    org: OrganizationLike;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [tab, setTab] = useState<Tab>("general");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const handleTabChange = (nextTab: Tab) => {
        setTab(nextTab);
        setMobileNavOpen(false);
    };

    return (
        <AuthDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Organization Profile"
            description="Manage your organization."
            className="max-w-[calc(100vw-32px)] md:max-w-[960px]"
        >
            <div className="relative flex h-full min-h-0 flex-col md:flex-row">
                <button
                    type="button"
                    aria-label="Close organization settings"
                    onClick={() => onOpenChange(false)}
                    className="absolute right-5 top-5 z-10 flex size-8 items-center justify-center rounded-md text-[#747686] transition-[color,background-color,transform] duration-150 ease-out hover:bg-black/[0.04] hover:text-[#212126] active:scale-[0.92]"
                >
                    <X className="size-4" />
                </button>

                <header className="flex h-12 shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-5 md:hidden">
                    <button
                        type="button"
                        aria-label="Open organization navigation"
                        onClick={() => setMobileNavOpen((value) => !value)}
                        className="flex size-8 items-center justify-center rounded-md text-[#212126] transition-[color,background-color,transform] duration-150 ease-out hover:bg-black/[0.04] active:scale-[0.92]"
                    >
                        <Menu className="size-4" />
                    </button>
                    <span className="text-[18px] font-bold tracking-[-0.18px] text-[#212126]">
                        Organization
                    </span>
                </header>

                {mobileNavOpen ? (
                    <div className="border-b border-black/[0.08] bg-[#f7f7f7] px-4 py-3 md:hidden">
                        <SidebarNavItem
                            icon={Building2}
                            label="General"
                            active={tab === "general"}
                            onClick={() => handleTabChange("general")}
                        />
                        <SidebarNavItem
                            icon={Users}
                            label="Members"
                            active={tab === "members"}
                            onClick={() => handleTabChange("members")}
                        />
                    </div>
                ) : null}

                <aside className="hidden shrink-0 flex-col justify-between bg-[#f7f7f7] md:flex md:h-full md:w-[240px]">
                    <div className="flex flex-col">
                        {/* Title */}
                        <div className="flex flex-col gap-1.5 px-8 py-10">
                            <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#212126]">
                                Organization
                            </h1>
                            <p className="text-[13px] leading-[18px] text-[#747686]">
                                Manage your organization.
                            </p>
                        </div>

                        {/* Nav */}
                        <div className="flex flex-col gap-1 px-4">
                            <SidebarNavItem
                                icon={Building2}
                                label="General"
                                active={tab === "general"}
                                onClick={() => handleTabChange("general")}
                            />
                            <SidebarNavItem
                                icon={Users}
                                label="Members"
                                active={tab === "members"}
                                onClick={() => handleTabChange("members")}
                            />
                        </div>
                    </div>

                    {/* Footer wordmark */}
                    <div className="flex items-center gap-2 px-8 py-8">
                        <span className="text-[11px] font-[510] text-[#747686]">Secured by</span>
                        <ShikshaCloudWordmark />
                    </div>
                </aside>

                {/* ── Content panel ── */}
                <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white md:rounded-[8px] md:border md:border-black/[0.08] md:shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    {tab === "general" ? (
                        <GeneralContent org={org} onClose={() => onOpenChange(false)} />
                    ) : (
                        <MembersContent org={org} />
                    )}
                </section>

                <footer className="flex shrink-0 flex-col items-center gap-1 border-t border-black/[0.06] bg-[repeating-linear-gradient(135deg,rgba(249,115,22,0.055)_0px,rgba(249,115,22,0.055)_6px,transparent_6px,transparent_13px)] px-5 py-4 md:hidden">
                    <div className="flex items-center gap-2 text-[12px] leading-4 text-[#747686]">
                        <span>Secured by</span>
                        <ShikshaCloudWordmark />
                    </div>
                    {process.env.NODE_ENV === "development" ? (
                        <span className="text-[12px] font-semibold leading-4 text-orange-600">
                            Development mode
                        </span>
                    ) : null}
                </footer>
            </div>
        </AuthDialog>
    );
}
