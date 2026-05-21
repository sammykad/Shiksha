"use client";

import * as React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTerminology } from "@/context/terminology";
import { TerminologyLabels } from "@/lib/terminology";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  GraduationCap,
  User,
  BookOpen,
  ClipboardCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Info,
  XCircle,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { EmploymentStatus } from "@/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Exported types
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  type?: string;
}

export interface TeacherProfile {
  specializedSubjects: string[];
  preferredGrades: string[];
}

export interface Teacher {
  id: string;
  name: string;
  employmentStatus: EmploymentStatus;
  weeklyPeriodsAssigned?: number;
  profileImage?: string | null;
  role?: string;
  profile?: TeacherProfile;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Grade {
  id: string;
  grade: string;
}

export interface Section {
  id: string;
  name: string;
  gradeId: string;
}

export interface ExistingAssignment {
  teacherId: string;
  subjectId: string;
  sectionId: string;
  isPrimary: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const rowSchema = z.object({
  subjectId: z.string().min(1, "Select a subject"),
  gradeId: z.string().min(1, "Select a grade"),
  sectionId: z.string().min(1, "Select a section"),
  isPrimary: z.boolean(),
  weeklyPeriods: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 40),
      { message: "Must be between 1 and 40" }
    ),
});

export const createAssignmentSchema = z.object({
  academicYearId: z.string().min(1, "Select an academic year"),
  teacherId: z.string().min(1, "Select a teacher"),
  rows: z
    .array(rowSchema)
    .min(1, "Add at least one assignment")
    .superRefine((rows, ctx) => {
      const seen = new Set<string>();
      rows.forEach((row, idx) => {
        const key = `${row.subjectId}__${row.sectionId}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate: same subject + section already in this form",
            path: [idx, "sectionId"],
          });
        }
        seen.add(key);
      });
    }),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Warning engine
// ─────────────────────────────────────────────────────────────────────────────

type WarnLevel = "error" | "warning" | "info";

interface Warn {
  level: WarnLevel;
  message: string;
  rowIndex?: number;
}

function computeWarnings(
  values: CreateAssignmentFormValues,
  teachers: Teacher[],
  subjects: Subject[],
  grades: Grade[],
  sections: Section[],
  existing: ExistingAssignment[],
  terminology: TerminologyLabels
): Warn[] {
  const out: Warn[] = [];
  const teacher = teachers.find((t) => t.id === values.teacherId);
  if (!teacher) return out;

  if (teacher.employmentStatus !== "ACTIVE") {
    out.push({
      level: "error",
      message: `${teacher.name} is ${teacher.employmentStatus.replace(/_/g, " ").toLowerCase()}. Only ACTIVE teachers can be assigned.`,
    });
    return out;
  }

  const newPeriods = values.rows.reduce(
    (sum, r) => sum + (Number(r.weeklyPeriods) || 0),
    0
  );
  const total = (teacher.weeklyPeriodsAssigned ?? 0) + newPeriods;
  if (total > 30) {
    out.push({
      level: "warning",
      message: `${teacher.name} will have ${total}/30 periods/week after this. Consider redistributing.`,
    });
  }

  values.rows.forEach((row, idx) => {
    const subject = subjects.find((s) => s.id === row.subjectId);
    const grade = grades.find((g) => g.id === row.gradeId);
    const section = sections.find((s) => s.id === row.sectionId);
    if (!subject || !grade || !section) return;

    const loc = `${terminology.grade} ${grade.grade} – ${terminology.section} ${section.name}`;

    if (
      existing.some(
        (e) =>
          e.teacherId === values.teacherId &&
          e.subjectId === row.subjectId &&
          e.sectionId === row.sectionId
      )
    ) {
      out.push({
        level: "error",
        rowIndex: idx,
        message: `${teacher.name} is already assigned to ${subject.name} in ${loc}.`,
      });
    }

    const primaryTaken = existing.find(
      (e) =>
        e.subjectId === row.subjectId &&
        e.sectionId === row.sectionId &&
        e.isPrimary &&
        e.teacherId !== values.teacherId
    );
    if (primaryTaken && row.isPrimary) {
      out.push({
        level: "warning",
        rowIndex: idx,
        message: `Another teacher is already Primary for ${subject.name} in ${loc}. Consider Co-teacher role.`,
      });
    }

    const specs = teacher.profile?.specializedSubjects ?? [];
    if (specs.length > 0 && !specs.includes(subject.name)) {
      out.push({
        level: "info",
        rowIndex: idx,
        message: `${teacher.name} specializes in ${specs.join(", ")}, not ${subject.name}.`,
      });
    }
  });

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────────────────────────────────

function WarnBanner({ level, message }: { level: WarnLevel; message: string }) {
  const styles: Record<WarnLevel, { wrap: string; Icon: React.ElementType }> = {
    error: {
      wrap: "bg-destructive/5 border-destructive/20 text-destructive",
      Icon: XCircle,
    },
    warning: {
      wrap: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
      Icon: AlertTriangle,
    },
    info: {
      wrap: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
      Icon: Info,
    },
  };
  const { wrap, Icon } = styles[level];
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-xs", wrap)}>
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

function RoleToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden h-9">
      {(["Primary", "Co-teacher"] as const).map((label) => {
        const isPrimary = label === "Primary";
        const active = value === isPrimary;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(isPrimary)}
            className={cn(
              "flex-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Context", icon: User },
  { id: 2, label: "Assignments", icon: BookOpen },
  { id: 3, label: "Review", icon: ClipboardCheck },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAssignmentModalProps {
  academicYears: AcademicYear[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: Grade[];
  sections: Section[];
  existingAssignments?: ExistingAssignment[];
  onSubmit: (
    data: CreateAssignmentFormValues
  ) => Promise<{ success?: boolean; error?: string; message?: string } | void>;
  onCancel?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row card (Step 2) — isolated component so useWatch is scoped per-row
// ─────────────────────────────────────────────────────────────────────────────

interface RowCardProps {
  idx: number;
  control: ReturnType<typeof useForm<CreateAssignmentFormValues>>["control"];
  setValue: ReturnType<typeof useForm<CreateAssignmentFormValues>>["setValue"];
  subjects: Subject[];
  grades: Grade[];
  sections: Section[];
  rowWarnings: Warn[];
  canRemove: boolean;
  onRemove: () => void;
}

function RowCard({
  idx,
  control,
  setValue,
  subjects,
  grades,
  sections,
  rowWarnings,
  canRemove,
  onRemove,
}: RowCardProps) {
  const terminology = useTerminology();
  const gradeId = useWatch({ control, name: `rows.${idx}.gradeId` });
  const sectionOptions = sections.filter((s) => s.gradeId === gradeId);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary tabular-nums">
            {idx + 1}
          </span>
          <span className="text-xs font-medium text-foreground">
            Assignment {idx + 1}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove assignment ${idx + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        {/* Subject — full width */}
        <FormField
          control={control}
          name={`rows.${idx}.subjectId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Subject</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a subject…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No subjects found.
                      <Link
                        target="_blank"
                        href="/dashboard/subjects"
                        className="ml-1 text-blue-500 hover:underline"
                      >
                        Create a subject
                      </Link>
                    </div>
                  ) : (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-baseline gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[11px] text-muted-foreground">({s.code})</span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* Grade + Section */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name={`rows.${idx}.gradeId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">{terminology.grade}</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue(`rows.${idx}.sectionId`, "", { shouldValidate: false });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`${terminology.grade}…`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`rows.${idx}.sectionId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">{terminology.section}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!gradeId}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue
                        placeholder={gradeId ? `${terminology.section}…` : `Pick ${terminology.grade.toLowerCase()} first`}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectionOptions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No {terminology.sections.toLowerCase()} for this {terminology.grade.toLowerCase()}
                      </div>
                    ) : (
                      sectionOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Periods + Role */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name={`rows.${idx}.weeklyPeriods`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Periods/week{" "}
                  <span className="font-normal opacity-50">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={40}
                    placeholder="e.g. 5"
                    className="h-9"
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`rows.${idx}.isPrimary`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Role</FormLabel>
                <FormControl>
                  <RoleToggle value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Row warnings */}
      {rowWarnings.length > 0 && (
        <div className="space-y-1.5 px-4 pb-4">
          {rowWarnings.map((w, i) => (
            <WarnBanner key={i} level={w.level} message={w.message} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
//
// Layout contract with page.tsx:
//   <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
//     <CreateAssignmentModal ... />
//   </DialogContent>
//
// This component must be a flex-col that fills whatever height DialogContent
// gives it. No fixed pixel heights. The scrollable body uses flex-1 + overflow-y-auto.
// ─────────────────────────────────────────────────────────────────────────────

export function CreateAssignmentModal({
  academicYears,
  teachers,
  subjects,
  grades,
  sections,
  existingAssignments = [],
  onSubmit,
  onCancel,
}: CreateAssignmentModalProps) {
  const terminology = useTerminology();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setSubmitting] = React.useState(false);

  const currentYear = React.useMemo(
    () => academicYears.find((y) => y.isCurrent) ?? academicYears[0],
    [academicYears]
  );

  const emptyRow = React.useMemo(
    () => ({
      subjectId: "",
      gradeId: "",
      sectionId: "",
      isPrimary: true,
      weeklyPeriods: "",
    }),
    []
  );

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      academicYearId: currentYear?.id ?? "",
      teacherId: "",
      rows: [{ ...emptyRow }],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const watchedValues = useWatch({ control: form.control }) as CreateAssignmentFormValues;

  const selectedTeacher = React.useMemo(
    () => teachers.find((t) => t.id === watchedValues.teacherId),
    [teachers, watchedValues.teacherId]
  );

  const selectedYear = React.useMemo(
    () => academicYears.find((y) => y.id === watchedValues.academicYearId),
    [academicYears, watchedValues.academicYearId]
  );

  const warnings = React.useMemo(() => {
    if (!watchedValues.teacherId) return [];
    return computeWarnings(
      watchedValues as CreateAssignmentFormValues,
      teachers,
      subjects,
      grades,
      sections,
      existingAssignments,
      terminology
    );
  }, [watchedValues, teachers, subjects, grades, sections, existingAssignments, terminology]);

  const hasBlockingErrors = warnings.some((w) => w.level === "error");
  const globalWarnings = warnings.filter((w) => w.rowIndex === undefined);

  const periodsUsed = selectedTeacher?.weeklyPeriodsAssigned ?? 0;
  const periodsRemaining = 30 - periodsUsed;
  const loadPct = Math.min((periodsUsed / 30) * 100, 100);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const validateStep = async (): Promise<boolean> => {
    if (step === 1) {
      const ok = await form.trigger(["academicYearId", "teacherId"]);
      if (!ok) return false;
      return selectedTeacher?.employmentStatus === "ACTIVE";
    }
    if (step === 2) {
      const rowFieldNames = (watchedValues.rows ?? []).flatMap((_, i) => [
        `rows.${i}.subjectId` as const,
        `rows.${i}.gradeId` as const,
        `rows.${i}.sectionId` as const,
        `rows.${i}.weeklyPeriods` as const,
      ]);
      return form.trigger(rowFieldNames);
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid && !hasBlockingErrors) setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const resetForm = () => {
    form.reset({
      academicYearId: currentYear?.id ?? "",
      teacherId: "",
      rows: [{ ...emptyRow }],
    });
    setStep(1);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    if (hasBlockingErrors) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.message ?? "Assignments created successfully");
        resetForm();
      }
    } catch {
      toast.error("Failed to create assignments. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    // This div fills DialogContent fully. flex-col so header+body+footer stack.
    <div className="flex flex-col sm:flex-row overflow-hidden h-[650px] w-full">

      {/* ── Sidebar (hidden on mobile) ───────────────────────────────────── */}
      <aside className="hidden sm:flex w-52 shrink-0 flex-col border-r border-border bg-muted/20 p-5">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500  shadow-sm">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">Assign Teacher</p>
            <p className="text-[11px] text-muted-foreground">New assignment</p>
          </div>
        </div>

        {/* Step list */}
        <nav className="flex-1 space-y-0.5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!isDone}
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition-colors",
                  isActive && "bg-background text-primary font-semibold shadow-sm",
                  isDone && !isActive && "text-muted-foreground hover:bg-background/60 cursor-pointer",
                  !isDone && !isActive && "text-muted-foreground/40 cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && !isActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
                    !isDone && !isActive && "bg-border text-muted-foreground/40"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" /> : s.id}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Step {step} of {STEPS.length}</span>
            <span className="tabular-nums">{Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%` }}
            />
          </div>
        </div>
      </aside>

      {/* ── Main panel ───────────────────────────────────────────────────── */}
      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          // flex-col + min-h-0 is essential — without min-h-0 the form ignores
          // parent height and the body won't scroll correctly
          className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-background"
        >
          {/* Fixed header — never scrolls */}
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 space-y-0.5">
            {/* Mobile progress dots */}
            <div className="flex sm:hidden items-center gap-1 mb-2">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    s.id <= step ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
            <DialogTitle className="text-sm font-semibold leading-none">
              {STEPS[step - 1].label}
            </DialogTitle>
            <p className="text-xs text-muted-foreground pt-0.5">
              {step === 1 && "Choose the academic year and an active teacher."}
              {step === 2 && `Add one row per subject–${terminology.section.toLowerCase()} pair you want to assign.`}
              {step === 3 && "Review everything carefully before saving."}
            </p>
          </DialogHeader>

          {/* Scrollable body — flex-1 + min-h-0 is essential */}
          <ScrollArea className="flex-1 min-h-0 p-3 py-5">
            <div className="space-y-4 p-2">

              {/* ── STEP 1: Context ───────────────────────────────────────── */}
              {step === 1 && (
                <>
                  {/* Academic year */}
                  <FormField
                    control={form.control}
                    name="academicYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((y) => (
                              <SelectItem key={y.id} value={y.id}>
                                <span className="flex items-center gap-2">
                                  <span>{y.name}</span>
                                  {y.isCurrent && (
                                    <Badge variant="secondary" className="h-4 text-[10px] px-1.5 py-0">
                                      Current
                                    </Badge>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Teacher */}
                  <FormField
                    control={form.control}
                    name="teacherId"
                    render={({ field }) => {
                      const selected = teachers.find((t) => t.id === field.value);
                      return (
                        <FormItem>
                          <FormLabel>Teacher</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-auto py-2">
                                {selected ? (
                                  <div className="flex items-center gap-2.5 w-full">
                                    <Avatar className="h-7 w-7 border border-border shrink-0">
                                      <AvatarImage src={selected.profileImage ?? undefined} />
                                      <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                                        {selected.name.split(" ").map((n) => n[0]).join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-sm font-medium leading-tight truncate">
                                        {selected.name}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground leading-tight">
                                        {selected.role
                                          ? selected.role.charAt(0) + selected.role.slice(1).toLowerCase()
                                          : "Teacher"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Select a teacher…" />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teachers.map((t) => (
                                <SelectItem
                                  key={t.id}
                                  value={t.id}
                                  disabled={t.employmentStatus !== "ACTIVE"}
                                >
                                  <div className="flex items-center gap-2.5 py-0.5">
                                    <Avatar className="h-7 w-7 border border-border shrink-0">
                                      <AvatarImage src={t.profileImage ?? undefined} />
                                      <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                                        {t.name.split(" ").map((n) => n[0]).join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium leading-tight truncate">
                                        {t.name}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground leading-tight">
                                        {t.role
                                          ? t.role.charAt(0) + t.role.slice(1).toLowerCase()
                                          : "Teacher"}
                                      </span>
                                    </div>
                                    {t.employmentStatus !== "ACTIVE" && (
                                      <Badge variant="destructive" className="h-4 text-[10px] px-1.5 py-0 shrink-0">
                                        {t.employmentStatus.replace(/_/g, " ").toLowerCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Inactive or on-leave teachers are disabled.
                          </p>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Teacher profile card */}
                  {selectedTeacher && selectedTeacher.employmentStatus === "ACTIVE" && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          <AvatarImage src={selectedTeacher.profileImage ?? undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs">
                            {selectedTeacher.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {selectedTeacher.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Active Teacher</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 tabular-nums">
                          {periodsUsed}/30 periods
                        </Badge>
                      </div>

                      {/* Workload bar */}
                      <div className="space-y-1">
                        <div className="h-2 overflow-hidden rounded-full bg-border">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              loadPct >= 90 ? "bg-destructive"
                                : loadPct >= 70 ? "bg-amber-500"
                                  : "bg-emerald-500"
                            )}
                            style={{ width: `${loadPct}%` }}
                          />
                        </div>
                        <p className={cn(
                          "text-[11px]",
                          periodsRemaining <= 4
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        )}>
                          {periodsRemaining} period{periodsRemaining !== 1 ? "s" : ""} remaining
                        </p>
                      </div>

                      <Separator />

                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                        <dt className="text-muted-foreground">Specializations</dt>
                        <dd className="font-medium text-foreground">
                          {selectedTeacher.profile?.specializedSubjects?.join(", ") || "—"}
                        </dd>
                        <dt className="text-muted-foreground">Preferred {terminology.grades}</dt>
                        <dd className="font-medium text-foreground">
                          {selectedTeacher.profile?.preferredGrades?.join(", ") || "—"}
                        </dd>
                      </dl>
                    </div>
                  )}

                  {globalWarnings.map((w, i) => (
                    <WarnBanner key={i} level={w.level} message={w.message} />
                  ))}
                </>
              )}

              {/* ── STEP 2: Assignment rows ──────────────────────────────── */}
              {step === 2 && (
                <>
                  {/* Teacher context chip */}
                  {selectedTeacher && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                      <Avatar className="h-6 w-6 shrink-0 border border-border">
                        <AvatarImage src={selectedTeacher.profileImage ?? undefined} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[9px]">
                          {selectedTeacher.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground truncate flex-1">
                        {selectedTeacher.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
                        {periodsUsed}/30 periods
                      </span>
                    </div>
                  )}

                  {/* Row cards */}
                  {fields.map((field, idx) => (
                    <RowCard
                      key={field.id}
                      idx={idx}
                      control={form.control}
                      setValue={form.setValue}
                      subjects={subjects}
                      grades={grades}
                      sections={sections}
                      rowWarnings={warnings.filter((w) => w.rowIndex === idx)}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(idx)}
                    />
                  ))}

                  {/* Add row */}
                  <button
                    type="button"
                    onClick={() => append({ ...emptyRow })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another assignment
                  </button>

                  {/* Global warnings (workload etc.) */}
                  {globalWarnings.map((w, i) => (
                    <WarnBanner key={i} level={w.level} message={w.message} />
                  ))}
                </>
              )}

              {/* ── STEP 3: Review ──────────────────────────────────────── */}
              {step === 3 && (
                <>
                  {/* Who & When */}
                  <section>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Who & When
                    </p>
                    <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Academic Year
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedYear?.name ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          Teacher
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedTeacher?.name ?? "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Assignments list */}
                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Assignments
                      </p>
                      <Badge variant="secondary" className="tabular-nums">
                        {fields.length} total
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {watchedValues.rows?.map((row, idx) => {
                        const subject = subjects.find((s) => s.id === row.subjectId);
                        const grade = grades.find((g) => g.id === row.gradeId);
                        const section = sections.find((s) => s.id === row.sectionId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary tabular-nums">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {subject?.name ?? "—"}
                                {subject?.code && (
                                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                    ({subject.code})
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {grade ? `${terminology.grade} ${grade.grade}` : "—"}
                                {section ? ` · ${terminology.section} ${section.name}` : ""}
                                {row.weeklyPeriods ? ` · ${row.weeklyPeriods} periods/wk` : ""}
                              </p>
                            </div>
                            <Badge
                              variant={row.isPrimary ? "default" : "secondary"}
                              className="shrink-0 text-xs"
                            >
                              {row.isPrimary ? "Primary" : "Co-teacher"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Warnings */}
                  {warnings.filter((w) => w.level === "warning").length > 0 && (
                    <section className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Warnings
                      </p>
                      {warnings
                        .filter((w) => w.level === "warning")
                        .map((w, i) => (
                          <WarnBanner key={i} level="warning" message={w.message} />
                        ))}
                    </section>
                  )}

                  <WarnBanner
                    level="info"
                    message="Duplicate combination and org-isolation checks are enforced on save."
                  />
                </>
              )}

            </div>
          </ScrollArea>

          {/* Fixed footer — never scrolls */}
          <div className="shrink-0 border-t border-border bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-1.5 text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCancel?.();
                    resetForm();
                  }}
                >
                  Cancel
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNext}
                    disabled={hasBlockingErrors}
                    className="gap-1.5"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={hasBlockingErrors || isSubmitting}
                    className="gap-1.5 min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        {fields.length > 1
                          ? `Create ${fields.length} Assignments`
                          : "Create Assignment"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateAssignmentModal;