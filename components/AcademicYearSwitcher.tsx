"use client";

import { useState } from "react";
import { useAcademicYear } from "@/context/AcademicYearContext";
import {
  CalendarDays,
  ChevronDown,
  Check,
  Clock,
  BadgeCheck,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AcademicYearSwitcher() {
  const [open, setOpen] = useState(false);
  const { years, viewingYear, currentYear, setViewingYear, isViewingPastYear, isPending } =
    useAcademicYear();

  if (!years.length) return null;

  const pastYears = years.filter((y) => !y.isCurrent);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium",
            "transition-all duration-200 outline-none disabled:cursor-not-allowed",
            isViewingPastYear
              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse transition-all duration-500"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
        >
          {/* Always show icon */}
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          )}

          {/* Hide everything below sm */}
          <span className="hidden sm:inline max-w-[110px] truncate">
            {viewingYear?.name ?? "Select year"}
          </span>

          {!isViewingPastYear && (
            <Badge
              variant="secondary"
              className="hidden sm:flex h-4 px-1 text-[10px]"
            >
              Current
            </Badge>
          )}

          <ChevronDown
            className={cn(
              "hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <Command>
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Academic Year
            </span>
          </div>

          <CommandInput placeholder="Search academic year..." className="h-9" />

          <CommandList className="max-h-[300px]">
            <CommandEmpty>No Academic Year found.</CommandEmpty>

            {/* Current Year */}
            <CommandGroup heading="Active Academic Year">
              {years
                .filter((y) => y.isCurrent)
                .map((year) => (
                  <CommandItem
                    key={year.id}
                    value={year.name}
                    disabled={isPending}
                    onSelect={() => {
                      setViewingYear(year.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{year.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Latest records & actions apply here
                        </span>
                      </div>
                    </div>

                    {viewingYear?.id === year.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>

            {/* Past Years */}
            {pastYears.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Past Academic Years">
                  {pastYears.map((year) => (
                    <CommandItem
                      key={year.id}
                      value={year.name}
                      disabled={isPending}
                      onSelect={() => {
                        setViewingYear(year.id);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{year.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Viewing historical data only
                          </span>
                        </div>
                      </div>

                      {viewingYear?.id === year.id && (
                        <Check className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Footer hint when viewing past year */}
            {isViewingPastYear && (
              <>
                <CommandSeparator />
                <div className="flex items-start gap-2 bg-amber-50/50 px-3 py-3 dark:bg-amber-950/20">
                  <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-[10px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                    <span className="font-bold">Historical Mode:</span> You are viewing data from {viewingYear?.name}.
                    Any new entries will still be registered in <span className="font-bold">{currentYear?.name}</span>.
                  </p>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
