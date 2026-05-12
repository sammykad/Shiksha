'use client';

import {
    ArrowRight, CheckCircle2, Star,
    Bell, Mail, MessageSquare, Smartphone, Monitor, ChevronRight,
    Activity,
} from 'lucide-react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3CD39]" />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">{children}</span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */

function Hero() {
    const channels = [
        { label: 'SMS', icon: Smartphone, color: 'bg-sky-50 text-sky-600 border-sky-200', dot: 'bg-sky-400', count: '342' },
        { label: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400', count: '318' },
        { label: 'Email', icon: Mail, color: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-400', count: '301' },
        { label: 'Push', icon: Bell, color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400', count: '289' },
        { label: 'In-App', icon: Monitor, color: 'bg-[#f4fdd4] text-lime-700 border-lime-200', dot: 'bg-[#A3E635]', count: '342' },
    ];

    const events = [
        { event: 'Fee reminder sent', channel: 'WhatsApp', time: '2s ago', status: 'delivered', dot: 'bg-emerald-400' },
        { event: 'Attendance alert — Class 8A', channel: 'SMS', time: '5s ago', status: 'delivered', dot: 'bg-sky-400' },
        { event: 'Exam schedule published', channel: 'Email', time: '12s ago', status: 'delivered', dot: 'bg-violet-400' },
        { event: 'Holiday notice — Diwali', channel: 'Push', time: '18s ago', status: 'queued', dot: 'bg-amber-400' },
    ];

    return (
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}
                    <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-7">
                            <a href="/features" className="hover:text-neutral-700 transition-colors">Features</a>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-neutral-700 font-medium">Notification Engine</span>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-700">Own engine — no third-party relay</span>
                        </div>

                        <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
                            School Notification System — 5 Channels,
                            <span style={{ color: '#7CBF00' }}> One Engine.</span>
                        </h1>

                        <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
                            Shiksha Cloud runs its own notification engine — not a wrapper around a third-party service. SMS, WhatsApp, Email, Push, and In-App, each with its own dedicated worker, queue, rate limiter, and retry logic.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
                            {[
                                { value: '5', label: 'Dedicated channel workers' },
                                { value: '95%+', label: 'Message delivery rate' },
                                { value: '<1s', label: 'Avg. notification latency' },
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
                            {['FanOut architecture', 'Safe retry on failure', 'Type-safe templates'].map(t => (
                                <div key={t} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3CD39]" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="relative">
                        <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3CD39] to-emerald-600 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-neutral-900">Live Notifications</div>
                                        <div className="text-xs text-neutral-500">Real-time delivery tracking</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </div>
                            </div>

                            {/* Channels */}
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {channels.map((ch) => (
                                    <div key={ch.label} className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${ch.color}`}>
                                        <ch.icon className="w-4 h-4" />
                                        <span className="text-[10px] font-medium">{ch.label}</span>
                                        <span className="text-[10px] opacity-60">{ch.count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Events */}
                            <div className="space-y-3">
                                {events.map((e, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                                        <span className={`w-2 h-2 rounded-full ${e.dot}`} />
                                        <div className="flex-1 text-xs">
                                            <div className="font-medium text-neutral-900">{e.event}</div>
                                            <div className="text-neutral-500">{e.channel} • {e.time}</div>
                                        </div>
                                        <span className="text-[10px] text-neutral-400 capitalize">{e.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

export default function NotificationEngineLanding() {
    return (
        <div className="min-h-screen bg-white">
            <Hero />

            {/* Testimonials */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A3CD39]" />
                            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Trusted by Schools</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                            No Parent Left in the Dark
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "98% of parents now read our messages within 10 minutes. SMS never achieved this.",
                                name: "Dr. Rajesh Kumar",
                                role: "Principal, Mumbai International School",
                            },
                            {
                                quote: "Emergency alerts went out in under 30 seconds. Parents called to thank us.",
                                name: "Anjali Verma",
                                role: "Admin Head, DPS Hyderabad",
                            },
                            {
                                quote: "Five channels, one dashboard. We finally know which message reached whom.",
                                name: "Suresh Reddy",
                                role: "IT Coordinator, Bangalore Academy",
                            },
                        ].map(t => (
                            <div key={t.name} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                                    ))}
                                </div>
                                <p className="text-sm text-neutral-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <p className="text-xs font-semibold text-neutral-900">{t.name}</p>
                                    <p className="text-[10px] text-neutral-400">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
