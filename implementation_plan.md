# RBAC Overhaul — Production-Ready Permission System

## Problem Statement

The codebase has **3 separate, disconnected systems** for access control:

1. **[rbac.ts](file:///d:/shiksha/lib/rbac.ts)** — Route-level role gating (used only in [dashboard layout](file:///d:/shiksha/app/dashboard/layout.tsx))
2. **[permissions.ts](file:///d:/shiksha/lib/permissions.ts)** — Clerk-style `createHas()` / `createTypedHas()` / `requireAuth()` / `checkAuth()` (fully implemented but **never consumed anywhere**)
3. **Ad-hoc `orgRole ===` checks** — Scattered across 15+ server actions, pages, and components (the actual auth enforcement today)

The result:
- `permissions.ts` is dead code — `createHas`, `requireAuth`, `checkAuth`, `createTypedHas` have **zero consumers** outside the file itself
- `RolePermissions.tsx` UI renders a checkbox grid but **doesn't save anything** — toggling checkboxes only updates local React state
- `proxy.ts` middleware only checks if a session cookie exists — **no role/permission checks**
- Every server action does its own `if (orgRole !== 'ADMIN')` check manually — no unified guard
- There is no client-side `has()` function — front-end role checks use prop drilling from `auth()` or `useSession()`
- Better Auth's organization plugin has its own `hasPermission()` endpoint, but it's never used
- The `AuthContext` in `permissions.ts` (line 175) conflicts with the `AuthContext` type in `auth.ts` (line 364) — same name, different shapes

## User Review Required

> [!IMPORTANT]
> **Decision: Better Auth native `hasPermission` vs. Custom `has()` system?**
>
> Better Auth's organization plugin has a built-in `hasPermission()` endpoint ([skill docs](file:///d:/shiksha/.agents/skills/organization-best-practices/SKILL.md#L220-L232)) that uses the `ac` (access control) system with `ownerAc`, `memberAc`, `defaultAc`. However, your roles (ADMIN/TEACHER/STUDENT/PARENT) currently all map to either `ownerAc` or `memberAc`, which is very coarse-grained — it can't express "Teacher can mark attendance but not manage fees."
>
> **Recommendation**: Keep the custom `has()` system from `permissions.ts` (it's already well-designed) but **actually wire it into everything**. Better Auth handles authentication; our custom system handles authorization. This gives us fine-grained, Shiksha-specific permissions without fighting Better Auth's permission model.

> [!WARNING]
> **Feature flags and reverification are premature.**
>
> `permissions.ts` includes `Feature` flags (lines 136-147) and `ReverificationConfig` (lines 152-169). These are not used anywhere and add complexity. I recommend **removing** them from the `AuthContext` and `HasParams` for now and adding them back when there's an actual use case (plan tier feature gating, 2FA for sensitive actions).

> [!IMPORTANT]
> **RolePermissions UI — what should it actually do?**
>
> Currently the UI lets you toggle permissions per user, but there's no backend to save custom overrides. Two options:
>
> **Option A (Recommended for MVP)**: Make the UI **read-only** — show what each role can do based on `ROLE_CAPABILITIES`. Remove the checkbox interactivity. Label it "Role Capabilities Overview."
>
> **Option B (Future)**: Build per-user custom permission overrides stored in a DB table. This is a significant feature (needs schema changes, migration, admin UI, API endpoints). Not recommended for launch.

## Open Questions

> [!IMPORTANT]
> **1. SuperAdmin role** — `ROUTE_PERMISSIONS` maps `/dashboard/institution` to `['ADMIN']` (line 106), but AGENTS.md says it should be SuperAdmin-only. Since SuperAdmin doesn't exist in the `Role` enum yet, should we:
> - (a) Keep it as ADMIN for now and add SuperAdmin later?
> - (b) Add a `SUPER_ADMIN` check via a separate mechanism (e.g., a `isSuperAdmin` flag)?
>
> **2. Should server actions throw or return error objects?**
> Current pattern is mixed — some throw, some return `{ success: false, error: '...' }`. The `requireAuth()` function throws, while `checkAuth()` returns `{ ok: false }`. Which pattern should be the standard going forward?

---

## Proposed Changes

### Phase 1: Consolidate & Clean — The `has()` Core

#### [MODIFY] [permissions.ts](file:///d:/shiksha/lib/permissions.ts)

- **Rename** `AuthContext` → `PermissionContext` to avoid conflict with `auth.ts`'s `AuthContext`
- **Remove** `Feature`, `ReverificationConfig`, `ReverificationLevel`, and all reverification-related code (dead code, no consumers, premature)
- **Remove** `factorVerificationCount`, `lastVerifiedAt`, `tokenType` from `PermissionContext` (unused)
- **Simplify** `PermissionContext` to only what we actually use:
  ```ts
  export interface PermissionContext {
    userId: string | null
    role: Role | null
    orgId: string | null
    permissions: Permission[]  // for future per-user overrides
  }
  ```
- **Keep** `createHas()`, `createTypedHas()`, `requireAuth()`, `checkAuth()`, `ROLE_CAPABILITIES`, `ROLE_HIERARCHY`, `ROLE_META` — they're well-designed
- **Rename** `createAuthContext()` → `createPermissionContext()` (clarity)
- **Export** a `getPermissionsForRole(role: Role): Permission[]` helper that returns the combined permissions (capabilities + any custom overrides in future)

---

### Phase 2: Wire `has()` Into Server-Side `auth()`

#### [MODIFY] [auth.ts](file:///d:/shiksha/lib/auth.ts)

This is the key integration point. The `auth()` function already returns `{ userId, orgId, orgRole, orgSlug, user, session }`. We extend it to return a `has` function:

- **Extend `AuthContext`** type (line 364) to include:
  ```ts
  export type AuthContext = {
    userId: string
    orgId: string
    orgRole: Role
    orgSlug: string
    user: AuthUser
    session: BetterAuthSession["session"]
    // NEW:
    has: HasFunction
    hasRole: (role: Role) => boolean
    hasPermission: (permission: Permission) => boolean
  }
  ```
- **Build the `has` function** inside `auth()` before returning:
  ```ts
  const permCtx = createPermissionContext({
    userId: session.user.id,
    role: membership.role as Role,
    orgId,
  })
  const { has, hasRole, hasPermission } = createTypedHas(permCtx)
  
  return {
    ...existingFields,
    has,
    hasRole,
    hasPermission,
  }
  ```
- Now **every server component and server action** that calls `await auth()` gets `has()` for free — identical DX to Clerk

**Usage in server actions becomes:**
```ts
// Before (scattered everywhere):
const { orgRole } = await auth()
if (orgRole !== 'ADMIN') return { success: false, error: 'Unauthorized' }

// After (one-liner):
const { hasRole, hasPermission } = await auth()
if (!hasPermission('fees:manage')) return { success: false, error: 'Unauthorized' }
```

---

### Phase 3: Wire `has()` Into Client-Side

#### [NEW] [lib/hooks/use-permissions.ts](file:///d:/shiksha/lib/hooks/use-permissions.ts)

Create a React context + hook that provides `has()` on the client:

```ts
"use client"
import { createContext, useContext } from "react"
import { Role } from "@/generated/prisma/enums"
import { createTypedHas, createPermissionContext, type Permission } from "@/lib/permissions"

interface PermissionsContextValue {
  role: Role
  has: ReturnType<typeof createTypedHas>["has"]
  hasRole: ReturnType<typeof createTypedHas>["hasRole"]
  hasPermission: ReturnType<typeof createTypedHas>["hasPermission"]
  hasAnyRole: ReturnType<typeof createTypedHas>["hasAnyRole"]
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

export function usePermissions() {
  const ctx = useContext(PermissionsContext)
  if (!ctx) throw new Error("usePermissions must be inside PermissionsProvider")
  return ctx
}
```

#### [NEW] [components/providers/permissions-provider.tsx](file:///d:/shiksha/components/providers/permissions-provider.tsx)

Server component wrapper that builds the context from `auth()` and passes it to a client provider:

```tsx
// Server component that fetches auth and passes to client
export async function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { orgRole, userId, orgId } = await auth()
  return (
    <PermissionsClientProvider role={orgRole} userId={userId} orgId={orgId}>
      {children}
    </PermissionsClientProvider>
  )
}
```

#### [MODIFY] [app/dashboard/layout.tsx](file:///d:/shiksha/app/dashboard/layout.tsx)

- Wrap children with `<PermissionsProvider>` so all dashboard pages get `usePermissions()` for free
- Replace the manual `getRequiredRoles()` + `isAllowed()` check with `has({ role: ... })`

---

### Phase 4: Unify Route Permissions Into `permissions.ts`

#### [DELETE] [lib/rbac.ts](file:///d:/shiksha/lib/rbac.ts) → merge into `permissions.ts`

- Move `ROUTE_PERMISSIONS`, `getRequiredRoles()`, `isAllowed()`, `ROLE_HOMEPAGE` into `permissions.ts`
- This eliminates the split-brain between "which roles can access a route" (`rbac.ts`) and "which roles have which capabilities" (`permissions.ts`)
- Single file = single source of truth

---

### Phase 5: Enforce in Middleware

#### [MODIFY] [proxy.ts](file:///d:/shiksha/proxy.ts)

Currently the middleware only checks session existence. We can't do full permission checks here (no DB access in edge middleware), but we **can**:

- Keep the current session-cookie check (redirect to sign-in if missing)
- Add `x-pathname` header (already done)
- The actual role gating stays in the `dashboard/layout.tsx` server component where we have full DB access

> No changes needed to `proxy.ts` — the current approach is correct for edge middleware. Role enforcement in `layout.tsx` is the right architectural choice.

---

### Phase 6: Migrate Ad-Hoc Checks to `has()`

Replace all scattered `orgRole ===` / `orgRole !==` checks with `hasPermission()` or `hasRole()`:

| File | Current Pattern | New Pattern |
|---|---|---|
| [revoke-id-card.ts](file:///d:/shiksha/lib/data/id-card/revoke-id-card.ts) | `if (orgRole !== 'ADMIN')` | `if (!hasPermission('students:manage'))` |
| [generate-bulk-id-cards.ts](file:///d:/shiksha/lib/data/id-card/generate-bulk-id-cards.ts) | `if (orgRole !== 'ADMIN')` | `if (!hasPermission('students:manage'))` |
| [delete-organization.ts](file:///d:/shiksha/lib/data/organization/delete-organization.ts) | `if (orgRole !== Role.ADMIN)` | `if (!hasPermission('org:delete'))` |
| [assign-lead.ts](file:///d:/shiksha/lib/data/leads/assign-lead.ts) | `if (orgRole !== ADMIN && orgRole !== TEACHER)` | `if (!hasPermission('leads:manage'))` |
| [edit-lead.ts](file:///d:/shiksha/lib/data/leads/edit-lead.ts) | `if (orgRole !== ADMIN && orgRole !== TEACHER)` | `if (!hasPermission('leads:manage'))` |
| [invoice pdf route](file:///d:/shiksha/app/api/billing/invoice/[invoiceId]/pdf/route.ts) | `if (orgRole !== "ADMIN")` | `if (!hasPermission('fees:manage'))` |
| [onboarding layout](file:///d:/shiksha/app/dashboard/onboarding/layout.tsx) | `if (orgRole !== 'ADMIN')` | `if (!hasRole('ADMIN'))` |
| [child-attendance page](file:///d:/shiksha/app/dashboard/child-attendance/page.tsx) | `if (orgRole !== 'PARENT')` | `if (!hasRole('PARENT'))` |
| [students page](file:///d:/shiksha/app/dashboard/students/page.tsx) | `if (orgRole === 'STUDENT' \|\| orgRole === 'PARENT')` | `if (!hasPermission('students:view'))` |
| [navbar.tsx](file:///d:/shiksha/components/dashboard-layout/navbar.tsx) | `orgRole === "ADMIN" &&` | `hasPermission('org:manage') &&` |
| [id-cards page](file:///d:/shiksha/app/dashboard/id-cards/page.tsx) | `orgRole === 'ADMIN'` | `hasPermission('students:manage')` |
| [settings page](file:///d:/shiksha/app/dashboard/settings/page.tsx) | `switch (orgRole)` | Keep — this is view routing, not access control |

---

### Phase 7: Fix the RolePermissions UI

#### [MODIFY] [RolePermissions.tsx](file:///d:/shiksha/components/dashboard/admin/settings/RolePermissions.tsx)

Make it a **read-only capabilities overview** (Option A):

- Remove `onToggle` callback and `handleToggle` state mutation
- Make checkboxes `disabled` — show the default capabilities per role
- Rename header from "User Permissions" to "Role Capabilities"
- Add a note: "These are the default capabilities for each role. Custom per-user overrides coming soon."
- Remove the "Restore default" button (no edits to restore)
- This makes the UI honest — it shows what exists, not a fake editor

---

### Phase 8: Menu List Integration

#### [MODIFY] [lib/menu-list.ts](file:///d:/shiksha/lib/menu-list.ts)

Currently the sidebar is a hardcoded `Record<Role, Group[]>` — each role gets a completely different menu. This works but duplicates information already in `ROUTE_PERMISSIONS`.

**For now**: Keep the current approach — it's working and role-based menus are a valid UX pattern. The `has()` function is more useful for in-page conditional rendering.

**Future**: Annotate each menu item with `requiredPermission` and filter dynamically using `has()`.

---

## Summary of File Changes

| Action | File | What Changes |
|---|---|---|
| MODIFY | [permissions.ts](file:///d:/shiksha/lib/permissions.ts) | Remove dead code (Feature, Reverification), rename AuthContext, absorb rbac.ts content |
| MODIFY | [auth.ts](file:///d:/shiksha/lib/auth.ts) | Extend `AuthContext` return type with `has`, `hasRole`, `hasPermission` |
| NEW | [lib/hooks/use-permissions.ts](file:///d:/shiksha/lib/hooks/use-permissions.ts) | Client-side React context + `usePermissions()` hook |
| NEW | [components/providers/permissions-provider.tsx](file:///d:/shiksha/components/providers/permissions-provider.tsx) | Server→Client permission bridge |
| MODIFY | [app/dashboard/layout.tsx](file:///d:/shiksha/app/dashboard/layout.tsx) | Use PermissionsProvider, use `has()` for route gating |
| DELETE | [lib/rbac.ts](file:///d:/shiksha/lib/rbac.ts) | Merged into permissions.ts |
| MODIFY | [RolePermissions.tsx](file:///d:/shiksha/components/dashboard/admin/settings/RolePermissions.tsx) | Make read-only, remove fake interactivity |
| MODIFY | 10+ server actions & pages | Replace `orgRole ===` with `hasPermission()` / `hasRole()` |
| NO CHANGE | [proxy.ts](file:///d:/shiksha/proxy.ts) | Current edge middleware approach is correct |
| NO CHANGE | [auth-client.ts](file:///d:/shiksha/lib/auth-client.ts) | No changes needed |
| NO CHANGE | [menu-list.ts](file:///d:/shiksha/lib/menu-list.ts) | Keep current role-based menus |

---

## Verification Plan

### Automated Tests
```bash
npm run build    # Ensure no type errors from AuthContext changes
npm run lint     # Ensure no unused imports after rbac.ts removal
```

### Manual Verification
- Login as each role (ADMIN, TEACHER, STUDENT, PARENT) and verify:
  - Correct sidebar menu items visible
  - Correct routes accessible / redirect on unauthorized
  - Server actions reject unauthorized calls
- Check RolePermissions UI in Admin Settings → shows read-only capabilities
- Verify `usePermissions()` hook works in client components
- Verify `has()` / `hasPermission()` / `hasRole()` work in server actions

### Smoke Test Checklist
- [ ] ADMIN can access all management pages
- [ ] TEACHER can mark attendance but cannot access billing/institution
- [ ] STUDENT can only see own data (fees, attendance, documents)
- [ ] PARENT can only see child-scoped data
- [ ] Unauthorized route access redirects to dashboard
- [ ] Server action calls with wrong role return proper error
