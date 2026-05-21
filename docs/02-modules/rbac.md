Looking at your schema and menu structure carefully, there are several issues.

**Problems with the current `permissions.ts`:**

---

### ❌ Issue 1 — TEACHER has `fees:view` hardcoded

```typescript
TEACHER: [
  ...
  "fees:view",  // ← this defeats the whole point
],
```

You said "some teachers shouldn't see fees". But if `fees:view` is in the base TEACHER role, **all teachers get it**. This needs to be removed from the base role and granted individually.

---

### ❌ Issue 2 — Missing actions your routes actually need

Cross-referencing your folder structure with the Action type, these are missing:

```typescript
// These routes exist but have no actions:
// /dashboard/documents/verification    → "documents:view" | "documents:verify"
// /dashboard/anonymous-complaints      → "complaints:view" | "complaints:create"
// /dashboard/leaves                    → "leaves:view" | "leaves:create"
// /dashboard/leaves/manage             → "leaves:manage"
// /dashboard/holidays                  → "holidays:view" | "holidays:manage"  
// /dashboard/teaching-assignments      → "teaching-assignments:view"
// /dashboard/subjects                  → "subjects:view" | "subjects:create"
// /dashboard/agents                    → "agents:view"
// /dashboard/settings                  → already have ✅
// /dashboard/reports                   → already have ✅
```

---

### ❌ Issue 3 — STUDENT has `grades:view` but your menu shows it's not in STUDENT's sidebar

Looking at your `roleMenus.STUDENT` — there's no grades link. But STUDENT has `grades:view` in permissions. Minor inconsistency — either add the route to student menu or remove the permission.

---

### ❌ Issue 4 — ADMIN is missing some actions from your menu

```typescript
// Your ADMIN menu has these but permissions.ts doesn't cover them:
// /dashboard/documents/verification  → missing "documents:verify"
// /dashboard/leaves/manage           → missing "leaves:manage"  
// /dashboard/holidays                → missing "holidays:manage"
// /dashboard/teaching-assignments    → missing "teaching-assignments:view"
// /dashboard/subjects                → missing "subjects:view"
// /dashboard/agents                  → missing "agents:view"
```

---

### ✅ The corrected version:

```typescript
// lib/rbac/permissions.ts
import { Role } from "@/generated/prisma";

export type Action =
  // Students
  | "students:view" | "students:create" | "students:edit" | "students:delete"
  // Teachers
  | "teachers:view" | "teachers:create" | "teachers:edit" | "teachers:delete"
  // Fees — NOTE: not in base TEACHER role, granted individually
  | "fees:view" | "fees:create" | "fees:edit" | "fees:delete"
  // Attendance
  | "attendance:view" | "attendance:mark"
  // Grades & Sections
  | "grades:view" | "grades:create" | "grades:edit" | "grades:delete"
  // Subjects
  | "subjects:view" | "subjects:create" | "subjects:edit"
  // Teaching Assignments
  | "teaching-assignments:view" | "teaching-assignments:create"
  // Notices
  | "notices:view" | "notices:create" | "notices:edit" | "notices:delete"
  // Reports
  | "reports:view"
  // Settings
  | "settings:view" | "settings:edit"
  // Leads
  | "leads:view" | "leads:create" | "leads:edit" | "leads:delete"
  // Exams
  | "exams:view" | "exams:create" | "exams:edit" | "exams:delete"
  // Leaves
  | "leaves:view" | "leaves:create" | "leaves:manage"
  // Holidays
  | "holidays:view" | "holidays:manage"
  // Documents
  | "documents:view" | "documents:upload" | "documents:verify"
  // Complaints
  | "complaints:view" | "complaints:create" | "complaints:manage"
  // Agents (AI)
  | "agents:view" | "agents:manage";

const rolePermissions: Record<Role, Action[]> = {
  SUPER_ADMIN: [] as Action[], // bypass — handled in hasPermission()

  ADMIN: [
    // Students
    "students:view", "students:create", "students:edit", "students:delete",
    // Teachers
    "teachers:view", "teachers:create", "teachers:edit", "teachers:delete",
    // Fees — full access
    "fees:view", "fees:create", "fees:edit", "fees:delete",
    // Attendance
    "attendance:view", "attendance:mark",
    // Grades & Subjects
    "grades:view", "grades:create", "grades:edit", "grades:delete",
    "subjects:view", "subjects:create", "subjects:edit",
    "teaching-assignments:view", "teaching-assignments:create",
    // Notices
    "notices:view", "notices:create", "notices:edit", "notices:delete",
    // Reports
    "reports:view",
    // Settings
    "settings:view", "settings:edit",
    // Leads
    "leads:view", "leads:create", "leads:edit", "leads:delete",
    // Exams
    "exams:view", "exams:create", "exams:edit", "exams:delete",
    // Leaves
    "leaves:view", "leaves:create", "leaves:manage",
    // Holidays
    "holidays:view", "holidays:manage",
    // Documents
    "documents:view", "documents:upload", "documents:verify",
    // Complaints
    "complaints:view", "complaints:create", "complaints:manage",
    // Agents
    "agents:view", "agents:manage",
  ],

  TEACHER: [
    // Students — view only
    "students:view",
    // Attendance — can mark
    "attendance:view", "attendance:mark",
    // Grades — view only
    "grades:view",
    "subjects:view",
    "teaching-assignments:view",
    // Notices
    "notices:view",
    // Exams — can create for their class
    "exams:view", "exams:create",
    // Leaves — own leaves only
    "leaves:view", "leaves:create",
    // Holidays — view only
    "holidays:view",
    // Documents — verify student docs
    "documents:view", "documents:verify",
    // Complaints — manage (they receive complaints)
    "complaints:view", "complaints:manage",
    // Leads — some teachers handle admissions
    "leads:view", "leads:create",
    // NOTE: NO fees:view — granted individually via Teacher.permissions[]
    // NOTE: NO settings:edit
    // NOTE: NO agents access
  ],

  STUDENT: [
    "notices:view",
    "attendance:view",
    // fees:view — students see their own fees
    "fees:view",
    "exams:view",
    // grades:view — students see their own grades
    "grades:view",
    // leaves — students apply for leave
    "leaves:view", "leaves:create",
    // holidays — view school calendar
    "holidays:view",
    // documents — own documents
    "documents:view", "documents:upload",
    // complaints — can file anonymously
    "complaints:create",
  ],

  PARENT: [
    "notices:view",
    "attendance:view",
    // fees:view — parents see child's fees
    "fees:view",
    "exams:view",
    "grades:view",
    "reports:view",
    // holidays
    "holidays:view",
    // complaints
    "complaints:create",
  ],

  STAFF: [
    "students:view",
    "fees:view", "fees:create",
    "attendance:view",
    "notices:view",
    "leads:view", "leads:create", "leads:edit",
    "documents:view",
    "holidays:view",
    "settings:view",
  ],
};

export function hasPermission(role: Role, action: Action): boolean {
  if (role === "SUPER_ADMIN") return true;
  return rolePermissions[role]?.includes(action) ?? false;
}

export function hasAnyPermission(role: Role, actions: Action[]): boolean {
  return actions.some((action) => hasPermission(role, action));
}

export function hasAllPermissions(role: Role, actions: Action[]): boolean {
  return actions.every((action) => hasPermission(role, action));
}

// For teacher individual permission grants (stored in Teacher.permissions[])
export function hasGrantedPermission(
  role: Role,
  baseAction: Action,
  grantedPermissions: string[]
): boolean {
  if (hasPermission(role, baseAction)) return true; // already in base role
  return grantedPermissions.includes(baseAction);   // individually granted
}
```

---

### Key decisions made:

| Decision | Reason |
|---|---|
| `fees:view` removed from base TEACHER | Your core requirement — granted per-teacher via `Teacher.permissions[]` |
| `SUPER_ADMIN` returns empty array | `hasPermission()` short-circuits at the top, no need to list everything |
| Added 10+ missing actions | Every route in your folder structure is now covered |
| `complaints:manage` vs `complaints:create` | Admins/teachers *manage*, students/parents *create* |
| `leaves:manage` separate from `leaves:create` | Admin manages all leaves, teachers/students only create their own |
| `hasGrantedPermission()` added | The bridge between base role permissions and individual teacher grants |


Here are the rules I've inferred from your schema, menus, and folder structure. **Correct or add to each one:**

---

## ADMIN
1. Full access to everything
2. Can grant/revoke permissions to individual teachers
3. Only role that can access `/dashboard/settings`
4. Only role that can delete students, teachers, grades
5. Manages all leaves (approve/reject)
6. Can see all complaints (anonymous too)

---

## TEACHER
1. Can view students (not create/delete)
2. Can mark attendance for their assigned sections only
3. Can create exams (for their subjects only?)
4. **Cannot see fees by default** — admin grants it individually
5. Can view/manage complaints submitted to them
6. Can apply for their own leave
7. Can verify student documents
8. Can view leads, create leads — but not delete
9. Can see notice board (not create notices?)

---

## STUDENT
1. Can only see their own data (attendance, fees, grades)
2. Can apply for leave
3. Can file anonymous complaints
4. Can upload their own documents
5. Cannot see other students
6. Can view exams / hall tickets for themselves only

---

## PARENT
1. Can see their linked children's data only
2. Can view fees, attendance, grades, reports for their child
3. Cannot create/edit anything — read only?
4. Can file complaints

---

## STAFF
1. Similar to a restricted teacher
2. Can handle fees and leads
3. Cannot manage teachers or grades
4. No exam access?

---

**Questions I need you to answer:**

- Can **teachers create notices** or only view?
- Can **teachers see ALL students** or only students in their assigned sections?
- Does **STAFF** have any attendance access beyond viewing?
- Can **parents** do anything beyond read-only?
- Is there a **SUPER_ADMIN** role or is ADMIN the top level?
- What exactly does **STAFF** do in your system — front desk? accounts?