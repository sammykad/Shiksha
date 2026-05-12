import prisma from '@/lib/db';
import { studentSchema } from '@/lib/schemas';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

type ValidatedStudent = z.infer<typeof studentSchema>;
export type ParentInput = NonNullable<ValidatedStudent['parents']>[number];
export type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;
export type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface ClerkUser {
  id: string;
  imageUrl: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/students`;

// ─── Error ────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// ─── Clerk Helpers ────────────────────────────────────────────────────────────

/**
 * Find an existing Clerk user by email, or create a new one.
 * Returns the user and whether it was freshly created.
 */
export async function upsertClerkUser(
  client: ClerkClient,
  params: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'STUDENT' | 'PARENT';
    externalIdPrefix: string;
    organizationId: string;
  }
): Promise<{ user: ClerkUser; created: boolean }> {
  const { data: existing } = await client.users.getUserList({
    emailAddress: [params.email],
    limit: 1,
  });

  if (existing.length > 0) {
    return { user: existing[0], created: false };
  }

  const user = await client.users.createUser({
    emailAddress: [params.email],
    firstName: params.firstName,
    lastName: params.lastName,
    password: params.password,
    skipPasswordChecks: true,
    externalId: `${params.externalIdPrefix}_${Date.now()}`,
    privateMetadata: {
      role: params.role,
      organizationId: params.organizationId,
    },
  });

  return { user, created: true };
}

/**
 * Check if a user is already a member of the organization.
 * Uses getOrganizationMembership (single-resource lookup) —
* avoids the userId list-filter that causes 403s on some plans.
 */
export async function isOrgMember(
  client: ClerkClient,
  organizationId: string,
  userId: string
): Promise<boolean> {
  try {
    await client.organizations.getOrganizationMembershipList({ organizationId, userId: [userId] });
    return true;
  } catch (err: any) {
    if (err?.status === 404) return false;
    throw err;
  }
}

/**
 * Add user to the org (if not already a member) and send an invitation email.
 * Silently skips duplicate invitations.
 */
export async function addMemberAndInvite(
  client: ClerkClient,
  params: {
    organizationId: string;
    userId: string;
    email: string;
    role: 'org:student' | 'org:parent';
    inviterUserId: string;
  }
) {
  const alreadyMember = await isOrgMember(client, params.organizationId, params.userId);

  // Already a member — skip both membership creation and invite
  if (alreadyMember) return;

  await client.organizations.createOrganizationMembership({
    organizationId: params.organizationId,
    userId: params.userId,
    role: params.role,
  });

  try {
    await client.organizations.createOrganizationInvitation({
      organizationId: params.organizationId,
      emailAddress: params.email,
      role: params.role,
      redirectUrl: REDIRECT_URL,
      inviterUserId: params.inviterUserId,
    });
  } catch (err: any) {
    if (err?.errors?.[0]?.code !== 'duplicate_invitations') throw err;
  }
}

/**
 * Best-effort cleanup: remove org membership and delete Clerk users
 * created during a failed run.
 */
export async function cleanupClerkUsers(
  client: ClerkClient,
  organizationId: string,
  userIds: string[]
) {
  await Promise.allSettled(
    userIds.map(async (userId) => {
      try {
        await client.organizations.deleteOrganizationMembership({ organizationId, userId });
      } finally {
        await client.users.deleteUser(userId);
      }
    })
  );
}

// ─── DB Helpers ───────────────────────────────────────────────────────────────

/**
 * Upsert a User record linked to a Clerk user.
 */
export async function upsertUserRecord(
  tx: TxClient,
  params: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    profileImage: string;
    role: 'STUDENT' | 'PARENT';
    organizationId: string;
  }
) {
  const shared = {
    organizationId: params.organizationId,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    password: params.password,
    profileImage: params.profileImage,
    role: params.role,
  };

  return tx.user.upsert({
    where: { clerkId: params.clerkId },
    create: { id: params.clerkId, clerkId: params.clerkId, ...shared },
    update: { id: params.clerkId, ...shared, updatedAt: new Date() },
  });
}

/**
 * Upsert a Parent record linked to a User.
 */
export async function upsertParentRecord(
  tx: TxClient,
  userId: string,
  parent: ParentInput
) {
  const shared = {
    phoneNumber: parent.phoneNumber,
    whatsAppNumber: parent.whatsAppNumber ?? '',
    userId,
  };

  return tx.parent.upsert({
    where: { email: parent.email },
    create: {
      email: parent.email,
      firstName: parent.firstName,
      lastName: parent.lastName,
      ...shared,
    },
    update: { ...shared, updatedAt: new Date() },
  });
}

// ─── Shared error surfacing ───────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  const clerkDetail =
    (error as any)?.errors?.[0]?.longMessage ??
    (error as any)?.errors?.[0]?.message;

  return clerkDetail ?? (error instanceof Error ? error.message : 'Unknown error');
}