"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AcademicYearForm } from "@/components/dashboard/admin/settings/AcademicYearForm"

const AUTO_OPEN_DELAY_MS = 5000

interface AcademicYearSetupDialogProps {
  organizationId: string
}

function SetupButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all outline-none",
        "border-destructive/40 bg-destructive/5 text-destructive",
        "hover:bg-destructive/10 hover:border-destructive/60",
        "animate-pulse"
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Setup Academic Year</span>
      <span className="sm:hidden">Setup</span>
    </button>
  )
}

export function AcademicYearSetupDialog({ organizationId }: AcademicYearSetupDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [autoOpened, setAutoOpened] = useState(false)

  useEffect(() => {
    if (autoOpened) return

    const timer = setTimeout(() => {
      setOpen(true)
      setAutoOpened(true)
    }, AUTO_OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [autoOpened])

  return (
    <>
      <SetupButton onClick={() => setOpen(true)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Set Up Academic Year</DialogTitle>
            <DialogDescription>
              Create your first academic year to start using the dashboard.
              All data is scoped to an academic year.
            </DialogDescription>
          </DialogHeader>
          <AcademicYearForm
            organizationId={organizationId}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
