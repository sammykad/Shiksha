// lib/rbac.ts
// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for route permissions
//
// To add a new route:  just add it here. Touch nothing else.
// To change a role:    just update the array here.
//
// Roles: 'admin' | 'teacher' | 'student' | 'parent'
// ─────────────────────────────────────────────────────────────

export type AppRole = 'admin' | 'teacher' | 'student' | 'parent';

// Where each role lands after login or on unauthorized access
export const ROLE_HOMEPAGE: Record<AppRole, string> = {
    admin: '/dashboard',
    teacher: '/dashboard/',
    student: '/dashboard/',
    parent: '/dashboard/',
};

// Clerk orgRole → AppRole
export const CLERK_ROLE_MAP: Record<string, AppRole> = {
    'org:admin': 'admin',
    'org:teacher': 'teacher',
    'org:student': 'student',
    'org:parent': 'parent',
};

// ─────────────────────────────────────────────────────────────
// ROUTE PERMISSIONS
//
// Each entry is a route prefix and which roles can access it.
// More specific routes go first — first match wins.
// '*' in roles means any authenticated user.
// ─────────────────────────────────────────────────────────────
export const ROUTE_PERMISSIONS: { path: string; roles: AppRole[] | '*' }[] = [
    // ── Onboarding ─────────────────────────────────────────
    { path: '/dashboard/onboarding', roles: ['admin'] },

    // ── Dashboard home — all roles ──────────────────────────
    { path: '/dashboard', roles: '*' },

    // ── Agents / AI ─────────────────────────────────────────
    { path: '/dashboard/agents(*)', roles: ['admin'] },

    // ── Academic Structure ──────────────────────────────────
    { path: '/dashboard/grades(*)', roles: ['admin', 'teacher'] },
    { path: '/dashboard/subjects', roles: ['admin'] },
    { path: '/dashboard/teaching-assignments', roles: ['admin'] },
    { path: '/dashboard/holidays', roles: ['admin', 'teacher'] },

    // ── Students ────────────────────────────────────────────
    { path: '/dashboard/students/create', roles: ['admin', 'teacher'] },
    { path: '/dashboard/students/[id]/edit', roles: ['admin', 'teacher'] },
    { path: '/dashboard/students/[id]', roles: ['admin', 'teacher', 'parent'] },
    { path: '/dashboard/students', roles: ['admin', 'teacher'] },

    // ── Documents ───────────────────────────────────────────
    { path: '/dashboard/documents/verification', roles: ['admin', "teacher"] },
    { path: '/dashboard/documents', roles: ['student'] },         // own docs only

    // ── Teachers ────────────────────────────────────────────
    { path: '/dashboard/teachers', roles: ['admin'] },

    // ── Attendance ──────────────────────────────────────────
    { path: '/dashboard/attendance/mark', roles: ['admin', 'teacher'] },
    { path: '/dashboard/attendance/analytics', roles: ['admin', 'teacher'] },
    { path: '/dashboard/attendance', roles: ['admin', 'teacher'] },
    { path: '/dashboard/my-attendance', roles: ['student'] },
    { path: '/dashboard/child-attendance', roles: ['parent'] },

    // ── Fees ────────────────────────────────────────────────
    { path: '/dashboard/fees/admin', roles: ['admin'] },
    { path: '/dashboard/fees/admin(*)', roles: ['admin'] },
    { path: '/dashboard/fees/admin/assign', roles: ['admin', 'teacher'] },
    { path: '/dashboard/fees/admin/fee-categories', roles: ['admin', 'teacher'] },
    { path: '/dashboard/fees/student', roles: ['student'] },
    { path: '/dashboard/fees/parent', roles: ['parent'] },
    { path: '/dashboard/fees/teacher', roles: ['teacher'] },
    { path: '/dashboard/fees', roles: ['admin', 'teacher', 'student', 'parent'] },

    // ── Exams ───────────────────────────────────────────────
    // ── Exam Sessions ───────────────────────────────────────
    { path: '/dashboard/exam-sessions(*)', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/dashboard/exams/create', roles: ['admin', "teacher"] },
    { path: '/dashboard/exams/bulk', roles: ['admin', "teacher"] },
    { path: '/dashboard/exams', roles: ['admin', 'teacher', "student", 'parent'] },
    { path: '/dashboard/exams/[id]', roles: ['admin', 'teacher', 'student', 'parent'] },

    // ── Leads / CRM ─────────────────────────────────────────
    { path: '/dashboard/leads(*)', roles: ['admin', 'teacher'] },

    // ── Notices ─────────────────────────────────────────────
    { path: '/dashboard/notices/create', roles: ['admin', "teacher"] },
    { path: '/dashboard/notices', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/dashboard/notices/[id]', roles: ['admin', 'teacher', 'student', 'parent'] },


    // ── Leaves ──────────────────────────────────────────────
    { path: '/dashboard/leaves/manage', roles: ['admin', 'teacher'] },
    { path: '/dashboard/leaves', roles: ['admin', 'teacher', 'student'] },

    // ── Complaints ──────────────────────────────────────────
    { path: '/dashboard/anonymous-complaints/manage', roles: ['admin', "teacher"] },
    { path: '/dashboard/anonymous-complaints', roles: '*' },
    { path: '/dashboard/anonymous-complaints/create', roles: '*' },
    { path: '/dashboard/anonymous-complaints/track', roles: '*' },
    { path: '/dashboard/anonymous-complaints/track(*)', roles: '*' },

    // ── Reports ─────────────────────────────────────────────
    { path: '/dashboard/reports', roles: ['admin', 'teacher'] },

    // ── Settings & Org ──────────────────────────────────────
    { path: '/dashboard/settings', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/dashboard/integrations', roles: ['admin', "student"] },
    { path: '/dashboard/organization-gallery', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/dashboard/certificates', roles: ['admin', 'teacher'] },
    { path: '/dashboard/recorded-sessions', roles: ['admin', 'teacher', 'student', 'parent'] },

    // ── Certificate Verification (public) ───────────────────
    { path: '/verify/certificate', roles: ['admin', 'teacher', 'student', 'parent'] },

    // ── Assignments ─────────────────────────────────────────
    { path: '/dashboard/assignments', roles: '*' },


    // ── Parent ──────────────────────────────────────────────
    { path: '/dashboard/my-children', roles: ['parent'] },


    //  Need to Fix Reports and Exam / Exam-sessions

];

/**
 * Find the required roles for a given pathname.
 * Returns '*' if open to all authenticated users, or null if no match.
 */
export function getRequiredRoles(pathname: string): AppRole[] | '*' | null {
    // 1. Exact match
    const exact = ROUTE_PERMISSIONS.find(
        (r) => !r.path.endsWith('(*)') && !r.path.includes('[') && r.path === pathname
    );
    if (exact) return exact.roles;

    // 2. Wildcard match e.g. '/dashboard/grades(*)'
    const wildcard = ROUTE_PERMISSIONS.find(
        (r) => r.path.endsWith('(*)') && pathname.startsWith(r.path.replace('(*)', ''))
    );
    if (wildcard) return wildcard.roles;

    // 3. Dynamic segment match e.g. '/dashboard/students/[id]/edit'
    const dynamic = ROUTE_PERMISSIONS.find((r) => {
        if (!r.path.includes('[')) return false;
        const regexStr = r.path.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${regexStr}$`);
        return regex.test(pathname);
    });
    if (dynamic) return dynamic.roles;

    return null;
}
/**
 * Check if a role is allowed on a route.
 */
export function isAllowed(role: AppRole, requiredRoles: AppRole[] | '*'): boolean {
    if (requiredRoles === '*') return true;
    return requiredRoles.includes(role);
}