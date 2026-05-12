"use client"

import { downloadTemplateCsv } from "@/lib/importer/template"
import * as React from "react"
import { toast } from "sonner"
import {
  ImporterConfig,
  ImportStep,
  ValidatedRow,
  ValidationSummary,
  ImportHandlerResult,
} from "@/types/importer"
import {
  parseCSVContent,
  autoMapFields,
  buildRows,
  validateRows,
  getValidationSummary,
  formatBytes,
} from "@/lib/importer/engine"



interface UseImporterOptions<TRow> {
  config: ImporterConfig<TRow>
  organizationId: string
  meta?: Record<string, string>
  onSuccess?: (result: ImportHandlerResult) => void
}

export function useImporter<TRow = Record<string, string>>({
  config,
  organizationId,
  meta,
  onSuccess,
}: UseImporterOptions<TRow>) {
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [fileName, setFileName] = React.useState("")
  const [fileSize, setFileSize] = React.useState("")
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([])
  const [rawRows, setRawRows] = React.useState<string[][]>([])
  const [fieldMappings, setFieldMappings] = React.useState<Record<string, string>>({})
  const [validatedRows, setValidatedRows] = React.useState<ValidatedRow<TRow>[]>([])
  const [isImporting, setIsImporting] = React.useState(false)
  const [result, setResult] = React.useState<ImportHandlerResult | null>(null)

  const hasFile = rawRows.length > 0

  const validationSummary: ValidationSummary = React.useMemo(
    () => getValidationSummary(validatedRows),
    [validatedRows]
  )

  const groups = React.useMemo(
    () => [...new Set(config.fields.map((f) => f.group))],
    [config.fields]
  )

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = React.useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only .csv files are supported")
      return
    }
    const maxRows = config.maxRows ?? 1000
    setFileName(file.name)
    setFileSize(formatBytes(file.size))

    const reader = new FileReader()
    reader.onload = (e) => {
      let headers: string[] = []
      let rows: string[][] = []

      try {
        const content = e.target?.result as string
        const parsed = parseCSVContent(content)
        headers = parsed.headers
        rows = parsed.rows
      } catch (err: any) {
        toast.error(err?.message ?? "Unable to parse CSV file")
        return
      }

      if (headers.length === 0) {
        toast.error("CSV file appears to be empty")
        return
      }
      if (rows.length > maxRows) {
        toast.warning(`Only first ${maxRows} rows will be imported`)
      }
      setCsvHeaders(headers)
      setRawRows(rows.slice(0, maxRows))
      setFieldMappings(autoMapFields(headers, config.fields))
    }
    reader.readAsText(file)
  }, [config])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Mapping ────────────────────────────────────────────────────────────────

  const updateMapping = React.useCallback((fieldKey: string, csvColumn: string) => {
    setFieldMappings((prev) => ({ ...prev, [fieldKey]: csvColumn }))
  }, [])

  const resetMappings = React.useCallback(() => {
    setFieldMappings(autoMapFields(csvHeaders, config.fields))
  }, [csvHeaders, config.fields])

  // ── Validate ───────────────────────────────────────────────────────────────

  const goToValidate = React.useCallback(() => {
    const rows = buildRows(rawRows, csvHeaders, fieldMappings, config.fields)
    const validated = validateRows(rows, config.fields, config.rules)
    setValidatedRows(validated)
    setStep("validate")
  }, [rawRows, csvHeaders, fieldMappings, config])

  // ── Patch a single cell inline + re-validate that row immediately ──────────
  // Called from the validate step when user edits a cell directly in the table

  const patchRow = React.useCallback((rowIndex: number, fieldKey: string, value: string) => {
    setValidatedRows((prev) => {
      const next = [...prev]
      const row = next[rowIndex]
      if (!row) return prev

      // Apply field transform (e.g. toUpperCase for gender)
      const field = config.fields.find((f) => (f.key as string) === fieldKey)
      const transformed = field?.transform ? field.transform(value) : value

      const newData = { ...row.data, [fieldKey]: transformed } as TRow

      // Re-validate just this one row against all rules
      // Pass full rows array so duplicate-check rules still work
      const allData = next.map((r, i) => i === rowIndex ? newData : r.data)
      const [revalidated] = validateRows([newData], config.fields, config.rules ?? [],
        // Override allRows for duplicate check
      )

      // For cross-row rules (duplicates), re-run against full set
      const fullRevalidated = validateRows(
        allData,
        config.fields,
        config.rules ?? []
      )

      next[rowIndex] = { ...fullRevalidated[rowIndex], _index: row._index }
      return next
    })
  }, [config])

  // ── Import ─────────────────────────────────────────────────────────────────

  const runImport = React.useCallback(async () => {
    const cleanRows = validatedRows
      .filter((r) => r._errors.length === 0)
      .map((r) => ({ ...(r.data as any), __rowNumber: r._index }) as TRow)

    if (cleanRows.length === 0) {
      toast.error("No valid rows to import")
      return
    }

    setIsImporting(true)
    try {
      const importResult = await config.handler(cleanRows, { organizationId, meta })
      setResult(importResult)

      if (importResult.errors.length > 0) {
        toast.warning(`${importResult.imported} imported · ${importResult.skipped} skipped`)
      } else {
        toast.success(`${importResult.imported} ${config.label.toLowerCase()} imported`)
      }

      onSuccess?.(importResult)
      setStep("done")
    } catch (err: any) {
      toast.error(err?.message ?? "Import failed")
    } finally {
      setIsImporting(false)
    }
  }, [validatedRows, config, organizationId, meta, onSuccess])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = React.useCallback(() => {
    setStep("upload")
    setFileName("")
    setFileSize("")
    setCsvHeaders([])
    setRawRows([])
    setFieldMappings({})
    setValidatedRows([])
    setResult(null)
  }, [])

  // ── Template download ──────────────────────────────────────────────────────

  const downloadTemplate = React.useCallback(() => {
    downloadTemplateCsv(config)
  }, [config])


  return {
    step, setStep,
    fileName, fileSize, hasFile,
    csvHeaders, fieldMappings,
    validatedRows, validationSummary,
    groups, isImporting, result,
    handleFile, handleDrop,
    updateMapping, resetMappings,
    goToValidate, patchRow,
    runImport, reset, downloadTemplate,
  }
}
