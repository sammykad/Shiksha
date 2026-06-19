import type { Metadata } from "next"
import Script from "next/script"
import { PRICING_TIERS, BASE_MONTHLY_PRICE_PER_STUDENT, formatPricingAmount } from "@/lib/constants/pricing"
import { PricingPageClient } from "@/components/pricing/pricing-page-client"

// Previous pricing implementation kept for reference:
// import PricingSection from "@/components/website/pricing/PricingSection"
// import Script from "next/script"
//
// const appUrl = new URL("https://shiksha.cloud")
//
// export const previousMetadata: Metadata = {
//   title: "School Software Pricing | Rs 79/Student/Month | Shiksha Cloud",
//   description:
//     "Transparent pricing at Rs 79/student/month. No setup fees, no hidden charges. All features included. Start free today.",
// }

export const metadata: Metadata = {
  title: "Pricing - Shiksha.cloud",
  description:
    "Pricing for schools, coaching classes, colleges, academies, and multi-branch institutions. Pay for students while parents, teachers, and admins stay free.",
  openGraph: {
    title: "Pricing - Shiksha.cloud",
    description:
      "Simple, honest pricing for Indian education institutions.",
  },
}

function pricingSchema() {
  const starter = PRICING_TIERS[0];
  const discountPct = Math.round((1 - starter.currentOfferPrice / starter.standardPrice) * 100);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Shiksha.cloud School Management Software",
    description: `School management platform starting at ${formatPricingAmount(starter.currentOfferPrice)}/student/month. Early Bird Offer — save ${discountPct}%.`,
    offers: PRICING_TIERS.map((tier) => ({
      "@type": "Offer",
      name: `${tier.name} Plan`,
      price: tier.currentOfferPrice,
      priceCurrency: "INR",
      priceValidUntil: "2026-09-30",
      description: `${tier.name}: ${formatPricingAmount(tier.currentOfferPrice)}/student/month (MRP ${formatPricingAmount(tier.standardPrice)}/student/month). Up to ${tier.studentLimit.toLocaleString("en-IN")} students.`,
      eligibleCustomerType: { "@type": "BusinessEntityType", name: "EducationalInstitution" },
    })),
  };
}

export default function PricingPage() {
  return (
    <>
      <Script id="pricing-schema" type="application/ld+json" strategy="lazyOnload">
        {JSON.stringify(pricingSchema())}
      </Script>
      <PricingPageClient />
    </>
  )
}
