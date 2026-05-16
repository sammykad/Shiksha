import * as React from "react";
import { ArrowRight, Check, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function OrganizationActionButton({
    children,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex shrink-0 items-center justify-center rounded-[6px] bg-white p-1 text-[12px] font-medium leading-4 text-[#212126] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_0_rgba(0,0,0,0.02),0_2px_3px_-1px_rgba(0,0,0,0.06)] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
        >
            <span className="px-1">{children}</span>
        </button>
    );
}

export function OrganizationRow({
    avatar,
    title,
    subtitle,
    active,
    muted,
    action,
    hideDefaultAction,
    spacious,
    loading,
    onClick,
}: {
    avatar?: React.ReactNode;
    title: string;
    subtitle?: string;
    active?: boolean;
    muted?: boolean;
    action?: React.ReactNode;
    hideDefaultAction?: boolean;
    spacious?: boolean;
    loading?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className={cn(
                "group flex min-h-[68px] w-full items-center gap-3 border-b border-[rgba(0,0,0,0.055)] px-5 py-4 text-left transition-colors disabled:cursor-not-allowed",
                spacious && "min-h-[102px] gap-4 px-7 py-6",
                muted ? "bg-[#f7f7f7]" : "bg-white hover:bg-[#fafafa]",
            )}
        >
            <span className="relative shrink-0">
                {typeof avatar === "string" ? (
                    <Avatar className="rounded-md">
                        <AvatarImage
                            src={avatar || "/organization.svg"}
                            alt={title}
                            className="rounded-md"
                        />
                        <AvatarFallback>{title.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                ) : (
                    avatar ?? (
                        <Avatar className="rounded-md">
                            <AvatarImage
                                src="/organization.svg"
                                alt={title}
                                className="rounded-md"
                            />
                            <AvatarFallback>{title.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    )
                )}

                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-white/75">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </span>
                )}
            </span>
            <span className="min-w-px flex-1">
                <span className={cn(
                    "block truncate text-sm font-semibold leading-5 text-[#212126]",
                    spacious && "text-[20px] font-normal leading-6 tracking-[-0.2px]",
                )}>
                    {title}
                </span>
                {subtitle && (
                    <span className="mt-0 block truncate text-xs font-normal leading-2 text-muted-foreground">
                        {subtitle}
                    </span>
                )}
            </span>
            {action ?? (
                hideDefaultAction ? null : active ? (
                    <Check className="size-4 shrink-0 text-foreground" />
                ) : (
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.25} />
                    </div>
                )
            )}
        </button>
    );
}

export function CreateOrganizationRow({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex min-h-[56px] w-full items-center gap-3 bg-white px-5 py-4 text-left transition-colors hover:bg-[#fafafa]"
        >
            <span className="flex shrink-0 px-1.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-[rgba(0,0,0,0.08)] bg-[#f7f7f7]">
                    <Plus className="size-4 text-muted-foreground" strokeWidth={2.25} />
                </span>
            </span>
            <span className="text-[13px] font-[510] leading-[18px] text-muted-foreground">
                Create Organization
            </span>
        </button>
    );
}
