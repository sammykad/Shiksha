'use server';

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { getOrganizationId } from "@/lib/organization";
import {
  changeSubscriptionPlan,
  countBillableStudents,
  createCustomSubscription,
  getActiveSubscription,
} from "@/lib/subscription-billing";
import {
  BillingCycle,
  BillingMetric,
  InvoiceStatus,
  PaymentMethod,
  PaymentProvider,
  PlanCode,
  PricingMode,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function changeOrganizationPlan(password: string, planCode: PlanCode, billingCycle: BillingCycle) {
  try {
    if (password !== process.env.BILLING_API_KEY) {
      return { success: false, error: "Unauthorized. Invalid billing API key." };
    }

    const organizationId = await getOrganizationId();

    if (![PlanCode.STARTER, PlanCode.GROWTH, PlanCode.SCALE].includes(planCode)) {
      return { success: false, error: "Invalid plan code." };
    }

    if (![BillingCycle.MONTHLY, BillingCycle.ANNUAL].includes(billingCycle)) {
      return { success: false, error: "Invalid billing cycle." };
    }

    const previous = await getActiveSubscription(organizationId);
    if (!previous) {
      return { success: false, error: "No active subscription found." };
    }

    await changeSubscriptionPlan({
      organizationId,
      planCode,
      billingCycle,
      changedBy: "shiksha-admin",
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to change plan:", error);
    return { success: false, error: "Failed to change plan." };
  }
}

export async function createCustomDeal(
  password: string,
  input: {
    organizationId: string;
    pricingMode: PricingMode;
    billingCycle: BillingCycle;
    customPrice?: number;
    unitPrice?: number;
    contractReference?: string;
    studentLimit?: number;
  }
) {
  try {
    if (password !== process.env.BILLING_API_KEY) {
      return { success: false, error: "Unauthorized. Invalid billing API key." };
    }

    const user = await getCurrentUser();

    if (input.pricingMode === PricingMode.PLAN_BASED) {
      return { success: false, error: "Use changeOrganizationPlan for PLAN_BASED subscriptions." };
    }

    if (input.pricingMode === PricingMode.CUSTOM_FLAT && (!input.customPrice || input.customPrice <= 0)) {
      return { success: false, error: "Custom price is required for CUSTOM_FLAT pricing." };
    }

    if (
      (input.pricingMode === PricingMode.CUSTOM_PER_STUDENT || input.pricingMode === PricingMode.CUSTOM_PER_USER) &&
      (!input.unitPrice || input.unitPrice <= 0)
    ) {
      return { success: false, error: "Unit price is required for per-student or per-user pricing." };
    }

    const existing = await getActiveSubscription(input.organizationId);
    if (existing) {
      return { success: false, error: "Organization already has an active subscription. Cancel it first." };
    }

    await createCustomSubscription({
      organizationId: input.organizationId,
      pricingMode: input.pricingMode,
      billingCycle: input.billingCycle,
      billingMetric:
        input.pricingMode === PricingMode.CUSTOM_PER_STUDENT || input.pricingMode === PricingMode.CUSTOM_SLAB
          ? BillingMetric.STUDENT
          : BillingMetric.FLAT,
      customPrice: input.customPrice,
      unitPrice: input.unitPrice,
      contractReference: input.contractReference,
      studentLimit: input.studentLimit,
      status: SubscriptionStatus.ACTIVE,
      createdBy: user.id,
    });

    revalidatePath("/dashboard/institution");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to create custom deal:", error);
    return { success: false, error: "Failed to create custom subscription." };
  }
}

export async function listOrganizations(password: string) {
  try {
    if (password !== process.env.BILLING_API_KEY) {
      return { success: false, error: "Unauthorized. Invalid billing API key." };
    }

    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { Student: true } },
      },
    });

    const organizationIds = organizations.map((o) => o.id);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: { in: organizationIds },
        status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE] },
      },
      select: { organizationId: true },
      distinct: ["organizationId"],
    });

    const subscribedOrgIds = new Set(subscriptions.map((s) => s.organizationId));

    return {
      success: true,
      data: organizations.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        hasSubscription: subscribedOrgIds.has(o.id),
        studentCount: o._count.Student,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    return { success: false, error: "Failed to fetch organizations." };
  }
}

export async function recordManualSubscriptionPayment(
  password: string,
  input: {
    organizationId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }
) {
  try {
    if (password !== process.env.BILLING_API_KEY) {
      return { success: false, error: "Unauthorized. Invalid billing API key." };
    }

    const user = await getCurrentUser();

    const amountInPaise = Math.round(input.amount * 100);
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0." };
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: input.organizationId,
        status: {
          in: [
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
            SubscriptionStatus.EXPIRED,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { success: false, error: "No subscription found for this organization." };
    }

    let invoice = await prisma.invoice.findFirst({
      where: { subscriptionId: subscription.id, status: InvoiceStatus.OPEN },
      orderBy: { createdAt: "desc" },
    });

    if (!invoice) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      const studentCount = await countBillableStudents(input.organizationId);
      invoice = await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          organizationId: input.organizationId,
          periodStart: now,
          periodEnd,
          studentCount,
          subtotal: amountInPaise,
          total: amountInPaise,
          status: InvoiceStatus.OPEN,
        },
      });
    }

    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        provider: PaymentProvider.MANUAL,
        amount: amountInPaise,
        status: SubscriptionPaymentStatus.SUCCESS,
      },
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date(), total: amountInPaise },
    });

    const eventMessage = `Manual payment of ₹${input.amount} received via ${input.paymentMethod}.${input.notes ? ` Notes: ${input.notes}` : ""}`;

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          events: {
            create: { type: "payment_received", message: `Subscription reactivated. ${eventMessage}`, createdBy: user.id },
          },
        },
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          events: {
            create: { type: "payment_received", message: eventMessage, createdBy: user.id },
          },
        },
      });
    }

    revalidatePath("/dashboard/institution");
    return { success: true };
  } catch (error) {
    console.error("Failed to record payment:", error);
    return { success: false, error: "Failed to record payment." };
  }
}
