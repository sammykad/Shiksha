import { Role } from '@/generated/prisma/enums';

// Each entry is a route prefix and which roles can access it.
// More specific routes go first — first match wins.
// '*' in roles means any authenticated user.
export const ROUTE_PERMISSIONS: { path: string; roles: Role[] | '*' }[] = [
    // ── Onboarding ─────────────────────────────────────────
    { path: '/dashboard/onboarding', roles: ['ADMIN'] },

    // ── Dashboard home — all roles ──────────────────────────
    { path: '/dashboard', roles: '*' },

    // ── Agents / AI ─────────────────────────────────────────
    { path: '/dashboard/agents(*)', roles: ['ADMIN'] },

    // ── Academic Structure ──────────────────────────────────
    { path: '/dashboard/grades(*)', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/subjects', roles: ['ADMIN'] },
    { path: '/dashboard/teaching-assignments', roles: ['ADMIN'] },
    { path: '/dashboard/holidays', roles: ['ADMIN', 'TEACHER'] },

    // ── Students ────────────────────────────────────────────
    { path: '/dashboard/students/create', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/students/[id]/edit', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/students/[id]', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/dashboard/students', roles: ['ADMIN', 'TEACHER'] },

    // ── Documents ───────────────────────────────────────────
    { path: '/dashboard/documents/verification', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/documents', roles: ['STUDENT'] },         // own docs only

    // ── Teachers ────────────────────────────────────────────
    { path: '/dashboard/teachers', roles: ['ADMIN'] },

    // ── Attendance ──────────────────────────────────────────
    { path: '/dashboard/attendance/mark', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/attendance/analytics', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/attendance', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/my-attendance', roles: ['STUDENT'] },
    { path: '/dashboard/child-attendance', roles: ['PARENT'] },

    // ── Fees ────────────────────────────────────────────────
    { path: '/dashboard/fees/admin', roles: ['ADMIN'] },
    { path: '/dashboard/fees/admin(*)', roles: ['ADMIN'] },
    { path: '/dashboard/fees/admin/assign', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/fees/admin/fee-categories', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/fees/student', roles: ['STUDENT'] },
    { path: '/dashboard/fees/parent', roles: ['PARENT'] },
    { path: '/dashboard/fees/teacher', roles: ['TEACHER'] },
    { path: '/dashboard/fees', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },

    // ── Exams ───────────────────────────────────────────────
    // ── Exam Sessions ───────────────────────────────────────
    { path: '/dashboard/exam-sessions(*)', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/dashboard/exams/create', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/exams/bulk', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/exams', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/dashboard/exams/[id]', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },

    // ── Leads / CRM ─────────────────────────────────────────
    { path: '/dashboard/leads(*)', roles: ['ADMIN', 'TEACHER'] },

    // ── Notices ─────────────────────────────────────────────
    { path: '/dashboard/notices/create', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/notices', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/dashboard/notices/[id]', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },


    // ── Leaves ──────────────────────────────────────────────
    { path: '/dashboard/leaves/manage', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/leaves', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },

    // ── Complaints ──────────────────────────────────────────
    { path: '/dashboard/anonymous-complaints/manage', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/anonymous-complaints', roles: '*' },
    { path: '/dashboard/anonymous-complaints/create', roles: '*' },
    { path: '/dashboard/anonymous-complaints/track', roles: '*' },
    { path: '/dashboard/anonymous-complaints/track(*)', roles: '*' },

    // ── Reports ─────────────────────────────────────────────
    { path: '/dashboard/reports', roles: ['ADMIN', 'TEACHER'] },

    // ── Institution (SuperAdmin) ────────────────────────────
    { path: '/dashboard/institution', roles: ['ADMIN'] },

    // ── Settings & Org ──────────────────────────────────────
    { path: '/dashboard/settings', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/dashboard/integrations', roles: ['ADMIN'] },
    { path: '/dashboard/organization-gallery', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/dashboard/certificates', roles: ['ADMIN', 'TEACHER'] },
    { path: '/dashboard/recorded-sessions', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },

    // ── Certificate Verification (public) ───────────────────
    { path: '/verify/certificate', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    // ── Assignments ─────────────────────────────────────────
    { path: '/dashboard/assignments', roles: '*' },
    // ── Parent ──────────────────────────────────────────────
    { path: '/dashboard/my-children', roles: ['PARENT'] },
];

/**
 * Find the required roles for a given pathname.
 * Returns '*' if open to all authenticated users, or null if no match.
 */
export function getRequiredRoles(pathname: string): Role[] | '*' | null {
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
export function isAllowed(role: Role, requiredRoles: Role[] | '*'): boolean {
    if (requiredRoles === '*') return true;
    return requiredRoles.includes(role);
}
