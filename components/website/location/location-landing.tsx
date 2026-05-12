'use client';

import { motion } from 'motion/react';
import {
    MapPin, Star, Zap, CheckCircle2, ArrowUpRight,
    Users, Clock, CreditCard, BarChart3, Shield,
    Smartphone, Cloud, Phone,
    GraduationCap, TrendingUp, Sparkles, MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════ TYPES ═══════════════════ */

interface LocationPageClientProps {
    locationName: string;
    areaServed: string;
    landmarks: string[];
}

/* ═══════════════════ DATA ═══════════════════ */

const stats = [
    { value: '500+', label: 'Schools Trust Us' },
    { value: '8.4L+', label: 'Students Managed' },
    { value: '₹79', label: 'Per Student/Month' },
    { value: '99.9%', label: 'Uptime SLA' },
];

const features = [
    {
        icon: Users,
        title: 'Student Management',
        subtitle: 'Complete Student Database',
        description: 'Comprehensive student profiles with enrollment tracking, academic records, and personal information — all in one place.',
        impact: '90% faster access',
        tag: 'Core',
    },
    {
        icon: Clock,
        title: 'Attendance System',
        subtitle: 'Digital Attendance Tracking',
        description: 'Smart attendance marking with real-time tracking and automated parent notifications. Eliminate manual registers.',
        impact: 'Save 2 hrs/day',
        tag: 'Popular',
    },
    {
        icon: CreditCard,
        title: 'Fee Management',
        subtitle: 'Automated Fee Collection',
        description: 'Streamlined fee collection with payment tracking, automated reminders, and comprehensive financial reporting.',
        impact: '3× faster collection',
        tag: 'Popular',
    },
    {
        icon: MessageSquare,
        title: 'Parent Communication',
        subtitle: 'Multi-Channel Messaging',
        description: 'Send instant announcements via SMS, WhatsApp, Email, and push notifications. Parents always stay informed.',
        impact: '100% reach',
        tag: null,
    },
    {
        icon: BarChart3,
        title: 'Analytics & Reports',
        subtitle: 'Data-Driven Insights',
        description: 'Comprehensive analytics on attendance trends, fee collection, student performance, and operational metrics.',
        impact: 'Better decisions',
        tag: null,
    },
    {
        icon: Sparkles,
        title: 'AI-Powered Reports',
        subtitle: 'Smart Insights',
        description: 'AI-generated insights on attendance, fees, and performance trends. Decision support built right in.',
        impact: 'Smarter decisions',
        tag: 'AI',
    },
];

const benefits = [
    'No setup fees or hidden charges',
    'Free data migration from existing software',
    'Onboarding & training included',
    'CBSE, ICSE & State Board compliant',
    'Android & iOS mobile apps',
    'Dedicated customer support',
];

const tagStyle: Record<string, string> = {
    Core: 'bg-sky-50 text-sky-600 border-sky-200',
    Popular: 'bg-[#f4fdd4] text-lime-700 border-lime-200',
    New: 'bg-violet-50 text-violet-600 border-violet-200',
    AI: 'bg-amber-50 text-amber-600 border-amber-200',
};

/* ═══════════════════ FEATURE CARD ═══════════════════ */

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
    const Icon = feature.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
            viewport={{ once: true }}
            className="h-full"
        >
            <div className="group relative bg-white rounded-2xl border border-neutral-100 p-6 h-full flex flex-col hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                        <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                            <Icon className="w-4.5 h-4.5 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                        </div>
                        {feature.tag && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyle[feature.tag]}`}>
                                {feature.tag}
                            </span>
                        )}
                    </div>

                    <div className="mb-1.5">
                        <h3 className="text-base font-semibold tracking-tight text-neutral-900">{feature.title}</h3>
                        <p className="text-xs text-neutral-400 mt-0.5 font-medium">{feature.subtitle}</p>
                    </div>

                    <p className="text-sm text-neutral-500 leading-relaxed flex-1 mt-3">
                        {feature.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-neutral-400" strokeWidth={2} />
                        <span className="text-xs font-semibold text-neutral-500">{feature.impact}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════ STAT CARD ═══════════════════ */

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
            className="bg-white border border-neutral-100 rounded-2xl px-6 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center"
        >
            <div className="text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
            <div className="text-xs text-neutral-400 mt-0.5 font-medium">{label}</div>
        </motion.div>
    );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function LocationLanding({ locationName, areaServed, landmarks }: LocationPageClientProps) {
    return (
        <div className="relative overflow-x-hidden bg-[#f8f8f6] min-h-screen">

            {/* ── Hero ── */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Location badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.45 }}
                            className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-7"
                        >
                            <MapPin className="w-3.5 h-3.5 text-[#7fb800]" strokeWidth={2} />
                            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                                Now serving {locationName} & surrounding areas
                            </span>
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl">
                            School Management Software in{' '}
                            <span className="relative inline-block">
                                {locationName}
                                <motion.span
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                                    style={{ originX: 0 }}
                                    className="absolute bottom-1 left-0 right-0 h-3 bg-[#d9f972] -z-10 block"
                                />
                            </span>
                        </h1>

                        <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                            Trusted by 500+ schools across India — Shiksha Cloud automates attendance,
                            fees, communication & administration, so you can focus on education.
                        </p>

                        {/* CTA row */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-9">
                            <Link
                                href="/select-organization"
                                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="tel:+918459324821"
                                className="w-full sm:w-auto bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                                +91-8459324821
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap justify-center gap-3 mt-12">
                            {stats.map((s, i) => (
                                <StatCard key={s.label} {...s} index={i} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Location Context Strip ── */}
            <section className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-white border border-neutral-100 rounded-2xl px-8 py-6 flex flex-col md:flex-row md:items-center gap-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-[#7fb800]" strokeWidth={2} />
                                <span className="text-sm font-semibold text-neutral-700">Coverage in {locationName}</span>
                            </div>
                            <p className="text-sm text-neutral-500">{areaServed}</p>
                        </div>
                        {landmarks.length > 0 && (
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2.5">Nearby Institutions</p>
                                <div className="flex flex-wrap gap-2">
                                    {landmarks.map((lm) => (
                                        <span key={lm} className="text-xs bg-[#f4fdd4] text-lime-700 border border-lime-200 px-2.5 py-1 rounded-full font-medium">
                                            {lm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ── Features Grid ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1} />
                            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                                16 Modules · Built for Indian Schools
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] max-w-2xl mx-auto">
                            Everything Your {locationName} School Needs
                        </h2>
                        <p className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
                            Not a generic SaaS with a school skin — every module solves a real,
                            daily operational problem Indian schools face.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, i) => (
                            <FeatureCard key={feature.title} feature={feature} index={i} />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center mt-8"
                    >
                        <Link
                            href="/features"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors group"
                        >
                            View all 16 modules
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── Why Shiksha Cloud ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left: content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
                                <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Why Us</span>
                            </div>
                            <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-5">
                                Why {locationName} Schools Choose Shiksha Cloud
                            </h2>
                            <p className="text-base text-neutral-500 leading-relaxed mb-8">
                                We understand the unique challenges schools in {locationName} face —
                                from managing large student populations to communicating with parents
                                across language barriers. Shiksha Cloud is built for this reality.
                            </p>
                            <ul className="space-y-3">
                                {benefits.map((b, i) => (
                                    <motion.li
                                        key={b}
                                        initial={{ opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.07 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm text-neutral-700 font-medium">{b}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Right: pricing card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Starting from</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold tracking-tight text-neutral-900">₹79</span>
                                            <span className="text-sm text-neutral-400 font-medium">/student/month</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#d9f972] rounded-xl px-3 py-1.5">
                                        <span className="text-xs font-bold text-neutral-800">No Setup Fee</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {[
                                        { icon: Cloud, text: 'Fully cloud-hosted — no servers needed' },
                                        { icon: Smartphone, text: 'Android & iOS apps included' },
                                        { icon: Shield, text: 'Enterprise-grade data security' },
                                        { icon: TrendingUp, text: 'Scales from 100 to 10,000+ students' },
                                        { icon: GraduationCap, text: 'CBSE, ICSE & State Board ready' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.8} />
                                            </div>
                                            <span className="text-sm text-neutral-600">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href="/select-organization"
                                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3.5 px-6 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        Book Free Demo in {locationName}
                                        <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium py-3.5 px-6 rounded-full text-sm transition-colors flex items-center justify-center"
                                    >
                                        View Full Pricing
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-3 text-base text-neutral-500">
                            Common questions from schools in {locationName}
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {[
                            {
                                q: `What is the best school management software in ${locationName}?`,
                                a: `Shiksha Cloud is the leading school management software in ${locationName}, trusted by 500+ schools. Our cloud-based ERP offers student management, fee collection, attendance tracking, and parent communication — all in one platform starting at just ₹79/student/month.`,
                            },
                            {
                                q: 'Is Shiksha Cloud suitable for CBSE/ICSE schools?',
                                a: 'Yes! Shiksha Cloud is fully compliant with CBSE, ICSE, and all State Board requirements. Our platform supports various curriculum structures, grading systems, and reporting formats used across Indian schools.',
                            },
                            {
                                q: 'Can I migrate from my existing school software?',
                                a: 'Absolutely! We provide free data migration from your existing system. Our team handles the entire process — student data, fee records, attendance history — ensuring zero disruption to your school operations.',
                            },
                            {
                                q: 'Is there a mobile app for parents and teachers?',
                                a: 'Yes! Shiksha Cloud includes mobile apps for both Android and iOS. Parents receive real-time notifications about attendance, fees, and announcements. Teachers can mark attendance, upload assignments, and communicate with parents on the go.',
                            },
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                className="bg-white border border-neutral-100 rounded-2xl p-6 hover:border-neutral-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-300"
                            >
                                <p className="text-sm font-semibold text-neutral-900 mb-2">{faq.q}</p>
                                <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 pt-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-neutral-900 rounded-3xl px-10 py-14 text-center relative overflow-hidden"
                    >
                        {/* Grid texture */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-7">
                                <MapPin className="w-3 h-3 text-[#d9f972]" strokeWidth={2} />
                                <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">
                                    {locationName}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4 leading-[1.15]">
                                Ready to Transform Your {locationName} School?
                            </h2>
                            <p className="text-white/50 text-base max-w-lg mx-auto mb-9 leading-relaxed">
                                No credit card. No setup fee. Your school up and running in one day.
                                Join 500+ schools already using Shiksha Cloud.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/select-organization"
                                    className="w-full sm:w-auto bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
                                >
                                    Start Free Trial
                                </Link>
                                <Link
                                    href="tel:+918459324821"
                                    className="w-full sm:w-auto bg-transparent hover:bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                                    Call +91-8459324821
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}