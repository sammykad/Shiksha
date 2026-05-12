'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { CallToAction } from '@/components/website/shared/CallToAction';

type RoleCard = {
  label: string;
  title: string;
  promise: string;
  availability: string;
  accent: string;
  features: string[];
  visual: 'admin' | 'teacher' | 'parent';
  href: string;
  cta: string;
};

const roleCards: RoleCard[] = [
  {
    label: 'For running the institution',
    title: 'Admins',
    promise:
      'Configure the institution, manage records, collect fees, publish notices, resolve complaints, and track every critical workflow from one command center.',
    availability: 'Full control, no per-admin fee',
    accent: 'text-amber-700',
    visual: 'admin',
    href: '/for-admins',
    cta: 'Explore admin workflows',
    features: [
      'Student, teacher, grade, section, subject, and academic year setup',
      'Fee categories, online payment tracking, receipts, reminders, and FeeSense AI',
      'Exam sessions, hall tickets, result publishing, certificates, and analytics',
    ],
  },
  {
    label: 'For everyday classroom work',
    title: 'Teachers',
    promise:
      'Teachers get the tools they use daily without office dependency: attendance, student lists, document verification, notices, results, and leave requests.',
    availability: 'Always free for teachers',
    accent: 'text-sky-700',
    visual: 'teacher',
    href: '/for-teachers',
    cta: 'Explore teacher tools',
    features: [
      'One-click attendance with section summaries and attendance history',
      'Exam setup support, marks entry, hall ticket scanning, and report cards',
      'Student document verification, notice publishing, complaints, and leave tracking',
    ],
  },
  {
    label: 'For staying connected',
    title: 'Parents',
    promise:
      'Parents know what is happening without calling the school: attendance, fees, notices, receipts, complaints, and updates across WhatsApp, SMS, email, and app.',
    availability: 'Always free for parents',
    accent: 'text-emerald-700',
    visual: 'parent',
    href: '/for-parents',
    cta: 'Explore parent portal',
    features: [
      'Child attendance monitoring with real-time absent or late alerts',
      'Online fee payments, instant receipts, dues, history, and reminders',
      'Notices, announcements, multiple children, and anonymous complaint tracking',
    ],
  },
];

const Visual = ({ type }: { type: RoleCard['visual'] }) => {
  if (type === 'admin') {
    return (
      <div className="relative h-52 overflow-hidden border-t border-neutral-200 bg-[linear-gradient(#e7e1d8_1px,transparent_1px),linear-gradient(90deg,#e7e1d8_1px,transparent_1px)] bg-[size:22px_22px]">
        <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
          <path
            d="M58 150 C110 104 145 120 184 82 C224 44 264 54 314 28"
            fill="none"
            stroke="#f1d5a3"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-500 group-hover/card:stroke-[#d97706]"
          />
          <circle cx="314" cy="28" r="5" fill="#d97706" className="origin-center transition-transform duration-500 group-hover/card:scale-125" />
        </svg>
        <div className="absolute left-8 top-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_rgba(41,37,31,0.12)] transition-transform duration-500 group-hover/card:-translate-y-2">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-amber-700" />
            <span className="text-xs font-semibold text-neutral-800">Collection Health</span>
          </div>
          <div className="flex items-end gap-2">
            {[44, 58, 72, 46, 86, 66, 78].map((height, index) => (
              <span
                key={index}
                className="w-5 rounded-t bg-amber-600/75"
                style={{ height }}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-7 right-7 w-52 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_rgba(41,37,31,0.12)] transition-transform duration-500 group-hover/card:translate-x-1 group-hover/card:-translate-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Pending dues</span>
            <span className="text-amber-700">12%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-neutral-100">
            <div className="h-2 w-[88%] rounded-full bg-amber-600" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600">
            <Bell className="size-3.5 text-amber-700" />
            Auto reminders scheduled
          </div>
        </div>
      </div>
    );
  }

  if (type === 'teacher') {
    return (
      <div className="relative h-52 overflow-hidden border-t border-neutral-200 bg-[radial-gradient(circle_at_1px_1px,#d6dde8_1px,transparent_0)] bg-[size:20px_20px]">
        <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
          <path
            d="M118 154 C158 132 166 104 206 92 C244 80 264 102 300 74"
            fill="none"
            stroke="#d9ecf7"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-500 group-hover/card:stroke-[#38bdf8]"
          />
          <path d="M292 74 L304 74 L300 86" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute left-7 top-8 w-60 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_rgba(28,42,55,0.12)] transition-transform duration-500 group-hover/card:-translate-y-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800">Class 8-A</span>
            <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700">Live</span>
          </div>
          {[
            ['Present', '42', 'bg-sky-600'],
            ['Late', '03', 'bg-cyan-500'],
            ['Absent', '02', 'bg-neutral-400'],
          ].map(([label, value, color]) => (
            <div key={label} className="mb-3 flex items-center gap-3">
              <span className={`size-2.5 rounded-full ${color}`} />
              <span className="flex-1 text-xs text-neutral-600">{label}</span>
              <span className="font-mono text-sm font-semibold text-neutral-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-7 right-7 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_20px_60px_rgba(28,42,55,0.12)] transition-transform duration-500 group-hover/card:translate-x-1 group-hover/card:-translate-y-1">
          <ScanLine className="size-5 text-sky-700" />
          <span className="text-sm font-semibold text-neutral-800">Hall ticket verified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-52 overflow-hidden border-t border-neutral-200 bg-[linear-gradient(135deg,#f8faf7_25%,transparent_25%),linear-gradient(225deg,#f8faf7_25%,transparent_25%),linear-gradient(45deg,#f8faf7_25%,transparent_25%),linear-gradient(315deg,#f8faf7_25%,#ffffff_25%)] bg-[size:24px_24px]">
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
        <path
          d="M70 142 C112 98 166 116 206 88 C246 60 274 68 318 44"
          fill="none"
          stroke="#d7f0dc"
          strokeWidth="8"
          strokeLinecap="round"
          className="transition-all duration-500 group-hover/card:stroke-[#34d399]"
        />
        <circle cx="318" cy="44" r="5" fill="#10b981" className="origin-center transition-transform duration-500 group-hover/card:scale-125" />
      </svg>
      <div className="absolute left-8 top-7 w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_rgba(26,55,43,0.12)] transition-transform duration-500 group-hover/card:-translate-y-2">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-800">Rahul Kad</span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Paid</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-neutral-50 p-3">
            <CalendarDays className="mb-2 size-4 text-emerald-700" />
            <p className="text-[10px] text-neutral-500">Attendance</p>
            <p className="text-sm font-semibold text-neutral-900">96%</p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <ReceiptText className="mb-2 size-4 text-emerald-700" />
            <p className="text-[10px] text-neutral-500">Receipt</p>
            <p className="text-sm font-semibold text-neutral-900">Ready</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-7 right-6 w-56 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_20px_60px_rgba(26,55,43,0.12)] transition-transform duration-500 group-hover/card:translate-x-1 group-hover/card:-translate-y-1">
        <p className="text-xs font-semibold text-neutral-800">WhatsApp alert</p>
        <p className="mt-1 text-xs leading-5 text-neutral-600">Fee receipt delivered instantly.</p>
      </div>
    </div>
  );
};

const roleIcons = {
  Admins: ShieldCheck,
  Teachers: BookOpenCheck,
  Parents: UsersRound,
};

export default function FeaturesOverview() {
  return (
    <main className="px-4 py-16 text-neutral-950 md:py-24">
      <section className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mx-auto mb-5 w-fit rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 shadow-sm">
            Built for every school stakeholder
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-normal text-neutral-950 md:text-6xl">
            Shiksha.cloud for admins, teachers, and parents
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-8 text-neutral-600">
            One cloud platform, three focused experiences. Each role gets the workflows they need without extra per-user billing or complex training.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-14 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_24px_90px_rgba(38,35,30,0.08)]"
        >
          <div className="grid lg:grid-cols-3">
            {roleCards.map((role, index) => {
              const Icon = roleIcons[role.title as keyof typeof roleIcons];

              return (
                <Link
                  key={role.title}
                  href={role.href}
                  className={`group/card flex min-h-[620px] flex-col transition hover:bg-neutral-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${index > 0 ? 'border-t border-neutral-200 lg:border-l lg:border-t-0' : ''}`}
                >
                  <div className="flex flex-1 flex-col p-8 md:p-9">
                    <span className="w-fit rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800">
                      {role.label}
                    </span>

                    <div className="mt-7 flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                        <Icon className={`size-5 ${role.accent}`} />
                      </span>
                      <h2 className="text-2xl font-semibold text-neutral-950">{role.title}</h2>
                    </div>

                    <p className="mt-4 text-[15px] leading-7 text-neutral-700">
                      {role.promise}
                    </p>

                    <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-950">
                      <CheckCircle2 className={`size-4 ${role.accent}`} />
                      {role.availability}
                    </p>

                    <span className="mt-5 inline-flex w-fit items-center text-sm font-semibold text-neutral-950">
                      {role.cta}
                      <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover/card:translate-x-1" />
                    </span>

                    <ul className="mt-6 space-y-4">
                      {role.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm leading-6 text-neutral-700">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-neutral-950" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Visual type={role.visual} />
                </Link>
              );
            })}
          </div>
        </motion.div>

        <CallToAction
          className="mt-16"
          heading="See Shiksha.cloud in Action"
          description="A focused walkthrough for admins, teachers, and parents — built around the workflows your institution actually uses."
          primaryLabel="Book Free Demo"
          primaryHref="/contact"
          secondaryLabel="View Pricing"
          secondaryHref="/pricing"
        />
      </section>
    </main>
  );
}
