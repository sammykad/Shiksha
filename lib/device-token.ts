'use server';

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

type Platform = 'web' | 'android' | 'ios';

/**
 * Save FCM device token for push notifications.
 *
 * A user can have MULTIPLE tokens (one per device/browser).
 * DeviceToken.userId is the database User.id (CUID).
 *
 * IMPORTANT: do NOT truncate or sanitize the token string.
 * FCM tokens contain a ':' separator (e.g. "eZq9Xx…:APA91b…") and the full
 * string — including the prefix — is what Firebase Admin SDK requires when
 * sending. Stripping the prefix causes "Requested entity was not found".
 */
export async function saveDeviceToken(token: string, platform: Platform = 'web') {
  try {
    const { userId } = await auth();

    // Store the token exactly as received from Firebase getToken().
    // Do NOT split on ':' — the full token string is the valid FCM token.
    await prisma.deviceToken.upsert({
      where: { token },
      update: {
        lastUsedAt: new Date(),
        userId,
        platform,
      },
      create: {
        token,
        userId,
        platform,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[saveDeviceToken] Failed:", error);
    return { success: false, error: "Failed to save device token" };
  }
}
