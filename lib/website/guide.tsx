'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, ArrowRight, Check, CheckCircle2,
  Users, Calendar, CreditCard, MessageSquare, FileText, BarChart3,
  Shield, Zap, Clock, TrendingUp,
  ChevronDown, Star,
  BookOpen, Hash, Layers, Brain, Smartphone, Mail,
  RefreshCw, Play,
} from 'lucide-react';

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
  const modules = [
    { icon: Users, label: 'Students', color: 'bg-sky-50 text-sky-600' },
    { icon: Calendar, label: 'Attendance', color: 'bg-[#f4fdd4] text-lime-700' },
    { icon: CreditCard, label: 'Fees', color: 'bg-violet-50 text-violet-600' },
    { icon: BookOpen, label: 'Exams', color: 'bg-amber-50 text-amber-600' },
    { icon: MessageSquare, label: 'Comms', color: 'bg-rose-50 text-rose-500' },
    { icon: FileText, label: 'Documents', color: 'bg-emerald-50 text-emerald-600' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-neutral-100 text-neutral-600' },
    { icon: Brain, label: 'FeeSense AI', color: 'bg-orange-50 text-orange-500' },
  ];

  return (
    <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-lime-50 border border-lime-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              <span className="text-xs font-semibold text-lime-700">The Complete School Management Guide</span>
            </div>

            <h1 className="text-5xl md:text-[3.6rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              The Smarter Way to Run Your Institution.
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              How Shiksha Cloud is automating administrative tasks, eliminating paperwork, and giving Indian schools more time to focus on education — not operations.
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
              {[
                { value: '70%', label: 'Less admin work' },
                { value: '24h', label: 'To go live' },
                { value: '₹79', label: '/student/month — all in' },
              ].map((s, i) => (
                <div key={s.label} className={`${i > 0 ? 'pl-6 border-l border-neutral-200' : ''}`}>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/select-organization" className="flex items-center justify-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400">
              {['No credit card', 'Live in 24 hours', 'Indian schools only'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Platform overview mock */}
          <div className="relative">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-[#f8f8f6]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 ml-1">Shiksha Cloud — Admin</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { label: 'Students', value: '482', bg: 'bg-[#f4fdd4]' },
                    { label: 'Teachers', value: '34', bg: 'bg-sky-50' },
                    { label: 'Fees Due', value: '₹1.2L', bg: 'bg-amber-50' },
                    { label: 'Today Abs', value: '7', bg: 'bg-rose-50' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-neutral-100`}>
                      <div className="text-base font-bold tracking-tight text-neutral-900">{s.value}</div>
                      <div className="text-[9px] mt-0.5 text-neutral-500 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Module grid */}
                <div className="grid grid-cols-4 gap-2">
                  {modules.map(m => (
                    <div key={m.label} className={`${m.color} rounded-xl p-3 border border-neutral-100 flex flex-col items-center gap-1.5 cursor-pointer hover:shadow-sm transition-shadow`}>
                      <m.icon className="w-4 h-4" strokeWidth={1.8} />
                      <span className="text-[9px] font-semibold text-center leading-tight">{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-4">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Recent Activity</div>
                  {[
                    { text: 'Fee collected from Aarav Sharma · ₹4,500', time: '2m ago', dot: 'bg-emerald-400' },
                    { text: 'Attendance marked — Class 10A · 38/40 present', time: '8m ago', dot: 'bg-sky-400' },
                    { text: 'Document verified — Priya P. · Aadhaar Card', time: '15m ago', dot: 'bg-lime-400' },
                  ].map((a, i) => (
                    <div key={i} className={`flex items-start gap-2.5 py-2 ${i < 2 ? 'border-b border-neutral-100' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.dot} mt-1.5 shrink-0`} />
                      <div className="flex-1">
                        <span className="text-[10px] text-neutral-700">{a.text}</span>
                        <span className="text-[9px] text-neutral-400 ml-1.5">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f4fdd4] flex items-center justify-center">
                <Zap className="w-5 h-5 text-lime-700" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-neutral-900">47+ Features</p>
                <p className="text-[10px] text-neutral-400">All live in production</p>
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
          { value: '70%', label: 'Reduction in admin work' },
          { value: '40–60%', label: 'Better fee collection rate' },
          { value: '95%+', label: 'Message delivery rate' },
          { value: '24 hrs', label: 'To go fully live' },
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

/* ═══════════════════ THE PROBLEM ═══════════════════ */

function TheProblem() {
  const problems = [
    { icon: '📋', title: 'Administrative Overload', desc: 'Hours spent on paper registers, manual attendance, and fee follow-ups that should take minutes.' },
    { icon: '📞', title: 'Communication Gaps', desc: 'Critical notices lost, parents miss reminders, emergency announcements reach people too late.' },
    { icon: '📊', title: 'Scattered Data', desc: 'Student records spread across notebooks, Excel sheets, and registers — impossible to search.' },
    { icon: '💰', title: 'Fee Collection Chaos', desc: 'Manual receipt books, cash handling, reconciliation nightmares, and endless follow-up calls.' },
    { icon: '👁️', title: 'Zero Transparency', desc: 'Parents have no visibility into attendance, grades, or fee status without calling the office.' },
    { icon: '📈', title: 'Can\'t Scale', desc: 'What works for 200 students collapses at 500. Manual systems don\'t grow with your school.' },
  ];

  const costs = [
    { task: 'Attendance compilation', time: '3–4 hrs daily', cost: '₹8,000/mo' },
    { task: 'Fee tracking', time: '5–6 hrs weekly', cost: '₹4,000/mo' },
    { task: 'Parent queries', time: '2–3 hrs daily', cost: '₹6,000/mo' },
    { task: 'Document management', time: 'Hours per batch', cost: '₹2,000/mo' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <SectionLabel>The Challenge</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-5">
            If You Run a School in India, You Know These Problems
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            These aren&apos;t edge cases. They&apos;re the daily reality for thousands of school administrators — and they all have a common root: manual, disconnected systems that were never designed to scale.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {problems.map(p => (
            <div key={p.title} className="group bg-white rounded-2xl border border-neutral-100 p-5 hover:border-red-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{p.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Cost analysis */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-5">The Real Cost of Manual Management</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {costs.map(c => (
              <div key={c.task} className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <div className="text-xs text-neutral-500 mb-1.5">{c.task}</div>
                <div className="text-sm font-bold text-red-600 mb-1">{c.time}</div>
                <div className="text-xs font-semibold text-neutral-700">{c.cost}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#f8f8f6] border border-neutral-200 rounded-xl p-4 text-center">
            <span className="text-sm font-bold text-neutral-900">Total admin overhead: ₹15,000–20,000/month</span>
            <span className="text-xs text-neutral-400 block mt-1">Most of which can be eliminated in 24 hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ WHAT IS SHIKSHA CLOUD ═══════════════════ */

function WhatIsThis() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>The Solution</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              One Platform.<br />Every Role.<br />Zero Paperwork.
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              Shiksha Cloud is a cloud-based school management system built specifically for Indian educational institutions. It connects students, parents, teachers, and admins on a single platform — eliminating manual work and bringing transparency to every part of your school.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: Shield, title: 'Built for Indian Schools', desc: 'Indian fee structures, academic calendars, CBSE/ICSE grading, and regional language support — not a foreign system adapted for India.' },
                { icon: Zap, title: '47+ Live, Production Features', desc: 'Every module listed is active and used by schools today. No beta features, no vaporware.' },
                { icon: Clock, title: 'Live in 24 Hours', desc: 'Basic setup takes 1–2 hours. Bulk student import takes minutes. Most schools are fully operational the next day.' },
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

          {/* Role portals */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'Admin', initials: 'AD', desc: 'Full control — students, fees, exams, staff, analytics', color: 'bg-violet-50 border-violet-200', badge: 'text-violet-600 bg-violet-100' },
              { role: 'Teacher', initials: 'TC', desc: 'Attendance, results, documents, leave, class management', color: 'bg-sky-50 border-sky-200', badge: 'text-sky-600 bg-sky-100' },
              { role: 'Student', initials: 'ST', desc: 'Dashboard, fees, exams, hall tickets, results, documents', color: 'bg-[#f4fdd4] border-lime-200', badge: 'text-lime-700 bg-lime-100' },
              { role: 'Parent', initials: 'PR', desc: 'Attendance monitoring, fee payments, notifications, children dashboard', color: 'bg-amber-50 border-amber-200', badge: 'text-amber-600 bg-amber-100' },
            ].map(r => (
              <div key={r.role} className={`rounded-2xl border p-5 ${r.color} hover:shadow-md transition-shadow`}>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.badge} self-start inline-block mb-3`}>
                  {r.role}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ FEATURES TABS ═══════════════════ */

type FeatureTab = 'students' | 'attendance' | 'fees' | 'communication';

function FeaturesSection() {
  const [tab, setTab] = useState<FeatureTab>('students');

  const tabs: { id: FeatureTab; label: string; icon: React.ElementType }[] = [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
  ];

  const content: Record<FeatureTab, {
    headline: string;
    sub: string;
    points: string[];
    stat: { value: string; label: string };
    visual: React.ReactNode;
  }> = {
    students: {
      headline: 'Complete Student Management',
      sub: 'Digital profiles, document verification, academic history, and bulk import — all in one place.',
      points: ['Bulk CSV import — entire batches in minutes', 'Digital document upload & admin verification', 'Profile self-updates by students and parents', 'Advanced search, filter, and segment', 'Full audit trail for every change'],
      stat: { value: '2 days → 2 hrs', label: 'Enrollment processing time' },
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <div className="text-xs font-semibold text-neutral-900 mb-3">Student Records</div>
          {[
            { name: 'Aarav Sharma', class: '10A', docs: 'All verified', status: 'Active' },
            { name: 'Priya Patel', class: '9B', docs: '1 pending', status: 'Active' },
            { name: 'Rohit Verma', class: '10A', docs: 'All verified', status: 'Active' },
          ].map((s, i) => (
            <div key={s.name} className={`flex items-center gap-3 py-2.5 ${i < 2 ? 'border-b border-neutral-100' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                {s.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-neutral-900">{s.name}</div>
                <div className="text-[10px] text-neutral-400">Class {s.class}</div>
              </div>
              <div className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${s.docs === 'All verified' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                {s.docs}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    attendance: {
      headline: 'Smart Attendance Tracking',
      sub: 'One-click marking, real-time parent alerts, section summaries, and trend analysis.',
      points: ['Mark attendance in 1–2 minutes per class', 'Instant WhatsApp/SMS/Email alerts to parents', 'Daily section summaries for administrators', 'Monthly & weekly downloadable reports', 'School-wide trend analysis for early intervention'],
      stat: { value: '95%+', label: 'Reduction in compilation time' },
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-neutral-900">Class 10A — Today</div>
            <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full font-medium">38/40 present</span>
          </div>
          {[
            { name: 'Aarav Sharma', status: 'P' },
            { name: 'Priya Patel', status: 'A' },
            { name: 'Rohit Verma', status: 'P' },
            { name: 'Anjali K.', status: 'L' },
          ].map((s, i) => (
            <div key={s.name} className={`flex items-center justify-between py-2 ${i < 3 ? 'border-b border-neutral-50' : ''}`}>
              <span className="text-xs text-neutral-700">{s.name}</span>
              <div className="flex gap-1.5">
                {['P', 'A', 'L'].map(st => (
                  <button key={st} className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-colors ${s.status === st
                    ? st === 'P' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : st === 'A' ? 'bg-red-100 text-red-600 border border-red-300'
                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-neutral-100 text-neutral-400 border border-transparent'}`}>{st}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    fees: {
      headline: 'Complete Fee Management',
      sub: 'Online payments, automated reminders, instant receipts, and AI-powered collection agent.',
      points: ['UPI, cards, net banking, digital wallets', 'Auto-generated receipts via WhatsApp, SMS, Email', 'Automated reminders before due dates', 'Installment plans and late fee automation', 'FeeSense AI — identifies at-risk families'],
      stat: { value: '40–60%', label: 'Better on-time fee collection' },
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-semibold text-neutral-900">Fee Collection — Nov 2024</div>
            <span className="text-[10px] text-lime-700 bg-[#f4fdd4] border border-lime-200 px-2 py-0.5 rounded-full">₹8.4L of ₹12L</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full">
            <div className="h-2 rounded-full bg-[#A3E635]" style={{ width: '70%' }} />
          </div>
          <div className="text-[10px] text-neutral-500 mb-2">70% collected · ₹3.6L pending</div>
          {[
            { name: 'Aarav Sharma', amount: '₹4,500', status: 'Paid', sc: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { name: 'Priya Patel', amount: '₹4,500', status: 'Due', sc: 'text-amber-600 bg-amber-50 border-amber-200' },
            { name: 'Rohit Verma', amount: '₹4,500', status: 'Overdue', sc: 'text-red-600 bg-red-50 border-red-200' },
          ].map((r, i) => (
            <div key={r.name} className={`flex items-center gap-3 py-2 ${i < 2 ? 'border-b border-neutral-50' : ''}`}>
              <span className="flex-1 text-xs text-neutral-700">{r.name}</span>
              <span className="text-xs font-semibold text-neutral-900">{r.amount}</span>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${r.sc}`}>{r.status}</span>
            </div>
          ))}
        </div>
      ),
    },
    communication: {
      headline: 'Multi-Channel Communication',
      sub: 'Reach every parent every time — SMS, WhatsApp, Email, and Push from one engine.',
      points: ['School-wide, grade-specific, and individual messages', 'Emergency alerts with priority routing', 'Scheduled announcements and event reminders', 'Fee confirmation and attendance alerts', '95%+ delivery rate vs 40–50% traditional methods'],
      stat: { value: '95%+', label: 'Message delivery rate' },
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-2.5">
          <div className="text-xs font-semibold text-neutral-900 mb-3">Notification sent to 482 parents</div>
          {[
            { channel: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', delivered: 460, total: 482 },
            { channel: 'SMS', icon: Smartphone, color: 'bg-sky-50 text-sky-600 border-sky-200', delivered: 471, total: 482 },
            { channel: 'Email', icon: Mail, color: 'bg-amber-50 text-amber-600 border-amber-200', delivered: 447, total: 482 },
          ].map(c => (
            <div key={c.channel} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${c.color}`}>
                    <c.icon className="w-2.5 h-2.5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-700">{c.channel}</span>
                </div>
                <span className="text-[10px] text-neutral-500">{c.delivered}/{c.total}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full">
                <div className="h-1.5 rounded-full bg-[#A3E635]" style={{ width: `${(c.delivered / c.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
  };

  const active = content[tab];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Core Features</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Features That Solve Real Problems
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            Not demos. Not mockups. Every feature below is live and used by schools every day.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-100 rounded-2xl p-1.5 shadow-sm">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-3">{active.headline}</h3>
            <p className="text-neutral-500 leading-relaxed mb-8">{active.sub}</p>
            <div className="flex flex-col gap-3 mb-8">
              {active.points.map(p => (
                <div key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-neutral-700">{p}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#f4fdd4] border border-lime-200 rounded-2xl p-5 inline-block">
              <div className="text-2xl font-bold tracking-tight text-neutral-900">{active.stat.value}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{active.stat.label}</div>
            </div>
          </div>
          <div>{active.visual}</div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ ALL MODULES ═══════════════════ */

function AllModules() {
  const modules = [
    { icon: Users, title: 'Student Management', desc: 'Complete digital profiles, bulk import, document upload, academic history.' },
    { icon: Calendar, title: 'Attendance Tracking', desc: 'One-click marking, instant parent alerts, section summaries, monthly reports.' },
    { icon: CreditCard, title: 'Fee Management', desc: 'Online payments, automated reminders, instant receipts, installment plans.' },
    { icon: BookOpen, title: 'Exam Management', desc: 'Sessions, scheduling, hall tickets with QR codes, marks entry, report cards.' },
    { icon: MessageSquare, title: 'Communication Hub', desc: 'SMS, WhatsApp, Email, Push — all from one built-in notification engine.' },
    { icon: FileText, title: 'Document Verification', desc: 'Student upload → admin verify/reject → instant 4-channel notification.' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'AI-generated insights, attendance trends, fee collection dashboards.' },
    { icon: Brain, title: 'FeeSense AI Agent', desc: 'Identifies at-risk families, personalises multi-channel payment reminders.' },
    { icon: Shield, title: 'Anonymous Complaints', desc: 'Secure submission, unique tracking ID, POCSO-compliant resolution workflow.' },
    { icon: TrendingUp, title: 'Lead & Admission CRM', desc: 'Capture leads from ads, score 0–100, manage full admission pipeline.' },
    { icon: Hash, title: 'Academic Structure', desc: 'Grades, sections, subjects, academic years, holidays, and school calendar.' },
    { icon: Layers, title: 'Leave Management', desc: 'Student and teacher leave applications with admin approval workflow.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>All Modules</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            47+ Features Across 12 Modules
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            Every module below is live in production. Not planned, not beta — used by schools today.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(m => (
            <div key={m.title} className="group bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-5 hover:bg-white hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-4 group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                <m.icon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{m.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ STAKEHOLDER VIEWS ═══════════════════ */

type Role = 'admin' | 'teacher' | 'student' | 'parent';

function StakeholderViews() {
  const [role, setRole] = useState<Role>('admin');

  const roles: Record<Role, { label: string; color: string; capabilities: string[]; icon: React.ElementType }> = {
    admin: {
      label: 'Admin',
      icon: Shield,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      capabilities: [
        'Full institutional configuration & setup',
        'Student & teacher management, bulk imports',
        'Fee setup, collection tracking & analytics',
        'Exam lifecycle — create, manage, publish results',
        'Lead/CRM pipeline for admissions',
        'Complaint management & resolution',
        'Notification settings & delivery logs',
        'Academic year, grading, and calendar control',
      ],
    },
    teacher: {
      label: 'Teacher',
      icon: BookOpen,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      capabilities: [
        'Class management & student lists per section',
        'One-click digital attendance marking',
        'Section attendance summaries & trend views',
        'Document verification with approval/rejection',
        'Notice publishing for classes and school',
        'Exam creation, marks entry, result publishing',
        'Leave applications with admin tracking',
        'Teaching profile with qualifications & subjects',
      ],
    },
    student: {
      label: 'Student',
      icon: GraduationCap,
      color: 'text-lime-700 bg-[#f4fdd4] border-lime-200',
      capabilities: [
        'Personal dashboard — attendance, fees, exams',
        'Attendance history with downloadable reports',
        'Online fee payments with instant receipts',
        'Exam enrollment & hall ticket download',
        'Published results, CGPA, and report cards',
        'Document upload & verification status tracking',
        'Leave applications with status timeline',
        'Notice board & anonymous complaint submission',
      ],
    },
    parent: {
      label: 'Parent',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      capabilities: [
        'Real-time child attendance monitoring',
        'Online fee payments 24/7 from any device',
        'Download fee receipts anytime',
        'Instant alerts — absence, fees, notices',
        'Multiple children from one parent account',
        'Exam schedules and result access',
        'Anonymous complaint submission channel',
        'Complete school notice board access',
      ],
    },
  };

  const active = roles[role];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Role-Based Views</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            The Right Tools for Every Role
          </h2>
        </div>

        {/* Role toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-100 rounded-2xl p-1.5 shadow-sm">
            {(['admin', 'teacher', 'student', 'parent'] as Role[]).map(r => {
              const Icon = roles[r].icon;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${role === r ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-6 ${active.color}`}>
              <active.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
              {active.label} Capabilities
            </div>
            <div className="flex flex-col gap-3">
              {active.capabilities.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-neutral-700">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats for the role */}
          <div className="grid grid-cols-2 gap-3">
            {role === 'admin' && [
              { v: '47+', l: 'Features available', bg: 'bg-[#f4fdd4]' },
              { v: '24 hrs', l: 'To full live setup', bg: 'bg-violet-50' },
              { v: '100%', l: 'Audit trail coverage', bg: 'bg-sky-50' },
              { v: '0', l: 'Extra cost for teacher accounts', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.l} className={`${s.bg} rounded-2xl border border-neutral-100 p-5`}>
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.v}</div>
                <div className="text-xs text-neutral-500 mt-1 leading-snug">{s.l}</div>
              </div>
            ))}
            {role === 'teacher' && [
              { v: '2 min', l: 'Attendance per class', bg: 'bg-sky-50' },
              { v: '95%+', l: 'Time saved on compilation', bg: 'bg-[#f4fdd4]' },
              { v: '0', l: 'Cost for teacher accounts', bg: 'bg-violet-50' },
              { v: '1-click', l: 'Document verification', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.l} className={`${s.bg} rounded-2xl border border-neutral-100 p-5`}>
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.v}</div>
                <div className="text-xs text-neutral-500 mt-1 leading-snug">{s.l}</div>
              </div>
            ))}
            {role === 'student' && [
              { v: '24/7', l: 'Fee payment access', bg: 'bg-[#f4fdd4]' },
              { v: '4 chan', l: 'Notification channels', bg: 'bg-sky-50' },
              { v: 'PDF', l: 'Hall tickets & report cards', bg: 'bg-amber-50' },
              { v: '100%', l: 'Anonymous complaint privacy', bg: 'bg-violet-50' },
            ].map(s => (
              <div key={s.l} className={`${s.bg} rounded-2xl border border-neutral-100 p-5`}>
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.v}</div>
                <div className="text-xs text-neutral-500 mt-1 leading-snug">{s.l}</div>
              </div>
            ))}
            {role === 'parent' && [
              { v: '< 1min', l: 'Alert on child absence', bg: 'bg-amber-50' },
              { v: '24/7', l: 'Online fee payment', bg: 'bg-[#f4fdd4]' },
              { v: 'Free', l: 'Parent account cost', bg: 'bg-sky-50' },
              { v: 'Multi', l: 'Children per account', bg: 'bg-violet-50' },
            ].map(s => (
              <div key={s.l} className={`${s.bg} rounded-2xl border border-neutral-100 p-5`}>
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.v}</div>
                <div className="text-xs text-neutral-500 mt-1 leading-snug">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ COMPARISON TABLE ═══════════════════ */

function ComparisonTable() {
  const rows = [
    { feature: 'Price per student', us: '₹79/month', them: '₹150–300/month' },
    { feature: 'Parents & teachers', us: 'Always free', them: '₹50–100/user/mo' },
    { feature: 'Setup time', us: 'Live in 24 hours', them: '2–4 weeks' },
    { feature: 'WhatsApp integration', us: 'Built-in, free', them: 'Usually extra cost' },
    { feature: 'Indian fee structures', us: '✓ Native', them: 'Adapted, not built' },
    { feature: 'FeeSense AI agent', us: '✓ Included', them: 'Basic or missing' },
    { feature: 'Anonymous complaints', us: '✓ Built-in', them: 'Rarely available' },
    { feature: 'Admission CRM', us: '✓ Full pipeline', them: 'Add-on or missing' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>How We Compare</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            More Features. Less Cost.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            A school with 40 students, 80 parents, 10 teachers pays <strong className="text-neutral-900">₹3,160/month</strong> with us vs ₹8,000–13,000 elsewhere.
          </p>
        </div>

        <div className="bg-[#f8f8f6] rounded-3xl border border-neutral-100 overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-3.5 border-b border-neutral-200">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Feature</div>
            <div className="text-[10px] font-semibold text-lime-700 uppercase tracking-widest text-center">Shiksha Cloud</div>
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest text-center">Typical Competitor</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.feature} className={`grid grid-cols-3 px-6 py-4 items-center ${i < rows.length - 1 ? 'border-b border-neutral-100' : ''} hover:bg-white transition-colors`}>
              <div className="text-sm text-neutral-700">{r.feature}</div>
              <div className="text-center">
                <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{r.us}</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-neutral-400">{r.them}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ PRICING ═══════════════════ */

function Pricing() {
  const roles = [
    { role: 'Students', price: '₹79/mo', note: 'Per enrolled student', color: 'bg-[#f4fdd4] border-lime-200', badge: 'text-lime-700' },
    { role: 'Parents', price: 'Free', note: 'Always, unlimited', color: 'bg-sky-50 border-sky-200', badge: 'text-sky-600' },
    { role: 'Teachers', price: 'Free', note: 'Always, unlimited', color: 'bg-violet-50 border-violet-200', badge: 'text-violet-600' },
    { role: 'Admins', price: 'Free', note: 'Always, unlimited', color: 'bg-amber-50 border-amber-200', badge: 'text-amber-600' },
  ];

  const example = [
    { type: 'Students (40)', us: '₹3,160/mo', them: '₹3,160/mo', highlight: false },
    { type: 'Parents (80)', us: 'FREE', them: '₹4,000–8,000/mo', highlight: true },
    { type: 'Teachers (10)', us: 'FREE', them: '₹500–1,000/mo', highlight: true },
    { type: 'Admins (10)', us: 'FREE', them: '₹500–1,000/mo', highlight: true },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Simple Pricing</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            ₹79 per student per month.<br className="hidden sm:block" />
            Everyone else is free.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            One number. No tiers, no per-user fees for parents, teachers, or admins. No setup costs. Pay only for the students enrolled.
          </p>
        </div>

        {/* Hero price + role breakdown */}
        <div className="grid lg:grid-cols-2 gap-5 mb-8">

          {/* Left — the one number */}
          <div className="bg-neutral-900 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
                <span className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">The only number you need</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-7xl font-bold tracking-tight text-white leading-none">₹79</span>
                <div className="mb-2">
                  <div className="text-white/50 text-sm">per student</div>
                  <div className="text-white/50 text-sm">per month</div>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-4 leading-relaxed">
                Billed monthly. No annual lock-in. No setup fee. Cancel anytime.
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <Link href="/select-organization" className="w-full bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold py-3.5 rounded-xl text-sm transition-colors inline-block text-center">
                Start Free Trial — No Card Required
              </Link>
            </div>
          </div>

          {/* Right — role breakdown */}
          <div className="flex flex-col gap-3">
            {roles.map(r => (
              <div key={r.role} className={`flex items-center justify-between rounded-2xl border p-4 ${r.color}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-neutral-100 shrink-0">
                    <Users className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{r.role}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{r.note}</div>
                  </div>
                </div>
                <span className={`text-base font-bold ${r.badge}`}>{r.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison example */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <div className="text-sm font-semibold text-neutral-900">Example: School with 40 students, 80 parents, 10 teachers, 10 admins</div>
            <span className="ml-auto text-xs text-neutral-400">(140 total users)</span>
          </div>
          <div className="grid grid-cols-3 px-6 py-2.5 border-b border-neutral-200 bg-[#f8f8f6]">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">User type</div>
            <div className="text-[10px] font-semibold text-lime-700 uppercase tracking-widest text-center">Shiksha Cloud</div>
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest text-center">Typical Competitor</div>
          </div>
          {example.map((e, i) => (
            <div key={e.type} className={`grid grid-cols-3 px-6 py-4 items-center ${i < example.length - 1 ? 'border-b border-neutral-100' : ''}`}>
              <div className="text-sm text-neutral-700">{e.type}</div>
              <div className="text-center">
                <span className={`text-sm font-bold ${e.highlight ? 'text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200' : 'text-neutral-700'}`}>
                  {e.us}
                </span>
              </div>
              <div className="text-center text-sm text-neutral-400">{e.them}</div>
            </div>
          ))}
          <div className="grid grid-cols-3 px-6 py-4 items-center bg-[#f8f8f6] border-t-2 border-neutral-200">
            <div className="text-sm font-bold text-neutral-900">Total / month</div>
            <div className="text-center">
              <span className="text-base font-bold text-lime-700 bg-[#d9f972] px-3 py-1.5 rounded-full">₹3,160</span>
            </div>
            <div className="text-center text-sm text-neutral-500 line-through">₹8,160–13,160</div>
          </div>
        </div>

        {/* Guarantees row */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Shield, title: '30-Day Money-Back', desc: 'Full refund if you\'re not satisfied. No questions.' },
            { icon: Check, title: 'No Hidden Costs', desc: 'No setup fee, no per-user billing, no surprises.' },
            { icon: RefreshCw, title: 'Cancel Anytime', desc: 'Month to month. No annual lock-in required.' },
          ].map(g => (
            <div key={g.title} className="flex items-start gap-3 bg-white border border-neutral-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0">
                <g.icon className="w-3.5 h-3.5 text-neutral-700" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{g.title}</div>
                <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ GETTING STARTED ═══════════════════ */

function GettingStarted() {
  const steps = [
    { number: '01', title: 'Sign Up', duration: '5 min', desc: 'Create your organization account — school name, type, and basic details.' },
    { number: '02', title: 'Configure', duration: '30 min', desc: 'Set up grades, sections, subjects, fee categories, and grading scale.' },
    { number: '03', title: 'Add Staff', duration: '30 min', desc: 'Add teaching staff and assign them to sections and subjects.' },
    { number: '04', title: 'Import Students', duration: '1–2 hrs', desc: 'Bulk upload your student roster via CSV. One file, entire batch done.' },
    { number: '05', title: 'Go Live', duration: 'Instant', desc: 'Start using all 47+ features immediately. Students and parents can log in the same day.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Getting Started</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Live in Less Than 24 Hours
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            No lengthy onboarding, no waiting for consultants. Five steps and your entire school is on the platform.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-neutral-200 hidden md:block" />
          <div className="flex flex-col gap-5">
            {steps.map(step => (
              <div key={step.number} className="group flex gap-5 items-start">
                <div className="relative z-10 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 group-hover:border-[#A3CD39] group-hover:bg-[#d9f972] flex items-center justify-center transition-all duration-300">
                    <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-800 transition-colors">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1 bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl p-5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-base font-semibold text-neutral-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="shrink-0 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-500">
                      {step.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

function Testimonials() {
  const quotes = [
    { result: 'Doubled students, same team', quote: 'We went from 250 to 600 students in 2 years. With Shiksha Cloud, our same team handles double the students efficiently without any new hires.', name: 'Rajesh Kumar', role: 'School Principal, Delhi' },
    { result: 'Full visibility from my phone', quote: "As a working mother, Shiksha Cloud gives me complete information about my daughter's attendance and fees on my phone. I don't need to call the school anymore.", name: 'Priya Sharma', role: 'Parent, Mumbai' },
    { result: 'Attendance down to 5 minutes', quote: 'I used to spend 30–40 minutes daily on attendance. Now it takes 5 minutes total for my class. It\'s made my whole morning routine so much smoother.', name: 'Anjali Desai', role: 'Mathematics Teacher, Pune' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Success Stories</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            What Schools Are Saying
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
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                  {q.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{q.name}</p>
                  <p className="text-xs text-neutral-400">{q.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ FAQ ═══════════════════ */

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'Is Shiksha Cloud suitable for my type of institution?', a: 'Yes. Whether you run a primary school, secondary school, coaching center, college, or any educational institution, Shiksha Cloud adapts to your needs. It supports annual, semester, trimester, and batch academic year formats.' },
    { q: 'How long does it actually take to set up?', a: 'Most institutions are fully operational within 24 hours. Basic configuration takes 1–2 hours. Bulk student import via CSV takes minutes. Your staff can log in the same day.' },
    { q: 'Do I need technical knowledge to use it?', a: 'No. If you can use WhatsApp or email, you can use Shiksha Cloud. It is designed for educators, not IT teams. Comprehensive documentation and support are included.' },
    { q: 'How does the ₹79 per student pricing work?', a: 'You pay ₹79/student/month for enrolled students only. Parents, teachers, and admin accounts are always free — no per-user charges for any other role. No hidden setup fees.' },
    { q: 'Can parents pay fees online?', a: 'Yes. Parents pay 24/7 using UPI, credit/debit cards, net banking, or digital wallets through our integrated payment gateway. Auto-generated receipts are delivered via WhatsApp, SMS, and email.' },
    { q: 'Is the data secure?', a: 'Yes. Shiksha Cloud uses enterprise-grade encryption in transit and at rest, Clerk-powered authentication with role-based access control, complete multi-tenant data isolation, and automated daily backups.' },
    { q: 'What notification channels are supported?', a: 'SMS, WhatsApp, Email, Push, and In-App — all from Shiksha Cloud\'s own built-in notification engine. No third-party relay, no extra cost. Admins configure which events trigger which channels.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Common Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-[#f8f8f6] border rounded-2xl overflow-hidden transition-all duration-300 ${open === i ? 'bg-white border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)]' : 'border-neutral-100'}`}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4.5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}
              >
                <span className="text-sm font-semibold text-neutral-900">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} strokeWidth={1.8} />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ MAIN EXPORT ═══════════════════ */

export default function ModernSchoolManagementGuide() {
  return (
    <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
      {/* <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" /> */}
      <div className="relative z-10">
        <Hero />
        <StatsStrip />
        <TheProblem />
        <WhatIsThis />
        <FeaturesSection />
        <AllModules />
        <StakeholderViews />
        <ComparisonTable />
        <Pricing />
        <GettingStarted />
        <Testimonials />
        <FAQ />
      </div>
    </div>
  );
}