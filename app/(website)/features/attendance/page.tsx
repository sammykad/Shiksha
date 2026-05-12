import AttendanceLanding from "@/components/website/features/attendance/AttendanceLanding";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "attendance";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Attendance System India | 2-Tap Digital Attendance | Shiksha Cloud",
    description: "Save 20 minutes daily with AI-powered 2-tap attendance system. Real-time WhatsApp alerts to parents, RFID/biometric support, automated reports. Trusted by 1,200+ CBSE, ICSE & State Board schools across India.",
    keywords: [
        "school attendance system India",
        "best attendance software for schools",
        "digital attendance system for schools",
        "school attendance management software",
        "automated attendance tracking schools",
        "2-tap attendance marking",
        "WhatsApp attendance notification school",
        "RFID attendance system school India",
        "biometric attendance school",
        "parent alert attendance system",
        "school attendance software with SMS alerts",
        "online attendance register for schools",
        "digital attendance app for teachers",
        "attendance management system with reports",
        "CBSE school attendance software",
        "ICSE school attendance system",
        "how to track school attendance digitally",
        "paperless attendance system for schools",
        "reduce manual attendance work",
        "attendance automation for schools India",
        "school attendance software price India",
        "best attendance system for CBSE schools",
        "affordable attendance management software",
        "school attendance system Delhi",
        "school attendance software Mumbai",
        "attendance system for schools Bangalore",
        "school management software Hyderabad",
        "attendance tracking Chennai schools",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/attendance`,
        languages: {
            en: `${appUrl.origin}/features/attendance`,
            'en-IN': `${appUrl.origin}/features/attendance`,
            'x-default': `${appUrl.origin}/features/attendance`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "2-Tap School Attendance System | Save 20 Min Daily | Shiksha Cloud",
        description: "Stop wasting 20 minutes on paper registers. Save 2.5 hours daily per teacher with AI-powered attendance, real-time WhatsApp alerts, and automated reports. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/attendance`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-attendance.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Attendance System India",
            },
            {
                url: `${appUrl.origin}/og-image-attendance-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Attendance App Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Attendance System India | 2-Tap Digital Tracking | Shiksha Cloud",
        description: "Save 20 min daily with AI-powered 2-tap attendance. WhatsApp alerts to parents, automated reports. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-attendance.png`,
            `${appUrl.origin}/twitter-card-attendance.png`,
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
    "name": "Shiksha Cloud - Attendance Management System",
    "alternateName": "Shiksha Cloud Attendance System",
    "description": "AI-powered 2-tap digital attendance system for Indian schools. Real-time WhatsApp parent notifications, RFID/biometric support, automated reports. Saves 20 minutes daily per teacher.",
    "url": `${appUrl.origin}/features/attendance`,
    "image": `${appUrl.origin}/og-image-attendance.png`,

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
        "description": "Starts at ₹79/student/month. No setup fees. Free trial available.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Sunita Reddy" },
            "reviewBody": "We save 25 minutes every single morning. Teachers love it.",
            "publisher": { "@type": "Organization", "name": "KV No. 1 Hyderabad" },
            "datePublished": "2024-12-15",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "P.K. Sharma" },
            "reviewBody": "Parent queries dropped 80% after WhatsApp alerts started.",
            "publisher": { "@type": "Organization", "name": "Ryan International" },
            "datePublished": "2024-11-20",
        },
    ],

    "featureList": [
        "2-tap digital attendance marking (under 10 seconds for 60 students)",
        "Real-time WhatsApp SMS alerts to parents",
        "RFID and biometric device integration",
        "Automated daily/weekly/monthly reports",
        "Late arrival tracking with reason logging",
        "Monthly attendance analytics dashboard",
        "Export to Excel/PDF for compliance",
        "Multi-branch attendance management",
        "Parent portal with attendance history",
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
        "audienceType": "School teachers and administrators in India",
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
            "name": "How does the 2-tap attendance system work in schools?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The 2-tap attendance system allows teachers to mark attendance in just two taps. First tap marks the student as present, second tap opens options for late arrival or absent with reason. Teachers can mark attendance for an entire class of 60 students in under 10 seconds. The system works on any smartphone, tablet, or computer - no special hardware needed.",
            },
        },
        {
            "@type": "Question",
            "name": "How much time does the attendance system save per day?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our 2-tap digital attendance system saves teachers approximately 20 minutes daily compared to traditional paper registers. Over a month, this translates to roughly 8+ hours saved per teacher. Additionally, it eliminates the need for manual register maintenance, monthly tallying, and report generation.",
            },
        },
        {
            "@type": "Question",
            "name": "Do parents receive instant notifications when attendance is marked?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Parents receive instant WhatsApp notifications as soon as attendance is marked. Schools report an 80% reduction in parent queries about attendance after implementing our system. Parents can also view their child's attendance history and monthly reports through our parent portal.",
            },
        },
        {
            "@type": "Question",
            "name": "What boards and school types is the attendance system compatible with?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud attendance system is compatible with all major education boards in India including CBSE, ICSE, State Boards (UP, Maharashtra, Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, Telangana), and international boards like IB and Cambridge. It works for K-12 schools, colleges, coaching institutes, and tuition centers.",
            },
        },
        {
            "@type": "Question",
            "name": "Is any hardware or equipment required for the attendance system?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No hardware is required to get started - the system works on any smartphone, tablet, or computer with internet access. Optional RFID and biometric integration is available for schools that want additional attendance verification methods, but this is completely optional.",
            },
        },
        {
            "@type": "Question",
            "name": "How much does school attendance software cost in India?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud offers attendance tracking starting at just ₹79 per student per month with no setup fees or hidden costs. This includes 2-tap marking, WhatsApp alerts, automated reports, and parent portal access. Pricing scales with school size, and a free trial is available.",
            },
        },
        {
            "@type": "Question",
            "name": "How long does it take to implement the attendance system in a school?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud can be implemented in just 24 hours. Most schools go live within the same day. Our setup team helps import student data via Excel/CSV, configure classes and sections, and train teachers - all without disrupting daily operations. No IT expertise required.",
            },
        },
        {
            "@type": "Question",
            "name": "Can the attendance system generate compliance reports for government requirements?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system automatically generates government-compliant attendance reports in PDF and Excel formats. Reports include daily attendance registers, monthly summaries, annual reports, and late arrival analytics - all exportable for audit and compliance purposes.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the attendance system handle multiple branches or campuses?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud supports multi-branch management with a single dashboard. Administrators can view attendance across all branches, generate comparative reports, and manage permissions for each campus separately. Each branch maintains its own attendance records while being centrally managed.",
            },
        },
        {
            "@type": "Question",
            "name": "What makes Shiksha Cloud attendance system better than other school software?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud is built specifically for Indian schools with features like Hindi language support, WhatsApp notifications (India's most used messaging app), UPI payment integration, and compliance with Indian education board requirements. With 1,200+ schools and 150,000+ students using the platform, it offers proven reliability and dedicated Indian customer support.",
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
            "name": "Attendance Management",
            "item": `${appUrl.origin}/features/attendance`,
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
    "name": "How to Digitize Your School Attendance in 24 Hours",
    "description": "A step-by-step guide to switching from paper registers to digital attendance tracking with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Sign Up for Free Trial",
            "text": "Register your school on Shiksha Cloud and get started with a free trial. No credit card required.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Import Student Data",
            "text": "Upload your student list using Excel or CSV. Our team helps you organize classes and sections.",
        },
        {
            "@type": "HowToStep",
            "name": "Configure Classes",
            "text": "Set up your class sections, subjects, and assign class teachers in the dashboard.",
        },
        {
            "@type": "HowToStep",
            "name": "Train Teachers (15 minutes)",
            "text": "Walk your teachers through the 2-tap attendance process. They'll be ready in 15 minutes.",
        },
        {
            "@type": "HowToStep",
            "name": "Go Live",
            "text": "Start marking attendance digitally from the next morning. Monitor results in real-time.",
        },
    ],

    "totalTime": "PT24H",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Attendance Module",
    "description": "Digital attendance tracking with 2-tap marking, WhatsApp alerts, and automated reports.",
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
    "name": "Shiksha Cloud - School Attendance System",
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

export default function AttendanceFeaturePage() {
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
            <AttendanceLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Attendance Tracking"
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
                            Attendance tracking designed for every education segment
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
                                        See how attendance management works for {industry.replace(/-/g, ' ')}
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
                heading={<>Attendance Tracking<br />That Just Works</>}
                description="Mark attendance in seconds, notify parents instantly, and keep compliance reports audit-ready."
            />
        </>
    );
}