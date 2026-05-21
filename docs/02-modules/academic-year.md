Looking at your schema, here are the models that should or can logically depend on Academic Year:
Already linked to AcademicYear:

AcademicCalendar ✅
TeachingAssignment ✅
StudentAttendance ✅
Fee ✅
Notice ✅
AnonymousComplaint ✅
Leave ✅
ExamSession ✅ (Exam is under ExamSession, so indirectly linked)
Lead ✅


Models that should depend on AcademicYear but currently DON'T:

HallTicket — tickets are issued per session/year
ReportCard — linked to ExamSession but not directly to AcademicYear (indirect only)
ExamEnrollment — exam enrollments are year-specific
ExamResult — results belong to a year
StudentDocument — documents submitted per year (e.g., TC, forms)
FeeCategory — fee structures often change per year
TeacherProfile — not needed (static profile data)
Grade / Section — these are structural, but section assignments per year could be relevant


Models that clearly do NOT need AcademicYear:

Organization, User, Teacher, Parent, Subject, DeviceToken, NotificationSetting, FeeSenseAgent, ScheduledJob — these are either global config or person-level records.



Think in 3 categories:
🔴 Year-Specific Data (must have AcademicYear)
These records are created fresh every year:

Fee — fees are assigned per year
StudentAttendance — attendance is tracked per year
TeachingAssignment — teacher-subject-section mapping changes yearly
ExamSession → Exam → ExamResult → ExamEnrollment — all exam activity is per year
Leave — leave balance resets yearly
Notice — notices belong to a year's context
AcademicCalendar — holidays are defined per year
Lead — admissions are per academic year
AnonymousComplaint — contextually tied to a year

🟡 Year-Aware but Indirect (link via parent model, don't need direct AcademicYear)

HallTicket — already linked to ExamSession which has AcademicYear ✅
ReportCard — already linked to ExamSession ✅
FeePayment — already linked to Fee which has AcademicYear ✅
LeadActivity — linked to Lead ✅

🟢 Truly Independent (never needs AcademicYear)
These are master data or profiles that don't reset:

Organization, User, Teacher, TeacherProfile, Parent, Student
Grade, Section, Subject — these are structural templates
FeeCategory — just a category label
DeviceToken, NotificationSetting, ScheduledJob
FeeSenseAgent


One Gotcha in your schema:
StudentDocument — documents like TC, Aadhaar are uploaded once and don't belong to a year. Keep it independent. ✅
This framing should make every future model decision straightforward. Sonnet 4.6


Academic Year Architecture — Full Analysis & Recommendations
The Two Concepts (Glossary)
Term	Source	Meaning
Current Year (isCurrent: true)	DB field on 
AcademicYear
 model	The real, live academic year set by the admin. Write operations must go here.
Active Year (cookie / switcher)	activeAcademicYearId cookie	The year the user is viewing right now (may be a past year). Read operations should respect this.
sets cookie
READ ops
WRITE ops
AcademicYearSwitcher (UI)
activeAcademicYearId cookie
getActiveAcademicYearId()
DB: isCurrent=true
getCurrentAcademicYearId()
Prisma Extension (db.ts)
Database Queries
Your Current Architecture
Layer 1 — 
academicYear.ts
 (Server helpers)
Function	Returns	Use Case
getCurrentAcademicYearId()	ID of year with isCurrent: true	For writes — new Fee, Notice, Leave
getActiveAcademicYearId()	Cookie value → fallback to current	For reads — viewing data for selected year
getCurrentAcademicYear()	Full year object (isCurrent)	Display purposes
getActiveAcademicYear()	Full year object (cookie)	Display purposes
Layer 2 — 
db.ts
 (Prisma Extension — automatic scoping)
The Prisma extension in 
db.ts
 automatically injects academic year filters on these models: 
Fee
, TeachingAssignment, StudentAttendance, AcademicCalendar, Notice, AnonymousComplaint, Leave, Lead, ExamSession.

Reads (findMany, count, aggregate, groupBy) → auto-injects getActiveAcademicYearId() (cookie)
Writes (create, createMany, upsert, update) → auto-injects getCurrentAcademicYearId() (real)
Layer 3 — 
AcademicYearContext.tsx
 (Client-side)
Provides currentYear, viewingYear, isViewingPastYear, setViewingYear() to client components.

Layer 4 — 
AcademicYearSwitcher.tsx
 (UI)
Dropdown that calls 
setActiveAcademicYearId()
 → sets the cookie → router.refresh().

🚨 THE BUGS & CONFUSION
Bug 1: Double Filtering (Critical)
Several fee files manually call getCurrentAcademicYearId() and pass it in the where clause, but the Prisma extension also injects getActiveAcademicYearId(). This means:

// get-admin-fee-stats.ts
const academicYearId = await getCurrentAcademicYearId();  // ← MANUAL: always returns 2025-26
prisma.fee.aggregate({
  where: { organizationId, academicYearId }  // ← user passes current year
})
// THEN the Prisma extension silently adds: where: { ...where, academicYearId: getActiveAcademicYearId() }
// which OVERWRITES the manual value with the cookie value!
CAUTION

The Prisma extension does args.where = { ...args.where, academicYearId } which overwrites any manually passed academicYearId. So files that manually pass it are doing redundant work, and the extension's value always wins.

Affected files (manual + auto = conflict):

File	Manual Call	Auto Scope	Result
get-admin-fee-stats.ts
getCurrentAcademicYearId()	getActiveAcademicYearId()	⚠️ Manual value overwritten by extension
get-fee-category-distribution.ts
getCurrentAcademicYearId()	getActiveAcademicYearId()	⚠️ Manual value overwritten by extension
FeeAssignmentAction.ts
getCurrentAcademicYearId()	getCurrentAcademicYearId() (write)	✅ Both agree (but manual is redundant)
Bug 2: Missing Year Filter in 
get-admin-fee-stats.ts
typescript
// overdueStats — NO academicYearId filter!
prisma.fee.aggregate({
  where: { organizationId, status: 'OVERDUE' }  // Shows overdues from ALL years
})
// studentCounts — NO academicYearId filter!
prisma.fee.groupBy({
  where: { organizationId }  // Counts students from ALL years
})
But wait — the Prisma extension auto-injects it on aggregate and groupBy. So actually, these get scoped to the active year via the extension. The real bug is the inconsistency: feeStats gets double-filtered, but overdueStats and studentCounts only get the extension's filter.

Bug 3: Switcher Doesn't Affect Some Pages
Files like 
get-all-students-fees.ts
 and 
GetFeesByParentId.ts
 don't manually scope at all — they rely entirely on the Prisma extension. This is actually correct behavior, but confusing because other files do it manually.

Bug 4: 
getMonthlyFeeData.ts
 Bypasses Year Scoping
getMonthlyFeeData.ts
 queries feePayment.findMany() — but FeePayment is NOT in the YEAR_SCOPED_MODELS set, so it gets no auto-scoping. It manually filters by date range, which is correct for its chart use case.

Bug 5: Debug console.log Left in Production Code
get-admin-fee-stats.ts
 has a large console.log statement that runs extra queries in production.

❓ Your Questions Answered
1. Should previous academic year fees show in the current year?
No. The current architecture is correct in principle:

When viewing the current year → show only current year's fees
When the admin switches to a past year → show that year's fees
The Prisma extension handles this automatically
The problem is that some files fight the extension by manually calling getCurrentAcademicYearId(), which creates confusion.

2. Should FeeCategory be dependent on academicYearId?
No. Keep FeeCategory as org-level (no academic year dependency).

Reasoning:

Categories like "Tuition Fee", "Lab Fee", "Exam Fee" are structural — they don't change year to year
The 
Fee
 model (the actual assignment of a fee to a student) already has academicYearId — this is where year-scoping belongs
A category is just a label/type; the Fee record is what's scoped to a year
If you add academicYearId to FeeCategory, admins would need to recreate categories every year — terrible UX
shared across years
shared across years
has
has
FeeCategory (org-level)
Fee 2024-25
Fee 2025-26
FeePayment
FeePayment
✅ Recommended Solution
Rule: Let the Prisma Extension Do Its Job
The extension in 
db.ts
 already handles scoping. Do not manually call getCurrentAcademicYearId() or getActiveAcademicYearId() in data-fetching files for scoped models.

What to Change
File	Current	Fix
get-admin-fee-stats.ts
Manually calls getCurrentAcademicYearId()	Remove manual call — extension handles it
get-fee-category-distribution.ts
Manually calls getCurrentAcademicYearId()	Remove manual call — extension handles it
FeeAssignmentAction.ts
Manually calls getCurrentAcademicYearId() for write	Remove manual call — extension handles createMany writes too
get-admin-fee-stats.ts
Debug console.log	Remove it
All notice/leave/lead files using getCurrentAcademicYearId() manually	Manual + extension double-scope	Audit each — remove manual scoping where extension covers it
When You SHOULD Manually Scope
Only in these cases:

Cross-year queries (e.g., comparing fees across years) → use adminPrisma (bypasses extension)
Models NOT in YEAR_SCOPED_MODELS (e.g., FeePayment, 
Student
, 
FeeCategory
) → these need manual filtering if year context matters
When you need the getCurrentAcademicYearId explicitly for display or logic (not for query filters on scoped models)
Quick Reference Card
┌─────────────────────────────────────────────────────────┐
│              ACADEMIC YEAR DECISION TREE                │
│                                                         │
│  Q: Am I querying a YEAR_SCOPED_MODEL?                 │
│  ├─ YES → Don't add academicYearId manually.           │
│  │        The Prisma extension handles it.              │
│  │        Import from '@/lib/db' (not prisma-base).    │
│  │                                                      │
│  └─ NO → Is year context relevant?                     │
│     ├─ YES → Manually call getActiveAcademicYearId()   │
│     │        for reads, getCurrentAcademicYearId()      │
│     │        for writes.                                │
│     └─ NO → No action needed.                          │
│                                                         │
│  Q: Do I need cross-year data?                         │
│  └─ YES → Use adminPrisma (bypasses extension).        │
│                                                         │
│  Q: Which function for display in client components?   │
│  └─ Use useAcademicYear() hook from context.           │
│     - viewingYear = what user is browsing              │
│     - currentYear = the real/live year                 │
│     - isViewingPastYear = are they in history mode?    │
└─────────────────────────────────────────────────────────┘
Summary of Models & Their Year Dependency
Model	Has academicYearId	Auto-Scoped by Extension	Should Keep?
Fee
✅ Yes	✅ Yes	✅ Correct
FeePayment	❌ No	❌ No	✅ Correct (linked via Fee)
FeeCategory
❌ No	❌ No	✅ Correct (org-level)
Student
❌ No	❌ No	✅ Correct (persistent entity)
TeachingAssignment	✅ Yes	✅ Yes	✅ Correct
StudentAttendance	✅ Yes	✅ Yes	✅ Correct
Notice	✅ Yes	✅ Yes	✅ Correct
ExamSession	✅ Yes	✅ Yes	✅ Correct
IMPORTANT

The schema design is sound. The confusion comes entirely from inconsistent usage — some files trust the extension, others fight it. The fix is standardization, not architecture changes.