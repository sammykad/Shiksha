"use client";

/**
 * CreateOrganization — two-step wizard
 *   Step 1 : Create org   (logo + name + slug)
 *   Step 2 : Invite members (emails + role)
 *
 * Card shell / footer / branding intentionally match OrganizationList so both
 * components feel like one coherent product.
 *
 * Tech: shadcn/ui Form · Sonner toasts · Better Auth
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Upload, X, Loader2 } from "lucide-react";

import { Role } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage as getBetterAuthErrorMessage } from "@/lib/auth-errors";
import { useUploadFile } from "@/hooks/use-upload-file";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";
import { BrandAuthHeader } from "./_components/brand";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LOGO_BYTES = 3 * 1024 * 1024; // 3 MB

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function parseEmails(raw: string): string[] {
    return raw
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
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

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const orgSchema = z.object({
    name: z
        .string()
        .min(1, "Organization name is required.")
        .max(64, "Name must be 64 characters or fewer.")
        .trim(),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters.")
        .max(48, "Slug must be 48 characters or fewer.")
        .regex(
            /^[a-z0-9]+(-[a-z0-9]+)*$/,
            "Only lowercase letters, numbers, and hyphens."
        ),
});

const inviteSchema = z.object({
    emails: z
        .string()
        .trim()
        .refine((val) => {
            if (!val) return true;
            const list = parseEmails(val);
            if (list.length === 0) return true;
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return list.every((e) => re.test(e));
        }, "One or more email addresses are invalid.")
        .refine(
            (val) => parseEmails(val).length <= 20,
            "You can invite at most 20 members at once."
        ),
    role: z.nativeEnum(Role),
});

type OrgValues = z.infer<typeof orgSchema>;
type InviteValues = z.infer<typeof inviteSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateOrganizationProps {
    /** Redirect after the full wizard completes. */
    afterCreateOrganizationUrl?: string;
    /** Called once org is created AND invite step is done / skipped. */
    onSuccess?: (org: { id: string; name: string; slug: string }) => void;
    /**
     * Called when the user clicks "Cancel" on step 1.
     * In OrganizationList this is () => setShowCreate(false).
     */
    onCancel?: () => void;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

/**
 * Footer — identical stripe + "Secured by" treatment as OrganizationList.
 *
 * OrganizationList's footer is a plain `bg-[#f7f7f7]` band with a wordmark.
 * The Clerk screenshot adds warm diagonal stripes. We merge both: stripes over
 * the same warm-white base so it reads as one unified design.
 */
/**
 * Card shell — border-radius, shadow, and border match OrganizationList's
 * inner `.rounded-[6px]` card exactly.
 */
function Card({ children }: { children: React.ReactNode }) {
    return (
        <AuthCard className="max-w-[480px] shadow-xl">
            <AuthCardPanel>
                {children}
            </AuthCardPanel>
            <AuthFooter />
        </AuthCard>
    );
}

/**
 * Shared text-field class that matches Clerk's input look:
 * warm-gray border, blue ring on focus, no inner glow.
 */
const fieldCls = (hasError?: boolean) =>
    cn(
        "w-full rounded-md border bg-white px-3 py-[7px]",
        "text-[13.5px] text-[#212126] placeholder:text-[#b0acaa] leading-snug",
        "outline-none transition-shadow duration-100",
        "focus:outline-none focus:ring-[1.5px] focus:border-transparent",
        hasError
            ? "border-red-400 focus:ring-red-400"
            : "border-[#c4bfbb] focus:ring-[#4c6ef5]"
    );

// ─── Step 1 — Create Org ──────────────────────────────────────────────────────

interface Step1Props {
    onCreated: (org: { id: string; name: string; slug: string }) => void;
    onCancel?: () => void;
}

function StepCreateOrg({ onCreated, onCancel }: Step1Props) {
    const { onUpload, isUploading, progresses, resetUploadState } = useUploadFile("organizationLogo");
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<OrgValues>({
        resolver: zodResolver(orgSchema),
        defaultValues: { name: "", slug: "" },
        mode: "onBlur",
    });

    // Tracks whether the user has manually typed in the slug field.
    const slugManualRef = useRef(false);

    const handleNameChange = (value: string, onChange: (v: string) => void) => {
        onChange(value);
        if (!slugManualRef.current) {
            form.setValue("slug", toSlug(value), { shouldValidate: false });
        }
    };

    // ── Logo helpers ──────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
        };
    }, [logoPreview]);

    const clearLogo = useCallback(() => {
        setLogo(null);
        setLogoError(null);
        resetUploadState();
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [logoPreview, resetUploadState]);

    const processFile = useCallback(
        (file: File) => {
            setLogoError(null);
            if (!file.type.startsWith("image/")) {
                setLogoError("Please upload an image file.");
                return;
            }
            if (file.size > MAX_LOGO_BYTES) {
                setLogoError("Logo must be 3 MB or smaller.");
                return;
            }
            resetUploadState();
            setLogo(file);
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            setLogoPreview(URL.createObjectURL(file));
        },
        [logoPreview, resetUploadState]
    );

    const removeLogo = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearLogo();
    };

    const handleCancel = () => {
        clearLogo();
        onCancel?.();
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        },
        [processFile]
    );

    // ── Submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (values: OrgValues) => {
        let logoUrl: string | undefined;
        if (logo) {
            try {
                const res = await onUpload([logo]);
                if (res && res[0]) {
                    logoUrl = res[0].url;
                } else {
                    toast.error("Failed to upload logo. Please try again.");
                    return;
                }
            } catch {
                toast.error("Failed to upload logo. Please try again.");
                return;
            }
        }

        try {
            const { data, error } = await authClient.organization.create({
                name: values.name.trim(),
                slug: values.slug,
                logo: logoUrl,
            });

            if (error) {
                const rawMessage = error.message ?? "";
                const message = getBetterAuthErrorMessage(error, {
                    fallback: "Failed to create organization. Please check the details and try again.",
                });
                if (rawMessage.toLowerCase().includes("slug")) {
                    form.setError("slug", {
                        message: "This slug is already taken. Please choose another.",
                    });
                } else if (rawMessage.toLowerCase().includes("name")) {
                    form.setError("name", { message });
                } else {
                    toast.error(message);
                }
                return;
            }

            if (data) {
                await authClient.organization.setActive({ organizationId: data.id });
                onCreated({ id: data.id, name: data.name, slug: data.slug });
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    };

    const isSubmitting = form.formState.isSubmitting || isUploading;
    const logoProgress = logo ? progresses[logo.name] ?? 0 : 0;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <BrandAuthHeader
                    title="Create organization"
                    description="Add the basics. You can finish settings later."
                />
                {/* ── Body ── */}
                <div className="flex flex-col gap-5 px-7 py-6">
                    {/* Title */}
                    {/* Logo */}
                    <div className="space-y-1.5">
                        <span className="block text-[12.5px] font-medium text-[#212126]">
                            Organization logo
                        </span>
                        <div className="flex items-center gap-3">
                            {/* Drop-zone */}
                            <div
                                role="button"
                                tabIndex={0}
                                aria-label="Upload logo"
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && fileInputRef.current?.click()
                                }
                                onDrop={handleDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                className={cn(
                                    "relative flex-shrink-0 size-16 rounded-xl overflow-hidden",
                                    "border border-dashed flex items-center justify-center",
                                    "cursor-pointer select-none transition-colors",
                                    isDragging
                                        ? "border-[#4c6ef5] bg-[#f5f7ff]"
                                        : "border-[#ccc8c4] hover:border-[#aaa] bg-white"
                                )}
                            >
                                {logoPreview ? (
                                    <>
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {/* Remove badge */}
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            aria-label="Remove logo"
                                            className="absolute -top-0.5 -right-0.5 z-10 size-[15px] bg-[#333] text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            <X className="size-[9px]" />
                                        </button>
                                    </>
                                ) : (
                                    <Building2 className="size-6 text-[#b0acaa]" strokeWidth={1.8} />
                                )}
                            </div>

                            {/* Upload button + hint */}
                            <div className="flex flex-col gap-[5px]">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="self-start px-3 py-[5px] text-[13px] font-medium text-[#212126] bg-white border border-[#c4bfbb] rounded-md hover:bg-[#fafafa] transition-colors"
                                >
                                    {logo ? "Change" : "Upload logo"}
                                </button>
                                <p className="text-[11.5px] text-[#9c9896] leading-tight">
                                    Square PNG, JPG, or WebP. Max 3 MB.
                                </p>
                                {isUploading && logo && (
                                    <div className="h-1.5 w-36 overflow-hidden rounded-full bg-[#eeeeef]">
                                        <div
                                            className="h-full rounded-full bg-[#212126] transition-all"
                                            style={{ width: `${Math.max(8, logoProgress)}%` }}
                                        />
                                    </div>
                                )}
                                {logoError && (
                                    <p className="text-[11.5px] text-red-500">{logoError}</p>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) processFile(file);
                                    // Reset so the same file can be re-selected
                                    e.target.value = "";
                                }}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[12.5px] font-medium text-[#212126]">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="Organization name"
                                        autoComplete="off"
                                        autoFocus
                                        onChange={(e) =>
                                            handleNameChange(e.target.value, field.onChange)
                                        }
                                        className={fieldCls(!!form.formState.errors.name)}
                                    />
                                </FormControl>
                                <FormMessage className="text-[11.5px]" />
                            </FormItem>
                        )}
                    />

                    {/* Slug */}
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[12.5px] font-medium text-[#212126]">
                                    Slug
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="my-org"
                                        autoComplete="off"
                                        onChange={(e) => {
                                            slugManualRef.current = true;
                                            // Only allow valid slug characters live
                                            field.onChange(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9-]/g, "")
                                            );
                                        }}
                                        onBlur={() => {
                                            // Clean up on blur
                                            field.onChange(
                                                field.value
                                                    .replace(/-+/g, "-")
                                                    .replace(/^-|-$/g, "")
                                            );
                                            field.onBlur();
                                        }}
                                        className={fieldCls(!!form.formState.errors.slug)}
                                    />
                                </FormControl>
                                <FormMessage className="text-[11.5px]" />
                                {!form.formState.errors.slug && field.value && (
                                    <p className="text-[11.5px] text-[#9c9896]">
                                        Your organization URL:{" "}
                                        <span className="font-medium text-[#555]">
                                            {field.value}
                                        </span>
                                    </p>
                                )}
                            </FormItem>
                        )}
                    />
                </div>

                {/* ── Actions: Cancel  |  Create organization ── */}
                <div className="flex items-center justify-end gap-1.5 border-t border-[rgba(0,0,0,0.055)] px-7 py-4">
                    {/*
                     * Cancel is always rendered because OrganizationList always
                     * passes onCancel={() => setShowCreate(false)}.
                     * We fall back gracefully when used standalone (onCancel undefined).
                     */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-3 py-[6px] text-[13px] font-[510] text-[#747686] hover:text-[#212126] hover:bg-[#f4f4f5] rounded-md transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3.5 py-[7px]",
                            "text-[13px] font-[510] rounded-md transition-colors",
                            "bg-[#1a1926] hover:bg-[#0f0f1a] text-white",
                            "disabled:opacity-55 disabled:cursor-not-allowed"
                        )}
                    >
                        {isSubmitting && (
                            <Loader2 className="size-3.5 animate-spin" />
                        )}
                        Create organization
                    </button>
                </div>
            </form>
        </Form>
    );
}

// ─── Step 2 — Invite Members ──────────────────────────────────────────────────

interface Step2Props {
    org: { id: string; name: string; slug: string };
    onDone: () => void;
}

function StepInviteMembers({ org, onDone }: Step2Props) {
    const { data: session } = authClient.useSession();
    const form = useForm<InviteValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { emails: "", role: Role.TEACHER },
        mode: "onSubmit",
    });

    const isSubmitting = form.formState.isSubmitting;

    const handleSkip = () => {
        toast.success(`"${org.name}" is ready!`);
        onDone();
    };

    const onSubmit = async (values: InviteValues) => {
        const emailList = parseEmails(values.emails);

        // Empty textarea = skip
        if (emailList.length === 0) {
            handleSkip();
            return;
        }

        // Deduplicate silently; report if any were dropped
        const unique = Array.from(new Set(emailList));
        const dupeCount = emailList.length - unique.length;
        const currentUserEmail = session?.user?.email?.trim().toLowerCase();
        const existingMembers = currentUserEmail
            ? unique.filter((email) => email === currentUserEmail)
            : [];
        const sendableEmails = unique.filter((email) => !existingMembers.includes(email));

        if (existingMembers.length > 0) {
            toast.error(
                existingMembers.length === 1
                    ? `${existingMembers[0]} is already a member.`
                    : `${existingMembers.length} emails are already members.`
            );
        }

        if (sendableEmails.length === 0) {
            return;
        }

        try {
            const results = await Promise.allSettled(
                sendableEmails.map(async (email) => {
                    const { error } = await authClient.organization.inviteMember({
                        organizationId: org.id,
                        email,
                        role: values.role,
                    });
                    return { email, error };
                })
            );

            const failed = results.filter((result) => {
                if (result.status === "rejected") return true;
                return Boolean(result.value.error);
            });
            const succeeded = results.filter((result) => {
                if (result.status !== "fulfilled") return false;
                return !result.value.error;
            });

            if (failed.length === 0) {
                const note =
                    dupeCount > 0
                        ? ` (${dupeCount} duplicate${dupeCount !== 1 ? "s" : ""} skipped)`
                        : "";
                toast.success(
                    `Sent ${succeeded.length} invitation${succeeded.length !== 1 ? "s" : ""}${note}.`
                );
            } else if (succeeded.length === 0) {
                const firstFailure = failed[0];
                const message =
                    firstFailure.status === "rejected"
                        ? firstFailure.reason instanceof Error
                            ? firstFailure.reason.message
                            : "Invitation request failed."
                        : `${firstFailure.value.email}: ${getAuthErrorMessage(firstFailure.value.error, "Invitation failed.")}`;
                toast.error(message);
                return;
            } else {
                const firstFailure = failed[0];
                const message =
                    firstFailure.status === "rejected"
                        ? firstFailure.reason instanceof Error
                            ? firstFailure.reason.message
                            : "Invitation request failed."
                        : `${firstFailure.value.email}: ${getAuthErrorMessage(firstFailure.value.error, "Invitation failed.")}`;
                toast.error(message);
                toast.warning(
                    `Sent ${succeeded.length} invitation${succeeded.length !== 1 ? "s" : ""}. ${failed.length} failed — please retry those addresses.`
                );
            }

            onDone();
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                {/* Body */}
                <div className="space-y-5 px-8 pb-6 pt-8 sm:px-9">
                    <h2 className="text-xl font-semibold leading-7 text-[#212126]">
                        Invite new members
                    </h2>

                    {/* Email textarea — no label, plain like the Clerk screenshot */}
                    <FormField
                        control={form.control}
                        name="emails"
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                                <FormControl>
                                    <textarea
                                        {...field}
                                        rows={4}
                                        placeholder="example@email.com, example2@email.com"
                                        autoFocus
                                        className={cn(
                                            "min-h-36 w-full rounded-md border bg-white px-3.5 py-3",
                                            "text-[14px] text-[#212126] placeholder:text-[#b0acaa]",
                                            "resize-none leading-relaxed",
                                            "outline-none transition-shadow duration-100",
                                            "focus:outline-none focus:ring-[1.5px] focus:border-transparent",
                                            form.formState.errors.emails
                                                ? "border-red-400 focus:ring-red-400"
                                                : "border-[#c4bfbb] focus:ring-[#4c6ef5]"
                                        )}
                                    />
                                </FormControl>
                                <FormMessage className="text-[11.5px] pt-1.5" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Action row: Role pill | · | Skip | Send invitations */}
                <div className="flex flex-col gap-3 px-8 pb-8 sm:flex-row sm:items-center sm:px-9">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="flex-shrink-0 space-y-0">
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            className={cn(
                                                "h-9 rounded-md border border-[#c4bfbb] bg-white",
                                                "text-[13px] font-[510] text-[#212126]",
                                                "w-full gap-1 pl-3 pr-2 sm:w-auto",
                                                "focus:ring-[1.5px] focus:ring-[#212126] focus:border-transparent"
                                            )}
                                        >
                                            <span className="text-[12.5px] font-normal text-[#747686]">
                                                Role:
                                            </span>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(Role).map((r) => (
                                            <SelectItem
                                                key={r}
                                                value={r}
                                                className="text-[13px]"
                                            >
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <div className="hidden flex-1 sm:block" />

                    <button
                        type="button"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="h-9 rounded-md px-3 text-[13px] font-[510] text-[#747686] transition-colors hover:bg-[#f4f4f5] hover:text-[#212126] disabled:opacity-50"
                    >
                        Skip
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "inline-flex h-9 items-center justify-center gap-1.5 px-4",
                            "text-[13px] font-[510] rounded-md transition-colors",
                            "bg-[#1a1926] hover:bg-[#0f0f1a] text-white",
                            "disabled:opacity-55 disabled:cursor-not-allowed"
                        )}
                    >
                        {isSubmitting && (
                            <Loader2 className="size-3.5 animate-spin" />
                        )}
                        Send invitations
                    </button>
                </div>
            </form>
        </Form>
    );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

type Step = "create" | "invite";

export function CreateOrganization({
    afterCreateOrganizationUrl,
    onSuccess,
    onCancel,
}: CreateOrganizationProps) {
    const router = useRouter();

    const [step, setStep] = useState<Step>("create");
    const [createdOrg, setCreatedOrg] = useState<{
        id: string;
        name: string;
        slug: string;
    } | null>(null);

    const handleCreated = (org: { id: string; name: string; slug: string }) => {
        setCreatedOrg(org);
        setStep("invite");
    };

    const handleDone = () => {
        if (!createdOrg) return;
        onSuccess?.(createdOrg);
        if (afterCreateOrganizationUrl) {
            router.push(afterCreateOrganizationUrl);
            router.refresh();
        }
    };

    return (
        <Card>
            {step === "create" && (
                <StepCreateOrg onCreated={handleCreated} onCancel={onCancel} />
            )}
            {step === "invite" && createdOrg && (
                <StepInviteMembers org={createdOrg} onDone={handleDone} />
            )}
        </Card>
    );
}
