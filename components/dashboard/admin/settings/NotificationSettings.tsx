"use client"

import { useState, useTransition, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
    Bell, ChevronRight,
    IndianRupee, Info, AlertTriangle, Lock, Loader2,
    CreditCard, UserCheck, FileText, Megaphone, BookOpen,
    Calendar, Gift, ClipboardList, TrendingDown,
    Phone, BellRing, RotateCcw, Sparkles,
} from "lucide-react"
import { NotificationChannel, NotificationType } from "@/generated/prisma/enums"
import { NotificationSetting } from "@/generated/prisma/client"
import { toast } from "sonner"
import { cn, getChannelUnitCost } from "@/lib/utils"
import {
    updateNotificationSetting,
    resetOrganizationNotificationSettings,
    type AllSubKeys,
} from "@/lib/notifications/organization-notification-settings"
import { WhatsAppIcon } from "@/public/icons/WhatsAppIcon"
import { GmailIcon } from "@/public/icons/GmailIcon"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ChannelState = { enabled: boolean; locked: boolean }
type EventConfig = { label: string } & Partial<Record<NotificationChannel, ChannelState>>
type ChannelsJson = Record<string, EventConfig | ChannelState>

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<NotificationType, any> = {
    NOTICE: Megaphone,
    FEE: CreditCard,
    ATTENDANCE: UserCheck,
    DOCUMENT: FileText,
    GENERAL: Bell,
    EXAM: BookOpen,
    LEAVE: Calendar,
    ACADEMIC_REPORT: ClipboardList,
    GREETING: Gift,
}

const CHANNELS = [
    { value: "EMAIL", label: "Email", icon: <GmailIcon width={14} height={14} /> },
    { value: "SMS", label: "SMS", icon: <Phone className="h-3.5 w-3.5 text-blue-500" /> },
    { value: "WHATSAPP", label: "WhatsApp", icon: <WhatsAppIcon width={15} height={15} /> },
    { value: "PUSH", label: "Push", icon: <BellRing className="h-3.5 w-3.5 text-blue-500" /> },
] as const

// Shared grid — applied to column header, every main row, and every sub-event row.
// All three must use the exact same string or columns will drift.
const GRID = "lg:grid-cols-[1fr_repeat(4,80px)]"

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isEventConfig(value: unknown): value is EventConfig {
    return typeof value === "object" && value !== null && "label" in value
}

function getChannelConfig(
    setting: NotificationSetting,
    channel: NotificationChannel,
    eventKey?: AllSubKeys,
): ChannelState {
    const channels = setting.channels as ChannelsJson
    if (eventKey) {
        const event = channels?.[eventKey]
        if (isEventConfig(event)) return event[channel] ?? { enabled: false, locked: false }
        return { enabled: false, locked: false }
    }
    const state = channels?.[channel]
    return (isEventConfig(state) ? undefined : state) ?? { enabled: false, locked: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function ChannelToggle({
    config, isUpdating, label, onToggle,
}: {
    config: ChannelState
    isUpdating: boolean
    label: string
    onToggle: (checked: boolean) => void
}) {
    if (config.locked) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-center w-8 h-5 rounded border border-dashed border-muted-foreground/20 cursor-not-allowed">
                        <Lock className="h-2.5 w-2.5 text-muted-foreground/25" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                    {label} is unavailable for this notification type
                </TooltipContent>
            </Tooltip>
        )
    }
    return (
        <div className="relative inline-flex items-center justify-center">
            <Switch
                checked={config.enabled}
                disabled={isUpdating}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary scale-90"
            />
            {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE CHANNEL LIST
//
// Shown only on mobile (lg:hidden). Renders as a vertical list:
//   icon + label  ──────────────────  toggle
//
// NOT placed inside the desktop grid — it lives outside grid flow entirely.
// ─────────────────────────────────────────────────────────────────────────────

function MobileChannelList({
    setting, eventKey, updatingId, settingId, onToggle,
}: {
    setting: NotificationSetting
    eventKey?: AllSubKeys
    updatingId: string | null
    settingId: string
    onToggle: (channel: NotificationChannel, checked: boolean, eventKey?: AllSubKeys) => void
}) {
    return (
        <div className="mt-3 rounded-lg border border-border/50 overflow-hidden lg:hidden">
            {CHANNELS.map(({ value, icon, label }, i) => {
                const config = getChannelConfig(setting, value, eventKey)
                const uid = eventKey ? `${settingId}-${eventKey}-${value}` : `${settingId}-${value}`
                const isUpdating = updatingId === uid
                return (
                    <div
                        key={value}
                        className={cn(
                            "flex items-center justify-between px-3 py-2.5 bg-muted/20",
                            i !== CHANNELS.length - 1 && "border-b border-border/40"
                        )}
                    >
                        <div className="flex items-center gap-2 text-foreground/80">
                            {icon}
                            <span className="text-xs font-medium">{label}</span>
                        </div>
                        <ChannelToggle
                            config={config}
                            isUpdating={isUpdating}
                            label={label}
                            onToggle={(checked) => onToggle(value, checked, eventKey)}
                        />
                    </div>
                )
            })}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COST PILL
// ─────────────────────────────────────────────────────────────────────────────

function CostPill({ amount }: { amount: number }) {
    return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums text-muted-foreground/50">
            <IndianRupee className="h-2 w-2" />
            {amount.toFixed(2)}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
    const [isPending, startTransition] = useTransition()

    const handleInitialize = () => {
        startTransition(async () => {
            const result = await resetOrganizationNotificationSettings()
            if (result.success) {
                toast.success("Notification settings created", {
                    description: "Default settings applied. Customize them below.",
                })
            } else {
                toast.error(result.error ?? "Failed to create settings")
            }
        })
    }

    return (
        <Card className="border-dashed">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                    <Bell className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-sm font-semibold tracking-tight">No notification settings found</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Initialize default channels for your organization. You can customize each one after setup.
                    </p>
                </div>
                <Button onClick={handleInitialize} disabled={isPending} className="gap-2">
                    {isPending
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</>
                        : <><Sparkles className="h-4 w-4" />Initialize Default Settings</>
                    }
                </Button>
            </div>
        </Card>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationSettingsProps {
    notificationSettings: NotificationSetting[]
}

export function NotificationSettings({ notificationSettings }: NotificationSettingsProps) {
    if (!notificationSettings || notificationSettings.length === 0) {
        return <EmptyState />
    }

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isResetting, setIsResetting] = useState(false)

    const sortedSettings = useMemo(() =>
        [...notificationSettings].sort((a, b) =>
            ((a as any).displayOrder || 0) - ((b as any).displayOrder || 0)
        ), [notificationSettings])

    const estimatedMonthlyCost = useMemo(() => {
        let total = 0
        const add = (c: Partial<Record<NotificationChannel, ChannelState>>) => {
            if (c.EMAIL?.enabled) total += getChannelUnitCost("EMAIL")
            if (c.SMS?.enabled) total += getChannelUnitCost("SMS")
            if (c.WHATSAPP?.enabled) total += getChannelUnitCost("WHATSAPP")
            if (c.PUSH?.enabled) total += getChannelUnitCost("PUSH")
        }
        notificationSettings.forEach(s => {
            const ch = s.channels as ChannelsJson
            const first = Object.values(ch || {})[0]
            if (isEventConfig(first)) Object.values(ch).forEach(v => isEventConfig(v) && add(v))
            else add(ch as any)
        })
        return total
    }, [notificationSettings])

    const toggleChannel = (
        settingId: string,
        channel: NotificationChannel,
        enabled: boolean,
        eventKey?: AllSubKeys,
    ) => {
        const uid = eventKey ? `${settingId}-${eventKey}-${channel}` : `${settingId}-${channel}`
        setUpdatingId(uid)
        startTransition(async () => {
            const result = await updateNotificationSetting(settingId, channel, enabled, eventKey)
            if (result.success) {
                toast.success(`${channel} ${enabled ? "enabled" : "disabled"}`, {
                    description: "Notification preference updated.",
                    duration: 2000,
                })
            } else {
                toast.error(result.error || "Failed to update setting")
            }
            setUpdatingId(null)
        })
    }

    const handleReset = () => {
        setIsResetting(true)
        startTransition(async () => {
            const result = await resetOrganizationNotificationSettings()
            if (result.success) {
                toast.success("Reset to defaults", {
                    description: "All channels restored to their recommended defaults.",
                })
            } else {
                toast.error(result.error ?? "Failed to reset settings")
            }
            setIsResetting(false)
        })
    }

    const toggleExpanded = (id: string) =>
        setExpandedGroups(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    return (
        <TooltipProvider>
            <div className="space-y-6">

                {/* ── Header Card ─────────────────────────────────────── */}
                <Card className="overflow-hidden border-border/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight">Notification Settings</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Control how and when notifications are delivered across channels.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 rounded-xl border border-border bg-muted/30 px-4 py-3">
                            <div className="p-2 rounded-lg bg-primary/8 border border-primary/10">
                                <TrendingDown className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Est. Monthly</p>
                                <p className="text-xl font-bold tabular-nums tracking-tight flex items-center gap-0.5">
                                    <IndianRupee className="h-4 w-4 stroke-[2.5]" />
                                    {estimatedMonthlyCost.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mx-5 mb-5 sm:mx-6 sm:mb-6 rounded-lg border border-amber-200/70 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/25 px-4 py-3">
                        <div className="flex gap-2.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                                <span className="font-semibold">Cost tip:</span> Prefer{" "}
                                <span className="font-semibold">Push (₹{getChannelUnitCost("PUSH")}/event)</span> &amp;{" "}
                                <span className="font-semibold">Email (₹{getChannelUnitCost("EMAIL")}/event)</span> for most alerts.
                                Reserve <span className="font-semibold">SMS</span> &amp;{" "}
                                <span className="font-semibold">WhatsApp</span> for critical notifications only.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* ── Table Card ──────────────────────────────────────── */}
                <Card className="overflow-hidden border-border/60">

                    {/* Desktop column header — same GRID as rows */}
                    <div className={cn(
                        "hidden lg:grid items-center bg-muted/30 border-b border-border/60 px-6 py-2.5",
                        GRID
                    )}>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Notification Type
                        </span>
                        {CHANNELS.map(({ value, icon, label }) => (
                            <div key={value} className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    {icon}
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
                                </div>
                                <CostPill amount={getChannelUnitCost(value)} />
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border/50">
                        {sortedSettings.map((notification) => {
                            const isExpanded = expandedGroups.has(notification.id)
                            const channels = notification.channels as ChannelsJson
                            const events = Object.entries(channels || {})
                                .filter(([, v]) => isEventConfig(v))
                                .map(([key, value]) => ({
                                    key: key as AllSubKeys,
                                    label: (value as EventConfig).label,
                                }))
                            const isCategory = events.length > 0
                            const Icon = ICON_MAP[notification.notificationType]

                            return (
                                <div key={notification.id} className="group">

                                    {/* ── Main row ── */}
                                    <div
                                        className={cn(
                                            // Mobile: block layout. Desktop: 5-column grid.
                                            "px-5 py-4 transition-colors",
                                            "lg:grid lg:items-center lg:gap-0 lg:px-6",
                                            GRID,
                                            isCategory ? "cursor-pointer hover:bg-muted/25" : "hover:bg-muted/15",
                                            isExpanded && "bg-muted/20"
                                        )}
                                        onClick={isCategory ? () => toggleExpanded(notification.id) : undefined}
                                    >
                                        {/* Col 1: label — always visible */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                                "flex items-center justify-center h-8 w-8 rounded-lg border shrink-0 transition-colors",
                                                isExpanded
                                                    ? "bg-primary/8 border-primary/15 text-primary"
                                                    : "bg-muted/50 border-transparent text-muted-foreground group-hover:border-border group-hover:bg-background"
                                            )}>
                                                {Icon && <Icon className="h-4 w-4" />}
                                            </div>
                                            <div className="min-w-0 w-full">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-medium text-foreground tracking-tight">
                                                        {notification.label}
                                                    </span>
                                                    {isCategory && (
                                                        <>
                                                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold bg-primary/8 text-primary border-primary/12 rounded-full">
                                                                {events.length}
                                                            </Badge>
                                                            <ChevronRight className={cn(
                                                                "h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200",
                                                                isExpanded && "rotate-90"
                                                            )} />
                                                        </>
                                                    )}
                                                </div>
                                                {notification.description && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground/70 truncate max-w-sm">
                                                        {notification.description}
                                                    </p>
                                                )}
                                                {/* Mobile channel list — inside label col, outside grid flow */}
                                                {!isCategory && (
                                                    <div onClick={e => e.stopPropagation()}>
                                                        <MobileChannelList
                                                            setting={notification}
                                                            updatingId={updatingId}
                                                            settingId={notification.id}
                                                            onToggle={(ch, checked) => toggleChannel(notification.id, ch, checked)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cols 2–5: desktop-only toggles or dash placeholders */}
                                        {isCategory
                                            ? CHANNELS.map(({ value }) => (
                                                <div key={value} className="hidden lg:flex items-center justify-center">
                                                    <div className="h-px w-4 bg-border/40 rounded-full" />
                                                </div>
                                            ))
                                            : CHANNELS.map(({ value, label }) => (
                                                <div key={value} className="hidden lg:flex items-center justify-center"
                                                    onClick={e => e.stopPropagation()}>
                                                    <ChannelToggle
                                                        config={getChannelConfig(notification, value)}
                                                        isUpdating={updatingId === `${notification.id}-${value}`}
                                                        label={label}
                                                        onToggle={(checked) => toggleChannel(notification.id, value, checked)}
                                                    />
                                                </div>
                                            ))
                                        }
                                    </div>

                                    {/* ── Sub-events ── */}
                                    {isCategory && isExpanded && (
                                        <div className="border-t border-border/40 bg-muted/10">
                                            {events.map((event, i) => (
                                                <div
                                                    key={event.key}
                                                    className={cn(
                                                        "px-5 py-3 hover:bg-muted/20 transition-colors",
                                                        "lg:grid lg:items-center lg:gap-0 lg:px-6",
                                                        GRID,
                                                        i !== events.length - 1 && "border-b border-border/30"
                                                    )}
                                                >
                                                    {/* Col 1: sub-event label */}
                                                    <div className="flex items-center lg:items-center gap-2 min-w-0 w-full lg:pl-11">
                                                        <div className="hidden lg:block h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                                                        <div className="min-w-0 w-full">
                                                            <span className="text-[13px] lg:text-sm text-foreground/80 lg:text-foreground/75 truncate">{event.label}</span>
                                                            {/* Mobile channel list — inside label col, outside grid flow */}
                                                            <MobileChannelList
                                                                setting={notification}
                                                                eventKey={event.key}
                                                                updatingId={updatingId}
                                                                settingId={notification.id}
                                                                onToggle={(ch, checked, ek) => toggleChannel(notification.id, ch, checked, ek)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Cols 2–5: desktop-only toggles */}
                                                    {CHANNELS.map(({ value, label }) => (
                                                        <div key={value} className="hidden lg:flex items-center justify-center">
                                                            <ChannelToggle
                                                                config={getChannelConfig(notification, value, event.key)}
                                                                isUpdating={updatingId === `${notification.id}-${event.key}-${value}`}
                                                                label={label}
                                                                onToggle={(checked) => toggleChannel(notification.id, value, checked, event.key)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 border-t border-border/50 bg-muted/10 px-6 py-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Info className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                <span className="font-medium text-muted-foreground">Locked channels</span> are restricted
                                due to technical or regulatory constraints.
                            </p>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    disabled={isResetting || isPending}
                                    className="shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {isResetting
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <RotateCcw className="h-3.5 w-3.5" />
                                    }
                                    Reset to defaults
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[200px] text-center">
                                Restores all channels to the recommended default configuration
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Card>
            </div>
        </TooltipProvider>
    )
}