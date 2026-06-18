"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ShikshaCloudWordmark } from "./_components/brand";
import { UserAvatar } from "./_components/user-avatar";
import { UserProfile } from "./user-profile";
type UserButtonUser = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
};
interface UserButtonProps {
    user?: UserButtonUser;
    className?: string;
    afterSignOutUrl?: string;
}
function getDisplayName(user?: UserButtonUser | null) {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return fullName || user?.name || user?.email || "User";
}
export function UserButton({
    user: initialUser,
    className,
    afterSignOutUrl = "/sign-in",
}: UserButtonProps) {
    const router = useRouter();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isSigningOut, startSignOutTransition] = useTransition();
    const { data: session } = authClient.useSession();
    const user = session?.user ?? initialUser;
    const name = getDisplayName(user);
    const email = user?.email ?? "";
    const image = user?.image ?? null;
    const handleSignOut = () => {
        if (isSigningOut) return;

        startSignOutTransition(async () => {
            try {
                const { error } = await authClient.signOut();
                if (error) {
                    toast.error(error.message ?? "Failed to sign out. Please try again.");
                    return;
                }

                router.push(afterSignOutUrl);
            } catch {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };
    return (
        <>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Open user menu"
                        className={cn(
                            "size-6 rounded-full p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                            className
                        )}
                    >
                        <UserAvatar
                            name={name}
                            image={image}
                            className="size-10 rounded-full border border-[#d7d9e0]"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    sideOffset={12}
                    className={cn(
                        "w-[420px] gap-0 overflow-hidden rounded-xl border border-[#dcdfe4] bg-white p-0 leading-none",
                        "shadow-[0_20px_50px_rgba(17,24,39,0.16),0_2px_10px_rgba(17,24,39,0.06)]",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    )}
                >
                    <div className="flex items-center gap-3 border-b border-muted px-4 py-4">
                        <UserAvatar
                            name={name}
                            image={image}
                            className="size-10 rounded-full border border-[#d7d9e0]"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-[1.2] text-[#111827]">
                                {name}
                            </p>
                            {email ? (
                                <p className="mt-0.5 truncate text-xs leading-[1.35] text-[#5f6673]">
                                    {email}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setPopoverOpen(false);
                                setProfileOpen(true);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8fafc]"
                        >
                            <Settings className="size-4 shrink-0 text-[#626874]" strokeWidth={2.2} />
                            <span className="text-sm font-normal text-[#4b5563]">
                                Manage account
                            </span>
                        </button>

                        <Separator className="m-0 h-px bg-[#eef0f3]" />

                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSigningOut ? (
                                <Loader2 className="size-4 shrink-0 animate-spin text-[#626874]" strokeWidth={2.2} />
                            ) : (
                                <LogOut className="size-4 shrink-0 text-[#626874]" strokeWidth={2.2} />
                            )}
                            <span className="text-sm font-normal text-[#4b5563]">
                                {isSigningOut ? "Signing out..." : "Sign out"}
                            </span>
                        </button>
                    </div>
                    <div className="border-t border-muted px-4 py-4">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                                <span>Secured by</span>
                                <ShikshaCloudWordmark />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <UserProfile
                user={user}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </>
    );
}
