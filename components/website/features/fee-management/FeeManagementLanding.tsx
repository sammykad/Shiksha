'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Zap, Smartphone, BarChart3, CreditCard, Shield,
  FileText, Download, Check, ArrowRight, TrendingUp,
  Clock, CheckCircle2, Star, AlertCircle, Users,
  ChevronRight, LayoutDashboard,
  Mail, MessageCircle, Calendar, Send, CheckCheck,
  MoreVertical, Phone, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/* ═══════════════════ TYPES & DATA ═══════════════════ */

type Channel = 'whatsapp' | 'email' | 'sms';
type TemplateType = 'gentle' | 'overdue' | 'final';

const templates: Record<TemplateType, { label: string; subject: string; content: string; action: string }> = {
  gentle: {
    label: 'Gentle Reminder',
    subject: 'Upcoming Fee Payment',
    content: 'Hi [Parent Name], this is a gentle reminder that the tuition fee for [Student Name] is due on [Date]. We appreciate your timely payment.',
    action: 'View Invoice',
  },
  overdue: {
    label: 'Payment Overdue',
    subject: 'Action Required: Overdue Fees',
    content: 'Dear [Parent Name], we noticed that the fee payment for [Student Name] is past due. Please clear the outstanding amount of ₹12,000 to avoid any late charges.',
    action: 'Pay Now',
  },
  final: {
    label: 'Final Notice',
    subject: 'Final Notice: Fee Payment',
    content: 'Urgent: This is a final notice regarding the pending fees for [Student Name]. Please address this immediately to ensure uninterrupted access to school facilities.',
    action: 'Contact Admin',
  },
};

const channels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: Smartphone },
] as const;

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
              <span className="text-neutral-700 font-medium">Fee Management</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600">Schools lose ₹2–5L annually to late payments</span>
            </div>

            <h1 className="text-5xl md:text-[3.8rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] mb-6">
              Fee Management Software — Stop Chasing, Start Collecting
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              Automate your entire fee collection process. Send WhatsApp reminders, accept UPI payments, and reconcile every rupee — all from one dashboard trusted by 500+ Indian schools.
            </p>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
              {[
                { value: '500+', label: 'Schools' },
                { value: '₹450Cr+', label: 'Collected yearly' },
                { value: '98.5%', label: 'Collection rate' },
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
              {['Live in 24 hours', 'No setup cost', '14-day free trial'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Testimonial social proof */}
            <div className="mt-8 bg-[#f8f8f6] rounded-2xl border border-neutral-100 p-5 max-w-md">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                &ldquo;We reduced our average collection cycle from 45 days to 7 days. Parents love the WhatsApp reminders.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center text-xs font-bold text-lime-800">DPS</div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Principal, Delhi Public School</p>
                  <p className="text-[10px] text-neutral-400">₹45L collected monthly · Pune</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Dashboard mock */}
          <div className="relative">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-[#f8f8f6]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 ml-1">Fee Dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-[#f4fdd4] border border-lime-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Today&apos;s Collections</p>
                      <p className="text-3xl font-bold tracking-tight text-neutral-900">₹3,45,000</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3" /> +18%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3 h-3" /> Updated 2 min ago
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pending', value: '₹8.2L', sub: '142 students', subColor: 'text-amber-600' },
                    { label: 'This Month', value: '₹45.2L', sub: '85% collected', subColor: 'text-emerald-600' },
                    { label: 'Reminders', value: '320', sub: 'Sent today', subColor: 'text-sky-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#f8f8f6] rounded-xl p-3 border border-neutral-100">
                      <p className="text-[10px] text-neutral-400 mb-1">{s.label}</p>
                      <p className="text-base font-bold text-neutral-900">{s.value}</p>
                      <p className={`text-[10px] ${s.subColor} mt-0.5`}>{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#f8f8f6] rounded-xl p-4 border border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">Recent Payment</p>
                    <span className="text-[10px] font-medium text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">Just now</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">Amit Kumar — Grade 10A</p>
                      <p className="text-xs text-neutral-400">UPI Payment</p>
                    </div>
                    <p className="text-base font-bold text-emerald-600">₹12,500</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-500">Monthly target</span>
                    <span className="text-xs font-semibold text-neutral-700">85%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full">
                    <div className="h-2 rounded-full bg-[#A3E635]" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f4fdd4] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-lime-700" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-neutral-900">30%</p>
                <p className="text-[10px] text-neutral-400">Faster collections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ BEFORE / AFTER ═══════════════════ */

function BeforeAfter() {
  const before = [
    '45-day average collection cycle',
    '100+ hours monthly on reconciliation',
    '15–20% revenue leakage annually',
    'Constant parent complaints about receipts',
    'Payment tracking in Excel sheets',
    'Missing follow-ups on late payments',
  ];
  const after = [
    '7-day average collection with auto-reminders',
    '5 minutes for complete reconciliation',
    '98.5% collection rate consistently',
    'Instant digital receipts on WhatsApp',
    'Real-time dashboard & live analytics',
    'Automated WhatsApp payment reminders',
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Before & After</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            The Transformation Schools Experience
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3 h-3 text-red-500" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Without Automation</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-5">Manual Fee Collection</h3>
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
            <h3 className="text-xl font-semibold text-neutral-900 mb-5">Automated Fee System</h3>
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

/* ═══════════════════ FEATURES GRID ═══════════════════ */

function FeaturesGrid() {
  const items = [
    { icon: Bell, title: 'Smart Reminders', desc: 'Auto WhatsApp & SMS before due dates. Parents pay before you even ask.' },
    { icon: Zap, title: 'Instant Reconciliation', desc: 'Auto-match every payment to the right student in real-time.' },
    { icon: Smartphone, title: 'Parent App', desc: 'Parents pay, track history, and download receipts from their phone.' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Collection trends, defaulter lists, and forecasts — always current.' },
    { icon: CreditCard, title: 'All Payment Modes', desc: 'UPI, cards, net banking, and cash — every method in one place.' },
    { icon: Shield, title: 'Bank-Grade Security', desc: 'Encrypted transactions. PCI-DSS compliant. Fully audit-ready.' },
    { icon: FileText, title: 'Custom Fee Structure', desc: 'Tuition, transport, library — flexible categories for every school.' },
    { icon: Download, title: 'One-Click Reports', desc: 'Export to Excel or PDF instantly. No data juggling.' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Everything You Need to<br />Collect Fees Faster
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(f => (
            <div
              key={f.title}
              className="group bg-white rounded-2xl border border-neutral-100 p-5 hover:border-neutral-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center mb-4 group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
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

/* ═══════════════════ FEATURE TABS (merged from FeeManagementFeatureTabs) ═══════════════════ */

function DashboardTabContent() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Today\'s Collections', value: '₹3,45,000', sub: '+18% vs yesterday', subColor: 'text-emerald-600', bg: 'bg-[#f4fdd4] border-lime-200' },
          { label: 'Pending Dues', value: '₹8.2L', sub: '142 students', subColor: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'This Month', value: '₹45.2L', sub: '85% collected', subColor: 'text-emerald-600', bg: 'bg-white border-neutral-100' },
          { label: 'Reminders Sent', value: '320', sub: 'Today via WhatsApp', subColor: 'text-sky-600', bg: 'bg-white border-neutral-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className="text-[10px] text-neutral-400 mb-1 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-xl font-bold text-neutral-900">{s.value}</p>
            <p className={`text-[10px] mt-0.5 font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Collection progress + recent payments */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-xs font-semibold text-neutral-700 mb-4">Monthly Collection Progress</p>
          <div className="space-y-3">
            {[
              { label: 'Tuition Fee', pct: 88, color: 'bg-[#A3E635]' },
              { label: 'Transport Fee', pct: 72, color: 'bg-sky-400' },
              { label: 'Library & Lab', pct: 55, color: 'bg-amber-400' },
            ].map(b => (
              <div key={b.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-neutral-500">{b.label}</span>
                  <span className="text-xs font-semibold text-neutral-700">{b.pct}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full">
                  <div className={`h-2 rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-xs font-semibold text-neutral-700 mb-4">Recent Payments</p>
          <div className="space-y-3">
            {[
              { name: 'Amit Kumar — 10A', amount: '₹12,500', method: 'UPI', time: 'Just now' },
              { name: 'Priya Sharma — 8B', amount: '₹8,200', method: 'Net Banking', time: '12 min ago' },
              { name: 'Rahul Verma — 6C', amount: '₹5,500', method: 'UPI', time: '31 min ago' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-neutral-400">{p.method} · {p.time}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">{p.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecordsTabContent() {
  const students = [
    { name: 'Sanjay Mehta', grade: '9A', total: '₹48,000', paid: '₹48,000', status: 'Paid', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Anika Rao', grade: '7B', total: '₹36,000', paid: '₹24,000', status: 'Partial', statusColor: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Dev Patel', grade: '11C', total: '₹52,000', paid: '₹0', status: 'Overdue', statusColor: 'text-red-600 bg-red-50 border-red-200' },
    { name: 'Riya Singh', grade: '5A', total: '₹28,000', paid: '₹28,000', status: 'Paid', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Kabir Nair', grade: '10B', total: '₹44,000', paid: '₹22,000', status: 'Partial', statusColor: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Fully Paid', value: '358', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Partial Payment', value: '97', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Overdue', value: '45', icon: Users, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg} flex items-center gap-3`}>
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} strokeWidth={1.8} />
            <div>
              <p className="text-lg font-bold text-neutral-900">{s.value}</p>
              <p className="text-[10px] text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-neutral-700">Student Fee Records</p>
          <button className="text-[10px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
        <div className="divide-y divide-neutral-50">
          {students.map(s => (
            <div key={s.name} className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                {s.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                <p className="text-[10px] text-neutral-400">Grade {s.grade}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-neutral-400">Total: {s.total}</p>
                <p className="text-xs font-semibold text-neutral-700">Paid: {s.paid}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.statusColor} shrink-0`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RemindersTabContent() {
  const [channel, setChannel] = React.useState<Channel>('whatsapp');
  const [template, setTemplate] = React.useState<TemplateType>('gentle');

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Controls */}
      <Card className="lg:col-span-5 shadow-sm border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Reminder Workflow</CardTitle>
          <CardDescription>Configure automated notifications for students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Channel</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as Channel)}
              className="grid grid-cols-3 gap-3"
            >
              {channels.map((c) => (
                <div key={c.id}>
                  <RadioGroupItem value={c.id} id={c.id} className="peer sr-only" />
                  <Label
                    htmlFor={c.id}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200',
                    )}
                  >
                    <c.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{c.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Template</Label>
            <RadioGroup
              value={template}
              onValueChange={(v) => setTemplate(v as TemplateType)}
              className="flex flex-col gap-3"
            >
              {Object.entries(templates).map(([key, t]) => (
                <div key={key}>
                  <RadioGroupItem value={key} id={`tmpl-${key}`} className="peer sr-only" />
                  <Label
                    htmlFor={`tmpl-${key}`}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all bg-background"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm leading-none">{t.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{t.subject}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Schedule</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full" variant="default">Send Immediately</Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Calendar className="mr-2 h-4 w-4" /> Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="lg:col-span-7 flex items-center justify-center lg:justify-start">
        <div className="relative w-full max-w-[400px] lg:max-w-none lg:w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={channel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex justify-center"
            >
              {channel === 'whatsapp' && <WhatsAppPreview template={templates[template]} />}
              {channel === 'email' && <EmailPreview template={templates[template]} />}
              {channel === 'sms' && <SMSPreview template={templates[template]} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FeatureTabsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>See It In Action</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Every Tool Your Finance<br />Team Actually Needs
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-base">
            From live dashboards to automated reminders — explore each module below.
          </p>
        </div>

        <Tabs defaultValue="reminders" className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="h-11 bg-neutral-100 p-1 rounded-full gap-1">
              <TabsTrigger value="dashboard" className="rounded-full px-5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="records" className="rounded-full px-5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="w-3.5 h-3.5 mr-2" /> Records
              </TabsTrigger>
              <TabsTrigger value="reminders" className="rounded-full px-5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Bell className="w-3.5 h-3.5 mr-2" /> Reminders
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <DashboardTabContent />
          </TabsContent>

          <TabsContent value="records" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <RecordsTabContent />
          </TabsContent>

          <TabsContent value="reminders" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <RemindersTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

/* ═══════════════════ ROI CALCULATOR ═══════════════════ */

function ROICalculator() {
  const [students, setStudents] = useState(500);
  const [avgFee, setAvgFee] = useState(25000);
  const [lateRate, setLateRate] = useState(25);

  const savings = {
    faster: Math.round((students * avgFee * (lateRate / 100)) * 0.15),
    admin: Math.round(students * 192),
    errors: Math.round(students * avgFee * 0.003),
  };
  const total = savings.faster + savings.admin + savings.errors;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>ROI Calculator</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            See How Much You'll Save
          </h2>
          <p className="text-neutral-500 mt-4">Schools using Shiksha Cloud save an average of ₹2.8L annually</p>
        </div>

        <div className="bg-[#f8f8f6] rounded-3xl border border-neutral-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 border-b md:border-b-0 md:border-r border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900 mb-6">Your School Details</h3>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Number of Students', value: students, set: setStudents, min: 100, max: 5000, step: 50 },
                  { label: 'Average Fee Per Student (₹)', value: avgFee, set: setAvgFee, min: 5000, max: 100000, step: 1000 },
                  { label: 'Current Late Payment Rate (%)', value: lateRate, set: setLateRate, min: 5, max: 60, step: 5 },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-neutral-600">{f.label}</label>
                      <span className="text-xs font-semibold text-neutral-900">
                        {f.label.includes('₹') ? `₹${f.value.toLocaleString()}` : f.label.includes('%') ? `${f.value}%` : f.value.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min} max={f.max} step={f.step}
                      value={f.value}
                      onChange={e => f.set(Number(e.target.value))}
                      className="w-full accent-[#A3E635] h-1.5 rounded-full"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-neutral-400">{f.min.toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-400">{f.max.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-sm font-semibold text-neutral-900 mb-6">Your Annual Savings</h3>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { label: 'Faster collections', value: savings.faster },
                  { label: 'Admin time saved', value: savings.admin },
                  { label: 'Reduced errors', value: savings.errors },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-neutral-200">
                    <span className="text-sm text-neutral-500">{s.label}</span>
                    <span className="text-sm font-semibold text-emerald-600">₹{s.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-bold text-neutral-900">Total Annual Savings</span>
                  <span className="text-2xl font-bold tracking-tight text-neutral-900">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold py-3 rounded-2xl text-sm transition-colors">
                Get Your Custom ROI Report
              </button>
              <p className="text-center text-xs text-neutral-400 mt-3">No spam · Free report · Takes 30 seconds</p>
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
      result: 'Reduced collection time by 65%',
      quote: 'We went from chasing parents for weeks to getting paid within days. The ROI was immediate.',
      name: 'Rajesh Kumar', role: 'Principal, Delhi Public School', students: '1,200',
    },
    {
      result: 'Saved ₹4.2L in the first year',
      quote: 'Our accounts team now focuses on strategy instead of manual data entry. A genuine game changer.',
      name: 'Meera Singh', role: 'Admin Director, St. Xavier\'s', students: '850',
    },
    {
      result: '99% parent satisfaction on fees',
      quote: 'Parents love the convenience. They can pay from anywhere, anytime. Complaints dropped to zero.',
      name: 'Amit Sharma', role: 'Principal, Ryan International', students: '2,000',
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
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start mb-4">
                {q.result}
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">&quot;{q.quote}&quot;</p>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
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

/* ═══════════════════ STATS STRIP ═══════════════════ */

function StatsStrip() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: '500+', label: 'Schools Trust Us' },
          { value: '₹450Cr+', label: 'Collected Annually' },
          { value: '98.5%', label: 'Avg Collection Rate' },
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

/* ═══════════════════ PREVIEW COMPONENTS ═══════════════════ */

function WhatsAppPreview({ template }: { template: (typeof templates)['gentle'] }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border-[8px] border-zinc-900 bg-[#E5DDD5] shadow-2xl h-[580px] w-full max-w-[340px] flex flex-col">
      <div className="bg-[#075E54] text-white pt-8 pb-3 px-4 flex items-center gap-3 z-10 shadow-md">
        <ChevronLeft className="h-6 w-6 -ml-2" />
        <div className="flex items-center gap-3 flex-1">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/30">
            <span className="text-xs font-bold">SC</span>
          </div>
          <div>
            <div className="text-sm font-bold leading-none mb-0.5">shiksha cloud</div>
            <div className="text-[10px] opacity-80 font-medium">Business Account</div>
          </div>
        </div>
        <Phone className="h-5 w-5 opacity-90" />
        <MoreVertical className="h-5 w-5 opacity-90 ml-2" />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-center mb-4 mt-1">
          <span className="bg-[#E1F3FB] text-zinc-600 text-[11px] px-3 py-1 rounded-lg shadow-sm uppercase font-medium tracking-wide">Today</span>
        </div>
        <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%] mb-4">
          <div className="text-sm text-zinc-800">Hello! Welcome to shiksha official support.</div>
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-zinc-400">9:41 AM</span>
          </div>
        </div>
        <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[90%] ml-auto relative mb-2">
          <div className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
            {template.content.replace('[Parent Name]', 'Mr. Sharma').replace('[Student Name]', 'Rahul').replace('[Date]', 'Oct 15th')}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span className="text-[10px] text-zinc-500/80">10:42 AM</span>
            <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg shadow-sm max-w-[90%] ml-auto text-center">
          <div className="text-[#00A884] text-sm font-medium flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" /> {template.action}
          </div>
        </div>
      </div>

      <div className="bg-[#F0F0F0] p-2 px-3 flex items-center gap-2 pb-6">
        <div className="bg-white flex-1 rounded-full h-10 px-4 flex items-center text-zinc-400 text-sm shadow-sm border border-zinc-100">Message</div>
        <div className="h-10 w-10 bg-[#00A884] rounded-full flex items-center justify-center text-white shadow-md">
          <Send className="h-5 w-5 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ template }: { template: (typeof templates)['gentle'] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl h-[580px] w-full max-w-[420px] flex flex-col font-sans mx-auto">
      <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 bg-white h-7 rounded-md border border-zinc-200 mx-2 flex items-center px-3 text-[11px] text-zinc-400 shadow-sm">
          mail.shiksha.cloud
        </div>
      </div>
      <div className="flex-1 p-7 overflow-y-auto">
        <div className="border-b pb-5 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium w-10">To:</span>
            <span className="text-xs font-medium bg-zinc-100 px-2.5 py-1 rounded-full text-zinc-700 border border-zinc-200">Sameer Kad (Parent)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium w-10">Subject:</span>
            <span className="text-sm text-zinc-900 font-semibold">{template.subject}</span>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">SC</div>
            <div>
              <div className="text-sm font-bold text-zinc-900">shiksha cloud</div>
              <div className="text-xs text-zinc-500">admin@shiksha.cloud</div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">{template.label}</h3>
            <p className="text-sm text-zinc-600 leading-7">
              {template.content.replace('[Parent Name]', 'Sameer').replace('[Student Name]', 'Rahul').replace('[Date]', 'Oct 15th')}
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 h-11 px-8 text-sm">
            {template.action}
          </Button>
          <div className="pt-6 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 leading-relaxed text-center">Automated message from shiksha cloud. Do not reply directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SMSPreview({ template }: { template: (typeof templates)['gentle'] }) {
  return (
    <div className="relative overflow-hidden rounded-[40px] border-[8px] border-zinc-900 bg-white shadow-2xl h-[580px] flex flex-col w-full max-w-[340px] mx-auto">
      <div className="bg-[#F5F5F5] h-24 border-b flex flex-col items-center justify-end pb-3 relative pt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-[20px]" />
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 flex items-center justify-center mb-1">
            <span className="text-xs font-bold text-zinc-400">SC</span>
          </div>
          <span className="text-xs font-medium text-zinc-900">shiksha</span>
          <ChevronLeft className="absolute left-4 bottom-3.5 h-6 w-6 text-blue-500" />
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-white">
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-400 font-medium">Today 9:41 AM</span>
        </div>
        <div className="bg-[#E9E9EB] rounded-2xl rounded-tl-sm p-3.5 max-w-[80%] self-start">
          <p className="text-sm text-zinc-900">Hello, this is the shiksha automated system.</p>
        </div>
        <div className="bg-[#007AFF] text-white rounded-2xl rounded-br-sm p-3.5 max-w-[85%] self-end shadow-sm">
          <p className="text-sm leading-relaxed">
            {template.content.replace('[Parent Name]', 'Parent').replace('[Student Name]', 'Your Ward').replace('[Date]', 'tomorrow')}
          </p>
        </div>
        <div className="self-end text-[10px] text-zinc-400 pr-1 font-medium -mt-2">Delivered</div>
        {template.action === 'Pay Now' && (
          <div className="bg-[#E9E9EB] rounded-2xl p-3 max-w-[80%] self-start flex items-center gap-3 border border-zinc-200/50">
            <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm">
              <CreditCard className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900">Secure Payment Link</div>
              <div className="text-[10px] text-zinc-500">shiksha.cloud/pay</div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t bg-[#F5F5F5] flex items-center gap-3 pb-8">
        <div className="flex-1 bg-white border border-zinc-200/60 rounded-full h-9 px-3.5 flex items-center text-sm text-zinc-400">iMessage</div>
        <div className="bg-[#007AFF] rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-sm">
          <ArrowUpIcon className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
    </svg>
  );
}

/* ═══════════════════ MAIN EXPORT ═══════════════════ */

export default function FeeManagementLanding() {
  return (
    <div className="relative z-10">
      <Hero />
      <StatsStrip />
      <BeforeAfter />
      <FeaturesGrid />
      <FeatureTabsSection />
      <ROICalculator />
      <Testimonials />
    </div>
  );
}