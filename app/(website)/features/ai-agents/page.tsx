import { AgentBentoGrid } from "@/components/website/agent-bento-grid";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "ai-agents";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl.origin),
  title: "AI Agents for Schools | FeeSense & Attendance AI | Shiksha Cloud",
  description: "Intelligent AI agents that automate school operations — FeeSense detects fee risks, Attendance AI spots absentee patterns. Smarter school management.",
  keywords: [
    "AI agents for schools",
    "school AI automation",
    "FeeSense AI",
    "attendance AI",
    "intelligent school agents",
    "AI school management",
    "automated fee reminders",
    "attendance pattern detection",
    "school AI tools",
    "smart school software",
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/ai-agents`,
  },
  openGraph: {
    title: "AI Agents That Run Your School Operations | Shiksha Cloud",
    description: "FeeSense AI and Attendance AI — intelligent agents that monitor, detect, and act on fee risks and attendance patterns automatically.",
    url: `${appUrl.origin}/features/ai-agents`,
    siteName: "Shiksha Cloud",
    locale: "en_IN",
    type: "website",
    images: [{ url: `${appUrl.origin}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shiksha_cloud",
    title: "AI Agents for Schools | Shiksha Cloud",
    description: "FeeSense AI + Attendance AI. Intelligent agents that never sleep.",
    images: [`${appUrl.origin}/og-image.png`],
  },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Shiksha Cloud - AI Agents for Schools",
  "description": "Intelligent AI agents including FeeSense AI for fee risk detection and Attendance AI for absentee pattern analysis.",
  "url": `${appUrl.origin}/features/ai-agents`,
  "applicationCategory": "https://schema.org/EducationalApplication",
  "operatingSystem": ["Web", "Android", "iOS"],
  "offers": {
    "@type": "Offer",
    "price": "79",
    "priceCurrency": "INR",
    "priceUnit": "per student per month",
    "availability": "https://schema.org/InStock",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "200",
    "bestRating": "5",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is FeeSense AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FeeSense AI is an intelligent agent that analyzes fee payment patterns, identifies overdue accounts, assesses risk levels, and sends personalized multi-channel reminders to parents automatically.",
      },
    },
    {
      "@type": "Question",
      "name": "How does Attendance AI work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Attendance AI detects absentee patterns, frequent lateness, and identifies students who need intervention. It alerts teachers and triggers notifications to parents in real-time.",
      },
    },
    {
      "@type": "Question",
      "name": "Can AI agents send notifications automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, both FeeSense and Attendance AI send automatic notifications via WhatsApp, SMS, email, and push notifications. Schools can configure thresholds and templates for each agent.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${appUrl.origin}/` },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": `${appUrl.origin}/features` },
    { "@type": "ListItem", "position": 3, "name": "AI Agents", "item": `${appUrl.origin}/features/ai-agents` },
  ],
};

export default function AIAgentsFeaturePage() {
  const relatedFeatures = getRelatedFeatures(FEATURE_SLUG, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              AI Agents
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl mx-auto">
            Intelligent Agents That{" "}
            <span className="relative inline-block">
              Never Sleep
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#d9f972] -z-10 block" />
            </span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
            FeeSense AI, Attendance AI, and more — agents that monitor, detect, and act on school data automatically.
          </p>
        </div>

        <AgentBentoGrid />
      </section>

      {relatedFeatures.length > 0 && (
        <RelatedFeatures
          features={relatedFeatures}
          currentSlug={FEATURE_SLUG}
          title="More Features to Explore"
        />
      )}

      <CallToAction
        variant="dark"
        heading={<>Let AI Handle<br />The Repetitive Work</>}
        description="Set up FeeSense and Attendance AI in minutes. Your teachers will thank you."
      />
    </>
  );
}
