import type { Metadata } from 'next';
import DocumentVerificationLanding from '@/components/website/features/document-verification/DocumentVerificationLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

export const metadata: Metadata = {
    title: 'Student Document Verification System | Shiksha Cloud',
    description: 'Streamline admissions with secure document verification. Collect, verify & store student records digitally. Encrypted, audit-ready. Trusted by 500+ schools.',
    keywords: [
        'student document verification system',
        'school document management',
        'paperless school admissions',
        'secure student record storage',
        'school document vault',
        'educational compliance software',
        'student identity verification',
        'digital document workflow schools',
    ],
    alternates: {
        canonical: 'https://shiksha.cloud/features/document-verification',
    },
    openGraph: {
        title: 'Secure Student Document Verification | Shiksha Cloud',
        description: 'Transform your school admissions with digital document verification. Secure, fast, and audit-ready.',
        type: 'website',
        url: 'https://shiksha.cloud/features/document-verification',
        images: [
            {
                url: '/images/documents-verification.png',
                width: 1200,
                height: 630,
                alt: 'Shiksha Cloud Document Verification Dashboard'
            }
        ]
    }
};

export default function DocumentVerificationPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                'name': 'Shiksha Cloud Document Verification System',
                'applicationCategory': 'EducationalSoftware',
                'operatingSystem': 'Web-based',
                'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'INR',
                    'description': 'Free trial available for schools'
                },
                'featureList': [
                    'Secure Document Vault',
                    'One-click Verification Flow',
                    'Instant WhatsApp Notifications',
                    'AES-256 Encryption',
                    'Audit-ready Compliance Reports',
                    'Mobile Admin Access'
                ]
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': 'https://shikshacloud.com'
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'Features',
                        'item': 'https://shikshacloud.com/features'
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': 'Document Verification',
                        'item': 'https://shikshacloud.com/features/document-verification'
                    }
                ]
            },
            {
                '@type': 'FAQPage',
                'mainEntity': [
                    {
                        '@type': 'Question',
                        'name': 'How secure is the student document storage?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'All documents are stored using AES-256 bit encryption at rest and TLS 1.3 in transit. We follow ISO 27001 standards to ensure complete data privacy and security.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'Can parents upload documents from their phones?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'Yes, parents can use the Shiksha Cloud mobile app or parent portal to scan and upload documents directly using their phone cameras.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'What happens when a document is rejected?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'The parent receives an instant notification via WhatsApp and push alert with the specific rejection reason. They can immediately re-upload the corrected document.'
                        }
                    }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DocumentVerificationLanding />
            <CallToAction
                variant="dark"
                heading={<>Verify Documents<br />In Seconds</>}
                description="Issue tamper-proof digital certificates and let institutions verify them instantly — no paperwork needed."
            />
        </>
    );
}
