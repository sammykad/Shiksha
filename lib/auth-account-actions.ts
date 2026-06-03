'use server';

import { createHash, timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';

import { betterAuthServer } from '@/lib/auth';
import prisma from '@/lib/db';
import basePrisma from '@/lib/prisma-base';

export async function validatePasswordResetEmail(email: string) {
  const normalizedEmail = email?.trim().toLowerCase() ?? '';
  if (!normalizedEmail) {
    return {
      ok: false,
      message: 'Enter your email address.',
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      isActive: true,
      accounts: {
        where: { providerId: 'credential' },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      ok: false,
      message: 'No account exists with this email. Please sign up first.',
    };
  }

  if (!user.isActive) {
    return {
      ok: false,
      message: 'This account is inactive. Please contact your organization admin.',
    };
  }

  if (user.accounts.length === 0) {
    return {
      ok: false,
      message: 'This account does not use password sign-in. Please continue with your original sign-in method.',
    };
  }

  return { ok: true };
}

export async function markEmailVerifiedAfterPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  await prisma.user.updateMany({
    where: {
      email: normalizedEmail,
      emailVerified: false,
    },
    data: {
      emailVerified: true,
      updatedAt: new Date(),
    },
  });
}

export async function markEmailVerifiedWithOwnershipToken(email: string, token: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !token) {
    return {
      ok: false,
      message: 'Email verification expired. Please request a new code.',
    };
  }

  const identifier = `email-ownership-${normalizedEmail}`;
  const verification = await basePrisma.verification.findFirst({
    where: { identifier },
  });

  if (!verification || verification.expiresAt < new Date()) {
    await basePrisma.verification.deleteMany({ where: { identifier } });
    return {
      ok: false,
      message: 'Email verification expired. Please request a new code.',
    };
  }

  if (!safeEqual(hashValue(token), verification.value)) {
    return {
      ok: false,
      message: 'Email verification could not be confirmed. Please request a new code.',
    };
  }

  await basePrisma.$transaction([
    basePrisma.user.updateMany({
      where: {
        email: normalizedEmail,
        emailVerified: false,
      },
      data: {
        emailVerified: true,
        updatedAt: new Date(),
      },
    }),
    basePrisma.verification.deleteMany({ where: { identifier } }),
  ]);

  return { ok: true };
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('base64url');
}

export async function checkUserHasPassword(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { id: true },
  });
  return { hasPassword: !!account };
}

export async function deactivateAccount(password?: string) {
  try {
    const session = await betterAuthServer.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) return { error: { message: "No session." } };

    const hasCredential = await prisma.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { id: true },
    });

    if (hasCredential) {
      if (!password) return { error: { message: "Enter your password to confirm deactivation." } };
      try {
        await betterAuthServer.api.verifyPassword({
          body: { password },
          headers: await headers(),
        });
      } catch {
        return { error: { message: "Incorrect password." } };
      }
    }

    const adminMemberships = await prisma.membership.count({
      where: { userId, role: "ADMIN", status: "ACTIVE" },
    });
    if (adminMemberships > 0) {
      const orgs = await prisma.membership.findMany({
        where: { userId, role: "ADMIN", status: "ACTIVE" },
        include: { organization: { select: { name: true } } },
      });
      const names = orgs.map((m) => m.organization.name).join(", ");
      return {
        error: {
          message: `You are the last admin of ${names}. Transfer ownership or add another admin before deactivating your account.`,
        },
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to deactivate account";
    return { error: { message } };
  }
}

export async function updateAccountPassword(input: {
  newPassword: string;
  currentPassword?: string;
}) {
  try {
    if (input.currentPassword) {
      await betterAuthServer.api.changePassword({
        body: {
          newPassword: input.newPassword,
          currentPassword: input.currentPassword,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      });
    } else {
      await betterAuthServer.api.setPassword({
        body: { newPassword: input.newPassword },
        headers: await headers(),
      });
    }
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update password";
    return { error: { message } };
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
