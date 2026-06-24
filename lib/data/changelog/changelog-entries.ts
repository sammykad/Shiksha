export type ChangelogCategory = {
  type: "new" | "improvements" | "bugfixes"
  items: string[]
  badges?: string[]
}

import { Sparkles, School, Brain, CreditCard, type LucideIcon } from "lucide-react"

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  icon: LucideIcon
  categories: ChangelogCategory[]
  semver: number[]
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v0.5.0",
    date: "June 23, 2026",
    title: "Teacher Salary & Payout Settings",
    description:
      "Teachers can now manage their bank account details and payout preferences directly from settings. Certificate management improved with title persistence and Cloudinary uploads for all documents.",
    icon: CreditCard,
    semver: [0, 5, 0],
    categories: [
      {
        type: "new",
        items: [
          "Teacher payout settings — bank account, IFSC, UPI, and PAN management",
          "Payout form pre-fills existing data on page load",
          "Certificate titles persist as JSON — no more \"Certificate 1\" placeholders",
          "Admin bank account management API for future teacher payout management page",
        ],
      },
      {
        type: "improvements",
        items: [
          "Profile photo, ID proof, and certificate uploads now use Cloudinary (were blob URLs)",
          "Profile photo preview updates instantly after upload",
          "Contact email in settings is now editable with clarifying description",
          "Account holder name defaults to uppercase for bank compliance",
          "Changelog workflow established — CHANGELOG.md + /changelog page",
        ],
      },
      {
        type: "bugfixes",
        items: [
          "Fixed certificate and ID proof upload crashing (undefined handler functions)",
          "Fixed payout form blank on refresh — loads data server-side",
          "Removed redundant Account tab from teacher settings",
          "PAN number now lives only in TeacherBankAccount (single source of truth)",
        ],
      },
    ],
  },
  {
    version: "v0.4.0",
    date: "June 1, 2026",
    title: "Platform Launch — ID Cards, Certificates & Public Verification",
    description:
      "Major milestone release introducing digital ID cards with QR verification, multilingual certificate generation, and the public verification system. This release completes the core document lifecycle for schools.",
    image: "/images/blogBanner.jpg",
    imageAlt: "Shiksha.cloud Platform Launch",
    icon: Sparkles,
    semver: [0, 4, 0],
    categories: [
      {
        type: "new",
        items: [
          "ID Card Module — Digital ID cards for students & teachers with QR code verification",
          "Certificate Generator — 13+ types (Bonafide, Leaving, Character, Migration) with English + मराठी + Hindi",
          "Public Verification Portal — Verify any certificate or ID card via QR scan",
          "Bulk ID generation for entire sections with one click",
          "Certificate revocation & reissue workflow",
        ],
      },
      {
        type: "improvements",
        items: [
          "FeeSense AI Agent now sends personalized multi-channel reminders",
          "Attendance Analyzer detects absentee patterns and flags at-risk students",
          "Notification engine supports all 5 channels (WhatsApp, SMS, Email, Push, In-App)",
          "Fee receipts include QR code for instant digital verification",
        ],
      },
      {
        type: "bugfixes",
        items: [
          "Fixed fee reconciliation display mismatch in admin dashboard",
          "Resolved hall ticket PDF generation for non-CBSE grade formats",
          "Corrected Marathi font rendering in leaving certificates",
          "Fixed parent multi-child switcher not loading all children",
        ],
      },
    ],
  },
  {
    version: "v0.3.0",
    date: "March 22, 2026",
    title: "AI Agents & Intelligence Layer",
    description:
      "Introduced FeeSense and Attendance AI agents that autonomously analyze data, identify patterns, and send intelligent interventions. The Reports Hub was also launched for consolidated analytics.",
    image: "/images/attendance.png",
    imageAlt: "AI Agents Dashboard",
    icon: Brain,
    semver: [0, 3, 0],
    categories: [
      {
        type: "new",
        items: [
          "FeeSense AI Agent — analyzes overdue fees, payment patterns, and risk levels",
          "Attendance Analyzer AI Agent — detects frequent lates, absentee patterns, intervention needs",
          "AI Monthly Reports — auto-generated PDF reports with trends and insights",
          "Reports Hub — centralized dashboard for attendance, fee, and exam reports",
          "Download reports as PDF or CSV",
        ],
      },
      {
        type: "improvements",
        items: [
          "Fee reminders now use 3 templates per channel (gentle, standard, urgent)",
          "Manual override option for AI-scheduled reminders",
          "Real-time attendance sync with parent WhatsApp alerts",
          "Improved fee payment flow — UPI, card, and netbanking through PhonePe",
        ],
      },
      {
        type: "bugfixes",
        items: [
          "Fixed attendance heatmap date range filter not persisting",
          "Resolved duplicate notification issue for same-day reminders",
          "Corrected fee overdue calculation for partial payments",
        ],
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "January 15, 2026",
    title: "Core School Operations — Fees, Attendance, Exams & CRM",
    description:
      "Shipped the foundational operational modules: comprehensive fee management with online payments, attendance system with real-time parent alerts, exam management with hall tickets, and the lead/ admission CRM.",
    image: "/images/fee-management.png",
    imageAlt: "Fee Management Dashboard",
    icon: CreditCard,
    semver: [0, 2, 0],
    categories: [
      {
        type: "new",
        items: [
          "Fee Management — custom fee categories, assignments, and online payment via PhonePe (UPI/Card/NetBanking)",
          "Offline payment tracking with PDC cheque management",
          "Auto-receipt generation (PDF + WhatsApp) for every payment",
          "Attendance system — one-click digital marking (Present/Absent/Late/Half-day)",
          "Real-time attendance alerts via WhatsApp, SMS, and Email",
          "Attendance calendar heatmap and weekly PDF reports",
          "Exam Management — exam sessions, hall tickets with QR codes, and results/grading",
          "Lead / Admission CRM — 20+ lead sources, 12+ pipeline stages, lead scoring",
          "Anonymous Complaints System with unique tracking ID",
        ],
      },
      {
        type: "improvements",
        items: [
          "Notice Board now supports multi-channel delivery with scheduling and approval workflow",
          "Student profiles include 360-degree dashboard with academic performance tracking",
          "Teacher management with document verification and employment tracking",
        ],
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "November 7, 2025",
    title: "Beta Launch — Student & Teacher Foundations",
    description:
      "Initial beta release establishing the core data infrastructure. Student and teacher management, notice board, leave management, document workflows, and the holiday calendar went live.",
    icon: School,
    semver: [0, 1, 0],
    categories: [
      {
        type: "new",
        items: [
          "Student Management — digital profiles, bulk CSV import, document upload, academic tracking",
          "Teacher Management — profiles, teaching assignments, employment status, document verification",
          "Notice Board — create, schedule, and send notices with attachments",
          "Leave Management — 8 leave types with approval workflow and status timeline",
          "Document Management — upload, verification workflow, and status tracking",
          "Holiday Calendar — single, emergency, and bulk holiday creation",
          "Multi-tenant architecture with complete data isolation per institution",
          "Clerk-based authentication with org-scoped roles (Admin, Teacher, Student, Parent)",
        ],
      },
      {
        type: "improvements",
        items: ["Academic year scoping (April–March) applied to all year-sensitive queries"],
      },
    ],
  },
]
