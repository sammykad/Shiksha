import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, organization } from "better-auth/plugins";
import { memberAc, ownerAc } from "better-auth/plugins/organization/access";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { MembershipStatus, Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma-base";
import { getActiveSubscription } from "@/lib/subscription-billing";
import {
  buildInvitationEmail,
  buildOtpEmail,
  buildResetPasswordEmail,
  OTP_SUBJECTS,
} from "./auth-email";
import { sendBrevoEmail } from "./brevo";
import { initializeOrganization } from "./initialize-organization";
import { normalizeSlug } from "@/lib/utils";
import { ORGANIZATION_LIMIT } from "@/lib/constants/pricing";


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

// ─────────────────────────────────────────────────────────────────────────────
// 2. BETTER AUTH INSTANCE
// ─────────────────────────────────────────────────────────────────────────────

export const betterAuthServer = betterAuth({
  appName: APP_NAME,
  baseURL: APP_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [APP_URL],

  // ── Rate Limiting ──────────────────────────────────────────────────────────
  rateLimit: {
    enabled: true,
    window: 60,
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
      await sendBrevoEmail({
        to: user.email,
        subject: "Reset your Shiksha Cloud password",
        react: buildResetPasswordEmail({ url }),
      });
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    }
  },
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
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
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const adminMemberships = await prisma.membership.findMany({
          where: { userId: user.id, role: Role.ADMIN, status: "ACTIVE" },
          include: { organization: { select: { name: true } } },
        });

        for (const membership of adminMemberships) {
          const adminCount = await prisma.membership.count({
            where: { organizationId: membership.organizationId, role: Role.ADMIN, status: "ACTIVE" },
          });
          const isLastAdmin = adminCount <= 1;
          if (isLastAdmin) {
            throw new APIError("BAD_REQUEST", {
              message: `You are the last admin of "${membership.organization.name}". Transfer ownership or add another admin before deleting your account.`,
            });
          }
        }
      },
    },
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
    freshAge: 60 * 60 * 24 * 7, // 7 days — match expiresIn, prevents "session not fresh" on list-sessions
    cookieCache: {
      enabled: false,
    },
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    organization({
      // ac: defaultAc,
      roles: organizationRoles,
      creatorRole: Role.ADMIN,
      schema: {
        member: { modelName: "membership" },
      },

      allowUserToCreateOrganization: (user) => user.emailVerified === true,
      organizationLimit: ORGANIZATION_LIMIT,
      membershipLimit: async (_user, org) => getOrganizationAccountLimit(org.id),
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
      invitationLimit: async ({ organization }) => getOrganizationAccountLimit(organization.id),
      cancelPendingInvitationsOnReInvite: true,
      requireEmailVerificationOnInvitation: true,
      disableOrganizationDeletion: true,

      sendInvitationEmail: async (data) => {
        const inviteUrl = `${APP_URL}/accept-invitation/${data.id}`;
        await sendBrevoEmail({
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
            walletBalance: 10000,
          },
        }),

        afterCreateOrganization: async ({ organization, user }) => {
          await initializeOrganization(organization.id, user.id);
        },

        afterAddMember: async ({ member, user, organization }) => {
          if (member.role !== Role.TEACHER) return;
          await upsertTeacher({ userId: user.id, organizationId: organization.id });
        },

        afterAcceptInvitation: async ({ member, user, organization }) => {
          await markMembershipAccepted(member.id);

          if (member.role === Role.TEACHER) {
            await upsertTeacher({ userId: user.id, organizationId: organization.id });
          }

          if (member.role === Role.PARENT) {
            await linkParentProfile({
              userId: user.id,
              email: user.email,
              organizationId: organization.id,
            });
          }

          // Temporarily disabled — Student.userId is required at creation,
          // so linking post-acceptance is unreachable. See linkStudentProfile below.
          // if (member.role === Role.STUDENT) {
          //   await linkStudentProfile({
          //     userId: user.id,
          //     email: user.email,
          //     organizationId: organization.id,
          //   });
          // }
        },

        beforeRemoveMember: async ({ member, organization }) => {
          await assertNotLastAdmin({ memberRole: member.role, organizationId: organization.id });
        },

        beforeUpdateMemberRole: async ({ member, newRole, organization }) => {
          if (newRole === Role.ADMIN) return;
          await assertNotLastAdmin({ memberRole: member.role, organizationId: organization.id });
        },

        afterUpdateMemberRole: async ({ member, previousRole, organization }) => {
          const newRole = member.role;

          if (previousRole === Role.TEACHER && newRole !== Role.TEACHER) {
            await prisma.teacher.updateMany({
              where: { userId: member.userId, organizationId: organization.id },
              data: { isActive: false },
            });
          }

          if (previousRole === Role.PARENT && newRole !== Role.PARENT) {
            await prisma.parent.updateMany({
              where: { userId: member.userId, organizationId: organization.id },
              data: { userId: null },
            });
          }

          if (newRole === Role.TEACHER) {
            await upsertTeacher({ userId: member.userId, organizationId: organization.id });
          }

          if (newRole === Role.PARENT) {
            const user = await prisma.user.findUnique({
              where: { id: member.userId },
              select: { email: true },
            });
            if (user?.email) {
              await linkParentProfile({
                userId: member.userId,
                email: user.email,
                organizationId: organization.id,
              });
            }
          }
        },


      },
    }),

    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,      // 5 minutes
      allowedAttempts: 3,
      resendStrategy: "rotate",
      storeOTP: "hashed",
      sendVerificationOnSignUp: false,
      overrideDefaultEmailVerification: true,
      rateLimit: { window: 60, max: 3 },
      async sendVerificationOTP({ email, otp, type }) {
        await sendBrevoEmail({
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
              image: user.image || "/default-avatar.png",
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. TYPES
// ─────────────────────────────────────────────────────────────────────────────


export type Auth = typeof betterAuthServer;

type BetterAuthSession = NonNullable<
  Awaited<ReturnType<typeof betterAuthServer.api.getSession>>
>
  ;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
};
// Context WITH organization (default)
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. SESSION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fetchSession = cache(async () => {
  return betterAuthServer.api.getSession({
    headers: await headers(),
  }) as Promise<BetterAuthSession | null>;
});
export const getSession = cache(async (): Promise<BetterAuthSession> => {
  const session = await fetchSession();
  if (!session) redirect("/sign-in");
  return session;
});
export const getSessionOrNull = fetchSession;


// ─────────────────────────────────────────────────────────────────────────────
// 5. AUTH CONTEXT (Multi-tenant aware)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Use this when you NEED an organization context.
 * Redirects to /select-organization if none exists.
 */

export const auth = cache(
  async (options: { returnUrl?: string } = {}): Promise<AuthContext> => {
    const returnUrl = options.returnUrl ?? "/dashboard";
    const session = await getSessionOrNull();
    if (!session) {
      redirect(`/sign-in?callbackURL=${encodeURIComponent(returnUrl)}`);
    }

    let orgId = session.session.activeOrganizationId;
    if (!orgId) {
      orgId = await resolveDefaultOrganizationId(session.user.id);
      if (orgId) {
        await prisma.session.update({
          where: { id: session.session.id },
          data: { activeOrganizationId: orgId },
        });
        session.session.activeOrganizationId = orgId;
      } else {
        redirect(`/select-organization?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    }

    const [membership, org] = await Promise.all([
      prisma.membership.findFirst({
        where: { userId: session.user.id, organizationId: orgId, status: MembershipStatus.ACTIVE },
        select: { role: true },
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { slug: true, isActive: true },
      }),
    ]);

    if (!membership || !org?.isActive) {
      await prisma.session.update({
        where: { id: session.session.id },
        data: { activeOrganizationId: null },
      });
      redirect(`/select-organization?returnUrl=${encodeURIComponent(returnUrl)}`);
    }

    return {
      userId: session.user.id,
      orgId,
      orgRole: membership.role as Role,
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


// ─────────────────────────────────────────────────────────────────────────────
// 6. CONVENIENCE ACCESSORS
// ─────────────────────────────────────────────────────────────────────────────

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
    if (!teacher) redirect('/dashboard/missing-profile?role=teacher');
    return { role: Role.TEACHER, userId, teacherId: teacher.id, organizationId: orgId };
  }

  if (orgRole === Role.STUDENT) {
    const student = await prisma.student.findFirst({
      where: { userId, organizationId: orgId },
      select: { id: true },
    });
    if (!student) redirect('/dashboard/missing-profile?role=student');
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

  if (!parent) redirect("/dashboard/missing-profile?role=parent");

  return {
    role: Role.PARENT,
    userId,
    parentId: parent.id,
    studentIds: parent.students.map((s) => s.studentId),
    organizationId: orgId,
  };
});

// ─── Private Helpers ──────────────────────────────────────────────────────────

export async function resolveDefaultOrganizationId(
  userId: string,
  organizationIds?: string[]
) {
  if (!organizationIds) {
    const memberships = await prisma.membership.findMany({
      where: { userId, status: "ACTIVE", organization: { isActive: true } },
      select: { organizationId: true },
    });
    if (memberships.length === 0) return null;
    organizationIds = memberships.map((m) => m.organizationId);
  }

  if (organizationIds.length === 0) return null;

  // Prefer the org they last used
  const lastSession = await prisma.session.findFirst({
    where: {
      userId,
      activeOrganizationId: { in: organizationIds },
      expiresAt: { gt: new Date() },
    },
    select: { activeOrganizationId: true },
    orderBy: { updatedAt: "desc" },
  });

  const candidateId = lastSession?.activeOrganizationId;

  if (!candidateId) return organizationIds[0];

  // Verify the candidate org is still active
  const org = await prisma.organization.findUnique({
    where: { id: candidateId },
    select: { isActive: true },
  });

  return org?.isActive ? candidateId : organizationIds[0];
}

async function getOrganizationAccountLimit(organizationId: string) {
  const subscription = await getActiveSubscription(organizationId);
  if (subscription?.studentLimit) return subscription.studentLimit;
  return 100;
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

async function linkParentProfile({
  userId,
  email,
  organizationId,
}: {
  userId: string;
  email: string;
  organizationId: string;
}) {
  const parent = await prisma.parent.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: email.trim().toLowerCase(),
      },
    },
    select: { id: true, userId: true },
  });

  if (!parent) return;

  if (parent.userId && parent.userId !== userId) {
    throw new APIError("BAD_REQUEST", {
      message: "This parent profile is already linked to another account.",
    });
  }

  if (parent.userId === userId) return;

  await prisma.parent.update({
    where: { id: parent.id },
    data: { userId },
  });
}

// Temporarily disabled — Student.userId is String @unique (required),
// so a student record always has a userId at creation time.
// Linking post-acceptance is unreachable.
//
// async function linkStudentProfile({
//   userId,
//   email,
//   organizationId,
// }: {
//   userId: string;
//   email: string;
//   organizationId: string;
// }) {
//   const student = await prisma.student.findFirst({
//     where: { organizationId, email: email.trim().toLowerCase() },
//     select: { id: true, userId: true },
//   });
//
//   if (!student) return;
//
//   if (student.userId && student.userId !== userId) {
//     throw new APIError("BAD_REQUEST", {
//       message: "This student profile is already linked to another account.",
//     });
//   }
//
//   if (student.userId === userId) return;
//
//   await prisma.student.update({
//     where: { id: student.id },
//     data: { userId },
//   });
// }

async function markMembershipAccepted(memberId: string) {
  await prisma.membership.update({
    where: { id: memberId },
    data: {
      status: MembershipStatus.ACTIVE,
      acceptedAt: new Date(),
    },
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

function normalizeMetadata(metadata: unknown) {
  if (!metadata) return undefined;
  return typeof metadata === "string" ? metadata : JSON.stringify(metadata);
}
