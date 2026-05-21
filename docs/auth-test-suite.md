# Shiksha Cloud — Auth Test Suite (Table View)

## 1. Authentication — Sign In / Sign Up

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-001 | Email + password sign in (happy path) | Critical | 🗄️ | |
| AUTH-002 | Sign in with wrong password | Critical | 🗄️ | |
| AUTH-003 | Email not verified → sign in attempt | Critical | 🗄️ | |
| AUTH-004 | Google OAuth sign in (new user) | Critical | 🗄️ | |
| AUTH-005 | Google OAuth sign in (existing user, account merge) | Critical | 🗄️ | |
| AUTH-006 | Sign up → OTP sent → verify OTP → redirect | Critical | 🗄️ | |
| AUTH-007 | OTP expired (5 min window) | High | 🗄️ | |
| AUTH-008 | OTP wrong 3 times → locked out | High | 🗄️ | |
| AUTH-009 | OTP resend → same OTP returned (reuse strategy) | Medium | 🗄️ | |
| AUTH-010 | Password reset flow end-to-end | Critical | 🗄️ | |
| AUTH-011 | Password reset token expired (30 min) | Critical | 🗄️ | |
| AUTH-012 | Sign in rate limit: 5 attempts / 60s | Critical | 🗄️ | |
| AUTH-013 | Sign up rate limit: 3 attempts / 60s | High | 🗄️ | |
| AUTH-014 | Password too short (< 8 chars) | High | 🗄️ | |
| AUTH-015 | Password too long (> 128 chars) | Medium | 🗄️ | |
| AUTH-016 | Sign in with deleted account | High | 🗄️ | |

## 2. Session Management

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-017 | Session expires after 7 days → redirect to sign-in | Critical | 🗄️ | |
| AUTH-018 | Cookie cache (5 min): suspended member retains access until cache expires | High | 🗄️ | |
| AUTH-019 | `activeOrganizationId` missing → `resolveDefaultOrganizationId` runs | High | 🗄️ | |
| AUTH-020 | 1 ACTIVE membership → auto-set on session create | Critical | 🗄️ | |
| AUTH-021 | 0 ACTIVE memberships → redirect `/select-organization` | Critical | 🗄️ | |
| AUTH-022 | 2+ ACTIVE memberships → no auto-set, user must pick | High | 🗄️ | |
| AUTH-023 | Switch organization → session `activeOrganizationId` updated | Critical | 🗄️ | |
| AUTH-024 | Password reset → old session revoked | Critical | 🗄️ | |
| AUTH-025 | 2 devices signed in → password reset → both sessions revoked | Critical | 🗄️ | |

## 3. Organization Resolution

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-026 | User in org A & B → switching sets correct `activeOrganizationId` | Critical | 🗄️ | |
| AUTH-027 | Membership SUSPENDED → redirect `/select-organization` | Critical | 🗄️ | |
| AUTH-028 | Membership INACTIVE → redirect | Critical | 🗄️ | |
| AUTH-029 | Membership INVITED → NOT treated as ACTIVE | High | 🗄️ | |
| AUTH-030 | Org `isActive=false` → redirect even if membership ACTIVE | Critical | 🗄️ | |
| AUTH-031 | `resolveDefaultOrganizationId` picks most recently used org | Medium | 🗄️ | |
| AUTH-032 | All orgs inactive → returns null → redirect | High | 🗄️ | |

## 4. Authorization — Role-Based Access

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-033 | ADMIN-only route accessed by TEACHER → 403 | Critical | 🗄️ | |
| AUTH-034 | ADMIN-only route accessed by STUDENT → 403 | Critical | 🗄️ | |
| AUTH-035 | ADMIN-only route accessed by PARENT → 403 | Critical | 🗄️ | |
| AUTH-036 | TEACHER route accessed by STUDENT → 403 | Critical | 🗄️ | |
| AUTH-037 | STUDENT accessing own data → 200 | Critical | 🗄️ | |
| AUTH-038 | STUDENT accessing another student's data → 403 (IDOR) | Critical | 🗄️ | |
| AUTH-039 | PARENT accessing linked student's data → 200 | Critical | 🗄️ | |
| AUTH-040 | PARENT accessing unlinked student's data → 403 | Critical | 🗄️ | |
| AUTH-041 | PARENT with no linked students → empty data, no crash | High | 🗄️ | |

## 5. Profile vs Membership Consistency

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-042 | TEACHER membership but no Teacher profile → throws error | High | 🗄️ | 🐛 |
| AUTH-043 | Teacher profile exists but membership = STUDENT → role uses membership | Critical | 🗄️ | |
| AUTH-044 | Student profile exists but membership SUSPENDED → `auth()` redirects first | Critical | 🗄️ | |
| AUTH-045 | Parent in org A switches to org B → no cross-org student leak | Critical | 🗄️ | |
| AUTH-046 | `afterAddMember` hook → Teacher row created on membership creation | High | 🗄️ | |
| AUTH-047 | `afterAcceptInvitation` hook → Teacher row created on invite acceptance | High | 🗄️ | |

## 6. Invitation Flow

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-048 | Invite new user → sign up → membership created with correct role | Critical | 🗄️ | |
| AUTH-049 | Invite existing user → accept → membership ACTIVE | Critical | 🗄️ | |
| AUTH-050 | Invitation expired (7 days) → acceptance rejected | High | 🗄️ | |
| AUTH-051 | Re-invite → old invitation cancelled, new one sent | Medium | 🗄️ | |
| AUTH-052 | Invite already ACTIVE member → handled gracefully | Medium | 🗄️ | |
| AUTH-053 | Accept invitation without email verification → blocked | High | 🗄️ | |
| AUTH-054 | Invitation limit: 100 per org → 101st → error | Medium | 🗄️ | |

## 7. Organization Limits & Plan Guards

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-055 | `organizationLimit: 3` → 4th org creation blocked | High | 🗄️ | |
| AUTH-056 | STANDARD plan → 200 members max → 201st blocked | High | 🗄️ | |
| AUTH-057 | PREMIUM plan → 1000 members max → 1001st blocked | High | 🗄️ | |
| AUTH-058 | ENTERPRISE plan → 5000 members max → 5001st blocked | High | 🗄️ | |
| AUTH-059 | `maxStudents` override → uses custom value instead of plan default | Medium | 🗄️ | |
| AUTH-060 | Non-verified email tries to create org → blocked | High | 🗄️ | |

## 8. Admin Protection

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-061 | Last ADMIN tries to leave org → blocked | Critical | 🗄️ | |
| AUTH-062 | Last ADMIN demoted to TEACHER → blocked | Critical | 🗄️ | |
| AUTH-063 | Last ADMIN removes themselves → blocked | Critical | 🗄️ | |
| AUTH-064 | 2 ADMINs → one leaves → allowed (1 remains) | High | 🗄️ | |
| AUTH-065 | 2 ADMINs → one demoted → allowed | High | 🗄️ | |

## 9. Security & Attack Scenarios

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-066 | Forged/tampered session cookie → rejected | Critical | 🗄️ | |
| AUTH-067 | Replay attack: reuse expired session token → rejected | Critical | 🗄️ | |
| AUTH-068 | IDOR: User A sends User B's userId in body → server uses session userId | Critical | 🗄️ | |
| AUTH-069 | IDOR: Student A guesses Student B's ID → org check blocks | Critical | 🗄️ | |
| AUTH-070 | Cross-org leak: Org A user requests data with Org B ID → blocked | Critical | 🗄️ | |
| AUTH-071 | Unauthenticated request to protected API → 401 | Critical | 🗄️ | |
| AUTH-072 | Valid session but no `activeOrganizationId` → handled gracefully, no crash | High | 🗄️ | |
| AUTH-073 | SQL injection in slug/email → sanitized by Prisma | Critical | 🗄️ | |
| AUTH-074 | Sign up with existing email → duplicate error, not crash | High | 🗄️ | |

## 10. Edge Cases & Race Conditions

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-075 | User deleted mid-session → next request fails gracefully | High | 🗄️ | |
| AUTH-076 | Org deactivated mid-session → next `auth()` redirects | High | 🗄️ | |
| AUTH-077 | Membership suspended mid-session → next `auth()` redirects | High | 🗄️ | |
| AUTH-078 | Two tabs: tab 1 switches org, tab 2 uses updated session | Medium | 🗄️ | ⚠️ |
| AUTH-079 | OTP rapid resend → same OTP returned, no duplicate send | Medium | 🗄️ | |
| AUTH-080 | `createDefaultAcademicYear` called twice → upsert prevents duplicate | Medium | 🗄️ | |
| AUTH-081 | User with `firstName=""` `lastName=""` → no crash | Medium | 🗄️ | |
| AUTH-082 | `profileImage` missing → falls back to `/clerk.png` | Low | 🗄️ | |

## 11. Additional (Code Review Findings)

| Test ID | Scenario | Priority | Type | Bug? |
|---------|----------|----------|------|------|
| AUTH-083 | `getSafeAuthCallbackUrl` blocks `//evil.com` open redirect | Critical | 🗄️ | |
| AUTH-084 | `getSafeAuthCallbackUrl` blocks `javascript:` protocol | Critical | 🗄️ | |
| AUTH-085 | API route calls `auth()` but skips role check → any user can access | Critical | 🗄️ | 🐛 |
| AUTH-086 | Cookie cache comment says "1 min" but code is `60*5` = 5 min | Low | 🧪 | 🐛 |
| AUTH-087 | ADMIN gets `ownerAc`, others get `memberAc` in BetterAuth plugin | Critical | 🗄️ | |
| AUTH-088 | OTP send rate limit: 3 per 60s → 4th blocked | High | 🗄️ | |
| AUTH-089 | Password reset rate limit: 3 per 60s → 4th blocked | High | 🗄️ | |
| AUTH-090 | Global rate limit: 100 req / 10s → 101st blocked | Medium | 🗄️ | |
| AUTH-091 | `disableOrganizationDeletion: true` → org cannot be deleted | Medium | 🗄️ | |
| AUTH-092 | `normalizeSlug` handles spaces, special chars, hyphens | Medium | 🗄️ | |
| AUTH-093 | `normalizeMetadata` handles string, object, null | Low | 🗄️ | |
| AUTH-094 | `toRole()` defaults unknown values to STUDENT | Medium | 🧪 | |
| AUTH-095 | Session `updateAge: 1 day` → sliding window extends expiry | Medium | 🗄️ | |
| AUTH-096 | `trustedOrigins` blocks requests from other origins (CSRF) | Critical | 🗄️ | |
| AUTH-097 | `cookiePrefix: "shiksha"` → cookies prefixed correctly | Low | 🗄️ | |
| AUTH-098 | Google OAuth handles missing `given_name` / `family_name` | Medium | 🗄️ | |
| AUTH-099 | `databaseHooks` parses `"John Michael Doe"` → first/last name | Medium | 🗄️ | |
| AUTH-100 | `autoSignIn: false` → user must sign in separately after sign up | High | 🗄️ | |

---

## Bug Summary

| Test ID | Bug Description | Severity |
|---------|----------------|----------|
| **AUTH-042** | `getCurrentUserByRole()` throws hard error when TEACHER membership exists but no Teacher row | High |
| **AUTH-085** | No global API role middleware — every route must manually check `orgRole` | Critical |
| **AUTH-086** | Cookie cache comment says "1 minute" but code is `60 * 5` = 5 minutes | Low |

## Gap Summary

| Test ID | Gap Description |
|---------|----------------|
| **AUTH-078** | No broadcast mechanism to notify other tabs of org switch |

---

## Risk Matrix

| # | Risk Area | Severity | Likelihood | Status |
|---|-----------|----------|------------|--------|
| 1 | No global API role middleware (AUTH-085) | Critical | High | 🐛 Bug |
| 2 | IDOR on student data (AUTH-038, 069) | Critical | High | ⚠️ Must verify |
| 3 | Cross-org data leak (AUTH-070) | Critical | Medium | ⚠️ Must verify |
| 4 | Teacher profile missing → crash (AUTH-042) | High | Medium | 🐛 Bug |
| 5 | Cookie cache stale role 5 min (AUTH-018) | High | Medium | ⚠️ Acceptable |
| 6 | Forged session cookie (AUTH-066) | Critical | Low | ✅ Covered |
| 7 | Open redirect (AUTH-083, 084) | Critical | Medium | ✅ Covered |
| 8 | OTP brute force (AUTH-008) | High | Medium | ✅ Covered |
| 9 | Last admin removal (AUTH-061–063) | Critical | Low | ✅ Covered |
| 10 | SQL injection (AUTH-073) | Critical | Very Low | ✅ Covered |
