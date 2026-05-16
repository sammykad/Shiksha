import { cn } from "@/lib/utils";
import { ShikshaCloudWordmark } from "./brand";
import { ShieldCheck } from "lucide-react";

export function AuthFooter({ className }: { className?: string }) {
    return (
        <div className={cn("flex w-full items-center justify-center bg-green-50 px-8 py-4", className)}>
            <div className="flex items-center justify-center gap-2 ">
                <span className="whitespace-nowrap text-[11px] font-medium leading-4 text-green-500 flex items-center gap-1 ">
                    <ShieldCheck size={14} /> Secured by
                </span>
                <ShikshaCloudWordmark />
            </div>
        </div>
    );
}
