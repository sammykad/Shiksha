"use client";

import { useState } from "react";
import { ChevronsUpDown, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ShikshaCloudWordmark } from "./_components/brand";
import { OrganizationAvatar } from "./_components/organization-avatar";
import { UserAvatar } from "./_components/user-avatar";
import type { OrganizationLike } from "./types";
import { OrganizationList } from "./organization-list";
import { OrganizationProfile } from "./organization-profile";
import { AuthFooter } from "./_components/auth-footer";

function formatRole(role?: string | null) {
    return (role ?? "ADMIN").toUpperCase();
}

interface OrganizationSwitcherProps {
    isCollapsed?: boolean;
    afterSelectOrganizationUrl?: string;
}

export function OrganizationSwitcher({
    isCollapsed = false,
    afterSelectOrganizationUrl = '/dashboard',
}: OrganizationSwitcherProps) {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const userName = session?.user?.name ?? session?.user?.email ?? "Personal account";
    const organization = activeOrg as OrganizationLike | null | undefined;
    const displayName = organization?.name ?? userName;
    const role = formatRole(organization?.role);

    const triggerAvatar = organization ? (
        <OrganizationAvatar
            name={organization.name}
            logo={organization.logo}
            size={isCollapsed ? 32 : 24}
            className={cn("rounded-[5px]", isCollapsed ? "size-8" : "size-6")}
        />
    ) : (
        <UserAvatar
            name={userName}
            image={session?.user?.image}
            className={cn("rounded-[5px]", isCollapsed ? "size-8" : "size-6")}
        />
    );

    return (
        <>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    {isCollapsed ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Switch organization"
                            className="mx-auto size-11 rounded-[10px] p-0"
                        >
                            {triggerAvatar}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            className="group h-auto w-full justify-start gap-2.5 rounded-[8px] px-2 py-1.5"
                        >
                            {triggerAvatar}
                            <span className="min-w-0 flex-1 truncate text-left text-[13px] font-[560] leading-[18px] text-[#111827] dark:text-white">
                                {displayName}
                            </span>
                            <ChevronsUpDown data-icon="inline-end" className="text-[#9ca3af]" />
                        </Button>
                    )}
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    sideOffset={8}
                    className="w-[min(460px,calc(100vw-32px))] gap-0 overflow-hidden rounded-[10px] border border-black/[0.08] bg-[#f7f7f7] p-0 shadow-[0_10px_30px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.04)]"
                >
                    {organization ? (
                        <div className="flex items-center gap-4 border-b border-black/[0.06] bg-white px-7 py-6">
                            <OrganizationAvatar
                                name={organization.name}
                                logo={organization.logo}
                                size={38}
                                className="size-[38px] rounded-[8px]"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium leading-6 tracking-[-0.2px]">
                                    {organization.name}
                                </p>
                                <p className="truncate text-xs font-medium leading-5 text-muted-foreground">
                                    {role}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 shrink-0 gap-2 rounded-md border-black/[0.08] bg-white px-3.5 text-base font-normal text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-white"
                                onClick={() => {
                                    setPopoverOpen(false);
                                    setProfileOpen(true);
                                }}
                            >
                                <Settings data-icon="inline-start" />
                                Manage
                            </Button>
                        </div>
                    ) : null}

                    <div className="max-h-[408px] overflow-y-auto bg-white">
                        <OrganizationList
                            compact
                            hidePersonalAccount
                            hideCreateOrganizationButton
                            excludeActiveOrganization
                            showOrganizationRole={true}
                            showDefaultActions
                            afterSelectOrganizationUrl={afterSelectOrganizationUrl}
                        />
                    </div>
                    <AuthFooter />
                </PopoverContent>
            </Popover>

            {organization ? (
                <OrganizationProfile
                    org={organization}
                    open={profileOpen}
                    onOpenChange={setProfileOpen}
                />
            ) : null}

        </>
    );
}
