"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Phone, School2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

type Status = "healthy" | "warning" | "critical";
type Level = "good" | "warn" | "bad";

interface Branch {
    name: string;
    location: string;
    code: string;
    type: string;
    status: Status;
    principal: { name: string; initials: string; phone: string };
    attendance: { value: string; level: Level };
    fees: { value: string; level: Level };
    students: number;
    defaulters: { value: string; level: Level };
    alerts: { level: "ok" | "warn" | "bad"; text: string }[];
}


const BRANCHES: Branch[] = [
    {
        name: "Pune Branch",
        location: "Kothrud, Pune",
        code: "SVP-001",
        type: "K-12 School",
        status: "healthy",
        principal: { name: "Rekha Sharma", initials: "RS", phone: "+91 98201 44321" },
        attendance: { value: "94%", level: "good" },
        fees: { value: "₹2.1L", level: "good" },
        students: 342,
        defaulters: { value: "4%", level: "good" },
        alerts: [
            { level: "ok", text: "All systems operational" },
            { level: "ok", text: "Exams scheduled on time" },
        ],
    },
    {
        name: "Mumbai Branch",
        location: "Andheri West, Mumbai",
        code: "SVM-002",
        type: "K-12 School",
        status: "warning",
        principal: { name: "Amit Parekh", initials: "AP", phone: "+91 91360 78812" },
        attendance: { value: "78%", level: "warn" },
        fees: { value: "₹1.3L", level: "warn" },
        students: 518,
        defaulters: { value: "19%", level: "warn" },
        alerts: [
            { level: "warn", text: "Attendance dipped below 80%" },
            { level: "warn", text: "18 fee reminders pending" },
        ],
    },
    {
        name: "Nashik Branch",
        location: "Gangapur Rd, Nashik",
        code: "SVN-003",
        type: "Coaching Center",
        status: "critical",
        principal: { name: "Priya Deshmukh", initials: "PD", phone: "+91 87659 11230" },
        attendance: { value: "61%", level: "bad" },
        fees: { value: "₹0.4L", level: "bad" },
        students: 189,
        defaulters: { value: "34%", level: "bad" },
        alerts: [
            { level: "bad", text: "Fee collection critically low" },
            { level: "bad", text: "Attendance below threshold" },
            { level: "warn", text: "2 teacher leaves unresolved" },
        ],
    },
];

// ── Style maps ────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, { bar: string; badge: string; dot: string; label: string }> = {
    healthy: { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400", label: "Healthy" },
    warning: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400", label: "Attention" },
    critical: { bar: "bg-red-400", badge: "bg-red-50 text-red-600", dot: "bg-red-400", label: "Critical" },
};

const LEVEL_COLOR: Record<Level, string> = {
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-red-500",
};

const ALERT_DOT: Record<"ok" | "warn" | "bad", string> = {
    ok: "bg-emerald-400",
    warn: "bg-amber-400",
    bad: "bg-red-400",
};

function Metric({
    label, value, sub, level,
}: {
    label: string; value: string; sub: string; level?: Level;
}) {
    return (
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {label}
            </p>
            <p className={cn("text-lg font-semibold leading-none", level ? LEVEL_COLOR[level] : "text-gray-900")}>
                {value}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
        </div>
    );
}

// ── Branch card ───────────────────────────────────────────────

function BranchCard({ b }: { b: Branch }) {
    const s = STATUS_STYLES[b.status];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer">

            {/* Status bar — top accent like the design */}
            <div className={cn("h-1 w-full", s.bar)} />

            <div className="p-5 space-y-4">

                {/* Name + badge */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{b.location}</p>
                    </div>
                    <Badge className={cn("text-[10px] font-semibold border-0 rounded-full px-2.5 py-1 flex items-center gap-1", s.badge)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                        {s.label}
                    </Badge>
                </div>

                {/* Code + type pills */}
                <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md font-mono">
                        {b.code}
                    </code>
                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                        {b.type}
                    </span>
                </div>

                {/* Principal */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-[11px] font-semibold">
                            {b.principal.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs font-medium text-gray-800">{b.principal.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            {b.principal.phone}
                        </p>
                    </div>
                </div>

                {/* 4 metrics */}
                <div className="grid grid-cols-2 gap-2">
                    <Metric label="Attendance" value={b.attendance.value} sub="today" level={b.attendance.level} />
                    <Metric label="Fees" value={b.fees.value} sub="this month" level={b.fees.level} />
                    <Metric label="Students" value={String(b.students)} sub="enrolled" />
                    <Metric label="Defaulters" value={b.defaulters.value} sub="pending" level={b.defaulters.level} />
                </div>

                {/* Alerts */}
                <div className="space-y-1.5">
                    {b.alerts.map((a, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", ALERT_DOT[a.level])} />
                            <span className="text-[11px] text-gray-500">{a.text}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────

export default function BranchDashboard() {
    return (
        <div className="space-y-8">
            <PageHeader
                icon={School2}
                title="Shiksha Vidyalaya Group"
                description="3 branches · Maharashtra"
                actions={<Button variant="ghost" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-medium rounded-full px-4 h-8">Group overview</Button>} />

            {/* Branches */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Branches
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BRANCHES.map((b) => <BranchCard key={b.code} b={b} />)}
                </div>
            </div>

            {/* Group overview */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Group overview
                </p>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                            📊
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">All branches</p>
                            <p className="text-xs text-gray-400 mt-0.5">Consolidated · May 2026</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {[
                            { label: "Students", value: "1,049" },
                            { label: "Attendance", value: "78%", level: "warn" as Level },
                            { label: "Fees", value: "₹3.8L", level: "warn" as Level },
                            { label: "Defaulters", value: "19%", level: "bad" as Level },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className={cn("text-xl font-semibold leading-none", s.level ? LEVEL_COLOR[s.level] : "text-gray-900")}>
                                    {s.value}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
            </div>

        </div>
    );
}