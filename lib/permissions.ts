import { Role } from "@/generated/prisma/enums";

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
// PERMISSION TYPES
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
// AUTH CONTEXT
// ─────────────────────────────────────────────────────────────

export interface PermissionContext {
  userId: string | null
  sessionId: string | null
  role: Role | null
  orgId: string | null
  orgSlug: string | null
  permissions: Permission[]
}

export interface HasParams {
  role?: Role
  permission?: Permission
}

export type HasFunction = (params: HasParams) => boolean

// ─────────────────────────────────────────────────────────────
// HAS ENGINE
// ─────────────────────────────────────────────────────────────

export function createHas(ctx: Partial<PermissionContext>): HasFunction {
  return function has(params: HasParams): boolean {
    const { role, permission } = params
    let result = true

    if (role !== undefined) {
      result = result && ctx.role === role
    }

    if (permission !== undefined) {
      if (!ctx.role) {
        result = false
      } else {
        const hasExplicit = ctx.permissions?.includes(permission) ?? false
        const hasCapability = ROLE_CAPABILITIES[ctx.role]?.includes(permission) ?? false
        result = result && (hasExplicit || hasCapability)
      }
    }

    return result
  }
}

export function createTypedHas(ctx: Partial<PermissionContext>) {
  const has = createHas(ctx)
  return {
    has,
    hasRole: (role: Role) => has({ role }),
    hasPermission: (permission: Permission) => has({ permission }),
    hasAnyRole: (...roles: Role[]) => roles.some(r => has({ role: r })),
    hasAllPermissions: (...permissions: Permission[]) => permissions.every(p => has({ permission: p })),
    hasAnyPermission: (...permissions: Permission[]) => permissions.some(p => has({ permission: p })),
  }
}

// ─────────────────────────────────────────────────────────────
// SERVER GUARDS
// ─────────────────────────────────────────────────────────────

export function requireAuth(ctx: Partial<PermissionContext>, params: HasParams): void {
  if (!createHas(ctx)(params)) {
    throw new Error(
      `[permissions] Authorization failed.\n` +
      `Required: ${JSON.stringify(params)}\n` +
      `Context: role=${ctx.role}`
    )
  }
}

export function checkAuth(
  ctx: Partial<PermissionContext>,
  params: HasParams,
): { ok: true } | { ok: false; reason: string } {
  if (createHas(ctx)(params)) return { ok: true }

  const reasons: string[] = []
  if (params.role) reasons.push(`role: need "${params.role}", have "${ctx.role}"`)
  if (params.permission) reasons.push(`permission: "${params.permission}" not granted`)

  return { ok: false, reason: reasons.join('; ') || 'unauthorized' }
}
