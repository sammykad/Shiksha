import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';
import HolidaysLanding from "@/components/website/features/holidays/HolidayLanding";

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'holidays';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Holiday & Calendar Management Software | Shiksha Cloud",
    description: "Centralize your academic calendar. Manage holidays, school events, and planned closures with instant notifications to parents and staff. Trusted by 1,200+ Indian schools.",
    keywords: [
        "school holiday management software",
        "digital academic calendar for schools",
        "school event scheduling software",
        "automated school holiday notifications",
        "school calendar app for parents",
        "manage school holidays online",
        "academic event planner for schools",
        "school closure notification system",
        "digital school diary software",
        "best calendar software for schools India",
        "school holiday list generator",
        "automated school event reminders",
        "school holiday management system price",
        "academic year planner for schools",
        "digital school events board",
        "CBSE school calendar management",
        "ICSE academic calendar software",
        "school holiday planner India",
        "coordinate school events digitally",
        "school holiday notifications WhatsApp",
        "centralized school event management",
        "school holiday management system Delhi",
        "school calendar software Mumbai",
        "academic event tracking for schools",
        "school holiday software Bangalore",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/holidays`,
        languages: {
            en: `${appUrl.origin}/features/holidays`,
            'en-IN': `${appUrl.origin}/features/holidays`,
            'x-default': `${appUrl.origin}/features/holidays`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Centralized School Calendar & Holiday Management | Shiksha Cloud",
        description: "Stop sending manual PDF holiday lists. Manage your entire academic year's events and holidays in one place with instant parent alerts. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/holidays`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-holidays.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Holiday Management Software India",
            },
            {
                url: `${appUrl.origin}/og-image-holidays-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Calendar Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Holiday Management System | Digital Calendar | Shiksha Cloud",
        description: "Centralize your academic calendar and automate holiday alerts. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-holidays.png`,
            `${appUrl.origin}/twitter-card-holidays.png`,
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
    "name": "Shiksha Cloud - Holiday & Calendar Management System",
    "alternateName": "Shiksha Cloud Calenda",
    "description": "Centralized academic calendar and holiday management software for Indian schools. Automated event scheduling and instant parent notifications.",
    "url": `${appUrl.origin}/features/holidays`,
    "image": `${appUrl.origin}/og-image-holidays.png`,

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
        "description": "Integrated with school management suite starting at ₹79/student/month.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.6",
        "reviewCount": "78",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Neeta Gupta" },
            "reviewBody": "No more confusion about holiday dates. Parents get instant alerts and the digital calendar is always up to date.",
            "publisher": { "@type": "Organization", "name": "Apex Public School" },
            "datePublished": "2024-11-05",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Suresh Menon" },
            "reviewBody": " Scheduling the annual sports day and coordinating with parents was so easy with the event management tool.",
            "publisher": { "@type": "Organization", "name": "Green Valley Academy" },
            "datePublished": "2024-10-12",
        },
    ],

    "featureList": [
        "Centralized digital academic calendar",
        "One-click holiday list generation",
        "Automated event scheduling and reminders",
        "Instant WhatsApp/SMS alerts for emergency closures",
        "Recurring event management (e.g., monthly meetings)",
        "Parent portal access to school calendar",
        "Internal staff event coordination",
        "Event-specific notification targeting",
        "Integration with attendance and exam schedules",
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
        "audienceType": "School administrators and coordinators in India",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does the digital academic calendar work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The digital academic calendar acts as a single source of truth for all school dates. Administrators can add holidays, planned events, and emergency closures. Once added, these dates are instantly reflected on the school's master calendar and synchronized with the Parent Portal, ensuring everyone is on the same page.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we send instant notifications for unplanned school closures?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! In case of emergency closures (e.g., heavy rain, public holidays), administrators can create an 'Emergency' event and trigger an instant WhatsApp/SMS blast to all parents and staff in seconds, preventing unnecessary travel to school.",
            },
        },
        {
            "@type": "Question",
            "name": "Do parents need to download a separate app to see the holiday list?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, parents can access the school calendar directly through the web-based Parent Portal or receive the holiday list as a neatly formatted PDF via WhatsApp. It's designed for maximum accessibility without forcing app installs.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we manage events for specific grades only?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. You can tag events to specific grades, sections, or the entire school. For example, a 'Grade 10 Board Practical' event will only be notified to and visible for Grade 10 parents and teachers.",
            },
        },
        {
            "@type": "Question",
            "name": "How do recurring events work in Shiksha Cloud?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "For events that happen regularly (e.g., First Saturday holiday, Monthly PTM), you can set them as 'Recurring'. The system will automatically populate the calendar for the entire year, eliminating the need for manual entry every month.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we coordinate staff meetings using the calendar?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the calendar supports internal events that are only visible to staff members. You can schedule faculty meetings, training sessions, and internal deadlines without cluttering the parent-facing calendar.",
            },
        },
        {
            "@type": "Question",
            "name": "Is it possible to export the holiday list to PDF?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, with one click, you can generate a professionally formatted annual holiday list in PDF format, which can be printed for notice boards or shared via WhatsApp groups.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the calendar integrate with other modules like attendance?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system automatically marks students as 'Holiday' in the attendance register on dates marked as holidays in the calendar, ensuring your attendance reports remain accurate without manual adjustments.",
            },
        },
        {
            "@type": "Question",
            "name": "How long does it take to set up the academic year calendar?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most schools set up their entire year's planned holidays and events in under 30 minutes using our intuitive calendar interface. Our support team can even help you import your existing calendar from Excel.",
            },
        },
        {
            "@type": "Question",
            "name": "What is the cost of the holiday management module?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Holiday management is included in the Shiksha Cloud core suite, starting at ₹79 per student per month. There are no separate charges for calendar management or event notifications.",
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
            "name": "Holiday Management",
            "item": `${appUrl.origin}/features/holidays`,
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
    "name": "How to Digitize Your School Calendar in 5 Steps",
    "description": "A guide to switching from paper notices to a dynamic digital academic calendar with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Plan Your Academic Year",
            "text": "Map out your planned holidays and key events for the year in the admin dashboard.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Configure Recurring Events",
            "text": "Set up recurring events like First Saturdays or monthly staff meetings to automate your calendar.",
        },
        {
            "@type": "HowToStep",
            "name": "Publish to Parent Portal",
            "text": "Make the calendar visible to parents so they can plan their family schedules around school events.",
        },
        {
            "@type": "HowToStep",
            "name": "Set Up Event Alerts",
            "text": "Configure WhatsApp and SMS triggers to notify parents automatically before a holiday or event.",
        },
        {
            "@type": "HowToStep",
            "name": "Manage Emergency Closures",
            "text": "Use the emergency alert system to notify parents of unplanned closures in seconds.",
        },
    ],

    "totalTime": "PT1H",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Holiday Management Module",
    "description": "Digital academic calendar and holiday scheduling software for educational institutions.",
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
    "name": "Shiksha Cloud - School Holiday Management System",
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

export default function HolidaysFeaturePage() {
    const relatedFeatures = getRelatedFeatures(FEATURE_SLUG, 3);
    const feature = FEATURES[FEATURE_SLUG];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />

            <HolidaysLanding />

            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Holiday Management"
                />
            )}

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Perfect for Your Institution Type
                        </h2>
                        <p className="text-xl text-slate-600">
                            Holiday management designed for every education segment
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
                                        See how holiday management works for {industry.replace(/-/g, ' ')}
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
                heading={<>Your School's Year<br />Perfectly Planned</>}
                description="Centralize your calendar, automate holiday alerts, and keep parents informed in real-time."
            />
        </>
    );
}
