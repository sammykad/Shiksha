"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Search, RotateCcw, ExternalLink, Menu,
    Users, GraduationCap, BookOpen, Calendar,
    CreditCard, FileText, Bell, Settings, Building2,
    UserPlus, Mail, MessageSquare, BarChart3,
    AlertTriangle, CheckSquare, FolderOpen, Layout,
} from "lucide-react"
import type { Role } from "@/lib/permissions"
import { ROLE_CAPABILITIES, ROLE_META } from "@/lib/permissions"

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface RolePermissionsUser {
    id: string
    name: string
    role: "admin" | "teacher"
    organization: string
    initials: string
    avatarUrl?: string
}

// ─────────────────────────────────────────────────────────────
// TYPES (continued)
// ─────────────────────────────────────────────────────────────

interface PermissionRow {
    id: string
    label: string
    icon: string
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
}

interface PermissionCategory {
    id: string
    label: string
    permissions: PermissionRow[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    "user-plus": UserPlus,
    mail: Mail,
    "message-square": MessageSquare,
    "check-square": CheckSquare,
    "bar-chart-3": BarChart3,
    "file-text": FileText,
    "folder-open": FolderOpen,
    layout: Layout,
    "building-2": Building2,
    settings: Settings,
    users: Users,
    "graduation-cap": GraduationCap,
    "book-open": BookOpen,
    calendar: Calendar,
    "credit-card": CreditCard,
    bell: Bell,
    "alert-triangle": AlertTriangle,
}

function buildCategoriesForUser(role: Role): PermissionCategory[] {
    const caps = ROLE_CAPABILITIES[role]

    const groups: Record<string, { label: string; icon: string; perms: string[] }> = {
        students: { label: "Students", icon: "graduation-cap", perms: [] },
        teachers: { label: "Teachers", icon: "users", perms: [] },
        grades: { label: "Grades", icon: "graduation-cap", perms: [] },
        subjects: { label: "Subjects", icon: "book-open", perms: [] },
        attendance: { label: "Attendance", icon: "calendar", perms: [] },
        fees: { label: "Fees", icon: "credit-card", perms: [] },
        exams: { label: "Exams", icon: "file-text", perms: [] },
        notices: { label: "Notices", icon: "bell", perms: [] },
        reports: { label: "Reports", icon: "bar-chart-3", perms: [] },
        documents: { label: "Documents", icon: "file-text", perms: [] },
        org: { label: "Organization", icon: "building-2", perms: [] },
        users: { label: "Users", icon: "users", perms: [] },
        complaints: { label: "Complaints", icon: "alert-triangle", perms: [] },
        leaves: { label: "Leaves", icon: "calendar", perms: [] },
        holidays: { label: "Holidays", icon: "calendar", perms: [] },
        leads: { label: "Leads", icon: "users", perms: [] },
        agents: { label: "Agents", icon: "settings", perms: [] },
        certificates: { label: "Certificates", icon: "file-text", perms: [] },
        gallery: { label: "Gallery", icon: "file-text", perms: [] },
        "teaching-assignments": { label: "Teaching", icon: "book-open", perms: [] },
        assignments: { label: "Assignments", icon: "file-text", perms: [] },
        profile: { label: "Profile", icon: "users", perms: [] },
        children: { label: "Children", icon: "users", perms: [] },
        transport: { label: "Transport", icon: "calendar", perms: [] },
    }

    caps.forEach((cap) => {
        const resource = cap.split(":")[0]
        if (groups[resource]) {
            groups[resource].perms.push(cap)
        }
    })

    const categories: PermissionCategory[] = []

    Object.entries(groups).forEach(([, { label, icon, perms }]) => {
        if (perms.length === 0) return

        const permissions: PermissionRow[] = perms.map((perm, idx) => {
            const action = perm.split(":").slice(1).join(":")
            const viewLike = ["view", "manage", "mark", "analytics", "reminders", "reports", "resolve", "approve", "verify", "reject", "convert", "generate", "publish", "assign", "apply", "upload", "submit", "pay", "receipt:download", "results:view", "view:own", "view:child", "manage:assigned", "results:view:child", "pay:child", "edit:own", "track"].includes(action)
            const createLike = ["create", "convert"].includes(action)
            const editLike = ["manage", "update", "mark", "assign", "resolve", "approve", "verify", "reject", "generate", "publish", "reminders", "analytics", "reports"].includes(action)
            const deleteLike = ["delete", "reject"].includes(action)

            return {
                id: `${perm}`,
                label: action.replace(/:/g, " · "),
                icon,
                view: viewLike,
                create: createLike,
                edit: editLike,
                delete: deleteLike,
            }
        })

        categories.push({ id: label.toLowerCase(), label, permissions })
    })

    return categories
}

// ─────────────────────────────────────────────────────────────
// USER LIST
// ─────────────────────────────────────────────────────────────

function UserList({
    users,
    selectedId,
    search,
    onSearch,
    onSelect,
    onClose,
}: {
    users: RolePermissionsUser[]
    selectedId: string
    search: string
    onSearch: (v: string) => void
    onSelect: (id: string) => void
    onClose?: () => void
}) {
    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase()) ||
            u.organization.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col">
            <div className="p-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 h-9 text-sm bg-white"
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
                            ✕
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="divide-y divide-slate-100">
                    {filtered.map((user) => {
                        const meta = ROLE_META[user.role as Role]
                        return (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onSelect(user.id)
                                    onClose?.()
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                    selectedId === user.id
                                        ? "bg-blue-50 border-l-2 border-l-blue-600"
                                        : "hover:bg-slate-50 border-l-2 border-l-transparent"
                                )}
                            >
                                <Avatar className="h-9 w-9 shrink-0">
                                    {user.avatarUrl ? (
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    ) : (
                                        <AvatarFallback className="text-xs font-medium">
                                            {user.initials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate capitalize">{meta.label}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// PERMISSION ROW
// ─────────────────────────────────────────────────────────────

function PermissionRowComponent({
    permission,
    onToggle,
}: {
    permission: PermissionRow
    onToggle: (id: string, action: "view" | "create" | "edit" | "delete", checked: boolean) => void
}) {
    const Icon = ICON_MAP[permission.icon] || FileText

    return (
        <div className="grid grid-cols-[1fr_repeat(4,5rem)] px-4 py-2.5 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 items-center">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate">{permission.label}</span>
            </div>

            {(["view", "create", "edit", "delete"] as const).map((action) => (
                <div key={action} className="flex items-center justify-center">
                    <Checkbox
                        id={`${permission.id}-${action}`}
                        checked={permission[action]}
                        onCheckedChange={(checked) => onToggle(permission.id, action, checked as boolean)}
                    />
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// PERMISSION PANEL
// ─────────────────────────────────────────────────────────────

function PermissionPanel({
    user,
}: {
    user: RolePermissionsUser
}) {
    const [categories, setCategories] = useState<PermissionCategory[]>(() => buildCategoriesForUser(user.role as Role))
    const meta = ROLE_META[user.role as Role]

    // Rebuild categories when user changes
    const [key, setKey] = useState(0)

    const handleReset = () => {
        setCategories(buildCategoriesForUser(user.role as Role))
        setKey((k) => k + 1)
    }

    const handleToggle = (id: string, action: "view" | "create" | "edit" | "delete", checked: boolean) => {
        setCategories((prev) =>
            prev.map((cat) => ({
                ...cat,
                permissions: cat.permissions.map((p) =>
                    p.id === id ? { ...p, [action]: checked } : p
                ),
            }))
        )
    }

    return (
        <div className="flex flex-col">
            {/* User Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {user.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                        ) : (
                            <AvatarFallback className="text-xs font-medium">
                                {user.initials}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                            <Badge variant="outline" className="text-[11px] capitalize">{user.role}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{user.organization}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Restore default</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Profile unavailable</span>
                    </Button>
                </div>
            </div>

            {/* Column Headers */}
            <div className="hidden md:grid grid-cols-[1fr_repeat(4,5rem)] px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Permission
                </span>
                {["View", "Create", "Edit", "Delete"].map((col) => (
                    <span key={col} className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        {col}
                    </span>
                ))}
            </div>

            {/* Categories */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="divide-y divide-slate-200">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {category.label}
                                </span>
                            </div>
                            <div>
                                {category.permissions.map((perm) => (
                                    <PermissionRowComponent
                                        key={perm.id}
                                        permission={perm}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default function RolePermissions({ users }: { users: RolePermissionsUser[] }) {
    const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "")
    const [searchQuery, setSearchQuery] = useState("")
    const [showUserList, setShowUserList] = useState(false)

    const selectedUser = users.find((u) => u.id === selectedUserId)

    if (!selectedUser) {
        return (
            <Card>
                <CardHeader>
                    <h2 className="text-sm font-medium text-slate-900">User Permissions</h2>
                    <p className="text-xs text-slate-500 mt-0.5">No users found.</p>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            {/* Header */}
            <CardHeader className="gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden -ml-2"
                    onClick={() => setShowUserList(true)}
                >
                    <Menu className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-sm font-medium text-slate-900">User Permissions</h2>
                    <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                        Manage per-user access permissions.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop: Two-panel layout */}
                <div className="flex-1 min-h-0 hidden lg:grid lg:grid-cols-[16rem_1fr] gap-2">
                    <Card className="overflow-hidden flex flex-col min-h-0">
                        <UserList
                            users={users}
                            selectedId={selectedUserId}
                            search={searchQuery}
                            onSearch={setSearchQuery}
                            onSelect={setSelectedUserId}
                        />
                    </Card>

                    <Card className="overflow-hidden flex flex-col min-h-0">
                        <PermissionPanel
                            key={selectedUserId}
                            user={selectedUser}
                        />
                    </Card>
                </div>

                {/* Mobile: Show one panel at a time */}
                <div className="flex-1 min-h-0 lg:hidden">
                    <Card className="h-full overflow-hidden">
                        {showUserList ? (
                            <UserList
                                users={users}
                                selectedId={selectedUserId}
                                search={searchQuery}
                                onSearch={setSearchQuery}
                                onSelect={setSelectedUserId}
                                onClose={() => setShowUserList(false)}
                            />
                        ) : (
                            <PermissionPanel
                                key={selectedUserId}
                                user={selectedUser}
                            />
                        )}
                    </Card>
                </div>
            </CardContent>

        </Card >
    )
}
