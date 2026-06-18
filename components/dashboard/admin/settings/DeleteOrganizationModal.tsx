"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { deleteOrganizationAction, type OrgDeleteSummary } from "@/lib/data/organization/delete-organization"

interface DeleteOrganizationModalProps {
  orgId: string
  summary: OrgDeleteSummary
}

export function DeleteOrganizationModal({ orgId, summary }: DeleteOrganizationModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isPending, startTransition] = useTransition()

  const expectedText = `delete-${summary.slug}`
  const isMatch = confirmText === expectedText

  const items = [
    summary.counts.students > 0 && `${summary.counts.students.toLocaleString("en-IN")} students`,
    summary.counts.teachers > 0 && `${summary.counts.teachers} teachers`,
    summary.counts.parents > 0 && `${summary.counts.parents} parents`,
    summary.counts.fees > 0 && `${summary.counts.fees} fee records`,
    summary.counts.payments > 0 && `${summary.counts.payments} payments`,
    summary.counts.examSessions > 0 && `${summary.counts.examSessions} exam sessions`,
    summary.counts.exams > 0 && `${summary.counts.exams} exams`,
    summary.counts.certificates > 0 && `${summary.counts.certificates} certificates`,
    summary.counts.leaves > 0 && `${summary.counts.leaves} leave requests`,
    summary.counts.leads > 0 && `${summary.counts.leads} leads`,
    summary.counts.notices > 0 && `${summary.counts.notices} notices`,
    summary.counts.complaints > 0 && `${summary.counts.complaints} complaints`,
    summary.counts.attendanceRecords > 0 && `${summary.counts.attendanceRecords.toLocaleString("en-IN")} attendance records`,
    summary.counts.documents > 0 && `${summary.counts.documents} documents`,
    summary.counts.teachingAssignments > 0 && `${summary.counts.teachingAssignments} teaching assignments`,
    summary.counts.academicYears > 0 && `${summary.counts.academicYears} academic years`,
    summary.counts.aiAgents > 0 && `${summary.counts.aiAgents} AI agents`,
    summary.counts.members > 0 && `${summary.counts.members} team members`,
  ].filter(Boolean) as string[]

  function handleDelete() {
    if (!isMatch) return
    startTransition(async () => {
      const result = await deleteOrganizationAction(orgId)
      if (result.success) {
        toast.success("Organization deleted permanently")
        router.push("/")
      } else {
        toast.error(result.error ?? "Failed to delete organization")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Organization
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg">Delete {summary.name}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            This action <strong>cannot be undone</strong>. All organization data will be permanently
            removed from our servers, including:
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-32 overflow-y-auto rounded-lg border bg-muted/30 p-3">
          <ul className="space-y-1">
            {items.length > 0 ? (
              items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No data found</li>
            )}
          </ul>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              Type <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-destructive">{expectedText}</code> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className={`font-mono text-sm ${isMatch ? "border-destructive/50 ring-destructive/20" : ""}`}
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isMatch || isPending}
            onClick={handleDelete}
            className="gap-2 min-w-[140px]"
          >
            {isPending ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete this organization
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
