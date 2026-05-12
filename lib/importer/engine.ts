import {
    ImportFieldDef,
    ImporterConfig,
    ValidatedRow,
    ValidationRule,
    ValidationSummary,
} from "@/types/importer"
import Papa from "papaparse"

// ─── CSV parsing ──────────────────────────────────────────────────────────────

function unwrapExcelCell(raw: string): string {
    let val = raw.trim()
    
    // 1. Handle ="value" (Excel text-force wrapper)
    // Note: parseCSVLine might have already stripped the double quotes
    if (val.startsWith('="') && val.endsWith('"')) {
        return val.slice(2, -1).replace(/""/g, '"')
    }
    
    // 2. Handle =value (case where parseCSVLine stripped quotes but left =)
    if (val.startsWith("=")) {
        return val.slice(1)
    }

    // 3. Handle 'value (apostrophe guard)
    if (val.startsWith("'")) {
        return val.slice(1)
    }

    return raw
}

export function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
            else inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
            result.push(unwrapExcelCell(current.trim()))
            current = ""
        } else {
            current += char
        }
    }
    result.push(unwrapExcelCell(current.trim()))
    return result
}

// Detects hint rows like [Required], [YYYY-MM-DD], [MALE | FEMALE]
function isHintRow(cells: string[]): boolean {
    const filled = cells.filter((c) => c.trim())
    if (filled.length === 0) return true
    const hintPattern = /^\[.+\]$/
    const hintCount = filled.filter((c) => hintPattern.test(c.trim())).length
    // If more than half the filled cells look like hints → skip row
    return hintCount / filled.length > 0.4
}

export function parseCSVContent(content: string): {
    headers: string[]
    rows: string[][]
} {
    const parsed = Papa.parse<string[]>(content, {
        skipEmptyLines: "greedy",
    })

    if (parsed.errors.length > 0) {
        throw new Error(parsed.errors[0]?.message ?? "Unable to parse CSV file")
    }

    const parsedRows = parsed.data.map((row) =>
        row.map((cell) => unwrapExcelCell(String(cell ?? "")))
    )

    if (parsedRows.length === 0) return { headers: [], rows: [] }

    const headers = parsedRows[0].map((h) => h.trim())
    const rows = parsedRows
        .slice(1)
        .filter((row) => !isHintRow(row)) // ← skip hint rows automatically

    return { headers, rows }
}

// ─── Auto field mapping ───────────────────────────────────────────────────────

function normalizeKey(s: string) {
    return s.toLowerCase().replace(/[\s_\-\.\/\(\)]/g, "")
}

export function autoMapFields<TRow>(
    headers: string[],
    fields: ImportFieldDef<TRow>[]
): Record<string, string> {
    const mapping: Record<string, string> = {}
    fields.forEach((field) => {
        const match = headers.find(
            (h) =>
                normalizeKey(h) === normalizeKey(field.key) ||
                normalizeKey(h) === normalizeKey(field.label)
        )
        mapping[field.key] = match ?? ""
    })
    return mapping
}

// ─── Row builder ──────────────────────────────────────────────────────────────

export function buildRows<TRow>(
    rawRows: string[][],
    headers: string[],
    fieldMappings: Record<string, string>,
    fields: ImportFieldDef<TRow>[]
): TRow[] {
    return rawRows.map((raw) => {
        const obj: Record<string, string> = {}
        fields.forEach((field) => {
            const csvCol = fieldMappings[field.key]
            let value = ""
            if (csvCol) {
                const idx = headers.indexOf(csvCol)
                value = idx >= 0 ? (raw[idx] ?? "").trim() : ""
            }
            obj[field.key] = field.transform ? field.transform(value) : value
        })
        return obj as TRow
    })
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateRows<TRow>(
    rows: TRow[],
    fields: ImportFieldDef<TRow>[],
    rules: ValidationRule<TRow>[] = []
): ValidatedRow<TRow>[] {
    const requiredFields = fields.filter((f) => f.required)

    return rows.map((row, idx) => {
        const errors: { field?: string; message: string }[] = []
        const warnings: { field?: string; message: string }[] = []

        requiredFields.forEach((f) => {
            const val = String((row as any)[f.key] ?? "").trim()
            if (!val) errors.push({ field: f.key, message: `${f.label} is required` })
        })

        rules.forEach((rule) => {
            const fieldVal = rule.field ? String((row as any)[rule.field] ?? "").trim() : ""
            const result = rule.validate(fieldVal, row, rows)
            if (!result) return
            if (result.startsWith("warn:")) {
                warnings.push({ field: rule.field, message: result.slice(5).trim() })
            } else {
                errors.push({ field: rule.field, message: result })
            }
        })

        return { _index: idx + 1, _errors: errors, _warnings: warnings, data: row }
    })
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function getValidationSummary<TRow>(
    rows: ValidatedRow<TRow>[]
): ValidationSummary {
    const rowsWithErrors = rows.filter((r) => r._errors.length > 0).length
    return {
        total: rows.length,
        ready: rows.length - rowsWithErrors,
        rowsWithErrors,
        totalErrors: rows.reduce((n, r) => n + r._errors.length, 0),
        totalWarnings: rows.reduce((n, r) => n + r._warnings.length, 0),
    }
}
// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1048576).toFixed(1)}MB`
}
