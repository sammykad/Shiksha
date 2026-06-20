"use client"

import { useState } from "react"
import { useAcademicYear } from "@/context/AcademicYearContext"
import { CalendarDays, ChevronDown, Check, Clock, BadgeCheck, Eye, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AcademicYearSetupDialog } from "@/components/AcademicYearSetupDialog"

interface AcademicYear {
  id: string
  name: string
  isCurrent: boolean
}

function YearItem({
  year,
  isSelected,
  isPending,
  onSelect,
}: {
  year: AcademicYear
  isSelected: boolean
  isPending: boolean
  onSelect: () => void
}) {
  const isCurrent = year.isCurrent

  return (
    <CommandItem
      value={year.name}
      disabled={isPending}
      onSelect={onSelect}
      className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            isCurrent ? "bg-primary/10" : "bg-muted"
          )}
        >
          {isCurrent ? (
            <BadgeCheck className="h-4 w-4 text-primary" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{year.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {isCurrent
              ? "Latest records & actions apply here"
              : "Viewing historical data only"}
          </span>
        </div>
      </div>

      {isSelected && (
        <Check
          className={cn(
            "h-4 w-4 shrink-0",
            isCurrent ? "text-primary" : "text-amber-500"
          )}
        />
      )}
    </CommandItem>
  )
}

function HistoricalModeBanner({
  viewingYear,
  currentYear,
}: {
  viewingYear: AcademicYear
  currentYear: AcademicYear
}) {
  return (
    <>
      <CommandSeparator />
      <div className="flex items-start gap-2 bg-amber-50/50 px-3 py-3 dark:bg-amber-950/20">
        <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-[10px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
          <span className="font-semibold">Historical Mode:</span> Viewing{" "}
          {viewingYear.name}. New entries still go to{" "}
          <span className="font-semibold">{currentYear.name}</span>.
        </p>
      </div>
    </>
  )
}

export function AcademicYearSwitcher({ canSetup = false }: { canSetup?: boolean }) {
  const [open, setOpen] = useState(false)
  const {
    years,
    viewingYear,
    currentYear,
    setViewingYear,
    isViewingPastYear,
    isPending,
    organizationId,
  } = useAcademicYear()

  if (years.length === 0 && canSetup) {
    return <AcademicYearSetupDialog organizationId={organizationId} />
  }

  if (years.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">No academic year</span>
        <span className="sm:hidden">No year</span>
      </div>
    )
  }

  const currentYears = years.filter((y) => y.isCurrent)
  const pastYears = years.filter((y) => !y.isCurrent)

  function handleSelect(id: string) {
    setViewingYear(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all outline-none",
            "disabled:cursor-not-allowed",
            isViewingPastYear
              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 animate-pulse dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          )}

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
        className="w-72 p-0 overflow-hidden shadow-lg"
        align="end"
        sideOffset={8}
      >
        <Command>
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Academic Year
            </span>
          </div>

          <CommandInput placeholder="Search year..." className="h-9" />

          <CommandList className="max-h-72">
            <CommandEmpty>No academic year found.</CommandEmpty>

            <CommandGroup heading="Active">
              {currentYears.map((year) => (
                <YearItem
                  key={year.id}
                  year={year}
                  isSelected={viewingYear?.id === year.id}
                  isPending={isPending}
                  onSelect={() => handleSelect(year.id)}
                />
              ))}
            </CommandGroup>

            {pastYears.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Past">
                  {pastYears.map((year) => (
                    <YearItem
                      key={year.id}
                      year={year}
                      isSelected={viewingYear?.id === year.id}
                      isPending={isPending}
                      onSelect={() => handleSelect(year.id)}
                    />
                  ))}
                </CommandGroup>
              </>
            )}

            {isViewingPastYear && viewingYear && currentYear && (
              <HistoricalModeBanner
                viewingYear={viewingYear}
                currentYear={currentYear}
              />
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
