'use client';

import { motion } from 'motion/react';
import {
  Users, Clock, CreditCard, Megaphone, UserCheck, Calendar,
  Shield, BarChart3, GraduationCap, Star, Zap, LineChart,
  Bell, BookOpen, FileText, ClipboardCheck, FileBadge, Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════ DATA ═══════════════════ */

const features = [
  {
    icon: Users,
    title: 'Student Management',
    subtitle: 'Complete Student Database',
    description: 'Comprehensive student profiles with enrollment tracking, academic records, and personal information — all in one place.',
    impact: '90% faster access',
    link: '/features/student-management',
    tag: 'Core',
  },
  {
    icon: Clock,
    title: 'Attendance System',
    subtitle: 'Digital Attendance Tracking',
    description: 'Smart attendance marking with real-time tracking and automated parent notifications. Eliminate manual registers.',
    impact: 'Save 2 hrs/day',
    link: '/features/attendance',
    tag: 'Popular',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    subtitle: 'Automated Fee Collection',
    description: 'Streamlined fee collection with payment tracking, automated reminders, and comprehensive financial reporting.',
    impact: '3× faster collection',
    link: '/features/fee-management',
    tag: 'Popular',
  },
  {
    icon: ClipboardCheck,
    title: 'Document Verification',
    subtitle: 'Approval Workflow',
    description: 'Students upload documents, admins verify or reject with instant notifications. Full audit-ready record trail.',
    impact: 'Zero missing docs',
    link: '/features/document-verification',
    tag: null,
  },
  {
    icon: LineChart,
    title: 'Lead Management',
    subtitle: 'Admissions CRM',
    description: 'Track and nurture prospective student leads from inquiry to enrollment. Manage your full admissions pipeline.',
    impact: 'More enrollments',
    link: '/features/lead-management',
    tag: null,
  },
  {
    icon: FileText,
    title: 'Exam Management',
    subtitle: 'Complete Exam Lifecycle',
    description: 'Manage exams from scheduling to results. Generate hall tickets, enroll students, and publish marksheets.',
    impact: '100% automated',
    link: '/features/exam-management',
    tag: null,
  },
  {
    icon: BookOpen,
    title: 'Assignment Management',
    subtitle: 'Homework & Submissions',
    description: 'Create, assign, track, and review homework digitally. Students submit online, teachers review faster.',
    impact: 'Zero paper',
    link: null,
    tag: 'New',
  },
  {
    icon: Megaphone,
    title: 'Notice & Communication',
    subtitle: 'Instant Announcements',
    description: 'Send instant announcements to parents, students, and staff across multiple channels. Everyone stays informed.',
    impact: '100% reach',
    link: null,
    tag: null,
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    subtitle: 'Own Notification Engine',
    description: 'In-house notification engine with SMS, WhatsApp, Email, Push & In-App delivery — pre-built templates included.',
    impact: '100% delivery',
    link: '/features/notification-engine',
    tag: null,
  },
  {
    icon: UserCheck,
    title: 'Parent Portal',
    subtitle: 'Complete Parent Access',
    description: 'Dedicated portal for parents to view attendance, fees, notices, and communicate directly with teachers.',
    impact: '95% satisfaction',
    link: null,
    tag: null,
  },
  {
    icon: Calendar,
    title: 'Holiday & Calendar',
    subtitle: 'Academic Planning',
    description: 'Complete academic calendar management with holiday scheduling, event planning, and automated reminders.',
    impact: 'Zero conflicts',
    link: '/features/holidays',
    tag: null,
  },
  {
    icon: Shield,
    title: 'Anonymous Complaints',
    subtitle: 'Safe Feedback System',
    description: 'Secure anonymous feedback system for addressing sensitive issues while maintaining institutional reputation.',
    impact: '100% confidential',
    link: "/features/anonymous-complaints",
    tag: null,
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    subtitle: 'Data-Driven Insights',
    description: 'Comprehensive analytics on attendance trends, fee collection, student performance, and operational metrics.',
    impact: 'Better decisions',
    link: "/features/ai-reports",
    tag: null,
  },
  {
    icon: GraduationCap,
    title: 'Grade & Section Management',
    subtitle: 'Academic Structure',
    description: 'Organise classes, assign students to sections, and manage academic structure with complete flexibility.',
    impact: 'Perfect order',
    link: null,
    tag: null,
  },
  {
    icon: FileBadge,
    title: 'Certificate Generation',
    subtitle: 'Auto Certificates',
    description: 'Generate bonafide, leaving, and achievement certificates with one click — custom templates included.',
    impact: 'No paperwork',
    link: null,
    tag: null,
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Reports',
    subtitle: 'Smart Insights',
    description: 'AI-generated insights on attendance, fees, and performance trends. Decision support built right in.',
    impact: 'Smarter decisions',
    link: "/features/ai-reports",
    tag: 'AI',
  },
];

/* ═══════════════════ TAG COLORS ═══════════════════ */

const tagStyle: Record<string, string> = {
  Core: 'bg-sky-50 text-sky-600 border-sky-200',
  Popular: 'bg-[#f4fdd4] text-lime-700 border-lime-200',
  New: 'bg-violet-50 text-violet-600 border-violet-200',
  AI: 'bg-amber-50 text-amber-600 border-amber-200',
};

/* ═══════════════════ FEATURE CARD ═══════════════════ */

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;

  const inner = (
    <div className={`group relative bg-white rounded-2xl border border-neutral-100 p-6 h-full flex flex-col hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden ${feature.link ? 'cursor-pointer' : ''}`}>
      {/* Subtle hover tint */}
      <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row: icon + tag */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
            <Icon className="w-4.5 h-4.5 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2">
            {feature.tag && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyle[feature.tag]}`}>
                {feature.tag}
              </span>
            )}
            {feature.link && (
              <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-colors duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-1.5">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900">{feature.title}</h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">{feature.subtitle}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-500 leading-relaxed flex-1 mt-3">
          {feature.description}
        </p>

        {/* Impact pill */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
          <Zap className="w-3 h-3 text-neutral-400" strokeWidth={2} />
          <span className="text-xs font-semibold text-neutral-500">{feature.impact}</span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.07 }}
      viewport={{ once: true }}
      className="h-full"
    >
      {feature.link ? (
        <Link href={feature.link} className="h-full block">{inner}</Link>
      ) : (
        inner
      )}
    </motion.div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function FeaturesList() {
  return (
    <div className="relative overflow-x-hidden">
      {/* bg-[#f8f8f6]  */}

      {/* Background grid */}
      {/* <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" /> */}

      <div className="relative z-10">

        {/* ── Header ── */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col items-center text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-7">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1} />
                <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                  {features.length} Modules · Built for Indian Schools
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl">
                Every Tool Your School Needs, in One Place
              </h1>

              <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                Shiksha Cloud is built around the real workflows of Indian schools —
                not a generic SaaS product with a school skin. Every module solves
                a specific, daily operational problem.
              </p>

              {/* Stats row */}
              {/* <div className="flex flex-wrap justify-center gap-4 mt-10">
                {[
                  { value: "1,200+", label: "Schools" },
                  { value: "8.4L+", label: "Students" },
                  { value: "18", label: "States" },
                  { value: "99.9%", label: "Uptime" },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-neutral-100 rounded-2xl px-6 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
                    <div className="text-xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div> */}
            </motion.div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="pb-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <FeatureCard key={feature.title} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-neutral-900 rounded-3xl px-10 py-14 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
                  <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">Get Started</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4 leading-[1.15]">
                  See All Features Live —<br />Free for 30 Days
                </h2>
                <p className="text-white/50 text-base max-w-lg mx-auto mb-9 leading-relaxed">
                  No credit card. No setup fee. Your school up and running in one day.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/select-organization" className="w-full sm:w-auto bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center">
                    Start Free Trial
                  </Link>
                  <Link href="/contact" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center">
                    Schedule a Demo
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}
