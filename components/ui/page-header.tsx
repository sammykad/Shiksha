import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    /** Page title */
    title: string;
    /** Optional subtitle / description */
    description?: string;
    /** Optional lucide icon shown left of the title */
    icon?: LucideIcon;
    /** Action buttons / links rendered on the right */
    actions?: ReactNode;
    /** Extra className on the root Card */
    className?: string;
}

/**
 * PageHeader — one consistent header for every page in the app.
 *
 * On mobile  : icon + title/description stacked above full-width buttons
 * On sm+     : icon + title on the left, buttons auto-width on the right
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Teacher Fees Dashboard"
 *   description="Manage your assigned student fees"
 *   icon={IndianRupeeIcon}
 *   actions={
 *     <>
 *       <Link href="/dashboard/fees/admin/assign">
 *         <Button size="sm" className="w-full sm:w-auto">
 *           <PlusIcon className="mr-2 h-3.5 w-3.5" />Assign Fees
 *         </Button>
 *       </Link>
 *       <Link href="/dashboard/attendance/mark" className="contents">
 *         <Button size="sm" variant="outline" className="w-full sm:w-auto">
 *           Take Attendance
 *         </Button>
 *       </Link>
 *     </>
 *   }
 * />
 * ```
 */
export function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <Card className={cn('relative overflow-hidden', className)}>
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 md:px-5 md:py-4">

                {/* Left — icon + text */}
                <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && (
                        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-muted border border-border/50">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-[15px] font-semibold leading-tight text-foreground truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right — actions
                    Mobile  : flex row, each child gets flex-1 so buttons share full width equally
                    sm+     : flex row, children revert to natural width (flex-none)           */}
                {actions && (
                    <div className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none flex-shrink-0 max-sm:mt-2">
                        {actions}
                    </div>
                )}

            </div>
        </Card>
    );
}
