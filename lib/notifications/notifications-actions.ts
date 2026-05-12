'use server';

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/lib/organization";

// ─────────────────────────────────────────────────────────────────────────────
// GET USER NOTIFICATIONS
// Queries the Notification table — one row per event, never duplicated per channel.
// Resolves the internal User to find their userId / studentId / parentId.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserNotifications() {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  const notifications = await prisma.notification.findMany({
    where: {
      organizationId,
      isDismissed: false,
      userId: user.id
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      isRead: true,
      readAt: true,
      isDismissed: true,
      academicYearId: true,
      createdAt: true,
    },
  });

  return notifications;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET UNREAD COUNT
// Lightweight query — only counts, no content fetched.
// Use this for the bell badge number.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnreadNotificationCount() {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  const count = await prisma.notification.count({
    where: {
      organizationId,
      isDismissed: false,
      isRead: false,
      userId: user.id

    },
  });

  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK AS READ
// ─────────────────────────────────────────────────────────────────────────────

export async function markAsRead(notificationId: string) {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        organizationId,
        userId: user.id
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("markAsRead failed:", err);
    return { success: false, error: "Failed to mark as read" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────────────────────────────────────────

export async function markAllAsRead() {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  try {
    await prisma.notification.updateMany({
      where: {
        organizationId,
        isRead: false,
        isDismissed: false, userId: user.id

      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("markAllAsRead failed:", err);
    return { success: false, error: "Failed to mark all as read" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISMISS
// Hides the notification from the inbox without deleting it.
// ─────────────────────────────────────────────────────────────────────────────

export async function dismissNotification(notificationId: string) {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        organizationId,
        userId: user.id
      },
      data: {
        isDismissed: true,
        dismissedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("dismissNotification failed:", err);
    return { success: false, error: "Failed to dismiss notification" };
  }
}