"use client"

import { useState, useMemo, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { UserRound, WalletCards, Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SectionId = "profile" | "payout"

interface NavItem {
  id: SectionId
  label: string
  icon: React.ElementType
}

export type TeacherSections = Record<SectionId, ReactNode>

const NAV: NavItem[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "payout", label: "Salary & Payout", icon: WalletCards },
]

const SECTION_IDS = NAV.map((item) => item.id)

function toSectionId(value: string | null): SectionId {
  return SECTION_IDS.includes(value as SectionId) ? (value as SectionId) : "profile"
}

export default function TeacherSettingsSidebar({ sections }: { sections: TeacherSections }) {
  const searchParams = useSearchParams()

  const active = toSectionId(searchParams.get("section"))
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const filtered = useMemo(
    () => NAV.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const activeItem = NAV.find((item) => item.id === active)!

  function select(id: SectionId) {
    setMobileOpen(false)
    window.history.replaceState(null, "", `/dashboard/settings?section=${id}`)
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
        </button>
      ))}
    </nav>
  )
}
