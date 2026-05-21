'use server';

import prisma from '@/lib/db';

export async function validatePasswordResetEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
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
