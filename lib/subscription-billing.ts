import { addDays, addMonths } from "date-fns";
import {
  BillingCycle,
  BillingMetric,
  InvoiceStatus,
  OfferType,
  PlanCode,
  StudentStatus,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma-base";

type BillingClient = typeof prisma | Prisma.TransactionClient;

const ACTIVE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
  SubscriptionStatus.PAUSED,
] satisfies SubscriptionStatus[];

const DEFAULT_TRIAL_DAYS = 90;

// ─── Catalog ───────────────────────────────────────────────────────────────────

type PlanCatalogItem = {
  code: PlanCode;
  name: string;
  description: string;
  billingMetric: BillingMetric;
  monthlyPrice: number;
  annualPrice: number;
  studentLimit: number;
  sortOrder: number;
};

type OfferCatalogItem = {
  code: string;
  name: string;
  type: OfferType;
  description: string;
  fixedPrice?: number;
  discountPercent?: number;
  trialDays?: number;
  maxRedemptions?: number;
};

const PLAN_CATALOG = [
  {
    code: PlanCode.STARTER,
    name: "Starter",
    description: "For small schools, coaching classes, and academies getting started.",
    billingMetric: BillingMetric.FLAT,
    monthlyPrice: 999,
    annualPrice: 9999,
    studentLimit: 100,
    sortOrder: 10,
  },
  {
    code: PlanCode.GROWTH,
    name: "Growth",
    description: "For growing institutions with more operational volume.",
    billingMetric: BillingMetric.FLAT,
    monthlyPrice: 1999,
    annualPrice: 19999,
    studentLimit: 500,
    sortOrder: 20,
  },
  {
    code: PlanCode.SCALE,
    name: "Scale",
    description: "For colleges, trusts, and multi-branch education groups.",
    billingMetric: BillingMetric.FLAT,
    monthlyPrice: 2999,
    annualPrice: 29999,
    studentLimit: 3000,
    sortOrder: 30,
  },
] satisfies PlanCatalogItem[];

const OFFER_CATALOG = [
  {
    code: "EARLY_BIRD",
    name: "EarlyBird",
    type: OfferType.EARLY_BIRD,
    description: "First 50 eligible institutions lock the launch price.",
    fixedPrice: 29,
    maxRedemptions: 50,
  },
  {
    code: "ANNUAL_SAVE_20",
    name: "Annual save 20%",
    type: OfferType.ANNUAL,
    description: "Annual billing discount for public plans.",
    discountPercent: 20,
  },
] satisfies OfferCatalogItem[];

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SubscriptionAmountInput = {
  billingMetric: BillingMetric;
  billingCycle: BillingCycle;
  studentCount: number;
  monthlyPrice: number | null;
  annualPrice: number | null;
  offer?: {
    fixedPrice: number | null;
    discountPercent: number | null;
  } | null;
};

export type SubscriptionAmount = {
  studentCount: number;
  subtotal: number;
  discount: number;
  total: number;
  unitPrice: number | null;
};

export type SubscriptionWithRelations = Awaited<ReturnType<typeof getActiveSubscription>>;

export type BillingSummary = {
  channelSummary: Record<string, { units: number; cost: number }>;
  totalMessages: number;
  totalCost: number;
  totalStorageMB: number;
  walletBalance: number;
  subscription: {
    id: string;
    status: string;
    planName: string;
    planCode: string;
    offerName: string | null;
    billingCycle: string;
    billingMetric: string;
    studentCount: number;
    studentLimit: number | null;
    price: number | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    nextInvoiceAmount: number;
  } | null;
  recentInvoices: Array<{
    id: string;
    status: string;
    total: number;
    periodStart: string;
    periodEnd: string;
    paidAt: string | null;
  }>;
  recentPayments: Array<{
    id: string;
    provider: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  billingEvents: Array<{
    id: string;
    type: string;
    message: string | null;
    createdAt: string;
  }>;
};

// ─── Catalog helpers ───────────────────────────────────────────────────────────

function planData(plan: PlanCatalogItem) {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description,
    billingMetric: plan.billingMetric,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    studentLimit: plan.studentLimit,
    isPublic: true,
    isActive: true,
    sortOrder: plan.sortOrder,
  };
}

function offerData(offer: OfferCatalogItem) {
  return {
    code: offer.code,
    name: offer.name,
    type: offer.type,
    description: offer.description,
    fixedPrice: offer.fixedPrice,
    discountPercent: offer.discountPercent,
    trialDays: offer.trialDays,
    maxRedemptions: offer.maxRedemptions,
    isActive: true,
  };
}

export async function getPlans(client: BillingClient = prisma) {
  return client.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublicPlans(client: BillingClient = prisma) {
  return client.plan.findMany({
    where: { isActive: true, isPublic: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getOfferByCode(
  code: string,
  client: BillingClient = prisma
) {
  return client.offer.findUnique({ where: { code } });
}

export async function isOfferAvailable(
  offerId: string,
  client: BillingClient = prisma
) {
  const offer = await client.offer.findUnique({
    where: { id: offerId },
    select: {
      isActive: true,
      startsAt: true,
      endsAt: true,
      maxRedemptions: true,
      redeemedCount: true,
    },
  });
  if (!offer?.isActive) return false;
  const now = new Date();
  if (offer.startsAt && offer.startsAt > now) return false;
  if (offer.endsAt && offer.endsAt < now) return false;
  if (offer.maxRedemptions !== null && offer.redeemedCount >= offer.maxRedemptions) return false;
  return true;
}

export async function ensureDefaultBillingCatalog(client: BillingClient = prisma) {
  for (const plan of PLAN_CATALOG) {
    await client.plan.upsert({
      where: { code: plan.code },
      update: planData(plan),
      create: planData(plan),
    });
  }
  for (const offer of OFFER_CATALOG) {
    await client.offer.upsert({
      where: { code: offer.code },
      update: offerData(offer),
      create: offerData(offer),
    });
  }
}

// ─── Pricing ───────────────────────────────────────────────────────────────────

export function calculateSubscriptionAmount(
  input: SubscriptionAmountInput
): SubscriptionAmount {
  const basePrice =
    input.billingCycle === BillingCycle.ANNUAL
      ? input.annualPrice
      : input.monthlyPrice;

  if (basePrice === null) {
    throw new Error("Plan price is not configured for the selected billing cycle.");
  }

  const unitPrice = input.offer?.fixedPrice ?? basePrice;
  const subtotal =
    input.billingMetric === BillingMetric.STUDENT
      ? unitPrice * input.studentCount
      : unitPrice;

  const discount = input.offer?.discountPercent
    ? Math.round((subtotal * input.offer.discountPercent) / 100)
    : 0;

  return {
    studentCount: input.studentCount,
    subtotal,
    discount,
    total: Math.max(subtotal - discount, 0),
    unitPrice: input.billingMetric === BillingMetric.STUDENT ? unitPrice : null,
  };
}

// ─── Student count ─────────────────────────────────────────────────────────────

export async function countBillableStudents(
  organizationId: string,
  client: BillingClient = prisma
) {
  return client.student.count({
    where: { organizationId, status: StudentStatus.ACTIVE },
  });
}

// ─── Subscription CRUD ─────────────────────────────────────────────────────────

export async function getActiveSubscription(
  organizationId: string,
  client: BillingClient = prisma
) {
  return client.subscription.findFirst({
    where: {
      organizationId,
      status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    include: {
      plan: true,
      offer: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTrialSubscription({
  organizationId,
  planCode = PlanCode.GROWTH,
  billingCycle = BillingCycle.MONTHLY,
  offerCode,
  createdBy,
  trialDays = DEFAULT_TRIAL_DAYS,
  client = prisma,
}: {
  organizationId: string;
  planCode?: PlanCode;
  billingCycle?: BillingCycle;
  offerCode?: string;
  createdBy?: string;
  trialDays?: number;
  client?: BillingClient;
}) {
  const existing = await getActiveSubscription(organizationId, client);
  if (existing) return existing;

  await ensureDefaultBillingCatalog(client);

  const plan = await client.plan.findUniqueOrThrow({
    where: { code: planCode },
  });

  const offer = offerCode
    ? await client.offer.findUnique({ where: { code: offerCode } })
    : null;

  if (offer && !(await isOfferAvailable(offer.id, client))) {
    throw new Error(`Offer ${offer.code} is not available.`);
  }

  const now = new Date();
  const studentCount = await countBillableStudents(organizationId, client);
  const amount = calculateSubscriptionAmount({
    billingMetric: plan.billingMetric,
    billingCycle,
    studentCount,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    offer,
  });

  const subscription = await client.subscription.create({
    data: {
      organizationId,
      planId: plan.id,
      offerId: offer?.id,
      status: SubscriptionStatus.TRIALING,
      billingCycle,
      billingMetric: plan.billingMetric,
      price: amount.unitPrice ?? amount.total,
      studentLimit: plan.studentLimit,
      studentCount,
      trialStartedAt: now,
      trialEndsAt: addDays(now, trialDays),
      currentPeriodStart: now,
      currentPeriodEnd: addDays(now, trialDays),
      events: {
        create: {
          type: "trial_started",
          message: `Trial started on ${plan.name}.`,
          createdBy,
          metadata: {
            planCode,
            offerCode: offer?.code,
            billingCycle,
            studentCount,
          },
        },
      },
    },
    include: { plan: true, offer: true, invoices: true, payments: true, events: true },
  });

  if (offer) {
    await client.offer.update({
      where: { id: offer.id },
      data: { redeemedCount: { increment: 1 } },
    });
  }

  return subscription;
}

export async function activateSubscription(
  subscriptionId: string,
  client: BillingClient = prisma
) {
  const now = new Date();
  return client.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: addMonths(now, 1),
      events: {
        create: {
          type: "subscription_activated",
          message: "Subscription activated.",
        },
      },
    },
  });
}

export async function cancelSubscription(
  subscriptionId: string,
  client: BillingClient = prisma
) {
  const now = new Date();
  return client.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: now,
      cancelAtPeriodEnd: false,
      events: {
        create: {
          type: "subscription_cancelled",
          message: "Subscription cancelled.",
        },
      },
    },
  });
}

// ─── Invoices & Payments ───────────────────────────────────────────────────────

export async function createInvoice({
  subscriptionId,
  usageAmount = 0,
  dueAt,
  client = prisma,
}: {
  subscriptionId: string;
  usageAmount?: number;
  dueAt?: Date;
  client?: BillingClient;
}) {
  const subscription = await client.subscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { plan: true, offer: true },
  });

  const studentCount = await countBillableStudents(subscription.organizationId, client);
  const amount = calculateSubscriptionAmount({
    billingMetric: subscription.billingMetric,
    billingCycle: subscription.billingCycle,
    studentCount,
    monthlyPrice: subscription.plan.monthlyPrice,
    annualPrice: subscription.plan.annualPrice,
    offer: subscription.offer,
  });

  const periodStart = subscription.currentPeriodStart ?? new Date();
  const periodEnd =
    subscription.currentPeriodEnd ??
    (subscription.billingCycle === BillingCycle.ANNUAL
      ? addMonths(periodStart, 12)
      : addMonths(periodStart, 1));

  return client.invoice.create({
    data: {
      subscriptionId: subscription.id,
      organizationId: subscription.organizationId,
      periodStart,
      periodEnd,
      studentCount,
      subtotal: amount.subtotal,
      discount: amount.discount,
      usageAmount,
      total: amount.total + usageAmount,
      status: InvoiceStatus.OPEN,
      dueAt,
    },
  });
}

export async function createSubscriptionPayment({
  subscriptionId,
  invoiceId,
  provider,
  providerOrderId,
  amount,
  rawPayload,
  client = prisma,
}: {
  subscriptionId: string;
  invoiceId?: string;
  provider: string;
  providerOrderId?: string;
  amount: number;
  rawPayload?: Prisma.InputJsonValue;
  client?: BillingClient;
}) {
  return client.subscriptionPayment.create({
    data: {
      subscriptionId,
      invoiceId,
      provider,
      providerOrderId,
      amount,
      status: SubscriptionPaymentStatus.PENDING,
      rawPayload,
    },
  });
}

// ─── Events ────────────────────────────────────────────────────────────────────

export async function recordBillingEvent({
  subscriptionId,
  type,
  message,
  metadata,
  createdBy,
  client = prisma,
}: {
  subscriptionId: string;
  type: string;
  message?: string;
  metadata?: Prisma.InputJsonValue;
  createdBy?: string;
  client?: BillingClient;
}) {
  return client.billingEvent.create({
    data: { subscriptionId, type, message, metadata, createdBy },
  });
}

// ─── Student limit enforcement ─────────────────────────────────────────────────

export async function getStudentLimit(organizationId: string): Promise<number | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      organizationId,
      status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    select: { studentLimit: true },
    orderBy: { createdAt: "desc" },
  });
  return subscription?.studentLimit ?? null;
}

export async function checkStudentLimit(
  organizationId: string,
  additionalStudents = 0
): Promise<{ allowed: boolean; current: number; limit: number | null }> {
  const [limit, currentCount] = await Promise.all([
    getStudentLimit(organizationId),
    prisma.student.count({ where: { organizationId, status: StudentStatus.ACTIVE } }),
  ]);

  if (limit === null) {
    return { allowed: true, current: currentCount, limit: null };
  }

  return {
    allowed: currentCount + additionalStudents <= limit,
    current: currentCount,
    limit,
  };
}

// ─── Billing Summary ───────────────────────────────────────────────────────────

function serializeSubscription(
  subscription: SubscriptionWithRelations,
  studentCount: number
) {
  if (!subscription) return null;

  const amount = calculateSubscriptionAmount({
    billingMetric: subscription.billingMetric,
    billingCycle: subscription.billingCycle,
    studentCount,
    monthlyPrice: subscription.plan.monthlyPrice,
    annualPrice: subscription.plan.annualPrice,
    offer: subscription.offer,
  });

  return {
    id: subscription.id,
    status: subscription.status,
    planName: subscription.plan.name,
    planCode: subscription.plan.code,
    offerName: subscription.offer?.name ?? null,
    billingCycle: subscription.billingCycle,
    billingMetric: subscription.billingMetric,
    studentCount,
    studentLimit: subscription.studentLimit,
    price: subscription.price,
    trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    nextInvoiceAmount: amount.total,
  };
}

export async function getBillingSummary(
  organizationId: string,
  academicYearId: string | null
): Promise<BillingSummary> {
  const channelRows = await prisma.notificationLog.groupBy({
    by: ["channel"],
    where: { organizationId, status: "SENT" },
    _sum: { units: true, cost: true },
  });

  const channelSummary: Record<string, { units: number; cost: number }> = {
    EMAIL: { units: 0, cost: 0 },
    SMS: { units: 0, cost: 0 },
    WHATSAPP: { units: 0, cost: 0 },
    PUSH: { units: 0, cost: 0 },
  };

  let totalCost = 0;
  let totalMessages = 0;

  for (const row of channelRows) {
    const units = row._sum.units ?? 0;
    const cost = row._sum.cost ?? 0;
    channelSummary[row.channel] = { units, cost };
    totalCost += cost;
    totalMessages += units;
  }

  const [docStorage, noticeStorage] = await Promise.all([
    prisma.studentDocument.aggregate({
      where: { organizationId, isDeleted: false },
      _sum: { fileSize: true },
    }),
    academicYearId
      ? prisma.noticeAttachment.aggregate({
          where: { notice: { organizationId, academicYearId } },
          _sum: { fileSize: true },
        })
      : Promise.resolve({ _sum: { fileSize: 0 } }),
  ]);

  const totalBytes =
    (docStorage._sum.fileSize ?? 0) + (noticeStorage._sum.fileSize ?? 0);
  const totalStorageMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));

  const [organization, activeSubscription, studentCount] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { walletBalance: true },
    }),
    getActiveSubscription(organizationId),
    countBillableStudents(organizationId),
  ]);

  return {
    channelSummary,
    totalMessages,
    totalCost,
    totalStorageMB,
    walletBalance: (organization?.walletBalance ?? 0) / 100,
    subscription: serializeSubscription(activeSubscription, studentCount),
    recentInvoices:
      activeSubscription?.invoices.map((inv) => ({
        id: inv.id,
        status: inv.status,
        total: inv.total,
        periodStart: inv.periodStart.toISOString(),
        periodEnd: inv.periodEnd.toISOString(),
        paidAt: inv.paidAt?.toISOString() ?? null,
      })) ?? [],
    recentPayments:
      activeSubscription?.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })) ?? [],
    billingEvents:
      activeSubscription?.events.map((e) => ({
        id: e.id,
        type: e.type,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
      })) ?? [],
  };
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export async function addOrganizationCredits(
  organizationId: string,
  amountInRupees: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const amountInPaise = Math.round(amountInRupees * 100);
    if (amountInPaise <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }
    await prisma.organization.update({
      where: { id: organizationId },
      data: { walletBalance: { increment: amountInPaise } },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to add credits:", error);
    return { success: false, error: "Failed to add credits" };
  }
}
