# SHIKSHA.CLOUD — DAY 1 LAUNCH READINESS AUDIT

**Audit Date:** 6 April 2026
**Auditor:** Senior Next.js Developer / Technical Co-Founder Lens
**Goal:** What's actually blocking me from handing this to ONE real school tomorrow?

---

## MODULE STATUS

### STABLE (assume working)
Student Management, Attendance, Fee Management, Document Verification, Lead/CRM, Exam Management, Notices, Smart Notifications, Parent Portal, Holiday & Calendar, Anonymous Complaints, Analytics, Grade & Section, Certificate Generator, Teacher Management, Subject Management, Teaching Assignments, Leave Management, Settings, AI Agents, Onboarding, Gallery, Integrations

### PARTIAL
- **Assignment Management:** UI exists, no model, uses Notices
- **Transport:** route exists, no logic, no model

---

## 1. HARD BLOCKERS (will crash or corrupt data on Day 1)

### BLOCKER 1: Firebase Push API — Zero Authentication
| Field | Detail |
|-------|--------|
| **What breaks** | Anyone on the internet can POST to `/api/firebase/route.ts` and send push notifications to any user whose Firebase token they know. They could spam every parent with fake messages like "School closed tomorrow." |
| **File** | `app/api/firebase/route.ts` |
| **Fix** | Add `const { userId } = await auth(); if (!userId) return new NextResponse('Unauthorized', { status: 401 });` at the top |
| **Effort** | SMALL |

### BLOCKER 2: Meta Webhook — Signature Verification Disabled
| Field | Detail |
|-------|--------|
| **What breaks** | Anyone who discovers your webhook URL can POST fake lead data into your database. Your CRM fills with garbage leads from malicious actors. |
| **File** | `app/api/meta/webhook/route.ts` (lines ~44-50, HMAC check is commented out "for debugging") |
| **Fix** | Uncomment the signature verification code. If you need debugging, use a separate test endpoint |
| **Effort** | SMALL |

### BLOCKER 3: Lead Deletion — Cross-Org, No Auth
| Field | Detail |
|-------|--------|
| **What breaks** | `delete-lead.ts` and `delete-leads.ts` accept a lead ID and delete it with zero auth check and zero org check. Any authenticated user can delete any lead in the entire database, across all schools. |
| **Files** | `lib/data/leads/delete-lead.ts`, `lib/data/leads/delete-leads.ts` |
| **Fix** | Add `const { orgId } = await auth();` then verify the lead belongs to that org before deleting: `const lead = await prisma.lead.findUnique({ where: { id: leadId, organizationId: orgId } }); if (!lead) throw new Error('Not found');` |
| **Effort** | SMALL |

### BLOCKER 4: Exam Result Entry — No Auth, No Org Check
| Field | Detail |
|-------|--------|
| **What breaks** | `ExamResultEntry()` and `publishExamResults()` can write exam results for any student and publish results for any exam in the entire system. No auth, no org validation. A parent could publish fake results for another school's students. |
| **Files** | `lib/data/exam/exam-result-entry.ts`, `lib/data/exam/publishExamResults.ts` |
| **Fix** | Add auth + orgId verification to both functions. Verify the exam belongs to the user's org before writing results. |
| **Effort** | SMALL |

### BLOCKER 5: Holiday Deletion — No Auth, Can Delete Any Org's Holidays
| Field | Detail |
|-------|--------|
| **What breaks** | `delete-single-holiday.ts` takes a holiday ID and deletes it with no auth and no org filter. Any user can delete any school's holidays. |
| **File** | `lib/data/holiday/delete-single-holiday.ts` |
| **Fix** | Add `const orgId = await getOrganizationId();` and verify the holiday belongs to that org before deleting |
| **Effort** | SMALL |

### BLOCKER 6: AI Agent Toggle — No Auth
| Field | Detail |
|-------|--------|
| **What breaks** | `toggleAgentActivation()` can toggle any AI agent in the entire system on or off. No auth, no org check. A user from School A could disable School B's FeeSense agent. |
| **File** | `lib/data/agents/toggle-agent-activation.ts` |
| **Fix** | Add auth + org verification. Verify the agent belongs to the user's org |
| **Effort** | SMALL |

### BLOCKER 7: Parent Model Has No organizationId — Architectural Gap
| Field | Detail |
|-------|--------|
| **What breaks** | The `Parent` model in the Prisma schema has no `organizationId` field. If a parent has children in two different schools using Shiksha Cloud, their data is shared across orgs. Queries in `selected-child.ts` and `parent-dashboard.ts` filter only by `parentId`, not by org. |
| **Files** | `prisma/schema.prisma` (Parent model), `lib/data/parent/selected-child.ts`, `lib/data/parent/parent-dashboard.ts` |
| **Fix** | For Day 1, this won't crash — it just means if (and only if) two schools onboard parents with the same email, there's a collision. Add `organizationId` to Parent model in a migration. For Day 1 launch with ONE school, this is not an active risk. |
| **Effort** | MEDIUM (requires migration + data backfill) |

### BLOCKER 8: Grade/Section/Teacher Deletions in `app/actions.ts` — No Org Check
| Field | Detail |
|-------|--------|
| **What breaks** | `deleteGrade()`, `deleteSection()`, `deleteAttendance()`, `updateTeacherAction()`, `toggleTeacherStatus()` all operate on IDs without verifying organization ownership. A malicious user could delete grades/sections/teachers from another school if they guess the IDs. |
| **File** | `app/actions.ts` (multiple functions) |
| **Fix** | Add `const orgId = await getOrganizationId();` to each function and include `organizationId: orgId` in every Prisma `where` clause |
| **Effort** | MEDIUM (6-8 functions to patch) |

---

## 2. THINGS A SCHOOL ADMIN NEEDS ON DAY 1 BUT ARE MISSING OR HALF-BUILT

### NEEDS-FIX 1: Transport Page — Hardcoded Fictional Data
| Field | Detail |
|-------|--------|
| **What it is** | Parents see a polished interactive map showing "BUS-07, Sangvi to Shivajinagar, Pune" with fake driver "Suresh Patil" and fictional phone numbers. |
| **Files** | `components/dashboard/parent/transport-map.tsx`, `app/dashboard/transport/page.tsx` |
| **Impact** | A parent in a Mumbai school will see a Pune bus route with fake data. It looks real but is entirely fictional. This will confuse and erode trust immediately. |
| **Fix for Day 1** | Either (a) hide the menu item for parents, or (b) replace the component with a "Coming Soon" placeholder. Do NOT show hardcoded demo data as if it's live. |
| **Effort** | SMALL |

### NEEDS-FIX 2: Assignments Page — Dead-End for Students
| Field | Detail |
|-------|--------|
| **What it is** | Students see "Assignments" in their sidebar, click it, and get a static empty state with no action buttons and no data. |
| **File** | `app/dashboard/assignments/page.tsx` |
| **Impact** | Not a crash. Just a confusing dead-end. Students will wonder why the feature exists but does nothing. |
| **Fix for Day 1** | Hide from student menu in `lib/menu-list.ts`, or add a "Coming Soon" banner with a note |
| **Effort** | SMALL |

### NEEDS-FIX 3: Onboarding Flow — Verify It Creates Everything
| Field | Detail |
|-------|--------|
| **What it is** | The onboarding flow at `/dashboard/onboarding` needs to create: Organization, AcademicYear, Grade, Section, and set the current user as ADMIN. |
| **File** | `app/dashboard/onboarding/page.tsx` |
| **Impact** | If onboarding skips any of these, the admin lands on a broken dashboard. |
| **Fix** | Walk through the flow manually. Ensure it creates all prerequisite entities. If any step fails, the admin should see a clear error, not a blank dashboard. |
| **Effort** | MEDIUM (depends on what's missing) |

### NEEDS-FIX 4: Student Report Generation — No Org Validation
| Field | Detail |
|-------|--------|
| **What it is** | `get-student-report.ts` and `get-student-performance.ts` query student data by ID without org verification. If a studentId is user-controllable (e.g., from a URL param), cross-org data could leak. |
| **Files** | `lib/data/student/get-student-report.ts`, `lib/data/student/get-student-performance.ts` |
| **Impact** | For Day 1 with one school, this is theoretical risk. But if you onboard School #2, this becomes a real data leak. |
| **Fix** | Add orgId verification to all student lookup queries |
| **Effort** | SMALL |

### NEEDS-FIX 5: Fee Queries by Teacher — Cross-Org Risk
| Field | Detail |
|-------|--------|
| **What it is** | `getAssignedStudentsFees.ts` and `get-teacher-fee-summary.ts` take a `teacherId` and return fee data without any org filter. They query `TeachingAssignment` by teacherId alone, then pull fees for all matching students across ALL organizations. |
| **Files** | `lib/data/fee/getAssignedStudentsFees.ts`, `lib/data/teacher/get-teacher-fee-summary.ts` |
| **Impact** | If two schools have teachers with overlapping IDs (likely with auto-increment), fee data bleeds across orgs. |
| **Fix** | Add orgId to the TeachingAssignment query and the subsequent fee queries |
| **Effort** | SMALL |

---

## 3. SECURITY ISSUES THAT WOULD EMBARRASS ME

### EMBARRASSMENT 1: `/api/(.*)` Is Blanket Public in Middleware
| Field | Detail |
|-------|--------|
| **What it is** | `proxy.ts` lists `/api/(.*)` as a public route. Every API route must implement its own auth. If you (or any future developer) forget, the route is wide open. |
| **File** | `proxy.ts` |
| **Fix** | Invert the pattern. Make `/api/(.*)` protected by default. List only specific webhook/callback routes as public exceptions: `/api/webhooks/(.*)`, `/api/phonepay-callback/(.*)`, `/api/uploadthing/(.*)` |
| **Effort** | SMALL |

### EMBARRASSMENT 2: `createLead()` Takes organizationId From Form Data
| Field | Detail |
|-------|--------|
| **What it is** | A user can create leads for ANY organization by simply changing the organizationId in the form. No verification that the user belongs to that org. |
| **File** | `lib/data/leads/create-lead.ts` |
| **Fix** | Get orgId from `auth()`, not from form input. Ignore user-supplied orgId. |
| **Effort** | SMALL |

### EMBARRASSMENT 3: Lead Assignment Crosses Org Boundaries
| Field | Detail |
|-------|--------|
| **What it is** | `assign-lead.ts` can assign any lead to any user across any organization. No org validation on the lead lookup or the assignee lookup. |
| **File** | `lib/data/leads/assign-lead.ts` |
| **Fix** | Verify both the lead and the assignee belong to the same org |
| **Effort** | SMALL |

### EMBARRASSMENT 4: `convertLead()` — No Org Verification
| Field | Detail |
|-------|--------|
| **What it is** | Converting a lead to a student doesn't verify the lead belongs to the user's org. Any user can convert any lead in the system. |
| **File** | `lib/data/leads/convert-lead.ts` |
| **Fix** | Add org check before conversion |
| **Effort** | SMALL |

### EMBARRASSMENT 5: Bulk Enroll Students — No Auth, No Org
| Field | Detail |
|-------|--------|
| **What it is** | `bulkEnrollStudents()` can enroll any students into any exam across the entire database. No auth, no org check. |
| **File** | `lib/data/exam/bulk-enroll-students.ts` |
| **Fix** | Add auth + org verification. Verify both students and exam belong to user's org. |
| **Effort** | SMALL |

### EMBARRASSMENT 6: `WeeklyStudentAttendance()` and `getStudentMonthlyAttendance()` — No Org Check
| Field | Detail |
|-------|--------|
| **What it is** | Attendance queries in `app/actions.ts` have no org verification. Any authenticated user can query any student's attendance by ID. |
| **File** | `app/actions.ts` |
| **Fix** | Add orgId to the where clause |
| **Effort** | SMALL |

---

## 4. DATA INTEGRITY RISKS

### RISK 1: `createTeacherFormAction()` Returns `null` on Failure
| Field | Detail |
|-------|--------|
| **What breaks** | When teacher creation fails, the function returns `null` silently. The UI cannot distinguish success from failure. The admin might think the teacher was created when they weren't. |
| **File** | `app/actions.ts` |
| **Fix** | Return a proper `{ success: false, error: string }` object |
| **Effort** | SMALL |

### RISK 2: `FeeCategory` Unique Constraint with Nullable `academicYearId`
| Field | Detail |
|-------|--------|
| **What breaks** | `@@unique([name, organizationId, academicYearId])` where `academicYearId` is nullable. In PostgreSQL, NULL != NULL in unique indexes. This means two fee categories with the same name in the same org but `academicYearId = NULL` will NOT conflict. You get duplicates. |
| **File** | `prisma/schema.prisma` (FeeCategory model) |
| **Fix** | Either make `academicYearId` non-nullable, or add a separate `@@unique([name, organizationId])` for NULL cases |
| **Effort** | SMALL (schema change + migration) |

### RISK 3: `TeachingAssignment` Unique Constraint with Nullable `academicYearId`
| Field | Detail |
|-------|--------|
| **What breaks** | Same pattern — `@@unique([teacherId, subjectId, gradeId, sectionId, academicYearId])` with nullable academicYearId. A teacher could be double-assigned to the same subject/section if both have NULL academicYearId. |
| **File** | `prisma/schema.prisma` (TeachingAssignment model) |
| **Fix** | Make `academicYearId` required on this model |
| **Effort** | SMALL |

### RISK 4: No Cascade on Organization Delete
| Field | Detail |
|-------|--------|
| **What breaks** | If you ever delete an Organization, the database will either block the delete (Restrict) or leave orphaned Students, Teachers, Fees, etc. There is no `onDelete: Cascade` from Organization to its core entities. |
| **File** | `prisma/schema.prisma` (Organization relations) |
| **Fix** | Add `onDelete: Cascade` to all Organization→child relations, OR implement a soft-delete pattern. For Day 1 with one school, this is low risk. |
| **Effort** | MEDIUM (schema migration) |

### RISK 5: `CustomDatesStudentAttendance()` — Empty Function Body
| Field | Detail |
|-------|--------|
| **What breaks** | This function exists but does nothing. If any UI calls it, it silently succeeds without recording attendance. |
| **File** | `app/actions.ts` |
| **Fix** | Either implement it or remove it and remove any UI that calls it |
| **Effort** | SMALL |

### RISK 6: `deleteGrade()` and `deleteSection()` — No Cascade, No Validation
| Field | Detail |
|-------|--------|
| **What breaks** | Deleting a grade doesn't cascade to its sections, students, or fees. You'll get foreign key constraint violations (if Restrict) or orphaned data (if no constraint). No validation that the grade is empty before deletion. |
| **File** | `app/actions.ts` |
| **Fix** | Either add cascade deletes, or check for dependent records and refuse deletion with a clear error message |
| **Effort** | MEDIUM |

---

## 5. WHAT I CAN IGNORE FOR NOW

**You can confidently defer ALL of these for Day 1:**

| What | Why Defer |
|------|-----------|
| **Assignment Management** | Students see an empty state. No crash. Add a "Coming Soon" label and move on. |
| **Transport Module** | Hardcoded demo data is a trust issue, not a crash. Hide the menu item for now. |
| **Timetable models** (commented out) | Not built yet. Nobody expects it on Day 1. |
| **GatewaySettlement** (commented out) | Payment settlement tracking is nice-to-have. Day 1 is manual fee entry. |
| **OrganizationMembership** (commented out) | Clerk handles org membership natively. This old model is dead code. |
| **ReportCard model lacking orgId** | Only accessible via studentId+examSessionId. With one school, impossible to hit the wrong one. |
| **Parent model lacking orgId** | Only matters when two schools share the same parent email. Won't happen on Day 1. |
| **DeviceToken lacking orgId** | Push tokens are user-scoped. No cross-org risk in practice. |
| **Dead RBAC routes** (`/dashboard/subjects`, `/dashboard/teachers`, `/dashboard/teaching-assignments`) | No page files exist. Middleware handles 404 gracefully. Clean up later. |
| **Certificate Generator UI polish** | It works. It doesn't need to be beautiful on Day 1. |
| **AI Agents sophistication** | They exist and can be toggled. Day 1 is about proving the platform works, not AI quality. |
| **Blog content** (only 6 posts) | Marketing concern, not a blocking risk. Ship the product first. |
| **Location SEO pages** (10 cities) | Marketing concern. Doesn't affect the product. |
| **Competitor comparison pages** | Marketing concern. Not blocking. |
| **Changelog page** | Nice-to-have. Zero functional impact. |
| **Support page** | It exists. Doesn't need to be feature-rich on Day 1. |
| **Pricing page FAQ** | Marketing polish. Not blocking. |
| **HTML Sitemap page** | SEO concern. Not blocking. |
| **RSS feed for blog** | Marketing polish. |
| **PWA installability** | Works via next-pwa. Doesn't need to be perfect. |
| **Image optimization (AVIF/WebP)** | Already configured. |
| **404 page design** | It works. Doesn't need to be beautiful. |
| **Email templates polish** | Resend works. Templates don't need to be perfect. |
| **Analytics dashboard depth** | Basic analytics exist. Schools won't judge Day 1 on analytics sophistication. |

---

## PRIORITY SUMMARY: WHAT TO DO TOMORROW

**Do these 8 things (all SMALL effort, 2-3 hours total):**

| # | Fix | File(s) | Lines |
|---|-----|---------|-------|
| 1 | Add auth to Firebase push API | `app/api/firebase/route.ts` | 2 lines |
| 2 | Re-enable Meta webhook signature verification | `app/api/meta/webhook/route.ts` | Uncomment 5 lines |
| 3 | Add org check to lead deletion | `lib/data/leads/delete-lead.ts`, `delete-leads.ts` | 4 lines each |
| 4 | Add auth + org check to exam result entry & publish | `lib/data/exam/exam-result-entry.ts`, `publishExamResults.ts` | 6 lines each |
| 5 | Add org check to holiday deletion | `lib/data/holiday/delete-single-holiday.ts` | 3 lines |
| 6 | Add org check to AI agent toggle | `lib/data/agents/toggle-agent-activation.ts` | 3 lines |
| 7 | Hide Transport menu item for parents | `lib/menu-list.ts` | 1 line |
| 8 | Add "Coming Soon" to Assignments for students | `app/dashboard/assignments/page.tsx` or `lib/menu-list.ts` | 1 line |

**After those 8, you can hand this to a real school.** Everything else in this audit is "fix in the next 2 weeks" not "blocking tomorrow."

---

## APPENDIX: PRISMA SCHEMA AUDIT SUMMARY

### Models Missing `organizationId` (Potential Data Leak Vectors)

| Model | Has orgId? | Risk Level | Notes |
|-------|-----------|------------|-------|
| Parent | NO | HIGH (multi-org only) | No org isolation. Parents shared across orgs. |
| ParentStudent | NO | MEDIUM | Join table, filtered by parentId only. |
| ReportCard | NO | LOW | Accessed via studentId + examSessionId. |
| StudentAttendance | NO (indirect) | LOW | Accessed via section.organizationId. |
| ExamEnrollment | NO (indirect) | LOW | Accessed via examId. |
| ExamResult | NO (indirect) | LOW | Accessed via examId. |
| DeviceToken | NO | LOW | Linked via userId. |
| ComplaintStatusTimeline | NO | LOW | Child table via complaintId. |
| NoticeAttachment | NO | LOW | Child table via noticeId. |
| LeaveStatusTimeline | NO | LOW | Child table via leaveId. |
| LeadActivity | NO | LOW | Child table via leadId. |
| FeeSenseExecutionLog | NO | LOW | Child table via agentId. |
| FeeSenseReport | NO | LOW | Child table via agentId. |
| TeacherProfile | NO | LOW | Child table via teacherId. |

### Cascade Delete Summary

| Relation | onDelete |
|----------|----------|
| DeviceToken.user | Cascade |
| Student.user | Cascade |
| Section.grade | Cascade |
| TeacherProfile.teacher | Cascade |
| ExamSession.organization | Cascade |
| Exam.organization | Cascade |
| HallTicket.student | Cascade |
| HallTicket.exam | Cascade |
| HallTicket.examSession | Cascade |
| HallTicket.organization | Cascade |
| NoticeAttachment.notice | Cascade |
| NotificationSetting.organization | Cascade |
| Notification.organization | Cascade |
| Notification.user | Cascade |
| Notification.student | Cascade |
| Notification.parent | Cascade |
| Notification.academicYear | SetNull |
| NotificationLog.organization | Cascade |
| NotificationLog.notification | Cascade |
| Fee.academicYear | Restrict |
| Lead.assignedTo | SetNull |
| Lead.createdBy | SetNull |

### Commented-Out Models (Dead Code)

1. **Institution** — Was a potential parent model for organizations
2. **OrganizationMembership** — Multi-tenant membership, replaced by Clerk
3. **GatewaySettlement** — Payment gateway settlement tracking
4. **TimePeriod** — School timetable periods
5. **Timetable** — Main timetable connecting assignments to time slots
6. **TimetableException** — Schedule exceptions/substitutions
