# Subscription & Billing PRD

**Status:** Draft for product sign-off  
**Date:** 2026-06-01  
**Owner:** Solo dev  
**Project:** Shiksha.cloud pricing, subscription, checkout, and in-app billing

---

## 1. Why This Matters Now

Shiksha.cloud has a strong public pricing page, but pricing is still mostly marketing copy. The app does not yet have a real subscription system.

Today the product has several competing truths:

- Public pricing presents `EarlyBird`, `Growth`, and `Scale`.
- Prisma still has `PlanType` values such as `FREE`, `STANDARD`, `PREMIUM`, and `ENTERPRISE`.
- `Organization` stores billing-like mirror fields: `isPaid`, `plan`, `planStartedAt`, and `planExpiresAt`.
- Dashboard billing reads those legacy fields and usage wallet data.
- Existing pricing docs argue for flat subscriptions and fair-use limits.
- Legal/public pages still mention older per-student pricing.

This creates a dangerous moment: if checkout is built directly on the current pricing page, the app will hard-code the wrong concepts into database models, payments, invoices, support workflows, and dashboard billing.

The job of this PRD is to create one clean billing model before money starts flowing through it.

---

## 2. Core Decision

EarlyBird is an **Offer**, not a **Plan**.

Starter, Growth, and Scale are plans. EarlyBird is a launch offer that can lower the price of a plan for eligible institutions. It should never be a standalone plan because it does not change product access.

Use this mental model:

```txt
Plan: Starter
Offer: EarlyBird
Base price: Starter public price
Effective price: EarlyBird locked price
Access: Same Starter access
```

This keeps the buyer story simple and keeps the code maintainable.

---

## 3. Product Principles

1. **One product, all core features included.** Pricing should not make institutions feel they are buying tiny modules.
2. **Charge by institution size, not by role count.** Parents, teachers, admins, and staff stay free.
3. **Make variable costs visible.** Notifications, payment gateway fees, and storage overage are usage costs, not hidden add-ons.
4. **Keep plan names stable.** Temporary market offers should not become permanent plan names.
5. **Dashboard billing must match the invoice.** Admins should see the same plan, offer, learner count, usage, and renewal dates that billing uses.
6. **Do not build feature gating in V1.** The commercial differentiator is learner limit, support level, and contract terms.

---

## 4. Recommended Public Pricing

### Plans

| Plan | Best For | Billing | Public CTA |
|------|----------|---------|------------|
| Starter | Small schools, coaching classes, academies | Flat plan or learner band | Start trial |
| Growth | Growing institutions with more operational volume | Flat plan or learner band | Start trial |
| Scale | Colleges, trusts, multi-branch groups | Sales-assisted annual contract | Contact sales |

### Offers

| Offer | Meaning | Rule |
|-------|---------|------|
| Trial | No-risk onboarding | 3 months free, no card required |
| EarlyBird | Launch urgency and price lock | First 50 eligible institutions lock a lower rate |
| Annual | Prepay incentive | Annual billing discount |
| Manual | Sales exception | Custom discount for approved contracts |

### Recommendation On EarlyBird

For the public page, show EarlyBird as a strip or badge above eligible plans:

```txt
EarlyBird offer: first 50 institutions lock the launch price after their free trial.
```

Do not show EarlyBird as a plan card.

---

## 5. Users and Jobs

### Visitor

Wants to understand cost quickly and choose a plan without speaking to sales unless they are large or complex.

### Organization Admin

Wants to know current plan, renewal date, usage balance, invoices, and whether the institution needs to upgrade.

### Owner / Decision Maker

Wants predictable pricing and proof that all major workflows are included.

### Internal Admin / Sales

Needs to apply offers, extend trials, activate paid subscriptions, record manual contracts, and inspect payment history without editing raw organization fields.

---

## 6. Scope

### V1 Must Include

- Plan catalog in database.
- Offer catalog in database.
- One active subscription per organization.
- Trial subscription creation.
- Server-side subscription price calculation.
- Dashboard billing backed by subscription data.
- Invoice records.
- Subscription payment records.
- Billing event history.
- EarlyBird redemption count and eligibility check.
- Usage wallet display remains separate from subscription.
- Migration away from `Organization.plan` as source of truth.

### V1 Must Not Include

- Feature gating by plan.
- Billing parents, teachers, admins, or staff.
- Automated refunds.
- Complex dunning automation.
- Coupon stacking.
- Multiple payment providers at the same time.
- Full GST/tax automation unless compliance data is ready.
- Revenue recognition accounting.

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Pricing to signup handoff | Selected plan and offer are preserved through signup |
| Trial creation | New organization gets a trial subscription without manual setup |
| Billing clarity | Admin billing page shows plan, offer, trial/renewal date, learner count, usage, and invoices |
| Data consistency | No new billing code depends on `Organization.plan` alone |
| EarlyBird integrity | Offer cannot exceed max redemption count |
| Support load | Fewer questions about "what am I paying for?" |

---

## 8. Canonical Language

Use these names in code, docs, UI, and support language.

| Concept | Use This | Do Not Use |
|---------|----------|------------|
| Sellable package | `Plan` | tier, package, pricing card |
| Discount/campaign | `Offer` | promotion, coupon, discount plan |
| Organization purchase | `Subscription` | organization plan, paid flag |
| Billable participant | `Learner` | seat, user |
| Free account roles | `Free Role` | free seat |
| Period bill | `Invoice` | bill |
| Subscription payment | `SubscriptionPayment` | payment, fee payment |
| Variable usage charge | `Usage Cost` | add-on, hidden charge |
| Usage credit balance | `Wallet` | subscription balance |
| Audit history | `BillingEvent` | log, note |

The glossary is also captured in [CONTEXT.md](../../CONTEXT.md).

---

## 9. Data Model

### Naming Rules

- Prisma models use short nouns: `Plan`, `Offer`, `Subscription`, `Invoice`, `SubscriptionPayment`, `BillingEvent`.
- Functions use clear verbs: `getActiveSubscription`, `createTrialSubscription`, `calculateSubscriptionAmount`.
- Existing `FeePayment` remains only for student fee collection. Do not reuse it for subscription payments.

### Prisma Proposal

```prisma
enum PlanCode {
  STARTER
  GROWTH
  SCALE
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}

enum BillingMetric {
  LEARNER
  FLAT
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  PAUSED
  CANCELLED
  EXPIRED
}

enum OfferType {
  EARLY_BIRD
  TRIAL
  ANNUAL
  MANUAL
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
}

enum SubscriptionPaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  CANCELLED
}

model Plan {
  id               String        @id @default(cuid())
  code             PlanCode      @unique
  name             String
  description      String?
  billingMetric    BillingMetric
  monthlyPricePaise Int?
  annualPricePaise  Int?
  learnerLimit      Int?
  isPublic          Boolean      @default(true)
  isActive          Boolean      @default(true)
  sortOrder         Int          @default(0)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  subscriptions     Subscription[]
}

model Offer {
  id              String      @id @default(cuid())
  code            String      @unique
  name            String
  type            OfferType
  description     String?
  discountPercent Int?
  fixedPricePaise Int?
  trialDays       Int?
  maxRedemptions  Int?
  redeemedCount   Int         @default(0)
  startsAt        DateTime?
  endsAt          DateTime?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  subscriptions   Subscription[]
}

model Subscription {
  id                  String             @id @default(cuid())
  organizationId      String
  organization        Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  planId              String
  plan                Plan               @relation(fields: [planId], references: [id])
  offerId             String?
  offer               Offer?             @relation(fields: [offerId], references: [id])

  status              SubscriptionStatus @default(TRIALING)
  billingCycle        BillingCycle       @default(MONTHLY)
  billingMetric       BillingMetric
  pricePaise          Int?
  learnerLimit        Int?
  learnerCount        Int                @default(0)

  trialStartedAt      DateTime?
  trialEndsAt         DateTime?
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelledAt         DateTime?
  cancelAtPeriodEnd   Boolean            @default(false)

  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  invoices            Invoice[]
  payments            SubscriptionPayment[]
  events              BillingEvent[]

  @@index([organizationId, status])
  @@index([planId])
  @@index([offerId])
}

model Invoice {
  id             String        @id @default(cuid())
  subscriptionId String
  subscription   Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  organizationId String

  periodStart    DateTime
  periodEnd      DateTime
  learnerCount   Int
  subtotalPaise  Int
  discountPaise  Int           @default(0)
  usagePaise     Int           @default(0)
  totalPaise     Int
  status         InvoiceStatus @default(OPEN)
  dueAt          DateTime?
  paidAt         DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  payments       SubscriptionPayment[]

  @@index([organizationId, status])
  @@index([subscriptionId])
}

model SubscriptionPayment {
  id                String                    @id @default(cuid())
  subscriptionId    String
  subscription      Subscription              @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  invoiceId         String?
  invoice           Invoice?                  @relation(fields: [invoiceId], references: [id])

  provider          String
  providerOrderId   String?
  providerPaymentId String?
  amountPaise       Int
  status            SubscriptionPaymentStatus @default(PENDING)
  rawPayload         Json?
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt

  @@index([subscriptionId, status])
  @@index([providerOrderId])
}

model BillingEvent {
  id             String       @id @default(cuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  type           String
  message        String?
  metadata       Json?
  createdBy      String?
  createdAt      DateTime     @default(now())

  @@index([subscriptionId, createdAt])
}
```

### Organization Changes

Add:

```prisma
subscriptions Subscription[]
```

Keep during migration only:

```prisma
isPaid
plan
planStartedAt
planExpiresAt
```

These become mirrors, not the billing source of truth.

---

## 10. Core Functions

Use these names unless implementation proves a better shape.

### Plan and Offer

```txt
getPlans()
getPublicPlans()
getOfferByCode(code)
isOfferAvailable(offerId)
applyOffer(plan, offer)
reserveOffer(offerId, organizationId)
```

### Subscription

```txt
getActiveSubscription(organizationId)
createTrialSubscription(input)
changeSubscriptionPlan(input)
cancelSubscription(subscriptionId)
activateSubscription(subscriptionId)
syncOrganizationPlanMirror(organizationId)
```

### Pricing and Invoices

```txt
countBillableLearners(organizationId)
calculateSubscriptionAmount(input)
createInvoice(input)
markInvoicePaid(invoiceId)
```

### Payments

```txt
createSubscriptionPayment(input)
verifySubscriptionPayment(input)
handleSubscriptionPaymentSuccess(input)
handleSubscriptionPaymentFailure(input)
```

### Audit

```txt
recordBillingEvent(input)
getBillingEvents(subscriptionId)
```

---

## 11. Product Flows

### Flow A: Public Pricing To Trial

1. Visitor opens `/pricing`.
2. Visitor selects Starter, Growth, or Scale.
3. UI shows EarlyBird only as an eligible offer.
4. Visitor clicks trial CTA.
5. Signup receives `planCode`, `billingCycle`, and optional `offerCode`.
6. Server validates plan and offer.
7. Server creates `Organization`.
8. Server creates `Subscription` with `TRIALING` status.
9. Dashboard billing shows trial end date and post-trial price.

### Flow B: Existing Admin Opens Billing

1. Admin opens dashboard billing.
2. Server loads `getActiveSubscription(organizationId)`.
3. Server loads wallet and usage summary.
4. UI shows plan, offer, status, learner count, renewal/trial date, invoices, and wallet.
5. UI does not depend on `Organization.plan` except as fallback during migration.

### Flow C: Activate Paid Subscription

1. Admin chooses plan and billing cycle.
2. Server counts billable learners.
3. Server calculates amount.
4. Server creates invoice.
5. Server creates subscription payment.
6. Payment provider redirects or sends webhook.
7. Server verifies payment.
8. Server marks invoice paid.
9. Server activates subscription.
10. Server records billing event.

### Flow D: Sales-Assisted Scale Deal

1. Sales reviews institution size and support needs.
2. Sales creates or selects Scale subscription terms.
3. Admin records annual amount, learner limit, offer if any, and renewal date.
4. Billing page shows contract terms clearly.
5. Billing event records who changed the subscription.

---

## 12. Dashboard Billing Requirements

Billing page must show:

- Current plan.
- Current offer, if any.
- Subscription status.
- Trial end date or renewal date.
- Billing cycle.
- Billable learner count.
- Plan learner limit.
- Effective subscription price.
- Estimated next invoice.
- Wallet balance.
- Notification usage.
- Storage usage.
- Payment gateway pass-through summary.
- Invoice history.
- Payment history.
- Billing event history for internal/admin view.

Important: billing should not be disabled just because no academic year exists. Subscription billing belongs to the organization, not to an academic year.

---

## 13. Migration Plan

### Phase 1: Align Language

- Keep this PRD as the build source.
- Keep `CONTEXT.md` as glossary.
- Rename public pricing concepts from EarlyBird plan to EarlyBird offer.
- Update legal/public copy that still mentions old per-student pricing.

### Phase 2: Add Billing Models

- Add `Plan`, `Offer`, `Subscription`, `Invoice`, `SubscriptionPayment`, `BillingEvent`.
- Add `subscriptions Subscription[]` to `Organization`.
- Generate Prisma client.
- Seed Starter, Growth, Scale plans.
- Seed Trial and EarlyBird offers.

### Phase 3: Backfill Existing Organizations

- For each organization, create one subscription from legacy fields.
- Map `STANDARD` to Growth unless product decides otherwise.
- Record `BillingEvent` for migration.
- Keep legacy fields as mirrors.

### Phase 4: Update App Reads

- Update dashboard billing to read `Subscription`.
- Update billing helpers to read `Subscription`.
- Update pricing CTA to pass plan and offer.
- Stop adding new logic against `Organization.plan`.

### Phase 5: Checkout

- Add server-side invoice creation.
- Add subscription payment creation.
- Add payment verification.
- Activate subscriptions only after verified payment.

---

## 14. Acceptance Criteria

- Public pricing shows Starter, Growth, Scale as plans.
- Public pricing shows EarlyBird only as an offer.
- New organizations get a `Subscription`.
- Dashboard billing reads `Subscription`.
- EarlyBird redemptions cannot exceed its limit.
- Subscription payment records are separate from student fee payments.
- Subscription invoices are reproducible from stored learner count, plan price, offer, usage, and period.
- Billing page works even before academic year setup.
- Usage wallet remains separate from subscription.
- `Organization.plan` is no longer the source of truth for new billing code.

---

## 15. Open Questions For Sign-Off

1. Should V1 use flat learner bands or per-learner pricing?
   - Recommendation: flat learner bands for clearer sales conversations.
2. Should EarlyBird apply to Starter only, Growth only, or any eligible paid plan?
   - Recommendation: Starter and Growth only; Scale should be sales-led.
3. What is the exact billable learner definition?
   - Recommendation: active students/learners, excluding alumni, transferred, dropped, and inactive records.
4. Should Scale be self-serve?
   - Recommendation: no for V1; route Scale to sales.
5. Should no-card trial remain forever?
   - Recommendation: yes for V1; optimize activation before adding card friction.
6. Which provider owns subscription payments?
   - Recommendation: start with current payment provider/manual invoice path, then add automated recurring billing later.

---

## 16. Risks

| Risk | Mitigation |
|------|------------|
| Existing code keeps using `Organization.plan` | Keep mirror fields but block new code from depending on them |
| EarlyBird promise becomes ambiguous | Store effective price on `Subscription` when offer is applied |
| Billing and fee payments get mixed | Keep `SubscriptionPayment` separate from `FeePayment` |
| Trial users never convert | Billing page shows trial end, post-trial price, and activation CTA |
| Large institutions need custom terms | Keep Scale sales-assisted in V1 |
| Variable costs feel hidden | Show wallet, notification usage, storage, and gateway pass-through separately |

