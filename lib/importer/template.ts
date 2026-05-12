// lib/importer/template.ts
//
// ✅ Shared — no server deps, safe to import anywhere.
// Produces a template CSV that opens cleanly in Excel, Google Sheets,
// and LibreOffice with no date mangling, no scientific notation, and
// a readable hint row that actually helps users fill it in.
//
// ⚠️  IMPORTANT: Header row uses plain labels (no * suffix).
//     The * is shown only inside the hint row so autoMapFields()
//     in engine.ts can still match "First name" → firstName exactly.

import { ImporterConfig, ImportFieldDef } from "@/types/importer"

// ─── Constants ────────────────────────────────────────────────────────────────

const UTF8_BOM = "\uFEFF"  // Excel Windows needs this to detect UTF-8
const CRLF = "\r\n"        // RFC 4180 standard line ending

// ─── Field intent detection ───────────────────────────────────────────────────

type FieldIntent = "date" | "enum" | "phone" | "email" | "id" | "text"

function detectIntent<TRow>(field: ImportFieldDef<TRow>): FieldIntent {
  const key = String(field.key).toLowerCase()
  const hint = (field.hint ?? "").toLowerCase()

  if (key.includes("date") || hint.includes("yyyy-mm-dd") || hint.includes("dd/mm/yyyy"))
    return "date"
  if (hint.includes("|"))
    return "enum"
  if (key.includes("phone") || key.includes("whatsapp") || key.includes("mobile") || key.includes("contact"))
    return "phone"
  if (key.includes("email"))
    return "email"
  if (key.includes("roll") || key.includes("code"))
    return "id"

  return "text"
}

// ─── Hint text per field ──────────────────────────────────────────────────────

function getHintText<TRow>(field: ImportFieldDef<TRow>): string {
  const intent = detectIntent(field)
  const base = field.hint
    ? field.hint
      .replace(/YYYY-MM-DD or DD\/MM\/YYYY/i, "YYYY-MM-DD")
      .replace(/Must match existing grade name/i, "e.g. Grade 5")
      .replace(/Must match section name in that grade/i, "e.g. A or B")
      .replace(/Unique per organization/i, "unique number")
      .trim()
    : (() => {
      switch (intent) {
        case "date": return "YYYY-MM-DD"
        case "phone": return "10-digit number"
        case "email": return "example@domain.com"
        case "id": return "unique ID"
        default: return "optional"
      }
    })()

  // Append (required) or (optional) tag so users know without needing the *
  return field.required ? `${base} — required` : base
}

// ─── Cell value escaping ──────────────────────────────────────────────────────

function escapeCell<TRow>(raw: string, field?: ImportFieldDef<TRow>): string {
  let value = raw
    .replace(/^\uFEFF/, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()

  if (value === "") return ""

  const intent = field ? detectIntent(field) : "text"

  // Date: ="2024-01-15" prevents Excel serial-number conversion
  if (intent === "date") return `="${csvQuote(value)}"`

  // Phone / ID: ="9876543210" prevents leading-zero loss + scientific notation
  if (intent === "phone" || intent === "id") return `="${csvQuote(value)}"`

  // Formula injection guard
  if (/^[=+\-@\t\r]/.test(value)) value = "'" + value

  return needsQuoting(value) ? `"${csvQuote(value)}"` : value
}

function needsQuoting(v: string): boolean {
  return (
    v.includes(",") ||
    v.includes('"') ||
    v.includes("\n") ||
    v.includes("\r") ||
    v !== v.trim()
  )
}

function csvQuote(v: string): string {
  return v.replace(/"/g, '""')
}

// ─── Row builders ─────────────────────────────────────────────────────────────

function buildHeaderRow<TRow>(fields: ImportFieldDef<TRow>[]): string {
  // ✅ Plain label only — NO * suffix here.
  //    autoMapFields() normalises label → key by stripping spaces/symbols,
  //    so "First name" maps to firstName correctly.
  //    Adding "First name *" would break that match.
  return fields
    .map((f) => {
      const label = f.label ?? String(f.key)
      return needsQuoting(label) ? `"${csvQuote(label)}"` : label
    })
    .join(",")
}

function buildHintRow<TRow>(fields: ImportFieldDef<TRow>[]): string {
  // Every cell wrapped in [brackets] — isHintRow() in engine.ts detects
  // this pattern and skips the row so it never triggers validation errors.
  return fields
    .map((f) => {
      const text = getHintText(f)
      const cell = `[${text}]`
      return needsQuoting(cell) ? `"${csvQuote(cell)}"` : cell
    })
    .join(",")
}

function buildDataRow<TRow>(
  row: Partial<TRow>,
  fields: ImportFieldDef<TRow>[]
): string {
  return fields
    .map((f) => {
      const raw = String((row as Record<string, unknown>)[f.key as string] ?? "")
      return escapeCell(raw, f)
    })
    .join(",")
}

// ─── generateTemplateCsv ──────────────────────────────────────────────────────

export function generateTemplateCsv<TRow>(config: ImporterConfig<TRow>): string {
  const { fields, templateRows = [] } = config

  const rows: string[] = [
    buildHeaderRow(fields),
    buildHintRow(fields),
    ...(templateRows.length > 0
      ? templateRows.map((r) => buildDataRow(r as Partial<TRow>, fields))
      : [fields.map(() => "").join(",")]
    ),
  ]

  return UTF8_BOM + rows.join(CRLF)
}

// ─── downloadTemplateCsv ──────────────────────────────────────────────────────

export function downloadTemplateCsv<TRow>(config: ImporterConfig<TRow>): void {
  const csv = generateTemplateCsv(config)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${config.entity}_template.csv`

  document.body.appendChild(a)   // Firefox requires it in DOM before .click()
  a.click()
  document.body.removeChild(a)

  setTimeout(() => URL.revokeObjectURL(url), 500)
}