import { hashPassword } from 'better-auth/crypto';
import prisma from '@/lib/db';
import { Role } from '@/generated/prisma/enums';
import { studentSchema } from '@/lib/schemas';
import { z } from 'zod';
import { buildInvitationEmail, sendAuthEmail } from '@/lib/auth-email';

type ValidatedStudent = z.infer<typeof studentSchema>;
export type ParentInput = NonNullable<ValidatedStudent['parents']>[number];
export type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type ProvisionedAuthUser = {
  id: string;
  email: string;
  profileImage: string | null;
};

export type OrganizationInviteTarget = {
  email: string;
  role: Role;
  skipIfActive?: boolean;
  skipIfPending?: boolean;
};

const INVITATION_EXPIRES_IN_DAYS = 7;

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export async function upsertUserRecord(
  tx: TxClient,
  params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    profileImage?: string | null;
    role: Role;
    organizationId: string;
    createMembership?: boolean;
  }
): Promise<ProvisionedAuthUser> {
  const email = params.email.trim().toLowerCase();
  const name = [params.firstName, params.lastName].filter(Boolean).join(' ');

  const user = await tx.user.upsert({
    where: { email },
    create: {
      email,
      name,
      emailVerified: false,
      firstName: params.firstName,
      lastName: params.lastName,
      profileImage: params.profileImage ?? "",
      isActive: true,
    },
    update: {
      name,
      firstName: params.firstName,
      lastName: params.lastName,
      profileImage: params.profileImage ?? undefined,
      isActive: true,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      profileImage: true,
    },
  });

  const credentialAccount = await tx.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
    select: { id: true },
  });

  if (!credentialAccount) {
    await tx.account.create({
      data: {
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password: await hashPassword(params.password),
      },
    });
  }

  if (params.createMembership ?? true) {
    await tx.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: params.organizationId,
        },
      },
      create: {
        userId: user.id,
        organizationId: params.organizationId,
        role: params.role,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
      update: {
        role: params.role,
        status: 'ACTIVE',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return user;
}

export async function upsertParentRecord(
  tx: TxClient,
  userId: string,
  organizationId: string,
  parent: ParentInput
) {
  const shared = {
    phoneNumber: parent.phoneNumber,
    whatsAppNumber: parent.whatsAppNumber ?? '',
    userId,
  };

  return tx.parent.upsert({
    where: {
      organizationId_email: {
        organizationId,
        email: parent.email.trim().toLowerCase(),
      },
    },
    create: {
      organizationId,
      email: parent.email.trim().toLowerCase(),
      firstName: parent.firstName,
      lastName: parent.lastName,
      ...shared,
    },
    update: { ...shared, updatedAt: new Date() },
  });
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function dedupeInviteTargets(targets: OrganizationInviteTarget[]) {
  const byEmail = new Map<string, OrganizationInviteTarget>();

  for (const target of targets) {
    const email = normalizeEmail(target.email);
    if (!email) continue;

    const existing = byEmail.get(email);
    if (existing && existing.role !== target.role) {
      throw new AppError(`${email} cannot be invited as multiple roles in the same organization.`);
    }

    byEmail.set(email, {
      ...target,
      email,
      skipIfActive: existing?.skipIfActive ?? target.skipIfActive,
      skipIfPending: existing?.skipIfPending ?? target.skipIfPending,
    });
  }

  return Array.from(byEmail.values());
}

export async function sendOrganizationRoleInvitation({
  email,
  role,
  organizationId,
  inviterUserId,
  skipIfActive = false,
  skipIfPending = false,
}: OrganizationInviteTarget & {
  organizationId: string;
  inviterUserId: string;
}) {
  const normalizedEmail = normalizeEmail(email);

  const [organization, inviter] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: inviterUserId },
      select: { name: true, email: true },
    }),
  ]);

  if (!organization) throw new AppError('Organization not found.');
  if (!inviter) throw new AppError('Inviter account not found.');

  const existingMember = await prisma.membership.findFirst({
    where: {
      organizationId,
      user: {
        email: normalizedEmail,
      },
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (existingMember) {
    if (skipIfActive) {
      return { sent: false, skipped: true, reason: 'already-active' as const };
    }

    throw new AppError(`${normalizedEmail} is already an active member of this organization.`);
  }

  const existingPendingInvitation = await prisma.invitation.findFirst({
    where: {
      organizationId,
      email: normalizedEmail,
      status: 'pending',
    },
    select: {
      id: true,
      role: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (existingPendingInvitation && skipIfPending) {
    return { sent: false, skipped: true, reason: 'already-pending' as const };
  }

  await prisma.invitation.updateMany({
    where: {
      organizationId,
      email: normalizedEmail,
      status: 'pending',
    },
    data: {
      status: 'canceled',
      updatedAt: new Date(),
    },
  });

  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      email: normalizedEmail,
      role,
      inviterId: inviterUserId,
      status: 'pending',
      expiresAt: new Date(Date.now() + INVITATION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/accept-invitation/${invitation.id}`;
    await sendAuthEmail({
      to: normalizedEmail,
      subject: `You're invited to join ${organization.name} on Shiksha Cloud`,
      react: buildInvitationEmail({
        inviteUrl,
        inviterName: inviter.name ?? inviter.email,
        orgName: organization.name,
        role,
      }),
    });

    return { sent: true, skipped: false, reason: null };
  } catch (error) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'canceled',
        updatedAt: new Date(),
      },
    });

    throw new AppError(`Invitation email could not be sent to ${normalizedEmail}: ${extractErrorMessage(error)}`);
  }
}

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';

  const msg = error instanceof Error ? error.message : String(error);

  if (msg.trim().startsWith('{') && msg.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed && typeof parsed === 'object') {
        if (parsed.prismaCode === 'P2002') {
          if (parsed.modelName === 'Student') {
            return 'A student with this email or roll number already exists.';
          }
          if (parsed.modelName === 'User') {
            return 'A user with this email address already exists.';
          }
          return parsed.userMessage ?? 'A record with this value already exists.';
        }
        if (parsed.userMessage) {
          return parsed.userMessage;
        }
      }
    } catch {
      // Fallback to normal error message if parsing fails
    }
  }

  return msg;
}
