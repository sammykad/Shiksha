# NEXUS ATTENDANCE MODULE — PRE-PRODUCTION AUDIT REPORT

**Date:** 2026-04-12
**Auditor:** Senior Full-Stack Engineer
**Scope:** Attendance Management Module — Multi-tenant School SaaS
**Stack:** Next.js 16, Prisma 7, PostgreSQL (Accelerate), Clerk Auth, Upstash Redis, Inngest, Knock Notifications

---

## CRITICAL BUGS (data loss, security, financial equivalents)

### BUG #1 — Missing SessionType in Unique Constraint

**DOMAIN:** 1.1 — Data Model Integrity / Unique Constraint
**FILE:** `prisma/schema.prisma` (line 730)
**DESCRIPTION:** `@@unique([studentId, date])` does NOT include `sessionType`. The `StudentAttendance` model has no `sessionType` field at all. If a school runs morning and afternoon sessions separately, marking attendance for the same student on the same day twice will throw a unique constraint violation on the second mark, causing a 500 error.
**SCENARIO:** A school with half-day sessions tries to mark morning attendance at 9 AM, then afternoon at 1 PM. The second mark fails with a P2002 unique constraint error. Teacher sees a crash.
**FIX:**

```prisma
// Add enum:
enum SessionType {
  MORNING
  AFTERNOON
  FULL_DAY
}

// In StudentAttendance model:
sessionType SessionType @default(FULL_DAY)

// Change unique constraint:
@@unique([studentId, date, sessionType])
```

---

### BUG #2 — Missing Critical Fields on StudentAttendance

**DOMAIN:** 1.3 — Field Completeness
**FILE:** `prisma/schema.prisma` (lines 712-735)
**DESCRIPTION:** `StudentAttendance` is missing these critical fields:

- `gradeId` — denormalized for fast reporting
- `markedBy` (FK → User) — `recordedBy` is a plain String, not a FK relation
- `markedAt` (DateTime) — uses `createdAt` implicitly
- `editedBy` (FK → User, nullable) — no edit tracking
- `editedAt` (DateTime, nullable) — no edit timestamp
- `organizationId` — multi-tenancy scope missing!
- `isAIGenerated` (Boolean) — no AI tracking
- `isConfirmed` (Boolean) — no draft/confirmed state
- `sessionType` — no half-day tracking

The `recordedBy` field is a **String** (e.g., "John Doe") not a FK to User. This means there's no referential integrity, no cascade on user deletion, and no way to join to the User table for audit queries.

**SCENARIO:** A teacher is fired, their User is deleted. All attendance records they marked become orphaned — you can't query "who marked attendance" anymore. An admin edits attendance but there's no `editedBy`/`editedAt` — no audit trail exists.
**FIX:**

```prisma
model StudentAttendance {
  id String @id @default(cuid())

  date        DateTime @db.Date
  status      AttendanceStatus
  sessionType SessionType @default(FULL_DAY)
  note        String?

  markedBy   String
  markedByUser User?    @relation("AttendanceMarkedBy", fields: [markedBy], references: [id])
  markedAt   DateTime   @default(now())
  editedBy   String?
  editedByUser User?    @relation("AttendanceEditedBy", fields: [editedBy], references: [id])
  editedAt   DateTime?

  studentId String
  sectionId String
  gradeId   String       // denormalized for reporting
  organizationId String  // multi-tenancy

  student        Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  section        Section      @relation(fields: [sectionId], references: [id], onDelete: Restrict)
  grade          Grade        @relation(fields: [gradeId], references: [id], onDelete: Restrict)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Restrict)
  academicYearId String

  isAIGenerated  Boolean @default(false)
  isConfirmed    Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, date, sessionType])
  @@index([organizationId, date])
  @@index([studentId, academicYearId])
  @@index([sectionId, date])
  @@index([studentId, date])
  @@index([organizationId, status, date])
  @@index([organizationId, academicYearId])
  @@index([markedBy])
}
```

---

### BUG #3 — AttendanceStatus Enum Incomplete

**DOMAIN:** 1.4 — Status Enum Completeness
**FILE:** `prisma/schema.prisma` (line 937)
**DESCRIPTION:** `AttendanceStatus` enum only has `PRESENT`, `ABSENT`, `LATE`. Missing: `HALF_DAY`, `EXCUSED`, `HOLIDAY`, `LEAVE_APPROVED`. This means:

- Holidays cannot be distinguished from absences
- Medical leave cannot be tracked
- Half-day attendance is impossible
- Excused absences count the same as unexcused
  **SCENARIO:** School declares Diwali holiday. A student who wasn't marked (because school was closed) shows as ABSENT in reports. Their attendance % drops from 92% to 88%. Parent complains.
  **FIX:**

```prisma
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  EXCUSED
  HOLIDAY
  LEAVE_APPROVED
}
```

---

### BUG #4 — Teacher Scope Enforcement: NO AUTH CHECKS

**DOMAIN:** 2.1 — Role-Based Access Control
**FILE:** `lib/data/attendance/mark-attendance.ts`
**DESCRIPTION:** The `markAttendance()` server action has **ZERO** role-based access control. It does NOT:

- Verify the caller is a TEACHER with permission to this section
- Check TeachingAssignment for teacher-section mapping
- Verify the section belongs to the caller's organization
- Prevent marking future dates
- Check if the date is a holiday in AcademicCalendar

Any authenticated user with any role can mark attendance for ANY section in ANY organization.

**SCENARIO:** A STUDENT-role user crafts a server action call and marks attendance for sections they have no business accessing. A parent marks their child's section as PRESENT every day.
**FIX:**

```ts
// Add these guards at the top of markAttendance():

// 1. Verify teacher has teaching assignment for this section
const teacher = await prisma.teacher.findUnique({
  where: { userId: user.clerkId, organizationId },
  include: {
    teachingAssignment: { where: { sectionId, status: 'ASSIGNED' } },
  },
});

if (user.role === 'TEACHER' && !teacher?.teachingAssignment.length) {
  throw new Error('You are not assigned to this section');
}

// 2. Prevent future dates
if (toISTDate(selectedDate) > toISTDate()) {
  throw new Error('Cannot mark attendance for future dates');
}

// 3. Holiday check
const holiday = await prisma.academicCalendar.findFirst({
  where: {
    organizationId,
    startDate: { lte: toISTDate(selectedDate) },
    endDate: { gte: toISTDate(selectedDate) },
  },
});
if (holiday) {
  throw new Error(`Cannot mark attendance: ${holiday.name} is a holiday`);
}
```

---

### BUG #5 — Parent Read Access: Data Leakage of Unconfirmed Records

**DOMAIN:** 2.3 — Parent Read Access
**FILE:** `lib/data/attendance/get-child-attendance-data.ts`
**DESCRIPTION:** The parent query returns `recordedBy` (teacher name) and `sectionId` in the attendance records. While the ownership guard is correct (verifying `parent: { userId }`), the returned data includes teacher names that shouldn't be exposed if the system intends strict privacy boundaries. More critically, **the query fetches ALL attendance records without checking `isConfirmed`**, meaning parents see AI draft suggestions as real attendance if AI-generated unconfirmed records exist.
**SCENARIO:** AI generates attendance suggestions overnight with isConfirmed=false. Parent checks portal at 7 AM, sees their child marked ABSENT (AI guess). Child is actually present. Parent panics and calls school.
**FIX:** Add `isConfirmed: true` filter for parent-facing queries, or at minimum exclude unconfirmed AI drafts from the parent view.

---

### BUG #6 — AI Draft vs Confirmed State: NOT IMPLEMENTED

**DOMAIN:** 3.1 — AI-Powered Suggestions
**FILE:** `prisma/schema.prisma`
**DESCRIPTION:** The schema has no `isAIGenerated` or `isConfirmed` fields on `StudentAttendance`. There is no mechanism to distinguish AI suggestions from teacher-confirmed attendance. Any AI suggestion system would write directly as real records.
**SCENARIO:** AI job runs, suggests 40 students as PRESENT and 10 as ABSENT. These are saved as real records. Parents get "ABSENT" notifications for 10 kids. Teacher hasn't reviewed yet. All 10 parents call the school in panic.
**FIX:** Add `isAIGenerated` and `isConfirmed` boolean fields (see BUG #2). AI writes with `isConfirmed=false`. Only confirmed records trigger notifications and show to parents.

---

### BUG #7 — AI Suggestion Race Condition: NO PROTECTION

**DOMAIN:** 3.2 — AI-Powered Suggestions
**FILE:** `lib/data/attendance/mark-attendance.ts`
**DESCRIPTION:** The `markAttendance()` function uses `upsert` with `where: { studentId_date }`. If an AI job runs simultaneously with a teacher marking attendance, the AI's upsert will **overwrite** the teacher's work without any guard. There is no `WHERE NOT EXISTS` check.
**SCENARIO:** Teacher spends 15 minutes marking 40 students. AI background job triggers, sees no records (because teacher used upsert but hadn't committed yet in a slow transaction), creates its own records. Teacher's work is silently lost.
**FIX:** AI generation must only target students with NO existing record: `WHERE NOT EXISTS (SELECT 1 FROM StudentAttendance WHERE studentId = X AND date = Y)`. Use `createMany` with `skipDuplicates`.

---

### BUG #8 — Date Timezone: Partially Correct But Risky

**DOMAIN:** 4.3 — Date Timezone
**FILE:** `prisma/schema.prisma` (line 714), `lib/utils.ts`
**DESCRIPTION:** The `date` field is `DateTime` (not `@db.Date`). The codebase uses `toISTDate()` which converts IST midnight to a UTC datetime (e.g., IST April 12 midnight = UTC April 11 18:30). While the `toISTDate()` utility handles this, the underlying DB column stores a full DateTime with time component. If any query bypasses `toISTDate()` and uses a raw date, timezone drift occurs.
**SCENARIO:** A direct Prisma query uses `new Date('2026-04-12')` (UTC midnight). This does NOT match records stored via `toISTDate()` (UTC April 11 18:30). Reports miss records.
**FIX:** Change to `date DateTime @db.Date` in Prisma schema. This strips the time component at the database level, making timezone handling irrelevant at query time.

---

## HIGH BUGS (functional breakage visible to users)

### BUG #9 — Attendance Percentage Calculation Is Wrong

**DOMAIN:** 4.1 — Attendance Calculations & Reports
**FILE:** `lib/data/reports/get-reports-data.ts` (lines 149-163), `lib/data/attendance/attendance-utils.ts` (line 17)
**DESCRIPTION:** The attendance percentage formula is simply `(PRESENT + LATE) / totalDays × 100`. Problems:

- `HALF_DAY` is not counted as 0.5
- `EXCUSED` absences count as absent (should not count against student)
- `HOLIDAY` and `LEAVE_APPROVED` are NOT excluded from denominator
- If these statuses existed, the formula would be catastrophically wrong

Current formula: `(presentDays + lateDays) / totalDays × 100`
Correct formula: `(PRESENT + LATE + HALF_DAY × 0.5 + EXCUSED) / (TOTAL - HOLIDAY - LEAVE_APPROVED) × 100`

**SCENARIO:** Student has 180 working days, 10 holidays, 5 leave-approved days. Denominator should be 165. But formula uses 180. Attendance % is 10 percentage points lower than it should be.
**FIX:**

```ts
function calcPercentage(records: StudentAttendance[]) {
  const workingDays = records.filter(
    (r) => !['HOLIDAY', 'LEAVE_APPROVED'].includes(r.status),
  ).length;
  const presentDays = records.filter((r) =>
    ['PRESENT', 'LATE'].includes(r.status),
  ).length;
  const halfDays = records.filter((r) => r.status === 'HALF_DAY').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;
  const numerator = presentDays + halfDays * 0.5 + excused;
  return workingDays > 0 ? Math.round((numerator / workingDays) * 100) : 0;
}
```

---

### BUG #10 — Holiday Guard Missing in Server Action

**DOMAIN:** 5.3 — Teacher Marking Workflow
**FILE:** `lib/data/attendance/mark-attendance.ts`
**DESCRIPTION:** There is no server-side check preventing attendance from being marked on a holiday. The UI might disable the date picker, but server actions are callable directly.
**FIX:** Add holiday check before marking (see BUG #4 fix above).

---

### BUG #11 — Future Date Guard Is Incomplete

**DOMAIN:** 5.4 — Teacher Marking Workflow
**FILE:** `lib/data/attendance/mark-attendance.ts`
**DESCRIPTION:** There is no check preventing attendance from being marked for future dates. The UI disables future dates in the calendar component (`disabled={(date) => toISTDate(date) > toISTDate(new Date())}`), but the server action has no equivalent check.
**FIX:** Add `if (toISTDate(selectedDate) > toISTDate()) throw new Error('Cannot mark future dates')`.

---

### BUG #12 — Absent Alert Triggers: Sequential API Calls

**DOMAIN:** 6.1 — Notifications & Parent Alerts
**FILE:** `lib/data/attendance/mark-attendance.ts` (lines 66-84)
**DESCRIPTION:** Notifications are sent **synchronously in a loop** after marking attendance. For 10 absent students, this fires 10 sequential Knock API calls. Each call involves multiple channel sends (SMS, WhatsApp, Email, Push). If any call is slow, the entire server action hangs. With 40 students and 15 absent, this could take 30+ seconds.
**SCENARIO:** Teacher clicks "Submit". The page hangs for 45 seconds while 15 notifications are sent. Teacher thinks it's broken, clicks again. Duplicate notifications fire.
**FIX:** Queue notifications via Inngest. Return success immediately to the teacher. Let Inngest handle notification delivery asynchronously.

---

### BUG #13 — Notification Deduplication: Partially Implemented

**DOMAIN:** 6.3 — Notifications & Parent Alerts
**FILE:** `lib/notifications/engine.ts` (lines 170-200)
**DESCRIPTION:** The engine does have idempotency via `buildLogKey` and `buildInboxKey`, which prevents duplicate sends for the same `eventId`. However, the `eventId` for attendance is `attendance:${p.attendanceId}:absent` — this changes when a record is updated (new `attendanceId` on upsert). If attendance is edited 3 times, the parent gets 3 notifications.
**SCENARIO:** Teacher marks student ABSENT → parent notified. Teacher corrects to PRESENT → no notification (correct). Teacher corrects back to ABSENT → parent notified AGAIN. Parent thinks child was absent twice.
**FIX:** Use a stable event ID: `attendance:${studentId}:${date}:${status}` rather than `attendance:${recordId}:${status}`. Add a "correction notification" flow that explicitly says "CORRECTION: Student X was marked PRESENT (previously ABSENT)".

---

### BUG #14 — Section Deletion Orphans Attendance Records

**DOMAIN:** 1.2 — Cascade Rules
**FILE:** `prisma/schema.prisma` (line 438)
**DESCRIPTION:** `Section` has `onDelete: Cascade` for Grade relation but the `StudentAttendance → Section` relation has no explicit `onDelete` behavior. When a section is deleted, all its attendance records either throw a constraint error or become orphaned (depending on Prisma's default).
**FIX:** Add `onDelete: Restrict` to `StudentAttendance → Section` relation:

```prisma
section Section @relation(fields: [sectionId], references: [id], onDelete: Restrict)
```

---

### BUG #15 — Bulk Mark Uses N Individual Transactions

**DOMAIN:** 5.1 — Teacher Marking Workflow
**FILE:** `lib/data/attendance/mark-attendance.ts` (lines 47-55)
**DESCRIPTION:** `markAttendance` uses `prisma.$transaction(records.map(...))` with individual `upsert` calls. For a section of 60 students, this is 60 individual database queries wrapped in a transaction. While this works, it's significantly slower than `createMany` with `skipDuplicates`.
**FIX:** Split into createMany for new records + updateMany for existing:

```ts
// First, find which students already have records
const existing = await prisma.studentAttendance.findMany({
  where: { date, studentId: { in: records.map((r) => r.studentId) } },
  select: { studentId: true, id: true },
});

const existingIds = new Set(existing.map((r) => r.studentId));
const creates = records.filter((r) => !existingIds.has(r.studentId));
const updates = records.filter((r) => existingIds.has(r.studentId));

if (creates.length) {
  await prisma.studentAttendance.createMany({
    data: creates.map((r) => ({
      ...r,
      date,
      sectionId,
      academicYearId,
      recordedBy,
    })),
    skipDuplicates: true,
  });
}
```

---

## MEDIUM BUGS (edge cases, UX issues, performance)

### BUG #16 — Working Day Calculation Uses Attendance Records, Not AcademicCalendar

**DOMAIN:** 4.2 — Attendance Calculations
**FILE:** `lib/data/reports/get-reports-data.ts`
**DESCRIPTION:** Working days are calculated as `StudentAttendance.length` — i.e., the total number of attendance records. This counts every day a record exists, including holidays if they were marked. The correct approach is to use `AcademicCalendar` to determine actual working days.
**FIX:** Query `AcademicCalendar` for holidays between date range and subtract from total calendar days.

---

### BUG #17 — Academic Year Boundary: Records Not Filtered Properly

**DOMAIN:** 4.5 — Attendance Calculations
**FILE:** `lib/data/reports/get-reports-data.ts` (line 125)
**DESCRIPTION:** The `getAttendanceReportData` function filters by `academicYearId` in the nested attendance query. This is correct. However, `getMonthlyAttendance.ts` in `lib/data/parent/attendance-monitor/` does NOT filter by `academicYearId` — it fetches ALL attendance for a student regardless of year.
**SCENARIO:** Student was in Grade 5 last year and Grade 6 this year. Parent sees combined attendance from both years. Monthly stats are wrong.
**FIX:** Add `academicYearId` filter to `getMonthlyAttendance`.

---

### BUG #18 — Analytics Page Runs Live Queries Without Caching

**DOMAIN:** 4.7 — Attendance Calculations
**FILE:** `lib/data/attendance/get-attendance-completion-stats.ts`
**DESCRIPTION:** The analytics page runs `prisma.section.findMany` with nested `students` and `StudentAttendance` for ALL sections on every page load. For a 1000-student school, this loads the entire student roster into memory and maps it client-side. No Redis caching, no pre-computation.
**FIX:** Cache in Redis with 5-minute TTL. Or use an Inngest nightly job to pre-compute daily stats.

---

### BUG #19 — Section Student List Not Synced to Date

**DOMAIN:** 5.5 — Teacher Marking Workflow
**FILE:** `lib/data/attendance/mark-attendance.ts`
**DESCRIPTION:** The attendance sheet uses the **current** section roster (`prisma.section.findFirst({ include: { students } })`). If a student was transferred today, the sheet may show incorrect students. There's no historical roster lookup.
**FIX:** Use the section's student roster as of the selected date. Requires a `StudentSectionHistory` model.

---

### BUG #20 — Half-Day Handling Not Supported

**DOMAIN:** 7.1 — Edge Cases
**FILE:** `prisma/schema.prisma`
**DESCRIPTION:** No `sessionType` or `HALF_DAY` status exists. Schools with half-day systems (common in India) cannot use this system.
**FIX:** Add `sessionType` and `HALF_DAY` status (see BUG #1 and #3).

---

### BUG #21 — No Late Arrival Notification Differentiation for New Statuses

**DOMAIN:** 6.5 — Notifications & Parent Alerts
**FILE:** `lib/notifications/notify.ts`
**DESCRIPTION:** Both `notify.attendance.absent` and `notify.attendance.late` exist and send different templates. This is correct. However, there's no notification for `HALF_DAY`, `EXCUSED`, or `LEAVE_APPROVED` status changes.
**FIX:** Add notification templates for these statuses if they're used.

---

### BUG #22 — Missing Database Indexes

**DOMAIN:** 8.1 — Performance & Scalability
**FILE:** `prisma/schema.prisma` (lines 731-735)
**DESCRIPTION:** Current indexes on `StudentAttendance`:

- `@@index([academicYearId])` ✓
- `@@index([studentId])` — partial (needs composite with `academicYearId`)
- `@@index([date])` — partial (too broad)
- `@@index([sectionId, date])` ✓

Missing:

- `(organizationId, date)` — for daily admin views
- `(studentId, academicYearId)` — for student history
- `(studentId, date)` — for parent portal lookup
- `(organizationId, status, date)` — for analytics
- `(organizationId, academicYearId)` — for year-scoped queries

**FIX:**

```prisma
@@index([organizationId, date])
@@index([studentId, academicYearId])
@@index([sectionId, date])
@@index([studentId, date])
@@index([organizationId, status, date])
@@index([organizationId, academicYearId])
@@index([markedBy])
```

---

### BUG #23 — Parent Notification Preferences Not Checked Before Sending

**DOMAIN:** 6.4 — Notifications & Parent Alerts
**FILE:** `lib/notifications/engine.ts` + `lib/notifications/organization-notification-settings.ts`
**DESCRIPTION:** The notification system checks `NotificationSetting` at the **organization** level (which channels are enabled org-wide). But there's no per-**parent** preference system. A parent cannot opt out of attendance notifications specifically.
**FIX:** Add a `ParentNotificationPreference` model with per-parent, per-event-type settings.

---

### BUG #24 — New Student Mid-Year Denominator Issue

**DOMAIN:** 7.5 — Edge Cases
**FILE:** `lib/data/reports/get-reports-data.ts`
**DESCRIPTION:** Attendance percentage uses `totalDays = StudentAttendance.length`. If a student joins in November, they only have ~40 attendance records out of 200 working days. The formula `(present/40)` is correct for their personal %, but if any report compares them against the full-year denominator, they'll appear at 20%.
**FIX:** Ensure all reports use `StudentAttendance.length` as the denominator (not total school working days). This is currently correct in most places but verify edge cases.

---

## MISSING FEATURES

### FEATURE 1: AI Attendance Suggestion System (Draft/Confirm Flow)

**WHY NEEDED:** Schools want automated attendance based on historical patterns, teacher assignments, and biometric data. Currently there's no AI integration.
**MINIMUM IMPLEMENTATION:**

```ts
// Inngest job: daily-attendance-suggestion
export const generateAttendanceSuggestions = inngest.createFunction(
  { id: 'daily-attendance-suggestion' },
  { cron: '0 0 * * *' }, // midnight IST
  async ({ step }) => {
    // 1. Get all sections without today's attendance
    // 2. For each section, generate suggestions based on historical patterns
    // 3. Save with isConfirmed=false, isAIGenerated=true
    // 4. Notify teacher that suggestions are ready for review
  },
);
```

---

### FEATURE 2: StudentSectionHistory Model

**WHY NEEDED:** When a student changes sections mid-year, their attendance history splits. Without a history table, you can't correctly query "all attendance for student X in section Y during period Z".
**MINIMUM IMPLEMENTATION:**

```prisma
model StudentSectionHistory {
  id        String   @id @default(cuid())
  studentId String
  sectionId String
  gradeId   String
  fromDate  DateTime @db.Date
  toDate    DateTime @db.Date? // null = current
  student   Student  @relation(fields: [studentId], references: [id])
  section   Section  @relation(fields: [sectionId], references: [id])
  grade     Grade    @relation(fields: [gradeId], references: [id])

  @@index([studentId, fromDate])
  @@index([sectionId, fromDate])
}
```

---

### FEATURE 3: Inngest Attendance Reminder Job

**WHY NEEDED:** Teachers forget to mark attendance. An automated reminder at 9:30 AM for unmarked sections reduces missed attendance.
**MINIMUM IMPLEMENTATION:**

```ts
export const attendanceReminderJob = inngest.createFunction(
  { id: 'attendance-reminder' },
  { cron: '30 4 * * *' }, // 10:00 AM IST
  async ({ step }) => {
    // 1. Get all sections
    // 2. Filter out sections that already have today's attendance
    // 3. Filter out sections on holiday (AcademicCalendar check)
    // 4. Filter out sections with no assigned teacher
    // 5. Send reminder notification to assigned teacher
  },
);
```

---

### FEATURE 4: Correction Notification Flow

**WHY NEEDED:** When attendance is corrected (e.g., ABSENT → PRESENT), parents need a "correction" notification, not a duplicate "absent" notification.
**MINIMUM IMPLEMENTATION:**

```ts
// In mark-attendance.ts upsert:
if (existingRecord && existingRecord.status !== newStatus) {
  await notify.attendance.correction({
    eventId: `attendance:${studentId}:${date}:correction`,
    recipients: [{ studentId }],
    variables: {
      studentName,
      date,
      previousStatus: existingRecord.status,
      newStatus,
      grade,
      section,
    },
  });
}
```

---

### FEATURE 5: Retroactive Edit Window (2-Day Limit for Teachers)

**WHY NEEDED:** Teachers should be able to correct yesterday's attendance but not last month's. Admins can edit any date.
**MINIMUM IMPLEMENTATION:**

```ts
// In mark-attendance.ts
const todayIST = toISTDate();
const twoDaysAgo = toISTDate(subDays(new Date(), 2));

if (user.role === 'TEACHER' && toISTDate(selectedDate) < twoDaysAgo) {
  throw new Error(
    'Teachers can only edit attendance from the last 2 days. Contact admin for older changes.',
  );
}
```

---

## SCHEMA ADDITIONS SUMMARY

```prisma
// 1. New enums
enum SessionType {
  MORNING
  AFTERNOON
  FULL_DAY
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  EXCUSED
  HOLIDAY
  LEAVE_APPROVED
}

// 2. StudentAttendance model — replace entirely
model StudentAttendance {
  id String @id @default(cuid())

  date        DateTime @db.Date
  status      AttendanceStatus
  sessionType SessionType @default(FULL_DAY)
  note        String?

  markedBy   String
  markedByUser User?    @relation("AttendanceMarkedBy", fields: [markedBy], references: [id])
  markedAt   DateTime   @default(now())
  editedBy   String?
  editedByUser User?    @relation("AttendanceEditedBy", fields: [editedBy], references: [id])
  editedAt   DateTime?

  studentId String
  sectionId String
  gradeId   String
  organizationId String

  student        Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  section        Section      @relation(fields: [sectionId], references: [id], onDelete: Restrict)
  grade          Grade        @relation(fields: [gradeId], references: [id], onDelete: Restrict)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Restrict)
  academicYearId String

  isAIGenerated  Boolean @default(false)
  isConfirmed    Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, date, sessionType])
  @@index([organizationId, date])
  @@index([studentId, academicYearId])
  @@index([sectionId, date])
  @@index([studentId, date])
  @@index([organizationId, status, date])
  @@index([organizationId, academicYearId])
  @@index([markedBy])
}

// 3. New relation fields on User
model User {
  // ... existing fields ...
  markedAttendance    StudentAttendance[] @relation("AttendanceMarkedBy")
  editedAttendance    StudentAttendance[] @relation("AttendanceEditedBy")
}

// 4. New model
model StudentSectionHistory {
  id        String   @id @default(cuid())
  studentId String
  sectionId String
  gradeId   String
  fromDate  DateTime @db.Date
  toDate    DateTime @db.Date?
  student   Student  @relation(fields: [studentId], references: [id])
  section   Section  @relation(fields: [sectionId], references: [id])
  grade     Grade    @relation(fields: [gradeId], references: [id])

  @@index([studentId, fromDate])
  @@index([sectionId, fromDate])
}
```

---

## INDEX ADDITIONS SUMMARY

| Index                                       | Purpose                                         |
| ------------------------------------------- | ----------------------------------------------- |
| `@@index([organizationId, date])`           | Daily admin views across all sections           |
| `@@index([studentId, academicYearId])`      | Student histories scoped to academic year       |
| `@@index([studentId, date])`                | Parent portal lookup (already partially exists) |
| `@@index([organizationId, status, date])`   | Analytics aggregations (absent count today)     |
| `@@index([organizationId, academicYearId])` | Year-scoped queries for reports                 |
| `@@index([markedBy])`                       | Find all records marked by a specific teacher   |

---

## RECOMMENDED ARCHITECTURE CHANGES

### 1. Notifications → Inngest Queue (not synchronous)

Move all `notify.attendance.*` calls out of `markAttendance()`. Instead:

```ts
// In mark-attendance.ts, after successful save:
await inngestClient.send({
  name: 'attendance/marked',
  data: { attendanceRecordIds, organizationId, date, changedStatuses },
});

// Inngest function handles notifications with rate limiting, retries, and dedup
```

### 2. Replace `recordedBy: String` with FK `markedBy: User`

This is critical for audit trails, teacher turnover, and multi-tenant security.

### 3. Add `organizationId` to `StudentAttendance`

Every other multi-tenant model has `organizationId`. Its absence on `StudentAttendance` means org-scoped queries must JOIN through `Student → organizationId` — slow and error-prone.

### 4. Implement Server-Side Role Guards on ALL Attendance Server Actions

Currently, `markAttendance()`, `deleteAttendance()`, and `getAttendanceByDateAndSection()` have no role-based access control. Every server action needs:

- `ADMIN` — full access to org
- `TEACHER` — only assigned sections via `TeachingAssignment`
- `PARENT` — only own children via `ParentStudent`
- `STUDENT` — only own records

### 5. Add Attendance Reminder Inngest Job

Missing entirely. Should run at 10:00 AM IST daily, check which sections haven't been marked, exclude holidays and teacherless sections, and notify teachers.

### 6. Caching Strategy for Analytics

- Parent child attendance → Redis 5-min TTL
- Admin completion stats → Redis 5-min TTL
- Analytics page → Inngest pre-computed nightly, Redis 1-hour TTL
- Teacher marking view → No cache (real-time required)

### 7. Replace N Individual Upserts with createMany + updateMany

For sections with 60+ students, the current `$transaction` with N individual upserts is slow. Batch operations are essential at scale.

> **shiksha.cloud**
> Phase 1 - Financial Audit (P0/P1):

File: app/dashboard/reports/fee-reconciliation/page.tsx  
Bug type: Miscalculation / Wrong data  
Severity: P0 (blocks usage)  
Description: This page uses DUMMY_DATA hardcoded in the file instead of fetching real reconciliation data from the database. The stats calculations (total internal amount, platform fee, PG fee, etc.) are all based on this dummy data, meaning the report shows fake data rather than actual reconciliation information. This renders the entire reconciliation report useless for actual financial tracking.  
Fix: Replace the DUMMY_DATA with actual data fetched from the database via proper API calls to reconciliation data.

File: app/dashboard/fees/student/page.tsx  
Bug type: Missing validation / Potential incorrect display  
Severity: P1 (wrong data)  
Description: In the fee dashboard, the "Paid Fees" percentage calculation {totalFees > 0 ? ((paidFees / totalFees) \* 100).toFixed(1) : "0.0"}% is mathematically correct, but there's a potential display issue when fees exist but paidAmount is 0 - it shows "0.0%" which is correct, but the UI doesn't distinguish between "no fees" and "fees exist but none paid". This could confuse users about their actual fee status.  
Fix: Consider showing different UI states for "No fee records" vs "Fee records exist but payment is 0%".

File: app/dashboard/exams/bulk/page.tsx  
Bug type: Broken button / Crash  
Severity: P1 (wrong data)  
Description: The BulkExamCreateForm is passed default values that could be undefined: defaultSessionId={examSession[0]?.id}, defaultGradeId={grades[0]?.id}, defaultSectionId={sections[0]?.id}. If any of these arrays are empty (no exam sessions, grades, or sections), the form receives undefined IDs which could cause crashes or incorrect behavior when the form tries to use these IDs.  
Fix: Add proper fallback handling when arrays are empty, or disable the form/show appropriate UI when required data is missing.
Phase 2 - Attendance Audit (P1):

File: app/dashboard/attendance/analytics/page.tsx  
Bug type: Wrong percentage calculation / Misleading metric  
Severity: P1 (wrong data)  
Description: The attendance percentage calculation in get-attendance-completion-stats.ts has a logical flaw in terminology. The function calculates globalCompletedSections as sections where 100% of students have attendance recorded (any status: PRESENT, LATE, or ABSENT). However, the UI labels this as "Completion Rate" which suggests it's measuring attendance completion, but it's actually measuring record-taking completion. This could mislead administrators about actual attendance rates vs. attendance-taking compliance.  
Fix: Rename the metric from "Completion Rate" to "Record-Taking Completion" or similar to accurately reflect what it measures. Keep the attendance percentage as the actual attendance rate metric.
Phase 3 - UI/Button Audit (P1/P2):

File: app/dashboard/students/[id]/edit/page.tsx  
Bug type: Empty state / Missing UI feedback  
Severity: P2 (bad UX)  
Description: The student edit page shows skeleton loading states but doesn't appear to have proper error handling for when the student data fails to load or when the update operation fails. While it does handle the case where student is not found (returns notFound()), there's no visible indication to the user when form submission is in progress or if it fails.  
Fix: Add proper loading states for form submission and error handling with user feedback.

File: app/dashboard/fees/admin/assign/page.tsx  
Bug type: Edge case handling  
Severity: P2 (bad UX)  
Description: When filtering students for fee assignment, if there are students with no grade (gradeId is null), the filtering logic may not behave as expected. The code checks if (gradeId && gradeId !== 'all') which correctly handles null/undefined gradeId, but there's no explicit handling or UI indication for students without grades.  
Fix: Add explicit handling for students without grades - either show them in a "No Grade" category or provide UI feedback when filtering by grade excludes these students.
