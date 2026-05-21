# Shiksha.cloud

### A Smarter Way to Run Your Institution

> Cloud-based School Management System built for Indian Educational Institutions

---

## Overview

Shiksha.cloud is a comprehensive, cloud-based School Management System built from the ground up for Indian educational institutions. It connects students, parents, teachers, and administrators on a single unified platform — eliminating manual paperwork, automating repetitive tasks, and bringing complete transparency to every aspect of institutional management.

Most school software in India is either too expensive, too complex, or adapted from foreign systems that don't understand local fee structures, academic calendars, or communication habits. Shiksha.cloud was designed specifically for this gap — built by developers who understand how Indian schools actually operate.`

Whether you manage a small coaching center or a large multi-branch institution, the platform adapts to your structure and workflow without weeks of training or complex setup.

**Tech stack:** Next.js 15-16 · Prisma ORM · Supabase · Clerk Authentication

---

## Product Vision

Indian schools lose thousands of hours every year to tasks that shouldn't require human effort — chasing fee payments, filling paper registers, manually sending absence messages, searching for old student records during audits. That time belongs in the classroom, not in the office.

Shiksha.cloud exists to give that time back.

The goal is not to digitize paperwork. It is to eliminate the need for it entirely — so that administrators can run institutions with clarity, teachers can focus on students, and parents always know what's happening with their child without having to call the school.

**Where we are headed:**

Every module in Shiksha.cloud is built around a single question — _what would this look like if the school never had to think about it?_ Fee reminders that go out automatically. Receipts that arrive before a parent even asks. Attendance that flags patterns before a teacher notices. Certificates generated in seconds, not days.

The platform will continue expanding — timetables, payroll, transport, assignments, AI-powered analytics — always shaped by feedback from the schools actively using it. Features ship because real institutions need them, not because they look good on a brochure.

**The long-term picture** is a platform where every Indian school — from a 40-student coaching center to a 2,000-student multi-branch institution — has the same operational clarity that was previously only available to large, well-funded schools with dedicated admin teams.

Affordable. Built for India. Continuously evolving.

---

## Who Can Use Shiksha.cloud?

- K-12 Schools (Primary, Secondary, Higher Secondary)
- Colleges & Universities
- Coaching Centers & Tuition Classes
- Vocational Training Institutes
- Educational Academies
- Private & Public Schools
- Multi-Branch Institutions
- International Schools
- Special Education Centers
- Online & Hybrid Learning Institutions

---

## Core Modules

The modules below represent the product surface documented across Shiksha.cloud. Most are live and actively used; items marked planned, documented, or in development are included so the overview matches the full product direction.

---

### Student Management

| Feature                    | Description                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Student Profiles           | Complete digital records — personal details, grade/section, roll number, blood group, address, emergency contacts                                            |
| Document Management        | Students upload documents (Aadhaar, TC, birth certificate, etc.); admins and class teachers receive instant notifications and verify or reject with feedback |
| Academic Performance       | View exam results, report cards, CGPA, class rank, and attendance history from one dashboard                                                                 |
| Report Cards               | Auto-generated per exam session with percentage, grade label, conduct grade, attendance %, and principal remarks                                             |
| Bulk Student Import        | Import entire student batches via CSV; reduces setup time significantly for new academic years                                                               |
| Student Search & Filtering | Search, filter, and manage students by grade, section, status, roll number, and profile details                                                              |
| Self-Service Profile       | Students can view and update selected profile information from their portal                                                                                  |
| Digital Student Records    | Centralized record history covering personal, academic, financial, attendance, document, and certificate data                                                |

---

### Attendance Management

| Feature             | Description                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Digital Attendance  | Teachers mark attendance (Present / Absent / Late) with a single click — no paper registers        |
| Section Summaries   | Section-wise daily attendance overview for teachers and administrators with trend analysis         |
| Real-time Alerts    | Parents receive instant WhatsApp / SMS / Email notifications when a child is marked absent or late |
| Attendance History  | Students and parents view daily, weekly, and monthly attendance records with downloadable reports  |
| QR Attendance       | QR-assisted attendance workflows are documented for faster marking and verification                |
| Completion Tracking | Admins can see which sections have completed attendance and which sections are still pending       |
| Visual Analytics    | Calendar, ring chart, heatmap, skyline, weekly report, and section analytics views are documented  |
| Export & Reports    | Attendance data can be filtered and exported for operational reports                               |

---

### Fee Management

| Feature                  | Description                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom Fee Categories    | Create tuition, exam, lab, library, transport, and other fee categories per academic year                                                   |
| Online Payments          | Pay via UPI, credit/debit cards, net banking, or digital wallets through an integrated payment gateway                                      |
| Instant Receipts         | Auto-generated on successful payment; delivered via WhatsApp, SMS, and email; available for download anytime                                |
| Automated Reminders      | Fee reminders before due dates and for overdue amounts — reducing manual follow-ups                                                         |
| FeeSense AI Agent        | AI-powered fee collection agent that analyzes payment patterns, identifies at-risk families, and sends personalized multi-channel reminders |
| Payment Tracking         | Real-time dashboard showing collected amounts, pending dues, payment history, and full transaction audit trails                             |
| Offline Payments         | Admins can record office/cash payments with receipt generation and audit trail                                                              |
| PDC Cheque Tracking      | Track post-dated cheques, pending resolution, bounced cheques, and related payment history                                                  |
| Fee Reconciliation       | Reconcile online/offline collection, outstanding dues, gateway/platform fees, and net settlement context                                    |
| Reminder Overrides       | Teachers/admins can send fee reminders with template preview and channel overrides                                                          |
| Parent & Student Portals | Parents and students can view assigned fees, paid/pending totals, receipts, and payment history                                             |

---

### Exam Management

| Feature             | Description                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Exam Sessions       | Organize exams into sessions (Midterm, Final, etc.) with date ranges and academic year linkage                  |
| Exam Setup          | Configure exams per grade/section/subject with max marks, passing marks, duration, venue, mode, and supervisors |
| Hall Tickets        | Generate and download student hall tickets as PDFs — includes student details, exam schedule, and QR code       |
| Hall Ticket Scanner | Scan QR codes on printed hall tickets to instantly verify student identity and exam eligibility                 |
| Results & Grading   | Enter marks, auto-calculate percentage and grade label, and publish results with pass/fail status               |
| Student Enrollment  | Enroll students into specific exams individually or in bulk; track enrollment status throughout                 |
| Bulk Exam Creation  | Create the same subject exam across multiple sections from one workflow                                         |
| Exam Attendance     | Mark students attended/absent on exam day and sync attendance into result workflows                             |
| Grading Scales      | Configure grade bands, pass thresholds, rounding rules, grace marks, and organization-level grading standards   |
| Session Reports     | View exam-session reports, subject performance, student summaries, and report-card data                         |

---

### Teacher Management

| Feature               | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Teacher Profiles      | Bio, teaching philosophy, qualifications, experience, certifications, and specialized subjects |
| Teaching Assignments  | Assign teachers to specific grade-section-subject combinations per academic year               |
| Document Verification | Teachers verify uploaded student documents with instant approval/rejection notifications       |
| Leave Management      | Apply for leave; admins approve or reject with notes; complete status timeline maintained      |

---

### Lead & Admission CRM

| Feature                 | Description                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Lead Capture            | Collect enquiries from Facebook Ads, Google Ads, Instagram Ads, walk-ins, phone calls, and referrals                      |
| Lead Scoring & Pipeline | Score leads 0–100, assign priority, track status through the full admission funnel                                        |
| Activity Tracking       | Log every interaction — calls, WhatsApp, school visits, demo classes, parent meetings — with outcomes and follow-up dates |
| Conversion              | Convert qualified leads directly to student records; full audit trail from lead to enrolled student                       |
| Follow-up Management    | Track next follow-up dates, assigned staff, follow-up count, closure reasons, and lead notes                              |
| Lead Source Analytics   | Compare leads by source, priority, stage, staff owner, and conversion outcome                                             |
| Meta Ads Pipeline       | Facebook and Instagram lead sync with attribution is documented and in development                                        |

---

### Communication & Notifications

| Feature                            | Description                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Notice Board                       | Publish school-wide notices with priority levels, audience targeting, and scheduling                         |
| Multi-Channel Engine               | Own notification system: SMS, WhatsApp, Email, Push, and In-App — with per-scenario templates                |
| Organization Notification Settings | Admins configure which events trigger which channels, with cool-down rules, rate limiting, and cost tracking |
| Notification Logs                  | Full delivery history per user per channel with read status, error tracking, and retry management            |
| Notification Testing               | Admin testing page for push, email, SMS, WhatsApp, device tokens, and channel diagnostics                    |
| Notification Toasters              | In-app toast summaries show send success, failed sends, already-sent notifications, and cost context         |
| Scheduled Notifications            | Notification engine supports safe retry, idempotency, scheduled jobs, batching, and fan-out workflows        |

---

### Academic Structure & Administration

| Feature                    | Description                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Organization Setup         | Configure school name, logo, type, contact details, plan, and academic year                         |
| Academic Years             | Create and manage years (Annual / Semester / Trimester / Batch); one active year at a time          |
| Grades & Sections          | Create grades and sections; assign class teachers; manage student composition                       |
| Subject Management         | Define subjects with codes, elective flags, and descriptions; link to teaching assignments          |
| Holiday & Calendar         | Declare planned and emergency holidays; auto-reflected across all user calendars with notifications |
| Institute Gallery          | Manage institution photos and media for display across the platform                                 |
| Terminology Customization  | Configure labels to match school, college, coaching, batch, grade, or section language              |
| Roles & Access Permissions | Manage role-specific access across admin, teacher, student, parent, and future staff views          |
| Billing Settings           | Track subscription plan, wallet balance, notification credits, and usage-based cost visibility      |

---

### Anonymous Complaint System

Students and parents submit sensitive concerns — bullying, teaching quality, administrative issues — through a secure, anonymous channel. Each complaint gets a unique tracking ID, is routed to administrators, and goes through a resolution workflow:

**Pending → Under Review → Investigating → Resolved**

Complainants track status without revealing their identity.

---

### Leave Management

Students, teachers, and parents apply for leave with type (Sick, Casual, Emergency, etc.), date range, and emergency contact. Admins approve or reject with notes. A complete status timeline is maintained for every leave application.

---

### Certificate Generator

Generate, manage, and download official certificates directly from the platform. Supports both English and Marathi, with 10 certificate types covering the full student and academic lifecycle:

| Certificate                 | Marathi Name              |
| --------------------------- | ------------------------- |
| Bonafide Certificate        | शाळेत शिकत असल्याचा दाखला |
| School Leaving Certificate  | निर्गम उतारा              |
| Character Certificate       | चारित्र्य प्रमाणपत्र      |
| Migration Certificate       | स्थलांतर प्रमाणपत्र       |
| Transfer Certificate        | बदली प्रमाणपत्र           |
| Marksheet / Progress Report | गुणपत्रिका                |
| Conduct Certificate         | वर्तणूक दाखला             |
| College Leaving Certificate | महाविद्यालय सोडण्याचे     |
| Course Completion           | अभ्यासक्रम पूर्णता        |
| Provisional Certificate     | तात्पुरते प्रमाणपत्र      |

---

## Additional Platform Capabilities

The modules above cover the core institution workflow. Shiksha.cloud also includes several cross-functional capabilities documented across the product, module, and user-flow docs.

---

### Reports & Analytics

| Feature             | Description                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Reports Hub         | Central place for attendance, fee, exam, reconciliation, enrollment, and staff reports                  |
| Attendance Reports  | Generate section-wise, student-wise, weekly, monthly, and annual attendance reports with PDF/CSV export |
| Fee Reports         | Track assigned, collected, pending, overdue, online, offline, and reconciliation totals                 |
| Exam Reports        | Session-wise results, subject-wise performance, student ranking, and report-card summaries              |
| Dashboard Analytics | Admin, teacher, student, and parent dashboards surface the most relevant operational metrics            |
| AI Reports          | AI-assisted monthly summaries for fees, attendance, and student performance insights                    |

---

### AI Agents & Automation

| Feature                    | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| FeeSense AI Agent          | Analyzes overdue fees, payment patterns, risk levels, and sends personalized reminders                  |
| Attendance AI Agent        | Identifies absentee patterns, frequent late arrivals, and students needing intervention                 |
| Student Performance Agent  | Planned intelligence layer for weak-area detection, class comparison, and study suggestions             |
| Parent Communication Agent | Planned assistant for parent FAQs, communication summaries, complaint routing, and multilingual replies |
| Scheduled Agent Runs       | Background jobs for recurring checks, reminders, summaries, and notification workflows                  |
| Voice Call Reminders       | Planned escalation channel for high-priority overdue fee follow-ups                                     |

---

### Integrations

| Feature                    | Description                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| PhonePe Payments           | Online payment gateway integration for fee collection and receipt generation                   |
| WhatsApp Business          | WhatsApp templates for attendance alerts, fee reminders, receipts, notices, and urgent updates |
| SMS Gateway                | SMS delivery for parents without app/push access                                               |
| Firebase Push              | Browser/device push notifications with token management and testing tools                      |
| Email Delivery             | Transactional emails for notices, receipts, reports, and system communication                  |
| Meta Lead Sync             | Facebook and Instagram lead capture pipeline is documented and in development                  |
| Cloud Storage              | File uploads for documents, notices, certificates, gallery assets, and receipts                |
| Google Sheets / CSV Import | Bulk imports for students, holidays, and onboarding data                                       |

---

### Onboarding & Data Import

| Feature                            | Description                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Organization Setup Wizard          | Guided setup for institution profile, logo, academic year, grades, sections, and settings         |
| Single-School Onboarding Checklist | Structured checklist for student, parent, teacher, fee, holiday, document, and notification setup |
| Student Bulk Import                | CSV import for student data to reduce first-time setup effort                                     |
| Holiday Bulk Import                | Import planned holidays from CSV or Google Sheets                                                 |
| Initial Notification Testing       | Test attendance alerts, fee notifications, notice delivery, and receipt flows before launch       |
| Login Credential Rollout           | Documented flow for sharing student, parent, teacher, and admin access details                    |

---

### Billing, Wallet & Subscription

| Feature                  | Description                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Plan Management          | Supports Free, Standard, Premium, and Enterprise plan structures                                       |
| Wallet Balance           | Organization wallet tracks notification and usage credits                                              |
| Usage Tracking           | Notification units and channel costs are logged for billing visibility                                 |
| Credit Top-Up            | Planned admin flow for adding notification balance                                                     |
| Transparent SaaS Billing | Pricing remains student-based; parents, teachers, and admins are not billed per user                   |
| Reconciliation Reports   | Fee reconciliation shows online/offline totals, platform charges, pending dues, and settlement context |

---

### User, Role & Access Control

| Feature                   | Description                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Clerk Authentication      | Secure login and organization-based authentication                                    |
| Role-Based Portals        | Separate admin, teacher, student, and parent dashboards with role-specific navigation |
| Permission Model          | RBAC documentation covers module-level permissions and restricted route access        |
| Teacher Scoped Access     | Teachers can be restricted to assigned sections, subjects, and approved modules       |
| Parent Multi-Child Access | Parents can switch between linked children from one account                           |
| Organization Isolation    | Multi-tenant data separation keeps each institution's data private                    |

---

### Transport, Sessions & Learning Support

| Feature               | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Bus Transport View    | Parent-facing transport route and bus information experience is partially available                  |
| Driver Contact        | Parents can access transport contact details where configured                                        |
| Live Bus Tracking     | Planned enhancement for real-time route tracking                                                     |
| Recorded Sessions     | Upload, manage, and view recorded class/session links                                                |
| Assignment Management | Planned LMS module for assignment creation, student submission, status tracking, and teacher grading |
| Student Calendar      | Students can view exams, holidays, assignments, and academic events in one place                     |

---

### Public Website & Growth Pages

| Feature                  | Description                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Landing Pages            | Public marketing pages for schools, parents, teachers, admins, and industries                                     |
| Feature Pages            | Dedicated pages for attendance, fees, exams, parent portal, notifications, AI reports, and more                   |
| Industry Pages           | Tailored pages for K-12 schools, colleges, coaching classes, junior colleges, preschools, and training institutes |
| Location Pages           | Local SEO pages for school management software by location                                                        |
| Blog & Changelog         | Content pages for education technology, product updates, SEO, and support                                         |
| Certificate Verification | Public route to verify issued certificates                                                                        |

---

## What Each Stakeholder Gets

| Role | Capabilities |
| ---- | ------------ |

| **Student** | Dashboard · Attendance history & reports · Fee receipts & online payments · Exam enrollment, hall tickets & results · Document upload & status tracking · Leave applications · Notices · Anonymous complaints · Certificate downloads |

| **Parent** | Child attendance monitoring · Online fee payments & receipt download · Real-time notifications · Notices & announcements · Multiple children from one account · Anonymous complaint box |

| **Teacher** | Class management & student lists · One-click attendance · Section attendance summaries · Document verification · Notice publishing · Leave applications · Exam & result management |

| **Admin** | Full institutional configuration · Student & teacher management · Bulk imports · Fee setup & collection tracking · Exam lifecycle management · Lead/CRM pipeline · Complaint management · Notice approval · Certificate generation · Analytics & AI reports · Notification settings · Academic year & grading control |

---

## How We Compare

| Feature               | Shiksha.cloud                    | Typical Competitor      |
| --------------------- | -------------------------------- | ----------------------- |
| Pricing               | ₹79/student/month                | ₹150–300/student/month  |
| Parents & Teachers    | Always free                      | ₹50–100 per user/month  |
| Setup Time            | Live in 24 hours                 | 2–4 weeks               |
| WhatsApp Integration  | Built-in, included               | Usually extra cost      |
| Ease of Use           | Minimal training needed          | Complex, training-heavy |
| Indian Focus          | Built for Indian schools         | Foreign systems adapted |
| Per-user Fees         | None — pay per student only      | Yes — every role billed |
| AI Features           | FeeSense AI agent included       | Basic or not available  |
| Anonymous Complaints  | Built-in with timeline           | Rarely available        |
| Certificate Generator | 10 types, bilingual (EN + मराठी) | Rarely available        |

**Example:** A school with 40 students, 80 parents, 10 teachers, and 10 admins pays **₹3,160/month** with Shiksha.cloud. Competitors typically charge **₹8,000–13,000/month** for the same setup.

---

## Pricing

### ₹79 per student / month

**Parents, Teachers & Admins are always free.**

| User Type             | Example Qty | Competitor Cost         | Shiksha.cloud    |
| --------------------- | ----------- | ----------------------- | ---------------- |
| Students              | 40          | ₹3,160/month            | ₹3,160/month     |
| Parents               | 80          | ₹4,000–8,000/month      | **FREE**         |
| Teachers              | 10          | ₹500–1,000/month        | **FREE**         |
| Admins                | 10          | ₹500–1,000/month        | **FREE**         |
| **Total (140 users)** |             | **₹8,160–13,160/month** | **₹3,160/month** |

- No hidden costs
- No setup fees
- No per-user restrictions on parents, teachers, or admins
- Transparent billing — pay only for enrolled students

---

## Security & Infrastructure

|                    |                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Authentication** | Clerk-powered with role-based access control — each user sees only what their role permits |
| **Multi-tenant**   | Complete data isolation between organizations                                              |
| **Multi-Roles**    | Complete data isolation between roles                                                      |
| **Cloud**          | 99.9% uptime target; automated daily backups; serverless infrastructure                    |
| **Mobile & PWA**   | Fully responsive; installable as a Progressive Web App                                     |
| **Data Privacy**   | End-to-end encryption in transit and at rest; audit logs for all critical operations       |
| **Performance**    | Next.js 15 App Router with server-side rendering — fast even on slower connections         |

---

## On the Roadmap

Actively in development, not yet live:

- **Timetable** — daily class schedules and teacher schedules _(schema ready)_
- **Assignments** — create, distribute, and track student assignments
- **Salary & Payroll** — teacher payout management
- **Teacher Attendance** — track and manage staff attendance
- **Transport Management** — bus route tracking and driver details
- **Grade Promotion** — promote students to next grade/section in bulk
- **Fee Category Cloning** — copy fee structures across academic years

---

**Contact:** 8459324821

> _Shiksha.cloud isn't just software — it's a smarter way to run your institution._
> Built by developers who understand education. Designed for the schools that build India.
