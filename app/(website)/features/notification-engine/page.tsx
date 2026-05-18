import NotificationEngineLanding from "@/components/website/features/notification-engine/NotificationEngineLanding";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "notification-engine";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best School Communication Software India | WhatsApp & SMS Notification Engine | Shiksha Cloud",
    description: "Instant, automated communication with parents and students. Multi-channel notifications via WhatsApp, SMS, Email, and Push. Reduce manual calling by 90%. Trusted by 1,200+ Indian schools.",
    keywords: [
        "school communication software India",
        "WhatsApp notification system for schools",
        "automated school SMS alerts",
        "best school notification engine",
        "multi-channel school communication",
        "school parent communication app",
        "automated fee reminders WhatsApp",
        "attendance alerts for parents India",
        "school emergency notification system",
        "bulk SMS for schools India",
        "digital school circulars",
        "school push notification system",
        "automated school alerts for parents",
        "school communication platform CBSE",
        "ICSE school notification software",
        "reduce school manual calling",
        "WhatsApp API for schools India",
        "school broadcast message system",
        "automated exam result notifications",
        "school holiday alerts WhatsApp",
        "best parent engagement software",
        "school communication tools India",
        "affordable school notification software",
        "school communication Delhi",
        "school SMS alerts Mumbai",
        "school WhatsApp system Bangalore",
        "notification engine for coaching centers",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/notification-engine`,
        languages: {
            en: `${appUrl.origin}/features/notification-engine`,
            'en-IN': `${appUrl.origin}/features/notification-engine`,
            'x-default': `${appUrl.origin}/features/notification-engine`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Instant School Communication | WhatsApp & SMS Automation | Shiksha Cloud",
        description: "Stop making hundreds of phone calls. Send instant, automated notifications for attendance, fees, and exams via WhatsApp and SMS. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/notification-engine`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-notification-engine.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best School Communication Software India",
            },
            {
                url: `${appUrl.origin}/og-image-notification-engine-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Notification Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Communication Software India | WhatsApp & SMS Engine | Shiksha Cloud",
        description: "Automate your school's communication. Send instant alerts for attendance, fees, and exams via WhatsApp and SMS. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-notification-engine.png`,
            `${appUrl.origin}/twitter-card-notification-engine.png`,
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
    "name": "Shiksha Cloud - Notification Engine",
    "alternateName": "Shiksha Cloud School Communication Hub",
    "description": "Enterprise-grade notification engine for Indian schools. Multi-channel delivery via WhatsApp Business API, SMS, Email, and Push notifications with automated trigger-based workflows.",
    "url": `${appUrl.origin}/features/notification-engine`,
    "image": `${appUrl.origin}/og-image-notification-engine.png`,

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
        "description": "Starts at ₹79/student/month. Includes full notification engine. Free trial available.",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "url": `${appUrl.origin}/pricing`,
    },

    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "210",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Rekha Sharma" },
            "reviewBody": "Our parent engagement has skyrocketed. WhatsApp alerts for attendance are loved by all parents.",
            "publisher": { "@type": "Organization", "name": "St. Xavier's High School" },
            "datePublished": "2024-12-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Amit Verma" },
            "reviewBody": "Fee collection improved by 40% after we started sending automated WhatsApp reminders.",
            "publisher": { "@type": "Organization", "name": "Global Public School" },
            "datePublished": "2024-11-25",
        },
    ],

    "featureList": [
        "Official WhatsApp Business API integration",
        "High-delivery SMS gateway with DND routing",
        "Real-time push notifications via FCM",
        "Automated trigger-based alerts (Attendance, Fees, Exams)",
        "Customizable message templates with dynamic variables",
        "Bulk broadcast messaging for school-wide alerts",
        "Delivery and read receipts for critical notifications",
        "Multi-language support for regional communication",
        "Scheduling and queuing for peak-hour management",
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
        "audienceType": "School administrators and communication heads in India",
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
            "name": "What is a school notification engine?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A school notification engine is a centralized system that automates the delivery of critical information from the school to parents, students, and staff. Instead of manual calls or emails, it uses automated triggers to send instant alerts via WhatsApp, SMS, and Push notifications, ensuring 100% reach and visibility.",
            },
        },
        {
            "@type": "Question",
            "name": "Which communication channels does Shiksha Cloud support?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Shiksha Cloud supports a multi-channel approach to ensure no message is missed. We provide official WhatsApp Business API integration, high-reliability SMS gateways, email delivery, and real-time mobile push notifications. The system can be configured to send the same alert across multiple channels for critical updates.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the automated WhatsApp notification system work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The system is linked to your school's data. When a specific event occurs—such as a teacher marking a student 'Absent'—the notification engine automatically triggers a pre-approved WhatsApp template, filling in the student's name and class, and sends it instantly to the registered parent's phone number.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I send bulk notifications to all parents at once?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the 'Broadcast' feature allows you to send school-wide announcements (like holiday notices or emergency closures) to all parents or specific groups (like only Grade 10 parents) in a few clicks. We handle the queuing and delivery to prevent system overload.",
            },
        },
        {
            "@type": "Question",
            "name": "Are notifications based on triggers (e.g., attendance, fee dues)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, this is the core strength of our engine. You can set up triggers for: 1. Attendance (Absent/Late), 2. Fee Dues (Before/On/After due date), 3. Exam Results (Published), 4. Homework/Assignment Uploads, and 5. Emergency alerts. Everything happens automatically without manual intervention.",
            },
        },
        {
            "@type": "Question",
            "name": "How do I ensure my messages are delivered and read?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "For WhatsApp and Push notifications, we provide real-time delivery and read receipts. For SMS, we provide delivery reports (DLR). This allows school administrators to identify which parents are not receiving messages and follow up with them via alternative channels.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the notification system compliant with DND (Do Not Disturb) regulations?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, we use transactional routing for our SMS gateways, which ensures that critical school alerts (like attendance or emergency notices) are delivered even to numbers registered on the National Do Not Call (NDNC) registry in India.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I schedule notifications for a future date and time?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. You can draft an announcement and schedule it for a specific time and date. For example, you can schedule a reminder for a Parent-Teacher Meeting (PTM) to go out exactly 24 hours before the event.",
            },
        },
        {
            "@type": "Question",
            "name": "Do parents have a way to opt-out of certain notifications?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "While critical administrative alerts (attendance/fees) are mandatory, parents can manage their preferences for general school updates or newsletters through the parent portal, ensuring they only receive the information they find most valuable.",
            },
        },
        {
            "@type": "Question",
            "name": "How does this reduce the workload for school administrators?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "By automating routine communications, we eliminate the need for staff to spend hours making phone calls or sending individual SMS. This saves an estimated 15-20 hours of staff time per week and drastically reduces the volume of repetitive inquiries at the school front desk.",
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
            "name": "Notification Engine",
            "item": `${appUrl.origin}/features/notification-engine`,
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
    "name": "How to Automate Your School's Communication",
    "description": "A simple guide to setting up the Shiksha Cloud Notification Engine for instant parent engagement.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Communication Channels",
            "text": "Enable WhatsApp, SMS, and Push notifications in your settings. Connect your WhatsApp Business API account for verified messaging.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Create Message Templates",
            "text": "Draft your notifications using dynamic variables (e.g., {student_name}, {due_amount}). Get your WhatsApp templates approved by Meta.",
        },
        {
            "@type": "HowToStep",
            "name": "Set Up Trigger-Based Automation",
            "text": "Link templates to events. For example: 'When student is absent' -> 'Send Attendance Alert Template'.",
        },
        {
            "@type": "HowToStep",
            "name": "Schedule Bulk Announcements",
            "text": "Use the broadcast tool to send newsletters, holiday notices, or PTM reminders to specific grades or the entire school.",
        },
        {
            "@type": "HowToStep",
            "name": "Monitor Delivery Analytics",
            "text": "Track delivery rates and read receipts in the communication dashboard to ensure all parents are informed.",
        },
    ],

    "totalTime": "PT30M",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Notification Suite",
    "description": "Multi-channel automated communication engine for schools with WhatsApp, SMS, and Push integration.",
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
    "name": "Shiksha Cloud - School Communication Software",
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

export default function NotificationEngineFeaturePage() {
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
            <NotificationEngineLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Sync With Our Notification Engine"
                />
            )}

            {/* Industry Links Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Stay Connected with Every Institution
                        </h2>
                        <p className="text-xl text-slate-600">
                            Automated communication tailored for every education segment
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
                                        See how notification automation works for {industry.replace(/-/g, ' ')}
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
                heading={<>Automate Your School's<br />Communications</>}
                description="Stop manual calling. Send instant, reliable notifications that parents actually read."
            />
        </>
    );
}
