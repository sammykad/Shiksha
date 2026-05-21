# Why Your App Feels Slow — Performance Analysis

## Summary

The slowness comes from **5 compounding bottlenecks** that hit on every single navigation. Below is what I found, ranked by impact.

---

## 🔴 Critical Issues

### 1. [syncOrganizationUser()](file:///d:/nexus/lib/syncUser.ts#115-372) runs on EVERY navigation

[dashboard/layout.tsx](file:///d:/nexus/app/dashboard/layout.tsx#L32) calls [syncOrganizationUser()](file:///d:/nexus/lib/syncUser.ts#115-372) on **every page load/navigation**. This function:

| Step | What it does | Latency |
|------|-------------|---------|
| 1 | `await clerkClient()` | ~50ms |
| 2 | `client.users.getUser()` — **external HTTP call to Clerk API** | ~200-500ms |
| 3 | `client.organizations.getOrganization()` — **another Clerk API call** | ~200-500ms |
| 4 | `prisma.user.findUnique()` — DB lookup | ~20-50ms |
| 5 | Conditional role-specific checks (teacher/parent lookup) | ~20-50ms |

**Even the fast path (user already synced) still makes 2 Clerk API calls + 3 DB queries = ~500-1000ms added to every navigation.**

Steps 2 & 3 are parallelized (`Promise.all`), but they're still external HTTP calls to Clerk's servers, which adds **200-500ms minimum** before anything else in the layout can render.

> [!CAUTION]
> This is the **#1 performance killer**. The sync should only run once per session, not on every navigation.

---

### 2. Waterfall of sequential `await` calls in the layout

In [dashboard/layout.tsx](file:///d:/nexus/app/dashboard/layout.tsx#L27-L41):

```
await auth()                          // ~50ms
await syncOrganizationUser(...)       // ~500-1000ms (blocks everything)
await Promise.all([org, years, year]) // ~100-200ms (only starts AFTER sync finishes) 
```

The sync **blocks** the `Promise.all` below it. Total layout render time: **~700-1200ms** before the page component even starts.

---

### 3. `router.refresh()` triggers full server re-render

Found **12 instances** of `router.refresh()` across the codebase. Each call re-executes the **entire dashboard layout** server component tree, which means:
- [syncOrganizationUser()](file:///d:/nexus/lib/syncUser.ts#115-372) runs again (~500-1000ms)
- All academic year queries run again
- Organization query runs again

Key culprits:
- [SelectedChildContext.tsx:50](file:///d:/nexus/context/SelectedChildContext.tsx#L50) — child switching
- [AcademicYearContext.tsx:44](file:///d:/nexus/context/AcademicYearContext.tsx#L44) — year switching
- [attendance-filter.tsx](file:///d:/nexus/components/dashboard/StudentAttendance/attendance-filter.tsx) — 3 separate refresh calls

---

## 🟡 Moderate Issues

### 4. Prisma `$extends` middleware runs `getActiveAcademicYearId()` per query

[db.ts](file:///d:/nexus/lib/db.ts#L27-L40) intercepts every read on year-scoped models and calls `getActiveAcademicYearId()`. While this is `cache()`-wrapped per request, it still:
- Reads cookies
- Makes a DB query to verify the year exists
- Calls `getOrganizationId()` → calls `auth()` again

For a page that makes 5 year-scoped queries, this adds overhead compared to passing the year ID explicitly.

### 5. `next-pwa` with legacy `require()` syntax

[next.config.ts](file:///d:/nexus/next.config.ts#L2-L9) uses the deprecated `next-pwa` package with `require()`. This:
- Adds build-time overhead with runtime caching config
- `next-pwa` is abandoned — last update was 2022
- The `require()` breaks proper ESM tree-shaking

---

## 🟢 Things Done Right

- ✅ `Promise.all` for parallel queries in layout & role-wrapper
- ✅ `useOptimistic` for instant child-switching UI
- ✅ `react.cache()` on data-fetching functions
- ✅ `turbopackFileSystemCacheForDev` enabled
- ✅ Global Prisma singleton pattern

---

## Recommended Fixes (by impact)

### Fix 1: Cache [syncOrganizationUser](file:///d:/nexus/lib/syncUser.ts#115-372) per session (🔴 Highest Impact)

Instead of syncing on every navigation, sync once and set a cookie/flag:

```diff
// dashboard/layout.tsx
+ import { cookies } from 'next/headers';

  export default async function DashboardLayout({ children }) {
    const { userId, orgRole, orgId } = await auth();
    if (!userId) return <RedirectToSignIn />;
    if (!orgId || !orgRole) redirect('/select-organization?returnUrl=/dashboard');

-   await syncOrganizationUser(orgId, orgRole, userId);
+   // Only sync once per session (cookie lasts 24h)
+   const cookieStore = await cookies();
+   const syncKey = `synced_${userId}_${orgId}`;
+   if (!cookieStore.get(syncKey)) {
+     await syncOrganizationUser(orgId, orgRole, userId);
+     cookieStore.set(syncKey, '1', { path: '/', maxAge: 86400 });
+   }

    const [organization, academicYears, activeYearId] = await Promise.all([
```

**Expected improvement: ~500-1000ms saved on every navigation after first load.**

### Fix 2: Parallelize the remaining layout calls

Even after fixing sync, auth → Promise.all is still serial. Move org query into the Promise.all:

```diff
- await syncOrganizationUser(orgId, orgRole, userId);
-
- const [organization, academicYears, activeYearId] = await Promise.all([...]);
+ // Run sync (if needed) in parallel with data fetches
+ const [, organization, academicYears, activeYearId] = await Promise.all([
+   shouldSync ? syncOrganizationUser(orgId, orgRole, userId) : Promise.resolve(),
+   prisma.organization.findUnique({ where: { id: orgId }, select: { organizationType: true } }),
+   getAcademicYears(orgId),
+   getActiveAcademicYearId(),
+ ]);
```

### Fix 3: Replace `next-pwa` with Serwist

The `next-pwa` package is abandoned. Replace with `@serwist/next` which is actively maintained and supports modern Next.js.

### Fix 4: Reduce `router.refresh()` usage

For child switching, consider using `revalidatePath` or `revalidateTag` in server actions instead of full `router.refresh()` which re-runs the entire server component tree.

---

## Quick Win Summary

| Fix | Effort | Impact | Saves |
|-----|--------|--------|-------|
| Session-cache sync | 10 min | 🔴 Critical | ~500-1000ms/nav |
| Parallelize layout | 5 min | 🟡 Medium | ~100-200ms/nav |
| Replace next-pwa | 30 min | 🟡 Medium | Build time + bundle |
| Reduce router.refresh | 1-2 hrs | 🟡 Medium | ~500ms per action |

> [!TIP]
> Fix 1 alone should make the app feel **dramatically** faster. The Clerk API calls are the dominant bottleneck.
