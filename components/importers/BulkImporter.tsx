"use client"

import * as React from "react"
import { Check, Upload, AlertCircle, CheckCircle2, RotateCcw, File, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ImporterConfig, ImportHandlerResult } from "@/types/importer"
import { useImporter } from "@/hooks/use-importer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DownloadTemplateButton } from "./DownloadTemplateButton"

const STEPS = ["upload", "map", "validate", "done"] as const
const STEP_LABELS: Record<string, string> = {
    upload: "Upload",
    map: "Map fields",
    validate: "Review",
    done: "Done",
}

interface BulkImporterProps<TRow> {
    config: ImporterConfig<TRow>
    organizationId: string
    meta?: Record<string, string>
    onSuccess?: (result: ImportHandlerResult) => void
    children?: React.ReactNode
}

export function BulkImporter<TRow = Record<string, string>>({
    config, organizationId, meta, onSuccess, children,
}: BulkImporterProps<TRow>) {
    const [open, setOpen] = React.useState(false)
    const importer = useImporter({ config, organizationId, meta, onSuccess })

    const handleOpenChange = (v: boolean) => {
        setOpen(v)
        if (!v) importer.reset()
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Import {config.label}</DialogTitle>
                    <DialogDescription>
                        Upload a CSV to bulk-create {config.label.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>
                <StepIndicator current={importer.step} />
                {importer.step === "upload" && <UploadStep importer={importer} config={config} />}
                {importer.step === "map" && <MapStep importer={importer} config={config} />}
                {importer.step === "validate" && <ValidateStep importer={importer} config={config} />}
                {importer.step === "done" && <DoneStep importer={importer} config={config} onClose={() => handleOpenChange(false)} />}
            </DialogContent>
        </Dialog>
    )
}

function StepIndicator({ current }: { current: string }) {
    const idx = STEPS.indexOf(current as (typeof STEPS)[number])
    return (
        <div className="flex items-center gap-1 mb-2">
            {STEPS.map((s, i) => {
                const done = i < idx
                const active = i === idx
                return (
                    <React.Fragment key={s}>
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs",
                            active ? "text-foreground font-medium" : "text-muted-foreground",
                        )}>
                            <span className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                                done && "border-emerald-500 bg-emerald-500 text-white",
                                active && "border-foreground bg-foreground text-background",
                                !done && !active && "border-muted-foreground/30",
                            )}>
                                {done ? <Check className="h-3 w-3" /> : i + 1}
                            </span>
                            {STEP_LABELS[s]}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn("h-px flex-1 mx-1", i < idx ? "bg-emerald-400" : "bg-border")} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

function UploadStep<TRow>({ importer, config }: { importer: ReturnType<typeof useImporter<TRow>>; config: ImporterConfig<TRow> }) {
    const [drag, setDrag] = React.useState(false)
    const ref = React.useRef<HTMLInputElement>(null)

    return (
        <div className="space-y-3">
            <div
                onClick={() => ref.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { importer.handleDrop(e); setDrag(false) }}
                className={cn(
                    "flex flex-col items-center gap-2.5 rounded-lg border-2 border-dashed py-10 cursor-pointer transition-colors select-none",
                    drag
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/10",
                )}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Drop CSV here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Max {config.maxRows ?? 1000} rows</p>
                </div>
                <input
                    ref={ref} type="file" accept=".csv,text/csv" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) importer.handleFile(f); e.target.value = "" }}
                />
            </div>

            {importer.hasFile && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
                    <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm font-medium">{importer.fileName}</span>
                    <span className="text-xs text-muted-foreground">{importer.fileSize}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <DownloadTemplateButton config={config} />
                <Button disabled={!importer.hasFile} onClick={() => importer.setStep("map")}>
                    Continue
                </Button>
            </div>
        </div>
    )
}

function MapStep<TRow>({ importer, config }: { importer: ReturnType<typeof useImporter<TRow>>; config: ImporterConfig<TRow> }) {
    const unmappedCount = config.fields
        .filter((f) => f.required && !importer.fieldMappings[f.key as string]).length

    return (
        <div className="space-y-3">
            <ScrollArea className="h-[360px] pr-2">
                <div className="space-y-4">
                    {importer.groups.map((group) => (
                        <div key={group}>
                            <p className="text-[11px] font-medium tracking-wider text-muted-foreground mb-2 uppercase">
                                {group}
                            </p>
                            <div className="space-y-1.5">
                                {config.fields.filter((f) => f.group === group).map((field) => {
                                    const key = field.key as string
                                    const mapped = importer.fieldMappings[key] ?? ""
                                    const isErr = field.required && !mapped
                                    return (
                                        <div key={key} className="flex items-start gap-2">
                                            <div className={cn(
                                                "flex-1 flex items-center justify-between rounded border px-2.5 py-1.5 text-xs min-h-8",
                                                isErr
                                                    ? "border-destructive/40 bg-destructive/5"
                                                    : "border-border bg-muted/20",
                                            )}>
                                                <span className="font-medium truncate">{field.label}</span>
                                                {field.required && (
                                                    <span className="ml-1 shrink-0 text-[9px] text-muted-foreground">req</span>
                                                )}
                                            </div>
                                            <Select
                                                value={mapped || "__none__"}
                                                onValueChange={(v) => importer.updateMapping(key, v === "__none__" ? "" : v)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-48 h-8 text-xs",
                                                    isErr && "border-destructive/40",
                                                )}>
                                                    <SelectValue>
                                                        {mapped
                                                            ? <span>{mapped}</span>
                                                            : <span className="text-muted-foreground">— skip —</span>
                                                        }
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">
                                                        <span className="text-muted-foreground">— skip —</span>
                                                    </SelectItem>
                                                    {importer.csvHeaders.map((h) => (
                                                        <SelectItem key={h} value={h}>{h}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                })}
                            </div>
                            {config.fields.filter((f) => f.group === group).some((f) => f.hint) && (
                                <p className="text-[10px] text-muted-foreground px-0.5">
                                    {config.fields.filter((f) => f.group === group).map((f) => f.hint).filter(Boolean).join(" · ")}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => importer.setStep("upload")}>
                        Back
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={importer.resetMappings}>
                        <RotateCcw className="mr-1 h-3 w-3" /> Auto-map
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {unmappedCount > 0 && (
                        <span className="text-xs text-destructive">{unmappedCount} required unmapped</span>
                    )}
                    <Button onClick={importer.goToValidate} disabled={unmappedCount > 0}>
                        Review
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ValidateStep<TRow>({ importer, config }: { importer: ReturnType<typeof useImporter<TRow>>; config: ImporterConfig<TRow> }) {
    const { validationSummary: s, validatedRows } = importer
    const previewFields = config.fields.filter((f) => f.required).slice(0, 5)

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: "Total", value: s.total, color: "" },
                    {
                        label: "Ready", value: s.ready,
                        color: s.ready > 0 ? "text-emerald-600 dark:text-emerald-400" : "",
                    },
                    {
                        label: "Errors", value: s.rowsWithErrors,
                        color: s.rowsWithErrors > 0 ? "text-destructive" : "text-emerald-600",
                    },
                ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-md border bg-muted/20 px-3 py-2.5">
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className={cn("text-xl font-semibold tabular-nums", color)}>{value}</p>
                    </div>
                ))}
            </div>

            {(s.totalErrors > 0 || s.totalWarnings > 0) && (
                <div className="space-y-1">
                    {s.totalErrors > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {s.totalErrors} error{s.totalErrors > 1 ? "s" : ""} in {s.rowsWithErrors} row{s.rowsWithErrors > 1 ? "s" : ""}
                        </div>
                    )}
                    {s.totalWarnings > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {s.totalWarnings} warning{s.totalWarnings > 1 ? "s" : ""} — rows will still import
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-md border overflow-hidden">
                <ScrollArea className="h-[240px]">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-background">
                            <TableRow>
                                <TableHead className="w-8 text-center text-xs">#</TableHead>
                                {previewFields.map((f) => (
                                    <TableHead key={f.key as string} className="text-xs">{f.label}</TableHead>
                                ))}
                                <TableHead className="text-xs">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {validatedRows.map((row) => (
                                <TableRow key={row._index} className={row._errors.length > 0 ? "bg-destructive/5" : ""}>
                                    <TableCell className="text-center text-xs text-muted-foreground">{row._index}</TableCell>
                                    {previewFields.map((f) => {
                                        const hasErr = row._errors.some((e) => e.field === (f.key as string))
                                        return (
                                            <TableCell key={f.key as string} className={cn("text-xs max-w-[120px]", hasErr && "text-destructive")}>
                                                <span className="line-clamp-1">{String((row.data as any)[f.key] ?? "")}</span>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell>
                                        {row._errors.length > 0 ? (
                                            <Badge variant="destructive" className="text-[9px] h-4 px-1">{row._errors.length} err</Badge>
                                        ) : row._warnings.length > 0 ? (
                                            <Badge className="text-[9px] h-4 px-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">warn</Badge>
                                        ) : (
                                            <Badge className="text-[9px] h-4 px-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">ok</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            {s.rowsWithErrors > 0 && (
                <ScrollArea className="h-[72px] rounded-md border bg-muted/10 px-3 py-2">
                    <div className="space-y-0.5">
                        {validatedRows
                            .filter((r) => r._errors.length > 0)
                            .flatMap((r) => r._errors.map((e, i) => (
                                <div key={`${r._index}-${i}`} className="flex gap-2 text-xs">
                                    <span className="shrink-0 font-medium text-muted-foreground w-10">Row {r._index}</span>
                                    <span className="text-destructive">{e.message}</span>
                                </div>
                            )))}
                    </div>
                </ScrollArea>
            )}

            <div className="flex justify-between border-t pt-3">
                <Button variant="outline" onClick={() => importer.setStep("map")}>Back</Button>
                <Button disabled={s.ready === 0 || importer.isImporting} onClick={importer.runImport}>
                    {importer.isImporting
                        ? "Importing…"
                        : `Import ${s.ready} ${config.label.toLowerCase()}`
                    }
                </Button>
            </div>
        </div>
    )
}

function DoneStep<TRow>({ importer, config, onClose }: {
    importer: ReturnType<typeof useImporter<TRow>>
    config: ImporterConfig<TRow>
    onClose: () => void
}) {
    const { result } = importer
    return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
                <p className="text-sm font-medium">Import complete</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {result?.imported ?? 0} {config.label.toLowerCase()} imported
                    {(result?.skipped ?? 0) > 0 && (
                        <> · <span className="text-amber-600">{result?.skipped} skipped</span></>
                    )}
                </p>
            </div>

            {result && result.errors.length > 0 && (
                <ScrollArea className="w-full h-[72px] rounded-md border bg-muted/10 px-3 py-2 text-left">
                    <div className="space-y-0.5">
                        {result.errors.map((e, i) => (
                            <div key={i} className="flex gap-2 text-xs">
                                <span className="shrink-0 font-medium text-muted-foreground w-10">Row {e.row}</span>
                                <span className="text-destructive">{e.message}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}

            <div className="flex gap-2">
                <Button variant="outline" onClick={importer.reset}>Import another file</Button>
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    )
}
