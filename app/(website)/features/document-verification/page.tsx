import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';
import DocumentVerificationLanding from "@/components/website/features/document-verification/DocumentVerificationLanding";

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'document-verification';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Digital Document Verification Software for Schools & Colleges | Shiksha Cloud",
    description: "Eliminate paper files with AI-powered document verification. Securely store, verify, and manage student certificates, IDs, and transcripts. Trusted by 1,200+ Indian institutions for paperless admissions.",
    keywords: [
        "document verification software for schools",
        "digital document management education",
        "school admission document verification",
        "online certificate verification system",
        "student document storage software",
        "paperless admission process India",
        "digital transcript management",
        "automated document verification for colleges",
        "secure student record keeping",
        "educational document workflow software",
        "digitize school records India",
        "student KYC software for schools",
        "academic document verification tool",
        "school document archival system",
        "electronic document management system education",
        "verify student documents online",
        "digital onboarding for students",
        "CBSE document verification process",
        "ICSE student record management",
        "university admission document portal",
        "secure cloud storage for student certificates",
        "document verification workflow for admissions",
        "reduce admission paperwork India",
        "best document management for education",
        "college document verification app",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/document-verification`,
        languages: {
            en: `${appUrl.origin}/features/document-verification`,
            'en-IN': `${appUrl.origin}/features/document-verification`,
            'x-default': `${appUrl.origin}/features/document-verification`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Paperless Document Verification | Secure & AI-Powered | Shiksha Cloud",
        description: "Stop chasing paper certificates. Move to a 100% digital document verification workflow. Secure storage, instant verification, and seamless admission onboarding for Indian institutions.",
        url: `${appUrl.origin}/features/document-verification`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-document-verification.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Digital Document Verification System",
            },
            {
                url: `${appUrl.origin}/og-image-document-verification-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Document Management Screenshot",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "Digital Document Verification for Schools | Shiksha Cloud",
        description: "Securely store and verify student documents. Move to paperless admissions and reduce manual effort by 90%. Trusted by 1,200+ Indian institutions.",
        images: [
            `${appUrl.origin}/og-image-document-verification.png`,
            `${appUrl.origin}/twitter-card-document-verification.png`,
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
    "name": "Shiksha Cloud - Document Verification System",
    "alternateName": "Shiksha Cloud DocVerify",
    "description": "Digital document management and verification workflow for Indian educational institutions. Securely store student certificates, IDs, and transcripts with AI-assisted verification.",
    "url": `${appUrl.origin}/features/document-verification`,
    "image": `${appUrl.origin}/og-image-document-verification.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "Document Management System",

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
        "ratingValue": "4.9",
        "reviewCount": "84",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Dr. Anjali Mehta" },
            "reviewBody": "Our admission cycle time dropped from 2 weeks to 2 days. Document verification is now seamless.",
            "publisher": { "@type": "Organization", "name": "St. Xavier's College" },
            "datePublished": "2024-11-10",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Rajesh Kumar" },
            "reviewBody": "No more physical files. Everything is organized and accessible in one click. Highly recommended.",
            "publisher": { "@type": "Organization", "name": "Delhi Public School" },
            "datePublished": "2024-10-05",
        },
    ],

    "featureList": [
        "Cloud-based secure document storage",
        "Automated verification workflows",
        "Digital submission portal for parents/students",
        "AI-powered document classification",
        "Approval/Rejection tracking with comments",
        "Audit trails for every document change",
        "Integration with student profiles",
        "Bulk export for regulatory compliance",
        "Encryption at rest and in transit",
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
        "audienceType": "Admissions officers and administrators in Indian schools and colleges",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does digital document verification work for school admissions?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Parents upload digital copies of required documents (Birth Certificate, Transfer Certificate, Aadhar, etc.) via a secure portal. Admissions officers then review these documents on a dashboard, marking them as verified, pending, or rejected with specific comments. Once all mandatory documents are verified, the student's admission is automatically marked as complete.",
            },
        },
        {
            "@type": "Question",
            "name": "Is digital document storage secure and compliant with Indian laws?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud uses industry-standard AES-256 encryption for documents at rest and SSL/TLS for data in transit. All data is stored in secure cloud environments that comply with Indian data protection norms, ensuring that sensitive student information is protected from unauthorized access.",
            },
        },
        {
            "@type": "Question",
            "name": "Can parents re-upload documents if they are rejected?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. If a document is rejected due to poor quality or incorrect files, the system sends an instant notification to the parent. They can then upload the correct document directly through their portal without having to visit the school physically.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the system support bulk import of existing student documents?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, we provide a secure bulk upload utility that allows institutions to migrate existing scanned documents from local servers or hard drives into the Shiksha Cloud ecosystem, automatically mapping them to the correct student profiles.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we set custom document requirements for different grades?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, administrators can define different document checklists for different grades or courses. For example, Kindergarten may only require a birth certificate, while Grade 11 may require a Grade 10 marksheet and a migration certificate.",
            },
        },
        {
            "@type": "Question",
            "name": "How much time can a school save by going paperless with documents?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Institutions typically report a 90% reduction in manual paperwork. The time spent on physical filing, searching for lost documents, and manual data entry is almost entirely eliminated, allowing admission staff to focus on student counseling instead of clerical work.",
            },
        },
        {
            "@type": "Question",
            "name": "Is this system compatible with DigiLocker?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We are continuously evolving our integrations. Currently, we allow students to upload DigiLocker-verified PDFs, and we are working towards direct API integrations to fetch verified documents seamlessly.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we export verified documents for government audits?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system allows for one-click bulk export of all verified documents in organized folders (by grade/section/student), making government audits and compliance checks effortless.",
            },
        },
        {
            "@type": "Question",
            "name": "Who can access the uploaded documents?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Access is strictly role-based. Only authorized administrators and admission officers can view and verify documents. Teachers and other staff can be restricted from seeing sensitive personal documents based on the school's internal privacy policy.",
            },
        },
        {
            "@type": "Question",
            "name": "What is the cost of implementing digital document verification?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Document verification is part of the Shiksha Cloud core suite, starting at ₹79 per student per month. There are no separate setup fees for the document module, and it includes secure cloud storage for all student records.",
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
            "name": "Document Verification",
            "item": `${appUrl.origin}/features/document-verification`,
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
    "name": "How to Implement Paperless Document Verification",
    "description": "A guide to transitioning from physical student files to a secure digital verification workflow with Shiksha Cloud.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Define Document Checklist",
            "text": "Set up the mandatory documents required for each grade or course in your admin dashboard.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Invite Parents to Upload",
            "text": "Send automated invitations to parents to upload documents via the secure student portal.",
        },
        {
            "@type": "HowToStep",
            "name": "Verify Documents",
            "text": "Review uploaded files on the verification dashboard and mark them as verified or request re-upload.",
        },
        {
            "@type": "HowToStep",
            "name": "Finalize Admissions",
            "text": "Once all documents are verified, automatically trigger the final admission approval.",
        },
        {
            "@type": "HowToStep",
            "name": "Secure Archival",
            "text": "All verified documents are automatically archived in the student's permanent digital record.",
        },
    ],

    "totalTime": "PT24H",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Document Verification Module",
    "description": "Digital document management with secure cloud storage and verification workflows for educational institutions.",
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
    "name": "Shiksha Cloud - Document Verification System",
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

export default function DocumentVerificationFeaturePage() {
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

            <DocumentVerificationLanding />

            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Complement Document Verification"
                />
            )}

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Perfect for Your Institution Type
                        </h2>
                        <p className="text-xl text-slate-600">
                            Document verification designed for every education segment
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
                                        See how document verification works for {industry.replace(/-/g, ' ')}
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
                heading={<>Secure Your Records<br />Go Paperless Today</>}
                description="Digitize your admission documents, automate verification, and eliminate physical filing forever."
            />
        </>
    );
}
