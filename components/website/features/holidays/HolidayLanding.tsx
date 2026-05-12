'use client';

import { ChevronRight, ArrowRight, Star, CheckCircle2, Bell, Smartphone, BarChart3, MessageSquare, Shield,
  Trash2, Upload, AlertTriangle, Download, Printer, RefreshCw
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
  return (
    <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-7">
              <Link href="/features" className="hover:text-neutral-700 transition-colors">Features</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-700 font-medium">Holiday Management</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-sky-600">Declare emergencies in 8 seconds</span>
            </div>

            <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              Holiday Management System — Never Miss a School Holiday
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              Declare, track, and notify parents about school holidays in seconds. Real-time working day calculations and instant WhatsApp alerts keep your community aligned.
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
              {[
                { value: '30s', label: 'Notification speed' },
                { value: '98%', label: 'WhatsApp open rate' },
                { value: '40h', label: 'Saved yearly per admin' },
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
              {['WhatsApp Alerts', 'Google Calendar Sync', 'Emergency Declaration'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mock */}
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
                  <span className="text-xs font-medium text-neutral-500 ml-1">Academic Calendar</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-[#d9f972] text-neutral-800 px-3 py-1.5 rounded-lg">
                  + Add Holiday
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Working days stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 text-sky-700 rounded-xl p-3 border border-sky-100">
                    <div className="text-2xl font-bold tracking-tight">186</div>
                    <div className="text-[10px] mt-0.5 opacity-70 font-medium uppercase tracking-wider">Working Days</div>
                  </div>
                  <div className="bg-[#f4fdd4] text-lime-800 rounded-xl p-3 border border-lime-200">
                    <div className="text-2xl font-bold tracking-tight">24</div>
                    <div className="text-[10px] mt-0.5 opacity-70 font-medium uppercase tracking-wider">Total Holidays</div>
                  </div>
                </div>

                {/* Holiday list preview */}
                <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 overflow-hidden">
                  <div className="flex items-center px-4 py-2.5 border-b border-neutral-200">
                    <div className="w-16 text-[10px] font-semibold text-neutral-400 uppercase">Date</div>
                    <div className="flex-1 text-[10px] font-semibold text-neutral-400 uppercase">Holiday</div>
                    <div className="w-20 text-[10px] font-semibold text-neutral-400 uppercase text-right">Type</div>
                  </div>
                  {[
                    { date: '15 Aug', name: 'Independence Day', type: 'National', dot: 'bg-amber-400' },
                    { date: '02 Oct', name: 'Gandhi Jayanthi', type: 'National', dot: 'bg-amber-400' },
                    { date: '24 Oct', name: 'Diwali Break', type: 'Religious', dot: 'bg-rose-400' },
                  ].map((h, i) => (
                    <div key={h.name} className={`flex items-center px-4 py-3.5 hover:bg-white transition-colors cursor-pointer ${i < 2 ? 'border-b border-neutral-100' : ''}`}>
                      <div className="w-16 text-xs font-semibold text-neutral-600">{h.date}</div>
                      <div className="flex-1 text-sm font-medium text-neutral-800">{h.name}</div>
                      <div className="w-20 text-right">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                          {h.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp notification highlight */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-900">WhatsApp Alert Ready</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Automated notification for 462 parents</div>
                  </div>
                  <button className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded-lg">
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-neutral-900">8 Sec</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Emergency Flow</p>
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
          { value: '500+', label: 'Schools' },
          { value: '98%', label: 'WhatsApp Open Rate' },
          { value: '30s', label: 'Declaration-to-Notify' },
          { value: '0', label: 'Manual Calculations' },
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

/* ═══════════════════ WORKFLOW STEPS ═══════════════════ */

function WorkflowSteps() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Bulk Import Holidays',
      subtitle: 'Import 100+ in seconds',
      desc: 'Connect Google Sheets or upload your Excel directly. Our intelligent parser maps columns and handles formatting automatically—no manual typing required.',
      detail: 'Google Sheets · Excel · CSV · Paste Data',
    },
    {
      number: '02',
      icon: RefreshCw,
      title: 'Auto-Calculation Engine',
      subtitle: 'Working days synced live',
      desc: 'The moment you add a holiday, the system recalculates working days for the term and year. It ensures your academic calendar is always accurate and compliant.',
      detail: 'Real-time Working Day Logic',
    },
    {
      number: '03',
      icon: AlertTriangle,
      title: 'Emergency Declaration',
      subtitle: 'Trigger in one click',
      desc: 'When weather or local events strike, use the Emergency Flow. Declare a holiday instantly across the entire school app and website in under 8 seconds.',
      detail: 'One-click emergency handling',
    },
    {
      number: '04',
      icon: MessageSquare,
      title: 'Instant Multi-Channel Alerts',
      subtitle: '98% WhatsApp delivery',
      desc: 'Notifications fire automatically via WhatsApp Business, Mobile Push, and Email. Parents acknowledge alerts within 10 minutes, eliminating chaotic phone calls.',
      detail: 'WhatsApp · Push · Email · SMS',
    },
    {
      number: '05',
      icon: RefreshCw,
      title: 'Personal Calendar Sync',
      subtitle: 'Parent-friendly convenience',
      desc: 'Parents can sync the school calendar to their Google, Apple, or Outlook accounts with a single tap. Any updates or changes reflect on their personal devices live.',
      detail: 'Google · Apple · Outlook Sync',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>The Lifecycle</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Plan, Declare, Notify.<br />Done in Seconds.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Eliminate the spreadsheet chaos. Shiksha Cloud automates every step of your school's holiday management cycle.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-neutral-200 hidden md:block" />
          <div className="flex flex-col gap-5">
            {steps.map((step) => (
              <div key={step.number} className="group flex gap-5 items-start">
                <div className="relative z-10 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 group-hover:border-[#A3CD39] group-hover:bg-[#d9f972] flex items-center justify-center transition-all duration-300">
                    <step.icon className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                  </div>
                </div>
                <div className="flex-1 bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl p-5 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs font-bold text-neutral-300">{step.number}</span>
                        <h3 className="text-base font-semibold text-neutral-900">{step.title}</h3>
                        <span className="text-xs font-medium text-neutral-400 hidden sm:block">— {step.subtitle}</span>
                      </div>
                      <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="shrink-0 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[10px] text-neutral-500 font-medium sm:max-w-[200px] sm:text-right">
                      {step.detail}
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

/* ═══════════════════ FEATURES GRID ═══════════════════ */

function FeaturesGrid() {
  const items = [
    { icon: Upload, title: '5 Import Methods', desc: 'Google Sheets, Excel, CSV, Copy-Paste, or Manual Quick-Add. Choose what works for you.' },
    { icon: AlertTriangle, title: 'Emergency Flow', desc: 'Declare unscheduled holidays in 8 seconds with automatic higher-authority overrides.' },
    { icon: MessageSquare, title: 'Official WhatsApp', desc: 'Automated templates via official WhatsApp Business API for professional communication.' },
    { icon: BarChart3, title: 'Working Day Math', desc: 'Live counter of working days vs holidays. Perfect for term-end planning and compliance.' },
    { icon: RefreshCw, title: 'Calendar Sync', desc: 'One-click export for parents to Google/Apple/Outlook. Changes reflect instantly.' },
    { icon: Trash2, title: 'Safe Cleanup', desc: 'Delete single holidays or reset years with explicit confirmation and change logging.' },
    { icon: Smartphone, title: 'Mobile Dashboard', desc: 'Admins can declare holidays from their phones during early-morning emergencies.' },
    { icon: Shield, title: 'Permission Logic', desc: 'Designate exactly who can create, declare, or delete holiday entries.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>All Capabilities</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Everything Needed for a<br />Fluid School Calendar
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

/* ═══════════════════ CALENDAR PREVIEW ═══════════════════ */

function CalendarPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Calendar mock */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-[#f8f8f6]">
              <div className="flex items-center gap-3">
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-neutral-200">
                  <ChevronRight className="w-4 h-4 rotate-180 text-neutral-500" />
                </button>
                <span className="text-sm font-semibold text-neutral-900">November 2024</span>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-neutral-200">
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-[#d9f972]" /> Active Term
              </div>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-neutral-400 py-2 uppercase">{d}</div>
              ))}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isHoliday = day === 1 && i === 0 || day === 15 || day === 16;
                const isEmergency = day === 28;
                return (
                  <div key={i} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-default
                     ${isHoliday ? 'bg-[#f4fdd4] border-lime-200' : isEmergency ? 'bg-orange-50 border-orange-100' : 'bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-sm hover:border-neutral-200'}
                   `}>
                    <span className={`text-xs font-semibold ${isHoliday ? 'text-lime-800' : isEmergency ? 'text-orange-800' : 'text-neutral-600'}`}>{day}</span>
                    {(isHoliday || isEmergency) && <div className={`w-1 h-1 rounded-full mt-1 ${isHoliday ? 'bg-lime-500' : 'bg-orange-500'}`} />}
                    {day === 15 && (
                      <div className="absolute top-1 right-1">
                        <Star className="w-2 h-2 text-lime-600 fill-lime-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mx-4 mb-4 p-3 bg-neutral-900 rounded-xl flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#d9f972]" />
                  <span className="text-[10px] text-white font-medium">Holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-[10px] text-white font-medium">Emergency</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-3 h-3" /> PDF Export
              </button>
            </div>
          </div>

          {/* Right text */}
          <div>
            <SectionLabel>Parent Portal</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              A Unified Calendar for Your Whole Community
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              Stop parents from scouring emails. Give them a single, beautifully designed source of truth that syncs directly with their existing calendars.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icon: Smartphone, title: 'In-App Calendar', desc: 'A clean, color-coded holiday view built into the parent app. No separate downloads needed.' },
                { icon: Bell, title: 'Notification Center', desc: 'Every holiday declaration triggers an in-app alert with a detailed reason and back-to-school date.' },
                { icon: Printer, title: 'Print-Ready Exports', desc: 'Admins can generate professionally designed monthly planners to post on notice boards.' },
                { icon: RefreshCw, title: 'Live Sync', desc: 'Edits or deletions reflect on parent devices instantly—no more "old version" confusion.' },
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

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

function Testimonials() {
  const quotes = [
    {
      result: 'Emergency sync in 5 minutes',
      quote: 'Last month\'s surprise storm was a test. We declared an emergency holiday at 6:00 AM. By 6:05 AM, 98% of parents had acknowledged the WhatsApp alert. No child was stranded.',
      name: 'Dr. Rajesh Kumar', role: 'Principal, Mumbai International School', students: '2,200',
    },
    {
      result: '40 hours saved per year',
      quote: 'Holiday planning used to involve messy Excels and parent calls. Now we just import the years calendar from Google Sheets and let the system handle the rest.',
      name: 'Anjali Verma', role: 'Admin Head, DPS Hyderabad', students: '1,500',
    },
    {
      result: 'Zerp missed holiday complaints',
      quote: 'Since switching, zero parents have complained about not knowing a holiday. The WhatsApp alerts and calendar sync mean they are always aligned.',
      name: 'Suresh Reddy', role: 'Coordinator, Bangalore Academy', students: '900',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Real Outcomes</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Trusted by 500+ Indian Schools
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <div key={i} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6 flex flex-col hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-neutral-200 transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start mb-4">
                {q.result}
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">&quot;{q.quote}&quot;</p>
              <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
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

export default function HolidayLanding() {
  return (
    <div className="bg-[#f8f8f6] text-neutral-900">
      <Hero />
      <StatsStrip />
      <WorkflowSteps />
      <FeaturesGrid />
      <CalendarPreview />
      <Testimonials />
    </div>
  );
}
