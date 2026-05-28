# Pricing Strategy PRD

## 1. Background & Problem

### Current State

Shiksha.cloud currently charges **₹29–₹45 per student per month** with plans named Launch Offer, EarlyBird, Growth, and Scale. Additionally, institutions pay separately for:

- Notification usage (SMS, WhatsApp, email, push, voice)
- Payment gateway charges (on each online fee transaction)
- Storage beyond standard limits (~1GB)

### Problems with Current Model

| Problem | Impact |
|---------|--------|
| **Per-student pricing** | Institutions can't predict their monthly bill. Variable costs rise with every new student enrolled. |
| **Bill shock from pass-through charges** | Schools get charged for notifications, gateway fees, and storage on top of subscription. Creates trust issues. |
| **Confusing plan structure** | 4 plans (Launch Offer, EarlyBird, Growth, Scale) with overlapping price-per-student rates. Scale (₹35) is cheaper than Growth (₹45). Confusing. |
| **Two conflicting plan systems** | `pricing-data.ts` uses per-student plans while `permissions.ts` has a different plan structure (Free/Standard/Premium/Enterprise). The codebase is inconsistent. |
| **No pricing transparency** | Potential customers can't quickly estimate their monthly cost. Per-student × count × variable usage is too many variables. |

### Why Now

The current pricing model creates friction at every stage:

1. **Acquisition**: Prospects can't easily compare or commit. "How much will I actually pay?" is the #1 objection.
2. **Retention**: Existing customers experience variable bills and feel nickel-and-dimed by pass-through charges.
3. **Internal complexity**: Feature gating is built (`permissions.ts` has PLAN_FEATURES) but unused in the pricing page. The disconnect between pricing display and actual plan enforcement means the system is not fully leveraged.

## 2. Proposed Model: Flat Subscription + Fair-Use

### Philosophy

> **One predictable price. All features included. Fair-use on variable costs.**

- **Not per-student** — pay for the institution, not per head
- **Not per-feature** — every subscriber gets everything
- **Fair-use limits** on variable costs (notifications, storage) to keep the model sustainable
- **Payment gateway charges** passed through at actual cost (zero margin, transparent)

### The Model

**Flat monthly/yearly subscription** based on institution size band. No per-student pricing. All features unlocked in every tier.

## 3. Pricing Structure

### Tiers

| Tier | Learner Limit | Monthly | Yearly (17% off) | Effective /student/mo at max |
|------|-------------|---------|-------------------|---------------------------|
| **Small** | Up to 100 | ₹999 | ₹9,999 | ₹10/student at 100 |
| **Medium** | Up to 500 | ₹1,999 | ₹19,999 | ₹4/student at 500 |
| **Large** | Up to 3,000 | ₹2,999 | ₹29,999 | ₹1/student at 3,000 |

### Annual Discount

~17% savings (2 months free).

### Comparison with Current Pricing

| Institution | Current (₹29/student) | New (Flat) | Savings |
|------------|----------------------|------------|---------|
| 50 students | ₹1,450/mo (₹17,400/yr) | ₹999/mo (₹9,999/yr) | **43%** |
| 200 students | ₹5,800/mo (₹69,600/yr) | ₹1,999/mo (₹19,999/yr) | **71%** |
| 1,000 students | ₹29,000/mo (₹3,48,000/yr) | ₹2,999/mo (₹29,999/yr) | **91%** |

### Fair-Use Limits (Included in Subscription)

| Resource | Included | Overage |
|----------|----------|---------|
| **Notifications** (SMS/WhatsApp/Email/Push) | 10,000 units/month | Pay per unit at platform cost |
| **Storage** (documents, receipts, certificates, gallery) | 1 GB | Pay per GB consumed |
| **Payment gateway** | — | Passed through at actual cost (PhonePe charges) |

**Notification unit definition**: 1 SMS = 1 unit, 1 WhatsApp template = 1 unit, 1 email = 0 units (free), 1 push notification = 0 units (free).

## 4. Feature Coverage

### All features, all tiers

Every feature in Shiksha.cloud is included in every plan. There is no feature gating. The `permissions.ts` PLAN_FEATURES should be simplified to remove feature-based plan differentiation. The only difference between tiers is the **learner count limit**.

| Feature Group | Included? |
|--------------|-----------|
| Student/Learner profiles & management | ✅ All tiers |
| Fees, payments, receipts, reconciliation | ✅ All tiers |
| Attendance (all modes + analytics) | ✅ All tiers |
| Exams, hall tickets, results | ✅ All tiers |
| Notice board & communications | ✅ All tiers |
| Lead CRM & admissions pipeline | ✅ All tiers |
| AI reports & AI agents | ✅ All tiers |
| Document verification & certificates | ✅ All tiers |
| Parent/Student/Teacher portals | ✅ All tiers |
| Anonymous complaints | ✅ All tiers |
| Multi-branch management | ✅ All tiers |
| Custom integrations & API | ✅ All tiers |
| Custom roles & permissions | ✅ All tiers |

## 5. Exceeding Plan Limits

### Learner Count

When an institution exceeds their tier's learner limit:

1. **30-day grace period** — no interruption, notification sent to admin
2. **Auto-suggest upgrade** — upgrade to next tier with 1 click
3. **Overage billing available** — if they don't want to upgrade, charge per additional learner (e.g., ₹5/extra learner/month)

### Notifications

- Monthly usage tracked in-app via notification dashboard
- When approaching 80% of 10,000 limit: in-app alert + email to admin
- Overages: billed at cost + 0% margin (transparent, no markup)
- Customer sees exact cost per notification type in dashboard

### Storage

- 1GB soft limit. No hard block — system continues working
- Usage visible in settings dashboard
- Extra storage: ₹X/GB/month (cost-based, published)

### Payment Gateway

- Always passed through at actual PhonePe/RAZORPAY rates
- No markup, no margin on payment processing
- Transparent line item in invoice

## 6. Migration Plan

### For Existing Customers

| Current Plan | Migrates To | Notes |
|-------------|-------------|-------|
| Launch Offer (₹0/student) | Small tier (₹999/mo) | Transition after trial period ends |
| EarlyBird (₹29/student, locked) | Small, Medium, or Large based on student count | Honor the "locked forever" promise by offering same % discount on new flat pricing. If they lock at ₹29/student → convert to comparable flat discount. |
| Growth (₹45/student) | Medium or Large based on student count | |
| Scale (₹35/student) | Large tier | |

### EarlyBird Commitment Handling

Since EarlyBird promises "₹29/student/month locked forever," we must honor this. Options:

1. **Grandfather**: Let EarlyBird customers stay on per-student pricing permanently (no forced migration)
2. **Convert with discount**: Offer them the Large plan at EarlyBird-equivalent rate (e.g., ₹29,999/yr × 50% for 1 year as transition)
3. **Hybrid**: Let them choose — stay on old pricing or switch to new pricing anytime

**Recommendation**: Option 1 for existing EarlyBird customers + Option 2 as an upgrade path they can opt into.

### Timeline

| Phase | What | When |
|-------|------|------|
| **Phase 1** | PRD sign-off, pricing finalization | Week 1 |
| **Phase 2** | Update pricing page, remove per-student plans | Week 2-3 |
| **Phase 3** | Simplify permissions.ts PLAN_FEATURES to remove feature gating | Week 3 |
| **Phase 4** | Implement fair-use tracking (notification counter, storage meter) | Week 4-6 |
| **Phase 5** | Set up overage billing infrastructure | Week 6-8 |
| **Phase 6** | Migrate existing customers, communicate changes | Week 8-10 |
| **Phase 7** | Launch new pricing publicly | Week 10 |

## 7. Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| Pricing page conversion rate | +50% (from current) | Simpler pricing should reduce hesitation |
| Avg. revenue per institution | Maintain or increase | Despite per-student rate drop, flat pricing should attract more customers |
| Customer acquisition cost | -30% | Easier to convert with transparent pricing |
| Support tickets about billing | -60% | No more "why is my bill this month higher?" |
| Churn rate | -40% | Predictable bills = happier customers |
| Time-to-signup (from first visit) | -50% | No more having to calculate cost |

## 8. Codebase Changes Required

| File | Change |
|------|--------|
| `lib/pricing-data.ts` | Replace per-student PLANS with new tier structure. Remove pricePerStudent from Plan type. Update computeMonthlyTotal, getEffectivePrice, etc. |
| `lib/permissions.ts` | Simplify PLAN_FEATURES — remove feature differentiation between plans. All features available at all tiers. Keep plan hierarchy but make all Feature[] identical. |
| `app/(website)/pricing/page.tsx` | Redesign pricing page to show 3 tiers with learner limits instead of per-student rates |
| `components/pricing/*` | Update all pricing components (plan-card, plans-grid, feature-table, student-slider, billing-toggle, addon-cards) |
| `components/changeable-pricing-section.tsx` | Update to match new model |
| Backend/subscription system | Implement fair-use tracking and overage billing |

## 9. Open Questions / Decisions Needed

1. **Notification overage pricing**: What's the exact per-unit cost for SMS and WhatsApp? Need to compute from provider rates.
2. **Storage overage pricing**: ₹X/GB/month? Need to check Cloudinary/Uploadthing pricing.
3. **EarlyBird commitment**: Exact grandfather/conversion mechanics need product and CEO sign-off.
4. **Overage billing for extra learners**: Should we allow per-learner overage or force upgrade? Recommend force upgrade for simplicity.
5. **Grace period duration**: 30 days? 15 days? 7 days?
6. **Payment gateway markup**: Should we add any margin on gateway charges? Recommend 0% — build margin into subscription price.

## 10. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| **Revenue drop** on large customers (1,000+ students) | Large customer ARR drops from ₹3.5L/yr to ₹30K/yr. Offset by volume — simpler pricing converts 3x more customers. |
| **Small customers** can't afford ₹999/month | ₹999/month for unlimited features is still cheaper than current ₹29/student for even 35 students (₹1,015). 10-student coaching: ₹999/mo is viable. |
| **Notification abuse** (spam from a single customer) | Fair-use limits + rate limiting. Disproportionate usage billed at cost. |
| **EarlyBird customers** upset about losing locked-in rate | Grandfather existing customers. New pricing only applies to new signups or opt-in migrations. |
