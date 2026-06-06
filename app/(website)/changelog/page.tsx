import Accordion from './badge-accordion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Metadata } from 'next'
import { Sparkles, School, Brain, CreditCard, MessageSquare } from 'lucide-react'
import Container from '@/components/ui/container'
import { cn } from '@/lib/utils'

const appUrl = new URL('https://shiksha.cloud')

export const metadata: Metadata = {
  title: 'Product Updates & Changelog | Shiksha.cloud',
  description: 'Stay updated with the latest features, improvements, and bug fixes in Shiksha Cloud School Management System. We are constantly evolving to serve Indian schools better.',
  keywords: ['shiksha cloud changelog', 'school software updates', 'edtech features', 'product release notes', 'Indian school management system updates'],
  alternates: {
    canonical: `${appUrl.origin}/changelog`,
  },
  openGraph: {
    title: "What's New in Shiksha.cloud | Changelog",
    description: 'Track our latest updates and new feature releases for Indian schools.',
    url: `${appUrl.origin}/changelog`,
    images: [`${appUrl.origin}/og-image.png`],
  },
}

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
    icon: <Sparkles className='size-4' />,
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
    icon: <Brain className='size-4' />,
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
    icon: <CreditCard className='size-4' />,
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
    icon: <School className='size-4' />,
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

const versionColorMap: Record<string, string> = {
  v1: 'bg-emerald-600 dark:bg-emerald-500',
  v0: 'bg-blue-600 dark:bg-blue-500',
}

function getVersionColor(version: string) {
  for (const [prefix, color] of Object.entries(versionColorMap)) {
    if (version.startsWith(prefix)) return color
  }
  return 'bg-primary'
}

function TimelineLine({ version }: { version: string }) {
  return (
    <div className='flex flex-col items-center'>
      <div className={cn('size-3 rounded-full ring-4 ring-background', getVersionColor(version))} />
      <div className='w-px flex-1 bg-border' />
    </div>
  )
}

function EntryCard({
  entry,
  isLatest,
}: {
  entry: ChangelogEntry
  isLatest: boolean
}) {
  return (
    <Container>
      <div id={entry.version} className='relative flex scroll-mt-24 justify-end gap-3 md:gap-5'>
        <div className='sticky top-24 flex w-32 flex-col items-end gap-1.5 self-start pt-0.5 max-md:hidden'>
          <span className='text-muted-foreground text-xs font-medium tabular-nums'>{entry.date}</span>
        </div>

        <div className='flex flex-col items-center'>
          <TimelineLine version={entry.version} />
        </div>

        <div className='flex flex-1 flex-col gap-4 pb-14 pl-1 md:pl-2'>
          <div className='flex items-center gap-1.5 md:hidden'>
            <span className={cn('inline-flex size-2 rounded-full', getVersionColor(entry.version))} />
            <span className='text-muted-foreground text-xs font-medium'>{entry.date}</span>
          </div>

          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2'>
                {entry.icon}
                <span className='text-muted-foreground text-xs font-semibold uppercase tracking-wider'>
                  {entry.version}
                </span>
                {isLatest && (
                  <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider'>
                    Latest
                  </span>
                )}
              </div>
              <h3 className='text-lg font-semibold leading-snug md:text-xl'>{entry.title}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>{entry.description}</p>
            </div>

            {entry.image && (
              <div className='overflow-hidden rounded-lg border'>
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
      </div>
    </Container>
  )
}

export default function ChangeLogPage() {
  return (
    <section>
      <div className='mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24'>
        <Container delay={0}>
          <div className='mb-14 flex flex-col gap-1'>
            <h1 className='font-semibold text-3xl tracking-tight sm:text-4xl md:text-5xl'>
              Changelog
            </h1>
            <p className='text-muted-foreground mt-2 max-w-lg text-balance text-sm leading-relaxed sm:text-base'>
              New features, improvements, and fixes — every update that makes Shiksha.cloud
              better for Indian schools.
            </p>
          </div>
        </Container>

        <div className='flex flex-col'>
          {changelogEntries.map((entry, index) => (
            <EntryCard key={entry.version} entry={entry} isLatest={index === 0} />
          ))}
        </div>

        <Container delay={0.1}>
          <div className='mt-12 rounded-lg border p-6 text-center sm:p-8'>
            <div className='mx-auto flex max-w-sm flex-col items-center gap-1'>
              <MessageSquare className='text-muted-foreground size-5' />
              <h2 className='text-lg font-semibold'>Have feedback?</h2>
              <p className='text-muted-foreground mt-0.5 text-sm'>
                We build Shiksha.cloud for schools like yours. Tell us what you&apos;d
                like to see next.
              </p>
              <div className='mt-4 flex gap-2'>
                <Button asChild variant='outline' size='sm'>
                  <Link href='/contact'>Suggest a Feature</Link>
                </Button>
                <Button asChild size='sm'>
                  <Link href='/pricing'>View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}