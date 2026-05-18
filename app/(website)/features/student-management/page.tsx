import StudentManagementLanding from '@/components/website/features/student-management/StudentManagementLanding';
import { Metadata } from 'next';
import { RelatedFeatures } from '@/components/website/features/RelatedFeatures';
import { getRelatedFeatures, FEATURES } from '@/lib/features-config';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');
const FEATURE_SLUG = 'student-management';

export const metadata: Metadata = {
    metadataBase: new URL(appUrl.origin),
    title: "Best Student Management System India | Digital SIS & Records | Shiksha Cloud",
    description: "Eliminate paper files with India's most advanced Student Information System (SIS). Unified profiles, digital admissions, and academic history. Trusted by 1,200+ schools.",
    keywords: [
        "student management system India",
        "best student information system for schools",
        "digital SIS for schools",
        "school student database software",
        "student profile management system",
        "school admission software India",
        "student records management software",
        "digital student files for schools",
        "student data management system India",
        "school CRM for student admissions",
        "student tracking software for schools",
        "paperless student records",
        "student academic history tracking",
        "CBSE school student management",
        "ICSE student information system",
        "how to manage student data digitally",
        "school enrollment software India",
        "student document management system",
        "affordable student management software",
        "student management system Delhi",
        "student information system Mumbai",
        "school database software Bangalore",
        "student records software Hyderabad",
        "SIS for schools Chennai",
    ],
    authors: [{ name: "Shiksha Cloud" }],
    creator: "Shiksha Cloud",
    publisher: "Shiksha Cloud",

    alternates: {
        canonical: `${appUrl.origin}/features/student-management`,
        languages: {
            en: `${appUrl.origin}/features/student-management`,
            'en-IN': `${appUrl.origin}/features/student-management`,
            'x-default': `${appUrl.origin}/features/student-management`,
        },
    },

    category: "education",
    classification: "School Management Software",

    openGraph: {
        title: "Student Information System | 360° Unified Student Profiles | Shiksha Cloud",
        description: "Stop digging through physical files. Manage admissions, documents, and academic history in one secure digital vault. Trusted by 1,200+ Indian schools.",
        url: `${appUrl.origin}/features/student-management`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",

        images: [
            {
                url: `${appUrl.origin}/og-image-student-management.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Best Student Management System India",
            },
            {
                url: `${appUrl.origin}/og-image-student-management-square.png`,
                width: 1200,
                height: 1200,
                alt: "Shiksha Cloud Student Management Dashboard",
            },
        ],

    },

    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        creator: "@shiksha_cloud",
        title: "Student Management System India | Digital SIS | Shiksha Cloud",
        description: "Unified profiles, digital admissions, and secure records. Trusted by 1,200+ Indian schools.",
        images: [
            `${appUrl.origin}/og-image-student-management.png`,
            `${appUrl.origin}/twitter-card-student-management.png`,
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
    "name": "Shiksha Cloud - Student Information System (SIS)",
    "alternateName": "Shiksha Cloud Student Management",
    "description": "Complete student information system for Indian schools. Manage 360° profiles, digital admissions, document storage, and academic history in one secure platform.",
    "url": `${appUrl.origin}/features/student-management`,
    "image": `${appUrl.origin}/og-image-student-management.png`,

    "applicationCategory": "https://schema.org/EducationalApplication",
    "applicationSubCategory": "Student Information System",

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
        "reviewCount": "1200",
        "bestRating": "5",
    },

    "review": [
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mr. Arvind Swami" },
            "reviewBody": "The digital admission process reduced our paperwork by 90%. Everything is now searchable in seconds.",
            "publisher": { "@type": "Organization", "name": "Delhi Public School" },
            "datePublished": "2024-10-12",
        },
        {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Person", "name": "Mrs. Meera Nair" },
            "reviewBody": "Having a 360-degree view of every student's academic and fee history has made our administrative work effortless.",
            "publisher": { "@type": "Organization", "name": "Chinmaya Vidyalaya" },
            "datePublished": "2024-11-28",
        },
    ],

    "featureList": [
        "360° unified student profiles with personal and academic data",
        "End-to-end digital admission and enrollment workflow",
        "Secure cloud-based document management and storage",
        "Complete academic history and grade tracking",
        "Role-based access control (RBAC) for student data privacy",
        "Instant student search and advanced filtering",
        "Automatic generation of student ID cards",
        "Integration with parent portal for real-time updates",
        "Seamless transfer and promotion logic for academic years",
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
        "audienceType": "School administrators, principals, and registrars in India",
        "geographicArea": { "@type": "Country", "name": "India" },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is a Student Information System (SIS) and why does my school need one?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A Student Information System (SIS) is a centralized digital database that stores all student-related data—from personal details and medical records to academic grades and fee history. Schools need one to eliminate manual paperwork, prevent data loss, ensure data security, and provide administrators with a 360-degree view of every student's journey.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the digital admission process work in Shiksha Cloud?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The process starts with a digital inquiry form. Once a lead is converted, the system guides the administrator through document collection, verification, and enrollment. Once approved, the student is automatically assigned a roll number, class, and section, and their fee structure is activated—all without a single piece of paper.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we store sensitive documents like birth certificates and Aadhaar cards securely?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Shiksha Cloud provides a secure cloud-based document vault. All uploaded documents are encrypted and stored with strict role-based access control. Only authorized personnel (like the Principal or Registrar) can view or download sensitive documents, ensuring complete compliance with data privacy norms.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the system handle student promotions to the next grade?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Promotions are handled via a bulk-update tool. Administrators can promote entire sections or individual students to the next academic year and grade with a few clicks. The system automatically archives the previous year's records while carrying forward the student's profile and history.",
            },
        },
        {
            "@type": "Question",
            "name": "Can the SIS integrate with other school modules like attendance and fees?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The Student Management module is the core of Shiksha Cloud. It seamlessly integrates with attendance tracking, fee management, exam results, and the parent portal. Any update in the student profile is instantly reflected across all other modules.",
            },
        },
        {
            "@type": "Question",
            "name": "Is it possible to track the academic history of a student over multiple years?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the system maintains a longitudinal record for every student. You can view their grades, attendance patterns, and disciplinary records from the day they joined the school until graduation, providing invaluable insights for student counseling.",
            },
        },
        {
            "@type": "Question",
            "name": "Can we generate student ID cards directly from the system?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Shiksha Cloud can automatically generate professional student ID cards using the data and photos stored in the student profiles. These can be exported in bulk for printing, ensuring 100% accuracy in student details.",
            },
        },
        {
            "@type": "Question",
            "name": "How does the system handle students with multiple parents or guardians?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The system uses a flexible junction table that allows a student to be linked to multiple parents or guardians. Each guardian can have different access levels to the parent portal, ensuring flexible and accurate family mapping.",
            },
        },
        {
            "@type": "Question",
            "name": "What happens to the data if we decide to switch software in the future?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your data belongs to you. Shiksha Cloud allows you to export all student records, documents, and academic history in standard CSV and PDF formats at any time, ensuring you are never locked into a single vendor.",
            },
        },
        {
            "@type": "Question",
            "name": "Does the student management system support multi-branch schools?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our SIS is built for scale. Multi-branch schools can manage students across all campuses from a single central dashboard while maintaining branch-specific roll numbers, sections, and administrative controls.",
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
            "name": "Student Management",
            "item": `${appUrl.origin}/features/student-management`,
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
    "name": "How to Digitize Your Student Records in 3 Simple Steps",
    "description": "A guide for school administrators to transition from paper-based student files to a digital Student Information System.",

    "step": [
        {
            "@type": "HowToStep",
            "name": "Bulk Import Current Data",
            "text": "Upload your existing student registers using our Excel/CSV importer. Our team helps you clean and map the data to ensure 100% accuracy.",
            "url": `${appUrl.origin}/select-organization`,
        },
        {
            "@type": "HowToStep",
            "name": "Digitize Physical Documents",
            "text": "Upload scanned copies of birth certificates, Aadhaar cards, and previous school TCs directly into each student's secure cloud profile.",
        },
        {
            "@type": "HowToStep",
            "name": "Configure Academic Structure",
            "text": "Define your grades, sections, and subjects. Assign students to their respective classes to activate the 360° profile view.",
        },
        {
            "@type": "HowToStep",
            "name": "Set Up Role-Based Access",
            "text": "Assign permissions to teachers and admin staff so they only see the student data necessary for their role.",
        },
        {
            "@type": "HowToStep",
            "name": "Go Paperless",
            "text": "Start using digital admission forms and electronic records. Say goodbye to dusty filing cabinets forever.",
        },
    ],

    "totalTime": "PT48H",
};

const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Shiksha Cloud Student Management Module",
    "description": "Comprehensive SIS with 360° profiles, digital admissions, and secure document storage.",
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
    "name": "Shiksha Cloud - Student Management",
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

export default function StudentManagementFeaturePage() {
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
            <StudentManagementLanding />

            {/* Related Features Section */}
            {relatedFeatures.length > 0 && (
                <RelatedFeatures
                    features={relatedFeatures}
                    currentSlug={FEATURE_SLUG}
                    title="Features That Power Student Success"
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
                            Student records management tailored for every education segment
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
                                        See how student management works for {industry.replace(/-/g, ' ')}
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
                heading={<>Every Student Record<br />in One Place</>}
                description="Profiles, documents, history — organised, searchable, and always up to date."
            />
        </>
    );
}
