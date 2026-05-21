# Shiksha.cloud — Day 1 Launch Readiness Audit

> **Date:** 5 April 2026
> **Audience:** Solo developer launching to ONE real school
> **Rule:** Only flag what blocks handing the product to a school tomorrow.

---

## 1. HARD BLOCKERS — Will Crash or Corrupt Data on Day 1

### 1.1 WhatsApp Notifications Go to ONE Hardcoded Number
**File:** `lib/notifications/engine.ts` (~line 625)
```ts
const wa = "8459324821"; // hardcoded — recipient.whatsappNumber is commented out
```
**What breaks:** Every WhatsApp notification — fee reminders, attendance alerts, urgent notices — goes to this single number. Zero parents receive anything.
**Fix:** Uncomment `recipient.whatsappNumber ?? recipient.phone`. Delete the hardcoded line.
**Effort:** SMALL — 2 lines

### 1.2 Notices Never Reach Parents (Auto-Publish Broken)
**File:** `lib/data/notice/create-notice-action.ts` (~line 38)
Notices are created as `status: 'PENDING_REVIEW'` and **stay there forever**. The Inngest cron job only expires old notices — it never auto-publishes. The admin hits "Submit for Approval" and expects parents to see it. Nothing happens.
**Fix:** Auto-approve if the creator is an ADMIN. Or add a "Publish Now" checkbox on the create form.
**Effort:** SMALL — 5 lines

### 1.3 Exam Results Publish Does NOT Notify Anyone
**File:** `lib/data/exam/publishExamResults.ts`
Sets `isResultsPublished: true` but **never calls** `notify.exam.resultPublished()`. Teacher hits "Publish", sees success toast. Parents get zero notification.
**Fix:** Add `await notify.exam.resultPublished(exam.id, gradeId, sectionId)` after the publish.
**Effort:** SMALL — 1 line

### 1.4 Attendance Form — Full Data Loss on Navigation
**File:** `components/dashboard/StudentAttendance/attendance-mark.tsx`
All attendance state lives in React component state. Refresh, navigate away, or session expires → **all 40+ entries vanish**. No draft save, no `beforeunload` warning.
**Fix:** Add `window.addEventListener('beforeunload')` warning + localStorage draft persistence.
**Effort:** MEDIUM — ~1 hr

### 1.5 Student Profile Uploads Are Insecure
**File:** `components/dashboard/Student/CreateStudentForm.tsx` (~line 130)
Direct client-side POST to Cloudinary with a hardcoded unsigned upload preset. **Anyone can upload anything** to your Cloudinary account using this preset.
**Fix:** Create a server action that generates a signed upload preset per request.
**Effort:** MEDIUM — ~2 hrs

---

## 2. THINGS A SCHOOL ADMIN NEEDS ON DAY 1 BUT ARE MISSING

### 2.1 Notices Must Be Manually Approved After Creation
**File:** `lib/data/notice/create-notice-action.ts` + `app/dashboard/notices/[id]/page.tsx`
An admin creates a notice → it goes to `PENDING_REVIEW` → they must navigate to the notice viewer → click "Approve" → only then do notifications fire. **There is no "Publish Directly" flow.** For a single-admin school, this is pointless friction.
**Fix:** If the creator is an ADMIN, skip review and auto-publish. Keep review for teacher-created notices only.
**Effort:** SMALL

### 2.2 Settings → Roles Tab Is Read-Only
**File:** `components/dashboard/admin/settings/AdminSettings.tsx`
Shows role distribution (Admin: 2, Teacher: 5, Student: 120) but **nothing is editable**. No create role, no edit permissions. It's a stats display disguised as a settings page.
**Fix:** Label it "Roles & Access Overview" and hide the edit affordances. Real custom roles are a post-launch feature.
**Effort:** SMALL — rename the tab

### 2.3 Onboarding Step 6 (Student Documents) Is Orphaned
**File:** `components/onboarding/OnboardingWizard.tsx` (step 6)
Checks `documentsCount > 0` but documents must be attached per-student. Students are created in step 4. There is no bulk document upload. Admin gets stuck.
**Fix:** Make step 6 explicitly optional. Reword to "Student Documents (per-student, configure later)."
**Effort:** SMALL — 1 line change

### 2.4 Fee Assignment Pagination Is Hardcoded
**File:** `app/dashboard/fees/admin/assign/page.tsx` (line 108)
`<FeeAssignmentPagination currentPage={1} totalPages={10} />` — hardcoded. With 500 students, all load on one page.
**Fix:** Wire to `nuqs` search params + cursor pagination. Or just remove pagination for launch if under 300 students.
**Effort:** MEDIUM — 2 hrs

---

## 3. SECURITY ISSUES

### 3.1 Meta Webhook Has NO Signature Verification
**File:** `app/api/meta/webhook/route.ts` (~lines 30-36)
```ts
// Signature check temporarily disabled for debugging
// const sig = req.headers.get('x-hub-signature-256')
```
**Severity: CRITICAL.** Anyone who knows the endpoint can POST fake leads into your CRM.
**Fix:** Uncomment the signature verification block.
**Effort:** SMALL — 5 lines

### 3.2 Org Isolation in Server Actions — Partially Verified
**Files scanned:** `lib/data/**/*.ts` — all mutation actions

**Good news:** Most server actions DO verify orgId before mutations. Pattern used:
```ts
const org = await validateOrganization(orgId)
if (!org) throw new Error('Unauthorized')
```

**Gaps found:**
- **Some query actions** (read-only) skip orgId validation and rely on the assumption that the user only sees their own org's data. If a user is a member of multiple orgs, they could switch orgs in the URL and see data from the other org.
- **`lib/data/student/create-student-action.ts`** — validates orgId but does NOT validate that the grade/section being assigned actually belongs to that org. A malicious user could assign a student to a grade from another org if they guess the ID.
- **`lib/data/fee/assign-fees-action.ts`** — same pattern. Validates org but not the student-grade-org chain.

**Severity: LOW for single-school launch.** These are only exploitable by a user who is already authenticated and a member of multiple orgs. With one school, this is theoretical.
**Fix before multi-tenant:** Add org scope validation to every Prisma query. Add `where: { organizationId: orgId }` to all grade/section/student lookups.
**Effort:** MEDIUM — 4 hrs across all data files

### 3.3 No Student/Parent Can Access Admin Pages — Confirmed Safe
**Verified:** `proxy.ts` + `lib/rbac.ts` correctly blocks all 4 roles. Students hitting `/dashboard/fees/admin` get redirected to `/dashboard`. Parents hitting `/dashboard/attendance/mark` get redirected. **This is working correctly.**

---

## 4. DATA INTEGRITY RISKS

### 4.1 Attendance Can Create Duplicate Entries
**File:** `lib/data/attendance/mark-attendance-action.ts`
No unique constraint check before inserting. If the teacher clicks "Submit" twice (or the request retries), **duplicate attendance records** are created for the same student on the same date.
**Fix:** Add a Prisma upsert or check for existing record before insert. Or add a unique composite index on `(studentId, date, academicYearId)`.
**Effort:** SMALL — 3 lines

### 4.2 Deleting a Grade/Section Cascades to Attendance Data
**File:** `lib/data/grade/delete-section-action.ts`
Deletes a section and reassigns students, but **does NOT soft-delete or archive** the attendance records for that section. They become orphaned (reference a non-existent section).
**Fix:** The notes.md already flags this: "Need Solution: If Section Delete then Attendance Data will Delete {SOFT DELETE}". Add `onDelete: SetNull` for the section relation on `StudentAttendance`, or archive attendance records before deletion.
**Effort:** MEDIUM — schema migration + data migration

### 4.3 Fee Assignment Can Create Negative/Zero Amounts
**File:** `lib/data/fee/assign-fees-action.ts`
No validation that `amount > 0`. An admin could accidentally assign fees of ₹0 or negative amounts.
**Fix:** Add `z.number().positive()` validation on the amount field.
**Effort:** SMALL — 1 line

### 4.4 Bulk Exam Create — Partial Failure Leaves Inconsistent State
**File:** `lib/data/exam/bulk-create-exams.ts`
Creates multiple exams in a loop without a Prisma transaction. If exam 3 of 5 fails, exams 1-2 are committed and 4-5 are not.
**Fix:** Wrap in `prisma.$transaction()`.
**Effort:** SMALL — 1 line wrapper

### 4.5 Student Deletion Does NOT Cascade Properly
**File:** `lib/data/student/delete-student-action.ts`
Deletes the student record but does NOT clean up:
- Attendance records (orphaned)
- Fee assignments (orphaned)
- Exam enrollments (orphaned)
- Document uploads (orphaned)
- ParentStudent links (orphaned)

**Fix:** Soft delete the student (`deletedAt` field) instead of hard delete. Or add cascade rules in the schema.
**Effort:** MEDIUM — schema change + migration

---

## 5. WHAT YOU CAN IGNORE FOR NOW

**These do NOT block Day 1 with one school:**

| Thing | Why You Can Defer |
|-------|-------------------|
| Custom Roles / Permissions editor | You're the only admin. 4 hardcoded roles are enough. |
| Transport module (no model, no logic) | Tell the school "coming in v2." It's a nice-to-have. |
| Assignment Management (uses Notices as workaround) | Teachers can use notices for homework. Ugly but functional. |
| Teacher Settings page (`<ComingSoon />`) | Teachers can update via Clerk profile. Defer. |
| Parent Settings page (`<ComingSoon />`) | Parents only need to view children's data. Defer. |
| Billing Settings / Top-up | You're launching free or manual invoicing. Defer. |
| Integration cards (SMTP, WhatsApp "Coming Soon") | Use default Resend + default SMS provider. Defer custom integrations. |
| Report Card PDF download (stubbed toast) | Admin can view results on screen. PDF is nice-to-have. |
| Hall Ticket PNG/PDF download (empty functions) | Print from browser works. Defer PDF generation. |
| Fee Sense AI Agent reports (console.log stub) | AI agent runs in background. Report download is post-launch. |
| Lead/CRM export button (missing) | Small school won't have 100+ leads. Defer. |
| Teacher export button (missing) | Same. |
| Student export button (missing) | Same. |
| Notices export button (missing) | Same. |
| Fee reconciliation export (stubbed) | You can manually query from Prisma Studio for now. |
| Fee Collection Report (coming_soon) | Manual query for now. |
| Result Analysis Report (coming_soon) | Manual query for now. |
| Website industry landing pages (6× Coming Soon) | Marketing pages don't block the product. |
| Support Popup "Schedule Meeting" tab | Use email or phone for now. |
| 6 commented-out parent menu items | Parent only needs: Children, Attendance, Fees, Exams, Notices. That's enough. |
| Teacher dashboard commented-out cards | MyClasses, QuickActions — cosmetic. Dashboard works without them. |
| Onboarding step 6 (Documents) | Make it optional. Documents are per-student, not setup. |
| Fee assignment hardcoded pagination | Under 300 students, it won't matter. |

---

## THE SHORTEST PATH TO DAY 1

### Fix These 5 Things (~4 hours) — Hand It to a School

| # | Fix | File | Time |
|---|-----|------|------|
| 1 | WhatsApp → real number | `lib/notifications/engine.ts` | 5 min |
| 2 | Auto-publish admin notices | `lib/data/notice/create-notice-action.ts` | 15 min |
| 3 | Exam results → notify | `lib/data/exam/publishExamResults.ts` | 5 min |
| 4 | Attendance duplicate prevention | `lib/data/attendance/mark-attendance-action.ts` | 10 min |
| 5 | Fee amount > 0 validation | `lib/data/fee/assign-fees-action.ts` | 5 min |

### Fix These Next (~3 hours) — Polished Launch

| # | Fix | File | Time |
|---|-----|------|------|
| 6 | Meta webhook signature | `app/api/meta/webhook/route.ts` | 10 min |
| 7 | Beforeunload warning on attendance | `attendance-mark.tsx` | 30 min |
| 8 | Bulk exam create → transaction | `lib/data/exam/bulk-create-exams.ts` | 10 min |
| 9 | Student photo upload → server-signed | New server action | 2 hrs |
| 10 | Onboarding docs step → optional | `OnboardingWizard.tsx` | 5 min |

**~7 hours total. You can launch tomorrow.**
