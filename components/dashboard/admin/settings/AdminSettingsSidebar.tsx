"use client"

import { useState, useMemo, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { Settings, Sliders, GraduationCap, Bell, Shield, CreditCard, Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = "general" | "configurations" | "grading" | "notifications" | "billing" | "permissions"

interface NavItem {
  id: SectionId
  label: string
  icon: React.ElementType
  badge?: string
}

export type SettingsSections = Partial<Record<SectionId, ReactNode>>

// ─── Config ───────────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "configurations", label: "Configurations", icon: Sliders },
  { id: "grading", label: "Grading System", icon: GraduationCap, badge: "Beta" },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "permissions", label: "Permissions", icon: Shield, badge: "Beta" },
]

const SECTION_IDS = NAV.map((item) => item.id)

function toSectionId(value: string | null): SectionId {
  return SECTION_IDS.includes(value as SectionId) ? (value as SectionId) : "general"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSettingsSidebar({ sections }: { sections: SettingsSections }) {
  const searchParams = useSearchParams()

  // Read URL once on mount for deep-link support — never written back to URL
  const [active, setActive] = useState<SectionId>(() => toSectionId(searchParams.get("section")))
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const filtered = useMemo(
    () => NAV.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const activeItem = NAV.find((item) => item.id === active)!

  function select(id: SectionId) {
    setActive(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg bg-muted px-4 py-2"
        >
          <div className="flex items-center gap-2 font-medium">
            <activeItem.icon className="h-4 w-4" />
            {activeItem.label}
          </div>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {mobileOpen && (
          <div className="mt-2 rounded-lg border bg-card p-2 shadow-lg space-y-1">
            <NavSearch value={query} onChange={setQuery} />
            <NavList items={filtered} active={active} onSelect={select} />
          </div>
        )}
      </div>

      {/* Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-8 space-y-3">
          <NavSearch value={query} onChange={setQuery} />
          <NavList items={filtered} active={active} onSelect={select} />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">{sections[active]}</main>
    </>
  )
}

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function NavSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search settings..."
        className="pl-9 bg-muted/50 border-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function NavList({ items, active, onSelect }: { items: NavItem[]; active: SectionId; onSelect: (id: SectionId) => void }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            active === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5">
              {item.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  )
}