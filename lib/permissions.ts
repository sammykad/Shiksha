// lib/permissions.ts
// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE PERMISSION SYSTEM — Auth-Framework Independent
// Drop-in replacement for Clerk's has() with identical API
// Compatible with: Clerk, Better Auth, NextAuth, Lucia, custom auth
// ─────────────────────────────────────────────────────────────────────────────

import { Role } from "@/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────
// 1. ROLE SYSTEM
// ─────────────────────────────────────────────────────────────


/** Role hierarchy — higher = more privileges. Used for min: checks. */
export const ROLE_HIERARCHY: Readonly<Record<Role, number>> = {
  [Role.ADMIN]: 4,
  [Role.TEACHER]: 3,
  [Role.STUDENT]: 2,
  [Role.PARENT]: 1,
} as const

export const ROLE_META: Readonly<Record<Role, { label: string; icon: string; color: string }>> = {
  [Role.ADMIN]: { label: 'Administrator', icon: '👑', color: '#7c3aed' },
  [Role.TEACHER]: { label: 'Teacher', icon: '👨‍🏫', color: '#2563eb' },
  [Role.STUDENT]: { label: 'Student', icon: '🎓', color: '#059669' },
  [Role.PARENT]: { label: 'Parent', icon: '👨‍👩‍👧', color: '#d97706' },
} as const

export const ROLE_CAPABILITIES: Readonly<Record<Role, Permission[]>> = {
  [Role.ADMIN]: [
    'org:manage', 'org:delete', 'org:settings:update',
    'users:manage', 'users:create', 'users:delete', 'users:view',
    'students:manage', 'students:create', 'students:delete', 'students:view',
    'teachers:manage', 'teachers:create', 'teachers:delete', 'teachers:view',
    'grades:manage', 'grades:create', 'grades:delete', 'grades:view',
    'subjects:manage', 'subjects:create', 'subjects:delete', 'subjects:view',
    'teaching-assignments:manage', 'teaching-assignments:view',
    'attendance:manage', 'attendance:mark', 'attendance:view', 'attendance:analytics',
    'fees:manage', 'fees:create', 'fees:assign', 'fees:view', 'fees:delete', 'fees:reminders', 'fees:reports',
    'exams:manage', 'exams:create', 'exams:delete', 'exams:view', 'exams:results:view',
    'notices:manage', 'notices:create', 'notices:publish', 'notices:delete', 'notices:view',
    'complaints:manage', 'complaints:view', 'complaints:resolve', 'complaints:create',
    'leaves:manage', 'leaves:approve', 'leaves:apply', 'leaves:view:own',
    'documents:verify', 'documents:reject', 'documents:upload', 'documents:view:own',
    'holidays:manage', 'holidays:create', 'holidays:delete', 'holidays:view',
    'leads:manage', 'leads:view', 'leads:create', 'leads:convert',
    'reports:view', 'reports:generate',
    'agents:manage', 'agents:view',
    'certificates:generate',
    'gallery:manage', 'gallery:view',
    'assignments:manage', 'assignments:view',
    'transport:view',
  ],
  [Role.TEACHER]: [
    'students:manage', 'students:create', 'students:view',
    'grades:view', 'grades:manage:assigned',
    'subjects:view',
    'teaching-assignments:view',
    'attendance:mark', 'attendance:view', 'attendance:analytics',
    'fees:view', 'fees:assign',
    'exams:manage', 'exams:create', 'exams:view', 'exams:results:view',
    'notices:manage', 'notices:create', 'notices:view',
    'complaints:manage', 'complaints:view', 'complaints:resolve', 'complaints:create',
    'leaves:apply', 'leaves:view:own',
    'documents:verify', 'documents:upload', 'documents:view:own',
    'holidays:view',
    'leads:view', 'leads:create',
    'reports:view',
    'gallery:view',
    'assignments:manage', 'assignments:view',
  ],
  [Role.STUDENT]: [
    'attendance:view:own',
    'fees:view:own', 'fees:pay', 'fees:receipt:download',
    'exams:view', 'exams:results:view',
    'notices:view',
    'complaints:create', 'complaints:track',
    'leaves:apply',
    'documents:upload', 'documents:view:own',
    'profile:edit:own',
    'gallery:view',
    'assignments:view', 'assignments:submit',
  ],
  [Role.PARENT]: [
    'children:view',
    'attendance:view:child',
    'fees:view:child', 'fees:pay:child',
    'exams:view:child', 'exams:results:view:child',
    'notices:view',
    'complaints:create', 'complaints:track',
    'transport:view',
    'profile:view:child',
    'gallery:view',
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 2. PERMISSION TYPES
// ─────────────────────────────────────────────────────────────

export type Permission =
  | 'org:manage' | 'org:delete' | 'org:settings:update'
  | 'users:manage' | 'users:create' | 'users:delete' | 'users:view'
  | 'students:manage' | 'students:create' | 'students:delete' | 'students:view'
  | 'teachers:manage' | 'teachers:create' | 'teachers:delete' | 'teachers:view'
  | 'grades:manage' | 'grades:create' | 'grades:delete' | 'grades:view' | 'grades:manage:assigned'
  | 'subjects:manage' | 'subjects:create' | 'subjects:delete' | 'subjects:view'
  | 'teaching-assignments:manage' | 'teaching-assignments:view'
  | 'attendance:manage' | 'attendance:mark' | 'attendance:view' | 'attendance:analytics'
  | 'attendance:view:own' | 'attendance:view:child'
  | 'fees:manage' | 'fees:create' | 'fees:assign' | 'fees:view' | 'fees:delete'
  | 'fees:reminders' | 'fees:reports' | 'fees:view:own' | 'fees:view:child'
  | 'fees:pay' | 'fees:pay:child' | 'fees:receipt:download'
  | 'exams:manage' | 'exams:create' | 'exams:delete' | 'exams:view'
  | 'exams:results:view' | 'exams:results:view:child' | 'exams:view:child'
  | 'notices:manage' | 'notices:create' | 'notices:publish' | 'notices:delete' | 'notices:view'
  | 'complaints:manage' | 'complaints:view' | 'complaints:resolve' | 'complaints:create' | 'complaints:track'
  | 'leaves:manage' | 'leaves:approve' | 'leaves:apply' | 'leaves:view:own'
  | 'documents:verify' | 'documents:reject' | 'documents:upload' | 'documents:view:own'
  | 'holidays:manage' | 'holidays:create' | 'holidays:delete' | 'holidays:view'
  | 'leads:manage' | 'leads:view' | 'leads:create' | 'leads:convert'
  | 'reports:view' | 'reports:generate'
  | 'agents:manage' | 'agents:view'
  | 'certificates:generate'
  | 'transport:view'
  | 'profile:edit:own' | 'profile:view:child'
  | 'gallery:manage' | 'gallery:view'
  | 'assignments:view' | 'assignments:submit' | 'assignments:manage'
  | 'children:view'

// ─────────────────────────────────────────────────────────────
// 3. FEATURE FLAGS
// ─────────────────────────────────────────────────────────────

export type Feature =
  | 'ai-agent' | 'ai-reports' | 'ai-attendance'
  | 'online-payment'
  | 'sms-notifications' | 'whatsapp-notifications' | 'push-notifications' | 'email-notifications'
  | 'bus-tracking' | 'biometric-attendance'
  | 'certificate-generator'
  | 'bulk-import'
  | 'api-access'
  | 'custom-domain' | 'white-label'
  | 'exam-hall-tickets' | 'report-cards'
  | 'multi-tenant' | 'sso'

// ─────────────────────────────────────────────────────────────
// 4. PLAN / SUBSCRIPTION TIERS
// ─────────────────────────────────────────────────────────────

export type Plan = 'free' | 'standard' | 'premium' | 'enterprise'

export const PLAN_HIERARCHY: Readonly<Record<Plan, number>> = {
  free: 1, standard: 2, premium: 3, enterprise: 4,
} as const

export const PLAN_META: Readonly<Record<Plan, { label: string; price: number }>> = {
  free: { label: 'Free', price: 0 },
  standard: { label: 'Standard', price: 999 },
  premium: { label: 'Premium', price: 2499 },
  enterprise: { label: 'Enterprise', price: 0 }, // custom pricing
} as const

export const PLAN_FEATURES: Readonly<Record<Plan, readonly Feature[]>> = {
  free: [
    'email-notifications', 'exam-hall-tickets',
  ],
  standard: [
    'email-notifications', 'sms-notifications',
    'online-payment', 'ai-attendance',
    'exam-hall-tickets', 'report-cards', 'bulk-import',
  ],
  premium: [
    'email-notifications', 'sms-notifications', 'whatsapp-notifications', 'push-notifications',
    'online-payment',
    'ai-agent', 'ai-reports', 'ai-attendance',
    'bus-tracking', 'biometric-attendance',
    'certificate-generator',
    'exam-hall-tickets', 'report-cards', 'bulk-import',
    'api-access',
  ],
  enterprise: [
    'email-notifications', 'sms-notifications', 'whatsapp-notifications', 'push-notifications',
    'online-payment',
    'ai-agent', 'ai-reports', 'ai-attendance',
    'bus-tracking', 'biometric-attendance',
    'certificate-generator',
    'exam-hall-tickets', 'report-cards', 'bulk-import',
    'api-access',
    'custom-domain', 'white-label',
    'multi-tenant', 'sso',
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 5. REVERIFICATION
// ─────────────────────────────────────────────────────────────

export type ReverificationLevel = 'first_factor' | 'second_factor' | 'multi_factor'

export type ReverificationConfig =
  | ReverificationLevel
  | { level: ReverificationLevel; afterMinutes: number }

export const REVERIFICATION_PRESETS: Readonly<Record<string, number>> = {
  strict_mfa: 10,
  strict: 10,
  moderate: 60,
  lax: 1440,
} as const

export const REVERIFICATION_LEVELS: Readonly<Record<ReverificationLevel, { minFactors: number }>> = {
  first_factor: { minFactors: 1 },
  second_factor: { minFactors: 2 },
  multi_factor: { minFactors: 2 },
} as const

// ─────────────────────────────────────────────────────────────
// 6. AUTH CONTEXT
// ─────────────────────────────────────────────────────────────

export interface AuthContext {
  userId: string | null
  sessionId: string | null
  role: Role | null
  orgId: string | null
  orgSlug: string | null
  permissions: Permission[]
  features: Feature[]
  plan: Plan
  factorVerificationCount: number
  lastVerifiedAt: number | null
  tokenType: 'session' | 'api_key' | 'oauth_token' | 'm2m_token'
}

// ─────────────────────────────────────────────────────────────
// 7. HAS() TYPES
// ─────────────────────────────────────────────────────────────

export interface HasParams {
  role?: Role | `min:${Role}`
  permission?: Permission
  feature?: Feature
  plan?: Plan
  reverification?: ReverificationConfig
}

export type HasFunction = (params: HasParams) => boolean

// ─────────────────────────────────────────────────────────────
// 8. createHas() — CORE ENGINE
// ─────────────────────────────────────────────────────────────

export function createHas(ctx: Partial<AuthContext>): HasFunction {
  return function has(params: HasParams): boolean {
    // Machine tokens are not allowed for user/org access control
    if (ctx.tokenType && ctx.tokenType !== 'session') return false

    const { role, permission, feature, plan, reverification } = params
    let result = true

    // Role check
    if (role !== undefined) {
      if (!ctx.role) {
        result = false
      } else if (role.startsWith('min:')) {
        const minRole = role.replace('min:', '') as Role
        result = result && (ROLE_HIERARCHY[ctx.role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0)
      } else {
        result = result && ctx.role === role
      }
    }

    // Permission check — explicit first, then role capabilities
    if (permission !== undefined) {
      if (!ctx.role) {
        result = false
      } else {
        const hasExplicit = ctx.permissions?.includes(permission) ?? false
        const hasCapability = ROLE_CAPABILITIES[ctx.role]?.includes(permission) ?? false
        result = result && (hasExplicit || hasCapability)
      }
    }

    // Feature check — use ctx.features if set, otherwise derive from plan
    if (feature !== undefined) {
      const features = ctx.features?.length ? ctx.features : PLAN_FEATURES[ctx.plan ?? 'free']
      result = result && (features as readonly string[]).includes(feature)
    }

    // Plan check — hierarchical (premium satisfies standard check)
    if (plan !== undefined) {
      if (!ctx.plan) {
        result = false
      } else {
        result = result && (PLAN_HIERARCHY[ctx.plan] ?? 0) >= (PLAN_HIERARCHY[plan] ?? 0)
      }
    }

    // Reverification check
    if (reverification !== undefined) {
      if (ctx.lastVerifiedAt === null || ctx.lastVerifiedAt === undefined) {
        result = false
      } else {
        const config: { level: ReverificationLevel; afterMinutes: number } =
          typeof reverification === 'string'
            ? {
              level: (reverification as string) === 'strict_mfa'
                ? 'multi_factor'
                : (reverification as ReverificationLevel),
              afterMinutes: REVERIFICATION_PRESETS[reverification] ?? 10,
            }
            : reverification

        const elapsedMinutes = (Date.now() - ctx.lastVerifiedAt) / 60_000
        if (elapsedMinutes > config.afterMinutes) result = false

        const requiredFactors = REVERIFICATION_LEVELS[config.level].minFactors
        if ((ctx.factorVerificationCount ?? 0) < requiredFactors) result = false
      }
    }

    return result
  }
}

// ─────────────────────────────────────────────────────────────
// 9. createTypedHas() — ERGONOMIC WRAPPER
// ─────────────────────────────────────────────────────────────

export function createTypedHas(ctx: Partial<AuthContext>) {
  const has = createHas(ctx)
  return {
    has,
    /** Check exact role */
    hasRole: (role: Role) => has({ role }),
    /** Check role or above in hierarchy */
    hasMinRole: (role: Role) => has({ role: `min:${role}` }),
    /** Check specific permission */
    hasPermission: (permission: Permission) => has({ permission }),
    /** Check feature flag */
    hasFeature: (feature: Feature) => has({ feature }),
    /** Check plan tier (hierarchical) */
    hasPlan: (plan: Plan) => has({ plan }),
    /** True if user has ANY of the given roles */
    hasAnyRole: (...roles: Role[]) => roles.some(r => has({ role: r })),
    /** True if user has ALL of the given permissions */
    hasAllPermissions: (...permissions: Permission[]) => permissions.every(p => has({ permission: p })),
    /** True if user has ANY of the given permissions */
    hasAnyPermission: (...permissions: Permission[]) => permissions.some(p => has({ permission: p })),
  }
}

// ─────────────────────────────────────────────────────────────
// 10. requireAuth() / checkAuth() — SERVER GUARDS
// ─────────────────────────────────────────────────────────────

/** Throws if the check fails. Use in server actions. */
export function requireAuth(ctx: Partial<AuthContext>, params: HasParams): void {
  if (!createHas(ctx)(params)) {
    throw new Error(
      `[permissions] Authorization failed.\n` +
      `Required: ${JSON.stringify(params)}\n` +
      `Context: role=${ctx.role}, plan=${ctx.plan}`
    )
  }
}

/** Returns { ok: true } or { ok: false, reason }. Never throws. */
export function checkAuth(
  ctx: Partial<AuthContext>,
  params: HasParams,
): { ok: true } | { ok: false; reason: string } {
  if (createHas(ctx)(params)) return { ok: true }

  const reasons: string[] = []
  if (params.role) reasons.push(`role: need "${params.role}", have "${ctx.role}"`)
  if (params.permission) reasons.push(`permission: "${params.permission}" not granted`)
  if (params.feature) reasons.push(`feature: "${params.feature}" not enabled`)
  if (params.plan) {
    const have = PLAN_HIERARCHY[ctx.plan ?? 'free']
    const need = PLAN_HIERARCHY[params.plan]
    if (have < need) reasons.push(`plan: "${ctx.plan}" < "${params.plan}"`)
  }
  if (params.reverification) reasons.push('reverification required')

  return { ok: false, reason: reasons.join('; ') || 'unauthorized' }
}

// ─────────────────────────────────────────────────────────────
// 11. createAuthContext() — BUILD FROM MINIMAL INPUT
// ─────────────────────────────────────────────────────────────

export function createAuthContext(options: {
  userId: string | null
  role: Role | null
  orgId?: string | null
  orgSlug?: string | null
  plan?: Plan
  features?: Feature[]
  permissions?: Permission[]
}): AuthContext {
  const plan = options.plan ?? 'free'
  return {
    userId: options.userId,
    sessionId: null,
    role: options.role,
    orgId: options.orgId ?? null,
    orgSlug: options.orgSlug ?? null,
    permissions: options.permissions ?? [],
    features: options.features ?? (PLAN_FEATURES[plan] as Feature[]),
    plan,
    factorVerificationCount: 1,
    lastVerifiedAt: Date.now(),
    tokenType: 'session',
  }
}