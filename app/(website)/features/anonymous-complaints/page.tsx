import AnonymousComplaintsLanding from "@/components/website/features/anonymous-complaints/AnonymousComplaintsLanding";
import { Metadata } from "next";
import { RelatedFeatures } from "@/components/website/features/RelatedFeatures";
import { getRelatedFeatures, FEATURES } from "@/lib/features-config";
import { CallToAction } from '@/components/website/shared/CallToAction';
import Link from "next/link";

const appUrl = new URL("https://shiksha.cloud");
const FEATURE_SLUG = "anonymous-complaints";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Safe Anonymous Complaint System for Schools | Student Safety | Shiksha Cloud",
    description: "Ensure student safety and mental wellbeing with a secure, anonymous reporting system. POSH and POCSO compliant grievance redressal for Indian schools and colleges. Trusted by 1,200+ institutions.",
    keywords: [
        "anonymous complaint system for schools",
        "student safety reporting software",
        "school grievance redressal system",
        "anonymous reporting tool for students",
        "POSH compliance software for schools",
        "POCSO guidelines reporting tool",
        "school bullying reporting system",
        "safe reporting for students India",
        "student wellbeing software",
        "campus safety management system",
        "anonymous feedback tool for students",
        "school mental health reporting",
        "safe space for students India",
        "college grievance portal anonymous",
        "institutional safety audit software",
        "student harassment reporting tool",
        "secure student reporting channel",
        "school safety compliance India",
        "educational institution grievance system",
        "anti-bullying software for schools",
        "student voice platform India",
        "anonymous complaint portal for colleges",
        "student welfare management system",
        "safe school environment software",
        "grievance redressal for students",
        "school safety protocols software",
        "campus wellbeing reporting tool",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/anonymous-complaints`,
        languages: {
            en: `${appUrl.origin}/features/anonymous-complaints`,
            'en-IN': `${appUrl.origin}/features/anonymous-complaints`,
            'x-default': `${appUrl.origin}/features/anonymous-complaints`,
        },
    },

    category: "education",
    classification: "Student Safety Software",

    openGraph: {
        title: "Secure Anonymous Reporting | Ensure Student Safety | Shiksha Cloud",
        description: "Implement a POSH and POCSO compliant anonymous reporting system. Give students a safe voice to report bullying, harassment, and grievances without fear. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/anonymous-complaints`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-anonymous-complaints.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Anonymous Complaint System for Schools India",
            },
            {
                url: `${appUrl.origin}/og-image-anonymous-complaints-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Student Safety Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "Anonymous Complaint System India | Student Safety | Shiksha Cloud",
        description: "Implement a secure, anonymous reporting system for students. POSH and POCSO compliant. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-anonymous-complaints.png`,
            `${appUrl.origin}/twitter-card-anonymous-complaints.png`,
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
    "name": "Shiksha Cloud - Anonymous Complaint System",
    "alternateName": "Shiksha Cloud Safe Reporting",
    "description": "Secure, anonymous reporting system for Indian educational institutions. POSH and POCSO compliant grievance redressal to ensure student safety and wellbeing.",
    "url": `${appUrl.origin}/features/anonymous-complaints`,
    "image": `${appUrl.origin}/og-image-anonymous-complaints.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "Student Safety and Welfare Software",

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
        "ratingValue": "4.7",
        "reviewCount": "89",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Kavita Sharma" },
            "reviewBody": "The anonymous reporting system helped us identify a bullying issue that was hidden for months. Essential for student safety.",
            "publisher": { "@type": "Organization", "name": "St. Xavier's High School" },
            "datePublished": "2024-12-01",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Amit Verma" },
            "reviewBody": "Compliance with POCSO and POSH guidelines has become seamless. We now have a documented trail of all grievances.",
            "publisher": { "@type": "Organization", "name": "Global International School" },
            "datePublished": "2024-11-15",
        },
    ],

    "featureList": [
        "Complete anonymity for reporters",
        "POSH and POCSO compliant workflow",
        "Encrypted complaint submission and storage",
        "Administrative dashboard for grievance tracking",
        "Two-way anonymous communication with reporter",
        "Automated escalation to designated safety officers",
        "Audit trails for regulatory compliance",
        "Student wellbeing and mental health triggers",
        "Multi-role access control for safety committees",
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
        "audienceType": "School and college administrators in India",
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
            "name": "How does the anonymous complaint system work for students?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Students can submit a complaint through a secure portal without providing their name or any identifying information. The system generates a unique ticket ID, allowing the student to check the status of their complaint or communicate with the administration anonymously without ever revealing their identity.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the system compliant with POSH and POCSO guidelines in India?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our system is specifically designed to align with the Protection of Children from Sexual Offences (POCSO) Act and the Prevention of Sexual Harassment (POSH) Act. It ensures a documented, secure, and sensitive handling of complaints, providing the necessary audit trails for regulatory compliance and legal protection for the institution.",
            },
        },
        {
            "@type": "Question",
            "name": "Can administrators communicate with the anonymous reporter?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! The system allows two-way anonymous communication. Administrators can ask for more details or provide updates to the reporter through the portal. The reporter can respond, and all communication remains encrypted and anonymous, ensuring the student feels safe while the school gets the information it needs.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the system handle reports of bullying and harassment?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "When a complaint is submitted, it is instantly routed to the designated Internal Committee (IC) or safety officer. The system tracks the complaint from submission to resolution, ensuring that no report is ignored and that the school follows a predefined protocol for handling bullying and harassment cases.",
            },
        },
        {
            "@type": "Question",
            "name": "What happens if a student reports a teacher or staff member?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The system allows for customizable routing. Complaints against specific roles can be automatically routed to a higher authority or an external ombudsman, ensuring that there is no conflict of interest and that the report is handled impartially and securely.",
            },
        },
        {
            "@type": "Question",
            "name": "Is the data encrypted and secure from unauthorized access?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all complaint data is encrypted at rest and in transit. We use industry-standard AES-256 encryption. Access to the complaint dashboard is strictly restricted via Role-Based Access Control (RBAC), ensuring only authorized safety officers can view sensitive information.",
            },
        },
        {
            "@type": "Question",
            "name": "Can parents use the anonymous complaint system?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system can be configured to allow parents to submit anonymous grievances. This provides a safe channel for parents to report concerns about their child's wellbeing or institutional issues without fear of it affecting their child's academic standing.",
            },
        },
        {
            "@type": "Question",
            "name": "How does this system help in improving the overall school culture?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "By providing a safe and trusted channel for feedback, schools can identify systemic issues, such as toxic behavior or hidden bullying, that usually go unreported. This leads to a more transparent, safe, and supportive environment for all students and teachers.",
            },
        },
        {
            "@type": "Question",
            "name": "What is the difference between a standard complaint and an anonymous one?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A standard complaint requires identification, which often deters students from reporting due to fear of retaliation. An anonymous complaint removes this barrier entirely, ensuring that the school gets the most accurate picture of what's happening on campus and can intervene before issues escalate.",
            },
        },
        {
            "@type": "Question",
            "name": "How long does it take to implement the anonymous reporting system in a school?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The system can be deployed in under 24 hours. We help the school set up their Internal Committee, define the routing rules for different types of complaints, and provide the link to the reporting portal for students and parents. No complex IT infrastructure is required.",
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
            "name": "Anonymous Complaints",
            "item": `${appUrl.origin}/features/anonymous-complaints`,
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
    "name": "How to Implement a Safe Reporting System in 24 Hours",
    "description": "A step-by-step guide to setting up an anonymous reporting channel for student safety and POSH/POCSO compliance.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Define Safety Committee",
            "text": "Identify your Internal Committee (IC) members and safety officers who will handle the reports.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Configure Routing Rules",
            "text": "Set up rules to ensure reports are routed to the correct authority based on the severity and nature of the complaint.",
        },
        {
            "@type": "HowToStep",
            "name": "Publish Reporting Portal",
            "text": "Share the secure reporting link with students and parents via WhatsApp, email, and the parent portal.",
        },
        {
            "@type": "HowToStep",
            "name": "Train Safety Officers",
            "text": "Brief your safety committee on how to handle reports, communicate anonymously, and document the resolution.",
        },
        {
            "@type": "HowToStep",
            "name": "Monitor and Resolve",
            "text": "Start receiving reports and resolve them using the secure dashboard, maintaining a full audit trail.",
        },
    ],

    "totalTime": "PT24H",
};

// Product Schema - For pricing clarity
const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Anonymous Reporting Module",
    "description": "Secure, anonymous complaint and grievance redressal system for schools and colleges.",
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
    "name": "Shiksha Cloud - Anonymous Complaints",
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

export default function AnonymousComplaintsFeaturePage() {
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
            <AnonymousComplaintsLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Student Safety"
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
                            Safety and reporting designed for every education segment
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {feature?.relatedIndustries?.map((industry: string) => (
                            <Link key={industry} href={`/industries/${industry}`}>
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all duration-300">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors capitalize">
                                        {industry.replace(/-/g, ' ')}
                                    </h3>
                                    <p className="text-sm text-slate-600 group-hover:text-slate-700">
                                        See how anonymous reporting works for {industry.replace(/-/g, ' ')}
                                    </p>
                                    <div className="mt-3 text-green-600 text-sm font-medium group-hover:underline">
                                        Learn more →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <CallToAction
                variant="dark"
                heading={<>A Safe Voice<br />For Every Student</>}
                description="Implement a secure, POSH and POCSO compliant anonymous reporting system today. Ensure student safety and institutional integrity."
            />
        </>
    )
}