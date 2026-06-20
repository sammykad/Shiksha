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
                "isolate flex w-full max-w-[400px] flex-col items-center overflow-hidden rounded-xl bg-background shadow-md ring-1 ring-black/[0.06]",
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
                "w-full overflow-hidden border-t border-border/60",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}