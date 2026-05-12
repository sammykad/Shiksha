'use server';

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

type Platform = 'web' | 'android' | 'ios';

/**
 * Save FCM device token for push notifications.
 *
 * A user can have MULTIPLE tokens (one per device/browser).
 * DeviceToken.userId is the database User.id (CUID), not the Clerk ID.
 *
 * IMPORTANT: do NOT truncate or sanitize the token string.
 * FCM tokens contain a ':' separator (e.g. "eZq9Xx…:APA91b…") and the full
 * string — including the prefix — is what Firebase Admin SDK requires when
 * sending. Stripping the prefix causes "Requested entity was not found".
 */
export async function saveDeviceToken(token: string, platform: Platform = 'web') {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Not authenticated" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true },
    });

    if (!dbUser) {
      console.error(`[saveDeviceToken] No DB user for Clerk ID: ${clerkUser.id}`);
      return { success: false, error: "User not found in database" };
    }

    // Store the token exactly as received from Firebase getToken().
    // Do NOT split on ':' — the full token string is the valid FCM token.
    await prisma.deviceToken.upsert({
      where: { token },
      update: {
        lastUsedAt: new Date(),
        userId: dbUser.id,
        platform,
      },
      create: {
        token,
        userId: dbUser.id,
        platform,
      },
    });

    console.log(`[saveDeviceToken] ✓ Saved for user ${dbUser.id} | platform: ${platform} | token: ${token.slice(0, 20)}…`);
    return { success: true };
  } catch (error) {
    console.error("[saveDeviceToken] Failed:", error);
    return { success: false, error: "Failed to save device token" };
  }
}