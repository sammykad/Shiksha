---
title: 'Shiksha.cloud — Project Tracker'
slug: project-tracker
summary: 'Solo dev project tracker with launch blockers, completed features, and roadmap'
date: 2026-04-07
---

# Shiksha.cloud — Project Tracker

> Solo dev · 1-week sprints · Last updated: April 2026

---

## Pending Featurues

- ChatBot
- Wallet Top-up
- Grading System
- User Permissions
- Billing Organizaiton Supscription
- Multi Branch Support
- Bulk CSV import + auto-invite via WhatsApp/Email
- Face And QR Attendace
- PDC Cheque , AdminView Cheque resolve Testing and Real Use Cases
- if PDC Cheque in pending why should we record payment ? also should not see in parent
- ✅ Done Fix the UI of Leave Apporval
- Fix Backend For Recorded Session Video Link to whatsapp
- ✅ Done Fix Go Home issue (Not Fount Page )
- Activity Logs
- Sidebar Menu Enable / Disable as per User and Organization
- Teaching Assigment

## Launch Blockers

> Hard blockers for production launch. Clear these first.

| #   | Issue                                                                   | Area                      | Status     |
| --- | ----------------------------------------------------------------------- | ------------------------- | ---------- |
| 1   | Notification queue — add background/scheduled jobs                      | Notifications             | ❌ Pending |
| 2   | Real payment gateway integration (Production Env)                       | Fees / Notification TopUp | ❌ Pending |
| 3   | RBAC — students accessing restricted pages (e.g. document verification) | Auth                      | ✅ Done    |
| 4   | Grading system not implemented                                          | Exams                     | ❌ Pending |
| 5   | Attendance calculation broken — UTC/date-time offset issue              | Attendance                | ✅ Done    |
| 6   | Teaching Assignments broken                                             | Academics                 | ❌ Pending |
| 7   | Organization smooth onboarding flow (admin confusion: "what next?")     | Onboarding                | ✅ Done    |
| 8   | Notification balance + top-up flow                                      | Notifications             | ❌ Pending |
| 9   | SaaS billing — how to collect charges from schools/students             | Billing                   | ❌ Pending |
| 10  | Notice board / fee reminder notification override                       | Notifications             | ✅ Done    |
| 11  | Academic Calendar pending — only holidays added                         | Organization Change       | ❌ Pending |

---

## Broken Flows (Tech Debt)

> Partially built but broken in production. Prioritize by blast radius.

### Onboarding

- [x] Onboarding wizard — admin doesn't know next steps after setup
- [ ] Auto-invite students/parents via email + phone on creation

### Auth & Access

- [ ] Sync issue unresolved
- [ ] Parent email update not sending updated invite
- [ ] RBAC patch working but full module remains incomplete
- [ ] Sign-out → move to **Settings** in sidebar (UX fix)

### Academic Year

- [x] `ActiveAcademicYearId` vs `CurrentAcademicYearId` confusion resolved
- [x] Handle `null` values gracefully
- [x] Calculate days and semester correctly; improve naming
- [x] Audit entire codebase for missing academic year filters in dashboard/reports
- [x] Fixed data leakage in attendance and fee stats across years
- [x] Prevent zero current academic years on update

### Students

- [ ] Bulk CSV import + auto-invite via WhatsApp/Email
- [ ] Sync with Clerk + DB properly
- [ ] Add parents flow: link parents, send automated invite (including 2nd parent)
- [ ] Profile missing: Birth Place, Previous School
- [ ] Promote to Next Grade/Section (requires micro-level org structure)

### Teachers

- [ ] Fix Recent Activity feed on teacher profile
- [ ] Missing fields: Qualification, Education, Job Title, Substitute flag
- [ ] Today's Schedule (Mock)

### Fees

- [ ] Show ₹102 breakdown before Pay Now (UX — stops confusion)
- [ ] Add payment link to fee assignment SMS (drives payments without app open)
- [x] Notify on success + failure (parents need confirmation)
- [ ] Fix Phase 4 failure notification
- [ ] Add pgFee + netSettlement to DB before real money flows
- [ ] Phase 8 settlement report (post-launch)
- [ ] Fee collection receipts not generating properly
- [ ] PG charges: clarify who pays service charge (student vs school)
- [ ] No clear logic for offline (0% platform) vs online (2.5% platform) payment

> **Risk:** Schools could game the system — claiming ₹100 offline + ₹400 online when only ₹400 total was collected.

### Exams

- [ ] Exam session added but not showing in UI (breaking sidebar)
- [ ] Auto-enroll students into exams
- [ ] Bulk exam creation
- [ ] AI grading issues
- [ ] Result + Report Card generation broken
- [ ] PDF download issue for hall tickets / report cards

### Leads / CRM

- [ ] Instagram + Facebook integration broken
- [ ] Meta Ads connection not working
- [ ] Kanban board

### Parent Portal

| Feature                | Status     |
| ---------------------- | ---------- |
| ChildSwitcher          | ✅ Done    |
| TransportMap           | ✅ Done    |
| ChildCard              | ✅ Done    |
| Dashboard              | ✅ Done    |
| My Children            | ✅ Done    |
| Child Attendance       | ✅ Done    |
| Fees                   | ✅ Done    |
| Notices                | ✅ Done    |
| Exams / Results        | ❌ Pending |
| Today's Timeline       | ⏳ Pending |
| Today's Timetable      | ⏳ Pending |
| Messages               | ⏳ Pending |
| Teacher Remarks        | ⏳ Pending |
| Events & Holidays      | ⏳ Pending |
| Teacher Circulars      | ⏳ Pending |
| Timetable              | ⏳ Pending |
| Homework / Assignments | ⏳ Pending |
| Syllabus               | ⏳ Pending |
| Child Certificates     | ⏳ Pending |
| Parent Settings        | ⏳ Pending |

### Attendance

- [x] Date/time UTC bug fixed (but still has edge-case bugs)
- [ ] Attendance calculation logic incorrect — check on every page and server action
- [ ] Attendance export not implemented
- [ ] WhatsApp notification on completion: `Grade 10B — Attendance Completed`
- [ ] Existing attendance import not supported

---

## Completed & Stable

> Do not regress these.

| Feature                 | Status     | Notes                                                              |
| ----------------------- | ---------- | ------------------------------------------------------------------ |
| Student Management      | ✅ Done    | Profile, attendance, documents, academic performance, report cards |
| Attendance Management   | ✅ Done    |                                                                    |
| Teacher Management      | ✅ Done    | Profile, assignments, employment                                   |
| Fees                    | ✅ Partial | Setup, assign to categories, payments. Pending: FeeSense AI        |
| Exams                   | ✅ Partial | Session, exam, enrollment. Pending: results, grading, hall tickets |
| Leads / CRM             | ✅ Partial | Lead, activity, conversion. Pending: Meta ads                      |
| Leave Management        | ✅ Partial | Pending: notifications                                             |
| Complaints              | ✅ Partial | Anonymous + timeline. Pending: notifications                       |
| Notices + Notifications | ✅ Partial | Base engine. Pending: triggers                                     |
| Academic Structure      | ✅ Done    | Org, year, calendar, grade, section, subject                       |
| Holiday Management      | ✅ Partial | Pending: auto-notify 1 day before                                  |
| Institute Gallery       | ✅ Partial | Static done, dynamic pending                                       |
| Reports Management      | ✅ Done    |                                                                    |
| Subject Management      | ✅ Done    |                                                                    |
| Teaching Assignments    | ✅ Partial | Base done, broken in production                                    |

---

## Schema Ready — Not Yet Active

| Feature                | Status                          |
| ---------------------- | ------------------------------- |
| Timetable              | Schema done, code commented out |
| OrganizationMembership | Schema done, code commented out |

---

## Roadmap

### High Priority (Post-launch Sprint 1–2)

- [ ] Clone Fee Categories — "Copy from 2024–25" button on new year creation
- [ ] Institute Gallery — dynamic (static version done)
- [ ] Teacher Attendance
- [ ] Salary / Payroll
- [ ] Collect Organization Subscription

### Medium Priority

- [ ] Assignments module
- [ ] Feedback / Ratings
- [ ] Certificate Generator
- [ ] Bus Transportation

### Low Priority / Future

- [ ] AI Learning module
- [ ] Own LMS
- [ ] Voice Navigation (permission-based routes)
- [ ] Full Role-Based Access Control (beyond page guards)

---

## Testing Checklist

> Run through each flow manually before marking sprint complete.

### Core Setup

- [ ] Organization switching
- [ ] Organization config — Grade & Section, Class Teacher assignment
- [ ] Academic Year switch — multi-year flow
- [ ] Calendar management
- [ ] Holiday management

### People

- [ ] Student CRUD — create, read, update, delete
- [ ] Student: promote to next grade/section
- [ ] Student: document upload + parent linking
- [ ] Teacher CRUD — create, suspend, activate, revoke access

### Academics

- [ ] Subject management
- [ ] Teaching assignments
- [ ] Attendance marking + calculation
- [ ] Attendance export

### Fees

- [ ] Fee category setup
- [ ] Assign fees to student categories
- [ ] Fee payment + receipt generation
- [ ] FeeSense AI agent flow
- [ ] Full fee flow

### Exams

- [ ] Exam session creation
- [ ] Exam setup + student enrollment
- [ ] Result entry
- [ ] Hall ticket generation + download
- [ ] Report card generation + download

### Communication

- [ ] Notice board flow
- [ ] Anonymous complaints flow
- [ ] Notification engine — template + variable binding
- [ ] Notification trigger: attendance marked
- [ ] Notification trigger: fee paid
- [ ] Notification trigger: lead assigned

### CRM / Leads

- [ ] Lead creation + activity log
- [ ] Lead conversion flow
- [ ] Lead assigned notification

### Leave

- [ ] Leave request + approval flow

### Agents & Integrations

- [ ] FeeSense AI agent
- [ ] Meta (Instagram/Facebook) lead integration
- [ ] WhatsApp notification delivery
- [ ] Institute Gallery management

### Reports

- [ ] Reports generation + export

---

## Sprint Planning Template

> Copy this block each Monday.

```
## Sprint — Week of [DATE]

### Goal
[One sentence: what does "done" look like this week?]

### This Week
- [ ]
- [ ]
- [ ]

### Carry Over
- [ ]

### Blocked On
-

### Notes
```
