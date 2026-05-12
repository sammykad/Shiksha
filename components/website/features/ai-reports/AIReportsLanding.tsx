'use client';

import { useState } from 'react';
import {
  Star, Check, ArrowRight, CheckCircle2,
  BarChart3, FileText, Users, Download,
  TrendingUp, AlertCircle, Calendar,
  CreditCard, Search, BookOpen, Sparkles,
  Send, Zap, Bot, MessageSquare, GraduationCap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
   HERO — centered like StudentManagement
══════════════════════════════════════════════════════ */

const QUERIES = [
  {
    q: 'Show me students with attendance below 75% this month',
    tag: 'Attendance',
    tagC: 'text-red-700 bg-red-50 border-red-200',
    rows: [
      { name: 'Kabir Khan', detail: 'Class 10A', value: '60%', sub: '12/20 days', risk: true },
      { name: 'Mohit Kumar', detail: 'Class 9B', value: '40%', sub: '8/20 days', risk: true },
      { name: 'Rohan Desai', detail: 'Class 8C', value: '70%', sub: '14/20 days', risk: false },
      { name: 'Shreya Patel', detail: 'Class 10B', value: '65%', sub: '13/20 days', risk: true },
    ],
    insight: '4 students flagged · 3 need immediate intervention',
  },
  {
    q: 'Fee collection status for Class 11 and 12 this quarter',
    tag: 'Finance',
    tagC: 'text-amber-700 bg-amber-50 border-amber-200',
    rows: [
      { name: 'Class XI-A', detail: '₹4.2L demand', value: '79%', sub: '₹3.3L collected', risk: true },
      { name: 'Class XI-B', detail: '₹4.1L demand', value: '82%', sub: '₹3.4L collected', risk: false },
      { name: 'Class XII-A', detail: '₹4.5L demand', value: '76%', sub: '₹3.4L collected', risk: true },
      { name: 'Class XII-B', detail: '₹4.3L demand', value: '78%', sub: '₹3.4L collected', risk: true },
    ],
    insight: 'Total ₹17.1L · ₹13.5L collected (79%) · ₹3.6L pending',
  },
  {
    q: 'Which subjects have below 85% pass rate in Class 10?',
    tag: 'Academic',
    tagC: 'text-violet-700 bg-violet-50 border-violet-200',
    rows: [
      { name: 'Mathematics', detail: 'Class 10', value: '84.7%', sub: '104/123 passed', risk: true },
      { name: 'Science', detail: 'Class 10', value: '91.9%', sub: '113/123 passed', risk: false },
      { name: 'Social Studies', detail: 'Class 10', value: '93.5%', sub: '115/123 passed', risk: false },
      { name: 'Hindi', detail: 'Class 10', value: '96.8%', sub: '119/123 passed', risk: false },
    ],
    insight: '1 subject below threshold · 19 students at risk in Maths',
  },
];

function ReportResultCard({ active }: { active: number }) {
  const result = QUERIES[active];
  return (
    <Card className="w-full rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-neutral-100 overflow-hidden">
      {/* Window bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-[#f6f6f5]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => <div key={i} className="w-3 h-3 rounded-full bg-neutral-300" />)}
          </div>
          <span className="text-xs font-medium text-neutral-500 ml-1.5">AI Report Result</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" strokeWidth={2} /> Generated in 1.2s
        </div>
      </div>

      <CardContent className="p-0">
        {/* Query echo */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-neutral-100 bg-white">
          <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-violet-600" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-600 italic leading-relaxed">&quot;{result.q}&quot;</p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border shrink-0 ${result.tagC}`}>{result.tag}</span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 px-5 py-2.5 bg-[#f6f6f5] border-b border-neutral-200 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
          <span className="col-span-4">Name</span>
          <span className="col-span-4">Detail</span>
          <span className="col-span-2 text-right">Value</span>
          <span className="col-span-2 text-center">Flag</span>
        </div>

        {result.rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-neutral-50 transition-colors ${i < result.rows.length - 1 ? 'border-b border-neutral-50' : ''}`}>
            <div className="col-span-4 text-xs font-semibold text-neutral-900">{row.name}</div>
            <div className="col-span-4">
              <div className="text-xs text-neutral-600">{row.detail}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{row.sub}</div>
            </div>
            <div className="col-span-2 text-right text-sm font-bold text-neutral-800">{row.value}</div>
            <div className="col-span-2 flex justify-center">
              {row.risk
                ? <div className="w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center"><AlertCircle className="w-3 h-3 text-red-500" strokeWidth={2} /></div>
                : <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} /></div>
              }
            </div>
          </div>
        ))}

        {/* Insight bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-100 bg-[#f6f6f5]">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-lime-600 shrink-0" strokeWidth={2} />
            <span className="text-[10px] text-neutral-600 font-medium">{result.insight}</span>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {['PDF', 'Excel', 'CSV'].map(f => (
              <button key={f} className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 bg-white border border-neutral-200 px-2 py-1 rounded-lg hover:bg-neutral-50 transition-colors">
                <Download className="w-2.5 h-2.5" strokeWidth={2} />{f}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative pt-16 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* ── Centered text ── */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border-neutral-100 mb-7 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 fill-violet-100" strokeWidth={1.5} />
          AI-Powered Report Hub
        </Badge>

        <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tight text-neutral-900 leading-[1.08]">
          AI School Reports — Ask Any Question,<br />Get a Ready Report.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          A built-in hub with 15+ pre-built reports for attendance, fees, academics, and enrollment.
          Plus an AI engine — type a question in plain English and download the result in seconds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/select-organization" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-base shadow-sm h-auto">
            Book a Free Demo <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 font-medium px-8 py-3.5 rounded-full text-base shadow-sm h-auto">
            Schedule Demo
          </Button>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-400">
          {['15+ pre-built reports', 'Ask in plain English', 'PDF · Excel · CSV download', 'Role-based views'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive showcase ── */}
      <div className="relative w-full max-w-7xl mx-auto mt-14">

        {/* Query pills — left floating card */}
        <div className="flex flex-col lg:absolute lg:left-0 lg:top-8 z-20 mb-6 lg:mb-0 lg:w-64">
          <Card className="rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.07)] bg-white overflow-hidden">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Try asking…</p>
              <div className="flex flex-col gap-2">
                {QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`text-left px-3.5 py-3 rounded-xl border text-[11px] font-medium leading-relaxed transition-all ${active === i
                      ? 'bg-neutral-900 border-transparent text-white'
                      : 'bg-[#f6f6f5] border-neutral-100 text-neutral-600 hover:bg-white hover:border-neutral-200'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className={`w-3 h-3 mt-0.5 shrink-0 ${active === i ? 'text-[#d9f972]' : 'text-neutral-400'}`} strokeWidth={2} />
                      "{q.q}"
                    </div>
                  </button>
                ))}
              </div>

              {/* Type input */}
              <div className="mt-3 flex items-center gap-2 bg-[#f6f6f5] border border-neutral-200 rounded-xl px-3 py-2.5">
                <Search className="w-3 h-3 text-neutral-400 shrink-0" strokeWidth={1.8} />
                <span className="text-[10px] text-neutral-400 flex-1">Or type your own…</span>
                <div className="w-5 h-5 bg-neutral-900 rounded-md flex items-center justify-center shrink-0">
                  <Send className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result table — center */}
        <div className="relative lg:mx-auto lg:w-[580px] xl:w-[640px]">
          <ReportResultCard active={active} />
        </div>

        {/* Stats card — right floating */}
        <div className="flex flex-col lg:absolute lg:right-0 lg:top-8 z-20 mt-6 lg:mt-0 lg:w-56">
          <Card className="rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.07)] bg-white overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Report Hub Stats</p>
              {[
                { label: 'Pre-built reports', value: '15+', color: 'bg-[#f4fdd4] text-lime-700' },
                { label: 'AI generation time', value: '< 3s', color: 'bg-violet-50 text-violet-700' },
                { label: 'Download formats', value: '3', color: 'bg-sky-50 text-sky-700' },
                { label: 'Stakeholder views', value: '4', color: 'bg-amber-50 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 border border-neutral-100 ${s.color}`}>
                  <div className="text-xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   TWO THINGS — Hub vs AI (explain clearly)
══════════════════════════════════════════════════════ */

function TwoThings() {
  return (
    <section className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Two Powerful Things</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Pre-Built Reports + AI Generator.<br />Together.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            You get both. Browse and download reports that are already built — or just type what you need and let the AI generate it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Report Hub */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-7">
            <div className="w-12 h-12 rounded-2xl bg-[#f4fdd4] border border-lime-200 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6 text-lime-700" strokeWidth={1.8} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Report Hub</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              15+ professionally formatted reports — ready to open and download right now. No setup. Covers everything your school generates regularly.
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              {[
                { icon: Calendar, label: 'Monthly attendance summary with heatmap' },
                { icon: CreditCard, label: 'Fee collection status by class and type' },
                { icon: BookOpen, label: 'Subject-wise performance & grade distribution' },
                { icon: Users, label: 'Enrollment breakdown with gender ratio' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#f4fdd4] rounded-lg flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-lime-700" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-medium text-neutral-700">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-[#f6f6f5] rounded-xl px-3.5 py-2.5">
              <Download className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={1.8} />
              Download as <strong className="text-neutral-700 ml-1">PDF · Excel · CSV</strong>
            </div>
          </div>

          {/* AI Generator */}
          <div className="bg-neutral-900 rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-violet-300" strokeWidth={1.8} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Report Generator</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Need something specific? Type it. The AI understands plain English, runs the right query, and returns a formatted report in under 3 seconds.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  '"Show defaulters from Class XI with dues over 2 months"',
                  '"Students with perfect attendance this term"',
                  '"Compare section-wise averages in Mathematics"',
                  '"Top 10 performers by CGPA across the school"',
                ].map(q => (
                  <div key={q} className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                    <MessageSquare className="w-3 h-3 text-[#d9f972] mt-0.5 shrink-0" strokeWidth={2} />
                    <span className="text-[11px] text-white/60 leading-relaxed italic">{q}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-white/30">Any question about your school data → instant report</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   REPORT TYPES — visual grid
══════════════════════════════════════════════════════ */

function ReportTypes() {
  const categories = [
    {
      name: 'Attendance', icon: Calendar,
      color: 'bg-sky-50 border-sky-200 text-sky-600',
      bg: 'bg-sky-50',
      reports: ['Monthly summary', 'Student-wise detail', 'Absenteeism patterns', 'Weekly trend'],
    },
    {
      name: 'Fee & Finance', icon: CreditCard,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      bg: 'bg-emerald-50',
      reports: ['Collection status', 'Defaulters list', 'Payment methods', 'Class-wise breakdown'],
    },
    {
      name: 'Academic', icon: BookOpen,
      color: 'bg-violet-50 border-violet-200 text-violet-600',
      bg: 'bg-violet-50',
      reports: ['Subject performance', 'Grade distribution', 'Section comparison', 'Topper list'],
    },
    {
      name: 'Enrollment', icon: Users,
      color: 'bg-amber-50 border-amber-200 text-amber-600',
      bg: 'bg-amber-50',
      reports: ['Class-wise strength', 'Gender ratio', 'New vs dropout', 'Category breakdown'],
    },
    {
      name: 'Report Cards', icon: FileText,
      color: 'bg-rose-50 border-rose-200 text-rose-600',
      bg: 'bg-rose-50',
      reports: ['CBSE-style report card', 'CGPA & rank', 'Session summary', 'Print-ready PDF'],
    },
    {
      name: 'School Analytics', icon: TrendingUp,
      color: 'bg-[#f4fdd4] border-lime-200 text-lime-700',
      bg: 'bg-[#f4fdd4]',
      reports: ['vs State average', 'vs CBSE national', 'Year-on-year trend', 'Risk student flags'],
    },
  ];

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Report Types</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Every Report, Already Built
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Six categories. 15+ report types. All pulling live data — always up to date, no stale exports.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.name} className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-bold text-neutral-900">{cat.name}</span>
                <button className="ml-auto flex items-center gap-1 text-[9px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-lg hover:bg-neutral-200 transition-colors opacity-0 group-hover:opacity-100">
                  <Download className="w-2.5 h-2.5" strokeWidth={2} /> PDF
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {cat.reports.map(r => (
                  <div key={r} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                    {r}
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

/* ══════════════════════════════════════════════════════
   ROLE VIEWS (interactive tab)
══════════════════════════════════════════════════════ */

type RoleKey = 'admin' | 'teacher' | 'parent' | 'student';

function RoleViews() {
  const [role, setRole] = useState<RoleKey>('admin');

  const roles: Record<RoleKey, {
    label: string; icon: React.ElementType; color: string;
    headline: string; desc: string;
    capabilities: string[]; visual: React.ReactNode;
  }> = {
    admin: {
      label: 'Admin', icon: BarChart3,
      color: 'text-violet-700 bg-violet-50 border-violet-200',
      headline: 'School-Wide Intelligence',
      desc: 'Admins get the full picture — attendance health, fee collection rates, academic standings, and enrollment trends across every class and section.',
      capabilities: ['School-wide attendance summary', 'Fee collection by class', 'Subject performance matrix', 'Enrollment vs dropout', 'CBSE vs state benchmark', 'Ask AI any custom question'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4">
          <div className="text-sm font-semibold text-neutral-900">School This Month</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: 'Attendance', v: '86.4%', c: 'bg-sky-50 text-sky-700' },
              { l: 'Fee Collected', v: '84.5%', c: 'bg-[#f4fdd4] text-lime-700' },
              { l: 'Pass Rate', v: '91.9%', c: 'bg-violet-50 text-violet-700' },
            ].map(m => (
              <div key={m.l} className={`rounded-xl p-3 border border-neutral-100 ${m.c}`}>
                <div className="text-lg font-bold">{m.v}</div>
                <div className="text-[9px] opacity-70 mt-0.5 leading-tight">{m.l}</div>
              </div>
            ))}
          </div>
          {[
            { n: 'Attendance', v: 86, c: 'bg-sky-300' },
            { n: 'Fee Collection', v: 84, c: 'bg-[#A3E635]' },
            { n: 'Academic Pass', v: 92, c: 'bg-violet-300' },
          ].map(b => (
            <div key={b.n}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600">{b.n}</span>
                <span className="text-xs font-semibold text-neutral-700">{b.v}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full">
                <div className={`h-1.5 rounded-full ${b.c}`} style={{ width: `${b.v}%` }} />
              </div>
            </div>
          ))}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.8} />
            <span className="text-[10px] text-red-700">4 students below 75% attendance — needs attention</span>
          </div>
        </div>
      ),
    },
    teacher: {
      label: 'Teacher', icon: BookOpen,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      headline: 'Class-Level Performance',
      desc: 'Teachers see attendance heatmaps and grade distributions scoped to their sections — with improvement recommendations highlighted automatically.',
      capabilities: ['Class attendance heatmap', 'Subject grade distribution', 'Students needing attention', 'Section vs school average', 'Monthly trend', 'Remedial flag list'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-neutral-900">Class 10A — Mathematics Grade Split</div>
          {[
            { g: 'A1 (91–100)', n: 12, c: 'bg-emerald-400' },
            { g: 'A2 (81–90)', n: 15, c: 'bg-[#A3E635]' },
            { g: 'B1 (71–80)', n: 18, c: 'bg-sky-300' },
            { g: 'B2 (61–70)', n: 22, c: 'bg-amber-300' },
            { g: 'C (≤60)', n: 12, c: 'bg-red-300' },
          ].map(g => (
            <div key={g.g} className="flex items-center gap-3">
              <div className="w-20 text-[10px] text-neutral-500 shrink-0">{g.g}</div>
              <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                <div className={`h-2 rounded-full ${g.c}`} style={{ width: `${(g.n / 79) * 100}%` }} />
              </div>
              <div className="text-xs text-neutral-600 w-5">{g.n}</div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="text-[10px] font-semibold text-amber-700">⚠ 12 students in C grade — remedial sessions recommended</div>
          </div>
        </div>
      ),
    },
    parent: {
      label: 'Parent', icon: Users,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      headline: 'My Child\'s Progress',
      desc: "Parents get a clean personal view of their child's attendance, grades, fee status, and class rank — with a downloadable progress report anytime.",
      capabilities: ['Child attendance history', 'Subject marks & grades', 'Fee payment status', 'Class rank', 'Upcoming exams', 'Progress report download'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">AS</div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Aarav Sharma</div>
              <div className="text-xs text-neutral-400">Class 10A · Roll #14</div>
            </div>
            <span className="ml-auto text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: 'Attendance', v: '87%', c: 'bg-sky-50 text-sky-700' },
              { l: 'GPA', v: '9.2', c: 'bg-[#f4fdd4] text-lime-700' },
              { l: 'Class Rank', v: '#3', c: 'bg-violet-50 text-violet-700' },
              { l: 'Fee Due', v: '₹12.5K', c: 'bg-red-50 text-red-700' },
            ].map(m => (
              <div key={m.l} className={`rounded-xl p-3 border border-neutral-100 ${m.c}`}>
                <div className="text-base font-bold">{m.v}</div>
                <div className="text-[9px] opacity-70 mt-0.5">{m.l}</div>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-neutral-900 text-white py-2.5 rounded-xl">
            <Download className="w-3.5 h-3.5" /> Download Progress Report
          </button>
        </div>
      ),
    },
    student: {
      label: 'Student', icon: GraduationCap,
      color: 'text-lime-700 bg-[#f4fdd4] border-lime-200',
      headline: 'My Academic Record',
      desc: 'Students see their own performance clearly — marks, CGPA, attendance, and class rank — with one-tap report card download. No need to visit the office.',
      capabilities: ['Personal report card', 'Subject marks & grades', 'Attendance history', 'Class rank', 'Hall ticket', 'CGPA over sessions'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-neutral-900">My Subjects — Midterm 2024</div>
          {[
            { s: 'Mathematics', m: 92, g: 'A+', gc: 'text-emerald-700 bg-emerald-50' },
            { s: 'Science', m: 78, g: 'B+', gc: 'text-violet-700 bg-violet-50' },
            { s: 'English', m: 85, g: 'A', gc: 'text-sky-700 bg-sky-50' },
            { s: 'Social Studies', m: 70, g: 'B', gc: 'text-amber-700 bg-amber-50' },
            { s: 'Hindi', m: 88, g: 'A', gc: 'text-sky-700 bg-sky-50' },
          ].map(s => (
            <div key={s.s} className="flex items-center gap-3 py-0.5">
              <div className="flex-1 text-xs text-neutral-700">{s.s}</div>
              <div className="flex items-center gap-2 w-28">
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full">
                  <div className="h-1.5 rounded-full bg-[#A3E635]" style={{ width: `${s.m}%` }} />
                </div>
                <span className="text-xs text-neutral-500 tabular-nums">{s.m}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-8 text-center ${s.gc}`}>{s.g}</span>
            </div>
          ))}
          <div className="bg-[#f4fdd4] border border-lime-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
            <div className="text-xs font-semibold text-neutral-800">CGPA: 9.2 · Class Rank: #3</div>
            <button className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 bg-white border border-neutral-200 px-2 py-1 rounded-lg">
              <Download className="w-2.5 h-2.5" /> Report Card
            </button>
          </div>
        </div>
      ),
    },
  };

  const active = roles[role];

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Role-Based Reports</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Everyone Sees What They Need
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            The same data, scoped intelligently per role. Admins see everything. Teachers see their class. Parents see their child. Students see themselves.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-100 rounded-2xl p-1.5 shadow-sm">
            {(['admin', 'teacher', 'parent', 'student'] as RoleKey[]).map(r => {
              const Icon = roles[r].icon;
              return (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${role === r ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                  {r === 'admin' ? 'Admin' : r === 'teacher' ? 'Teacher' : r === 'parent' ? 'Parent' : 'Student'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-5 ${active.color}`}>
              <active.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
              {active.label} View
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-3">{active.headline}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-8">{active.desc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {active.capabilities.map(c => (
                <div key={c} className="flex items-center gap-2.5 bg-[#f8f8f6] border border-neutral-100 rounded-xl px-3.5 py-2.5 hover:bg-white hover:border-neutral-200 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635] shrink-0" />
                  <span className="text-xs font-medium text-neutral-700">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>{active.visual}</div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════ */

function Testimonials() {
  const quotes = [
    { result: 'Monday reports now take 30 seconds', quote: "I used to spend Monday mornings compiling attendance from 14 teachers into one sheet. Now I type the question and it's ready. That's an hour back every single week.", name: 'Kavita Nair', role: 'Principal, St. Anne\'s, Kochi', students: '800' },
    { result: 'Fee collection up 12% in one quarter', quote: 'The fee report showed us Class XI and XII were dragging down our collection rate. We focused on those classes specifically — went from 79% to 91% in one quarter.', name: 'Ramesh Agarwal', role: 'Admin Director, DAV Jaipur', students: '1,200' },
    { result: 'Caught maths problem 3 weeks before finals', quote: 'The subject report flagged 22 students in C grade for Maths. We ran remedial classes before finals. Pass rate went from 84.7% to 93% that year.', name: 'Deepika Sharma', role: 'Academic Head, DPS Vasant Kunj', students: '950' },
  ];

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Success Stories</SectionLabel>
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900">Reports That Changed Real Decisions</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start mb-4">{q.result}</div>
              <p className="text-sm text-neutral-600 leading-relaxed flex-1 mb-5">&quot;{q.quote}&quot;</p>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
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

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */

export default function AIReportsLanding() {
  return (
    <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      <HeroSection />
      <TwoThings />
      <ReportTypes />
      <RoleViews />
      <Testimonials />
    </div>
  );
}