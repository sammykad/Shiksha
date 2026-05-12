'use client';

import {
  ChevronRight, ArrowRight, Star, CheckCircle2,
  Check, Shield, Bell, FileText, Users, Lock, EyeOff, AlertTriangle, BarChart3, TrendingDown,
  Hash, QrCode, MessageSquare, Search, ExternalLink, Zap,
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
  const complaints = [
    { id: 'ACS-2847', type: 'Harassment', time: '2 min ago', status: 'Under Review', dot: 'bg-amber-400' },
    { id: 'ACS-2846', type: 'Bullying', time: '1 hr ago', status: 'Resolved', dot: 'bg-emerald-400' },
    { id: 'ACS-2845', type: 'Safety', time: '3 hrs ago', status: 'Escalated', dot: 'bg-sky-400' },
  ];

  return (
    <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-7">
              <Link href="/features" className="hover:text-neutral-700 transition-colors">Features</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-700 font-medium">Anonymous Complaints</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-rose-600">76% of students never report due to fear</span>
            </div>

            <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              Anonymous Complaint System — Give Students a Safe Voice
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              A secure, anonymous reporting system built for Indian schools — so students can report harassment, bullying, and safety concerns without fear of retaliation.
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
              {[
                { value: '85%', label: 'Drop in unreported incidents' },
                { value: '500+', label: 'Schools protected' },
                { value: '100%', label: 'POCSO compliant' },
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
              {['POCSO Act Ready', 'ISO 27001 Certified', 'Zero-knowledge privacy'].map(t => (
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
                  <span className="text-xs font-medium text-neutral-500 ml-1">Safety Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Cases', value: '3', color: 'bg-amber-50 text-amber-700' },
                    { label: 'Resolved', value: '47', color: 'bg-[#f4fdd4] text-lime-700' },
                    { label: 'Avg. Resolution', value: '2.4d', color: 'bg-sky-50 text-sky-700' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-xl p-3 border border-neutral-100`}>
                      <div className="text-xl font-bold tracking-tight">{s.value}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Anonymous submission reminder */}
                <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <EyeOff className="w-4 h-4 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Identities are never revealed</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Zero-knowledge architecture · Unique tracking IDs</div>
                  </div>
                </div>

                {/* Case list */}
                <div className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 overflow-hidden">
                  <div className="flex items-center px-4 py-2.5 border-b border-neutral-200">
                    {['ID', 'Category', 'Status'].map((h, i) => (
                      <div key={h} className={`${i === 0 ? 'w-20' : i === 1 ? 'flex-1' : 'w-28'} text-[10px] font-semibold tracking-widest text-neutral-400 uppercase`}>{h}</div>
                    ))}
                  </div>
                  {complaints.map((c, i) => (
                    <div key={c.id} className={`flex items-center px-4 py-3.5 hover:bg-white transition-colors cursor-pointer ${i < complaints.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                      <div className="w-20">
                        <div className="text-xs font-mono font-semibold text-neutral-700">{c.id}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{c.time}</div>
                      </div>
                      <div className="flex-1 text-sm font-medium text-neutral-800">{c.type}</div>
                      <div className="w-28">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-600">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Track your report */}
                <div className="bg-[#f8f8f6] rounded-xl border border-neutral-100 p-4 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
                    <Hash className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-400">Enter tracking ID…</span>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-semibold bg-neutral-900 text-white px-3 py-2 rounded-lg">
                    <Search className="w-3 h-3" /> Track
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-600" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-neutral-900">POCSO</p>
                <p className="text-[10px] text-neutral-400">Act 2012 compliant</p>
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
          { value: '500+', label: 'Schools Protected' },
          { value: '76%', label: 'Students fear speaking up' },
          { value: '40%', label: 'Faster incident resolution' },
          { value: '13.5%', label: 'Reduction in school violence' },
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
  const cases = [
    {
      title: 'Badlapur School (Aug 2024)',
      tag: 'Maharashtra',
      desc: 'A school staffer assaulted two 4-year-old girls in washrooms. Discovered only after a parent complaint — months after incidents began.',
      impact: 'State-wide protests demanding safety policy overhaul',
      links: [
        { label: 'Hindustan Times', href: 'https://www.hindustantimes.com/cities/mumbai-news/a-year-after-badlapur-sexual-assault-hc-irked-over-persisting-lack-of-security-measures-101758309696806.html' },
        { label: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Badlapur_school_sexual_abuse_case' },
      ],
    },
    {
      title: 'Pune School (2024)',
      tag: 'Pune, MH',
      desc: 'Multiple students experienced harassment for months before anyone spoke up. Fear of retaliation and peer pressure kept victims silent.',
      impact: 'Extended abuse period — all preventable with a safe channel',
      links: [
        { label: 'Business Standard', href: 'https://www.business-standard.com/india-news/teacher-7-others-held-for-sexual-harassment-of-12-year-old-girl-in-pune-124082400343_1.html' },
        { label: 'Times of India', href: 'https://timesofindia.indiatimes.com/city/pune/school-director-fails-to-report-abuse-of-2-boys-by-teacher-held/articleshow/116482255.cms' },
      ],
    },
    {
      title: 'Mumbai School Teacher (2024)',
      tag: 'Mumbai, MH',
      desc: 'Year-long abuse went undetected inside classrooms. Parents noticed behavioral changes only after months — institutional channels had completely failed.',
      impact: 'One year of silence — zero institutional detection',
      links: [
        { label: 'NDTV', href: 'https://www.ndtv.com/india-news/mumbai-school-english-teacher-sexually-assaulted-her-student-16-for-a-year-pocso-act-news-8811717' },
      ],
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <SectionLabel>The Real Problem</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-5">
            Silence Is the Biggest Safety Risk in Indian Schools
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            <span className="font-semibold text-neutral-800">76% of students don&apos;t report harassment due to fear of retaliation</span> — University of Michigan. Anonymous reporting systems reduce school violence by <span className="font-semibold text-neutral-800">13.5%</span> — National Institute of Justice. These aren&apos;t statistics. They&apos;re preventable tragedies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-red-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{c.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">{c.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed flex-1 mb-4">{c.desc}</p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                <p className="text-xs font-medium text-red-700">{c.impact}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.links.map(l => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ HOW IT WORKS ═══════════════════ */

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: EyeOff,
      title: 'Anonymous Submission',
      subtitle: 'Zero identity exposure',
      desc: 'Students submit via web portal, mobile app, or QR code scan. The system strips all metadata before storing. A unique tracking ID is generated — no names, no device data, no IP logs.',
      detail: 'Web · Mobile · QR code · No metadata stored',
    },
    {
      number: '02',
      icon: Bell,
      title: 'Instant Multi-Channel Alerts',
      subtitle: 'Right people notified immediately',
      desc: 'Automated notifications fire within seconds to designated safety officers, administrators, and (if POCSO-mandated) authorities. SMS, email, push, and in-app — all channels simultaneously.',
      detail: 'SMS · Email · Push · In-app · Configurable roles',
    },
    {
      number: '03',
      icon: FileText,
      title: 'Investigation & Evidence',
      subtitle: 'Tamper-proof case management',
      desc: 'Assigned officers collect evidence, update case status, and log every action. All files stored in encrypted cloud storage with a tamper-proof audit trail suitable for legal proceedings.',
      detail: 'Encrypted storage · Audit trail · Legal-ready docs',
    },
    {
      number: '04',
      icon: CheckCircle2,
      title: 'Resolution & Prevention',
      subtitle: 'Close and learn',
      desc: 'Once resolved, the case is closed with documented outcomes and prevention measures. Students can check status anonymously using their tracking ID at any point during the process.',
      detail: 'Outcome documentation · Tracking ID status · Analytics',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Four Steps to a Safer School
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            From anonymous submission to documented resolution — every step protects the student, the institution, and satisfies POCSO requirements.
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
                    <div className="shrink-0 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-[10px] text-neutral-500 font-medium sm:max-w-[190px] sm:text-right">
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
    { icon: EyeOff, title: 'Zero-Knowledge Privacy', desc: 'No names, no IPs, no device fingerprints stored. Identities cannot be revealed even if compelled.' },
    { icon: Hash, title: 'Unique Tracking IDs', desc: 'Students follow case progress anonymously using a generated ID — no account needed.' },
    { icon: Bell, title: 'Multi-Channel Instant Alerts', desc: 'SMS, email, push, and in-app notifications reach the right people within seconds.' },
    { icon: FileText, title: 'POCSO Act Documentation', desc: 'Auto-generated reports satisfy POCSO Act 2012 mandated reporting within 24 hours.' },
    { icon: Shield, title: 'Tamper-Proof Audit Trail', desc: 'Every action timestamped and encrypted. Suitable for police reports and court proceedings.' },
    { icon: QrCode, title: 'QR Code Submission', desc: 'Physical QR codes placed around school allow device-independent anonymous submissions.' },
    { icon: BarChart3, title: 'Safety Analytics Dashboard', desc: 'Trend analysis by complaint type, resolution time, and recurrence — for proactive intervention.' },
    { icon: MessageSquare, title: 'Multi-Language Support', desc: 'Interface available in Hindi, English, Marathi, Tamil, and 12 other regional languages.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>All Capabilities</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Built for Privacy. Built for India.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Enterprise-grade privacy architecture with the compliance and language support that Indian schools actually need.
          </p>
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

/* ═══════════════════ BEFORE / AFTER ═══════════════════ */

function BeforeAfter() {
  const before = [
    'Students fear naming themselves in complaints',
    'Incidents go unreported for months or years',
    'No audit trail for legal or POCSO proceedings',
    'School learns of problems only from media',
    'No structured follow-up after a complaint',
    'Institutional reputation damaged by inaction',
  ];
  const after = [
    'Anonymous reporting removes fear entirely',
    'Early detection before situations escalate',
    'Full tamper-proof audit trail for every case',
    'Proactive internal resolution before escalation',
    'Structured case management with tracked outcomes',
    'Proactive safety culture builds parent trust',
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Before & After</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            What Changes When Students Have a Safe Voice
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3 h-3 text-red-500" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Without Anonymous Reporting</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-5">The Culture of Silence</h3>
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
            <h3 className="text-xl font-semibold text-neutral-900 mb-5">A Culture of Safety</h3>
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

/* ═══════════════════ BENEFITS ═══════════════════ */

function Benefits() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Compliance visual */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
              <h4 className="text-sm font-semibold text-neutral-900 mb-5">Compliance Certifications</h4>
              {[
                { name: 'POCSO Act 2012', status: '✓ Compliant', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { name: 'ISO 27001', status: '✓ Certified', color: 'text-sky-600 bg-sky-50 border-sky-200' },
                { name: 'Indian Data Protection', status: '✓ Adherent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { name: 'RTI Readiness', status: '✓ Ready', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { name: 'GDPR', status: '✓ Compliant', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              ].map(c => (
                <div key={c.name} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Shield className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                    <span className="text-sm text-neutral-700">{c.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.color}`}>{c.status}</span>
                </div>
              ))}
            </div>

            {/* Impact metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '85%', label: 'Drop in unreported incidents', color: 'bg-[#f4fdd4]' },
                { value: '40%', label: 'Faster case resolution', color: 'bg-sky-50' },
                { value: '13.5%', label: 'School violence reduction', color: 'bg-rose-50' },
                { value: '2.4 days', label: 'Avg. resolution time', color: 'bg-amber-50' },
              ].map(m => (
                <div key={m.label} className={`${m.color} rounded-2xl border border-neutral-100 p-4`}>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">{m.value}</div>
                  <div className="text-[10px] text-neutral-500 mt-1 leading-snug">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right text */}
          <div>
            <SectionLabel>Why It Matters</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              Beyond Compliance —<br />A Genuine Safety Culture
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              POCSO compliance is the legal minimum. What actually protects students is a culture where they believe reporting will work — and that their identity will stay safe. That's what this system builds.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icon: Lock, title: 'Legal Protection', desc: 'Complete POCSO Act compliance shields the institution from liability and satisfies police documentation requirements.' },
                { icon: TrendingDown, title: 'Early Intervention', desc: 'Anonymous reporting catches incidents at the first sign — before they escalate into crises that appear in the news.' },
                { icon: Users, title: 'Parent & Community Trust', desc: 'Schools with visible safety systems attract more enrollment. Parents choose institutions that demonstrably protect children.' },
                { icon: Zap, title: 'Institutional Reputation', desc: 'Proactive safety culture means issues are handled internally — not discovered by journalists or NCPCR.' },
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
      quote: 'The anonymous system changed our school culture overnight. Students actually use it. We caught three incidents in the first month that would never have been reported otherwise.',
      name: 'Mrs. Priya Nair', role: 'Principal, DPS International, Mumbai', tag: 'Principal',
    },
    {
      quote: 'I was scared to say something because of my friends. The tracking ID meant I could see what was happening without anyone knowing it was me. The situation was handled within 4 days.',
      name: 'Anonymous Student', role: 'Class 11, Kendriya Vidyalaya', tag: 'Student',
    },
    {
      quote: 'As a parent I always worried about whether my daughter would feel safe speaking up. Knowing the school has this system gave me genuine peace of mind — not just marketing words.',
      name: 'Rajesh Mehta', role: 'Parent, Ryan International School', tag: 'Parent',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Success Stories</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Trusted by Schools, Students, and Parents
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <div key={i} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6 flex flex-col hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-neutral-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${q.tag === 'Principal' ? 'text-violet-600 bg-violet-50 border-violet-200'
                  : q.tag === 'Student' ? 'text-sky-600 bg-sky-50 border-sky-200'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  }`}>{q.tag}</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">&quot;{q.quote}&quot;</p>
              <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                  {q.name === 'Anonymous Student' ? '?' : q.name.split(' ').map(n => n[0]).join('')}
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


/* ═══════════════════ MAIN EXPORT ═══════════════════ */

export default function AnonymousComplaintsLanding() {
  return (
    <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      <div className="relative z-10">
        <Hero />
        <StatsStrip />
        <TheProblem />
        <HowItWorks />
        <FeaturesGrid />
        <BeforeAfter />
        <Benefits />
        <Testimonials />
      </div>
    </div>
  );
}