import LeadManagementLanding from "@/components/website/features/lead-management/LeadManagementLanding";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "lead-management";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Admission CRM India | Lead Management Software for Schools | Shiksha Cloud",
    description: "Convert more inquiries into admissions. AI-powered lead tracking, automated follow-ups, and admission funnel analytics. Trusted by 1,200+ CBSE, ICSE & State Board schools in India.",
    keywords: [
        "school admission CRM India",
        "lead management software for schools",
        "best school admission software",
        "educational lead tracking system",
        "school inquiry management software",
        "automated school admission follow-up",
        "school admission funnel analytics",
        "convert school leads to admissions",
        "admission CRM for coaching centers",
        "school marketing automation India",
        "digital lead capture for schools",
        "school admission management system",
        "track school inquiries online",
        "admission counselor software India",
        "prevent lead leakage in schools",
        "school admission pipeline management",
        "CBSE school admission CRM",
        "ICSE school lead tracking",
        "school lead conversion optimization",
        "best CRM for educational institutions",
        "school admission lead source tracking",
        "automated parent communication for admissions",
        "school enrollment management software",
        "affordable admission CRM for schools",
        "admission management Delhi schools",
        "admission CRM Mumbai schools",
        "school lead management Bangalore",
        "educational CRM Hyderabad",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/lead-management`,
        languages: {
            en: `${appUrl.origin}/features/lead-management`,
            'en-IN': `${appUrl.origin}/features/lead-management`,
            'x-default': `${appUrl.origin}/features/lead-management`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Convert More Inquiries into Admissions | School Admission CRM | Shiksha Cloud",
        description: "Stop losing potential students to poor follow-ups. Track every lead, automate reminders, and optimize your admission funnel with India's most trusted school CRM.",
        url: `${appUrl.origin}/features/lead-management`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-lead-management.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Admission CRM India",
            },
            {
                url: `${appUrl.origin}/og-image-lead-management-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Lead Management Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Admission CRM India | Lead Management Software | Shiksha Cloud",
        description: "Convert more inquiries into admissions with AI-powered lead tracking and automated follow-ups. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-lead-management.png`,
            `${appUrl.origin}/twitter-card-lead-management.png`,
        ],
    },

    robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
    },

    verification: {
        google: "google-site-verification-code",
    },

    other: {
        "geo.region": "IN",
        "geo.placename": "India",
        "ICBM": "28.6139, 77.2090",
    },
};

// Enhanced Software Application Schema
const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Shiksha Cloud - Admission CRM",
    "alternateName": "Shiksha Cloud Lead Management System",
    "description": "AI-powered lead management and admission CRM for Indian schools. Tracks inquiries from all sources, automates follow-ups, and provides full funnel analytics to increase conversion rates.",
    "url": `${appUrl.origin}/features/lead-management`,
    "image": `${appUrl.origin}/og-image-lead-management.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "School Administration Software",

    "operatingSystem": ["Web", "Android", "iOS", "PWA"],
    "softwareVersion": "3.0",

    "offers": {
        "@type": "Offer",
        "price": "79",
        "priceCurrency": "INR",
        "priceUnit": "per student per month",
        "billingPeriod": "P1M",
        "description": "Starts at ₹79/student/month. Full admission CRM included. Free trial available.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "156",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Anjali Gupta" },
            "reviewBody": "Our admission conversion rate increased by 30% in one season. No more missed leads!",
            "publisher": { "@type": "Organization", "name": "Delhi Public School (Branch X)" },
            "datePublished": "2024-12-01",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Vikram Singh" },
            "reviewBody": "The automated WhatsApp follow-ups are a game changer. Parents respond much faster.",
            "publisher": { "@type": "Organization", "name": "Apex International School" },
            "datePublished": "2024-11-15",
        },
    ],

    "featureList": [
        "Omnichannel lead capture (Web, FB, Insta, Walk-ins)",
        "AI-powered lead scoring and prioritization",
        "Automated WhatsApp and SMS follow-up sequences",
        "Lead assignment and counselor performance tracking",
        "Full admission funnel visualization",
        "Lead source attribution and marketing ROI tracking",
        "Prevent lead leakage with automated reminders",
        "Digital inquiry form generation",
        "One-click conversion from lead to student",
    ],

    "author": {
        "@type": "Organization",
        "name": "Shiksha Cloud",
        "url": `${appUrl.origin}`,
    },

    "publisher": {
        "@type": "Organization",
        "name": "Shiksha Cloud",
        "logo": { "@type": "ImageObject", "url": `${appUrl.origin}/logo.png` },
    },

    "audience": {
        "@type": "Audience",
        "audienceType": "School owners and admission heads in India",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

// Extended FAQ Schema - 10 Questions for Featured Snippets
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is school lead management software?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "School lead management software is a specialized CRM that helps educational institutions track potential students (leads) from the first inquiry to final enrollment. It automates the capture of data from multiple sources, manages follow-ups, and analyzes the conversion funnel to ensure no prospective parent is forgotten.",
            },
        },
        {
            "@type": "Question",
            "name": "How does Shiksha Cloud help in increasing school admissions?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud increases admissions by eliminating 'lead leakage'. By automating the capture of inquiries from Facebook and your website and triggering instant follow-up messages, it ensures that prospective parents are engaged while their interest is at its peak. Detailed analytics also help you identify which marketing channels are providing the highest quality leads.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I track leads from different sources (Facebook, Website, Walk-ins)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Shiksha Cloud integrates with Facebook and Instagram Lead Ads, provides embeddable web forms for your website, and has a simple interface for staff to enter walk-in inquiries. Every lead is automatically tagged with its source, allowing you to see exactly where your best students are coming from.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the automated follow-up system work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can set up automated 'drip campaigns'. For example, as soon as a lead is captured, a welcome WhatsApp message is sent. Three days later, if the status hasn't changed, the system sends a school brochure. Seven days later, it reminds the parent about an upcoming Open House. This keeps your school top-of-mind without manual effort.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I assign leads to specific admission counselors?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can assign leads manually or use automated round-robin distribution. Administrators can monitor counselor activity, track how many calls were made, and see the conversion rate of each team member to ensure accountability and efficiency.",
            },
        },
        {
            "@type": "Question",
            "name": "How do I track the conversion rate of my admission funnel?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our visual funnel dashboard shows you exactly how many leads are at each stage: Inquiry -> Site Visit -> Application -> Admission. You can identify bottlenecks (e.g., 'many site visits but few applications') and take corrective action to optimize the process.",
            },
        },
        {
            "@type": "Question",
            "name": "Is there a way to prevent lead leakage in the admission process?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Lead leakage happens when inquiries are forgotten in registers or spreadsheets. Shiksha Cloud prevents this with 'stale lead' alerts. If a lead hasn't been contacted within a set timeframe, the system flags it and notifies the manager, ensuring every single inquiry is pursued.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I send automated WhatsApp messages to prospective parents?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, through our official WhatsApp Business API integration, you can send personalized, automated messages to prospective parents. This includes welcome notes, appointment reminders for school tours, and follow-up questions, all of which have much higher open rates than emails.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the system integrate with Facebook and Instagram Lead Ads?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. We have a direct integration with Meta Lead Ads. The moment a parent submits a form on Facebook or Instagram, the data is pushed instantly into your Shiksha Cloud CRM, allowing your team to respond in real-time.",
            },
        },
        {
            "@type": "Question",
            "name": "How long does it take to migrate existing lead data to Shiksha Cloud?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Migration is fast and painless. You can upload your existing leads from Excel or CSV files in minutes. Our team also provides migration support to ensure your historical data is correctly mapped to the new system.",
            },
        },
    ],
};

// Breadcrumb schema
const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${appUrl.origin}/`,
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Features",
            "item": `${appUrl.origin}/features`,
        },
        {
            "@type": "ListItem",
            "position": 3,
            "name": "Lead Management",
            "item": `${appUrl.origin}/features/lead-management`,
        },
    ],
};

// Organization Schema - For E-E-A-T Authority
const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Shiksha Cloud",
    "alternateName": "Shiksha Cloud Education Technologies Private Limited",
    "url": `${appUrl.origin}`,
    "logo": `${appUrl.origin}/logo.png`,
    "description": "Shiksha Cloud is India's leading school management software, trusted by 1,200+ schools for digitizing attendance, fees, exams, and admissions.",

    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Sales",
        "email": "contact@shiksha.cloud",
        "availableLanguage": ["English", "Hindi", "Tamil", "Telugu"],
    },

    "sameAs": [
        "https://facebook.com/shikshacloud",
        "https://twitter.com/shiksha_cloud",
        "https://instagram.com/shikshacloud",
        "https://linkedin.com/company/shikshacloud",
    ],

    "areaServed": { "@type": "Country", "name": "India" },

    "potentialAction": {
        "@type": "ViewAction",
        "target": `${appUrl.origin}/select-organization`,
        "name": "Book a Demo",
    },
};

// HowTo Schema - Step by Step Guide
const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Optimize Your School Admission Funnel",
    "description": "A guide to using Shiksha Cloud Lead Management to increase your student enrollment rates.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Capture Leads from All Channels",
            "text": "Integrate your website and social media ads. All inquiries from Facebook, Google, and walk-ins flow into one centralized dashboard.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Qualify and Categorize",
            "text": "Review inquiries and tag them by grade, urgency, and interest level. Use AI scoring to prioritize the most promising leads.",
        },
        {
            "@type": "HowToStep",
            "name": "Assign and Follow Up",
            "text": "Assign leads to your admission counselors. Trigger automated WhatsApp welcome messages and follow-up reminders.",
        },
        {
            "@type": "HowToStep",
            "name": "Manage Site Visits",
            "text": "Schedule school tours and site visits. Track attendance and update lead status to 'Visit Completed'.",
        },
        {
            "@type": "HowToStep",
            "name": "Convert to Admission",
            "text": "Once the parent decides to join, convert the lead into a student record with one click, automatically creating their profile and fee ledger.",
        },
    ],

    "totalTime": "PT30M",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Admission CRM",
    "description": "Lead management and admission funnel optimization software for schools and coaching centers.",
    "brand": { "@type": "Brand", "name": "Shiksha Cloud" },
    "offers": {
        "@type": "Offer",
        "price": "79",
        "priceCurrency": "INR",
        "priceUnit": "per student per month",
        "availability": "https://schema.org/InStock",
    },
    "additionalProperty": [
        { "@type": "PropertyValue", "name": "Setup Fee", "value": "₹0 (Free)" },
        { "@type": "PropertyValue", "name": "Free Trial", "value": "14 days" },
        { "@type": "PropertyValue", "name": "Support", "value": "24/7 Dedicated Support" },
    ],
};

// WebSite Schema for Search Action
const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shiksha Cloud - School Admission CRM",
    "url": appUrl.origin,
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${appUrl.origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
    }
};

export default function LeadManagementFeaturePage() {
    const relatedFeatures = getRelatedFeatures(FEATURE_SLUG, 3);
    const feature = FEATURES[FEATURE_SLUG];

    return (
        <>
            {/* 1. SoftwareApplication Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />

            {/* 2. FAQPage Schema - 10 Questions for Featured Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* 3. Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* 4. Organization Schema - E-E-A-T Authority */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />

            {/* 5. HowTo Schema - Step by Step Guide */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* 6. Product Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

            {/* 7. WebSite Schema - Search Action */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />

            {/* Main Content */}
            <LeadManagementLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Tools That Power Your Admission Funnel"
                />
            )}

            {/* Industry Links Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Drive Admissions for Your Institution
                        </h2>
                        <p className="text-xl text-slate-600">
                            Precision lead tracking and conversion tools for every education segment
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {feature?.relatedIndustries?.map((industry: string) => (
                            <a
                                key={industry}
                                href={`/industries/${industry}`}
                                className="group block"
                            >
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all duration-300">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors capitalize">
                                        {industry.replace(/-/g, ' ')}
                                    </h3>
                                    <p className="text-sm text-slate-600 group-hover:text-slate-700">
                                        See how lead management boosts admissions for {industry.replace(/-/g, ' ')}
                                    </p>
                                    <div className="mt-3 text-green-600 text-sm font-medium group-hover:underline">
                                        Learn more →
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <CallToAction
                variant="dark"
                heading={<>Stop Losing Leads.<br />Start Growing Admissions</>}
                description="Implement the most powerful admission CRM in India and ensure every inquiry is converted."
            />
        </>
    );
}
