import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
    name,
    image,
    className,
}: {
    name: string;
    image?: string | null;
    className?: string;
}) {
    return (
        <Avatar className={cn("size-9 shrink-0 rounded-[6px]", className)}>
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="rounded-[6px] bg-gradient-to-br from-[#dfe8ef] to-[#f8fafc] text-[13px] font-medium text-[#4b5563]">
                {name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}
