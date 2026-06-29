# Changelog

All notable changes to Shiksha.cloud are tracked here.

Format: [Keep a Changelog](https://keepachangelog.com/)
Versioning: [SemVer](https://semver.org/) — `npm version patch|minor|major`

Data source: `lib/data/changelog/changelog-entries.ts`

---

## [Unreleased]

## [0.2.1] — 2026-06-29

### Added
- ID Card Module — digital ID cards for students & teachers with PDF generation and preview
- Transport Management — route management with interactive map, stop location picker
- Holiday Management — bulk CSV import, emergency holiday declaration
- Subscription billing — invoice PDF generation, billing settings UI redesign
- Public changelog page at /changelog with product update history
- Inngest background jobs for automated billing and notification workflows
- Better Auth schema for future auth migration

### Changed
- Migrated from MapLibre to Mapbox GL JS for map components
- Redesigned pricing page with new tiered plan display
- Fee receipt PDF — black-and-white optimized, proper latest payment display
- Student attendance export improvements
- Role-based navigation sidebar updated for new modules

### Fixed
- Fee receipt showing oldest payment instead of latest payment
- Amount in words showing total paid instead of current payment amount
- Unique constraint collision on offline payments without transaction ID
- Receipt PDF now shows proper error message for duplicate transaction refs
- Removed invalid React-PDF CSS properties (textTransform, overflow, etc.)

## [0.5.0] — 2026-06-23

### Added
- Teacher payout settings page — bank account, IFSC, UPI, PAN management
- `TeacherBankAccount` model with upsert save (encrypted account number)
- Certificate titles persist as JSON `[{title, url}]` — no more "Certificate 1" placeholders
- Admin bank account management API for future teacher payout management page

### Changed
- Profile photo, ID proof, and certificate uploads now go to Cloudinary (were using blob URLs)
- Account holder name in payout form defaults to uppercase, CSS `uppercase` display
- `contactEmail` field in teacher settings is now editable with clarifying description
- Employee code label: "Employee Code: 232" (was "#232")
- Account Created date falls back to `teacher.createdAt` when `joinedAt` is null

### Removed
- `panNumber` from `TeacherProfile` model — single source of truth is `TeacherBankAccount.panNumber`
- `getTeacherPayoutAction` — bank data loaded server-side via `getTeacher` instead

### Fixed
- Profile photo avatar now uses `form.watch('profilePhoto')` — updates instantly after upload
- Certificate and ID proof uploads no longer crash (undefined handler functions)
- Payout form pre-fills existing bank data on page load (was blank on refresh)

---

## [0.4.0] — 2026-06-01

### Added
- ID Card Module — Digital ID cards for students & teachers with QR code verification
- Certificate Generator — 13+ types (Bonafide, Leaving, Character, Migration) with English + मराठी + Hindi
- Public Verification Portal — Verify any certificate or ID card via QR scan
- Bulk ID generation for entire sections with one click
- Certificate revocation & reissue workflow

### Changed
- FeeSense AI Agent now sends personalized multi-channel reminders
- Attendance Analyzer detects absentee patterns and flags at-risk students
- Notification engine supports all 5 channels (WhatsApp, SMS, Email, Push, In-App)
- Fee receipts include QR code for instant digital verification

### Fixed
- Fee reconciliation display mismatch in admin dashboard
- Hall ticket PDF generation for non-CBSE grade formats
- Marathi font rendering in leaving certificates
- Parent multi-child switcher not loading all children

---

## [0.3.0] — 2026-03-22

### Added
- FeeSense AI Agent — analyzes overdue fees, payment patterns, and risk levels
- Attendance Analyzer AI Agent — detects frequent lates, absentee patterns, intervention needs
- AI Monthly Reports — auto-generated PDF reports with trends and insights
- Reports Hub — centralized dashboard for attendance, fee, and exam reports
- Download reports as PDF or CSV

### Changed
- Fee reminders now use 3 templates per channel (gentle, standard, urgent)
- Manual override option for AI-scheduled reminders
- Real-time attendance sync with parent WhatsApp alerts
- Improved fee payment flow — UPI, card, and netbanking through PhonePe

### Fixed
- Attendance heatmap date range filter not persisting
- Duplicate notification issue for same-day reminders
- Fee overdue calculation for partial payments

---

## [0.2.0] — 2026-01-15

### Added
- Fee Management — custom fee categories, assignments, and online payment via PhonePe (UPI/Card/NetBanking)
- Offline payment tracking with PDC cheque management
- Auto-receipt generation (PDF + WhatsApp) for every payment
- Attendance system — one-click digital marking (Present/Absent/Late/Half-day)
- Real-time attendance alerts via WhatsApp, SMS, and Email
- Attendance calendar heatmap and weekly PDF reports
- Exam Management — exam sessions, hall tickets with QR codes, and results/grading
- Lead / Admission CRM — 20+ lead sources, 12+ pipeline stages, lead scoring
- Anonymous Complaints System with unique tracking ID

### Changed
- Notice Board now supports multi-channel delivery with scheduling and approval workflow
- Student profiles include 360-degree dashboard with academic performance tracking
- Teacher management with document verification and employment tracking

---

## [0.1.0] — 2025-11-07

### Added
- Student Management — digital profiles, bulk CSV import, document upload, academic tracking
- Teacher Management — profiles, teaching assignments, employment status, document verification
- Notice Board — create, schedule, and send notices with attachments
- Leave Management — 8 leave types with approval workflow and status timeline
- Document Management — upload, verification workflow, and status tracking
- Holiday Calendar — single, emergency, and bulk holiday creation
- Multi-tenant architecture with complete data isolation per institution
- Clerk-based authentication with org-scoped roles (Admin, Teacher, Student, Parent)

### Changed
- Academic year scoping (April–March) applied to all year-sensitive queries
