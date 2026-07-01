import { addDays, addMonths } from "date-fns";
import {
  BillingCycle,
  BillingMetric,
  InvoiceStatus,
  OfferType,
  PaymentProvider,
  PlanCode,
  PricingMode,
  Role,
  StudentStatus,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma-base";
import { PRICING_TIERS, getAnnualPrice } from "@/lib/constants/pricing";

type BillingClient = typeof prisma | Prisma.TransactionClient;

const ACTIVE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
  SubscriptionStatus.PAUSED,
];

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

const PLAN_CATALOG = PRICING_TIERS.map((tier) => ({
  code: tier.code as PlanCode,
  name: tier.name,
  description: tier.description,
  billingMetric: BillingMetric.STUDENT,
  monthlyPrice: tier.currentOfferPrice,
  annualPrice: getAnnualPrice(tier.currentOfferPrice),
  studentLimit: tier.studentLimit,
  sortOrder: tier.sortOrder,
})) satisfies PlanCatalogItem[];

const OFFER_CATALOG = [
  {
    code: "EARLY_BIRD",
    name: "EarlyBird",
    type: OfferType.EARLY_BIRD,
    description: "First 50 eligible institutions lock the launch price.",
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
  pricingMode: PricingMode;
  billingMetric: BillingMetric;
  billingCycle: BillingCycle;
  studentCount: number;
  userCount?: number;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  customPrice?: number | null;
  unitPrice?: number | null;
  offer?: {
    fixedPrice: number | null;
    discountPercent: number | null;
  } | null;
  pricingSlabs?: Array<{
    minStudents: number;
    maxStudents: number | null;
    pricePerStudent: number;
  }> | null;
};

export type SubscriptionAmount = {
  studentCount: number;
  userCount?: number;
  subtotal: number;
  discount: number;
  total: number;
  unitPrice: number | null;
  pricingMode: PricingMode;
  breakdown: string;
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
    pricingMode: PricingMode;
    planName: string;
    planCode: string | null;
    offerName: string | null;
    billingCycle: BillingCycle;
    billingMetric: BillingMetric;
    studentCount: number;
    studentLimit: number | null;
    price: number | null;
    unitPrice: number | null;
    customPrice: number | null;
    contractReference: string | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    nextInvoiceAmount: number;
    breakdown: string;
  } | null;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string | null;
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
  await ensureDefaultBillingCatalog(client);
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

  await client.$executeRawUnsafe(
    `CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`
  );
}

// ─── Pricing (5 modes) ─────────────────────────────────────────────────────────

export function calculateSubscriptionAmount(
  input: SubscriptionAmountInput
): SubscriptionAmount {
  const { pricingMode, billingCycle, studentCount, userCount, offer } = input;

  let subtotal = 0;
  let unitPrice: number | null = null;
  let breakdown = "";

  switch (pricingMode) {
    case PricingMode.PLAN_BASED: {
      const basePrice =
        billingCycle === BillingCycle.ANNUAL
          ? input.annualPrice
          : input.monthlyPrice;
      if (basePrice === null || basePrice === undefined) {
        throw new Error("Plan price is not configured for the selected billing cycle.");
      }
      const effectivePrice = offer?.fixedPrice ?? basePrice;
      if (input.billingMetric === BillingMetric.STUDENT) {
        unitPrice = effectivePrice;
        subtotal = effectivePrice * studentCount;
        breakdown = `₹${effectivePrice}/student × ${studentCount} students`;
      } else if (input.billingMetric === BillingMetric.USER) {
        const count = input.userCount ?? 0;
        unitPrice = effectivePrice;
        subtotal = effectivePrice * count;
        breakdown = `₹${effectivePrice}/user × ${count} users`;
      } else {
        unitPrice = null;
        subtotal = effectivePrice;
        breakdown = `₹${effectivePrice}/${billingCycle === BillingCycle.ANNUAL ? "year" : "month"}`;
      }
      break;
    }

    case PricingMode.CUSTOM_FLAT: {
      if (input.customPrice === null || input.customPrice === undefined || input.customPrice <= 0) {
        throw new Error("Custom price must be greater than 0 for CUSTOM_FLAT pricing.");
      }
      subtotal = input.customPrice;
      breakdown = `₹${input.customPrice}/${billingCycle === BillingCycle.ANNUAL ? "year" : "month"} (negotiated)`;
      break;
    }

    case PricingMode.CUSTOM_PER_STUDENT: {
      if (input.unitPrice === null || input.unitPrice === undefined) {
        throw new Error("Unit price is required for CUSTOM_PER_STUDENT pricing.");
      }
      unitPrice = input.unitPrice;
      subtotal = input.unitPrice * studentCount;
      breakdown = `₹${input.unitPrice}/student × ${studentCount} students (negotiated)`;
      break;
    }

    case PricingMode.CUSTOM_PER_USER: {
      if (input.unitPrice === null || input.unitPrice === undefined) {
        throw new Error("Unit price is required for CUSTOM_PER_USER pricing.");
      }
      const count = userCount ?? 0;
      unitPrice = input.unitPrice;
      subtotal = input.unitPrice * count;
      breakdown = `₹${input.unitPrice}/user × ${count} users (negotiated)`;
      break;
    }

    case PricingMode.CUSTOM_SLAB: {
      if (!input.pricingSlabs || input.pricingSlabs.length === 0) {
        throw new Error("Pricing slabs are required for CUSTOM_SLAB pricing.");
      }
      const slab = input.pricingSlabs.find(
        (s) => studentCount >= s.minStudents && (s.maxStudents === null || studentCount <= s.maxStudents)
      );
      if (!slab) {
        throw new Error(`No pricing slab found for ${studentCount} students.`);
      }
      unitPrice = slab.pricePerStudent;
      subtotal = slab.pricePerStudent * studentCount;
      breakdown = `₹${slab.pricePerStudent}/student × ${studentCount} students (slab ${slab.minStudents}–${slab.maxStudents ?? "∞"})`;
      break;
    }

    default: {
      const _exhaustive: never = pricingMode;
      throw new Error(`Unknown pricing mode: ${pricingMode}`);
    }
  }

  const discount = offer?.discountPercent
    ? Math.round((subtotal * offer.discountPercent) / 100)
    : 0;

  return {
    studentCount,
    userCount,
    subtotal,
    discount,
    total: Math.max(subtotal - discount, 0),
    unitPrice,
    pricingMode,
    breakdown,
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

// ─── User count (for CUSTOM_PER_USER) ──────────────────────────────────────────

export async function countBillableUsers(
  organizationId: string,
  client: BillingClient = prisma
) {
  return client.membership.count({
    where: {
      organizationId,
      role: { in: [Role.ADMIN, Role.TEACHER] },
    },
  });
}

// ─── Pricing Slabs ─────────────────────────────────────────────────────────────

export async function getPricingSlabs(
  subscriptionId: string,
  client: BillingClient = prisma
) {
  return client.pricingSlab.findMany({
    where: { subscriptionId },
    orderBy: { minStudents: "asc" },
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
      pricingSlabs: {
        orderBy: { minStudents: "asc" },
      },
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
    pricingMode: PricingMode.PLAN_BASED,
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
      pricingMode: PricingMode.PLAN_BASED,
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
            pricingMode: PricingMode.PLAN_BASED,
          },
        },
      },
    },
    include: { plan: true, offer: true, pricingSlabs: true, invoices: true, payments: true, events: true },
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

// ─── Change Plan ───────────────────────────────────────────────────────────────

export async function changeSubscriptionPlan({
  organizationId,
  planCode,
  billingCycle,
  offerCode,
  changedBy,
}: {
  organizationId: string;
  planCode: PlanCode;
  billingCycle: BillingCycle;
  offerCode?: string;
  changedBy?: string;
}) {
  const active = await getActiveSubscription(organizationId);
  if (!active) {
    throw new Error("No active subscription found.");
  }

  await ensureDefaultBillingCatalog();

  const plan = await prisma.plan.findUniqueOrThrow({
    where: { code: planCode },
  });

  let offer = null;
  if (offerCode) {
    offer = await prisma.offer.findUnique({ where: { code: offerCode } });
    if (offer && !(await isOfferAvailable(offer.id))) {
      throw new Error(`Offer ${offer.code} is not available.`);
    }
  }

  const studentCount = await countBillableStudents(organizationId);
  const amount = calculateSubscriptionAmount({
    pricingMode: PricingMode.PLAN_BASED,
    billingMetric: plan.billingMetric,
    billingCycle,
    studentCount,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    offer,
  });

  const updated = await prisma.subscription.update({
    where: { id: active.id },
    data: {
      planId: plan.id,
      offerId: offer?.id,
      pricingMode: PricingMode.PLAN_BASED,
      billingCycle,
      billingMetric: plan.billingMetric,
      price: amount.unitPrice ?? amount.total,
      studentLimit: plan.studentLimit,
      studentCount,
      events: {
        create: {
          type: "plan_changed",
          message: `Plan changed to ${plan.name} on ${billingCycle.toLowerCase()} billing.`,
          createdBy: changedBy,
          metadata: {
            previousPlanCode: active.plan?.code,
            previousBillingCycle: active.billingCycle,
            newPlanCode: planCode,
            newBillingCycle: billingCycle,
            offerCode: offer?.code,
          },
        },
      },
    },
    include: { plan: true, offer: true, pricingSlabs: true },
  });

  if (offer) {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { redeemedCount: { increment: 1 } },
    });
  }

  return updated;
}

// ─── Create Custom Subscription (for direct-sales deals) ───────────────────────

export async function createCustomSubscription({
  organizationId,
  pricingMode,
  billingCycle,
  billingMetric = BillingMetric.FLAT,
  unitPrice,
  customPrice,
  contractReference,
  studentLimit,
  status = SubscriptionStatus.ACTIVE,
  offerCode,
  pricingSlabs,
  createdBy,
  trialDays,
}: {
  organizationId: string;
  pricingMode: PricingMode;
  billingCycle: BillingCycle;
  billingMetric?: BillingMetric;
  unitPrice?: number;
  customPrice?: number;
  contractReference?: string;
  studentLimit?: number;
  status?: SubscriptionStatus;
  offerCode?: string;
  pricingSlabs?: Array<{ minStudents: number; maxStudents?: number; pricePerStudent: number }>;
  createdBy?: string;
  trialDays?: number;
}) {
  const existing = await getActiveSubscription(organizationId);
  if (existing) {
    throw new Error("Organization already has an active subscription. Cancel it first.");
  }

  let offer = null;
  if (offerCode) {
    offer = await prisma.offer.findUnique({ where: { code: offerCode } });
  }

  const now = new Date();
  const studentCount = await countBillableStudents(organizationId);
  const userCount = await countBillableUsers(organizationId);

  const amount = calculateSubscriptionAmount({
    pricingMode,
    billingMetric,
    billingCycle,
    studentCount,
    userCount,
    unitPrice,
    customPrice,
    offer,
    pricingSlabs: pricingSlabs?.map((s) => ({
      minStudents: s.minStudents,
      maxStudents: s.maxStudents ?? null,
      pricePerStudent: s.pricePerStudent,
    })) ?? null,
  });

  const subscription = await prisma.subscription.create({
    data: {
      organizationId,
      pricingMode,
      status,
      billingCycle,
      billingMetric,
      price: amount.unitPrice ?? amount.total,
      unitPrice: unitPrice ?? null,
      customPrice: customPrice ?? null,
      contractReference: contractReference ?? null,
      studentLimit: studentLimit ?? null,
      studentCount,
      trialStartedAt: trialDays ? now : null,
      trialEndsAt: trialDays ? addDays(now, trialDays) : null,
      currentPeriodStart: now,
      currentPeriodEnd: billingCycle === BillingCycle.ANNUAL
        ? addMonths(now, 12)
        : addMonths(now, 1),
      events: {
        create: {
          type: "custom_subscription_created",
          message: `Custom subscription created (${pricingMode}).`,
          createdBy,
          metadata: {
            pricingMode,
            billingCycle,
            unitPrice,
            customPrice,
            contractReference,
            studentLimit,
            studentCount,
          },
        },
      },
    },
    include: { plan: true, offer: true, pricingSlabs: true },
  });

  if (pricingSlabs && pricingSlabs.length > 0) {
    await prisma.pricingSlab.createMany({
      data: pricingSlabs.map((slab) => ({
        subscriptionId: subscription.id,
        minStudents: slab.minStudents,
        maxStudents: slab.maxStudents ?? null,
        pricePerStudent: slab.pricePerStudent,
        billingCycle,
      })),
    });
  }

  return subscription;
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
    include: { plan: true, offer: true, pricingSlabs: true },
  });

  const [studentCount, userCount] = await Promise.all([
    countBillableStudents(subscription.organizationId, client),
    countBillableUsers(subscription.organizationId, client),
  ]);

  const amount = calculateSubscriptionAmount({
    pricingMode: subscription.pricingMode,
    billingMetric: subscription.billingMetric,
    billingCycle: subscription.billingCycle,
    studentCount,
    userCount,
    monthlyPrice: subscription.plan?.monthlyPrice,
    annualPrice: subscription.plan?.annualPrice,
    customPrice: subscription.customPrice,
    unitPrice: subscription.unitPrice,
    offer: subscription.offer,
    pricingSlabs: subscription.pricingSlabs.map((s) => ({
      minStudents: s.minStudents,
      maxStudents: s.maxStudents,
      pricePerStudent: s.pricePerStudent,
    })),
  });

  const periodStart = subscription.currentPeriodStart ?? new Date();
  const periodEnd =
    subscription.currentPeriodEnd ??
    (subscription.billingCycle === BillingCycle.ANNUAL
      ? addMonths(periodStart, 12)
      : addMonths(periodStart, 1));

  const invoiceNumber = await generateInvoiceNumber(client);

  return client.invoice.create({
    data: {
      subscriptionId: subscription.id,
      organizationId: subscription.organizationId,
      invoiceNumber,
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
  provider: PaymentProvider;
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

// ─── Invoice Generation (for script / manual payments) ────────────────────

export async function generateInvoiceNumber(client: BillingClient = prisma): Promise<string> {
  const year = new Date().getFullYear();
  const [result] = await client.$queryRawUnsafe<[{ nextval: bigint }]>(
    `SELECT nextval('invoice_number_seq') AS nextval`
  );
  const seq = Number(result.nextval).toString().padStart(5, "0");
  return `INV-${year}-${seq}`;
}

export type InvoiceGenerationResult = {
  invoice: Awaited<ReturnType<typeof createInvoice>> & { invoiceNumber: string };
  payment: Awaited<ReturnType<typeof createSubscriptionPayment>>;
  subscription: {
    id: string;
    planName: string | null;
    studentCount: number;
    unitPrice: number | null;
    periodStart: Date;
    periodEnd: Date;
  };
  organization: {
    name: string;
    email: string | null;
  };
};

export async function generateInvoiceForOrganization({
  organizationId,
  provider,
  providerOrderId,
  createdBy,
  manualAmount,
}: {
  organizationId: string;
  provider: PaymentProvider;
  providerOrderId?: string;
  createdBy?: string;
  manualAmount?: number;
}): Promise<InvoiceGenerationResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, contactEmail: true },
  });
  if (!org) throw new Error(`Organization not found: ${organizationId}`);

  const subscription = await getActiveSubscription(organizationId);
  if (!subscription) {
    throw new Error(
      `No active subscription found for organization. Create a subscription first, or use recordManualPayment with auto-create.`
    );
  }

  const studentCount = await countBillableStudents(organizationId);

  const amount = manualAmount !== undefined
    ? { subtotal: manualAmount, discount: 0, total: manualAmount, unitPrice: null, pricingMode: subscription.pricingMode, studentCount, breakdown: `Manual ₹${manualAmount}` }
    : calculateSubscriptionAmount({
      pricingMode: subscription.pricingMode,
      billingMetric: subscription.billingMetric,
      billingCycle: subscription.billingCycle,
      studentCount,
      monthlyPrice: subscription.plan?.monthlyPrice,
      annualPrice: subscription.plan?.annualPrice,
      customPrice: subscription.customPrice,
      unitPrice: subscription.unitPrice,
      offer: subscription.offer,
      pricingSlabs: subscription.pricingSlabs.map((s) => ({
        minStudents: s.minStudents,
        maxStudents: s.maxStudents,
        pricePerStudent: s.pricePerStudent,
      })),
    });

  const invoiceNumber = await generateInvoiceNumber();

  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        subscriptionId: subscription.id,
        organizationId,
        invoiceNumber,
        periodStart: subscription.currentPeriodStart ?? new Date(),
        periodEnd: subscription.currentPeriodEnd ?? addMonths(new Date(), 1),
        studentCount: amount.studentCount,
        subtotal: amount.subtotal,
        discount: amount.discount,
        total: amount.total,
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });

    const payment = await tx.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        provider,
        providerOrderId: providerOrderId ?? null,
        amount: amount.total,
        status: SubscriptionPaymentStatus.SUCCESS,
      },
    });

    await tx.billingEvent.create({
      data: {
        subscriptionId: subscription.id,
        type: "payment_received",
        message: provider === PaymentProvider.MANUAL
          ? `Manual payment of ₹${amount.total} recorded. Invoice ${invoiceNumber}.`
          : `Payment of ₹${amount.total} received via ${provider}. Invoice ${invoiceNumber}.`,
        createdBy,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber,
          paymentId: payment.id,
          amount: amount.total,
          provider,
          providerOrderId: providerOrderId ?? null,
        },
      },
    });

    return { invoice, payment };
  });

  return {
    invoice: { ...result.invoice, invoiceNumber },
    payment: result.payment,
    subscription: {
      id: subscription.id,
      planName: subscription.plan?.name ?? null,
      studentCount,
      unitPrice: amount.unitPrice,
      periodStart: subscription.currentPeriodStart ?? new Date(),
      periodEnd: subscription.currentPeriodEnd ?? addMonths(new Date(), 1),
    },
    organization: {
      name: org.name,
      email: org.contactEmail,
    },
  };
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
  studentCount: number,
  userCount?: number
) {
  if (!subscription) return null;

  const amount = calculateSubscriptionAmount({
    pricingMode: subscription.pricingMode,
    billingMetric: subscription.billingMetric,
    billingCycle: subscription.billingCycle,
    studentCount,
    userCount,
    monthlyPrice: subscription.plan?.monthlyPrice,
    annualPrice: subscription.plan?.annualPrice,
    customPrice: subscription.customPrice,
    unitPrice: subscription.unitPrice,
    offer: subscription.offer,
    pricingSlabs: subscription.pricingSlabs?.map((s) => ({
      minStudents: s.minStudents,
      maxStudents: s.maxStudents,
      pricePerStudent: s.pricePerStudent,
    })),
  });

  return {
    id: subscription.id,
    status: subscription.status,
    pricingMode: subscription.pricingMode,
    planName: subscription.plan?.name ?? "Custom Plan",
    planCode: subscription.plan?.code ?? null,
    offerName: subscription.offer?.name ?? null,
    billingCycle: subscription.billingCycle,
    billingMetric: subscription.billingMetric,
    studentCount,
    studentLimit: subscription.studentLimit,
    price: subscription.price,
    unitPrice: subscription.unitPrice,
    customPrice: subscription.customPrice,
    contractReference: subscription.contractReference,
    trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    nextInvoiceAmount: amount.total,
    breakdown: amount.breakdown,
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

  const [organization, activeSubscription, studentCount, userCount] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { walletBalance: true },
    }),
    getActiveSubscription(organizationId),
    countBillableStudents(organizationId),
    countBillableUsers(organizationId),
  ]);

  return {
    channelSummary,
    totalMessages,
    totalCost,
    totalStorageMB,
    walletBalance: (organization?.walletBalance ?? 0) / 100,
    subscription: serializeSubscription(activeSubscription, studentCount, userCount),
    recentInvoices:
      activeSubscription?.invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
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

export async function topUpWallet(
  organizationId: string,
  amountInRupees: number
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const result = await addOrganizationCredits(organizationId, amountInRupees);
  if (!result.success) return result;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { walletBalance: true },
  });

  return {
    success: true,
    newBalance: (org?.walletBalance ?? 0) / 100,
  };
}

// ─── Trial Expiry ──────────────────────────────────────────────────────────────

// ─── Invoice PDF Data ─────────────────────────────────────────────────

export async function getInvoicePDFData(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: { include: { plan: true } },
      payments: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  if (!invoice) throw new Error(`Invoice not found: ${invoiceId}`);

  const org = await prisma.organization.findUnique({
    where: { id: invoice.organizationId },
    select: { name: true, contactEmail: true, logo: true },
  });

  return {
    invoiceNumber: invoice.invoiceNumber ?? `INV-${invoice.id.slice(0, 8)}`,
    createdAt: invoice.createdAt,
    organizationName: org?.name ?? "Unknown",
    organizationEmail: org?.contactEmail ?? null,
    logo: org?.logo ?? null,
    planName: invoice.subscription.plan?.name ?? null,
    studentCount: invoice.studentCount,
    unitPrice: invoice.subscription.unitPrice ?? null,
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    total: invoice.total,
    status: invoice.status,
    paidAt: invoice.paidAt,
    paymentProvider: invoice.payments[0]?.provider ?? null,
    paymentReference: invoice.payments[0]?.providerOrderId ?? null,
  };
}

export type ExpiredTrialInvoice = {
  subscriptionId: string;
  organizationId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  planName: string;
  studentCount: number;
  orgName: string;
  orgEmail: string | null;
  adminUserId: string | null;
};

export async function handleExpiredTrials(client: BillingClient = prisma): Promise<ExpiredTrialInvoice[]> {
  const expired = await client.subscription.findMany({
    where: {
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: { lt: new Date() },
    },
    include: {
      plan: true,
      offer: true,
      organization: { select: { name: true, contactEmail: true } },
      pricingSlabs: {
        orderBy: { minStudents: "asc" },
      },
    },
  });

  const results: ExpiredTrialInvoice[] = [];

  for (const sub of expired) {
    const now = new Date();
    const dueDate = addDays(now, 15);

    try {
      const studentCount = await countBillableStudents(sub.organizationId, client);

      const amount = calculateSubscriptionAmount({
        pricingMode: sub.pricingMode,
        billingMetric: sub.billingMetric,
        billingCycle: sub.billingCycle,
        studentCount,
        monthlyPrice: sub.plan?.monthlyPrice ?? undefined,
        annualPrice: sub.plan?.annualPrice ?? undefined,
        customPrice: sub.customPrice,
        unitPrice: sub.unitPrice,
        offer: sub.offer ? { fixedPrice: sub.offer.fixedPrice, discountPercent: sub.offer.discountPercent } : undefined,
        pricingSlabs: sub.pricingSlabs?.map((s) => ({
          minStudents: s.minStudents,
          maxStudents: s.maxStudents,
          pricePerStudent: s.pricePerStudent,
        })),
      });

      const periodStart = now;
      const periodEnd = sub.billingCycle === BillingCycle.ANNUAL
        ? addMonths(now, 12)
        : addMonths(now, 1);

      const invoiceNumber = await generateInvoiceNumber(client);

      const invoice = await client.invoice.create({
        data: {
          subscriptionId: sub.id,
          organizationId: sub.organizationId,
          invoiceNumber,
          periodStart,
          periodEnd,
          studentCount,
          subtotal: amount.subtotal,
          discount: amount.discount,
          usageAmount: 0,
          total: amount.total,
          status: InvoiceStatus.OPEN,
          dueAt: dueDate,
        },
      });

      await client.subscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          studentCount,
        },
      });

      await client.billingEvent.create({
        data: {
          subscriptionId: sub.id,
          type: "trial_ended",
          message: `Trial ended. Invoice ${invoiceNumber} created. Amount: ${amount.total}. Due: ${dueDate.toISOString().split("T")[0]}.`,
          metadata: { invoiceId: invoice.id, invoiceNumber, amount: amount.total, dueDate: dueDate.toISOString() },
        },
      });

      const adminMember = await client.membership.findFirst({
        where: { organizationId: sub.organizationId, role: "ADMIN", status: "ACTIVE" },
        select: { userId: true },
      });

      results.push({
        subscriptionId: sub.id,
        organizationId: sub.organizationId,
        invoiceId: invoice.id,
        invoiceNumber,
        amount: amount.total,
        dueDate: dueDate.toISOString(),
        planName: sub.plan?.name ?? "Custom",
        studentCount,
        orgName: sub.organization.name,
        orgEmail: sub.organization.contactEmail,
        adminUserId: adminMember?.userId ?? null,
      });
    } catch (error) {
      console.error(`Failed to process trial expiry for ${sub.id}:`, error);
      await client.billingEvent.create({
        data: {
          subscriptionId: sub.id,
          type: "trial_expiry_failed",
          message: `Failed to create invoice after trial: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      });
    }
  }

  return results;
}
