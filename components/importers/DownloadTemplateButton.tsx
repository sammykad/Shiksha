// components/dashboard/importers/DownloadTemplateButton.tsx
"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImporterConfig } from "@/types/importer"
import { downloadTemplateCsv } from "@/lib/importer/template"
import { cn } from "@/lib/utils"

interface DownloadTemplateButtonProps<TRow> {
  config: ImporterConfig<TRow>
  variant?: "outline" | "ghost" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function DownloadTemplateButton<TRow>({
  config,
  variant = "ghost",
  size = "sm",
  className,
  children,
}: DownloadTemplateButtonProps<TRow>) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("text-muted-foreground", className)}
      onClick={() => downloadTemplateCsv(config)}
    >
      <Download className="mr-1.5 h-3.5 w-3.5" />
      {children ?? "Sample Template"}
    </Button>
  )
}
