# Pricing Model — Fundamentals

> This doc defines how Shiksha.cloud charges organizations. Read this before touching any billing code.

## 1. Two Pricing Modes

Every organization is billed in one of two mutually exclusive modes:

| Mode | Who | How price is set |
|------|-----|------------------|
| **PLAN_BASED** | Self-serve (website signup) | Public plan catalog (Starter/Growth/Scale) |
| **CUSTOM** | Direct-sales (negotiated deal) | Manually set per organization |

### 1.1 PLAN_BASED

Organization picks a plan from the public catalog. The subscription price comes from the plan's `monthlyPrice` / `annualPrice`. An optional `Offer` can apply a discount or override the price.

**Flow:**
```
Signup → 90-day trial → Pick plan → Payment → Active
                                   ↓
                            (or trial converts
                             automatically)
```

### 1.2 CUSTOM

A direct-sales deal negotiated offline and signed via contract. No plan reference needed. Price is set manually on the subscription.

**Sub-types of CUSTOM:**

| Sub-type | What it means | Example |
|----------|---------------|---------|
| **FLAT** | Fixed price per period | ₹30,000/year — no matter how many students |
| **PER_STUDENT** | Price per student per period | ₹54/student/month — invoice recalculates each period |
| **PER_USER** | Price per user (admin/teacher) per period | ₹55/user/month |
| **SLAB** | Tiers based on student count | 0-50: ₹54/student, 51-300: ₹49/student |

## 2. How Price Flows to Invoice

```
                   +------------------+
                   |   Subscription   |
                   |                  |
                   | pricingMode:     |
                   |   PLAN_BASED     |---→ Plan.price
                   |   CUSTOM_FLAT    |---→ customPrice
                   |   CUSTOM_PER_STUD|---→ unitPrice × studentCount
                   |   CUSTOM_SLAB    |---→ PricingSlab lookup
                   +------------------+
                           |
                           v
                   +------------------+
                   |     Invoice      |
                   |                  |
                   | total = subtotal |
                   |        - discount|
                   |        + usageAmt|
                   +------------------+
```

## 3. Data Model Changes

### Subscription (changes to existing model)

| Field | Current | Changed to |
|-------|---------|------------|
| `planId` | Required | **Optional** (null for CUSTOM) |
| `pricingMode` | — | **New**: `PLAN_BASED \| CUSTOM_FLAT \| CUSTOM_PER_STUDENT \| CUSTOM_PER_USER \| CUSTOM_SLAB` |
| `unitPrice` | — | **New**: Price per student/user (in paise), used when pricingMode is PER_STUDENT or PER_USER |
| `customPrice` | — | **New**: Fixed negotiated price (in paise), used when pricingMode is FLAT |
| `contractReference` | — | **New**: Offline contract ID/document reference (for CUSTOM only) |

### PricingSlab (new model)

For CUSTOM_SLAB pricing — defines per-organization tiered rates.

```
model PricingSlab {
  id              String
  organizationId  String
  minStudents     Int       // inclusive
  maxStudents     Int       // exclusive (null = unlimited)
  pricePerStudent Int       // in paise, per billing cycle period
  billingCycle    BillingCycle
  createdAt       DateTime

  @@unique([organizationId, minStudents])
}
```

## 4. Scenarios — Walkthrough

### Scenario A: Website signup → PLAN_BASED

1. Org signs up → `createTrialSubscription()` with `pricingMode: PLAN_BASED`, `planCode: GROWTH`
2. 90-day trial starts
3. At trial end (or manually), org picks a plan → subscription updates with chosen plan
4. Each period: `createInvoice()` reads plan prices → generates invoice

**What admin sees in UI:** Plan name, plan price, student limit, next invoice date.

### Scenario B: Direct-sales → ₹30,000/year flat

1. Admin (or super-admin) creates subscription with:
   ```
   pricingMode: CUSTOM_FLAT
   customPrice: 3000000  // ₹30,000 in paise
   billingCycle: ANNUAL
   contractReference: "CONTRACT-2026-042"
   ```
2. No plan name shown — display "Custom plan" or the contract reference
3. Each period: `createInvoice()` reads `customPrice` → generates invoice for ₹30,000

**What admin sees in UI:** "Custom Plan — CONTRACT-2026-042", ₹30,000/year.

### Scenario C: Direct-sales → ₹54/student/month

1. Subscription created with:
   ```
   pricingMode: CUSTOM_PER_STUDENT
   unitPrice: 5400  // ₹54 in paise
   billingCycle: MONTHLY
   ```
2. Each period: `createInvoice()` computes `total = unitPrice × currentStudentCount`
3. Student count changes mid-period → next invoice auto-adjusts

**What admin sees in UI:** "₹54/student/month", student count, invoice amount.

### Scenario D: Direct-sales → Slab pricing

1. Subscription: `pricingMode: CUSTOM_SLAB`
2. `PricingSlab` rows for the org:
   - 0–50: ₹54/student
   - 51–300: ₹49/student
   - 301–500: ₹44/student
3. Each period: `createInvoice()` looks up applicable slab × studentCount

## 5. What Stays the Same

| Concept | Unchanged |
|---------|-----------|
| Wallet + notifications | Wallet deducted per notification. Same atomic + refund logic. |
| Invoices | Same structure. Only the amount calculation logic changes. |
| Payments | Same model. Gateway integration still needed. |
| Billing events | Same audit trail. |
| Trial flow | Same 90-day trial for PLAN_BASED. For CUSTOM, trialDays is negotiable. |

## 6. What the Existing Code Already Has

| Piece | Status |
|-------|--------|
| `createTrialSubscription()` | ✅ Works — just not wired to org creation |
| `getBillingSummary()` | ✅ Reads real data |
| `createInvoice()` | ✅ Pure function — amount logic needs extension for CUSTOM modes |
| `ensureDefaultBillingCatalog()` | ✅ Creates Starter/Growth/Scale plans |
| `calculateSubscriptionAmount()` | ✅ Handles PLAN_BASED + offers. Needs extension for CUSTOM modes. |
| Wallet deduction in notification engine | ✅ Atomic + refund supported |
| `addOrganizationCredits()` | ✅ Exists, never called from UI |

## 7. Implementation Order

```
Phase 1: Make planId optional + add pricingMode to Subscription
Phase 2: Wire createTrialSubscription() into initializeOrganization()
Phase 3: Extend createInvoice() to handle all 5 pricing modes
Phase 4: Add PricingSlab model
Phase 5: Server action: changeSubscriptionPlan (handles both plan change & custom pricing)
Phase 6: Server action: topUpWallet (wire addOrganizationCredits to UI)
Phase 7: Payment gateway integration for subscriptions
```
