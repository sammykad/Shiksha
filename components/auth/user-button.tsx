"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
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
    const { data: session } = authClient.useSession();
    const user = session?.user ?? initialUser;
    const name = getDisplayName(user);
    const email = user?.email ?? "";
    const image = user?.image ?? null;
    const handleSignOut = async () => {
        const { error } = await authClient.signOut();
        if (error) {
            toast.error(error.message ?? "Failed to sign out.");
            return;
        }
        router.push(afterSignOutUrl);
        router.refresh();
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
                    <div className="flex items-center gap-4 px-5 py-5 border-b border-muted ">
                        <UserAvatar
                            name={name}
                            image={image}
                            className="size-12 rounded-full border border-[#d7d9e0]"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold leading-[1.2] text-[#111827]">
                                {name}
                            </p>
                            {email ? (
                                <p className="mt-1 truncate text-md leading-[1.35] text-[#5f6673]">
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
                            className="flex w-full items-center gap-4 px-6 py-5 text-left appearance-none border-0 bg-transparent transition-colors hover:bg-[#f8fafc]"
                        >
                            <Settings className="size-5 shrink-0 text-[#626874]" strokeWidth={2.2} />
                            <span className="text-[16px] font-normal text-[#4b5563]">
                                Manage account
                            </span>
                        </button>

                        <Separator className="m-0 h-px bg-[#eef0f3]" />

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-4 px-6 py-5 text-left appearance-none border-0 bg-transparent transition-colors hover:bg-[#f8fafc]"
                        >
                            <LogOut className="size-5 shrink-0 text-[#626874]" strokeWidth={2.2} />
                            <span className="text-[16px] font-normal text-[#4b5563]">
                                Sign out
                            </span>
                        </button>
                    </div>
                    <div
                        className={cn(
                            "border-t border-muted px-5 py-5",
                            "bg-[repeating-linear-gradient(135deg,rgba(249,115,22,0.03)_0px,rgba(249,115,22,0.03)_10px,transparent_10px,transparent_20px)]"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2 text-[14px] text-[#6b7280]">
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