import ParentPortalLanding from '@/components/website/features/parent-portal/ParentPortalLanding';
import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'parent-portal';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Parent Portal App India | Real-Time Student Tracking | Shiksha Cloud",
    description: "Empower parents with real-time access to attendance, fees, exam results & WhatsApp alerts. India's most loved parent-school communication portal. Trusted by 1,200+ schools.",
    keywords: [
        "school parent portal India",
        "best parent teacher communication app",
        "parent dashboard for schools",
        "real-time school updates for parents",
        "parent access school software",
        "school parent app India",
        "parent school management app",
        "school communication portal parents",
        "student tracking app for parents",
        "digital school diary for parents",
        "school fee payment portal for parents",
        "parent teacher meeting app",
        "school attendance alert for parents",
        "CBSE school parent portal",
        "ICSE school parent app",
        "how to track child progress in school",
        "paperless communication between school and parents",
        "reduce parent queries in schools",
        "school management software with parent app",
        "affordable parent portal for schools",
        "school parent app Delhi",
        "school parent portal Mumbai",
        "parent communication software Bangalore",
        "school management app Hyderabad",
        "parent tracking system Chennai schools",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/parent-portal`,
        languages: {
            en: `${appUrl.origin}/features/parent-portal`,
            'en-IN': `${appUrl.origin}/features/parent-portal`,
            'x-default': `${appUrl.origin}/features/parent-portal`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "School Parent Portal | Real-Time Student Tracking | Shiksha Cloud",
        description: "Stop the endless phone calls. Give parents real-time access to attendance, fees, results & WhatsApp alerts. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/parent-portal`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-parent-portal.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Parent Portal India",
            },
            {
                url: `${appUrl.origin}/og-image-parent-portal-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Parent App Interface",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "Parent Portal App India | Real-Time School Updates | Shiksha Cloud",
        description: "Real-time access to attendance, fees, results & WhatsApp alerts. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-parent-portal.png`,
            `${appUrl.origin}/twitter-card-parent-portal.png`,
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

const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Shiksha Cloud - Parent Communication Portal",
    "alternateName": "Shiksha Cloud Parent App",
    "description": "Comprehensive parent portal for Indian schools. Real-time access to child's attendance, fee status, exam results, and homework with instant WhatsApp alerts.",
    "url": `${appUrl.origin}/features/parent-portal`,
    "image": `${appUrl.origin}/og-image-parent-portal.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "Parent-Teacher Communication Software",

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
        "ratingValue": "4.8",
        "reviewCount": "1200",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Anjali Gupta" },
            "reviewBody": "Finally, I don't have to call the class teacher every day for attendance. The WhatsApp alerts are a lifesaver.",
            "publisher": { "@type": "Organization", "name": "DPS Bangalore" },
            "datePublished": "2024-11-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Rajesh Khanna" },
            "reviewBody": "Paying fees through the portal is so easy. I get the receipt instantly on my phone.",
            "publisher": { "@type": "Organization", "name": "St. Xavier's School" },
            "datePublished": "2024-12-05",
        },
    ],

    "featureList": [
        "Real-time attendance tracking with WhatsApp alerts",
        "Online fee payment & instant digital receipts",
        "Digital report cards and exam result access",
        "Homework and assignment tracking",
        "Unified dashboard for parents with multiple children",
        "School announcement and holiday calendar",
        "Direct communication channel with teachers",
        "Attendance history and monthly analysis",
        "Digital school diary and notice board",
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
        "audienceType": "Parents and guardians of students in Indian schools",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What can parents access through the Shiksha Cloud portal?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Parents get a 360-degree view of their child's school life, including real-time attendance, pending and paid fee status, exam marks, report cards, daily homework, and official school notices—all accessible from a single dashboard.",
            },
        },
        {
            "@type": "Question",
            "name": "How do parents receive attendance notifications?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "As soon as the teacher marks attendance in the classroom, a real-time notification is sent to the parent's registered WhatsApp number. This ensures parents know immediately if their child has reached school safely.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I manage multiple children in one parent account?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud supports multi-child linking. Parents can link all their children to one single account and switch between profiles effortlessly, receiving all notifications in one unified feed.",
            },
        },
        {
            "@type": "Question",
            "name": "Is it possible to pay school fees online through the portal?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The portal integrates with secure Indian payment gateways (UPI, Credit/Debit Cards, NetBanking). Parents can pay fees in one click and download the official payment receipt instantly.",
            },
        },
        {
            "@type": "Question",
            "name": "Do parents need a high-end smartphone to use the app?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The portal is designed to be lightweight and works on any Android or iOS smartphone, and can even be accessed via any mobile web browser without downloading an app.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the portal help in reducing parent-teacher conflicts?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "By providing a single source of truth for attendance, marks, and fees, the portal eliminates misunderstandings. Everything is logged and timestamped, reducing the need for repetitive queries and disputes.",
            },
        },
        {
            "@type": "Question",
            "name": "Can parents view their child's report cards digitally?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, digital report cards are uploaded by the school and are instantly available for parents to view and download in PDF format, eliminating the wait for physical copies.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the data in the parent portal secure?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, we use bank-grade encryption for all data. Only verified parents with secure login credentials can access their specific child's information, ensuring complete privacy and security.",
            },
        },
        {
            "@type": "Question",
            "name": "What happens if a parent loses access to their registered phone number?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Parents can request a mobile number update through the school administration. Once verified by the school, the account is seamlessly migrated to the new number.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the portal handle school holiday announcements?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Schools can push emergency or planned holiday notices to all parents instantly via the portal and WhatsApp, ensuring that information reaches every parent in seconds.",
            },
        },
    ],
};

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
            "name": "Parent Portal",
            "item": `${appUrl.origin}/features/parent-portal`,
        },
    ],
};

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

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Get Started with the Shiksha Cloud Parent Portal",
    "description": "A simple guide for parents to connect with their child's school using the Shiksha Cloud portal.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Receive Invitation",
            "text": "Get your login credentials via SMS or WhatsApp from your school administration.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "First-Time Login",
            "text": "Log in using your registered mobile number and secure password on the portal or app.",
        },
        {
            "@type": "HowToStep",
            "name": "Link Your Children",
            "text": "Verify and link all your children to your account using their unique Student IDs.",
        },
        {
            "@type": "HowToStep",
            "name": "Enable Notifications",
            "text": "Allow WhatsApp and App notifications to receive real-time attendance and fee alerts.",
        },
        {
            "@type": "HowToStep",
            "name": "Stay Connected",
            "text": "Check daily homework, view exam results, and pay fees with a single tap.",
        },
    ],

    "totalTime": "PT10M",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Parent Portal Module",
    "description": "Real-time parent-school communication portal with attendance tracking, fee payments, and WhatsApp alerts.",
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

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shiksha Cloud - Parent Portal",
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

export default function ParentPortalPage() {
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
            <ParentPortalLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Enhance Parent Engagement"
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
                            Parent communication tailored for every education segment
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
                                        See how the parent portal works for {industry.replace(/-/g, ' ')}
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
                heading={<>Keep Parents Connected<br />Without the Effort</>}
                description="One portal for attendance, fees, exam results, and announcements — with instant WhatsApp alerts for every parent."
            />
        </>
    );
}
