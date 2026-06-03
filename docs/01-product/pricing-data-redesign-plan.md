# Pricing Data Redesign Plan

**File to replace:** `lib/pricing-data.ts`
**Source of truth:** `Features.md` + USP discussions

---

## Current Problems

| Issue | Details |
|-------|---------|
| **Confusing plan structure** | Launch Offer, EarlyBird, Growth, Scale — names don't convey what they do. Scale (₹35) is cheaper than Growth (₹45). Makes no sense. |
| **Per-student pricing** | ₹29–45/student/month. Variable bills = distrust. |
| **No flat monthly option** | `flatMonthlyPrice` field exists in `Plan` interface but is never used. |
| **Feature gating exists but contradicts USPs** | Growth has `"Advanced custom integrations": false`. We claim "all features, one price." |
| **Comparison table columns don't match plans** | Columns are `free/school/multi/enterprise` but actual plans are `Launch Offer/EarlyBird/Growth/Scale`. Complete disconnect. |
| **"META" status in comparison** | Features marked as "META" — customer doesn't know what this means. Creates confusion, not confidence. |
| **"Planned" in comparison** | Features marked "Planned" makes the product feel incomplete. Hide or remove from public pricing. |
| **Add-ons section is vague** | "Notification usage credits," "Payment gateway charges," "Extra storage" — all priced at ₹0. What does this mean? Sounds like hidden costs. |
| **No mention of USP #10** | Future modules free — not stated anywhere. |
| **No mention of free parents/teachers** | USP #7 — not stated. "Unlimited parents, teachers, admins" is buried in EarlyBird features. |
| **No mention of multi-org super admin** | USP #9 — only in Scale plan. |
| **Testimonials are generic** | No real school names, no social proof links. |
| **FAQ doesn't address objections** | No "what if I need more students?" No "what about future features?" |

---

## What to Replace (Section by Section)

### 1. Plan Interface

**Keep:**
- `id`, `name`, `description`, `ctaLabel`, `ctaVariant`, `featured`, `features`, `badge`, `footnote`

**Remove:**
- `pricePerStudent` — we're moving away from per-student as primary pricing
- `flatMonthlyPrice` — replace with explicit `monthlyPrice` + `yearlyPrice` (cleaner)
- `customLabel` — unused

**Add:**
- `monthlyPrice: number` — flat monthly price in INR
- `yearlyPrice: number` — flat yearly price in INR  
- `maxStudents?: number` — student limit for this tier (null = unlimited/unpublished)
- `popular?: boolean` — replaces `featured`
- `savings?: string` — e.g. "Save 17% with annual"

```typescript
export interface Plan {
  id: string
  name: string
  tagline: string           // One line: what this tier means
  monthlyPrice: number      // Flat monthly price
  yearlyPrice: number       // Flat yearly price
  maxStudents?: number      // Student limit (null = contact us)
  popular?: boolean
  badge?: string
  description: string
  savings?: string          // e.g. "Save ₹X/year"
  ctaLabel: string
  ctaVariant: "default" | "outline"
  features: PlanFeature[]
  footnote?: string
}
```

---

### 2. Plans Array

**Current:** 4 plans with per-student pricing and confusing differentiation.

**Replace with:** 3 transparent size-based tiers + 1 free trial.

| Tier | Student Limit | Monthly | Yearly | Message |
|------|--------------|---------|--------|---------|
| **Free Trial** | Up to 100 | ₹0 | — | 3 months, no card, every feature |
| **Small** | Up to 100 | ₹999 | ₹9,999 | For small schools & coaching classes |
| **Medium** | Up to 500 | ₹1,999 | ₹19,999 | For growing institutions |
| **Large** | Up to 3,000 | ₹2,999 | ₹29,999 | For colleges & multi-branch groups |

**Feature lists for all plans should say ONE thing:** *Every feature included. No exceptions.*

Example:
```typescript
{
  id: "small",
  name: "Small",
  tagline: "For schools and coaching classes with up to 100 students.",
  monthlyPrice: 999,
  yearlyPrice: 9999,
  maxStudents: 100,
  badge: "Most popular",
  popular: true,
  savings: "Save ₹1,989/year",
  description: "Everything you need to run your institution. All modules. Zero feature gates.",
  ctaLabel: "Start free trial",
  ctaVariant: "default",
  features: [
    { label: "All 27+ modules included", included: true },
    { label: "Unlimited parents, teachers, admins — free", included: true },
    { label: "10,000 notifications/month included", included: true },
    { label: "1 GB storage included", included: true },
    { label: "Own notification engine: SMS + WhatsApp + Email + Push", included: true },
    { label: "AI FeeSense agent + Attendance Analyzer", included: true },
    { label: "PhonePe online payments", included: true },
    { label: "Public certificate & ID card verification", included: true },
    { label: "PDF reports, receipts, hall tickets, report cards", included: true },
    { label: "Future core modules free — always", included: true },
    { label: "Multi-branch management", included: true },
    { label: "Super admin: manage all your organizations from one login", included: true },
    { label: "Up to 100 students", included: true },
  ],
  footnote: "Notification overage and payment gateway charges apply at actual cost. Extra storage available."
}
```

**Key changes:**
- Every plan has the SAME features (no gating)
- Differentiator is **student count limit** only
- Parents/teachers/admins always free — stated explicitly
- Future modules free — stated explicitly
- All modules listed as included

---

### 3. Add-Ons Section

**Current:** 3 vague add-ons at ₹0 price. Confusing.

**Replace with:** Clear fair-use policy.

```typescript
export const FAIR_USE: FairUseItem[] = [
  {
    id: "notifications",
    title: "Notifications",
    included: "10,000 units/month",
    overage: "Pay per unit at actual cost",
    detail: "SMS, WhatsApp, Email, and Push notifications. Email and Push are always free. SMS and WhatsApp charged only beyond 10,000 units/month."
  },
  {
    id: "storage",
    title: "Storage",
    included: "1 GB",
    overage: "₹X/GB/month",
    detail: "Documents, certificates, receipts, gallery images, and ID cards."
  },
  {
    id: "payments",
    title: "Payment gateway",
    included: "Zero markup",
    overage: "At actual PhonePe rate",
    detail: "We charge exactly what PhonePe charges us. No margin, no hidden fees. 100% transparent."
  }
]
```

---

### 4. Comparison Table

**Current:** 9 groups with `free/school/multi/enterprise` columns that match nothing.

**Replace with:** Columns matching actual plans: `Free Trial | Small | Medium | Large`.

**Rules:**
- Remove all "META" statuses — replace with `true` (it works, just needs testing)
- Remove all "Planned" from public pricing — filter them out or mark as `{ label: "Coming in 2026", included: true, comingSoon: true }`
- All core features = `true` across all plans
- Differences only in **student count** and **fair-use limits**
- Simplify groups: merge related groups, remove redundant entries

```typescript
export const COMPARISON: ComparisonGroup[] = [
  {
    group: "Core Platform",
    rows: [
      { label: "All 27+ modules included", trial: true, small: true, medium: true, large: true },
      { label: "Unlimited parents, teachers, admins", trial: true, small: true, medium: true, large: true },
      { label: "Student limit", trial: "Up to 100", small: "Up to 100", medium: "Up to 500", large: "Up to 3,000" },
      { label: "Notifications included/month", trial: "2,000", small: "10,000", medium: "25,000", large: "50,000" },
      { label: "Storage included", trial: "500 MB", small: "1 GB", medium: "2 GB", large: "5 GB" },
      { label: "Future core modules free", trial: true, small: true, medium: true, large: true },
    ]
  },
  {
    group: "Student Management",
    rows: [
      { label: "Student profiles & management", trial: true, small: true, medium: true, large: true },
      { label: "Bulk CSV import", trial: true, small: true, medium: true, large: true },
      { label: "Document upload & verification", trial: true, small: true, medium: true, large: true },
      { label: "Digital ID cards with QR", trial: true, small: true, medium: true, large: true },
      { label: "Academic performance tracking", trial: true, small: true, medium: true, large: true },
    ]
  },
  // ... same pattern for all groups: ALL true across ALL plans
]
```

---

### 5. Testimonials

**Current:** 6 generic testimonials. Names and quotes are fine but lack real social proof.

**Add:** 
- Real school/institution names if available
- Student/student counts for credibility
- A stats bar: "Trusted by 500+ institutions across India"

---

### 6. FAQ

| Question | Purpose |
|----------|---------|
| "What institutions is this for?" | Replace with answer covering all types |
| "Do parents, teachers, admins pay extra?" | USP #7 — make this prominent |
| "What's included in the subscription?" | USP #3 — emphasize everything included |
| "What costs extra?" | Fair-use overage clarity |
| "What if I exceed my student limit?" | Upgrade path + grace period |
| "What happens when you launch new features?" | USP #10 — future modules free |
| "Can I manage multiple schools from one account?" | USP #9 — multi-org super admin |
| "Is this better than a free trial?" | Make the free trial no-brainer |
| "How is this different from Fedena/Edunext/CampusCare?" | USP comparison |
| "How long does setup take?" | Existing answer, keep |
| "Can I get a refund?" | Refund policy clarity |

---

### 7. Functions to Update

| Function | Change |
|----------|--------|
| `getEffectivePrice()` | Remove per-student logic. Replace with flat price lookup. |
| `formatStudentLabel()` | Keep but update wording to match "students" consistently. |
| `computeMonthlyTotal()` | Remove per-student multiplication. Replace with plan-based pricing. |
| `ANNUAL_DISCOUNT` | Keep at 20%. |

---

### 8. Plan Interface Fields to Remove/Deprecate

| Field | Reason |
|-------|--------|
| `pricePerStudent` | Replaced by flat `monthlyPrice` + `yearlyPrice` |
| `flatMonthlyPrice` | Renamed to `monthlyPrice` |
| `customLabel` | Never used |

---

## Summary of Changes

| Section | Action |
|---------|--------|
| Plan interface | Rewrite — flat pricing, remove per-student |
| Plans array | Replace 4 per-student plans with 3 flat tiers + trial |
| Add-ons | Replace with fair-use policy |
| Comparison table | Rewrite columns to match plans, remove META/Planned |
| Testimonials | Keep + strengthen with stats |
| FAQ | Rewrite to address real objections |
| Functions | Update for flat pricing |
| Student steps | Remove or repurpose for tier limits |

---

## Implementation Order

1. Update `Plan` interface (types first)
2. Rewrite `PLANS` array with flat pricing + all-features message
3. Rewrite comparison table columns + remove META/Planned statuses
4. Replace add-ons with fair-use policy
5. Update FAQ
6. Update utility functions
7. Update pricing page components to use new data shape
8. Update `permissions.ts` PLAN_FEATURES to match (all features all plans)
9. QA: verify no feature gating exists anywhere
