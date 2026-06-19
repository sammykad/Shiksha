import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icons?: LucideIcon[];
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
        icon?: LucideIcon;
    };
    className?: string;
    image?: string;
    hint?: string;
    compact?: boolean;
}

export function EmptyState({
    title,
    description,
    icons = [],
    action,
    image,
    hint,
    className,
    compact,
}: EmptyStateProps) {

    const iconSize = compact ? 'size-9' : 'size-12';
    const innerIconSize = compact ? 'w-4 h-4' : 'w-6 h-6';

    return (
        <div
            className={cn(
                'bg-background border-border hover:border-border/80 text-center',
                'border-2 border-dashed rounded-xl p-14 w-full max-w-[620px]',
                'group hover:bg-muted/50 transition duration-500 hover:duration-200 dark:bg-muted/50',
                className
            )}
        >
            <div className="flex justify-center items-center ">
                {image ? (
                    <>
                        <div className="h-48 w-48 flex items-center justify-center">
                            <Image
                                src={image}
                                alt="student"
                                width={200}
                                height={200}
                                className="h-48 w-48 object-contain rounded-lg "
                                loading="eager"
                                priority
                            />
                        </div>
                    </>
                ) : null}
            </div>
            {icons.length > 0 && (
                <div className="flex justify-center isolate">
                    {icons.length === 3 ? (
                        <>
                            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                                {React.createElement(icons[0], {
                                    className: 'w-6 h-6 text-muted-foreground',
                                })}
                            </div>
                            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                                {React.createElement(icons[1], {
                                    className: 'w-6 h-6 text-muted-foreground',
                                })}
                            </div>
                            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                                {React.createElement(icons[2], {
                                    className: 'w-6 h-6 text-muted-foreground',
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                            {icons[0] &&
                                React.createElement(icons[0], {
                                    className: 'w-6 h-6 text-muted-foreground',
                                })}
                        </div>
                    )}
                </div>
            )}
            <h2 className={cn("text-foreground font-medium", compact ? "mt-3 text-sm" : "mt-6")}>{title}</h2>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                {description}
            </p>
            {hint && (
                <p className="text-xs text-muted-foreground/70 mt-2 italic">
                    💡 {hint}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    {action.href ? (
                        <Link href={action.href} className='space-x-2 gap-2'>
                            <Button
                                variant="outline"
                                className="shadow-sm active:shadow-none space-x-2"
                            >
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={action.onClick}
                            variant="outline"
                            className="shadow-sm active:shadow-none space-x-2 gap-2"
                        >
                            {action.icon &&
                                React.createElement(action.icon, {
                                    className: 'w-4 h-4',
                                })}
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
