"use server"

import prisma from "@/lib/prisma-base";
import { getActiveSubscription } from "@/lib/subscription-billing";

export async function getSubscriptionInfo(organizationId: string) {
  try {
    const subscription = await getActiveSubscription(organizationId);
    if (!subscription) {
      return { success: false as const, error: "No active subscription found" };
    }

    const studentCount = await prisma.student.count({
      where: { organizationId, status: "ACTIVE" },
    });

    return {
      success: true as const,
      data: {
        planName: subscription.plan?.name ?? "Custom",
        planCode: subscription.plan?.code ?? null,
        pricingMode: subscription.pricingMode,
        billingCycle: subscription.billingCycle,
        billingMetric: subscription.billingMetric,
        studentCount,
        studentLimit: subscription.studentLimit,
        monthlyPrice: subscription.plan?.monthlyPrice,
        annualPrice: subscription.plan?.annualPrice,
        unitPrice: subscription.unitPrice,
        customPrice: subscription.customPrice,
        offerName: subscription.offer?.name ?? null,
      },
    };
  } catch (error) {
    console.error("Failed to get subscription info:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to get subscription info",
    };
  }
}
