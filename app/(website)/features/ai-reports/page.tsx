import AIReportsLanding from "@/components/website/features/ai-reports/AIReportsLanding";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "ai-reports";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "AI School Reports & Analytics India | Automated Report Cards | Shiksha Cloud",
    description: "Transform school data into actionable insights. AI-powered automated report cards, student performance analytics, and institutional health dashboards. Reduce reporting time by 90%. Trusted by 1,200+ Indian schools.",
    keywords: [
        "AI school reports India",
        "automated report card software for schools",
        "school performance analytics software",
        "AI student analytics India",
        "automated school grading system",
        "student progress tracking AI",
        "institutional analytics for schools",
        "digital report card generator India",
        "AI based student evaluation",
        "school data analytics platform",
        "automated academic reports school",
        "predictive analytics for student success",
        "CBSE report card automation",
        "ICSE automated grading software",
        "school management analytics India",
        "AI report cards for K-12 schools",
        "school performance dashboards",
        "student learning gap analysis AI",
        "automated teacher performance reports",
        "digital academic transcripts India",
        "school analytics software price",
        "best AI reporting tool for schools",
        "school data visualization software",
        "institutional growth analytics",
        "educational data mining India",
        "AI analytics for coaching centers",
        "automated result processing software",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/ai-reports`,
        languages: {
            en: `${appUrl.origin}/features/ai-reports`,
            'en-IN': `${appUrl.origin}/features/ai-reports`,
            'x-default': `${appUrl.origin}/features/ai-reports`,
        },
    },

    category: "education",
    classification: "School Analytics Software",

    openGraph: {
        title: "AI-Powered School Reports | Save 90% Reporting Time | Shiksha Cloud",
        description: "Stop spending weeks on manual report cards. Generate AI-driven student performance reports in seconds. Real-time institutional analytics for smarter decision making. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/ai-reports`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-ai-reports.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - AI School Reports and Analytics India",
            },
            {
                url: `${appUrl.origin}/og-image-ai-reports-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud AI Analytics Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "AI School Reports India | Automated Performance Analytics | Shiksha Cloud",
        description: "Reduce reporting time by 90% with AI-powered automated report cards and institutional analytics. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-ai-reports.png`,
            `${appUrl.origin}/twitter-card-ai-reports.png`,
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
    "name": "Shiksha Cloud - AI Reports & Analytics System",
    "alternateName": "Shiksha Cloud AI Analytics",
    "description": "AI-powered reporting and analytics system for Indian schools. Automated report card generation, student performance prediction, and institutional health dashboards. Saves thousands of teacher hours.",
    "url": `${appUrl.origin}/features/ai-reports`,
    "image": `${appUrl.origin}/og-image-ai-reports.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "School Analytics Software",

    "operatingSystem": ["Web", "Android", "iOS", "PWA"],
    "softwareVersion": "3.0",

    "offers": {
        "@type": "Offer",
        "price": "79",
        "priceCurrency": "INR",
        "priceUnit": "per student per month",
        "billingPeriod": "P1M",
        "description": "Starts at ₹79/student/month. No setup fees. Free trial available.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "142",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Dr. Anjali Mehta" },
            "reviewBody": "The AI report card generation is a game-changer. What took us 3 weeks now takes 3 minutes.",
            "publisher": { "@type": "Organization", "name": "Delhi Public School" },
            "datePublished": "2024-12-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Rajesh Iyer" },
            "reviewBody": "The performance analytics helped us identify learning gaps in 4th grade early. Incredible tool.",
            "publisher": { "@type": "Organization", "name": "The Heritage School" },
            "datePublished": "2024-11-05",
        },
    ],

    "featureList": [
        "Automated AI report card generation (CBSE/ICSE/State Board formats)",
        "Student performance predictive analytics",
        "Institutional health and growth dashboards",
        "Automated learning gap analysis",
        "Teacher performance and effectiveness reports",
        "One-click academic transcript generation",
        "Comparative analysis across sections and grades",
        "Parent-teacher meeting (PTM) insight summaries",
        "Customizable reporting templates for Indian boards",
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
        "audienceType": "School administrators and principals in India",
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
            "name": "How does AI-powered report card generation work in schools?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud AI analyzes grades, attendance, and behavioral data to automatically generate comprehensive report cards. It creates personalized comments for each student based on their performance trends, ensuring that report cards are not just numbers but provide meaningful feedback. This eliminates the manual writing of hundreds of comments by teachers.",
            },
        },
        {
            "@type": "Question",
            "name": "Can AI reports handle different Indian education boards like CBSE and ICSE?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our system includes pre-built templates for all major Indian boards including CBSE, ICSE, IGCSE, and various State Boards. The AI automatically adjusts the grading scales and report formats to match the specific requirements of the board, ensuring 100% compliance with government and board mandates.",
            },
        },
        {
            "@type": "Question",
            "name": "How much time does the AI reporting system save teachers?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "On average, schools report a 90% reduction in the time spent on end-of-term reporting. What typically takes a teacher 2-3 weeks of manual data entry and comment writing is reduced to a few clicks. Teachers can review, edit, and finalize an entire class's report cards in under an hour.",
            },
        },
        {
            "@type": "Question",
            "name": "What is 'Learning Gap Analysis' in AI school reports?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Learning Gap Analysis uses AI to compare a student's actual performance against the expected learning outcomes for their grade. The system highlights specific topics or skills where a student is struggling, allowing teachers to implement targeted remedial classes and personalized learning paths before the final exams.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the system provide institutional health dashboards for principals?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, principals get a high-level institutional dashboard that tracks overall school performance. This includes grade distribution across the school, teacher effectiveness metrics, student retention trends, and comparative performance between different sections, helping in data-driven decision making.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the AI reporting system secure and compliant with data privacy laws?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. We follow strict data encryption standards and ensure that student data is handled with the highest privacy. Access to reports is role-based, meaning only authorized teachers and administrators can view sensitive performance data, ensuring compliance with Indian educational data guidelines.",
            },
        },
        {
            "@type": "Question",
            "name": "How do parents access these AI-generated reports?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Reports are delivered instantly to parents via the Shiksha Cloud Parent Portal and can be shared as secure PDFs via WhatsApp. Parents receive a summary of their child's strengths and areas for improvement, along with AI-suggested tips for home-based support.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we customize the report card templates?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, while we provide board-compliant templates, schools can add their own logos, custom branding, and additional sections for extracurricular achievements, behavioral remarks, and teacher signatures to make the reports uniquely theirs.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the system support predictive analytics for board exam results?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the AI analyzes historical performance data and current test scores to predict likely board exam outcomes. It flags 'at-risk' students who may need extra support, allowing schools to intervene early and improve overall pass percentages.",
            },
        },
        {
            "@type": "Question",
            "name": "How does Shiksha Cloud AI Reports compare to traditional excel-based reporting?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Unlike Excel, which is prone to manual errors and is time-consuming, Shiksha Cloud AI automates the entire pipeline from marks entry to final report generation. It provides visual analytics, predictive insights, and instant delivery, transforming reporting from a chore into a strategic tool for student success.",
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
            "name": "AI Reports & Analytics",
            "item": `${appUrl.origin}/features/ai-reports`,
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
    "name": "How to Automate Your School Reporting in 24 Hours",
    "description": "A step-by-step guide to switching from manual report cards to AI-powered automated reporting with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Connect Your Data",
            "text": "Import your existing student and marks data via CSV/Excel. Our AI maps the fields automatically to ensure a seamless transition.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Select Board Template",
            "text": "Choose your board (CBSE, ICSE, etc.) and customize the template with your school's logo and branding.",
        },
        {
            "@type": "HowToStep",
            "name": "Run AI Analysis",
            "text": "Let the AI analyze the marks and generate personalized comments and performance insights for every student.",
        },
        {
            "@type": "HowToStep",
            "name": "Review and Finalize",
            "text": "Teachers can quickly review the AI-generated comments and make any manual adjustments if needed.",
        },
        {
            "@type": "HowToStep",
            "name": "Instant Distribution",
            "text": "Publish report cards instantly to the Parent Portal and send secure PDF links via WhatsApp.",
        },
    ],

    "totalTime": "PT24H",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud AI Reports Module",
    "description": "AI-powered automated report cards and institutional analytics for Indian schools.",
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
    "name": "Shiksha Cloud - AI School Reports",
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

export default function AIReportsFeaturePage() {
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
            <AIReportsLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement AI Reporting"
                />
            )}

            {/* Industry Links Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Perfect for Your Institution Type
                        </h2>
                        <p className="text-xl text-slate-600">
                            AI analytics designed for every education segment
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
                                        See how AI reporting works for {industry.replace(/-/g, ' ')}
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
                heading={<>AI-Powered Reports<br />In Seconds</>}
                description="Reduce reporting time by 90%, eliminate manual errors, and provide parents with deep, AI-driven insights into student success."
            />
        </>
    );
}
