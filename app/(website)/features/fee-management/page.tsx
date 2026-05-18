import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';
import FeeManagementLanding from "@/components/website/features/fee-management/FeeManagementLanding";

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'fee-management';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Fee Management Software India | Automated Fee Collection | Shiksha Cloud",
    description: "Reduce fee defaults by 40% with automated reminders, online UPI payments, and instant digital receipts. Professional fee management for Indian schools and colleges.",
    keywords: [
        "school fee management software India",
        "best fee collection software for schools",
        "online fee payment system for schools",
        "automated fee reminder software",
        "school fee receipt generator",
        "digital fee management for colleges",
        "UPI fee payment integration for schools",
        "school fee tracking software",
        "automated fee reconciliation software",
        "school fee management system price",
        "digital fee register for schools",
        "fee management software with WhatsApp alerts",
        "school tuition fee management software",
        "automated fee invoicing for schools",
        "fee collection app for schools",
        "best fee software for CBSE schools",
        "online fee portal for parents",
        "school fee management system Delhi",
        "school fee software Mumbai",
        "automated fee reminders for parents",
        "school fee management software cost",
        "fee tracking for coaching centers",
        "integrated fee management system",
        "paperless fee collection India",
        "school fee management system Bangalore",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/fee-management`,
        languages: {
            en: `${appUrl.origin}/features/fee-management`,
            'en-IN': `${appUrl.origin}/features/fee-management`,
            'x-default': `${appUrl.origin}/features/fee-management`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Automated School Fee Collection | Zero Defaults | Shiksha Cloud",
        description: "Stop chasing parents for fees. Automate invoices, reminders, and UPI payments. Get instant digital receipts and 100% transparent fee tracking. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/fee-management`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-fee-management.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Fee Management Software India",
            },
            {
                url: `${appUrl.origin}/og-image-fee-management-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Fee Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Fee Management System | Online Collection | Shiksha Cloud",
        description: "Automate fee reminders and UPI payments. Reduce defaults by 40%. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-fee-management.png`,
            `${appUrl.origin}/twitter-card-fee-management.png`,
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
    "name": "Shiksha Cloud - Fee Management System",
    "alternateName": "Shiksha Cloud FeeSense",
    "description": "Comprehensive online fee collection and management software for Indian schools. Automated UPI payments, WhatsApp reminders, and instant digital receipts.",
    "url": `${appUrl.origin}/features/fee-management`,
    "image": `${appUrl.origin}/og-image-fee-management.png`,

    "applicationCategory": "https://schema.org/FinancialApplication",
    "applicationSubCategory": "Education Billing Software",

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
        "ratingValue": "4.8",
        "reviewCount": "156",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Kavita Sharma" },
            "reviewBody": "Our fee defaults dropped by 35% within the first three months. The WhatsApp reminders are incredibly effective.",
            "publisher": { "@type": "Organization", "name": "Global International School" },
            "datePublished": "2024-12-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "R. S. Prasad" },
            "reviewBody": "Parents love the UPI payment option. No more long queues at the school office every month.",
            "publisher": { "@type": "Organization", "name": "City Public School" },
            "datePublished": "2024-11-25",
        },
    ],

    "featureList": [
        "Automated fee structure and invoice generation",
        "Integrated UPI, Credit Card, and NetBanking payments",
        "Automated WhatsApp and SMS fee reminders",
        "Instant digital fee receipts sent to parents",
        "Real-time fee collection analytics dashboard",
        "Partial payment and installment tracking",
        "Scholarship and concession management",
        "Automated overdue list generation",
        "Seamless integration with accounting software",
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
        "audienceType": "School accountants and administrators in India",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does the automated fee reminder system work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The system automatically identifies students with pending dues based on your fee schedule. It then sends personalized reminders via WhatsApp and SMS to parents at scheduled intervals (e.g., 5 days before the due date, on the due date, and every 3 days after). Each reminder includes a direct UPI payment link for instant settlement.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we accept payments via UPI, Credit Cards, and NetBanking?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud integrates with India's leading payment gateways. Parents can pay fees using any UPI app (Google Pay, PhonePe, Paytm), all major Indian credit/debit cards, and net banking, ensuring a frictionless payment experience.",
            },
        },
        {
            "@type": "Question",
            "name": "How are digital receipts generated and delivered?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The moment a payment is successfully processed, the system generates a professional, digitally signed fee receipt. This receipt is instantly sent to the parent's registered WhatsApp number and email, and it's also available for download in the Parent Portal.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we manage fee concessions and scholarships?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system allows administrators to apply percentage-based or flat-amount concessions to individual students or groups. These adjustments are automatically reflected in the invoices and receipts, ensuring complete transparency.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the software support installment-based fee payments?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. You can define fee structures with multiple installments (e.g., Quarterly or Monthly). The system tracks payments against each installment and automatically notifies parents when the next one is due.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the fee reconciliation process work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud automates reconciliation by instantly matching online payments with student profiles. For offline payments (cash/cheque), the accountant can mark them as 'Paid' in the system, and the digital receipt is triggered immediately.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we generate reports on total outstanding fees?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system provides a real-time dashboard showing total fees collected, total outstanding, and a detailed list of defaulters. You can export these reports to Excel or PDF for management reviews.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the fee management system secure for financial transactions?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We use PCI-DSS compliant payment gateways to ensure that no sensitive card data is stored on our servers. All transactions are encrypted using industry-standard SSL/TLS, providing a secure environment for both schools and parents.",
            },
        },
        {
            "@type": "Question",
            "name": "Can parents view their entire fee history?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, parents have access to a dedicated 'Fee Ledger' in the Parent Portal. They can view all past payments, pending dues, and download all previous receipts in one place.",
            },
        },
        {
            "@type": "Question",
            "name": "What is the cost of the fee management module?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Fee management is a core part of the Shiksha Cloud suite, starting at ₹79 per student per month. This includes the automation engine, payment gateway integration, and the parent payment portal.",
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
            "name": "Fee Management",
            "item": `${appUrl.origin}/features/fee-management`,
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
    "name": "How to Digitize Your School's Fee Collection in 5 Steps",
    "description": "A guide to moving from manual fee registers to automated online collection with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Set Fee Structure",
            "text": "Define your tuition fees, transport fees, and other charges for each grade and category in the dashboard.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Generate Invoices",
            "text": "The system automatically creates invoices for all students based on the defined structure.",
        },
        {
            "@type": "HowToStep",
            "name": "Activate Online Payments",
            "text": "Integrate your payment gateway to allow parents to pay via UPI, cards, and net banking.",
        },
        {
            "@type": "HowToStep",
            "name": "Automate Reminders",
            "text": "Set up WhatsApp and SMS reminders to automatically notify parents of upcoming and overdue fees.",
        },
        {
            "@type": "HowToStep",
            "name": "Instant Reconciliation",
            "text": "Watch your accounts reconcile in real-time as payments are received and receipts are issued automatically.",
        },
    ],

    "totalTime": "PT24H",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Fee Management Module",
    "description": "Automated fee collection, online payments, and fee tracking software for educational institutions.",
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
    "name": "Shiksha Cloud - School Fee Management System",
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

export default function FeeManagementFeaturePage() {
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

            <FeeManagementLanding />

            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Fee Management"
                />
            )}

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Perfect for Your Institution Type
                        </h2>
                        <p className="text-xl text-slate-600">
                            Fee management designed for every education segment
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
                                        See how fee management works for {industry.replace(/-/g, ' ')}
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
                heading={<>Zero Fee Defaults<br />100% Digital Collection</>}
                description="Stop chasing parents for fees. Automate reminders, UPI payments, and digital receipts in one click."
            />
        </>
    );
}
