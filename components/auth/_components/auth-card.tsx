import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AuthCard({
    children,
    className,
    ...props
}: {
    children: ReactNode;
    className?: string;
} & ComponentPropsWithoutRef<"div">) {
    return (
        <div
            data-slot="auth-card"
            className={cn(
                "isolate flex w-full max-w-[400px] flex-col items-center overflow-hidden rounded-[6px] bg-[#f7f7f7] shadow-lg",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function AuthCardPanel({
    children,
    className,
    ...props
}: {
    children: ReactNode;
    className?: string;
} & ComponentPropsWithoutRef<"div">) {
    return (
        <div
            data-slot="auth-card-panel"
            className={cn(
                "z-[2] w-full overflow-hidden rounded-[6px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.055),0_1px_2px_rgba(0,0,0,0.04),0_0_2px_rgba(0,0,0,0.06)]",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
