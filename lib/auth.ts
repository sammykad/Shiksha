import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, organization } from "better-auth/plugins";
import { adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { PlanType, Role, YearType } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma-base";
import {
  buildInvitationEmail,
  buildOtpEmail,
  buildResetPasswordEmail,
  OTP_SUBJECTS,
  sendAuthEmail,
} from "./auth-email";

// ─── Constants ───────────────────────────────────────────────────────────────

const APP_NAME = "Shiksha Cloud";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// ─── Role Access Control ──────────────────────────────────────────────────────

const organizationRoles = {
  [Role.ADMIN]: ownerAc,
  [Role.TEACHER]: memberAc,
  [Role.STUDENT]: memberAc,
  [Role.PARENT]: memberAc,
};

// ─── Auth Configuration ───────────────────────────────────────────────────────

export const betterAuthServer = betterAuth({
  appName: APP_NAME,
  baseURL: APP_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [APP_URL],

  // ── Rate Limiting ──────────────────────────────────────────────────────────
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/email-otp/send-verification-otp": { window: 60, max: 3 },
    },
  },

  // ── Email & Password ───────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your Shiksha Cloud password",
        react: buildResetPasswordEmail({ url }),
      });
    },
  },

  // ── Social Providers ───────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name ?? "",
        lastName: profile.family_name ?? "",
      }),
    },
  },

  // ── User Schema ────────────────────────────────────────────────────────────
  user: {
    deleteUser: { enabled: true },
    fields: { image: "profileImage" },
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      isActive: { type: "boolean", required: false, input: false, defaultValue: true },
    },
  },

  // ── Session ────────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,    // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes — fast revocation for suspended/removed members
    },
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    organization({
      schema: {
        member: { modelName: "membership" },
      },
      roles: organizationRoles,
      creatorRole: Role.ADMIN,
      allowUserToCreateOrganization: (user) => user.emailVerified === true,
      organizationLimit: 3,
      membershipLimit: async (_user, org) => getMembershipLimit(org.id),
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
      invitationLimit: 100,
      cancelPendingInvitationsOnReInvite: true,
      requireEmailVerificationOnInvitation: true,
      disableOrganizationDeletion: true,

      sendInvitationEmail: async (data) => {
        const inviteUrl = `${APP_URL}/accept-invitation/${data.id}`;
        await sendAuthEmail({
          to: data.email,
          subject: `You're invited to join ${data.organization.name} on Shiksha Cloud`,
          react: buildInvitationEmail({
            inviteUrl,
            inviterName: data.inviter.user.name ?? data.inviter.user.email,
            orgName: data.organization.name,
            role: data.role,
          }),
        });
      },

      organizationHooks: {
        beforeCreateOrganization: async ({ organization, user }) => ({
          data: {
            ...organization,
            slug: normalizeSlug(organization.slug ?? organization.name ?? ""),
            metadata: normalizeMetadata(organization.metadata),
            createdBy: user.id,
            plan: PlanType.STANDARD,
            walletBalance: 10000,
          },
        }),

        afterCreateOrganization: async ({ organization, user }) => {
          await createDefaultAcademicYear({
            organizationId: organization.id,
            createdBy: user.id,
          });
        },

        afterAddMember: async ({ member, user, organization }) => {
          if (member.role !== Role.TEACHER) return;
          await upsertTeacher({ userId: user.id, organizationId: organization.id });
        },

        afterAcceptInvitation: async ({ member, user, organization }) => {
          if (member.role !== Role.TEACHER) return;
          await upsertTeacher({ userId: user.id, organizationId: organization.id });
        },

        beforeRemoveMember: async ({ member, organization }) => {
          await assertNotLastAdmin({ memberRole: member.role, organizationId: organization.id });
        },

        beforeUpdateMemberRole: async ({ member, newRole, organization }) => {
          if (newRole === Role.ADMIN) return;
          await assertNotLastAdmin({ memberRole: member.role, organizationId: organization.id });
        },
      },
    }),

    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,      // 5 minutes
      allowedAttempts: 3,
      resendStrategy: "reuse",
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      rateLimit: { window: 60, max: 3 },
      async sendVerificationOTP({ email, otp, type }) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Auth OTP] ${email}: ${otp}`);
        }
        await sendAuthEmail({
          to: email,
          subject: OTP_SUBJECTS[type],
          react: buildOtpEmail({ otp, type }),
        });
      },
    }),

    nextCookies(),
  ],

  // ── Database Hooks ─────────────────────────────────────────────────────────
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/);
          return {
            data: {
              ...user,
              firstName: user.firstName || firstName || "",
              lastName: user.lastName || rest.join(" ") || "",
              image: user.image || "/clerk.png",
            },
          };
        },
      },
    },

    session: {
      create: {
        before: async (session) => {
          // Auto-select the active org if the user belongs to exactly one
          const memberships = await prisma.membership.findMany({
            where: { userId: session.userId, status: "ACTIVE" },
            select: { organizationId: true },
            take: 2,
          });

          if (memberships.length !== 1) return { data: session };

          return {
            data: { ...session, activeOrganizationId: memberships[0].organizationId },
          };
        },
      },
    },
  },

  // ── Advanced ───────────────────────────────────────────────────────────────
  advanced: {
    database: { generateId: false },
    cookiePrefix: "shiksha",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Auth = typeof betterAuthServer;

type BetterAuthSession = NonNullable<
  Awaited<ReturnType<typeof betterAuthServer.api.getSession>>
>;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
};

export type AuthContext = {
  userId: string;
  orgId: string;
  orgRole: Role;
  orgSlug: string;
  user: AuthUser;
  session: BetterAuthSession["session"];
};

export type RoleContext =
  | { role: typeof Role.ADMIN; userId: string; organizationId: string }
  | { role: typeof Role.TEACHER; userId: string; teacherId: string; organizationId: string }
  | { role: typeof Role.STUDENT; userId: string; studentId: string; organizationId: string }
  | { role: typeof Role.PARENT; userId: string; parentId: string; studentIds: string[]; organizationId: string };

// ─── Session Helpers ──────────────────────────────────────────────────────────

export const getSession = cache(async () => {
  const session = await betterAuthServer.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Not authenticated");
  return session;
});

export const getSessionOrNull = cache(async () => {
  try { return await getSession(); }
  catch { return null; }
});

// ─── Auth Context ─────────────────────────────────────────────────────────────

export const auth = cache(
  async (
    options: { callbackUrl?: string; organizationReturnUrl?: string } = {}
  ): Promise<AuthContext> => {
    const callbackUrl = options.callbackUrl ?? "/dashboard";
    const orgReturnUrl = options.organizationReturnUrl ?? callbackUrl;

    const session = await getSessionOrNull();
    if (!session) redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);

    // Resolve active organisation
    let orgId = (session.session as { activeOrganizationId?: string | null }).activeOrganizationId;

    if (!orgId) {
      orgId = await resolveDefaultOrganizationId(session.user.id);

      if (orgId) {
        await prisma.session.update({
          where: { id: session.session.id },
          data: { activeOrganizationId: orgId },
        });
      } else {
        redirect(`/select-organization?returnUrl=${encodeURIComponent(orgReturnUrl)}`);
      }
    }

    const [membership, org] = await Promise.all([
      prisma.membership.findFirst({
        where: { userId: session.user.id, organizationId: orgId, status: "ACTIVE" },
        select: { role: true },
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { slug: true, isActive: true },
      }),
    ]);

    if (!membership || !org?.isActive) {
      redirect(`/select-organization?switch=true&returnUrl=${encodeURIComponent(orgReturnUrl)}`);
    }

    return {
      userId: session.user.id,
      orgId,
      orgRole: membership.role,
      orgSlug: org.slug ?? "",
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        firstName: (session.user as { firstName?: string | null }).firstName ?? null,
        lastName: (session.user as { lastName?: string | null }).lastName ?? null,
        image: session.user.image ?? null,
      },
      session: session.session,
    };
  }
);

// ─── Convenience Accessors ────────────────────────────────────────────────────

export const getCurrentUserId = cache(async () => (await auth()).userId);
export const getOrganizationId = cache(async () => (await auth()).orgId);
export const getOrganizationRole = cache(async () => (await auth()).orgRole);

export const getCurrentUserByRole = cache(async (): Promise<RoleContext> => {
  const { userId, orgId, orgRole } = await auth();

  if (orgRole === Role.ADMIN) {
    return { role: Role.ADMIN, userId, organizationId: orgId };
  }

  if (orgRole === Role.TEACHER) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId, organizationId: orgId },
      select: { id: true },
    });
    if (!teacher) throw new Error(`Teacher profile missing for user ${userId} in org ${orgId}`);
    return { role: Role.TEACHER, userId, teacherId: teacher.id, organizationId: orgId };
  }

  if (orgRole === Role.STUDENT) {
    const student = await prisma.student.findFirst({
      where: { userId, organizationId: orgId },
      select: { id: true },
    });
    if (!student) throw new Error(`Student profile missing for user ${userId} in org ${orgId}`);
    return { role: Role.STUDENT, userId, studentId: student.id, organizationId: orgId };
  }

  // PARENT
  const parent = await prisma.parent.findFirst({
    where: {
      userId,
      organizationId: orgId,
    },
    select: {
      id: true,
      students: {
        where: { student: { organizationId: orgId } },
        select: { studentId: true },
      },
    },
  });

  return {
    role: Role.PARENT,
    userId,
    parentId: parent?.id ?? "",
    studentIds: parent?.students.map((s) => s.studentId) ?? [],
    organizationId: orgId,
  };
});

// ─── Private Helpers ──────────────────────────────────────────────────────────

export async function resolveDefaultOrganizationId(
  userId: string,
  organizationIds?: string[]
) {
  let orgIds = organizationIds;

  if (!orgIds) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        organization: { isActive: true },
      },
      select: { organizationId: true },
    });

    if (memberships.length === 0) return null;
    orgIds = memberships.map((m) => m.organizationId);
  }

  if (orgIds.length === 0) return null;

  const lastSession = await prisma.session.findFirst({
    where: {
      userId,
      activeOrganizationId: { in: orgIds },
      expiresAt: { gt: new Date() },
    },
    select: { activeOrganizationId: true },
    orderBy: { updatedAt: "desc" },
  });

  return lastSession?.activeOrganizationId ?? null;
}

async function getMembershipLimit(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true, maxStudents: true },
  });

  if (org?.maxStudents) return org.maxStudents;
  if (org?.plan === PlanType.ENTERPRISE) return 5000;
  if (org?.plan === PlanType.PREMIUM) return 1000;
  return 200;
}

async function createDefaultAcademicYear({
  organizationId,
  createdBy,
}: {
  organizationId: string;
  createdBy: string;
}) {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const name = `${startYear}-${String(startYear + 1).slice(-2)}`;

  await prisma.academicYear.upsert({
    where: { organizationId_name: { organizationId, name } },
    update: { isCurrent: true },
    create: {
      organizationId,
      name,
      startDate: new Date(startYear, 3, 1),
      endDate: new Date(startYear + 1, 2, 31),
      type: YearType.ANNUAL,
      isCurrent: true,
      createdBy,
    },
  });
}

async function upsertTeacher({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  await prisma.teacher.upsert({
    where: { organizationId, userId },
    update: { isActive: true },
    create: { userId, organizationId },
  });
}

async function assertNotLastAdmin({
  memberRole,
  organizationId,
}: {
  memberRole: string;
  organizationId: string;
}) {
  if (memberRole !== Role.ADMIN) return;

  const adminCount = await prisma.membership.count({
    where: { organizationId, role: Role.ADMIN, status: "ACTIVE" },
  });

  if (adminCount <= 1) {
    throw new APIError("BAD_REQUEST", {
      message: "Cannot remove or demote the last administrator.",
    });
  }
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMetadata(metadata: unknown) {
  if (!metadata) return undefined;
  return typeof metadata === "string" ? metadata : JSON.stringify(metadata);
}

function toRole(value: unknown): Role {
  return Object.values(Role).includes(value as Role) ? (value as Role) : Role.STUDENT;
}
