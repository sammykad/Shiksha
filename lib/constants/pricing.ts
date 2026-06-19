import { BillingCycle } from '@/generated/prisma/enums';

/*
 * ─── SINGLE SOURCE OF TRUTH FOR ALL PRICING ─────────────────────────────────
 *
 * Every price in the system originates here — billing engine, public pricing
 * page, feature pages, SEO content. If you need to change a price, change it
 * here and nowhere else.
 *
 * Model: MRP + Seasonal Offer
 *   - BASE_MONTHLY_PRICE = ₹79/student/month is the published MRP
 *   - Seasonal offers (e.g. school opening season) apply a discount per tier
 *   - After the promotional period, currentOfferPrice lifts to standardPrice
 *
 * Plans: Starter / Growth / Scale
 *   - Students
 *   - The same MRP applies to all tiers; tier differentiation is by student
 *     count limit (Starter=100, Growth=500, Scale=3000+)
 *   - Discount depth varies per tier (Scale gets the deepest discount as a
 *     volume incentive)
 */

// ─── MRP ────────────────────────────────────────────────────────────────────

export const BASE_MONTHLY_PRICE_PER_STUDENT = 79;

// ─── Seasonal Offer ─────────────────────────────────────────────────────────
// (No constants needed here — the billing engine reads currentOfferPrice from
// PRICING_TIERS. The public pricing page uses "Early Bird Offer" badge.)

export const PRICING_TIERS = [
  {
    id: 'starter',
    code: 'STARTER',
    name: 'Starter',
    description: 'For small schools, coaching classes, and academies getting started.',
    standardPrice: BASE_MONTHLY_PRICE_PER_STUDENT,
    currentOfferPrice: 29,
    studentLimit: 100,
    sortOrder: 10,
  },
  {
    id: 'growth',
    code: 'GROWTH',
    name: 'Growth',
    description: 'For growing institutions with more operational volume.',
    standardPrice: BASE_MONTHLY_PRICE_PER_STUDENT,
    currentOfferPrice: 49,
    studentLimit: 500,
    sortOrder: 20,
  },
  {
    id: 'scale',
    code: 'SCALE',
    name: 'Scale',
    description: 'For colleges, trusts, and multi-branch education groups.',
    standardPrice: BASE_MONTHLY_PRICE_PER_STUDENT,
    currentOfferPrice: 21,
    studentLimit: 3000,
    sortOrder: 30,
  },
] as const;

export type TierId = (typeof PRICING_TIERS)[number]['id'];

// ─── Annual Billing Discount ────────────────────────────────────────────────

export const ANNUAL_DISCOUNT_PERCENT = 20;

// ─── Derived Helpers ────────────────────────────────────────────────────────

export function getDiscountPercent(standardPrice: number, currentPrice: number): number {
  return Math.round((1 - currentPrice / standardPrice) * 100);
}

export function getAnnualPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT_PERCENT / 100));
}

export function getEffectiveMonthlyPrice(
  monthlyPrice: number,
  billingCycle: BillingCycle,
): number {
  return billingCycle === BillingCycle.ANNUAL
    ? getAnnualPrice(monthlyPrice) / 12
    : monthlyPrice;
}

export function formatPricingAmount(amount: number): string {
  return `₹${amount}`;
}

export const ORGANIZATION_LIMIT = 3;
