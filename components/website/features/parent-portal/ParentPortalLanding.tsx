'use client';

import { useState } from 'react';
import {
  ChevronRight, ArrowRight, Star, CheckCircle2,
  Eye, Bell, MessageSquare, BarChart3,
  Smartphone, Shield, Users, Calendar,
  TrendingUp, Heart, Wallet,
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
  const childRows = [
    { name: 'Aarav Sharma', class: 'Class 10-A', attendance: '96%', fees: 'Paid', exams: '92%' },
    { name: 'Priya Sharma', class: 'Class 7-B', attendance: '88%', fees: 'Due', exams: '85%' },
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
              <span className="text-neutral-700 font-medium">Parent Portal</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="text-xs font-semibold text-teal-600">Real-time visibility into your child&apos;s school life</span>
            </div>

            <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              School Parent Portal — Keep Parents Fully Connected
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              One portal for attendance, fees, exam results, and school announcements. Parents get instant WhatsApp alerts so they never miss an update.
            </p>

            <div className="flex items-center gap-6 mb-8">
              {[
                { value: '95%+', label: 'Parent Adoption' },
                { value: '98%', label: 'WhatsApp Open Rate' },
                { value: '3x', label: 'Faster Fee Collection' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/select-organization"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-7 py-3 rounded-full text-sm transition-colors"
              >
                Book Free Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-7 py-3 rounded-full text-sm transition-colors"
              >
                View Pricing
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-8 text-xs text-neutral-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#A3CD39]" /> Free setup</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#A3CD39]" /> Android & iOS</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#A3CD39]" /> Multi-child support</span>
            </div>
          </div>

          {/* Right — Portal Mock */}
          <div className="relative">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="ml-3 text-xs text-neutral-400">Parent Portal — Shiksha Cloud</span>
              </div>

              <div className="p-5">
                {/* Parent header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Welcome, Mrs. Sharma</p>
                    <p className="text-xs text-neutral-400">2 children linked to your account</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    PS
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                    <div className="text-lg font-bold text-emerald-700">96%</div>
                    <div className="text-[10px] text-emerald-500">Attendance</div>
                  </div>
                  <div className="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                    <div className="text-lg font-bold text-sky-700">Paid</div>
                    <div className="text-[10px] text-sky-500">Fee Status</div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
                    <div className="text-lg font-bold text-violet-700">92%</div>
                    <div className="text-[10px] text-violet-500">Last Exam</div>
                  </div>
                </div>

                {/* Children list */}
                <div className="space-y-2 mb-5">
                  {childRows.map((child) => (
                    <div key={child.name} className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                          {child.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{child.name}</p>
                          <p className="text-[10px] text-neutral-400">{child.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${child.fees === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          Fees: {child.fees}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent notification */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                  <Bell className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">WhatsApp Alert Sent</p>
                    <p className="text-[10px] text-green-600 mt-0.5">&ldquo;Aarav was marked absent today in Class 10-A.&rdquo;</p>
                    <p className="text-[10px] text-green-400 mt-1">Delivered 2 min ago · Opened</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#A3CD39]" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Mobile App + Web</p>
                <p className="text-[10px] text-neutral-400">Android, iOS & Browser</p>
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
  const stats = [
    { value: '500+', label: 'Schools Using Portal' },
    { value: '12L+', label: 'Parents Connected' },
    { value: '98%', label: 'WhatsApp Open Rate' },
    { value: '4.8★', label: 'Parent App Rating' },
  ];

  return (
    <section className="bg-white border-y border-neutral-200">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
        {stats.map((s) => (
          <div key={s.label} className="text-center py-6 px-4">
            <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
            <div className="text-xs text-neutral-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════ FEATURES GRID ═══════════════════ */

function FeaturesGrid() {
  const features = [
    {
      icon: Eye,
      title: 'Live Attendance View',
      description: 'Parents see daily attendance in real-time. Instant WhatsApp alerts when a child is absent or late.',
    },
    {
      icon: Wallet,
      title: 'Fee Status & Payments',
      description: 'View fee breakdown, pay online via UPI, download receipts, and track complete payment history.',
    },
    {
      icon: BarChart3,
      title: 'Exam Results & Report Cards',
      description: 'Access results the moment they\'re published. Detailed report cards with performance trends and graphs.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'WhatsApp, SMS, email, push, and in-app alerts. Parents choose their preferred communication channel.',
    },
    {
      icon: MessageSquare,
      title: 'School Announcements',
      description: 'Receive circulars, event invitations, holiday declarations, and emergency alerts directly.',
    },
    {
      icon: Calendar,
      title: 'Holiday Calendar',
      description: 'View the full academic calendar. Download to Google Calendar, Apple Calendar, or Outlook.',
    },
    {
      icon: Users,
      title: 'Multi-Child Management',
      description: 'Link all children to one account. Switch between profiles and receive notifications for all.',
    },
    {
      icon: Smartphone,
      title: 'Mobile App + Web Access',
      description: 'Available on Android and iOS apps, plus any web browser. No technical knowledge required.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f8f6]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Everything Parents Need</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            One Portal. Complete Visibility.
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Every feature designed to keep parents informed, engaged, and connected to their child&apos;s education.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-4 group-hover:bg-[#d9f972] group-hover:border-[#d9f972] transition-colors duration-300">
                <f.icon className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ BEFORE / AFTER ═══════════════════ */

function BeforeAfter() {
  const without = [
    'Parents call school office for attendance info',
    'Fee receipts lost or never received',
    'Exam results announced on notice board only',
    'Circulars sent on paper — often lost',
    'No visibility into child\'s school life',
    'Frustration and distrust between parents & school',
  ];

  const with_ = [
    'Real-time attendance on phone via app & WhatsApp',
    'Digital receipts for every payment, always accessible',
    'Results published instantly to parent portal',
    'Announcements delivered via 5-channel notifications',
    'Complete visibility: attendance, fees, exams, homework',
    'Trust, transparency, and partnership with the school',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>The Difference</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Before vs After Shiksha Cloud
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Without */}
          <div className="rounded-2xl bg-red-50 border border-red-200 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">✕</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800">Without Parent Portal</h3>
            </div>
            <ul className="space-y-3">
              {without.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <span className="text-sm text-red-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div className="rounded-2xl bg-[#f0f9e8] border border-[#d9f972] p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#d9f972] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-neutral-800" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">With Shiksha Cloud</h3>
            </div>
            <ul className="space-y-3">
              {with_.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A3CD39] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ ROLE-BASED VIEWS ═══════════════════ */

function RoleViews() {
  const [activeRole, setActiveRole] = useState<'parent' | 'teacher' | 'admin'>('parent');

  const roles = {
    parent: {
      label: 'For Parents',
      icon: Heart,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      description: 'Complete visibility into your child\'s school life from your phone.',
      responsibilities: [
        'View daily attendance records and absence alerts',
        'Pay fees online via UPI and download receipts',
        'Access exam results and detailed report cards',
        'Receive school announcements and holiday calendars',
        'Track homework assignments and upcoming events',
      ],
    },
    teacher: {
      label: 'For Teachers',
      icon: Users,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      description: 'Seamless communication with parents without extra effort.',
      responsibilities: [
        'Mark attendance — parent alerts sent automatically',
        'Publish exam results — report cards auto-generated',
        'Send announcements to all parents in one click',
        'Share homework assignments and class updates',
        'Focus on teaching — technology handles the rest',
      ],
    },
    admin: {
      label: 'For School Admin',
      icon: Shield,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      description: 'Boost parent engagement and reduce front-desk queries by 80%.',
      responsibilities: [
        '95%+ parent portal adoption rate within first month',
        'Reduce phone calls about attendance, fees, and results',
        'Broadcast emergency alerts via WhatsApp in seconds',
        'Track which parents have seen critical announcements',
        'Improve school reputation with modern parent communication',
      ],
    },
  };

  const role = roles[activeRole];
  const RoleIcon = role.icon;

  const visualMocks = {
    parent: (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="bg-teal-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">Parent Portal</span>
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-neutral-700">Attendance</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">96%</span>
          </div>
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium text-neutral-700">Fees</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
          </div>
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-medium text-neutral-700">Last Exam</span>
            </div>
            <span className="text-xs font-bold text-violet-600">92%</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-green-700">WhatsApp: &ldquo;Aarav was absent today&rdquo;</span>
          </div>
        </div>
      </div>
    ),
    teacher: (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="bg-violet-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">Teacher Dashboard</span>
          <Users className="w-4 h-4 text-white" />
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-violet-700 mb-1">Attendance Marked</p>
            <p className="text-[10px] text-violet-500">Class 10-A · 38/42 present</p>
            <p className="text-[10px] text-violet-400 mt-1">4 WhatsApp alerts sent to parents</p>
          </div>
          <div className="bg-neutral-50 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700">Results Published</span>
            <span className="text-[10px] text-neutral-400">42 report cards sent</span>
          </div>
          <div className="bg-neutral-50 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-700">Announcement Sent</span>
            <span className="text-[10px] text-neutral-400">98% delivered</span>
          </div>
        </div>
      </div>
    ),
    admin: (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="bg-sky-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">Admin Analytics</span>
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-sky-700">95%</div>
              <div className="text-[10px] text-sky-500">Portal Adoption</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-emerald-700">-80%</div>
              <div className="text-[10px] text-emerald-500">Front-desk Calls</div>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-neutral-600">Parent Engagement</span>
              <span className="text-[10px] font-bold text-neutral-900">92%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-neutral-600">WhatsApp Delivery</span>
              <span className="text-[10px] font-bold text-neutral-900">98%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f8f6]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Works for Everyone</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            Built for Parents, Teachers & Admin
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Every role gets exactly what they need — nothing more, nothing less.
          </p>
        </div>

        {/* Role toggles */}
        <div className="flex justify-center gap-3 mb-10">
          {(['parent', 'teacher', 'admin'] as const).map((roleKey) => {
            const r = roles[roleKey];
            return (
              <button
                key={roleKey}
                onClick={() => setActiveRole(roleKey)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeRole === roleKey
                  ? `${r.color} shadow-sm`
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700'
                  }`}
              >
                <r.icon className="w-4 h-4" />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Active role content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — description + checklist */}
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 ${role.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              {role.label}
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3">{role.description}</h3>
            <ul className="space-y-3 mt-6">
              {role.responsibilities.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#A3CD39] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — visual mock */}
          <div>
            {visualMocks[activeRole]}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */

function Testimonials() {
  const testimonials = [
    {
      stars: 5,
      result: '95% parent engagement',
      quote: 'Earlier parents used to call the school daily for attendance and fee status. Now everything is on their phone. Our front desk queries dropped by 80%.',
      name: 'Sunita Deshmukh',
      role: 'Principal, Pune Public School',
    },
    {
      stars: 5,
      result: '3x faster fee collection',
      quote: 'Parents pay on time now because they get WhatsApp reminders automatically. We collected 92% of fees within the due date last month — a first for our school.',
      name: 'Rajesh Mehta',
      role: 'Admin Head, Delhi Academy',
    },
    {
      stars: 5,
      result: 'Zero paper circulars',
      quote: 'We stopped sending paper circulars entirely. Parents get everything on WhatsApp and the app. Even grandparents can now stay informed about their grandchildren.',
      name: 'Anita Krishnamurthy',
      role: 'Director, Chennai International School',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Trusted by Schools</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            What Schools Say About Parent Portal
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#f8f8f6] rounded-2xl p-7 border border-neutral-100">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="inline-block bg-[#d9f972] text-neutral-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {t.result}
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-400">{t.role}</p>
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

export default function ParentPortalLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <StatsStrip />
      <FeaturesGrid />
      <BeforeAfter />
      <RoleViews />
      <Testimonials />
    </div>
  );
}
