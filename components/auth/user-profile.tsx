"use client";

import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    CreditCard,
    Laptop,
    Loader2,
    LockKeyhole,
    Menu,
    ShieldCheck,
    Smartphone,
    UserCircle,
    X,
} from "lucide-react";
import { toast } from "sonner";

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { AuthDialog } from "./_components/auth-dialog";
import { ShikshaCloudWordmark } from "./_components/brand";
import { UserAvatar } from "./_components/user-avatar";
import { AuthFooter } from "./_components/auth-footer";

type UserProfileTab = "profile" | "security" | "billing";

type UserProfileUser = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
};

type ActiveSession = {
    id: string;
    token: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    expiresAt: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};

const currentPasswordFormSchema = z.object({
    currentPassword: z.string().min(1, "Enter your current password."),
});

const newPasswordFormSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters.")
            .regex(/[A-Z]/, "Add at least one uppercase letter.")
            .regex(/[0-9]/, "Add at least one number."),
        confirmPassword: z.string().min(1, "Confirm your new password."),
    })
    .superRefine((values, ctx) => {
        if (values.newPassword !== values.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Passwords do not match.",
            });
        }
    });

const deleteAccountFormSchema = z.object({
    password: z.string().min(1, "Enter your password to delete the account."),
});

type CurrentPasswordFormValues = z.infer<typeof currentPasswordFormSchema>;
type NewPasswordFormValues = z.infer<typeof newPasswordFormSchema>;
type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;

type DeviceSessionGroup = {
    id: string;
    sessions: ActiveSession[];
    latestSession: ActiveSession;
    sessionCount: number;
    isCurrent: boolean;
};

interface UserProfileProps {
    user?: UserProfileUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: UserProfileTab;
}

function getDisplayName(user?: UserProfileUser | null) {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return fullName || user?.name || user?.email || "User";
}


function getInitialForm(user?: UserProfileUser | null) {
    return {
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        name: user?.name ?? getDisplayName(user),
        image: user?.image ?? "",
    };
}

function getDeviceIcon(userAgent?: string | null) {
    const value = userAgent?.toLowerCase() ?? "";
    return /mobile|iphone|android/.test(value) ? Smartphone : Laptop;
}

function formatDate(value?: Date | string | null) {
    if (!value) return "Unknown";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatDevice(userAgent?: string | null) {
    if (!userAgent) return "Unknown device";
    if (/iphone|ipad/i.test(userAgent)) return "iOS device";
    if (/android/i.test(userAgent)) return "Android device";
    if (/windows/i.test(userAgent)) return "Windows device";
    if (/macintosh|mac os/i.test(userAgent)) return "Mac device";
    if (/linux/i.test(userAgent)) return "Linux device";
    return "Browser session";
}

function formatBrowser(userAgent?: string | null) {
    if (!userAgent) return "No browser details available";
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edg|OPR)\/[\d.]+/i)?.[0] ?? "Browser";
    return browser.replace("Edg/", "Edge ").replace("OPR/", "Opera ");
}

function getSessionTime(session: ActiveSession) {
    return new Date(session.updatedAt ?? session.createdAt).getTime();
}

function normalizeIpAddress(ipAddress?: string | null) {
    if (!ipAddress) return "IP unavailable";

    const normalized = ipAddress.trim().toLowerCase();
    const compact = normalized.replace(/:/g, "");
    if (
        normalized === "::1" ||
        normalized === "0:0:0:0:0:0:0:1" ||
        compact === "00000000000000000000000000000000"
    ) {
        return "IP unavailable";
    }

    return ipAddress;
}

function getSessionGroupKey(session: ActiveSession) {
    return [
        formatDevice(session.userAgent),
        formatBrowser(session.userAgent),
        normalizeIpAddress(session.ipAddress),
    ].join("|");
}

function groupDeviceSessions(sessions: ActiveSession[], currentToken?: string): DeviceSessionGroup[] {
    const groups = new Map<string, ActiveSession[]>();

    for (const session of sessions) {
        const key = getSessionGroupKey(session);
        groups.set(key, [...(groups.get(key) ?? []), session]);
    }

    return Array.from(groups.entries())
        .map(([id, groupSessions]) => {
            const sortedSessions = [...groupSessions].sort((a, b) => getSessionTime(b) - getSessionTime(a));
            return {
                id,
                sessions: sortedSessions,
                latestSession: sortedSessions[0],
                sessionCount: sortedSessions.length,
                isCurrent: sortedSessions.some((session) => session.token === currentToken),
            };
        })
        .sort((a, b) => getSessionTime(b.latestSession) - getSessionTime(a.latestSession));
}

function SidebarItem({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: ElementType;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex h-9 w-full items-center gap-3 rounded-[6px] px-3 text-[13px] font-[510] transition-colors",
                active ? "text-[#212126]" : "text-[#747686] hover:text-[#212126]",
            )}
        >
            <Icon className="size-4 shrink-0" />
            {label}
        </button>
    );
}

function DetailRow({
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
                "grid grid-cols-1 gap-4 py-6 md:grid-cols-[180px_1fr] md:gap-8 md:py-7",
                alignStart ? "items-start" : "items-center",
            )}
        >
            <span className="text-[13px] font-[510] leading-[18px] text-[#212126]">
                {label}
            </span>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function SecurityItem({
    icon: Icon,
    title,
    description,
    badge,
    action,
}: {
    icon: ElementType;
    title: string;
    description?: string;
    badge?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#747686]" />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-[510] leading-[18px] text-[#212126]">
                            {title}
                        </span>
                        {badge ? (
                            <span className="rounded-full border border-black/[0.08] bg-black/[0.03] px-2 py-0.5 text-[11px] font-[510] leading-4 text-[#747686]">
                                {badge}
                            </span>
                        ) : null}
                    </div>
                    {description ? (
                        <p className="mt-0.5 whitespace-pre-line text-[13px] leading-[18px] text-[#747686]">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

function ProfileContent({
    user,
    onUpdateProfile,
}: {
    user?: UserProfileUser | null;
    onUpdateProfile: () => void;
}) {
    const name = getDisplayName(user);

    return (
        <div className="flex h-full flex-col overflow-y-auto px-8 py-7 md:px-10 md:py-8">
            <h2 className="text-[17px] font-bold tracking-[-0.17px] text-[#212126]">
                Profile details
            </h2>
            <Separator className="mt-5 bg-black/[0.06]" />

            <DetailRow label="Profile">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <UserAvatar
                            name={name}
                            image={user?.image}
                            className="size-12 rounded-full border border-black/[0.08]"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-[510] text-[#212126]">
                                {name}
                            </p>
                            {user?.email ? (
                                <p className="truncate text-[13px] text-[#747686]">
                                    {user.email}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 justify-start text-[12px] font-[510] sm:justify-center"
                        onClick={onUpdateProfile}
                    >
                        Update profile
                    </Button>
                </div>
            </DetailRow>
        </div>
    );
}

function SecurityContent({
    compact = false,
    sessionGroups,
    sessionsPending,
    currentToken,
    revokingToken,
    onUpdatePassword,
    onDeleteAccount,
    onRevokeSessionGroup,
}: {
    compact?: boolean;
    sessionGroups: DeviceSessionGroup[];
    sessionsPending: boolean;
    currentToken?: string;
    revokingToken: string | null;
    onUpdatePassword: () => void;
    onDeleteAccount: () => void;
    onRevokeSessionGroup: (group: DeviceSessionGroup) => void;
}) {
    return (
        <div className="flex h-full flex-col overflow-y-auto px-8 py-7 md:px-10 md:py-8">
            <h2 className="text-[20px] font-bold tracking-[-0.2px] text-[#212126] md:text-[17px] md:tracking-[-0.17px]">
                {compact ? "Security" : "Profile details"}
            </h2>
            <Separator className="mt-5 bg-black/[0.06]" />

            <DetailRow label={compact ? "Password" : "Profile"}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-[#212126]" aria-label="Password is set">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <span key={index} className="size-1.5 rounded-full bg-[#212126]" />
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 shrink-0 px-2 text-[12px] font-[510]"
                        onClick={onUpdatePassword}
                    >
                        {compact ? "Update password" : "Change password"}
                    </Button>
                </div>
            </DetailRow>

            <Separator className="bg-black/[0.06]" />

            <DetailRow label="Two-step verification" alignStart>
                <SecurityItem
                    icon={ShieldCheck}
                    title="Not enabled"
                    description="Two-step verification is not enabled for this workspace yet."
                />
            </DetailRow>

            <Separator className="bg-black/[0.06]" />

            <DetailRow label="Active devices" alignStart>
                <div className="flex flex-col gap-6">
                    {sessionsPending ? (
                        Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="mt-0.5 size-4 rounded bg-black/[0.08]" />
                                <div className="flex flex-1 flex-col gap-2">
                                    <div className="h-4 w-32 rounded bg-black/[0.08]" />
                                    <div className="h-3 w-full max-w-[280px] rounded bg-black/[0.06]" />
                                </div>
                            </div>
                        ))
                    ) : sessionGroups.length === 0 ? (
                        <p className="text-[13px] leading-[18px] text-[#747686]">
                            No active devices were returned for this account.
                        </p>
                    ) : (
                        sessionGroups.map((group) => {
                            const session = group.latestSession;
                            const Icon = getDeviceIcon(session.userAgent);
                            const revokeableSessions = group.sessions.filter((item) => item.token !== currentToken);
                            const canRevoke = revokeableSessions.length > 0;
                            const actionLabel = group.isCurrent
                                ? canRevoke
                                    ? "Revoke old"
                                    : "Current"
                                : "Revoke";
                            const sessionSummary = group.sessionCount > 1
                                ? `\n${group.sessionCount} active sessions from this device`
                                : "";

                            return (
                                <SecurityItem
                                    key={group.id}
                                    icon={Icon}
                                    title={formatDevice(session.userAgent)}
                                    badge={group.isCurrent ? "This device" : undefined}
                                    description={`${formatBrowser(session.userAgent)}\n${normalizeIpAddress(session.ipAddress)}\nLast active ${formatDate(session.updatedAt)}${sessionSummary}`}
                                    action={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 gap-1.5 px-2 text-[12px] font-[510]"
                                            disabled={!canRevoke || revokingToken === group.id}
                                            onClick={() => onRevokeSessionGroup(group)}
                                        >
                                            {revokingToken === group.id ? (
                                                <Loader2 data-icon="inline-start" className="animate-spin" />
                                            ) : null}
                                            {actionLabel}
                                        </Button>
                                    }
                                />
                            );
                        })
                    )}
                </div>
            </DetailRow>

            <Separator className="bg-black/[0.06]" />

            <DetailRow label="Account termination">
                <button
                    type="button"
                    className="text-[13px] font-[510] leading-[18px] text-red-500 hover:text-red-600"
                    onClick={onDeleteAccount}
                >
                    Delete account
                </button>
            </DetailRow>
        </div>
    );
}

function BillingContent() {
    return (
        <div className="flex h-full flex-col overflow-y-auto px-10 py-8">
            <h2 className="text-[17px] font-bold tracking-[-0.17px] text-[#212126]">
                Billing
            </h2>
            <Separator className="mt-5 bg-black/[0.06]" />
            <div className="flex flex-1 items-center justify-center text-[13px] text-[#747686]">
                Billing details are managed by your organization.
            </div>
        </div>
    );
}

export function UserProfile({
    user: initialUser,
    open,
    onOpenChange,
    defaultTab = "security",
}: UserProfileProps) {
    const router = useRouter();
    const { data: sessionData } = authClient.useSession();
    const user = useMemo(
        () => ((sessionData?.user as UserProfileUser | undefined) ?? initialUser),
        [initialUser, sessionData?.user],
    );
    const currentToken = (sessionData?.session as { token?: string } | undefined)?.token;
    const [tab, setTab] = useState<UserProfileTab>(defaultTab);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [profileForm, setProfileForm] = useState(getInitialForm(user));
    const [verifiedCurrentPassword, setVerifiedCurrentPassword] = useState<string | null>(null);
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [sessionsPending, setSessionsPending] = useState(false);
    const [revokingToken, setRevokingToken] = useState<string | null>(null);
    const sessionGroups = useMemo(
        () => groupDeviceSessions(sessions, currentToken),
        [currentToken, sessions],
    );
    const currentPasswordForm = useForm<CurrentPasswordFormValues>({
        resolver: zodResolver(currentPasswordFormSchema),
        defaultValues: {
            currentPassword: "",
        },
        mode: "onTouched",
    });
    const newPasswordForm = useForm<NewPasswordFormValues>({
        resolver: zodResolver(newPasswordFormSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onTouched",
    });
    const deleteAccountForm = useForm<DeleteAccountFormValues>({
        resolver: zodResolver(deleteAccountFormSchema),
        defaultValues: {
            password: "",
        },
        mode: "onTouched",
    });

    useEffect(() => {
        if (profileOpen) setProfileForm(getInitialForm(user));
    }, [profileOpen, user]);

    useEffect(() => {
        if (!passwordOpen) {
            currentPasswordForm.reset();
            newPasswordForm.reset();
            setVerifiedCurrentPassword(null);
        }
    }, [currentPasswordForm, newPasswordForm, passwordOpen]);

    useEffect(() => {
        if (!deleteOpen) deleteAccountForm.reset();
    }, [deleteAccountForm, deleteOpen]);

    useEffect(() => {
        if (!open || tab !== "security") return;

        let cancelled = false;

        async function loadSessions() {
            setSessionsPending(true);
            const { data, error } = await authClient.listSessions();
            if (cancelled) return;

            if (error) {
                toast.error(error.message ?? "Failed to load active devices.");
                setSessions([]);
            } else {
                setSessions((data ?? []) as ActiveSession[]);
            }

            setSessionsPending(false);
        }

        loadSessions();

        return () => {
            cancelled = true;
        };
    }, [open, tab]);

    const handleTabChange = (nextTab: UserProfileTab) => {
        setTab(nextTab);
        setMobileNavOpen(false);
    };

    const handleUpdateProfile = async () => {
        const firstName = profileForm.firstName.trim();
        const lastName = profileForm.lastName.trim();
        const name = profileForm.name.trim() || [firstName, lastName].filter(Boolean).join(" ").trim();

        if (!name) {
            toast.error("Enter a display name.");
            return;
        }

        setSavingProfile(true);
        try {
            const updateUser = authClient.updateUser as unknown as (input: {
                name: string;
                firstName: string;
                lastName: string;
                image: string | null;
            }) => Promise<{ error?: { message?: string } | null }>;
            const { error } = await updateUser({
                name,
                firstName,
                lastName,
                image: profileForm.image.trim() || null,
            });

            if (error) {
                toast.error(error.message ?? "Failed to update profile.");
                return;
            }

            toast.success("Profile updated.");
            setProfileOpen(false);
            router.refresh();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleVerifyCurrentPassword = async (values: CurrentPasswordFormValues) => {
        setVerifyingPassword(true);
        try {
            const verifyPassword = (authClient as unknown as {
                verifyPassword: (input: {
                    password: string;
                }) => Promise<{ error?: { message?: string } | null }>;
            }).verifyPassword;
            const { error } = await verifyPassword({ password: values.currentPassword });

            if (error) {
                const message = error.message ?? "Current password is incorrect.";
                currentPasswordForm.setError("currentPassword", { message });
                toast.error(message);
                return;
            }

            setVerifiedCurrentPassword(values.currentPassword);
            toast.success("Current password verified.");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setVerifyingPassword(false);
        }
    };

    const handleChangePassword = async (values: NewPasswordFormValues) => {
        if (!verifiedCurrentPassword) {
            toast.error("Verify your current password first.");
            return;
        }
        if (values.newPassword === verifiedCurrentPassword) {
            newPasswordForm.setError("newPassword", {
                message: "Choose a password different from your current password.",
            });
            return;
        }

        setSavingPassword(true);
        try {
            const { error } = await authClient.changePassword({
                currentPassword: verifiedCurrentPassword,
                newPassword: values.newPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                const message = error.message ?? "Current password is incorrect.";
                setVerifiedCurrentPassword(null);
                currentPasswordForm.setError("currentPassword", { message });
                toast.error(message);
                return;
            }

            toast.success("Password updated.");
            setPasswordOpen(false);
            currentPasswordForm.reset();
            newPasswordForm.reset();
            setVerifiedCurrentPassword(null);
            const { data } = await authClient.listSessions();
            setSessions((data ?? []) as ActiveSession[]);
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleRevokeSessionGroup = async (group: DeviceSessionGroup) => {
        const tokens = group.sessions
            .map((session) => session.token)
            .filter((token) => token !== currentToken);

        if (tokens.length === 0) return;

        setRevokingToken(group.id);
        try {
            const results = await Promise.allSettled(
                tokens.map((token) => authClient.revokeSession({ token })),
            );
            const failed = results.filter((result) => {
                if (result.status === "rejected") return true;
                return Boolean(result.value.error);
            });

            if (failed.length > 0) {
                toast.error("Some sessions could not be revoked.");
                return;
            }

            toast.success(tokens.length === 1 ? "Session revoked." : "Old sessions revoked.");
            setSessions((current) => current.filter((item) => !tokens.includes(item.token)));
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setRevokingToken(null);
        }
    };

    const handleDeleteAccount = async (values: DeleteAccountFormValues) => {
        setDeletingAccount(true);
        try {
            const { error } = await authClient.deleteUser({ password: values.password });
            if (error) {
                const message = error.message ?? "Password confirmation failed.";
                deleteAccountForm.setError("password", { message });
                toast.error(message);
                return;
            }

            toast.success("Account deleted.");
            await authClient.signOut().catch(() => null);
            router.push("/sign-in");
            router.refresh();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setDeletingAccount(false);
        }
    };

    return (
        <>
            <AuthDialog
                open={open}
                onOpenChange={onOpenChange}
                title="User Profile"
                description="Manage your account info."
                className="max-w-[468px] md:max-w-[880px]"
            >
                <div className="relative flex h-full min-h-0 flex-col md:flex-row">
                    <button
                        type="button"
                        aria-label="Close account settings"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-5 top-5 z-10 flex size-8 items-center justify-center rounded-md text-[#747686] transition-colors hover:bg-black/[0.04] hover:text-[#212126]"
                    >
                        <X className="size-4" />
                    </button>

                    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-5 md:hidden">
                        <button
                            type="button"
                            aria-label="Open account navigation"
                            onClick={() => setMobileNavOpen((value) => !value)}
                            className="flex size-8 items-center justify-center rounded-md text-[#212126] transition-colors hover:bg-black/[0.04]"
                        >
                            <Menu className="size-4" />
                        </button>
                        <span className="text-[18px] font-bold tracking-[-0.18px] text-[#212126]">
                            Account
                        </span>
                    </header>

                    {mobileNavOpen ? (
                        <div className="border-b border-black/[0.08] bg-[#f7f7f7] px-4 py-3 md:hidden">
                            <SidebarItem
                                icon={UserCircle}
                                label="Profile"
                                active={tab === "profile"}
                                onClick={() => handleTabChange("profile")}
                            />
                            <SidebarItem
                                icon={ShieldCheck}
                                label="Security"
                                active={tab === "security"}
                                onClick={() => handleTabChange("security")}
                            />
                            <SidebarItem
                                icon={CreditCard}
                                label="Billing"
                                active={tab === "billing"}
                                onClick={() => handleTabChange("billing")}
                            />
                        </div>
                    ) : null}

                    <aside className="hidden shrink-0 flex-col justify-between bg-[#f7f7f7] md:flex md:h-full md:w-[220px] md:border-r md:border-black/[0.08]">
                        <div className="flex flex-col">
                            <div className="flex flex-col gap-1 px-8 py-8">
                                <h1 className="text-[22px] font-bold tracking-[-0.44px] text-[#212126]">
                                    Account
                                </h1>
                                <p className="text-[13px] leading-[18px] text-[#747686]">
                                    Manage your account info.
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 px-5">
                                <SidebarItem
                                    icon={UserCircle}
                                    label="Profile"
                                    active={tab === "profile"}
                                    onClick={() => handleTabChange("profile")}
                                />
                                <SidebarItem
                                    icon={ShieldCheck}
                                    label="Security"
                                    active={tab === "security"}
                                    onClick={() => handleTabChange("security")}
                                />
                                {/* <SidebarItem
                                    icon={CreditCard}
                                    label="Billing"
                                    active={tab === "billing"}
                                    onClick={() => handleTabChange("billing")}
                                /> */}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 px-8 py-8 ">
                            <span className="text-[11px] font-[510] text-[#747686]">Secured by</span>
                            <ShikshaCloudWordmark />
                        </div>
                    </aside>

                    <section className="min-h-0 flex-1 overflow-hidden bg-white">
                        {tab === "profile" ? (
                            <ProfileContent user={user} onUpdateProfile={() => setProfileOpen(true)} />
                        ) : null}
                        {tab === "security" ? (
                            <>
                                <div className="hidden h-full md:block">
                                    <SecurityContent
                                        sessionGroups={sessionGroups}
                                        sessionsPending={sessionsPending}
                                        currentToken={currentToken}
                                        revokingToken={revokingToken}
                                        onUpdatePassword={() => setPasswordOpen(true)}
                                        onDeleteAccount={() => setDeleteOpen(true)}
                                        onRevokeSessionGroup={handleRevokeSessionGroup}
                                    />
                                </div>
                                <div className="h-full md:hidden">
                                    <SecurityContent
                                        compact
                                        sessionGroups={sessionGroups}
                                        sessionsPending={sessionsPending}
                                        currentToken={currentToken}
                                        revokingToken={revokingToken}
                                        onUpdatePassword={() => setPasswordOpen(true)}
                                        onDeleteAccount={() => setDeleteOpen(true)}
                                        onRevokeSessionGroup={handleRevokeSessionGroup}
                                    />
                                </div>
                            </>
                        ) : null}
                        {/* {tab === "billing" ? <BillingContent /> : null} */}
                    </section>

                    <footer className="flex shrink-0 flex-col items-center gap-1 border-t border-black/[0.06] bg-[repeating-linear-gradient(135deg,rgba(249,115,22,0.055)_0px,rgba(249,115,22,0.055)_6px,transparent_6px,transparent_13px)] px-5 py-4 md:hidden">
                        <AuthFooter />
                    </footer>
                </div>
            </AuthDialog>

            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Update profile</DialogTitle>
                        <DialogDescription>
                            Change the profile details shown across Shiksha Cloud.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <label className="grid gap-1.5 text-[13px] font-[510] text-[#212126]">
                            First name
                            <Input
                                value={profileForm.firstName}
                                onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
                            />
                        </label>
                        <label className="grid gap-1.5 text-[13px] font-[510] text-[#212126]">
                            Last name
                            <Input
                                value={profileForm.lastName}
                                onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
                            />
                        </label>
                        <label className="grid gap-1.5 text-[13px] font-[510] text-[#212126]">
                            Display name
                            <Input
                                value={profileForm.name}
                                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                            />
                        </label>
                        <label className="grid gap-1.5 text-[13px] font-[510] text-[#212126]">
                            Profile image URL
                            <Input
                                value={profileForm.image}
                                onChange={(event) => setProfileForm((current) => ({ ...current, image: event.target.value }))}
                                placeholder="https://..."
                            />
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProfileOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="gap-2" onClick={handleUpdateProfile} disabled={savingProfile}>
                            {savingProfile ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Change password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one. Other sessions will be revoked.
                        </DialogDescription>
                    </DialogHeader>
                    {!verifiedCurrentPassword ? (
                        <Form {...currentPasswordForm}>
                            <form
                                className="flex flex-col gap-4 py-2"
                                onSubmit={currentPasswordForm.handleSubmit(handleVerifyCurrentPassword)}
                            >
                                <FormField
                                    control={currentPasswordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="current-password"
                                                    aria-invalid={Boolean(currentPasswordForm.formState.errors.currentPassword)}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="gap-2" disabled={verifyingPassword}>
                                        {verifyingPassword ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    ) : (
                        <Form {...newPasswordForm}>
                            <form
                                className="flex flex-col gap-4 py-2"
                                onSubmit={newPasswordForm.handleSubmit(handleChangePassword)}
                            >
                                <FormField
                                    control={newPasswordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    aria-invalid={Boolean(newPasswordForm.formState.errors.newPassword)}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={newPasswordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm new password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    aria-invalid={Boolean(newPasswordForm.formState.errors.confirmPassword)}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setVerifiedCurrentPassword(null);
                                            newPasswordForm.reset();
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" className="gap-2" disabled={savingPassword}>
                                        {savingPassword ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                                        Update password
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-xl border-black/[0.08] sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Delete account</DialogTitle>
                        <DialogDescription>
                            This permanently deletes your account. Enter your password to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...deleteAccountForm}>
                        <form
                            className="flex flex-col gap-4 py-2"
                            onSubmit={deleteAccountForm.handleSubmit(handleDeleteAccount)}
                        >
                            <FormField
                                control={deleteAccountForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                autoComplete="current-password"
                                                aria-invalid={Boolean(deleteAccountForm.formState.errors.password)}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="gap-2"
                                    disabled={deletingAccount}
                                >
                                    {deletingAccount ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                                    Delete account
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
