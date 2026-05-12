'use client';

import React, { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Role } from '@/generated/prisma/enums';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Check, ChevronRight } from 'lucide-react';
import { useTerminology } from '@/context/terminology';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScopeId = 'ENTIRE_ORGANIZATION' | 'SPECIFIC_CLASSES' | 'STAFF_ONLY';
type RecipientId = 'STUDENTS_AND_PARENTS' | 'STUDENTS_ONLY' | 'PARENTS_ONLY';

export interface GradeWithSections {
  id: string;
  grade: string;
  section: { id: string; name: string; gradeId: string }[];
}

export interface AudienceSelectorProps {
  form: UseFormReturn<any>;
  grades: GradeWithSections[];
}

// ─── Static role mapping (no terminology needed) ───────────────────────────────

const SCOPE_ROLES: Record<ScopeId, Role[]> = {
  ENTIRE_ORGANIZATION: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'],
  STAFF_ONLY: ['TEACHER', 'ADMIN'],
  SPECIFIC_CLASSES: [],
};

const RECIPIENT_ROLES: Record<RecipientId, Role[]> = {
  STUDENTS_AND_PARENTS: ['STUDENT', 'PARENT'],
  STUDENTS_ONLY: ['STUDENT'],
  PARENTS_ONLY: ['PARENT'],
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function AudienceSelector({ form, grades }: AudienceSelectorProps) {
  const [scope, setScope] = useState<ScopeId | null>(null);
  const [recipient, setRecipient] = useState<RecipientId | null>(null);

  const targetGrades = form.watch('targetGrades') as string[];
  const targetSections = form.watch('targetSections') as string[];
  const term = useTerminology();

  // ── Terminology-aware config (depends on term, so lives inside the component) ──

  const SCOPES = useMemo<{ id: ScopeId; label: string; sub: string }[]>(
    () => [
      {
        id: 'ENTIRE_ORGANIZATION',
        label: `Entire ${term.institute}`,
        sub: `Everyone — ${term.students.toLowerCase()}, parents & staff`,
      },
      {
        id: 'SPECIFIC_CLASSES',
        label: `Specific ${term.grades.toLowerCase()}`,
        sub: `Choose ${term.grades.toLowerCase()} and ${term.sections.toLowerCase()}`,
      },
      {
        id: 'STAFF_ONLY',
        label: 'Staff only',
        sub: 'Teachers and admins',
      },
    ],
    [term]
  );

  const RECIPIENTS = useMemo<{ id: RecipientId; label: string }[]>(
    () => [
      {
        id: 'STUDENTS_AND_PARENTS',
        label: `${term.students} & Parents`,
      },
      {
        id: 'STUDENTS_ONLY',
        label: `${term.students} only`,
      },
      {
        id: 'PARENTS_ONLY',
        label: 'Parents only',
      },
    ],
    [term]
  );

  // Sections belonging to currently selected grades
  const availableSections = useMemo(
    () =>
      grades
        .filter((g) => targetGrades.includes(g.id))
        .flatMap((g) => g.section),
    [grades, targetGrades]
  );

  // ── Handlers ──

  function handleScopeSelect(s: ScopeId) {
    setScope(s);
    setRecipient(null);
    form.setValue('targetGrades', []);
    form.setValue('targetSections', []);
    if (s !== 'SPECIFIC_CLASSES') {
      form.setValue('targetRoles', SCOPE_ROLES[s]);
    } else {
      form.setValue('targetRoles', []);
    }
  }

  function handleRecipientSelect(r: RecipientId) {
    setRecipient(r);
    form.setValue('targetRoles', RECIPIENT_ROLES[r]);
  }

  function toggleGrade(gradeId: string) {
    const current: string[] = form.getValues('targetGrades');
    const removing = current.includes(gradeId);
    const next = removing
      ? current.filter((id) => id !== gradeId)
      : [...current, gradeId];
    form.setValue('targetGrades', next);

    // Drop orphaned sections when grade is removed
    if (removing) {
      const orphaned =
        grades.find((g) => g.id === gradeId)?.section.map((s) => s.id) ?? [];
      const currentSections: string[] = form.getValues('targetSections');
      form.setValue(
        'targetSections',
        currentSections.filter((id) => !orphaned.includes(id))
      );
    }
  }

  function toggleSection(sectionId: string) {
    const current: string[] = form.getValues('targetSections');
    const next = current.includes(sectionId)
      ? current.filter((id) => id !== sectionId)
      : [...current, sectionId];
    form.setValue('targetSections', next);
  }

  // ── Summary ──

  const summary = useMemo(() => {
    if (!scope) return null;

    if (scope === 'ENTIRE_ORGANIZATION')
      return `All ${term.students.toLowerCase()}, parents, teachers and admins will receive this notice.`;

    if (scope === 'STAFF_ONLY')
      return 'All teachers and admins will receive this notice.';

    // SPECIFIC_CLASSES
    if (!recipient || targetGrades.length === 0) return null;

    const recipientLabel = RECIPIENTS.find((r) => r.id === recipient)!.label;

    const gradeLabels = grades
      .filter((g) => targetGrades.includes(g.id))
      .map((g) => g.grade);

    const selectedSectionLabels = targetSections
      .map((sid) => {
        const sec = availableSections.find((s) => s.id === sid);
        const gradeLabel = grades.find((g) => g.id === sec?.gradeId)?.grade;
        return sec ? `${gradeLabel}–${sec.name}` : null;
      })
      .filter(Boolean);

    const scopeLabel =
      selectedSectionLabels.length > 0
        ? selectedSectionLabels.join(', ')
        : `${gradeLabels.join(', ')} (all ${term.sections.toLowerCase()})`;

    return `${recipientLabel} in ${scopeLabel} will receive this notice.`;
  }, [scope, recipient, targetGrades, targetSections, grades, availableSections, term, RECIPIENTS]);

  const isComplete =
    scope === 'ENTIRE_ORGANIZATION' ||
    scope === 'STAFF_ONLY' ||
    (scope === 'SPECIFIC_CLASSES' && recipient && targetGrades.length > 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground tracking-tight">
          Send to
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose who receives this notice.
        </p>
      </div>

      {/* ── Step 1: Scope ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SCOPES.map((s) => {
          const selected = scope === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScopeSelect(s.id)}
              className={cn(
                'group relative flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-200',
                selected
                  ? 'border-primary/60 bg-primary/[0.04] shadow-sm'
                  : 'border-border bg-background hover:border-border/80 hover:bg-muted/40'
              )}
            >
              {/* Selected indicator */}
              <span
                className={cn(
                  'absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200',
                  selected
                    ? 'bg-primary opacity-100'
                    : 'border border-border opacity-0 group-hover:opacity-100'
                )}
              >
                {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
              </span>

              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  selected ? 'text-primary' : 'text-foreground'
                )}
              >
                {s.label}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {s.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Step 2: Grade + Section (SPECIFIC_CLASSES only) ── */}
      {scope === 'SPECIFIC_CLASSES' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Select {term.grades.toLowerCase()}
            </p>
            <span className="text-xs text-muted-foreground">
              — then optionally pick {term.sections.toLowerCase()}
            </span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {grades.map((grade) => {
              const gradeSelected = targetGrades.includes(grade.id);
              const selectedSectionsInGrade = targetSections.filter((sid) =>
                grade.section.some((s) => s.id === sid)
              );
              const allSectionsSelected =
                gradeSelected && selectedSectionsInGrade.length === 0;

              return (
                <div key={grade.id}>
                  {/* Grade row */}
                  <button
                    type="button"
                    onClick={() => toggleGrade(grade.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      gradeSelected
                        ? 'bg-primary/[0.03]'
                        : 'bg-background hover:bg-muted/40'
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150',
                        gradeSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30 bg-background'
                      )}
                    >
                      {gradeSelected && (
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      )}
                    </span>

                    <span
                      className={cn(
                        'text-sm font-medium flex-1',
                        gradeSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {grade.grade}
                    </span>

                    {/* Section count badge */}
                    {gradeSelected && (
                      <span className="text-xs text-muted-foreground">
                        {allSectionsSelected
                          ? `All ${term.sections.toLowerCase()}`
                          : `${selectedSectionsInGrade.length} ${selectedSectionsInGrade.length !== 1
                            ? term.sections.toLowerCase()
                            : term.section.toLowerCase()
                          }`}
                      </span>
                    )}
                    {!gradeSelected && (
                      <span className="text-xs text-muted-foreground/60">
                        {grade.section.length}{' '}
                        {grade.section.length !== 1
                          ? term.sections.toLowerCase()
                          : term.section.toLowerCase()}
                      </span>
                    )}
                  </button>

                  {/* Section pills — only when grade selected */}
                  {gradeSelected && grade.section.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-10 pb-3 pt-1 bg-primary/[0.02]">
                      {grade.section.map((section) => {
                        const sectionSelected = targetSections.includes(section.id);
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSection(section.id);
                            }}
                            className={cn(
                              'rounded-lg border px-3 py-1 text-xs font-medium transition-all duration-150',
                              sectionSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            )}
                          >
                            {term.section} {section.name}
                          </button>
                        );
                      })}
                      {selectedSectionsInGrade.length === 0 && (
                        <span className="self-center text-xs text-muted-foreground/60 italic">
                          All {term.sections.toLowerCase()} included — tap to narrow down
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 3: Recipient type (SPECIFIC_CLASSES + grade selected) ── */}
      {scope === 'SPECIFIC_CLASSES' && targetGrades.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Who in these {term.grades.toLowerCase()}?
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {RECIPIENTS.map((r) => {
              const selected = recipient === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRecipientSelect(r.id)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150',
                    selected
                      ? 'border-primary bg-primary/[0.06] text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Summary ── */}
      {isComplete && summary && (
        <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
            {summary}</p>
        </div>
      )}

      {/* FormMessage for targetRoles validation error */}
      <FormField
        control={form.control}
        name="targetRoles"
        render={() => (
          <FormItem>
            <FormMessage className="text-xs mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}