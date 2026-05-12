'use client';

import { useState } from 'react';
import {
  GraduationCap, ChevronRight, ArrowRight, Star, CheckCircle2,
  Check, Calendar, FileText, Users, QrCode,
  ClipboardCheck, BarChart3, Award, Download, BookOpen,
  Shield, Layers, TrendingUp, Hash, Printer, Eye, RefreshCw,
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
  const sessionRows = [
    { name: 'Midterm 2024', exams: 24, status: 'Completed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Unit Test – Oct', exams: 18, status: 'Active', color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { name: 'Annual Exams 2025', exams: 0, status: 'Upcoming', color: 'text-amber-600 bg-amber-50 border-amber-200' },
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
              <span className="text-neutral-700 font-medium">Exam Management</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span className="text-xs font-semibold text-violet-600">From scheduling to report cards — fully automated</span>
            </div>

            <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              Exam Management Software — Run Your Entire Cycle Paperless
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              Schedule sessions, bulk-create exams, auto-enroll students, generate hall tickets with QR codes, enter marks, and publish report cards — all from one place.
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
              {[
                { value: '100%', label: 'Exam automation' },
                { value: '10×', label: 'Faster result entry' },
                { value: '0', label: 'Manual report cards' },
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
              {['Live in 24 hours', 'CBSE & State board ready', '14-day free trial'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Exam session dashboard mock */}
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
                  <span className="text-xs font-medium text-neutral-500 ml-1">Exam Sessions</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-[#d9f972] text-neutral-800 px-3 py-1.5 rounded-lg">
                  + New Session
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Exams', value: '18', color: 'bg-sky-50 text-sky-700' },
                    { label: 'Hall Tickets', value: '342', color: 'bg-[#f4fdd4] text-lime-700' },
                    { label: 'Results Pending', value: '6', color: 'bg-amber-50 text-amber-700' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-xl p-3 border border-neutral-100`}>
                      <div className="text-xl font-bold tracking-tight">{s.value}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Session table */}
                <div className="bg-[#f8f8f6] rounded-2xl overflow-hidden border border-neutral-100">
                  <div className="flex items-center px-4 py-2.5 border-b border-neutral-200">
                    {['Session', 'Exams', 'Status'].map(h => (
                      <div key={h} className={`${h === 'Session' ? 'flex-1' : 'w-20'} text-[10px] font-semibold tracking-widest text-neutral-400 uppercase`}>{h}</div>
                    ))}
                  </div>
                  {sessionRows.map((row, i) => (
                    <div key={row.name} className={`flex items-center px-4 py-3.5 hover:bg-white transition-colors cursor-pointer ${i < sessionRows.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900">{row.name}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">Academic Year 2024–25</div>
                      </div>
                      <div className="w-20 text-sm text-neutral-600">{row.exams > 0 ? `${row.exams} exams` : '—'}</div>
                      <div className="w-20">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${row.color}`}>{row.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hall ticket preview */}
                <div className="bg-[#f8f8f6] rounded-xl border border-neutral-100 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-neutral-200 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-neutral-900">342 Hall Tickets Ready</div>
                    <div className="text-xs text-neutral-400 mt-0.5">QR codes generated · Bulk PDF export</div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-medium bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
                    <Download className="w-3 h-3" /> Export All
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f4fdd4] flex items-center justify-center">
                <Award className="w-5 h-5 text-lime-700" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-neutral-900">Auto-ranked</p>
                <p className="text-[10px] text-neutral-400">Class & grade ranks</p>
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
          { value: '1,200+', label: 'Schools' },
          { value: '4.2L+', label: 'Exams Conducted' },
          { value: '98%', label: 'On-time Results' },
          { value: '4.9/5', label: 'User Rating' },
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
      icon: Calendar,
      title: 'Create an Exam Session',
      subtitle: 'The parent container',
      desc: 'Admins create a high-level session — "Midterm 2024" or "Annual Exams 2025" — and set the date range and academic year. This becomes the container for all related exams.',
      detail: 'e.g. "Midterm 2024" · Apr 15 – Apr 28 · Year 2024–25',
    },
    {
      number: '02',
      icon: BookOpen,
      title: 'Bulk-Create Exams',
      subtitle: 'One action, every section',
      desc: 'Add a subject exam once and the system auto-generates separate instances for every section. Create "Mathematics – Grade 10" and get exams for 10A, 10B, 10C, 10D in one click.',
      detail: 'Subject · Grade · Section · Venue · Max & Pass Marks',
    },
    {
      number: '03',
      icon: Users,
      title: 'Auto-Enroll Students',
      subtitle: 'Zero manual work',
      desc: 'Every student in the target grade and section is automatically enrolled. For elective subjects or special groups, manual enrollment is available with a simple override.',
      detail: 'Auto-enrollment + manual override for electives',
    },
    {
      number: '04',
      icon: QrCode,
      title: 'Generate Hall Tickets',
      subtitle: 'Bulk PDFs with QR codes',
      desc: 'One click generates professional hall ticket PDFs for all enrolled students. Each includes a secure QR code for entry verification. Students download directly from their dashboard.',
      detail: 'Bulk PDF · QR verification · Student self-download',
    },
    {
      number: '05',
      icon: ClipboardCheck,
      title: 'Mark Exam Attendance',
      subtitle: 'Day-of verification',
      desc: 'Teachers use a dedicated interface to mark each student as Attended or Absent on exam day. Status auto-syncs with the result entry form — absent students are flagged automatically.',
      detail: 'ATTENDED / ABSENT · Auto-syncs to result form',
    },
    {
      number: '06',
      icon: BarChart3,
      title: 'Enter & Publish Results',
      subtitle: 'Draft → Review → Publish',
      desc: 'Teachers enter marks privately in draft mode. Grades are auto-calculated using your configured grading scale (CBSE, state board, or custom). Once reviewed, results go live for students.',
      detail: 'Draft mode · Auto-grading · One-click publish',
    },
    {
      number: '07',
      icon: FileText,
      title: 'Generate Report Cards',
      subtitle: 'The final output',
      desc: 'The system aggregates all subject results, calculates totals, percentages, and CGPA, determines class and grade-level ranks, then generates print-ready consolidated PDFs.',
      detail: 'CGPA · Class rank · Grade rank · Printable PDF',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Exam Lifecycle</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Seven Steps.<br />Fully Automated.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Every step from creating a session to printing report cards is handled inside Shiksha Cloud — no third-party tools, no spreadsheets.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-neutral-200 hidden md:block" />

          <div className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <div key={step.number} className="group flex gap-5 items-start">
                {/* Step number bubble */}
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 group-hover:border-[#A3CD39] group-hover:bg-[#d9f972] flex items-center justify-center transition-all duration-300">
                    <step.icon className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-1 bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl p-5 transition-all duration-300 cursor-default">
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

/* ═══════════════════ ROLE VIEWS ═══════════════════ */

function RoleViews() {
  const [active, setActive] = useState<'admin' | 'teacher' | 'student' | 'parent'>('admin');

  const roles = {
    admin: {
      label: 'Admin',
      icon: Shield,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      responsibilities: ['Create Exam Sessions', 'Configure Grading Scales', 'Monitor Performance', 'Manage Academic Calendar'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Session Dashboard</h4>
            <span className="text-xs text-neutral-400">AY 2024–25</span>
          </div>
          {[
            { name: 'Midterm 2024', progress: 100, status: 'Completed', color: 'bg-emerald-400' },
            { name: 'Unit Test Oct', progress: 72, status: 'Active', color: 'bg-[#A3E635]' },
            { name: 'Annual 2025', progress: 0, status: 'Upcoming', color: 'bg-neutral-200' },
          ].map(s => (
            <div key={s.name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-neutral-700">{s.name}</span>
                <span className="text-xs font-medium text-neutral-500">{s.progress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full">
                <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.progress}%` }} />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
              <div className="text-xl font-bold text-neutral-900">86%</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Avg pass rate</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
              <div className="text-xl font-bold text-neutral-900">1,240</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Students enrolled</div>
            </div>
          </div>
        </div>
      ),
    },
    teacher: {
      label: 'Teacher',
      icon: BookOpen,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      responsibilities: ['Create Subject Exams', 'Mark Exam Attendance', 'Enter Marks & Remarks', 'Review & Publish Results'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-semibold text-neutral-900">Marks Entry — Mathematics 10A</h4>
          <div className="bg-[#f8f8f6] rounded-xl border border-neutral-100 overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-2.5 border-b border-neutral-200 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              <span className="col-span-2">Student</span>
              <span>Marks /100</span>
              <span>Grade</span>
            </div>
            {[
              { name: 'Aarav Sharma', marks: 92, grade: 'A+', gradeColor: 'text-emerald-600 bg-emerald-50' },
              { name: 'Priya Patel', marks: 78, grade: 'B+', gradeColor: 'text-violet-600 bg-violet-50' },
              { name: 'Rohit Verma', marks: 85, grade: 'A', gradeColor: 'text-sky-600 bg-sky-50' },
            ].map(r => (
              <div key={r.name} className="grid grid-cols-4 px-4 py-3 border-b border-neutral-50 items-center hover:bg-white transition-colors">
                <span className="col-span-2 text-xs font-medium text-neutral-800">{r.name}</span>
                <span className="text-sm font-bold text-neutral-900">{r.marks}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${r.gradeColor}`}>{r.grade}</span>
              </div>
            ))}
          </div>
          <button className="w-full bg-[#d9f972] text-neutral-900 font-semibold text-xs py-2.5 rounded-xl hover:bg-[#cff550] transition-colors">
            Publish Results
          </button>
        </div>
      ),
    },
    student: {
      label: 'Student',
      icon: GraduationCap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      responsibilities: ['View Upcoming Exams', 'Download Hall Ticket', 'See Published Results', 'Access Report Card'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">My Exams — Aarav S.</h4>
            <span className="text-xs text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full font-medium">Class 10A</span>
          </div>
          {[
            { subject: 'Mathematics', date: '18 Nov', status: 'download', marks: null },
            { subject: 'Science', date: '20 Nov', status: 'upcoming', marks: null },
            { subject: 'English', date: '15 Nov', status: 'result', marks: 85 },
          ].map(e => (
            <div key={e.subject} className="flex items-center gap-3 p-3 bg-[#f8f8f6] rounded-xl border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-neutral-900">{e.subject}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{e.date}</div>
              </div>
              {e.status === 'download' && (
                <button className="flex items-center gap-1 text-[10px] font-semibold bg-[#d9f972] text-neutral-800 px-2.5 py-1.5 rounded-lg">
                  <Download className="w-3 h-3" /> Hall Ticket
                </button>
              )}
              {e.status === 'upcoming' && (
                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">Upcoming</span>
              )}
              {e.status === 'result' && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">{e.marks}/100</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    parent: {
      label: 'Parent',
      icon: Users,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      responsibilities: ["View Child's Exam Schedule", 'Track Academic Progress', 'Download Report Cards', 'Receive Result Notifications'],
      visual: (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Parent Dashboard</h4>
            <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-medium">Aarav S.</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Avg Score', value: '87%', sub: 'This term' },
              { label: 'Rank', value: '#4', sub: 'Class 10A' },
              { label: 'Exams', value: '6/8', sub: 'Completed' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#f8f8f6] rounded-xl p-3 border border-neutral-100 text-center">
                <div className="text-lg font-bold text-neutral-900">{stat.value}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
          {[
            { subject: 'Mathematics', marks: 92, grade: 'A+', gradeColor: 'text-emerald-600 bg-emerald-50' },
            { subject: 'Science', marks: 85, grade: 'A', gradeColor: 'text-sky-600 bg-sky-50' },
            { subject: 'English', marks: 78, grade: 'B+', gradeColor: 'text-violet-600 bg-violet-50' },
          ].map(r => (
            <div key={r.subject} className="flex items-center gap-3 p-3 bg-[#f8f8f6] rounded-xl border border-neutral-100">
              <div className="flex-1">
                <div className="text-xs font-semibold text-neutral-900">{r.subject}</div>
                <div className="h-1.5 bg-neutral-200 rounded-full mt-2">
                  <div className="h-1.5 rounded-full bg-[#A3E635]" style={{ width: `${r.marks}%` }} />
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.gradeColor}`}>{r.grade}</span>
            </div>
          ))}
          <button className="w-full bg-[#d9f972] text-neutral-900 font-semibold text-xs py-2.5 rounded-xl hover:bg-[#cff550] transition-colors">
            Download Report Card
          </button>
        </div>
      ),
    },
  };

  const activeRole = roles[active];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Role-Based Views</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            The Right View for Every Role
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Admins, teachers, students, and parents each see exactly what they need — a tailored experience built for how they actually work.
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-100 rounded-2xl p-1.5 shadow-sm">
            {(['admin', 'teacher', 'student', 'parent'] as const).map(r => {
              const Icon = roles[r].icon;
              return (
                <button
                  key={r}
                  onClick={() => setActive(r)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${active === r ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
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
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-6 ${activeRole.color}`}>
              <activeRole.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
              {activeRole.label} View
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">
              What the {activeRole.label} Sees & Does
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-8">
              {active === 'admin' && "Administrators have a bird's-eye view of all exam sessions, performance metrics, and grading configurations — enabling strategic oversight without getting lost in detail."}
              {active === 'teacher' && 'Teachers manage the day-to-day: creating exams, marking who attended, entering marks in draft mode, and publishing results when ready — all within a focused, distraction-free interface.'}
              {active === 'student' && 'Students have a clean personal dashboard: upcoming exam schedule, one-tap hall ticket download, published results, and their full academic history — no admin needed.'}
              {active === 'parent' && "Parents stay informed without any friction: a clear view of their child's exam schedule, live progress tracking across subjects, and instant access to report cards — keeping them meaningfully involved in their child's academic journey."}
            </p>
            <div className="flex flex-col gap-3">
              {activeRole.responsibilities.map(r => (
                <div key={r} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div>{activeRole.visual}</div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ FEATURES GRID ═══════════════════ */

function FeaturesGrid() {
  const items = [
    { icon: Calendar, title: 'Exam Sessions', desc: 'Create named containers for each exam period. Group and track all related exams within a single session.' },
    { icon: Layers, title: 'Bulk Exam Creation', desc: 'Set up one exam and auto-generate copies for every section in the grade. Never repeat yourself.' },
    { icon: Users, title: 'Auto-Enrollment', desc: 'Every student in a grade/section is enrolled automatically. Manual override for electives.' },
    { icon: QrCode, title: 'QR Hall Tickets', desc: 'Bulk PDF hall tickets with embedded QR codes for entry verification. Students download from their dashboard.' },
    { icon: ClipboardCheck, title: 'Attendance Marking', desc: 'Day-of interface for teachers. Absent students are auto-flagged in the result form.' },
    { icon: BarChart3, title: 'Dynamic Grading', desc: 'Marks auto-convert to grades using your configured scale — CBSE, state board, or custom.' },
    { icon: Eye, title: 'Draft → Publish', desc: 'Results stay private in draft until admin review. Publish with one click when ready.' },
    { icon: FileText, title: 'Consolidated Report Cards', desc: 'Auto-calculated totals, percentages, CGPA, class rank, and grade rank. Print-ready PDFs.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>All Capabilities</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Every Feature the Exam<br />Lifecycle Demands
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

/* ═══════════════════ REPORT CARD PREVIEW ═══════════════════ */

function ReportCardPreview() {
  const subjects = [
    { name: 'Mathematics', marks: 92, grade: 'A+', gc: 'text-emerald-600 bg-emerald-50' },
    { name: 'Science', marks: 78, grade: 'B+', gc: 'text-violet-600 bg-violet-50' },
    { name: 'English', marks: 85, grade: 'A', gc: 'text-sky-600 bg-sky-50' },
    { name: 'Social Studies', marks: 70, grade: 'B', gc: 'text-amber-600 bg-amber-50' },
    { name: 'Hindi', marks: 88, grade: 'A', gc: 'text-sky-600 bg-sky-50' },
    { name: 'Computer Sc.', marks: 95, grade: 'A+', gc: 'text-emerald-600 bg-emerald-50' },
  ];
  const total = subjects.reduce((a, s) => a + s.marks, 0);
  const pct = ((total / 600) * 100).toFixed(1);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Report card mock */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden">
            {/* Header */}
            <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-1">Shiksha Cloud · Delhi Public School</div>
                <div className="text-white font-semibold text-base">Report Card — Midterm 2024</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#d9f972] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-neutral-800" strokeWidth={2} />
              </div>
            </div>

            {/* Student row */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 bg-[#f8f8f6]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">AS</div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Aarav Sharma</div>
                  <div className="text-xs text-neutral-400">Class 10A · Roll #14</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-neutral-900">{pct}%</div>
                  <div className="text-[10px] text-neutral-400">Percentage</div>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">Rank 3</div>
                  <div className="text-[10px] text-neutral-400">Class rank</div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="p-4">
              {subjects.map((s, i) => (
                <div key={s.name} className={`flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-neutral-50 ${i < subjects.length - 1 ? 'border-b border-neutral-50' : ''}`}>
                  <div className="flex-1 text-sm text-neutral-700">{s.name}</div>
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full">
                      <div className="h-1.5 rounded-full bg-[#A3E635]" style={{ width: `${s.marks}%` }} />
                    </div>
                    <span className="text-xs text-neutral-600 w-6 text-right">{s.marks}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-8 text-center ${s.gc}`}>{s.grade}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mx-4 mb-4 p-3 bg-[#f4fdd4] border border-lime-200 rounded-xl flex items-center justify-between">
              <div className="text-xs font-semibold text-neutral-700">
                Total: {total}/600 · CGPA: 9.2 · Grade Rank: 5
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
                <Printer className="w-3 h-3" /> Print
              </button>
            </div>
          </div>

          {/* Right text */}
          <div>
            <SectionLabel>Report Cards</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              Professional Report Cards — Generated in Seconds
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              Once all subject marks are entered and published, Shiksha Cloud automatically aggregates everything into a consolidated report card. No formulas, no formatting, no manual calculations.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icon: Hash, title: 'Auto Aggregation', desc: 'Total marks, percentage, and CGPA calculated across all subjects in the session automatically.' },
                { icon: TrendingUp, title: 'Automatic Rankings', desc: 'Class and grade-level ranks determined the moment all results are published — no sorting needed.' },
                { icon: Printer, title: 'Print-Ready PDFs', desc: 'Consolidated, professionally formatted PDFs ready to print and distribute on report card day.' },
                { icon: RefreshCw, title: 'CBSE & Custom Scales', desc: 'Grading is configured per your board — CBSE, ICSE, state board, or a fully custom scale.' },
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
      result: 'Exam cycle cut from 3 weeks to 3 days',
      quote: 'We used to spend three weeks on every exam — scheduling, printing hall tickets, entering marks, making report cards. Now the whole thing runs in three days.',
      name: 'Sunita Reddy', role: 'Vice Principal, KV Hyderabad', students: '1,100',
    },
    {
      result: 'Zero hall ticket errors this year',
      quote: 'QR codes on hall tickets mean no manual verification at the gate. No wrong-room issues, no missing students. The exam day is calm now.',
      name: 'P.K. Sharma', role: 'Exam Controller, Ryan International', students: '2,200',
    },
    {
      result: 'Report cards ready same day results publish',
      quote: 'The moment I publish results, report cards generate automatically. Parents used to wait two weeks. Now they get it the same evening.',
      name: 'Anjali Mehta', role: 'Academic Head, DPS Bengaluru', students: '900',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
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

export default function ExamManagementLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <StatsStrip />
      <WorkflowSteps />
      <RoleViews />
      <FeaturesGrid />
      <ReportCardPreview />
      <Testimonials />
    </div>
  );
}