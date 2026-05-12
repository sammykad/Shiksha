// ============================================================================
//  BULK IMPORTER — CORE TYPES
//  Drop-in for any entity: Student, Teacher, Subject, Lead, Exam, Timetable…
// ============================================================================

// ─── Field definition ─────────────────────────────────────────────────────────

export type FieldGroup = string // e.g. "identity" | "contact" | "parent" | "academic"

export interface ImportFieldDef<TRow = Record<string, string>> {
  /** Unique key matching the output object key */
  key: keyof TRow & string
  /** Human-readable label shown in the UI */
  label: string
  /** Group / tab name — fields are tabbed by group */
  group: FieldGroup
  /** Required fields block import if empty */
  required?: boolean
  /** Short hint shown under the field mapping row */
  hint?: string
  /**
   * Optional client-side transform applied after mapping.
   * Use for normalisation (trim, uppercase, date parse).
   */
  transform?: (raw: string) => string
}

// ─── Validation rule ──────────────────────────────────────────────────────────

export interface ValidationRule<TRow = Record<string, string>> {
  /** Field key this rule targets (undefined = row-level rule) */
  field?: keyof TRow & string
  /**
   * Return an error string to fail, a warning string prefixed with "warn:"
   * to warn, or null/undefined to pass.
   */
  validate: (value: string, row: TRow, allRows: TRow[]) => string | null | undefined
}

// ─── Validated row ────────────────────────────────────────────────────────────

export interface ValidatedRow<TRow = Record<string, string>> {
  _index: number       // 1-based row number in the file
  _errors: RowIssue[]
  _warnings: RowIssue[]
  data: TRow
}

export interface RowIssue {
  field?: string
  message: string
}

// ─── Import handler ───────────────────────────────────────────────────────────

/**
 * The function that actually persists validated rows.
 * Implement one per entity (student, teacher, subject…).
 * Called server-side via a Next.js server action.
 */
export type ImportHandler<TRow = Record<string, string>> = (
  rows: TRow[],
  context: ImportContext
) => Promise<ImportHandlerResult>

export interface ImportContext {
  organizationId: string
  /** Extra context passed by the caller — e.g. academicYearId */
  meta?: Record<string, string>
}

export interface ImportHandlerResult {
  imported: number
  skipped: number
  errors: HandlerRowError[]
}

export interface HandlerRowError {
  row: number
  field?: string
  message: string
}

// ─── Importer config ──────────────────────────────────────────────────────────

/**
 * One config object drives the entire UI + validation + import for any entity.
 *
 * @example
 * export const studentImporterConfig: ImporterConfig<StudentCsvRow> = {
 *   entity: "student",
 *   label: "Students",
 *   fields: STUDENT_FIELDS,
 *   rules: STUDENT_RULES,
 *   handler: bulkImportStudents,
 * }
 */
export interface ImporterConfig<TRow = Record<string, string>> {
  /** Identifier used in analytics / logging */
  entity: string
  /** Display name shown in the dialog title */
  label: string
  /** All field definitions */
  fields: ImportFieldDef<TRow>[]
  /** Validation rules applied client-side before import */
  rules?: ValidationRule<TRow>[]
  /**
   * Server action that persists the data.
   * Must be a `"use server"` function.
   */
  handler: ImportHandler<TRow>
  /** Max rows allowed per import (default 1000) */
  maxRows?: number
  /** CSV template extra example rows (first row is auto-generated) */
  templateRows?: Partial<TRow>[]
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type ImportStep = "upload" | "map" | "validate" | "done"

export interface ImporterState<TRow = Record<string, string>> {
  step: ImportStep
  fileName: string
  fileSize: string
  csvHeaders: string[]
  rawRows: string[][]
  fieldMappings: Record<string, string>
  validatedRows: ValidatedRow<TRow>[]
  isImporting: boolean
  result: ImportHandlerResult | null
}

export interface ValidationSummary {
  total: number
  ready: number
  rowsWithErrors: number
  totalErrors: number
  totalWarnings: number
}