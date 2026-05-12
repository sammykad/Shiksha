'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryState, createParser } from 'nuqs';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

// Custom parser that preserves local date without timezone conversion
const parseAsLocalDate = createParser({
    parse: (value: string) => {
        // Parse YYYY-MM-DD as local date (not UTC)
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    },
    serialize: (date: Date) => {
        // Serialize as YYYY-MM-DD using local date components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
});

export function AnalyticsDateFilter() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [date, setDate] = useQueryState(
        'date',
        parseAsLocalDate.withDefault(new Date()).withOptions({
            shallow: false,
        })
    );

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
            startTransition(() => {
                router.refresh();
            });
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                    disabled={isPending}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-full sm:w-auto p-0"
                align="end"
            >
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                    }
                    className="rounded-md border shadow"
                />
            </PopoverContent>
        </Popover>
    );
}
