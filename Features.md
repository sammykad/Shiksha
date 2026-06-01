# Shiksha.cloud — Everything You Can Do

The complete platform for Indian schools, coaching classes, colleges, and education groups.
Built on: **Next.js 15** · **TypeScript** · **PostgreSQL** · **Prisma** · **shadcn/ui**

---

## Why Shiksha.cloud? (What No Competitor Has)

### 1. Own Notification Engine
We built our own multi-channel notification infrastructure from scratch — not a third-party API bolted on. **5 channels** (Email/SMS/WhatsApp/Push/In-App), **30+ templates**, idempotency, cost tracking, wallet, retry logic, scheduled jobs.  
**Fedena, Edunext, CampusCare, MyClassboard**: All rely on third-party gateways. None have a unified engine.

### 2. AI Agents That Work While You Sleep
**FeeSense AI Agent** analyzes every student's payment pattern, predicts risk, and auto-sends personalized reminders on the right channel. **Attendance Analyzer AI Agent** detects chronic absence and alerts parents before it becomes a problem.  
**Fedena, Edunext, CampusCare, Classe365**: Zero AI in core product. All reminders are manual or rule-based.

### 3. All Features, One Price — Zero Feature Gates
Every subscriber gets every module. No "this is Premium-only." No "WhatsApp is an add-on." No "AI reports need Enterprise." **One subscription, everything unlocked.**  
**Every competitor** gates features behind paid tiers (Fedena: Free/Pro/Premium/Enterprise. CampusCare: 4 tiers. MyClassboard: Bronze/Silver/Gold/Platinum).

### 4. India-First, Not India-Ported
Built from day one for Indian institutions. PhonePe payments. WhatsApp-first communication. Hindi/Marathi certificates. POCSO-compliant complaints. CBSE grading. Custom terminology for schools, colleges, coaching.  
**Global products** (Classe365, Teachmint) localize; we were born Indian.

### 5. Public Verification Infrastructure
Every certificate and ID card comes with a **QR code and public verification URL**. Anyone can scan and verify authenticity — no login, no app, no charge.  
**No school ERP in India offers this.** Only government boards (CBSE, DigiLocker) do.

### 6. Complete Platform — Replaces 4-5 Softwares
Most schools use separate tools for ERP + SMS + WhatsApp + certificates + ID cards. Shiksha.cloud replaces **all of them** with one login, one database, one price.  
**Net saving: 40–60%** compared to running multiple softwares.

### 7. Free Parents & Teachers
Competitors charge per user — every teacher login, every parent login costs extra. **We charge only for students.** Parents, teachers, and admins are always free.  
**A school with 200 students + 30 teachers + 400 parents** saves thousands every month.

### 8. Role-Specific Portals, One Unified Organization
Admin, Teacher, Student, and Parent — each role gets its own tailored portal with exactly what they need. No clutter, no confusion. But every portal pulls from **the same organization database**. Teacher marks attendance → parent sees it instantly. Admin updates fee → student pays online. Principal publishes notice → everyone gets it.  
**Competitors** often have separate apps or logins for different roles that don't sync in real time. Here, **one organization, one truth, four views.**

### 9. Multi-Organization Super Admin — One Login, All Schools
Own one school and two coaching classes? You don't need three separate logins, three separate dashboards, or three Excel sheets. **One login. One platform. All your organizations.**  
See each organization's data segregated — or switch to **Super Admin view** for aggregated insights across all your institutions. Compare attendance, fee collection, and admissions across branches from a single screen.  
**Competitors** treat each organization as a separate tenant with separate logins. We give you **one command center for your entire education group.**

### 10. Future Core Modules Are Free — Buy Today, Get Tomorrow's features Free
If you subscribe today at ₹X and we launch Timetable, Assignments, Salary, Voice Assistant, or any other core module next month or next year — **you get it at no extra cost.**  
Your subscription price is locked. Every future core module developed is automatically included. No upgrade fees. No "you need to move to a new plan" surprises.  
**Competitors** charge for every new module as an add-on or force you to upgrade to a higher tier. We believe **the longer you stay, the more valuable your subscription becomes.**

### 11. We Set It Up — So You Don't Have To
We don't just give you software and walk away. Our team handles the full migration — import your student data, set up fee structures, configure attendance workflows, connect PhonePe, and test notification delivery. Need parents and teachers onboarded? We send invitations on your behalf, help them log in, and answer their questions. You focus on running your institution; **we make sure the platform runs for everyone — admins, teachers, students, and parents.**  
**Competitors** provide self-serve tools and documentation. We provide people who do the work for you — migration, setup, training, and ongoing support across every role.

---

## 1. Student Management

**Models:** `Student`, `ParentStudent`, `StudentDocument`, `StudentAttendance`

- Create student profiles with full details (name, DOB, blood group, address, caste, emergency contacts, parents)
- Edit student profiles with role-aware access (admin edits all, student edits own)
- Bulk import students from CSV (30+ fields including parent linking)
- Search, filter, and paginate students by grade, section, name, roll number
- View 360° student dashboard: attendance calendar, fee history, exam results, documents, performance radar
- Track student status lifecycle (Active → Transferred / Dropped / Graduated)
- Assign roll numbers unique per organization
- Link multiple parents per student with relationship tagging
- Convert leads directly into student records with full audit trail
- Upload and manage student documents (Aadhaar, TC, Birth Certificate, mark sheets)
- Generate digital ID cards for every student with QR verification
- View academic performance charts and subject-wise radar
- Self-service profile editing for students

---

## 2. Fee Management

**Models:** `FeeCategory`, `Fee`, `FeePayment`, `ChequeDetail`

- Create fee categories (Tuition, Transport, Library, Lab, etc.) per academic year
- Assign fees to individual students or bulk-assign to entire grades/sections
- Accept online payments via PhonePe (UPI, Credit/Debit Card, Net Banking, Wallet)
- Record offline payments (Cash, Cheque, DD) with receipt generation
- Track Post-Dated Cheques (PDC): entry, status, IFSC/MICR validation, resolution
- Resolve PDC cheques: Cleared / Bounced / Cancelled with notification
- Generate professional PDF fee receipts with organization branding
- Auto-deliver receipts via Email, SMS, and WhatsApp
- Fee breakdown UI before Pay Now (base amount + PG fee + total)
- Fee reminders: manual (pre-built templates) and automated (AI FeeSense agent)
- Discounts, waivers, and scholarships (planned)
- Late fee automation with 3 reminder templates and scheduled Inngest jobs
- Monthly fee collection charts and category distribution analytics
- Fee reconciliation against PhonePe settlement CSVs
- Wallet balance tracking for notification usage
- Parent portal: view fees, pay online, download receipts
- Student portal: view fee breakdown and payment history
- Teacher portal: view assigned students' fee status and send reminders

---

## 3. Attendance Management

**Models:** `StudentAttendance`, `AcademicCalendar`

- Mark daily attendance with 2-tap bulk upsert (Present / Absent / Late / Half-Day)
- Holiday and weekend guard (prevents marking on off days)
- AI-powered attendance suggestions via Google Gemini analysis
- Section-wise attendance summaries with completion tracking
- Attendance calendar view (student and parent)
- Attendance table with filters: search, section, grade, status, date range
- Ring chart, heatmap, and skyline visualization
- Attendance stats cards: percentage, streak, monthly/annual/overall
- Weekly attendance PDF report (auto-generated every Friday 6PM IST)
- Parent child-attendance monitoring with monthly breakdown
- Student self-service attendance tracking with target calculation (85%)
- QR scanner attendance option
- Absent/Late notifications to parents (SMS, WhatsApp, Email, Push)
- Attendance completion alerts per section

---

## 4. Exam Management

**Models:** `ExamSession`, `Exam`, `ExamEnrollment`, `ExamResult`, `GradingScale`, `GradeBand`, `ReportCard`, `HallTicket`

- Create exam sessions (Midterms, Finals, Unit Tests) as containers
- Create individual exams per subject, grade, section, venue, date
- AI-powered bulk exam creation from natural language prompts
- Auto-enroll all students in a grade/section, or manually enroll for electives
- Enroll students individually or in bulk
- Generate hall tickets as PDF with QR codes for verification
- Issue hall tickets per exam or per session
- Enter exam marks in draft mode (not visible to students)
- Automatic grade calculation: percentage, grade label, CGPA, pass/fail
- Configure grading scales with custom grade bands (A1, B2, etc.), pass thresholds, rounding rules
- Grading scale hierarchy: exam-level > session-level > org-default
- Publish results with one click
- Generate report cards with totals, percentages, CGPA, class ranks, attendance
- Exam reminders: 7-day advance email notifications
- Exam enrollment notifications to students

---

## 5. Lead Management / CRM

**Models:** `Lead`, `LeadActivity`, `LeadCommunicationPreference`, `MetaIntegration`

- Capture leads from 20+ sources: Website, Facebook, Instagram, Walk-in, Phone, Referral, WhatsApp, Google, Email, etc.
- Create leads with full details: student name, parent name, phone, email, enquiry for, current school, budget
- Lead scoring (0–100) based on engagement, response rate, stage velocity
- Track every interaction: Calls, WhatsApp, Emails, School Visits, Demo Classes, Notes
- Full pipeline management: NEW → CONTACTED → INTERESTED → DEMO SCHEDULED → NEGOTIATING → ENROLLED
- Priority levels: Low, Medium, High, Urgent, VIP
- Assign leads to staff members with follow-up dates
- Convert lead to student in 1-click (pre-fills student form, audit trail preserved)
- Facebook/Instagram Lead Ads integration — auto-create leads from Meta forms
- Lead analytics dashboard: totals, conversion rates, source breakdown, recent activity
- Lead export to CSV (coming soon)
- Kanban board view (coming soon)

---

## 6. Teacher & Staff Management

**Models:** `Teacher`, `TeacherProfile`, `TeachingAssignment`

- Add and manage teacher profiles with employee codes
- Track employment status: Active, On Leave, Resigned, Retired, Terminated, Contractual, Probation, Suspended
- Store qualifications, experience, specialized subjects, languages, certifications
- Assign teachers to subjects, grades, and sections
- Primary and co-teacher roles with period/load tracking
- Subject specialization validation against teacher qualifications
- Duplicate assignment detection
- Teacher dashboard: assigned classes, teaching load, recent activities
- Generate ID cards for teachers with QR verification
- Teacher leave management (apply, approve, reject)
- Staff directory with search and filters

---

## 7. Grade & Class Management

**Models:** `Grade`, `Section`

- Create and manage grades/classes (naming conventions per org type)
- Add sections within grades (A, B, C, etc.)
- Assign class teachers to sections
- View student count per grade and section
- Delete grades/sections with cascade warnings
- Grade/section deletion with cascade confirms (shows affected students, attendance)

---

## 8. Subject Management

**Models:** `Subject`

- Create subjects with unique codes per organization
- Mark subjects as elective or compulsory
- Set subject descriptions
- Assign teachers to subjects via teaching assignments
- Import/export subjects via CSV

---

## 9. Communication & Notice Board

**Models:** `Notice`, `NoticeAttachment`

- Create notices with title, content, summary, dates, attachments
- Schedule notices for future publishing
- Target specific audiences: by role (Student/Parent/Teacher), grade, section
- Notice types: General, Trip, Event, Exam, Holiday, Deadline, Timetable, Result
- Priority levels: Low, Medium, High, Urgent
- Pin important notices to top
- Approval workflow: Draft → Pending Review → Published
- Attach files: PDFs, images (Cloudinary storage with cleanup on delete)
- Multi-channel broadcast on publish: Email, SMS, WhatsApp, Push
- Role-based notice visibility (Admin sees all, others see targeted only)

---

## 10. Notification Engine (Own Infrastructure)

**Models:** `Notification`, `NotificationLog`, `NotificationSetting`, `DeviceToken`, `ScheduledJob`

### Channels
- **Email** — Transactional via Resend
- **SMS** — Gateway integrated
- **WhatsApp** — Meta Business API with template messaging and fallback mode
- **Push** — Firebase Cloud Messaging (FCM) with device token management
- **In-App** — Bell notifications with read/dismiss tracking

### Capabilities
- 30+ notification templates for every domain: Attendance, Fees, Payments, Leave, Documents, Certificates, Exams, Holidays, Notices
- Channel-specific template bodies per type (SMS vs Email vs WhatsApp vs Push)
- Scheduled background jobs via Inngest for reminders and alerts
- Idempotency keys prevent duplicate sends
- Cost tracking per notification unit
- Wallet balance deduction for paid channels (SMS, WhatsApp)
- Per-organization notification settings (enable/disable channels per type)
- Delivery logs with status, cost, retry tracking
- Notification testing console for developers
- In-app notification toaster with summary display
- Retry logic with configurable max retries
- Rate limiting per channel

---

## 11. Anonymous Complaints System

**Models:** `AnonymousComplaint`, `ComplaintStatusTimeline`

- File complaints anonymously with auto-generated tracking ID (CMP-YYYYMMDD-XXXX)
- Submit supporting evidence (images, documents)
- Categorize complaints by type
- Severity levels: Low, Medium, High, Critical
- Track complaint status by tracking ID (no login required)
- Status timeline with full audit trail
- Admin management dashboard with filters (status, severity, category)
- Analytics: average resolution time, monthly trends, category/severity breakdown
- Bulk status update with timeline entries

---

## 12. Certificate Management

**Models:** `Certificate`

- Generate 10 certificate types: Bonafide, Leaving, Character, Migration, Transfer, Marksheet, Conduct, Course Completion, Provisional, Achievement
- Multi-language support: English, Hindi, Marathi
- Professional PDF design with borders, watermarks, gold accents, seals, signatures
- Unique certificate numbering (auto-generated)
- Public verification portal — verify by Certificate Number
- Auto-send certificate PDF to student/parent via Email and WhatsApp
- Snapshot metadata stored for historical accuracy

---

## 13. Digital ID Card System

**Models:** `IdCard`

- Generate ID cards for students and teachers
- Bulk generation for entire grades or teacher departments
- PDF generation matching HTML preview (360×228px)
- QR code verification at `/verify/id-card/[cardNumber]`
- Card/List toggle, search, filter, sort
- Profile photo validation and organization logo
- Admin-only revocation with reason tracking
- Reissue with version tracking (revoke old → generate new)
- On-demand PDF download (no storage required)
- Card orientation: Horizontal / Vertical

---

## 14. Leave Management

**Models:** `Leave`, `LeaveStatusTimeline`

- Apply for leave with date range, reason, and type
- 8 leave types: Sick, Casual, Annual, Emergency, Maternity, Paternity, Unpaid, Study
- Emergency contact capture
- Approval/rejection workflow with admin review
- Status timeline with full audit trail
- Admin dashboard: manage all pending requests
- Notifications on status change

---

## 15. Holiday & Academic Calendar

**Models:** `AcademicCalendar`, `AcademicYear`

- Declare single holidays with instant notification
- Emergency holiday declaration (8-second trigger, high-priority WhatsApp)
- Bulk import holidays from CSV
- Import holidays from Google Sheets
- Event types: Holiday, Event, Exam, Vacation
- Working days calculation (auto-recalculates when holidays change)
- Academic year summary: total days, weekends, holidays, working days
- Delete single holidays or clear all (with confirmation)
- Recurring events support

---

## 16. Document Management

**Models:** `StudentDocument`

- Students upload documents: Aadhaar, Transfer Certificate, Birth Certificate, mark sheets, photos
- Document verification workflow: admin verifies or rejects with reason
- Status tracking — students see verification progress
- Admin verification dashboard: paginated, filterable, with stats cards
- Soft delete with audit trail (isDeleted, deletedAt, deletedBy)
- Document types: configurable per institution

---

## 17. AI Agents & Automation

**Models:** `FeeSenseAgent`, `FeeSenseExecutionLog`, `FeeSenseReport`, `ScheduledJob`

### FeeSense AI Agent
- Analyzes student payment patterns: Regular, Irregular, Never Paid, Partial Payer
- Computes risk scores and levels (Low / Medium / High / Critical)
- Detects payment sentiment
- Recommends optimal communication channel (Email, SMS, WhatsApp, Voice Call)
- Auto-sends reminders and notifications
- Configurable thresholds: risk scores, max notification attempts, voice call triggers
- Scheduled daily runs (configurable time)
- Full execution logs with per-run analytics
- AI-generated monthly reports with insights

### Attendance Analyzer AI Agent
- Analyzes last 90 days of attendance data
- Computes risk levels and dropout risk scores
- Detects attendance patterns (chronic absence, improving, declining)
- Auto-notifies parents and teachers
- Class-level pattern detection

### General
- Agent activation toggle (enable/disable per agent)
- Scheduled runs via Inngest background jobs
- Execution history with success/failure tracking

---

## 18. Reports & Analytics

**Models:** Multiple (read-only aggregation)

- **Reports Hub** — Central dashboard for all reports
- **Student Master List** — Full student directory with all fields (CSV/Excel)
- **Attendance Report** — Section-wise, date-range filtered (CSV/Excel/PDF)
- **Staff Directory** — All teachers and staff (CSV/Excel)
- **Fee Collection Report** — Collected vs pending vs overdue
- **Fee Reconciliation Report** — PhonePe vs internal records comparison
- **Result Analysis Report** — Grade distribution, pass/fail rates
- **Student Report PDF** — Personal info + attendance + exam results + fee summary
- **Lead Source Analytics** — Conversion rates by channel
- **Monthly Fee Charts** — Per-month collection trends
- **Fee Category Distribution** — Per-category breakdown

---

## 19. Transport

**Models:** (UI + hardcoded data; schema in backlog)

- Bus route map view for parents and students
- Bus stop information with sequenced stops and pickup times
- Driver contact details
- Transport fee integration (planned)
- Live bus tracking (coming soon)

---

## 20. Role-Based Dashboards

### Admin Dashboard
- Student, teacher, revenue, and issue stats at a glance
- Unified recent activity feed (payments, leads, complaints, notices, attendance)
- Full management access to all modules
- Institution overview (super admin: multi-org oversight)

### Teacher Dashboard
- Assigned classes, teaching load, attendance completion
- Quick actions: mark attendance, manage fees, create exams
- Section attendance summaries

### Student Portal
- Personal dashboard: attendance %, upcoming exams, fee status, notices
- View and pay fees online
- View attendance history with calendar and streaks
- View exam results, download hall tickets
- Download certificates
- Upload documents, track verification status
- Apply for leave
- File and track anonymous complaints
- Edit own profile

### Parent Portal
- Dashboard with children overview and alerts
- Switch between multiple children
- Pay fees online with breakdown
- View fee history and download receipts
- Monitor child attendance (calendar, monthly, stats)
- View exam results
- View notices and announcements
- File anonymous complaints
- Transport route map
- Track complaints

---

## 21. Integrations

**Models:** `MetaIntegration`

| Integration | Status | What It Does |
|-------------|--------|--------------|
| **PhonePe** | ✅ Live | Online payments: UPI, Cards, NetBanking, Wallet |
| **WhatsApp Business API** | ✅ Live | Template messaging, fallback mode |
| **Firebase Cloud Messaging** | ✅ Live | Push notifications |
| **Resend** | ✅ Live | Transactional emails |
| **Cloudinary** | ✅ Live | File storage for notices, documents |
| **Uploadthing** | ✅ Live | Student photo uploads |
| **Meta/Facebook Lead Ads** | ✅ Live | Auto-create leads from Facebook/Instagram |
| **Google Sheets** | ✅ Live | Import holidays from Sheets |
| **Inngest** | ✅ Live | Background job scheduling |
| **SMS Gateway** | ✅ Live | SMS delivery |
| **Google Gemini AI** | ✅ Live | AI agents, bulk exam generation |
| **SMTP (Custom)** | 🔄 Coming | Organization-specific email sending |

---

## 22. Settings & Configuration

**Models:** `Organization`, `AcademicYear`, `NotificationSetting`

- Organization profile: name, logo, type, contact, address
- Organization type: School, College, Coaching, Academy, Multi-Branch Group
- Terminology customization: rename grade/class/section/batch to your vocabulary
- Academic year setup: create, set current, switch between years
- Grade and section management
- Subject management with codes
- Teaching assignments
- Notification settings: per-type channel toggles
- Notification delivery logs
- Role-based permissions (RBAC) with hierarchical plan checks
- Subscription plan management (Free / Standard / Premium / Enterprise)

---

## 23. Onboarding

**Models:** `Organization`, `AcademicYear`, `Grade`, `Section`, `Student`, `Parent`, `Teacher`, `Subject`, `FeeCategory`

Multi-step setup wizard guiding through:
1. Create Organization
2. Set Academic Year
3. Create Grades
4. Create Sections
5. Add Students (bulk CSV or individual)
6. Link Parents
7. Upload Documents
8. Add Teachers
9. Create Subjects
10. Set Fee Categories
11. Create Teaching Assignments
12. Assign Fees to Students

Plus: Staff invitation system, notification testing console, onboarding progress tracking.

---

## 24. Authentication & User Management

**Models:** `User`, `Account`, `Session`, `Verification`, `Membership`, `Invitation`, `DeviceToken`

- Email/password authentication
- Multi-organization membership (one user, many schools)
- Organization switching
- Role-based access: Admin, Teacher, Student, Parent
- Email verification and ownership
- Password reset flow
- Invitation acceptance workflow
- Device token management for push notifications
- Session management

---

## 25. Public Website

- Landing pages with feature highlights
- 13 individual feature pages (Attendance, Fees, Exams, etc.)
- 10 industry pages (K-12 Schools, Coaching, Colleges, Pre-Schools, etc.)
- City/location-specific pages
- Blog and changelog
- Pricing page with plans, comparison table, FAQ, testimonials
- Contact page
- Public certificate verification portal
- Public ID card verification portal
- About, Privacy Policy, Terms & Conditions, Refund Policy
- Auto-generated sitemap.xml
- SEO metadata: OpenGraph, schema markup, meta tags

---

## 26. Multi-Branch & Institution Management

**Models:** `Institution`, `Organization`

- Group multiple organizations under one institution
- Cross-branch reporting and analytics
- Branch code management
- Multi-branch lead analytics
- Institution-level dashboard with per-org stats

---

## 27. ID Card Verification (Public)

**Models:** `IdCard`

- Public endpoint: `/verify/id-card/[cardNumber]`
- QR code scan → redirects to verification page
- Displays cardholder photo, name, role, organization, validity
- Used for gate entry, library access, exam hall verification

---

## 28. Security & Compliance

- Role-Based Access Control with hierarchical permissions
- Multi-tenant data isolation by organization
- AES-256-GCM encryption for third-party credentials
- Reverification flow for sensitive actions
- Invitation expiry
- Organization-scoped queries

---

## 29. Coming Soon (Roadmap)

| Feature | Status |
|---------|--------|
| Timetable & Class Scheduling | Schema ready |
| Assignments / LMS | Planned |
| Salary & Payroll | Planned |
| Teacher Feedback & Ratings | Planned |
| Grade Promotion | Planned |
| Fee Category Cloning | Planned |
| Installment Plans | Planned |
| Live Bus Tracking | Planned |
| Voice Assistant (Alexa) | Planned |
| Activity Logs (System-Wide) | Planned |
| ChatBot | Planned |
| Own LMS / Webinar Platform | Long-term |
| Full RBAC Editor | Planned |

---

## Platform Infrastructure

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 + 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | Better Auth |
| **UI** | shadcn/ui + Tailwind CSS |
| **PDF** | React-PDF (@react-pdf/renderer) |
| **Payments** | PhonePe Gateway |
| **Push** | Firebase Cloud Messaging |
| **Email** | Resend |
| **WhatsApp** | Meta Business API |
| **AI** | Google Gemini |
| **Jobs** | Inngest |
| **Storage** | Cloudinary + Uploadthing |

---

*Shiksha.cloud — One platform. Every module. Zero feature gates.*
*Last updated: 2026-05-29*
