import type { ReactNode } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AuthDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "h-[min(704px,calc(100vh-32px))] w-[calc(100vw-32px)] max-w-[960px] gap-0 overflow-hidden rounded-xl border-0 bg-[#f7f7f7] p-0 shadow-[0_10px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] md:w-[min(960px,calc(100vw-32px))]",
                    className,
                )}
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>
                {description ? (
                    <DialogDescription className="sr-only">{description}</DialogDescription>
                ) : null}
                {children}
            </DialogContent>
        </Dialog>
    );
}
