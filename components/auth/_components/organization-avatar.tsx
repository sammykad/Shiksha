"use client";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import DefaultOrgIcon from "./organization.svg";

export function OrganizationAvatar({
    name,
    logo,
    className,
    size = 36,
}: {
    name: string;
    logo?: string | null;
    className?: string;
    /** Pixel size passed to Next.js Image. Defaults to 36. */
    size?: number;
}) {
    return (
        <Avatar
            className={cn(
                "shrink-0 rounded-sm",
                "size-9",
                className,
            )}
        >
            {logo ? <AvatarImage src={logo} alt={name} /> : null}
            {/* If the image fails to load or isn't provided, fall through to default icon */}
            <AvatarFallback>
                <Image
                    src={DefaultOrgIcon}
                    alt={name}
                    width={size}
                    height={size}
                    className="object-cover"
                />
            </AvatarFallback>
        </Avatar>
    );
}
