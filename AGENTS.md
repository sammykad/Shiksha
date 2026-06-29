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
│       ├── agents/
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

### Permission Model: Keep It Simple

`lib/permissions.ts` has a `ROLE_CAPABILITIES` table showing what each role can do. That's useful for documentation. Everything else in that file — `createHas`, `createTypedHas`, `requireAuth`, `checkAuth`, `PermissionContext`, `Permission` type — is speculative code with zero consumers. Don't build on it.

**The role-based system is fine.** ADMIN/TEACHER/STUDENT/PARENT checks with `orgRole ===` are simple, auditable, and every school admin understands them. Don't build per-user permission overrides, don't wire `hasPermission()` into routes or server actions, don't add a permission override DB table — until a real customer asks for it and you can design all 7 enforcement layers (DB, UI, engine, menu, routes, server actions, components) at once. Half-built permission systems give false security.

**Auth accessor consolidation is a bigger practical problem than permissions.** The codebase has 3 auth accessor functions (`auth()`, `getCurrentUser()`, `getCurrentUserByRole()`) used inconsistently across 25+ files. That's worth fixing. The permission model is not.

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

**Never hardcode a price. Always read from `lib/constants/pricing.ts` — that is the single source of truth.**

Billing is **per active student per month**. Parents, teachers, and admins are always free.

### Pricing Model: MRP + Seasonal Offer

| Concept | Value |
|---|---|
| **Standard price (MRP)** | ₹79/student/month — defined in `lib/constants/pricing.ts:BASE_MONTHLY_PRICE_PER_STUDENT` |
| **Current offer** | School Opening Season discount — prices vary by tier; defined in `PRICING_TIERS[].currentOfferPrice` |
| **Annual discount** | 20% off monthly rate |

### Current Plans (School Opening Season)

| Plan | Code | MRP | Offer Price | Discount | Student Limit |
|---|---|---|---|---|---|
| Starter | STARTER | ₹79 | ₹49 | 38% off | Up to 100 |
| Growth | GROWTH | ₹79 | ₹29 | 63% off | Up to 500 |
| Scale | SCALE | ₹79 | ₹19 | 76% off | Up to 3,000 |

The billing engine (`PLAN_CATALOG` in `lib/subscription-billing.ts`) uses `currentOfferPrice` for all invoice calculations. When the seasonal offer ends, change `currentOfferPrice` to `standardPrice` in `lib/constants/pricing.ts` and everything updates.

### Additional Costs
- **Notification credits** — tracked in org wallet (paise)
- **Payment gateway** — 2.5–3% charged to parent on online payments only
- **Storage** — charged only beyond 1 GB
- **Onboarding balance** — ₹10,000 paise given by Shiksha.cloud on signup

### UI Pricing Display Matrix

All prices are stored in **rupees** (not paise). Wallet is the only paise field. The price display in `BillingSettings.tsx` handles 5 pricing modes × 2 billing cycles:

```
                      Label           Price           Example
──────────────────────────────────────────────────────────────
PLAN_BASED  MONTHLY   /student/month  catalogMPrice   ₹49/student/month
PLAN_BASED  ANNUAL    /student/year   catalogAPrice   ₹470/student/year
CUSTOM_FLAT MONTHLY   /month          customPrice     ₹1000/month
CUSTOM_FLAT ANNUAL    /year           customPrice     ₹1000/year
CUSTOM_PER_STUDENT M  /student/month  unitPrice       ₹25/student/month
CUSTOM_PER_STUDENT A  /student/year   unitPrice       ₹25/student/year
CUSTOM_PER_USER  M    /user/month     unitPrice       ₹20/user/month
CUSTOM_PER_USER  A    /user/year      unitPrice       ₹20/user/year
CUSTOM_SLAB     M    /student/month   unitPrice       ₹15/student/month
CUSTOM_SLAB     A    /student/year    unitPrice       ₹15/student/year
```

**Public pricing page** (`app/(website)/pricing/`) only shows PLAN_BASED + STUDENT (Starter/Growth/Scale). The 4 custom modes are private platform-admin deals, never advertised.

**Annual badge logic**: standard plan + annual → "20% off"; custom + annual → "Annual"; monthly → "Billed monthly".

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

### Accessibility
- Every `DialogContent` / `SheetContent` must contain a `DialogTitle` / `SheetTitle` for screen readers (Radix UI requirement)
- When hiding the title visually, wrap it with `<VisuallyHidden>` from `@radix-ui/react-visually-hidden`:
  ```tsx
  <VisuallyHidden>
    <DialogTitle>Actual title</DialogTitle>
    <DialogDescription>Optional description</DialogDescription>
  </VisuallyHidden>
  ```

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
- [ ] Code cleanup: remove ~26 redundant `: Record<string, string>` / `: Type[]` annotations across lib/ and components/ (listed in conversation history)
- [ ] Inngest setup + pre-expiry trial reminders (7 days, 1 day before) + recurring invoice generation

---

## Changelog Workflow

```bash
# 1. Start a feature
git checkout develop
git checkout -b feature/my-feature

# 2. Test your changes on develop
git checkout develop
git merge feature/my-feature
# test everything

# 3. Ship to production
# ⚠️ REMINDER: Switch .env to production values before deploying
# ⚠️ REMINDER: Run `npx prisma migrate deploy` if schema changed
git checkout main
git merge develop
npm version patch   # or minor
git push origin main --tags
```

**When finishing a feature on `develop`:** update `CHANGELOG.md` under `[Unreleased]` — add/change/fix/remove categories. Keep entries high-level, user-facing.

**When merging `develop → main`:** move `[Unreleased]` entries into a new versioned section in `CHANGELOG.md`, then copy into `app/(website)/changelog/page.tsx` changelogEntries array.

The changelog page at `/changelog` is the public-facing version. `CHANGELOG.md` is the internal source of truth.

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
11. **Zero enforcement until 20 schools** — no student limit enforcement until we hit 20 onboarded orgs. Dashboard reminders/notifications are fine for visibility, but nothing should block or error. After 20 orgs, flip to full enforcement (payment + student limits). `createCustomDeal`, `recordManualSubscriptionPayment`, and `POST /api/billing/generate-invoice` are Shiksha Admin only (password-gated). `getManageableOrganizations`, PDF invoice download, and `changePlan` are org-admin accessible via session auth.
12. **Deploy checklist — always ask before shipping** — before every `npm version patch`: (a) confirm `.env` is switched to production, (b) run `npx prisma migrate deploy` if schema changed, (c) update changelog first. This is not optional — remind the user every time.

---

## Reference Files

| File | Contents |
|---|---|
| `docs/product.md` | Full product overview, features, pricing, comparisons |
| `docs/notifications.md` | All 21+ notification scenarios and 30+ templates |
| `docs/api.md` | API route reference |
| `docs/setup.md` | Local environment setup guide |
| `prisma/schema.prisma` | Source of truth for all data models |
| `CHANGELOG.md` | Internal changelog — update on every feature/fix merged to develop |

---

*Last updated: June 2026. Keep this file current — stale instructions are worse than no instructions.*
*When in doubt: ask before building. When certain: still lint and test.*