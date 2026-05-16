import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const normalizedRole = role.toUpperCase();

  const styles: Record<string, string> = {
    ADMIN: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",
    TEACHER: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    STUDENT: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    PARENT: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  };

  const currentStyle = styles[normalizedRole] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-2 py-0 font-bold uppercase tracking-wider",
        currentStyle,
        className
      )}
    >
      {role}
    </Badge>
  );
}
