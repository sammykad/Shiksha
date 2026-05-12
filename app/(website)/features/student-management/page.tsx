import { Metadata } from 'next';
import StudentManagementLanding from '@/components/website/features/student-management/StudentManagementLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Student Management System for Schools | Shiksha Cloud',
  description: 'Manage every student record in one platform — profiles, admissions, documents & academic history. Trusted by 1,200+ Indian schools. Free demo.',
  keywords: [
    'student management system for schools',
    'student information system India',
    'school student database software',
    'student profile management system',
    'school admission software',
    'student records management',
    'digital student files',
    'student data management system',
    'school CRM for students',
    'student tracking software',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/student-management`,
    languages: {
      en: `${appUrl.origin}/features/student-management`,
      'x-default': `${appUrl.origin}/features/student-management`,
    },
  },
  openGraph: {
    title: 'Student Information System | Complete Profiles',
    description: 'Manage student profiles, admissions, documents, and academic records in one platform.',
    url: `${appUrl.origin}/features/student-management`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Student Management',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'Student Information System | Shiksha Cloud',
    description: 'Manage student profiles, admissions, documents, and records.',
    images: [`${appUrl.origin}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'Shiksha Cloud — Student Management',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Complete student information system — manage profiles, admissions, documents, and academic records in one unified platform for Indian schools.',
  'url': `${appUrl.origin}/features/student-management`,
  'offers': {
    '@type': 'Offer',
    'price': '79',
    'priceCurrency': 'INR',
    'description': 'Per student per month, no setup fees',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.9',
    'reviewCount': '1200',
    'bestRating': '5',
  },
  'featureList': [
    '360° unified student profiles',
    'Digital admission & enrollment workflow',
    'Document management & storage',
    'Academic history & grade tracking',
    'Role-based data access control',
    'Parent portal integration',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School administrators, principals, and teaching staff in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What information is stored in a student profile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each student profile includes personal details, parent/guardian info, academic history, attendance records, fee status, documents, medical info, and communication logs — all in one unified view.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I manage admissions digitally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. From inquiry to enrollment, track every step digitally. Collect documents, verify details, assign classes/sections, and activate fee structures — all within the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is student data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All data is encrypted at rest and in transit. Role-based access ensures only authorized staff can view or edit student information. Regular backups prevent data loss.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shiksha.cloud/' },
    { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://shiksha.cloud/features' },
    { '@type': 'ListItem', position: 3, name: 'Student Management', item: `${appUrl.origin}/features/student-management` },
  ],
};

export default function StudentManagementFeaturePage() {
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
      <StudentManagementLanding />
      <CallToAction
        variant="dark"
        heading={<>Every Student Record<br />in One Place</>}
        description="Profiles, documents, history — organised, searchable, and always up to date."
      />
    </>
  );
}
