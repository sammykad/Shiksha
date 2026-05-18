import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';
import ExamManagementLanding from "@/components/website/features/exam-management/ExamManagementLanding";

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'exam-management';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best Exam Management Software for Schools & Colleges | Shiksha Cloud",
    description: "Automate exam scheduling, grading, and result generation. Create digital report cards and track student performance analytics in real-time. Trusted by 1,200+ Indian institutions.",
    keywords: [
        "exam management software for schools",
        "best exam software for colleges",
        "digital grading system for schools",
        "automated result generation software",
        "school report card generator",
        "online exam scheduling software",
        "student performance analytics tool",
        "exam marksheet generator India",
        "digital exam cell management",
        "CBSE exam management software",
        "ICSE grading system software",
        "automated grade calculation tool",
        "school examination system software",
        "college internal marks management",
        "online exam portal for schools",
        "student progress tracking software",
        "automated result processing India",
        "exam timetable generator for schools",
        "digital gradebooks for teachers",
        "academic performance reporting software",
        "school exam management system price",
        "best software for school results",
        "digital marksheets for students",
        "automated report card software",
        "exam management system Delhi",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/exam-management`,
        languages: {
            en: `${appUrl.origin}/features/exam-management`,
            'en-IN': `${appUrl.origin}/features/exam-management`,
            'x-default': `${appUrl.origin}/features/exam-management`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Automated Exam & Result Management | Save 40+ Hours per Term | Shiksha Cloud",
        description: "Stop manual mark entry and report card drafting. Automate grading, result processing, and report card generation for 1,000s of students in seconds. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/exam-management`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-exam-management.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best Exam Management Software India",
            },
            {
                url: `${appUrl.origin}/og-image-exam-management-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Exam Dashboard Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "School Exam Management System | Automated Results | Shiksha Cloud",
        description: "Automate grading, scheduling, and report cards. Save weeks of manual work. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-exam-management.png`,
            `${appUrl.origin}/twitter-card-exam-management.png`,
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
    "name": "Shiksha Cloud - Exam Management System",
    "alternateName": "Shiksha Cloud ExamPro",
    "description": "Comprehensive exam scheduling, grading, and result processing software for Indian schools and colleges. Automated report card generation and performance analytics.",
    "url": `${appUrl.origin}/features/exam-management`,
    "image": `${appUrl.origin}/og-image-exam-management.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "Academic Assessment Software",

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
        "ratingValue": "4.7",
        "reviewCount": "112",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Amit Verma" },
            "reviewBody": "Result processing that used to take 15 days now takes 15 minutes. A lifesaver for our exam cell.",
            "publisher": { "@type": "Organization", "name": "Modern Public School" },
            "datePublished": "2024-12-01",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Sarah Joseph" },
            "reviewBody": "The automated report cards are professional and error-free. Parents love the digital access.",
            "publisher": { "@type": "Organization", "name": "St. Mary's Academy" },
            "datePublished": "2024-11-15",
        },
    ],

    "featureList": [
        "Automated exam scheduling and timetable generation",
        "Digital marks entry for teachers",
        "Customizable grading scales (CBSE, ICSE, State Boards)",
        "One-click automated report card generation",
        "Real-time student performance analytics dashboard",
        "Automatic rank and percentage calculation",
        "Secure digital result publishing to parent portal",
        "Subject-wise and class-wise performance reports",
        "Historical academic progress tracking",
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
        "audienceType": "School principals and exam coordinators in India",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does the automated result generation work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Once teachers enter marks for their respective subjects into the digital gradebook, the system automatically calculates totals, percentages, and grades based on your predefined school grading scale. With one click, the administrator can process the results for the entire class or school, instantly generating final marksheet data.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we customize report cards to match our school's branding?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud provides flexible report card templates. You can add your school logo, custom headers, footers, and specific remarks sections. The generated PDF report cards are professional, polished, and consistent across all students.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the system support different grading patterns for CBSE and ICSE?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. You can configure multiple grading schemes. Whether you use a 9-point scale for CBSE or a specific percentage-based system for State Boards, our software handles the logic automatically, ensuring zero calculation errors.",
            },
        },
        {
            "@type": "Question",
            "name": "How do parents receive the exam results?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Results can be published to the Parent Portal where parents can view and download digital marksheets. Additionally, the system can send an instant WhatsApp notification to parents the moment results are declared, providing a direct link to the report card.",
            },
        },
        {
            "@type": "Question",
            "name": "Can teachers enter marks on their mobile phones?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the teacher's interface is fully responsive. Teachers can mark attendance and enter exam marks directly from their smartphones or tablets, eliminating the need to carry physical mark sheets to the computer lab.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the performance analytics dashboard help teachers?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The analytics dashboard highlights 'at-risk' students who are performing below average in specific subjects. Teachers can identify learning gaps early and provide targeted support to students who need it most, improving overall class performance.",
            },
        },
        {
            "@type": "Question",
            "name": "Is it possible to generate cumulative reports for the whole year?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system tracks performance across multiple terms (Unit Tests, Half-Yearly, Finals). You can generate cumulative reports that show a student's growth trajectory over the entire academic year.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we manage internal assessments and practical marks separately?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system allows for separate columns for theory, practicals, internals, and projects. You can define the weightage for each component to calculate the final composite score.",
            },
        },
        {
            "@type": "Question",
            "name": "How secure is the marks entry process?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We use strict RBAC (Role-Based Access Control). Only the assigned subject teacher can enter marks for their class and subject. Once the administrator 'locks' the results, no further changes can be made without high-level authorization, preventing tampering.",
            },
        },
        {
            "@type": "Question",
            "name": "What is the cost of the exam management module?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Exam management is included in the Shiksha Cloud core suite, starting at ₹79 per student per month. This includes all grading tools, automated report card generation, and result publishing features.",
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
            "name": "Exam Management",
            "item": `${appUrl.origin}/features/exam-management`,
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
    "name": "How to Automate Your School's Exam Results in 5 Steps",
    "description": "A guide to moving from manual marksheets to automated digital result processing with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Grading Scale",
            "text": "Set your grade boundaries (e.g., A1: 91-100, A2: 81-90) in the exam settings.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Create Exam Schedule",
            "text": "Define your exams (e.g., Half-Yearly 2024) and assign subjects to classes.",
        },
        {
            "@type": "HowToStep",
            "name": "Digital Marks Entry",
            "text": "Teachers enter marks directly into the digital gradebook via web or mobile.",
        },
        {
            "@type": "HowToStep",
            "name": "One-Click Processing",
            "text": "Administrator processes the results to calculate ranks, percentages, and grades automatically.",
        },
        {
            "@type": "HowToStep",
            "name": "Publish Results",
            "text": "Release results to the Parent Portal and send WhatsApp alerts to all parents instantly.",
        },
    ],

    "totalTime": "PT2H",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Exam Management Module",
    "description": "Automated grading, exam scheduling, and report card generation for educational institutions.",
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
    "name": "Shiksha Cloud - Exam Management System",
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

export default function ExamManagementFeaturePage() {
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

            <ExamManagementLanding />

            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Exam Management"
                />
            )}

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Perfect for Your Institution Type
                        </h2>
                        <p className="text-xl text-slate-600">
                            Exam management designed for every education segment
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
                                        See how exam management works for {industry.replace(/-/g, ' ')}
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
                heading={<>Stress-Free Exams<br />Automated Results</>}
                description="Stop the manual grading madness. Automate your exam cell and publish professional report cards in seconds."
            />
        </>
    );
}
