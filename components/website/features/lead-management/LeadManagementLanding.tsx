'use client';

import { useState } from 'react';
import {
  GraduationCap, ArrowRight, Check, CheckCircle2,
  Users, TrendingUp, BarChart3, Bell, Zap,
  Phone, MessageSquare, Star, Clock, Filter, Search, Target,
  UserPlus, Globe, Activity, RefreshCw,
  Instagram, Facebook, Sparkles,
  MoreHorizontal, CalendarDays,
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

const SRC_ICONS: Record<string, React.ReactNode> = {
  fb: <div className="w-3.5 h-3.5 rounded bg-[#1877F2] flex items-center justify-center shrink-0"><Facebook className="w-2 h-2 text-white" strokeWidth={2.5} /></div>,
  ig: <div className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}><Instagram className="w-2 h-2 text-white" strokeWidth={2.5} /></div>,
  walk: <div className="w-3.5 h-3.5 rounded bg-neutral-300 flex items-center justify-center shrink-0"><Users className="w-2 h-2 text-neutral-600" strokeWidth={2.5} /></div>,
  ref: <div className="w-3.5 h-3.5 rounded bg-lime-300 flex items-center justify-center shrink-0"><UserPlus className="w-2 h-2 text-lime-800" strokeWidth={2.5} /></div>,
  phone: <div className="w-3.5 h-3.5 rounded bg-sky-200 flex items-center justify-center shrink-0"><Phone className="w-2 h-2 text-sky-700" strokeWidth={2.5} /></div>,
};

type Lead = { name: string; grade: string; score: number; src: string; hot?: boolean; time: string };

function LeadCard({ lead }: { lead: Lead }) {
  const sc = lead.score >= 80 ? 'text-emerald-600' : lead.score >= 60 ? 'text-amber-600' : 'text-neutral-400';
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-[9px] font-bold text-neutral-600 shrink-0">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 leading-none">{lead.name}</div>
            <div className="text-[9px] text-neutral-400 mt-0.5">{lead.grade}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {lead.hot && <span className="text-[8px]">🔴</span>}
          <span className={`text-xs font-bold tabular-nums ${sc}`}>{lead.score}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {SRC_ICONS[lead.src]}
          <span className="text-[9px] text-neutral-400">{lead.time}</span>
        </div>
        <MoreHorizontal className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </div>
  );
}

type KanbanCol = { label: string; colBg: string; dot: string; leads: Lead[] };

function Hero() {
  const cols: KanbanCol[] = [
    {
      label: 'New',
      colBg: 'bg-sky-50 border-sky-200',
      dot: 'bg-sky-400',
      leads: [
        { name: 'Arjun Mehta', grade: 'Class 9', score: 88, src: 'fb', hot: true, time: '2m ago' },
        { name: 'Riya Sharma', grade: 'Class 7', score: 54, src: 'walk', time: '1h ago' },
        { name: 'Dev Patel', grade: 'Class 10', score: 71, src: 'ig', time: '3h ago' },
      ],
    },
    {
      label: 'Interested',
      colBg: 'bg-violet-50 border-violet-200',
      dot: 'bg-violet-400',
      leads: [
        { name: 'Sneha Nair', grade: 'Class 6', score: 92, src: 'ref', hot: true, time: 'Today' },
        { name: 'Karan Joshi', grade: 'Class 8', score: 76, src: 'phone', time: 'Today' },
      ],
    },
    {
      label: 'Demo Done',
      colBg: 'bg-amber-50 border-amber-200',
      dot: 'bg-amber-400',
      leads: [
        { name: 'Priya Singh', grade: 'Class 11', score: 95, src: 'fb', hot: true, time: 'Wed' },
        { name: 'Rohit Verma', grade: 'Class 9', score: 83, src: 'ig', time: 'Tue' },
      ],
    },
    {
      label: 'Enrolled ✓',
      colBg: 'bg-[#f4fdd4] border-lime-300',
      dot: 'bg-[#A3E635]',
      leads: [
        { name: 'Anjali K.', grade: 'Class 7', score: 98, src: 'ref', time: 'Mon' },
        { name: 'Vivek Das', grade: 'Class 10', score: 91, src: 'walk', time: 'Mon' },
        { name: 'Meera Iyer', grade: 'Class 6', score: 87, src: 'phone', time: 'Fri' },
      ],
    },
  ];

  return (
    <section className="relative pt-14 pb-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Text copy ── */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-600">Admission CRM built for Indian schools</span>
          </div>

          <h1 className="text-5xl md:text-[4rem] font-semibold tracking-tight text-neutral-900 leading-[1.05] mb-5">
            School Admission CRM — Every Inquiry,
            <span style={{ color: '#7CBF00' }}> Zero Lost Leads.</span>
          </h1>

          <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-xl">
            Capture from walk-ins, phone, referrals — and soon directly from Facebook and Instagram ads. Score every lead 0–100 automatically. Convert the best to students in one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/select-organization" className="flex items-center justify-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
              Book a Free Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium px-7 py-3.5 rounded-full text-sm transition-colors shadow-sm">
              View Pricing
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400">
            {['Auto-scored 0–100', 'Facebook & Instagram soon', '1-click convert to student'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kanban board wrapper — positioned correctly so badges + fade work ── */}
        <div className="relative">

          {/* Floating stat badge — top-right, outside the board shell */}
          <div className="absolute -top-4 right-4 lg:right-8 z-10 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hidden lg:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f4fdd4] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-lime-700" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">42% conversion</div>
              <div className="text-[10px] text-neutral-400">This admission season</div>
            </div>
          </div>

          {/* Floating Meta badge — left side */}
          <div className="absolute top-16 left-0 z-10 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hidden xl:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Facebook className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">Meta Ads</div>
              <div className="text-[10px] text-violet-600 font-semibold">Coming soon</div>
            </div>
          </div>

          {/* Board shell — NO overflow-hidden so badges aren't clipped */}
          <div className="rounded-t-3xl border border-b-0 border-neutral-200 bg-[#efefed] shadow-[0_-8px_40px_rgba(0,0,0,0.08)]">

            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 bg-white/70 backdrop-blur-sm rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                  <Target className="w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                  Admission Pipeline
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-100 rounded-lg px-2.5 py-1">
                  <span className="font-semibold text-neutral-700">10</span> leads · AY 2024–25
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 bg-neutral-100 rounded-lg px-3 py-1.5 text-xs text-neutral-400">
                  <Search className="w-3 h-3" strokeWidth={1.8} />
                  Search leads…
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl transition-colors">
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={2} /> Add Lead
                </button>
              </div>
            </div>

            {/* Columns — overflow-x-auto only here */}
            <div className="overflow-x-auto">
              <div className="flex gap-4 p-5 min-w-max">
                {cols.map(col => (
                  <div key={col.label} className="w-52">
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-3 ${col.colBg}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className="text-xs font-bold text-neutral-700">{col.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">{col.leads.length}</span>
                    </div>
                    {/* Cards — fixed height so all columns same depth, last one taller */}
                    <div className="flex flex-col gap-2.5" style={{ paddingBottom: '6rem' }}>
                      {col.leads.map(lead => <LeadCard key={lead.name} lead={lead} />)}
                      <button className="w-full border border-dashed border-neutral-300 rounded-xl py-2.5 text-[10px] text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 transition-colors">
                        + Add lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade — sits OUTSIDE the board shell, inside this relative wrapper */}
          <div
            className="pointer-events-none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '9rem',
              background: 'linear-gradient(to top, #f8f8f6 0%, #f8f8f6 20%, transparent 100%)',
              zIndex: 5,
            }}
          />
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
          { value: '8', label: 'Lead capture channels' },
          { value: '0–100', label: 'Auto-calculated score' },
          { value: '7 stages', label: 'Admission pipeline stages' },
          { value: '1-click', label: 'Lead → Student conversion' },
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

/* ═══════════════════ META ADS ═══════════════════ */

function MetaAds() {
  const steps = [
    { label: 'Parent sees your Facebook or Instagram ad', icon: Facebook },
    { label: 'Fills built-in lead form — no website redirect', icon: UserPlus },
    { label: 'Shiksha Cloud receives data in under 5 seconds', icon: Zap },
    { label: 'Lead created in pipeline — campaign & ad tagged', icon: Target },
    { label: 'Admission officer notified on WhatsApp instantly', icon: MessageSquare },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-neutral-900 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
          <div className="relative grid lg:grid-cols-2">
            {/* Left */}
            <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 px-3.5 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3 h-3 text-violet-300" strokeWidth={2} />
                <span className="text-xs font-semibold text-violet-300">In Active Development · Coming Soon</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
                Facebook & Instagram Leads — Straight Into Your Pipeline.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Right now you run ads on Meta, check the dashboard the next day, copy names into a sheet, and call families who've already forgotten they filled the form.
              </p>
              <p className="text-white/70 text-sm leading-relaxed mb-10">
                With Meta integration, every lead form submission fires into Shiksha Cloud in real time — tagged with the exact campaign and ad creative. Zero manual entry. Zero cold leads.
              </p>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/30 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-[#1877F2]" strokeWidth={1.8} />
                </div>
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(131,58,180,0.3),rgba(253,29,29,0.3))' }}>
                  <Instagram className="w-5 h-5 text-rose-300" strokeWidth={1.8} />
                </div>
                <span className="text-xs text-white/40 ml-1">Both platforms · Full attribution</span>
              </div>

              <div className="pt-8 border-t border-white/10">
                <button className="flex items-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-6 py-3 rounded-full text-sm transition-colors">
                  Get Notified When Live <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right — flow */}
            <div className="p-10 lg:p-14">
              <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-7">How it will work</div>
              <div className="flex flex-col gap-5">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 group-hover:bg-[#d9f972]/20 group-hover:border-[#d9f972]/30 flex items-center justify-center transition-all duration-300">
                        <s.icon className="w-4 h-4 text-white/50 group-hover:text-[#d9f972] transition-colors" strokeWidth={1.8} />
                      </div>
                      {i < steps.length - 1 && <div className="w-px h-5 bg-white/10 mt-1" />}
                    </div>
                    <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors leading-relaxed pt-2">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Attribution card */}
              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-3">Attribution on every auto-captured lead</div>
                {[
                  { k: 'Campaign', v: 'Admissions 2025 — Summer Push' },
                  { k: 'Ad Set', v: 'Class 9 & 10 Parents — Delhi NCR' },
                  { k: 'Ad', v: 'Video — "A Day at Our School"' },
                  { k: 'Source', v: 'Facebook Lead Ads' },
                ].map(r => (
                  <div key={r.k} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-16 shrink-0">{r.k}</span>
                    <span className="text-[10px] text-white/60 font-medium truncate">{r.v}</span>
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

/* ═══════════════════ LEAD SCORING ═══════════════════ */

function LeadScoring() {
  const signals = [
    { signal: 'Demo class attended', weight: '+25', hot: true, desc: 'Single biggest buying-intent signal' },
    { signal: 'Activity logged', weight: '+15', hot: true, desc: 'Per call, visit, or WhatsApp logged' },
    { signal: 'Replied to outreach', weight: '+10', hot: false, desc: 'Per positive response received' },
    { signal: 'Source: Referral', weight: '+20', hot: false, desc: 'Referred by an existing family' },
    { signal: 'Stage velocity', weight: '+15', hot: false, desc: 'Moving quickly through pipeline' },
    { signal: 'No-response streak', weight: '−10', hot: false, desc: 'Per missed follow-up attempt' },
  ];

  const priorities = [
    { label: 'High', range: '70–100', bg: 'bg-red-50 border-red-200', dot: 'bg-red-400', text: 'text-red-700', action: 'Follow up today' },
    { label: 'Medium', range: '40–69', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', text: 'text-amber-700', action: 'Follow up in 3 days' },
    { label: 'Low', range: '0–39', bg: 'bg-sky-50 border-sky-200', dot: 'bg-sky-400', text: 'text-sky-700', action: 'Weekly nurture' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionLabel>Lead Scoring</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-5">
              The System Scores Every Lead. Your Team Focuses on the Best.
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              Each lead gets a score from 0 to 100 based on engagement, response speed, and source. High-priority leads bubble up automatically — your team always knows who to call first.
            </p>
            <div className="flex flex-col gap-3">
              {priorities.map(p => (
                <div key={p.label} className={`flex items-center gap-4 rounded-2xl border p-4 ${p.bg}`}>
                  <div className="flex items-center gap-2.5 w-24 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                    <span className={`text-sm font-bold ${p.text}`}>{p.label}</span>
                  </div>
                  <div className="text-xs font-mono bg-white/80 border border-white px-2 py-0.5 rounded-lg text-neutral-600 shrink-0">{p.range}</div>
                  <div className={`text-xs opacity-75 flex-1 ${p.text}`}>{p.action}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">What moves the score</div>
            <div className="flex flex-col gap-2.5">
              {signals.map(s => (
                <div key={s.signal} className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 bg-[#f8f8f6] hover:bg-white ${s.hot ? 'border-lime-200 hover:border-[#A3E635]' : 'border-neutral-100 hover:border-neutral-200'}`}>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-neutral-900 mb-0.5">{s.signal}</div>
                    <div className="text-xs text-neutral-400">{s.desc}</div>
                  </div>
                  <div className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-xl border ${s.weight.startsWith('+') ? 'text-emerald-700 bg-[#f4fdd4] border-lime-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                    {s.weight}
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

/* ═══════════════════ ROLE VIEWS ═══════════════════ */

type RoleTab = 'officer' | 'admin';

function RoleViews() {
  const [tab, setTab] = useState<RoleTab>('officer');

  const activities = [
    { type: 'Call', icon: Phone, color: 'bg-sky-50 text-sky-600 border-sky-200', time: 'Today, 10:32 AM', note: 'Spoke with father. Very interested. Asking about transport and hostel. Will discuss internally and call back.' },
    { type: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', time: 'Today, 11:50 AM', note: 'Sent fee structure PDF and brochure. He acknowledged and said will discuss with wife tonight.' },
    { type: 'Demo', icon: GraduationCap, color: 'bg-violet-50 text-violet-600 border-violet-200', time: 'Tomorrow, 9:00 AM', note: 'Demo class confirmed Monday. Will bring wife and child. Requested sports facilities tour.' },
  ];

  const adminMetrics = [
    { value: '51', label: 'Total Leads', sub: 'This season' },
    { value: '4', label: 'Overdue Follow-ups', sub: 'Needs attention' },
    { value: '42%', label: 'Conversion Rate', sub: 'vs 31% last year' },
    { value: '8.3d', label: 'Avg Days to Enroll', sub: 'Down from 14.2' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Role-Based Views</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            The Right View for Every Role
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto leading-relaxed">
            Admission officers live in the timeline. Admins see the full funnel. Both get exactly what they need.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-100 rounded-2xl p-1.5 shadow-sm">
            {[{ id: 'officer' as RoleTab, label: 'Admission Officer' }, { id: 'admin' as RoleTab, label: 'Admin / Principal' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[#d9f972] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'officer' && (
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 bg-[#f8f8f6] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">AM</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900">Arjun Mehta</div>
                  <div className="text-xs text-neutral-400">Class 9 · Facebook Ad · Score <strong className="text-red-500">88</strong></div>
                </div>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> High Priority
                </span>
              </div>
              <div className="p-5">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-4">Activity History</div>
                <div className="relative flex flex-col gap-4">
                  <div className="absolute left-[13px] top-0 bottom-10 w-px bg-neutral-100" />
                  {activities.map((a, i) => (
                    <div key={i} className="flex gap-3.5 items-start">
                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 z-10 ${a.color}`}>
                        <a.icon className="w-3 h-3" strokeWidth={2} />
                      </div>
                      <div className="flex-1 bg-[#f8f8f6] rounded-xl p-3.5 border border-neutral-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-neutral-800">{a.type}</span>
                          <span className="text-[10px] text-neutral-400">{a.time}</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed">{a.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-5 pt-4 border-t border-neutral-100">
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-400">Log a call, visit, or note…</span>
                  </div>
                  <button className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">Log</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-neutral-900">Built for day-to-day admission work</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Every interaction is logged in one place — no forgotten promises, no context lost when staff changes.</p>
              {[
                { icon: Clock, title: 'Follow-up reminders', desc: 'Set a follow-up date on any activity. Overdue ones surface every morning in your queue.' },
                { icon: RefreshCw, title: 'Seamless handoffs', desc: 'New staff opens the record and sees the full history. No calls to the previous officer needed.' },
                { icon: Bell, title: 'Instant notifications', desc: 'Alerted when a new lead arrives, a follow-up is overdue, or a lead moves pipeline stage.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 rounded-2xl p-4 transition-all">
                  <div className="w-8 h-8 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-neutral-700" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 mb-0.5">{f.title}</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'admin' && (
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 bg-[#f8f8f6] flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-900">Pipeline Analytics</div>
                <div className="text-xs text-neutral-400">Season 2024–25</div>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {adminMetrics.map(m => (
                    <div key={m.label} className="bg-[#f8f8f6] rounded-xl p-4 border border-neutral-100">
                      <div className="text-2xl font-bold tracking-tight text-neutral-900">{m.value}</div>
                      <div className="text-xs font-medium text-neutral-700 mt-0.5">{m.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{m.sub}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Lead Source Breakdown</div>
                  {[
                    { src: 'Walk-in', pct: 34, color: 'bg-neutral-300' },
                    { src: 'Referral', pct: 28, color: 'bg-[#A3E635]' },
                    { src: 'Phone Call', pct: 22, color: 'bg-sky-300' },
                    { src: 'Social / Other', pct: 16, color: 'bg-violet-300' },
                  ].map(s => (
                    <div key={s.src} className="mb-2.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-neutral-600">{s.src}</span>
                        <span className="text-xs text-neutral-400">{s.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-neutral-900">Full funnel visibility for leadership</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">See where every lead is, which sources convert best, and where the team needs to focus — without being in every conversation.</p>
              {[
                { icon: BarChart3, title: 'Source attribution', desc: 'Know which channels drive the most leads and, more importantly, which drive the most enrollments.' },
                { icon: Users, title: 'Staff performance', desc: 'Leads assigned, contacted, and converted per admission officer. Spot gaps before the season ends.' },
                { icon: Target, title: 'Funnel drop-off analysis', desc: 'See exactly which stage leads stall at — and address it before too many families are lost.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 bg-[#f8f8f6] hover:bg-white border border-neutral-100 hover:border-neutral-200 rounded-2xl p-4 transition-all">
                  <div className="w-8 h-8 bg-[#f4fdd4] rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-neutral-700" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 mb-0.5">{f.title}</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════ SOURCES ═══════════════════ */

function Sources() {
  const sources = [
    { name: 'Walk-in', icon: Users, bg: 'bg-neutral-50 border-neutral-200 text-neutral-600', status: 'live', desc: 'Manually created at reception when a family visits.' },
    { name: 'Phone Call', icon: Phone, bg: 'bg-sky-50 border-sky-200 text-sky-600', status: 'live', desc: 'Logged during or after an inbound inquiry call.' },
    { name: 'Referral', icon: UserPlus, bg: 'bg-[#f4fdd4] border-lime-200 text-lime-700', status: 'live', desc: 'Referred by an existing parent, student, or staff.' },
    { name: 'School Website', icon: Globe, bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', status: 'live', desc: 'Inquiry form submission on your school website.' },
    { name: 'WhatsApp', icon: MessageSquare, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', status: 'live', desc: 'Manually logged from incoming WhatsApp messages.' },
    { name: 'Facebook Ads', icon: Facebook, bg: 'bg-blue-50 border-blue-200 text-blue-600', status: 'soon', desc: 'Auto-captured from Facebook Lead Ad forms via webhook.' },
    { name: 'Instagram Ads', icon: Instagram, bg: 'bg-rose-50 border-rose-200 text-rose-500', status: 'soon', desc: 'Auto-captured from Instagram Lead Ad forms — campaign tagged.' },
    { name: 'Other', icon: Filter, bg: 'bg-neutral-50 border-neutral-200 text-neutral-500', status: 'live', desc: 'Any channel — tagged manually with a custom label.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Lead Sources</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Every Channel. One Pipeline.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-lg mx-auto">
            Walk-in or Instagram ad — every inquiry lands in the same pipeline, scored and ready for follow-up.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map(s => (
            <div key={s.name} className={`group relative rounded-2xl border bg-[#f8f8f6] p-5 hover:bg-white hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ${s.status === 'soon' ? 'opacity-75 hover:opacity-100' : ''}`}>
              {s.status === 'soon' && (
                <div className="absolute top-3 right-3 text-[8px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Soon</div>
              )}
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${s.bg}`}>
                <s.icon className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{s.name}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ CONVERSION ═══════════════════ */

function Conversion() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel>1-Click Conversion</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] mb-6">
              Inquiry Becomes a Student Record in Under 60 Seconds.
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-10">
              No re-entering names and numbers. No exporting from CRM to student system. One click, a pre-filled form, and the only new info needed is grade and section.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { n: '1', title: 'Family ready to enroll', desc: 'Score is high, demo attended, fees agreed. Click "Convert to Student".' },
                { n: '2', title: 'Form opens pre-filled', desc: 'Name, phone, email, and grade interest pulled from the lead record automatically.' },
                { n: '3', title: 'Confirm grade and section', desc: 'The only new input. Roll number and academic year — done in seconds.' },
                { n: '4', title: 'Student record live instantly', desc: 'Full student profile created. Lead source preserved forever for attribution reporting.' },
              ].map(s => (
                <div key={s.n} className="flex gap-4 items-start group">
                  <div className="w-8 h-8 rounded-full bg-[#d9f972] flex items-center justify-center text-xs font-bold text-neutral-900 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{s.n}</div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 mb-0.5">{s.title}</div>
                    <div className="text-sm text-neutral-500 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lead Record</div>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Negotiating
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">SP</div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Sneha Patel</div>
                  <div className="text-xs text-neutral-400">Class 9 interest · Score <strong className="text-emerald-600">95</strong></div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{ icon: Phone, v: 'Called ×3' }, { icon: MessageSquare, v: 'Demo done' }, { icon: CalendarDays, v: '12 days' }].map(b => (
                  <div key={b.v} className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1">
                    <b.icon className="w-2.5 h-2.5 text-neutral-400" strokeWidth={2} />
                    <span className="text-[9px] text-neutral-500">{b.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button className="flex items-center gap-2 bg-[#d9f972] text-neutral-900 font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm hover:bg-[#cff550] transition-colors">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Convert to Student
              </button>
              <div className="w-px h-4 bg-neutral-200" />
            </div>

            <div className="w-full max-w-sm bg-white rounded-2xl border border-lime-200 p-5 shadow-[0_4px_20px_rgba(163,230,53,0.15)]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold text-lime-700 uppercase tracking-widest">Student Record</div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#f4fdd4] flex items-center justify-center text-sm font-bold text-lime-700">SP</div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Sneha Patel</div>
                  <div className="text-xs text-neutral-400">Class 9A · Roll #24 · AY 2024–25</div>
                </div>
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                <UserPlus className="w-3 h-3" strokeWidth={1.5} />
                Enrolled via Lead · Source: Referral · Attribution retained
              </div>
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
    { result: 'Admissions up 40% first season', quote: 'Before this we tracked leads in a WhatsApp group and a notebook. Families fell through between the first call and admission day. Now nothing slips — we see where every inquiry stands at a glance.', name: 'Anita Verma', role: 'Admission Head, St. Mary\'s, Bangalore', students: '900' },
    { result: 'Contact rate: 60% → 94%', quote: 'The follow-up reminder feature changed everything. We\'d call a family once, get no answer, and forget them. Now overdue follow-ups appear every morning. We\'ve converted leads we\'d have otherwise completely lost.', name: 'Rajan Pillai', role: 'Principal, DPS Kochi', students: '1,200' },
    { result: 'Handoff with zero context calls', quote: 'Our admission officer was on leave mid-season. Her replacement opened the lead record and saw every call, note, and promise. No calls to the previous officer, no confused parents. Completely seamless.', name: 'Suresh Kumar', role: 'Admin Director, Ryan International', students: '1,400' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Success Stories</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Real Admissions. Real Results.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <div key={i} className="bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-6 flex flex-col hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-neutral-200 transition-all duration-300">
              <div className="flex mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
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

export default function LeadManagementPage() {
  return (
    <div className="bg-[#f8f8f6] text-neutral-900 min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      <div className="relative z-10">
        <Hero />
        <StatsStrip />
        <MetaAds />
        <LeadScoring />
        <RoleViews />
        <Sources />
        <Conversion />
        <Testimonials />
      </div>
    </div>
  );
}