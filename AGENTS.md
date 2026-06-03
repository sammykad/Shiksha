# Shiksha.cloud — AGENTS.md

> Behavioral contract between AI coding agents and the Shiksha.cloud codebase.
> Every instruction here must change how the agent acts. If it doesn't, it doesn't belong here.
> Read this entire file before writing a single line of code.

---

## What Is Shiksha.cloud?

A cloud-based School Management System (SMS) built for Indian educational institutions.
Connects students, parents, teachers, and admins on one platform — eliminating manual paperwork and automating repetitive tasks.

**Live at:** shiksha.cloud
**Contact:** 8459324821

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15–16 (App Router, SSR) |
| ORM | Prisma |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk (org-based, role-scoped) | BETTER_AUTH 
| Storage | Cloudinary · Uploadthing |
| Payments | PhonePe (production pending) · Easebuzz (optional) |
| Notifications | WhatsApp Business API · SMS Gateway · Firebase FCM · Email |
| Background Jobs | Inngest |
| AI Agents | Custom (FeeSense AI · Attendance AI) |
| Package Manager | npm |

---

## Essential Commands

> Verify these before running — update if they differ.

```bash
# Install
npm install

# Dev server
npm dev

# Build
npm build

# Lint
npm lint

# Tests
npm test

# DB migrations (Prisma)
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

**Always lint before marking a task done. Never skip migrations.**

---

## Project Structure

```
/
├── AGENTS.md
├── app/                        # Next.js App Router
│   ├── (public)/               # Public website: landing, feature, blog, pricing pages
│   ├── (auth)/                 # Login, onboarding, org setup
│   └── dashboard/
│       ├── students/
│       ├── fees/
│       ├── attendance/
│       ├── exams/
│       ├── teachers/
│       ├── leads/              # CRM / admissions
│       ├── notices/
│       ├── complaints/
│       ├── documents/
│       ├── certificates/
│       ├── leaves/
│       ├── transport/
│       ├── reports/
│       ├── ai-agents/
│       ├── settings/
│       └── institution/        # SuperAdmin ONLY — see access rules below
├── components/
│   ├── ui/                     # Shared UI components
│   └── [module]/               # Module-specific components
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── clerk.ts                # Clerk helpers
│   └── notifications/          # Notification engine
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── inngest/                    # Background job definitions
├── public/
└── docs/                       # Reference docs (product, API, notifications)
```

> Update this tree to reflect actual directory structure.

---

## Roles & Access Control

Shiksha.cloud uses **Clerk** for auth with org-based, role-scoped access.

| Role | Access Level |
|---|---|
| **SuperAdmin** | Full access including `/dashboard/institution` (multi-org management). Only SuperAdmin can see or act on this page. |
| **Admin** | Full institutional config, all modules, all reports |
| **Teacher** | Own class/section, attendance, notices, leave, document verification |
| **Student** | Own profile, attendance, fees, exams, complaints, certificates |
| **Parent** | Child's attendance, fees, notices, complaints. Multi-child switcher. |

**Critical rules:**
- When adding any new page/route, always check: which roles can access it?
- `/dashboard/institution` is SuperAdmin-only — no other role should see it or be able to navigate to it
- Introducing SuperAdmin will break many existing pages — audit all role checks before shipping
- Teachers are scoped to assigned sections and subjects only — never expose cross-section data

---

## Core Domain Concepts

Understand these before touching any business logic:

| Concept | Details |
|---|---|
| **FeeSense AI Agent** | Analyzes overdue fees, payment patterns, risk levels; sends personalized multi-channel reminders |
| **Attendance AI Agent** | Detects absentee patterns, frequent lates, students needing intervention |
| **21 Notification Scenarios** | The complete set of school communication triggers — attendance, fee due, exam reminders, results, receipts, holiday declaration, etc. 30+ templates across channels |
| **Hall Ticket QR** | PDF hall tickets with QR code; gate scanner verifies exam eligibility |
| **Anonymous Complaints** | Unique tracking ID per complaint; Pending → Under Review → Investigating → Resolved. Reporter identity must NEVER be traceable. |
| **Lead CRM** | 12+ pipeline stages, 20+ lead sources, Facebook/Instagram lead sync (in dev), convert lead → student |
| **FeeSense Reminders** | 3 reminder templates; automated + manual override; per-channel (WhatsApp/SMS/Email/Push) |
| **Certificate Generator** | 10+ types, bilingual (English + मराठी); instant share via WhatsApp/Email |
| **Inngest Jobs** | All background jobs (scheduled agents, notification fan-out, retries, idempotency) run through Inngest |
| **Academic Year** | April–March (India). One active year at a time. All data is year-scoped. |
| **Multi-tenant** | Complete data isolation per organization (Clerk org-based). Never leak cross-org data. |
| **Student Count = Billing** | Student count is a billing-sensitive field. Never update it directly — always go through the billing module. |

---

## Pricing & Billing Logic

Billing is **per active student per month**. Parents, teachers, and admins are always free.

### Student-Based Slabs

| Students | Price/Student/Month |
|---|---|
| 0–50 | ₹54 |
| 51–300 | ₹49 |
| 301–500 | ₹44 |
| 501–1,000 | ₹33 |
| 1,001–2,000 | ₹24 |

### User-Based Plans

| Users | Price/User/Month |
|---|---|
| 100 | ₹55 |
| 500 | ₹45 |
| 1,500 | ₹35 |

### Org/Institution Plans (Annual)

| Plan | Users |
|---|---|
| ₹40,000/year | Up to 2,000 |
| ₹70,000/year | Up to 4,000 |
| ₹1,90,000/year | Up to 10,000 |

### Additional Costs
- **Notification credits** — tracked in org wallet (paise)
- **Payment gateway** — 2.5–3% charged to parent on online payments only
- **Storage** — charged only beyond 1 GB
- **Onboarding balance** — ₹1,00,000 paise given by Shiksha.cloud on signup

**Never hardcode a price. Always read from billing config / constants.**

---

## Module Status Reference

Use this before touching any module. Do not build, enable, or expose features marked as Pending/Planned without explicit instruction.

| Module | Status |
|---|---|
| Student Management | ✅ Live |
| Fee Management | ✅ Live (reconciliation: UI only; installment plans: not ready; payment link: testing needed) |
| Attendance Management | ✅ Live (QR scanner: pending; face scanner: pending) |
| Teacher Management | ✅ Live |
| Lead / Admission CRM | ✅ Live (Meta lead sync: testing needed) |
| Exam Management | ⚠️ Not tested properly — hall ticket: testing needed; results/grading: testing needed; report cards, analytics, AI exam assistant: pending |
| Holiday Calendar | ✅ Live |
| Leave Management | ✅ Live (leave summary/balance: pending) |
| Notice Board | ✅ Live |
| Anonymous Complaints | ✅ Live |
| Certificates | ✅ Live (13+ types, EN + मराठी + Hindi) |
| Document Management | ✅ Live |
| AI Agents (FeeSense, Attendance) | ✅ Live |
| AI Monthly Reports | ✅ Live |
| Reports Hub | ✅ Live |
| Notifications (all channels) | ✅ Live (user channel preferences: pending) |
| Transport (basic) | ⚠️ Partial — route map, stop info, driver contact live; live tracking: planned |
| Recorded Sessions | ⚠️ Partial — view + YouTube link upload live; session mgmt + WhatsApp share: pending |
| Assignments / LMS | ❌ Pending — do not implement without instruction |
| Timetable | ❌ Planned (schema ready) — do not implement |
| Teacher Attendance | ❌ Planned |
| Salary & Payroll | ❌ Planned — do not implement |
| Grade Promotion (bulk) | ❌ Planned |
| Fee Category Cloning | ❌ Planned |
| Live Bus Tracking | ❌ Planned |
| Digital ID Cards (RFID) | ❌ Pending |
| Student Calendar (full) | ❌ Pending |
| Wallet Top-Up (admin) | ❌ Pending |
| PhonePe (production) | ⚠️ Testing — not yet in production |
| SuperAdmin + /dashboard/institution | ⚠️ In progress — many pages will break; audit required |
| Public Website | ⚠️ Needs design consistency |

---

## Coding Conventions

### General
- **Explicit over clever** — new developers must understand code in 5 minutes
- **No magic numbers** — use named constants from `lib/constants` or config
- **i18n-ready** — all user-facing strings must support English + Hindi minimum
- **Currency in paise** — store as integer (paise), display as ₹ with formatting helper
- **Soft deletes only** — never hard-delete records (`deleted_at` / `is_active`)
- **No `console.log` in production** — use structured logging

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- DB tables/columns: `snake_case` (Prisma convention)

### API Responses
```ts
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: { code: string, message: string } }

// Paginated
{ data: [...], meta: { page, limit, total } }
```

### Database
- All FK columns must be indexed
- Every migration needs a rollback script
- Student count changes → only through billing module
- Academic year is always a required scope on year-sensitive queries

### Security
- Never log PII: student names, phone numbers, Aadhaar, fee amounts — no plaintext logs
- Anonymous complaint data: never store anything that can identify the reporter
- Aadhaar: store encrypted, never expose in API responses or logs
- File uploads: validate type, scan, enforce size limit before storage

---

## Indian Context — Gotchas

| Topic | Rule |
|---|---|
| Phone numbers | 10-digit Indian mobile (starts 6–9). Validate: `/^[6-9]\d{9}$/` |
| Currency | Store paise (integer). Display ₹. Never use floats for money. |
| Academic year | April–March. Year-scoped queries must use this boundary, not Jan–Dec. |
| WhatsApp | Primary notification channel — more reliable than SMS for most parents |
| UPI | Primary payment method. PhonePe gateway handles this. |
| Aadhaar | Sensitive govt ID — encrypted at rest, never logged, handle per IT Act / DPDP norms |
| School boards | CBSE, ICSE, State Boards have different grade structures — data model must be flexible |
| Marathi | Certificates support English + मराठी + Hindi. Don't break multilingual rendering. |
| GST | Under research — don't implement fee GST logic without explicit confirmation |

---

## Active Task List (Known Work Items)

These are real tasks from the team. Use this to understand what's in progress:

- [ DONE ] Add pagination to Students list and Cheques list
- [ ] Fee Management: single source of truth for payments (added, not tested properly)
- [ ] Fee Management: GST support, strict sequential receipt numbering, discounts/waivers/scholarships, fine & penalty
- [ ] Student Bulk Import: clarity in UX + mobile responsiveness
- [ ] ID Cards: RFID, QR scanner, parent phone numbers, principal signature
- [ ] Holiday: toggle for dynamic academic calendar view for all users
- [ ] Offline state: show proper message when internet is down
- [ ] Activity Logs: smart modal to track actions
- [ ] SuperAdmin role: introduce, scope `/dashboard/institution`, audit all pages for breakage
- [ ] Public website: design consistency overhaul
- [ ] Blog: SEO-focused, human-touch content (e.g. "How to open a school in 2026") — silently promotes Shiksha.cloud
- [ ] AWS S3 bucket: set up and integrate
- [ ] PhonePe: move to production
- [ ] Meta/Facebook lead sync: complete testing
- [ ] Exam module: full testing of hall tickets, results, grading, report cards

---

## Agent Behavior Rules
avoid API Route so use server actions 
1. **Never delete** files, migrations, or routes without explicit confirmation from the user
2. **Billing is sacred** — any change touching student count, fee collection, wallet, or invoices: show the diff first, wait for approval before applying
3. **Notifications are critical** — changes to notification triggers/templates must be tested locally; a missed notification = a customer complaint
4. **Pending = do not build** — if a feature is marked Pending/Planned in the module status table, do not scaffold, route, or UI it without instruction
5. **SuperAdmin is fragile** — introducing or modifying the SuperAdmin role will break many existing pages. Always audit role checks across all pages before shipping.
6. **No secrets in code** — all API keys, tokens, gateway credentials go in `.env`. Reference only through `process.env` or config module.
7. **Migrations are one-way** — write rollback for every migration. Never assume forward-only.
8. **No lorem ipsum** — use realistic Indian school names, common Indian student names (Arjun, Priya, Rahul, Sneha…), and ₹ amounts in all placeholders
9. **Exam module is untested** — treat it as fragile. Do not modify exam results, grading, or hall ticket logic without careful review and explicit instruction.
10. **Anonymous complaints = no traceability** — never add any logging, metadata, or DB field that could link a complaint to the reporter

---

## Reference Files

| File | Contents |
|---|---|
| `docs/product.md` | Full product overview, features, pricing, comparisons |
| `docs/notifications.md` | All 21+ notification scenarios and 30+ templates |
| `docs/api.md` | API route reference |
| `docs/setup.md` | Local environment setup guide |
| `prisma/schema.prisma` | Source of truth for all data models |

---

*Last updated: June 2026. Keep this file current — stale instructions are worse than no instructions.*
*When in doubt: ask before building. When certain: still lint and test.*