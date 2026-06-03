import type { Metadata } from "next"
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

export default function PricingPage() {
  return <PricingPageClient />
}
