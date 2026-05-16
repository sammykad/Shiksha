import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandAuthHeader({
    title = "Choose an account",
    description = "Select an account or organization to continue.",
}: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-6 border-b border-[rgba(0,0,0,0.055)] px-10 py-8 text-center">
            <ShikshaCloudLogo />
            <div className="flex w-full flex-col items-center gap-1">
                <h2 className="whitespace-nowrap text-[17px] font-semibold leading-6 tracking-[-0.17px] text-[#212126]">
                    {title}
                </h2>
                <p className="w-full text-center text-[13px] font-normal leading-[18px] text-[#747686]">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function ShikshaCloudLogo({ className }: { className?: string }) {
    return (
        <Image
            src="/logo.svg"
            alt="Shiksha Cloud"
            width={44}
            height={44}
            className={cn("size-11 shrink-0 rounded-[6px]", className)}
        />
    );
}

export function ShikshaCloudWordmark() {
    return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold leading-4 text-muted-foreground">
            <Image src="/logo.svg" alt="logo" width={16} height={16} className="size-[16px] rounded-sm" />
            Shiksha.cloud
        </span>
    );
}
