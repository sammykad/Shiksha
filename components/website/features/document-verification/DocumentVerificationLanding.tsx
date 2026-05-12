'use client';

import { useState } from 'react';
import {
    ArrowRight, CheckCircle2, Check, AlertCircle, Clock,
    Upload, ShieldCheck, Bell, FileText, Eye, X,
    Smartphone, Mail, MessageSquare, Zap, Hash, Star, Users, Lock,
    RefreshCw, Filter, Download, BarChart3,
    FileCheck, FilePlus, FileX, Send,
} from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════ PRIMITIVES ═══════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3CD39]" />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">{children}</span>
        </div>
    );
}

/* ═══════════════════ HERO ═══════════════════ */

function Hero() {
    const docs = [
        { name: 'Aadhaar Card', status: 'verified', initials: 'AS', color: 'bg-emerald-100 text-emerald-700' },
        { name: 'Birth Certificate', status: 'verified', initials: 'PP', color: 'bg-sky-100 text-sky-700' },
        { name: 'Transfer Certificate', status: 'pending', initials: 'RV', color: 'bg-amber-100 text-amber-700' },
        { name: 'Caste Certificate', status: 'rejected', initials: 'AK', color: 'bg-rose-100 text-rose-700' },
    ];

    const statusStyle: Record<string, string> = {
        verified: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        pending: 'text-amber-600 bg-amber-50 border-amber-200',
        rejected: 'text-red-600 bg-red-50 border-red-200',
    };
    const statusIcon: Record<string, React.ReactNode> = {
        verified: <Check className="w-3 h-3" strokeWidth={2.5} />,
        pending: <Clock className="w-3 h-3" strokeWidth={2} />,
        rejected: <X className="w-3 h-3" strokeWidth={2.5} />,
    };

    return (
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span className="text-xs font-semibold text-teal-600">Zero missing documents at admission time</span>
                        </div>

                        <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
                            Document Verification System — Verified, Notified, Nothing Lost
                        </h1>

                        <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
                            Students upload documents from their dashboard. Admins verify or reject with one click. Students get instant notifications across SMS, WhatsApp, Email, and Push — powered by Shiksha Cloud&apos;s own notification engine.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
                            {[
                                { value: '4', label: 'Notification channels' },
                                { value: '< 1min', label: 'Avg. notification time' },
                                { value: '100%', label: 'Audit-ready records' },
                            ].map((s, i) => (
                                <div key={s.label} className={`${i > 0 ? 'pl-6 border-l border-neutral-200' : ''}`}>
                                    <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                                    <div className="text-xs text-neutral-400 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <Link href="/select-organization" className="flex items-center justify-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
                                Book a Free Demo <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/pricing" className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
                                View Pricing
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400">
                            {['No missing docs', 'Own notification engine', 'Tamper-proof audit trail'].map(t => (
                                <div key={t} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                                    <span>{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Dashboard Mock */}
                    <div className="relative">
                        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                            {/* Window bar */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-[#f8f8f6]">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-neutral-300" />
                                        <div className="w-3 h-3 rounded-full bg-neutral-300" />
                                        <div className="w-3 h-3 rounded-full bg-neutral-300" />
                                    </div>
                                    <span className="text-xs font-medium text-neutral-500 ml-1">Document Verification</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 text-xs text-neutral-500 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg">
                                        <Filter className="w-3 h-3" /> Filter
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                {/* Stat row */}
                                <div className="grid grid-cols-3 gap-2.5">
                                    {[
                                        { label: 'Pending Review', value: '14', color: 'bg-amber-50 text-amber-700' },
                                        { label: 'Verified', value: '183', color: 'bg-[#f4fdd4] text-lime-700' },
                                        { label: 'Rejected', value: '6', color: 'bg-red-50 text-red-700' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.color} rounded-xl p-3 border border-neutral-100`}>
                                            <div className="text-xl font-bold tracking-tight">{s.value}</div>
                                            <div className="text-[10px] mt-0.5 opacity-70 leading-snug">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Doc rows */}
                                <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 overflow-hidden">
                                    <div className="grid grid-cols-12 px-4 py-2.5 border-b border-neutral-200 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                                        <span className="col-span-1" />
                                        <span className="col-span-5">Document</span>
                                        <span className="col-span-3">Student</span>
                                        <span className="col-span-3">Status</span>
                                    </div>
                                    {docs.map((d, i) => (
                                        <div key={d.name} className={`grid grid-cols-12 items-center px-4 py-3.5 hover:bg-white transition-colors cursor-pointer ${i < docs.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                                            <div className="col-span-1">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                                                    <FileText className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <div className="col-span-5">
                                                <div className="text-xs font-semibold text-neutral-800">{d.name}</div>
                                                <div className="text-[10px] text-neutral-400 mt-0.5">PDF · 2.4 MB</div>
                                            </div>
                                            <div className="col-span-3">
                                                <div className={`w-6 h-6 rounded-full ${d.color} flex items-center justify-center text-[8px] font-bold`}>
                                                    {d.initials}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${statusStyle[d.status]}`}>
                                                    {statusIcon[d.status]}
                                                    <span className="capitalize">{d.status}</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action row */}
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
                                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Verify Selected
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition-colors">
                                        <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Reject with Reason
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Floating notification badge */}
                        <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f4fdd4] flex items-center justify-center">
                                <Send className="w-5 h-5 text-lime-700" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-base font-bold tracking-tight text-neutral-900">Instant</p>
                                <p className="text-[10px] text-neutral-400">4-channel notification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ STATS STRIP ═══════════════════ */

function StatsStrip() {
    return (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                    { value: '500+', label: 'Schools using it' },
                    { value: '< 1min', label: 'Avg. notification time' },
                    { value: '0', label: 'Missing docs at admission' },
                    { value: '4', label: 'Notification channels' },
                ].map(s => (
                    <div key={s.label}>
                        <div className="text-3xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                        <div className="text-xs text-neutral-400 mt-1.5">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════ WORKFLOW — STUDENT & ADMIN ═══════════════════ */

function Workflow() {
    const studentSteps = [
        { icon: FilePlus, title: 'Upload Documents', desc: 'Student logs into their dashboard and uploads required documents — Aadhaar, Birth Certificate, Transfer Certificate, and more — in any format (PDF, JPG, PNG).' },
        { icon: Eye, title: 'Track Status', desc: 'Each document shows a live status: Pending, Under Review, Verified, or Rejected. No need to call the office.' },
        { icon: Bell, title: 'Get Notified', desc: 'The moment an admin takes action, the student receives an instant notification across all four channels simultaneously.' },
        { icon: RefreshCw, title: 'Re-upload if Rejected', desc: 'If rejected, the admins reason is shown clearly.Student re- uploads the correct version in the same flow.' },
    ];

    const adminSteps = [
        { icon: Filter, title: 'Review Queue', desc: 'All pending documents appear in a prioritised review queue. Filter by student, class, section, or document type.' },
        { icon: FileCheck, title: 'Verify with One Click', desc: 'Open the document preview, check it, and click Verify. The status updates instantly and the student is notified.' },
        { icon: FileX, title: 'Reject with Reason', desc: 'If a document is invalid or unclear, reject it and type a reason. The student receives the reason on all channels.' },
        { icon: BarChart3, title: 'Track Completion', desc: 'See which students have all documents verified and who still has pending items — so no one slips through at admission.' },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <SectionLabel>How It Works</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        Two Sides of One Seamless System
                    </h2>
                    <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
                        Students upload. Admins review. Everyone is notified. No back-and-forth calls, no paper chasing, no forgotten follow-ups.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Student side */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-sky-600" strokeWidth={1.8} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-neutral-900">Student Experience</div>
                                <div className="text-xs text-neutral-400">Upload, track, and re-submit</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {studentSteps.map((step, i) => (
                                <div key={step.title} className="group flex gap-4 items-start bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-4 transition-all duration-300">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 group-hover:bg-[#d9f972] group-hover:border-transparent flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5">
                                        <step.icon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-neutral-300">0{i + 1}</span>
                                            <h4 className="text-sm font-semibold text-neutral-900">{step.title}</h4>
                                        </div>
                                        <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin side */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-violet-600" strokeWidth={1.8} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-neutral-900">Admin Experience</div>
                                <div className="text-xs text-neutral-400">Review, verify, and track</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {adminSteps.map((step, i) => (
                                <div key={step.title} className="group flex gap-4 items-start bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-4 transition-all duration-300">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 group-hover:bg-[#d9f972] group-hover:border-transparent flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5">
                                        <step.icon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-neutral-300">0{i + 1}</span>
                                            <h4 className="text-sm font-semibold text-neutral-900">{step.title}</h4>
                                        </div>
                                        <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
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

/* ═══════════════════ NOTIFICATION ENGINE ═══════════════════ */

function NotificationEngine() {
    const [active, setActive] = useState<'verified' | 'rejected'>('verified');

    const channels = [
        {
            icon: MessageSquare,
            name: 'WhatsApp',
            color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            iconColor: 'text-emerald-600',
            preview: (s: 'verified' | 'rejected') => s === 'verified'
                ? '✅ Your *Aadhaar Card* has been verified by the administration. No action needed.'
                : '❌ Your *Transfer Certificate* was rejected. Reason: Document blurry. Please re-upload.',
        },
        {
            icon: Mail,
            name: 'Email',
            color: 'bg-sky-50 border-sky-200 text-sky-700',
            iconColor: 'text-sky-600',
            preview: (s: 'verified' | 'rejected') => s === 'verified'
                ? 'Subject: Document Verified ✓ — Your Aadhaar Card submission has been approved.'
                : 'Subject: Action Required — Your Transfer Certificate was rejected. See reason inside.',
        },
        {
            icon: Smartphone,
            name: 'SMS',
            color: 'bg-amber-50 border-amber-200 text-amber-700',
            iconColor: 'text-amber-600',
            preview: (s: 'verified' | 'rejected') => s === 'verified'
                ? 'Shiksha Cloud: Your Aadhaar Card has been VERIFIED. Login to view all documents.'
                : 'Shiksha Cloud: Transfer Certificate REJECTED. Reason: Blurry image. Re-upload required.',
        },
        {
            icon: Bell,
            name: 'Push Notification',
            color: 'bg-violet-50 border-violet-200 text-violet-700',
            iconColor: 'text-violet-600',
            preview: (s: 'verified' | 'rejected') => s === 'verified'
                ? '🔔 Document Verified — Aadhaar Card approved. Tap to view your document status.'
                : '🔔 Action Required — Transfer Certificate rejected. Tap to re-upload.',
        },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: description */}
                    <div className="lg:pt-4">
                        <SectionLabel>Own Notification Engine</SectionLabel>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
                            4 Channels. 1 Action. Instant Delivery.
                        </h2>
                        <p className="text-neutral-500 leading-relaxed mb-8">
                            When an admin verifies or rejects a document, Shiksha Cloud's built-in notification engine fires simultaneously across WhatsApp, Email, SMS, and Push. No third-party tools, no delays, no missed alerts.
                        </p>

                        <div className="flex flex-col gap-4 mb-10">
                            {[
                                { icon: Zap, title: 'Simultaneous Delivery', desc: 'All four channels fire at the same moment — not sequentially. Students know within seconds.' },
                                { icon: FileText, title: 'Contextual Messages', desc: 'Each notification includes the document name, action taken, and the admin\'s reason if rejected.' },
                                { icon: Lock, title: 'No Third-Party Relay', desc: 'Everything runs through Shiksha Clouds own engine.No external SaaS dependency, no data leaks.' },
                                { icon: Hash, title: 'Full Delivery Logs', desc: 'Every notification is logged with timestamp and delivery status — audit-ready for every channel.' },
                            ].map(f => (
                                <div key={f.title} className="flex items-start gap-4">
                                    <div className="w-9 h-9 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0">
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

                    {/* Right: Notification preview */}
                    <div>
                        {/* Toggle */}
                        <div className="flex items-center gap-1.5 bg-[#f8f8f6] border border-neutral-100 rounded-2xl p-1.5 mb-5 w-fit">
                            <button
                                onClick={() => setActive('verified')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active === 'verified' ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Verified
                            </button>
                            <button
                                onClick={() => setActive('rejected')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active === 'rejected' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Rejected
                            </button>
                        </div>

                        {/* Event trigger card */}
                        <div className={`rounded-2xl border p-4 mb-4 flex items-center gap-3 ${active === 'verified' ? 'bg-[#f4fdd4] border-lime-200' : 'bg-red-50 border-red-200'}`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active === 'verified' ? 'bg-white' : 'bg-white'}`}>
                                {active === 'verified'
                                    ? <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" strokeWidth={1.8} />
                                    : <FileX className="w-4.5 h-4.5 text-red-500" strokeWidth={1.8} />
                                }
                            </div>
                            <div>
                                <div className={`text-xs font-bold ${active === 'verified' ? 'text-lime-800' : 'text-red-700'}`}>
                                    {active === 'verified' ? 'Admin clicked "Verify" → Notification engine fires' : 'Admin clicked "Reject" + typed reason → Notification engine fires'}
                                </div>
                                <div className="text-[10px] text-neutral-500 mt-0.5">All 4 channels triggered simultaneously</div>
                            </div>
                        </div>

                        {/* Channel previews */}
                        <div className="flex flex-col gap-3">
                            {channels.map(ch => (
                                <div key={ch.name} className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${ch.color}`}>
                                            <ch.icon className={`w-3.5 h-3.5 ${ch.iconColor}`} strokeWidth={1.8} />
                                        </div>
                                        <span className="text-xs font-bold text-neutral-700">{ch.name}</span>
                                        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Delivered
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed pl-9">{ch.preview(active)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ DOCUMENT TYPES ═══════════════════ */

function DocumentTypes() {
    const docs = [
        'Aadhaar Card',
        'Birth Certificate',
        'Transfer Certificate',
        'Previous Marksheet',
        'Caste Certificate',
        'Income Certificate',
        'Medical Certificate',
        'Passport',
        'Residence Proof',
        'School Leaving Certificate',
        'Sports Certificate',
        'Character Certificate',
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <SectionLabel>Supported Documents</SectionLabel>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
                            Every Document Your School Needs — In One Place
                        </h2>
                        <p className="text-neutral-500 leading-relaxed mb-8">
                            Configure exactly which documents are required for each student category. Add custom document types specific to your institution. Students see a clear checklist — they can't miss what's needed.
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                { icon: FilePlus, title: 'Custom Document Types', desc: 'Add any document type beyond the defaults — sports certificates, affidavits, or institution-specific forms.' },
                                { icon: CheckCircle2, title: 'Required vs Optional', desc: 'Mark some documents as mandatory and others as optional. The system tracks completion accordingly.' },
                                { icon: Download, title: 'Bulk PDF Export', desc: 'Export all verified documents for a student or a whole class in one click for admission records.' },
                            ].map(f => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0">
                                        <f.icon className="w-3.5 h-3.5 text-neutral-700" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900">{f.title}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Document pill cloud */}
                    <div className="bg-[#f8f8f6] rounded-3xl border border-neutral-100 p-8">
                        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-5">Supported document types</div>
                        <div className="flex flex-wrap gap-2">
                            {docs.map((d, i) => {
                                const states = ['verified', 'verified', 'pending', 'verified', 'rejected', 'verified', 'pending', 'verified', 'verified', 'pending', 'verified', 'verified'];
                                const state = states[i];
                                const style = state === 'verified'
                                    ? 'bg-white border-emerald-200 text-emerald-700'
                                    : state === 'pending'
                                        ? 'bg-white border-amber-200 text-amber-700'
                                        : 'bg-white border-red-200 text-red-600';
                                const dot = state === 'verified' ? 'bg-emerald-400' : state === 'pending' ? 'bg-amber-400' : 'bg-red-400';
                                return (
                                    <div key={d} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${style}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                                        {d}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-neutral-200">
                            {[
                                { dot: 'bg-emerald-400', label: 'Verified' },
                                { dot: 'bg-amber-400', label: 'Pending' },
                                { dot: 'bg-red-400', label: 'Rejected' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5 text-xs text-neutral-500">
                                    <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ BEFORE / AFTER ═══════════════════ */

function BeforeAfter() {
    const before = [
        'Students bring physical copies to office',
        'Admin checks manually — hours spent per batch',
        'No notification — students call to follow up',
        'Documents lost or misfiled in physical folders',
        'No audit trail — no proof of submission',
        'Missing docs discovered on admission day',
    ];
    const after = [
        'Students upload from home in minutes',
        'Admins review from dashboard — one click per doc',
        'Instant notifications across 4 channels automatically',
        'All documents stored in encrypted cloud storage',
        'Full tamper-proof audit trail for every document',
        'Completion tracked — zero surprises at admission',
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>Before & After</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        The End of Document Chaos
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3 h-3 text-red-500" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">The Old Way</span>
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-5">Manual Document Collection</h3>
                        <div className="flex flex-col gap-3">
                            {before.map(item => (
                                <div key={item} className="flex items-start gap-3">
                                    <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center mt-0.5 shrink-0">
                                        <span className="text-red-500 text-[9px] font-bold">✕</span>
                                    </div>
                                    <span className="text-sm text-neutral-600">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#f4fdd4] border border-lime-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-5 h-5 rounded-full bg-white border border-lime-400 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-lime-600" strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-semibold text-lime-700 uppercase tracking-wider">With Shiksha Cloud</span>
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-5">Digital Verification System</h3>
                        <div className="flex flex-col gap-3">
                            {after.map(item => (
                                <div key={item} className="flex items-start gap-3">
                                    <div className="w-4 h-4 rounded-full bg-white border border-lime-300 flex items-center justify-center mt-0.5 shrink-0">
                                        <Check className="w-3 h-3 text-lime-600" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-800">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ FEATURES GRID ═══════════════════ */

function FeaturesGrid() {
    const items = [
        { icon: Upload, title: 'Student Self-Upload', desc: 'Students upload directly from their dashboard — PDF, JPG, PNG supported. No office visit required.' },
        { icon: Eye, title: 'Live Status Tracking', desc: 'Every document shows real-time status. Students always know where their submission stands.' },
        { icon: ShieldCheck, title: 'One-Click Verification', desc: 'Admins open, preview, and verify or reject in one click. Built for speed at scale.' },
        { icon: MessageSquare, title: 'WhatsApp Notifications', desc: 'Rich WhatsApp messages with document name, status, and reason — readable without opening an app.' },
        { icon: Mail, title: 'Email Notifications', desc: 'Detailed email with full context — document name, action, and next steps clearly stated.' },
        { icon: Smartphone, title: 'SMS Notifications', desc: 'Plain-text SMS that works on any phone — no internet or app install needed.' },
        { icon: Bell, title: 'Push Notifications', desc: 'In-app push notifications for students on the Shiksha Cloud mobile app.' },
        { icon: Lock, title: 'Encrypted Cloud Storage', desc: 'All documents stored in encrypted cloud storage. Tamper-proof and audit-ready.' },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>All Capabilities</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        Built for Students.<br />Built for Admins.
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map(f => (
                        <div
                            key={f.title}
                            className="group bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-5 hover:bg-white hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
                        >
                            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-4 group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                                <f.icon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{f.title}</h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

function Testimonials() {
    const quotes = [
        {
            result: 'Zero missing docs at admission this year',
            quote: 'We used to discover missing documents on the day of admission — parents scrambling, admin stressed. Now we see weeks in advance who has a gap. It\'s completely different.',
            name: 'Mrs. Kavita Nair', role: 'Admission Head, St. Xavier\'s School, Kochi', students: '1,100',
        },
        {
            result: 'Admin time on docs cut by 70%',
            quote: 'My team used to spend entire mornings going through physical folders. Now they review everything from a dashboard in under an hour. The notification part is the best bit — no follow-up calls.',
            name: 'Suresh Pillai', role: 'Admin Director, Kendriya Vidyalaya, Chennai', students: '980',
        },
        {
            result: 'Students re-upload same day when rejected',
            quote: 'Before, students wouldn\'t know a document was rejected for weeks. Now the WhatsApp message shows the exact reason. They re-upload the same day. The whole cycle is 24 hours, not 3 weeks.',
            name: 'Anita Sharma', role: 'Principal, DPS Dwarka, New Delhi', students: '1,500',
        },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <SectionLabel>Success Stories</SectionLabel>
                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                        Real Results from Real Schools
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {quotes.map((q, i) => (
                        <div key={i} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6 flex flex-col hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-neutral-200 transition-all duration-300">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                            </div>
                            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start mb-4">{q.result}</div>
                            <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">&quot;{q.quote}&quot;</p>
                            <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                                    {q.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-neutral-900">{q.name}</p>
                                    <p className="text-xs text-neutral-400">{q.role} · {q.students} students</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════ MAIN EXPORT ═══════════════════ */

export default function DocumentVerificationLanding() {
    return (
        <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
            <div className="relative z-10">
                <Hero />
                <StatsStrip />
                <Workflow />
                <NotificationEngine />
                <DocumentTypes />
                <BeforeAfter />
                <FeaturesGrid />
                <Testimonials />
            </div>
        </div>
    );
}