import IntegrationComponent from "@/components/website/IntegrationComponent";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "integration";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Software Integrations India | Sync Facebook, WhatsApp & Google Sheets | Shiksha Cloud",
    description: "Connect your school's ecosystem. Seamless integrations with Facebook Ads, Google Sheets, WhatsApp Business, and more. Automate data flow, reduce manual entry, and grow admissions. Trusted by 1,200+ Indian institutions.",
    keywords: [
        "school software integrations India",
        "Facebook lead ads for schools",
        "WhatsApp integration for school management",
        "Google Sheets sync school software",
        "automated admission data flow",
        "school CRM integrations India",
        "Meta ads for school admissions",
        "educational software API India",
        "sync lead data to school software",
        "automated lead capture for schools",
        "best school software for digital marketing",
        "school management system with API",
        "integrate WhatsApp with school software",
        "automated student data entry",
        "school administration automation tools",
        "CBSE school marketing automation",
        "ICSE school lead management sync",
        "reduce manual data entry in schools",
        "school software third party integrations",
        "educational SaaS integration India",
        "school admission funnel automation",
        "lead tracking for coaching centers",
        "best school software for lead conversion",
        "integrated school management system",
        "API based school software India",
        "school software for digital lead generation",
        "automated reporting for school ads",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/integration`,
        languages: {
            en: `${appUrl.origin}/features/integration`,
            'en-IN': `${appUrl.origin}/features/integration`,
            'x-default': `${appUrl.origin}/features/integration`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Seamless School Software Integrations | Automate Your Ecosystem | Shiksha Cloud",
        description: "Stop manual data entry. Sync Facebook Leads, Google Sheets, and WhatsApp in real-time. Grow your school admissions with automated data pipelines. Trusted by 1,200+ Indian institutions.",
        url: `${appUrl.origin}/features/integration`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-integration.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Software Integrations India",
            },
            {
                url: `${appUrl.origin}/og-image-integration-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Integration Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Software Integrations India | Sync Ads & Leads | Shiksha Cloud",
        description: "Automate your school's data flow. Sync Facebook, Google Sheets, and WhatsApp in real-time. Trusted by 1,200+ Indian institutions.",
        images: [
            `${appUrl.origin}/og-image-integration.png`,
            `${appUrl.origin}/twitter-card-integration.png`,
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
    "name": "Shiksha Cloud - Integration Hub",
    "alternateName": "Shiksha Cloud School Integrations",
    "description": "Centralized integration hub for Indian schools to connect Facebook Ads, Google Sheets, WhatsApp, and other third-party tools to automate admission and administration workflows.",
    "url": `${appUrl.origin}/features/integration`,
    "image": `${appUrl.origin}/og-image-integration.png`,

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
        "description": "Starts at ₹79/student/month. Includes core integrations. Free trial available.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "84",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Rajesh Khanna" },
            "reviewBody": "The Facebook Ads integration changed how we do admissions. Leads flow instantly into our CRM.",
            "publisher": { "@type": "Organization", "name": "Modern Public School, Delhi" },
            "datePublished": "2024-11-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Sonia Mehra" },
            "reviewBody": "Syncing data to Google Sheets for our board reports is now a one-click process. Huge time saver.",
            "publisher": { "@type": "Organization", "name": "Global International Academy" },
            "datePublished": "2024-10-05",
        },
    ],

    "featureList": [
        "Real-time Facebook Lead Ads synchronization",
        "Two-way Google Sheets data sync",
        "Official WhatsApp Business API integration",
        "Automated lead distribution to admission staff",
        "Webhook support for custom third-party tools",
        "Integrated payment gateway connectors",
        "Automated data mapping and validation",
        "Cross-platform synchronization in real-time",
        "Unified dashboard for all connected apps",
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
        "audienceType": "School owners and administrators in India",
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
            "name": "What integrations does Shiksha Cloud support for Indian schools?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud provides a comprehensive set of integrations tailored for Indian schools, including Facebook Lead Ads for admission growth, Google Sheets for data portability, official WhatsApp Business API for communication, and various Indian payment gateways. We also support custom webhooks for schools using specialized third-party software.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the Facebook Ads integration help in school admissions?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "When a parent fills out a lead form on Facebook or Instagram, the data is instantly synced to the Shiksha Cloud lead management system. This eliminates manual CSV downloads and ensures your admission team can call the parent within seconds, significantly increasing conversion rates.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I sync my student data with Google Sheets automatically?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud offers a two-way synchronization with Google Sheets. You can export live reports, student lists, or lead trackers to a spreadsheet that updates in real-time, making it easy to share data with board members or external auditors without leaving the platform.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the WhatsApp integration compliant with Meta's policies?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. We use the official WhatsApp Business API, ensuring that your school's account is verified and compliant with Meta's policies. This prevents account banning and allows you to send high-volume, authenticated notifications to parents and students.",
            },
        },
        {
            "@type": "Question",
            "name": "Do integrations require a technical team to set up?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No technical team is required. Our integration hub is designed for school administrators. You simply select the app you want to connect, authenticate via OAuth (log in), and map your fields. Our support team is also available to help you with the initial setup via a quick Zoom call.",
            },
        },
        {
            "@type": "Question",
            "name": "How secure is the data transfer between Shiksha Cloud and third-party apps?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We employ industry-standard AES-256 encryption for all data in transit and at rest. All integrations use secure OAuth 2.0 protocols, meaning we never store your third-party passwords. Data transfers are logged and audited to ensure complete security and privacy.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I integrate my existing payment gateway with the system?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud integrates seamlessly with leading Indian payment gateways like Razorpay, Cashfree, and PayU. This allows you to collect fees online and have the payment status automatically updated in the student's fee ledger in real-time.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the integration work with existing legacy school software?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "While we cannot integrate with every proprietary legacy system, we provide robust CSV/Excel import/export tools and a REST API that allows your existing software to push or pull data from Shiksha Cloud, facilitating a smooth transition to our modern platform.",
            },
        },
        {
            "@type": "Question",
            "name": "How do I track lead conversion from integrated ad campaigns?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our integration hub tags every lead with its source (e.g., 'FB_Ads_Campaign_June'). In the lead management dashboard, you can see exactly which ad campaigns are producing the highest quality leads and which ones are converting into actual admissions, allowing you to optimize your marketing spend.",
            },
        },
        {
            "@type": "Question",
            "name": "Are there any additional costs for enabling integrations?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Core integrations like Google Sheets and Facebook Lead Ads are included in our standard pricing. For the WhatsApp Business API, there may be per-message charges from Meta, which we handle transparently. We believe in honest pricing with no hidden 'integration fees'.",
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
            "name": "Integrations",
            "item": `${appUrl.origin}/features/integration`,
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
    "name": "How to Connect Your School's Ecosystem to Shiksha Cloud",
    "description": "A simple guide to automating your school's data flow using the Shiksha Cloud Integration Hub.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Access Integration Hub",
            "text": "Log into your Shiksha Cloud admin dashboard and navigate to the 'Integrations' section in the main menu.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Select Your App",
            "text": "Choose the service you want to connect, such as Facebook Lead Ads, Google Sheets, or WhatsApp Business API.",
        },
        {
            "@type": "HowToStep",
            "name": "Authenticate & Grant Access",
            "text": "Click 'Connect' and log into your third-party account to securely grant Shiksha Cloud permission to sync data.",
        },
        {
            "@type": "HowToStep",
            "name": "Map Data Fields",
            "text": "Match the fields from the external app (e.g., 'Full Name') to the corresponding fields in Shiksha Cloud (e.g., 'Student Name').",
        },
        {
            "@type": "HowToStep",
            "name": "Activate Sync",
            "text": "Enable the sync toggle. Your data will now flow in real-time between the platforms automatically.",
        },
    ],

    "totalTime": "PT15M",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Integration Suite",
    "description": "Automated synchronization hub for Facebook, Google, WhatsApp and other essential school tools.",
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
    "name": "Shiksha Cloud - School Software Integrations",
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

export default function IntegrationFeaturePage() {
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
            <IntegrationComponent />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Tools That Work With Our Integrations"
                />
            )}

            {/* Industry Links Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Powering Growth for Every Institution
                        </h2>
                        <p className="text-xl text-slate-600">
                            Automated data pipelines designed for every education segment
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
                                        See how integrations scale growth for {industry.replace(/-/g, ' ')}
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
                heading={<>Connect Your School's<br />Digital Ecosystem</>}
                description="Stop manual data entry and start growing. Sync your leads and communications in real-time."
            />
        </>
    );
}
