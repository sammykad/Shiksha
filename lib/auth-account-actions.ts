'use server';

import prisma from '@/lib/db';

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
