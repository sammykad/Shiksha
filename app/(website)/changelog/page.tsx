'use client'

import Accordion from './badge-accordion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ReactNode, useState, useEffect } from 'react'
import { Sparkles, School, Brain, CreditCard, ChevronDown, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Ripple from '@/components/ui/ripple'

type ChangelogCategory = {
  type: 'new' | 'improvements' | 'bugfixes'
  items: string[]
  badges?: string[]
}

type ChangelogEntry = {
  version: string
  date: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  categories: ChangelogCategory[]
  icon: ReactNode
  accentColor: string
}

const changelogEntries: ChangelogEntry[] = [
  {
    version: 'v1.0.0',
    date: 'June 1, 2026',
    title: 'Platform Launch — ID Cards, Certificates & Public Verification',
    description:
      'Major milestone release introducing digital ID cards with QR verification, multilingual certificate generation, and the public verification system. This release completes the core document lifecycle for schools.',
    image: '/images/blogBanner.jpg',
    imageAlt: 'Shiksha.cloud Platform Launch',
    icon: <Sparkles className='size-5' />,
    accentColor: 'green',
    categories: [
      {
        type: 'new',
        items: [
          'ID Card Module — Digital ID cards for students & teachers with QR code verification',
          'Certificate Generator — 13+ types (Bonafide, Leaving, Character, Migration) with English + मराठी + Hindi',
          'Public Verification Portal — Verify any certificate or ID card via QR scan',
          'Bulk ID generation for entire sections with one click',
          'Certificate revocation & reissue workflow',
        ],
      },
      {
        type: 'improvements',
        items: [
          'FeeSense AI Agent now sends personalized multi-channel reminders',
          'Attendance Analyzer detects absentee patterns and flags at-risk students',
          'Notification engine supports all 5 channels (WhatsApp, SMS, Email, Push, In-App)',
          'Fee receipts include QR code for instant digital verification',
        ],
      },
      {
        type: 'bugfixes',
        items: [
          'Fixed fee reconciliation display mismatch in admin dashboard',
          'Resolved hall ticket PDF generation for non-CBSE grade formats',
          'Corrected Marathi font rendering in leaving certificates',
          'Fixed parent multi-child switcher not loading all children',
        ],
      },
    ],
  },
  {
    version: 'v0.9.0',
    date: 'March 22, 2026',
    title: 'AI Agents & Intelligence Layer',
    description:
      'Introduced FeeSense and Attendance AI agents that autonomously analyze data, identify patterns, and send intelligent interventions. The Reports Hub was also launched for consolidated analytics.',
    image: '/images/attendance.png',
    imageAlt: 'AI Agents Dashboard',
    icon: <Brain className='size-5' />,
    accentColor: 'purple',
    categories: [
      {
        type: 'new',
        items: [
          'FeeSense AI Agent — analyzes overdue fees, payment patterns, and risk levels',
          'Attendance Analyzer AI Agent — detects frequent lates, absentee patterns, intervention needs',
          'AI Monthly Reports — auto-generated PDF reports with trends and insights',
          'Reports Hub — centralized dashboard for attendance, fee, and exam reports',
          'Download reports as PDF or CSV',
        ],
      },
      {
        type: 'improvements',
        items: [
          'Fee reminders now use 3 templates per channel (gentle, standard, urgent)',
          'Manual override option for AI-scheduled reminders',
          'Real-time attendance sync with parent WhatsApp alerts',
          'Improved fee payment flow — UPI, card, and netbanking through PhonePe',
        ],
      },
      {
        type: 'bugfixes',
        items: [
          'Fixed attendance heatmap date range filter not persisting',
          'Resolved duplicate notification issue for same-day reminders',
          'Corrected fee overdue calculation for partial payments',
        ],
      },
    ],
  },
  {
    version: 'v0.8.0',
    date: 'January 15, 2026',
    title: 'Core School Operations — Fees, Attendance, Exams & CRM',
    description:
      'Shipped the foundational operational modules: comprehensive fee management with online payments, attendance system with real-time parent alerts, exam management with hall tickets, and the lead/ admission CRM.',
    image: '/images/fee-management.png',
    imageAlt: 'Fee Management Dashboard',
    icon: <CreditCard className='size-5' />,
    accentColor: 'blue',
    categories: [
      {
        type: 'new',
        items: [
          'Fee Management — custom fee categories, assignments, and online payment via PhonePe (UPI/Card/NetBanking)',
          'Offline payment tracking with PDC cheque management',
          'Auto-receipt generation (PDF + WhatsApp) for every payment',
          'Attendance system — one-click digital marking (Present/Absent/Late/Half-day)',
          'Real-time attendance alerts via WhatsApp, SMS, and Email',
          'Attendance calendar heatmap and weekly PDF reports',
          'Exam Management — exam sessions, hall tickets with QR codes, and results/grading',
          'Lead / Admission CRM — 20+ lead sources, 12+ pipeline stages, lead scoring',
          'Anonymous Complaints System with unique tracking ID',
        ],
      },
      {
        type: 'improvements',
        items: [
          'Notice Board now supports multi-channel delivery with scheduling and approval workflow',
          'Student profiles include 360-degree dashboard with academic performance tracking',
          'Teacher management with document verification and employment tracking',
        ],
      },
    ],
  },
  {
    version: 'v0.7.0',
    date: 'November 7, 2025',
    title: 'Beta Launch — Student & Teacher Foundations',
    description:
      'Initial beta release establishing the core data infrastructure. Student and teacher management, notice board, leave management, document workflows, and the holiday calendar went live.',
    icon: <School className='size-5' />,
    accentColor: 'orange',
    categories: [
      {
        type: 'new',
        items: [
          'Student Management — digital profiles, bulk CSV import, document upload, academic tracking',
          'Teacher Management — profiles, teaching assignments, employment status, document verification',
          'Notice Board — create, schedule, and send notices with attachments',
          'Leave Management — 8 leave types with approval workflow and status timeline',
          'Document Management — upload, verification workflow, and status tracking',
          'Holiday Calendar — single, emergency, and bulk holiday creation',
          'Multi-tenant architecture with complete data isolation per institution',
          'Clerk-based authentication with org-scoped roles (Admin, Teacher, Student, Parent)',
        ],
      },
      {
        type: 'improvements',
        items: ['Academic year scoping (April–March) applied to all year-sensitive queries'],
      },
    ],
  },
]

const accentMap: Record<string, { ring: string; bg: string; text: string; border: string }> = {
  green: {
    ring: 'ring-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
  },
  purple: {
    ring: 'ring-purple-500/30',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  blue: {
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  orange: {
    ring: 'ring-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
  },
}

function VersionNav({
  entries,
  activeVersion,
}: {
  entries: ChangelogEntry[]
  activeVersion: string
}) {
  return (
    <nav className='sticky top-20 z-40 -mx-4 mb-8 overflow-x-auto border-y bg-background/80 px-4 py-3 backdrop-blur-md'>
      <div className='mx-auto flex max-w-4xl items-center gap-2'>
        <span className='text-muted-foreground mr-2 shrink-0 text-xs font-medium'>JUMP TO</span>
        <div className='flex gap-1.5'>
          {entries.map((entry) => {
            const accent = accentMap[entry.accentColor]
            const isActive = activeVersion === entry.version
            return (
              <a
                key={entry.version}
                href={`#${entry.version}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  isActive
                    ? `${accent.bg} ${accent.text} ring-1 ${accent.ring}`
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {entry.icon}
                {entry.version}
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function TimelineDot({ accentColor }: { accentColor: string }) {
  const accent = accentMap[accentColor]
  return (
    <div className='relative flex size-6 items-center justify-center'>
      <span
        className={cn(
          'flex size-4.5 shrink-0 items-center justify-center rounded-full ring-4 ring-background',
          accent.bg,
        )}
      >
        <span className={cn('size-2.5 rounded-full', accent.bg.replace('/10', ''))} />
      </span>
    </div>
  )
}

function EntryCard({
  entry,
  index,
}: {
  entry: ChangelogEntry
  index: number
}) {
  const accent = accentMap[entry.accentColor]
  const isFirst = index === 0

  return (
    <motion.div
      id={entry.version}
      className='relative flex scroll-mt-32 justify-end gap-2'
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className='sticky top-32 flex w-36 flex-col items-end gap-2 self-start pb-4 max-md:hidden'>
        <div className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1', accent.border, accent.bg)}>
          {entry.icon}
          <span className={cn('text-xs font-semibold', accent.text)}>{entry.version}</span>
        </div>
        {isFirst && (
          <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider'>
            Latest
          </span>
        )}
        <div className='text-muted-foreground text-right text-sm'>{entry.date}</div>
      </div>

      <div className='flex flex-col items-center gap-2'>
        <TimelineDot accentColor={entry.accentColor} />
        <span className='w-px flex-1 bg-gradient-to-b from-border to-transparent' />
      </div>

      <div className='flex flex-1 flex-col gap-4 pb-14 pl-3 md:pl-6 lg:pl-9'>
        <div className='flex flex-col gap-2 md:hidden'>
          <div className={cn('inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1', accent.border, accent.bg)}>
            {entry.icon}
            <span className={cn('text-xs font-semibold', accent.text)}>{entry.version}</span>
          </div>
          {isFirst && (
            <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider w-fit'>
              Latest
            </span>
          )}
          <div className='text-muted-foreground text-sm font-medium'>{entry.date}</div>
        </div>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <h3 className='text-xl font-semibold tracking-tight md:text-2xl'>{entry.title}</h3>
            <p className='text-muted-foreground max-w-2xl text-sm leading-relaxed'>
              {entry.description}
            </p>
          </div>

          {entry.image && (
            <div className='relative overflow-hidden rounded-xl border'>
              <Image
                src={entry.image}
                width={1000}
                height={500}
                alt={entry.imageAlt ?? ''}
                className='w-full object-cover'
              />
            </div>
          )}

          <Accordion data={entry.categories} />
        </div>
      </div>
    </motion.div>
  )
}

export default function ChangeLogPage() {
  const [activeVersion, setActiveVersion] = useState(changelogEntries[0].version)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveVersion(entry.target.id)
          }
        }
      },
      { rootMargin: '-200px 0px -60% 0px' },
    )

    const elements = changelogEntries.map((e) => document.getElementById(e.version)).filter(Boolean)
    elements.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-0'>
          <Ripple mainCircleSize={210} numCircles={5} />
        </div>
        <div className='relative mx-auto max-w-4xl px-4 py-20 md:px-8 md:py-28'>
          <div className='flex flex-col items-center text-center'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className='bg-primary/10 text-primary mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium'>
                <Rss className='size-3.5' />
                Product Updates
              </div>
            </motion.div>

            <motion.h1
              className='max-w-3xl font-semibold text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              What&apos;s New in
              <br />
              <span className='bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-green-400'>
                Shiksha.cloud
              </span>
            </motion.h1>

            <motion.p
              className='text-muted-foreground mt-4 max-w-xl text-balance text-base leading-relaxed sm:text-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Every update that makes running your school smoother, smarter, and more
              efficient. Built for India. Continuously evolving.
            </motion.p>

            <motion.div
              className='mt-8 flex items-center gap-2 text-xs text-muted-foreground'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className='flex size-2 items-center justify-center'>
                <span className='size-2 animate-ping rounded-full bg-green-500' />
              </span>
              <span className='size-2 -ml-2 rounded-full bg-green-500' />
              <span>
                Latest release{' '}
                <span className='font-medium text-foreground'>
                  {changelogEntries[0].version}
                </span>{' '}
                — {changelogEntries[0].date}
              </span>
            </motion.div>

            <motion.div
              className='mt-6'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <ChevronDown className='text-muted-foreground size-5 animate-bounce' />
            </motion.div>
          </div>
        </div>
      </section>

      <VersionNav entries={changelogEntries} activeVersion={activeVersion} />

      <section>
        <div className='mx-auto max-w-4xl px-4 pb-20 md:px-8 md:pb-28'>
          <div className='flex flex-col'>
            {changelogEntries.map((entry, index) => (
              <EntryCard key={entry.version} entry={entry} index={index} />
            ))}
          </div>

          <motion.div
            className='mt-12 rounded-2xl border bg-gradient-to-br from-muted/50 to-background p-8 text-center'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='mx-auto flex max-w-md flex-col items-center gap-1'>
              <div className='bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full'>
                <Rss className='size-6' />
              </div>
              <h2 className='text-2xl font-semibold tracking-tight'>
                Stay in the Loop
              </h2>
              <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                Get notified about new features, improvements, and product updates
                delivered straight to your inbox.
              </p>
              <div className='mt-6 flex w-full max-w-sm gap-2'>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                />
                <Button className='shrink-0'>Subscribe</Button>
              </div>
              <p className='text-muted-foreground/60 mt-2 text-xs'>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
