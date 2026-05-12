import { Metadata } from 'next';
import ExamManagementLanding from '@/components/website/features/exam-management/ExamManagementLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Exam Management Software for Schools | Shiksha Cloud',
  description: 'Schedule exams, generate hall tickets & automate report cards. Save 10+ hours per exam cycle. Trusted by 1,200+ Indian schools. Free demo available.',
  keywords: [
    'exam management software for schools',
    'hall ticket generator',
    'automated report cards',
    'school exam scheduling system',
    'school result software',
    'exam management software India',
    'school grading system',
    'student assessment software',
    'exam timetable software',
    'school examination management',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/exam-management`,
    languages: {
      en: `${appUrl.origin}/features/exam-management`,
      'x-default': `${appUrl.origin}/features/exam-management`,
    },
  },
  openGraph: {
    title: 'Exam Management System | Automated Results | Shiksha Cloud',
    description: 'Schedule exams, generate hall tickets, and automate report cards. Streamline your entire exam lifecycle.',
    url: `${appUrl.origin}/features/exam-management`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Exam Management',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Exam Management | Shiksha Cloud',
    description: 'Schedule exams, generate hall tickets, automate report cards.',
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
  'name': 'Shiksha Cloud — Exam Management',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Complete exam lifecycle management — schedule exams, generate hall tickets with QR codes, enter marks, and automate report cards for Indian schools.',
  'url': `${appUrl.origin}/features/exam-management`,
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
    'Exam scheduling & timetable creation',
    'Hall ticket generation with QR codes',
    'Bulk mark entry & auto grade calculation',
    'Automated report card generation',
    'Parent result notifications via WhatsApp',
    'Class & grade ranking',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School administrators and teaching staff in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I generate hall tickets automatically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The system automatically generates hall tickets for all registered students based on exam schedules. You can download and print them in bulk with one click.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are report cards generated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Teachers enter marks for each subject, and the system automatically calculates grades, percentages, ranks, and generates professional report cards with performance graphs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can parents view results online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Parents can view their child\'s results through the parent portal and receive instant WhatsApp notifications when results are published.',
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
    { '@type': 'ListItem', position: 3, name: 'Exam Management', item: `${appUrl.origin}/features/exam-management` },
  ],
};

export default function ExamManagementFeaturePage() {
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
      <ExamManagementLanding />
      <CallToAction
        variant="dark"
        heading={<>Ready to Run Exams<br />Without the Chaos?</>}
        description="From session setup to report cards — your entire exam lifecycle, automated inside Shiksha Cloud."
      />
    </>
  );
}
