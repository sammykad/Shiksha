import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CountBadge({
    count,
    active,
    className,
}: {
    count: number;
    active?: boolean;
    className?: string;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "size-6 rounded-full flex items-center justify-center",
                active
                    ? "border-[#212126] bg-[#212126] text-white"
                    : "border-transparent bg-black/[0.06] text-[#747686]",
                className,
            )}
        >
            {count}
        </Badge>
    );
}
