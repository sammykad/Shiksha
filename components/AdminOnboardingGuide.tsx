"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, LayoutDashboard, ListOrdered } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getOnboardingProgress } from "@/lib/onboarding"
import type { WizardData } from "@/components/onboarding/types"

const STEPS = [
  { label: "Organization", key: "hasOrg" as const, href: "/dashboard/settings?section=general" },
  { label: "Academic Year", key: "academicYearId" as const, href: "/dashboard/settings?section=configurations" },
  { label: "Grades", key: "gradesExist" as const, href: "/dashboard/grades" },
  { label: "Sections", key: "sectionsExist" as const, href: "/dashboard/grades" },
  { label: "Students", key: "studentsExist" as const, href: "/dashboard/students" },
  { label: "Parents", key: "parentsExist" as const, href: "/dashboard/students" },
  { label: "Teachers", key: "teachersExist" as const, href: "/dashboard/teachers" },
  { label: "Subjects", key: "subjectsExist" as const, href: "/dashboard/subjects" },
  { label: "Fee Categories", key: "feeCategoriesExist" as const, href: "/dashboard/fees/admin/fee-categories" },
  { label: "Teaching Assignments", key: "teachingAssignmentsExist" as const, href: "/dashboard/teaching-assignments" },
  { label: "Assign Fees", key: "feeAssignmentsExist" as const, href: "/dashboard/fees/admin/assign" },
]

type Progress = Record<(typeof STEPS)[number]["key"], boolean>

function computeProgress(data: WizardData): Progress {
  return {
    hasOrg: !!data.orgType,
    academicYearId: !!data.academicYearId,
    gradesExist: data.grades.length > 0,
    sectionsExist: data.grades.some((g) => g.sections.length > 0),
    studentsExist: data.studentsCount > 0,
    parentsExist: data.parentsCount > 0,
    teachersExist: data.teachersCount > 0,
    subjectsExist: data.subjectsCount > 0,
    feeCategoriesExist: data.feeCategoriesCount > 0,
    teachingAssignmentsExist: data.teachingAssignmentsCount > 0,
    feeAssignmentsExist: data.feeAssignmentsCount > 0,
  }
}

interface AdminOnboardingGuideProps {
  initialData?: WizardData | null
  variant?: "compact" | "mobile"
}

export function AdminOnboardingGuide({
  initialData = null,
  variant = "compact",
}: AdminOnboardingGuideProps) {
  const router = useRouter()
  const [progress, setProgress] = useState<Progress | null>(() =>
    initialData ? computeProgress(initialData) : null
  )
  const [open, setOpen] = useState(false)

  const fetchProgress = useCallback(async () => {
    const data = await getOnboardingProgress()
    setProgress(computeProgress(data))
  }, [])

  const isMobile = variant === "mobile"

  if (!progress) {
    return (
      <Skeleton
        className={cn(
          "rounded-lg",
          isMobile ? "h-9 w-full" : "size-9 rounded-full"
        )}
      />
    )
  }

  const doneCount = Object.values(progress).filter(Boolean).length
  const totalCount = STEPS.length
  const percent = Math.round((doneCount / totalCount) * 100)

  if (percent === 100) return null

  const nextIncomplete = STEPS.find((s) => !progress[s.key])

  return (
    <Popover open={open} onOpenChange={(v) => {
      setOpen(v)
      if (v) fetchProgress()
    }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center rounded-lg border border-border bg-background text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground",
            isMobile
              ? "h-9 w-full justify-between gap-3 px-3"
              : "gap-1.5 px-2.5 py-1.5"
          )}
          aria-label={`Setup progress: ${percent}%`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <ListOrdered className="h-3.5 w-3.5 shrink-0" />
            {isMobile && (
              <span className="truncate text-foreground">Setup guide</span>
            )}
          </span>
          <span className="shrink-0 tabular-nums">{percent}%</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-0 shadow-lg",
          isMobile ? "max-h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] overflow-y-auto" : "w-72"
        )}
        align={isMobile ? "center" : "end"}
        sideOffset={8}
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold text-foreground">Setup Progress</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount} of {totalCount} steps complete
          </p>
        </div>

        <div className="p-2">
          {STEPS.map((s) => {
            const done = progress[s.key]
            return (
              <div
                key={s.key}
                className="flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <CheckCircle2
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    done ? "text-emerald-500" : "text-muted-foreground/30"
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    done ? "text-muted-foreground" : "text-foreground font-medium"
                  )}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => router.push(nextIncomplete?.href ?? "/dashboard")}
          >
            {nextIncomplete ? (
              <>
                Continue with {nextIncomplete.label}
                <ChevronRight className="h-3 w-3" />
              </>
            ) : (
              <>
                <LayoutDashboard className="h-3 w-3" />
                Go to Dashboard
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
