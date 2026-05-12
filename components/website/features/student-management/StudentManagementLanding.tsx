"use client";

import { useState } from "react";
import {
    Star, Mail, Phone, ChevronsUpDown, CheckCircle2, Shield, Zap, BarChart3, FileText,
    Calendar, CreditCard, Users, BookOpen,
    TrendingUp, Award, Eye, Download, Bell, Layers, Database,
    Fingerprint, Activity, AlertCircle, Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

/* ═══════════════════ HERO DATA ═══════════════════ */

const leftStudent = {
    name: "Rashmika S.",
    subtitle: "Class 10A, St. Xavier's",
    email: "rashmika.s@school.in",
    phone: "+91 98765-43210",
    avatar: "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg",
};

const rightStudent = {
    name: "Priya C.",
    subtitle: "Class 12B, Modern School",
    email: "priya.c@school.in",
    phone: "+91 91234-56789",
    avatar: "https://images.pexels.com/photos/26617600/pexels-photo-26617600.jpeg",
};

const tableRows = [
    {
        id: 1,
        name: "Anjali Wilson",
        role: "Head Girl",
        grade: "12th Science",
        email: "anjaliw@mail.com",
        phone: "(080) 4567-8901",
        avatar: "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg",
        avatarBg: "bg-teal-600",
        showGrade: true,
        showContact: true,
    },
    {
        id: 2,
        name: "Vikrama Sanders",
        role: "Sports Dept",
        grade: "12th Arts",
        email: "vikrams@mail.com",
        phone: null,
        avatar: "https://images.pexels.com/photos/33067039/pexels-photo-33067039.jpeg",
        avatarBg: "bg-rose-700",
        showGrade: true,
        showContact: false,
    },
    {
        id: 3,
        name: "Priya Patel",
        role: "Cultural Sec",
        grade: null,
        email: null,
        phone: null,
        avatar: "https://images.pexels.com/photos/5880155/pexels-photo-5880155.jpeg",
        avatarBg: "bg-amber-600",
        showGrade: false,
        showContact: false,
    },
];

/* ═══════════════════ REUSABLE PRIMITIVES ═══════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3CD39]" />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">{children}</span>
        </div>
    );
}

/* ═══════════════════ HERO SUB-COMPONENTS ═══════════════════ */

function ProfileCard({ student }: { student: typeof leftStudent }) {
    return (
        <Card className="w-64 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] border border-neutral-100 relative pt-10 bg-white">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[1.5px] border-neutral-800 bg-sky-100 overflow-hidden shadow-sm">
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="px-5 pb-5">
                <div className="text-center mb-5">
                    <h3 className="text-base font-semibold tracking-tight text-neutral-900">{student.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{student.subtitle}</p>
                </div>
                <div className="bg-[#f6f6f5] rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                        <span className="text-xs text-neutral-700 truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                        <span className="text-xs text-neutral-700">{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="w-3.5 h-3.5 rounded bg-neutral-200/80 shrink-0" />
                        <div className="h-2 w-20 bg-neutral-200/80 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded bg-neutral-200/80 shrink-0" />
                        <div className="h-2 w-16 bg-neutral-200/80 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TableSection() {
    return (
        <Card className="w-full lg:w-[580px] xl:w-[660px] rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-neutral-100 overflow-hidden p-2.5">
            <div className="bg-[#f6f6f5] rounded-2xl flex items-center py-3 px-4 mb-1.5 mt-1 mx-0.5">
                <div className="flex-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-400 tracking-widest uppercase">
                    Name <ChevronsUpDown className="w-3 h-3" strokeWidth={1.5} />
                </div>
                <div className="flex-[0.8] hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-400 tracking-widest uppercase">
                    Grade <ChevronsUpDown className="w-3 h-3" strokeWidth={1.5} />
                </div>
                <div className="flex-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-400 tracking-widest uppercase">
                    Contact <ChevronsUpDown className="w-3 h-3" strokeWidth={1.5} />
                </div>
            </div>
            <div className="px-1.5 pb-1.5 flex flex-col gap-0.5">
                {tableRows.map((row, i) => (
                    <div key={row.id} className={`flex items-center py-3 px-2.5 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group ${i === 1 ? "bg-neutral-50/50" : ""}`}>
                        <div className="flex-1 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full border-[1.5px] border-neutral-800 ${row.avatarBg} shrink-0 overflow-hidden shadow-sm`}>
                                <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900 tracking-tight">{row.name}</div>
                                <div className="text-xs text-neutral-400 mt-0.5">{row.role}</div>
                            </div>
                        </div>
                        <div className="flex-[0.8] hidden sm:block text-sm text-neutral-600">
                            {row.showGrade ? row.grade : <div className="h-2 w-16 bg-neutral-200/80 rounded-full" />}
                        </div>
                        <div className="flex-1 text-sm">
                            {row.showContact ? (
                                <>
                                    <div className="text-xs text-neutral-700">{row.email}</div>
                                    <div className="text-xs text-neutral-400 mt-0.5">{row.phone}</div>
                                </>
                            ) : (
                                <>
                                    {row.email
                                        ? <div className="text-xs text-neutral-700">{row.email}</div>
                                        : <div className="h-2 w-24 bg-neutral-200/80 rounded-full mt-1" />}
                                    <div className="mt-2 h-2 w-18 bg-neutral-200/80 rounded-full" />
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

/* ═══════════════════ HERO SECTION ═══════════════════ */

function HeroSection() {
    return (
        <section className="relative pt-16 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <Badge variant="outline" className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border-neutral-100 mb-7 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                    4.9 Rated By Indian Schools
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tight text-neutral-900 leading-[1.08]">
                    Student Management System — Access Any Record in Seconds
                </h1>
                <p className="mt-6 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                    One unified platform for every student profile, admission document, and academic record.
                    Built for Indian school administrators who need complete visibility — not scattered spreadsheets.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <Button asChild size="lg" className="w-full sm:w-auto bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-base shadow-sm h-auto">
                        <Link href="/select-organization">See It In Action — Free Demo</Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 font-medium px-8 py-3.5 rounded-full text-base shadow-sm h-auto">
                        Contact Sales
                    </Button>
                </div>
            </div>

            {/* Showcase */}
            <div className="relative w-full max-w-7xl mx-auto  h-auto lg:h-[440px] flex flex-col lg:block items-center gap-10 lg:gap-0">
                <div className="lg:absolute lg:left-0 lg:top-0 z-20 mt-10 lg:mt-0">
                    <ProfileCard student={leftStudent} />
                </div>
                <div className="relative lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-14 z-10 w-full lg:w-auto">
                    <TableSection />
                </div>
                <div className="lg:absolute lg:right-0 lg:top-0 z-20 mt-10 lg:mt-0">
                    <ProfileCard student={rightStudent} />
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ TRUSTED BY ═══════════════════ */

function TrustedBy() {
    const stats = [
        { value: "1,200+", label: "Schools Across India" },
        { value: "8.4L+", label: "Student Profiles Managed" },
        { value: "18", label: "States Covered" },
        { value: "99.9%", label: "Uptime SLA" },
    ];
    const schools = ["Delhi Public School", "Kendriya Vidyalaya", "St. Xavier's", "Ryan International", "DAV Public School", "Navodaya Vidyalaya"];

    return (
        <section className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
                            <div className="text-3xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                            <div className="text-xs text-neutral-500 mt-1.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* School logos (text-based) */}
                <div className="text-center">
                    <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-7">Trusted by India&apos;s leading schools</p>
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {schools.map(s => (
                            <div key={s} className="bg-white border border-neutral-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-500 shadow-sm">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial social proof */}
                <div className="max-w-lg mx-auto bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6">
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                        ))}
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                        &ldquo;We digitized 3,000+ student records in under a week. The 360&deg; profile view changed how we make decisions.&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-800">RI</div>
                        <div>
                            <p className="text-xs font-semibold text-neutral-900">Admin Head, Ryan International School</p>
                            <p className="text-[10px] text-neutral-400">3,000+ records digitized · Mumbai</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ WHAT IS THIS ═══════════════════ */

function WhatIsThis() {
    const pillars = [
        { icon: Database, title: "Single Source of Truth", desc: "All student data — from admission records to final exam scores — lives in one clean, auditable place. No more chasing spreadsheets." },
        { icon: Eye, title: "360° Student View", desc: "See identity, academics, fees, attendance, and documents all from one unified profile. Complete context, instant decisions." },
        { icon: Zap, title: "Real-Time Updates", desc: "Every fee payment, attendance mark, or grade change reflects instantly across the system — no manual syncing needed." },
        { icon: Shield, title: "Secure & Role-Based", desc: "Admins, teachers, and parents each see exactly what they need — nothing more. Powered by granular role-based access control." },
    ];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left text */}
                    <div>
                        <SectionLabel>What Is This Feature</SectionLabel>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
                            The Core Engine of Your School's Digital Ecosystem
                        </h2>
                        <p className="text-neutral-500 leading-relaxed mb-8">
                            Student Management is not just a database. It's a living, intelligent record system that transforms raw student data into actionable insights — helping administrators, teachers, and parents make better decisions, faster.
                        </p>
                        <div className="flex flex-col gap-3">
                            {["Administrative Record Keeping", "360° Academic Monitoring", "Financial Accountability", "Attendance Tracking", "Document Management"].map(u => (
                                <div key={u} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700">{u}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pillars.map(p => (
                            <div key={p.title} className="bg-[#f8f8f6] rounded-2xl p-5 border border-neutral-100">
                                <div className="w-9 h-9 bg-white rounded-xl border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
                                    <p.icon className="w-4 h-4 text-neutral-700" strokeWidth={1.8} />
                                </div>
                                <div className="text-sm font-semibold text-neutral-900 mb-1.5">{p.title}</div>
                                <div className="text-xs text-neutral-500 leading-relaxed">{p.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ DATA STRUCTURE ═══════════════════ */

function DataStructure() {
    const categories = [
        {
            icon: Fingerprint, label: "Identity", color: "bg-violet-50 text-violet-600",
            fields: ["Full Name", "Date of Birth", "Gender", "Blood Group", "Profile Image"],
        },
        {
            icon: BookOpen, label: "Academic", color: "bg-sky-50 text-sky-600",
            fields: ["Grade & Section", "Roll Number", "Subjects Assigned", "Exam Results", "GPA/Standing"],
        },
        {
            icon: Phone, label: "Contact", color: "bg-emerald-50 text-emerald-600",
            fields: ["Email & Phone", "WhatsApp", "Emergency Contact", "Father's Details", "Mother's Details"],
        },
        {
            icon: Layers, label: "Administrative", color: "bg-amber-50 text-amber-600",
            fields: ["Unique Student ID", "Admission Date", "Caste/Sub-caste", "Account Status", "Enrollment Type"],
        },
        {
            icon: CreditCard, label: "Financial", color: "bg-rose-50 text-rose-600",
            fields: ["Fee Categories", "Total Fees", "Paid Amount", "Due Dates", "Transaction History"],
        },
        {
            icon: FileText, label: "Documents", color: "bg-neutral-100 text-neutral-600",
            fields: ["Aadhaar Card", "Birth Certificate", "Marksheets", "Transfer Cert.", "Caste Certificate"],
        },
    ];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>Data Structure</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        Every Data Point, Logically Organized
                    </h2>
                    <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
                        Six structured categories ensure fast access, security, and completeness — covering everything a school needs to run efficiently.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.label} className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color} border border-neutral-100`}>
                                    <cat.icon className="w-4 h-4" strokeWidth={1.8} />
                                </div>
                                <span className="text-sm font-semibold text-neutral-900">{cat.label}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {cat.fields.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-500">
                                        <div className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ PERFORMANCE TRACKING ═══════════════════ */

function PerformanceTracking() {
    const radarSubjects = [
        { s: "Math", pct: 92 }, { s: "Science", pct: 78 }, { s: "English", pct: 85 },
        { s: "History", pct: 70 }, { s: "Hindi", pct: 88 }, { s: "Comp", pct: 95 },
    ];
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const bars = [95, 88, 90, 83, 78, 92];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Mock UI Cards */}
                    <div className="flex flex-col gap-4">
                        {/* Quick stat cards mock */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Attendance", value: "87%", icon: Calendar, color: "bg-[#f4fdd4] text-lime-700" },
                                { label: "GPA Standing", value: "A Tier", icon: Award, color: "bg-sky-50 text-sky-700" },
                                { label: "Tests Due", value: "3", icon: Bell, color: "bg-amber-50 text-amber-600" },
                            ].map(c => (
                                <div key={c.label} className={`rounded-2xl p-4 ${c.color} border border-neutral-100`}>
                                    <c.icon className="w-4 h-4 mb-2 opacity-70" strokeWidth={1.8} />
                                    <div className="text-lg font-bold tracking-tight">{c.value}</div>
                                    <div className="text-xs opacity-60 mt-0.5">{c.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Subject proficiency bars */}
                        <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-5">
                            <div className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                                Subject Proficiency
                            </div>
                            <div className="flex flex-col gap-3">
                                {radarSubjects.map(s => (
                                    <div key={s.s} className="flex items-center gap-3">
                                        <div className="w-14 text-xs text-neutral-500 shrink-0 text-right">{s.s}</div>
                                        <div className="flex-1 h-2 bg-white rounded-full border border-neutral-200">
                                            <div className="h-2 rounded-full bg-[#A3E635] transition-all" style={{ width: `${s.pct}%` }} />
                                        </div>
                                        <div className="w-8 text-xs font-semibold text-neutral-600">{s.pct}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attendance trend */}
                        <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-5">
                            <div className="text-xs font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" strokeWidth={1.8} />
                                Monthly Attendance
                            </div>
                            <div className="flex items-end gap-2 h-16">
                                {bars.map((b, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t-lg bg-[#d9f972] transition-all"
                                            style={{ height: `${(b / 100) * 56}px` }}
                                        />
                                        <span className="text-[9px] text-neutral-400">{months[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Feature description */}
                    <div className="lg:pt-4">
                        <SectionLabel>Performance Tracking</SectionLabel>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
                            Data Visualization,<br />Not Data Reading
                        </h2>
                        <p className="text-neutral-500 leading-relaxed mb-10">
                            Shiksha Cloud is built on the principle that you should see patterns instantly — not hunt through rows and columns. Every metric is visualized so the right decision is always one glance away.
                        </p>
                        <div className="flex flex-col gap-6">
                            {[
                                {
                                    icon: BarChart3, title: "Quick-View Stats Cards",
                                    desc: "Attendance rate, GPA standing, and upcoming assessments surface at the top of every profile — no digging required.",
                                },
                                {
                                    icon: TrendingUp, title: "Academic Growth Trend",
                                    desc: "A line chart tracks percentage growth across exam sessions, making improvement (or decline) immediately visible.",
                                },
                                {
                                    icon: Award, title: "Actionable Strength Reports",
                                    desc: "The system automatically flags strengths and improvement areas based on exam results — enabling personalized student support.",
                                },
                                {
                                    icon: Calendar, title: "Visual Attendance Heatmap",
                                    desc: "A calendar-style heatmap highlights presence, absence, and late patterns at a glance — far clearer than a register.",
                                },
                            ].map(f => (
                                <div key={f.title} className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                        <f.icon className="w-4 h-4 text-neutral-700" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900 mb-1">{f.title}</div>
                                        <div className="text-sm text-neutral-500 leading-relaxed">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ STATUS BADGES SECTION ═══════════════════ */

function StatusBadgesSection() {
    const badges = [
        {
            icon: CheckCircle2, variant: "Verified", color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            desc: "Documents have been checked, uploaded, and approved by administration.",
        },
        {
            icon: AlertCircle, variant: "Payment Due", color: "text-red-600 bg-red-50 border-red-200",
            desc: "One or more fee categories have a pending balance before the due date.",
        },
        {
            icon: Activity, variant: "Active", color: "text-sky-600 bg-sky-50 border-sky-200",
            desc: "Student is currently enrolled, attending classes, and in good standing.",
        },
        {
            icon: FileText, variant: "Doc Pending", color: "text-amber-600 bg-amber-50 border-amber-200",
            desc: "Some required documents are uploaded but awaiting administrative review.",
        },
    ];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <SectionLabel>Status Badges</SectionLabel>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
                            Instant Visual Feedback — No Text Reading Required
                        </h2>
                        <p className="text-neutral-500 leading-relaxed">
                            Color-coded status badges provide at-a-glance clarity on a student's enrollment, financial, and document status. One look tells you everything — even before you open the profile.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map(b => (
                            <div key={b.variant} className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 ${b.color}`}>
                                    <b.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                                    {b.variant}
                                </div>
                                <div className="text-xs text-neutral-500 leading-relaxed">{b.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ TABBED SECTIONS FEATURE ═══════════════════ */

function TabbedSectionFeature() {
    const [active, setActive] = useState(0);
    const tabs = [
        {
            label: "Overview",
            icon: Users,
            headline: "Personal & Contact Details at a Glance",
            desc: "The overview tab consolidates identity, contact info, parent details, and status badges into a single scannable view. Admins can verify, edit, or export records in seconds.",
            bullets: ["Personal information panel", "Parent & emergency contacts", "Document verification status", "Color-coded status badges"],
            visual: (
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {[["Full Name", "Aarav Sharma"], ["Student ID", "SKL-2024-1042"], ["Class", "10 – A"], ["Roll No", "14"]].map(([k, v]) => (
                            <div key={k} className="bg-[#f8f8f6] rounded-xl p-3">
                                <div className="text-[10px] text-neutral-400 mb-1">{k}</div>
                                <div className="text-xs font-semibold text-neutral-800">{v}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Active</span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Verified</span>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" />Payment Due</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Academic",
            icon: BookOpen,
            headline: "Deep Dive into Marks, Grades & Growth",
            desc: "View subject-wise marks, grades, and performance trends. Download hall tickets and report cards directly from the academic tab.",
            bullets: ["Subject-wise marks with progress bars", "Radar chart for subject proficiency", "Growth trend line chart", "Download hall ticket & report card"],
            visual: (
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                    {[["Mathematics", "92", "A+", "text-emerald-600 bg-emerald-50"], ["Science", "78", "B+", "text-violet-600 bg-violet-50"], ["English", "85", "A", "text-sky-600 bg-sky-50"], ["Hindi", "88", "A", "text-sky-600 bg-sky-50"]].map(([s, m, g, gc]) => (
                        <div key={s} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                            <div className="w-24 text-xs text-neutral-600 shrink-0">{s}</div>
                            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full"><div className="h-1.5 rounded-full bg-[#A3E635]" style={{ width: `${m}%` }} /></div>
                            <div className="text-xs text-neutral-500 w-7">{m}%</div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gc}`}>{g}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                        <button className="flex items-center gap-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-lg"><Download className="w-3 h-3" />Report Card</button>
                        <button className="flex items-center gap-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-lg"><Download className="w-3 h-3" />Hall Ticket</button>
                    </div>
                </div>
            ),
        },
        {
            label: "Attendance",
            icon: Calendar,
            headline: "Visual Heatmap of Daily Presence",
            desc: "A calendar-style heatmap shows presence, absence, and late arrivals for every working day. Monthly trend bars make patterns easy to spot.",
            bullets: ["Daily heatmap calendar", "Monthly attendance bar charts", "Present / Absent / Late breakdown", "Exportable attendance report"],
            visual: (
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} className="text-center text-[9px] text-neutral-400 font-medium">{d}</div>)}
                    </div>
                    {[
                        ["present", "present", "present", "absent", "present", "holiday", "holiday"],
                        ["present", "late", "present", "present", "absent", "holiday", "holiday"],
                        ["present", "present", "present", "present", "present", "holiday", "holiday"],
                        ["absent", "present", "present", "present", "present", "holiday", "holiday"],
                    ].map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                            {week.map((s, di) => (
                                <div key={di} className={`h-6 rounded-md text-[9px] flex items-center justify-center font-medium text-neutral-600 ${s === "present" ? "bg-[#d9f972]" : s === "absent" ? "bg-red-200" : s === "late" ? "bg-amber-200" : "bg-neutral-100"
                                    }`}>{wi * 7 + di + 1 <= 31 ? wi * 7 + di + 1 : ""}</div>
                            ))}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            label: "Fees",
            icon: CreditCard,
            headline: "Real-Time Fee Payment Progress",
            desc: "Track every fee category — tuition, library, transport — with real-time progress bars showing paid vs. pending amounts and full transaction history.",
            bullets: ["Per-category fee progress bars", "Total / Paid / Due summary cards", "Full transaction history table", "Exportable payment receipts"],
            visual: (
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[["Total", "₹78,000", "bg-neutral-100", "text-neutral-800"], ["Paid", "₹65,500", "bg-[#f4fdd4]", "text-lime-800"], ["Due", "₹12,500", "bg-red-50", "text-red-700"]].map(([l, v, bg, t]) => (
                            <div key={l} className={`rounded-xl p-3 ${bg}`}>
                                <div className={`text-sm font-bold ${t}`}>{v}</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5">{l}</div>
                            </div>
                        ))}
                    </div>
                    {[["Tuition Fee", 100], ["Transport Fee", 67], ["Sports Fee", 50], ["Lab Fee", 0]].map(([name, pct]) => (
                        <div key={name} className="mb-2.5">
                            <div className="flex justify-between mb-1">
                                <span className="text-xs text-neutral-600">{name}</span>
                                <span className={`text-[10px] font-semibold ${pct === 100 ? "text-emerald-600" : pct === 0 ? "text-red-500" : "text-amber-600"}`}>
                                    {pct === 100 ? "Paid" : pct === 0 ? "Due" : `${pct}%`}
                                </span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 rounded-full"><div className={`h-1.5 rounded-full ${pct === 100 ? "bg-[#A3E635]" : pct === 0 ? "bg-red-300" : "bg-amber-400"}`} style={{ width: `${pct}%` }} /></div>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>Profile Tabs</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        Everything Organized Into Four Clear Sections
                    </h2>
                </div>

                {/* Tab Pills */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-1.5 bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-1.5">
                        {tabs.map((t, i) => (
                            <button
                                key={t.label}
                                onClick={() => setActive(i)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${active === i ? "bg-[#d9f972] text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                    }`}
                            >
                                <t.icon className="w-4 h-4" strokeWidth={1.8} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">{tabs[active].headline}</h3>
                        <p className="text-neutral-500 leading-relaxed mb-8">{tabs[active].desc}</p>
                        <div className="flex flex-col gap-3">
                            {tabs[active].bullets.map(b => (
                                <div key={b} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm text-neutral-700">{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>{tabs[active].visual}</div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

function Testimonials() {
    const quotes = [
        { quote: "We used to take 3 hours every Monday just to compile attendance. Now it's done automatically. Shiksha Cloud saved our admin team an entire workday every week.", name: "Mrs. Kavita Nair", role: "Principal, St. Anne's School, Kochi" },
        { quote: "The fee tracking feature alone was worth the switch. Parents get notified, teachers see fee status, and we've reduced payment delays by 60% in one term.", name: "Mr. Ramesh Agarwal", role: "Admin Director, DAV Public School, Jaipur" },
        { quote: "Exam season used to be chaos — printing hall tickets, tracking marks, generating report cards. Now every student profile has it all in one place. One click.", name: "Ms. Deepika Sharma", role: "Academic Coordinator, DPS Vasant Kunj" },
    ];

    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>Testimonials</SectionLabel>
                    <h2 className="text-4xl font-semibold tracking-tight text-neutral-900">What School Leaders Are Saying</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                    {quotes.map((q, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed mb-6 flex-1">&quot;{q.quote}&quot;</p>
                            <div>
                                <div className="text-sm font-semibold text-neutral-900">{q.name}</div>
                                <div className="text-xs text-neutral-400 mt-0.5">{q.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


/* ═══════════════════ MAIN EXPORT ═══════════════════ */

export default function StudentManagementLanding() {
    return (
        <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
            {/* Global bg grid */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
            <HeroSection />
            <TrustedBy />
            <WhatIsThis />
            <DataStructure />
            <PerformanceTracking />
            <TabbedSectionFeature />
            <StatusBadgesSection />
            <Testimonials />
        </div>
    );
}