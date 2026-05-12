import { Metadata } from 'next';
import ParentPortalLanding from '@/components/website/features/parent-portal/ParentPortalLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'School Parent Portal App | Real-Time Updates | Shiksha Cloud',
  description: 'Keep parents connected with attendance, fees, exam results & WhatsApp alerts. One portal for everything. Trusted by 1,200+ Indian schools. Free demo.',
  keywords: [
    'school parent portal',
    'parent teacher communication app',
    'parent dashboard for schools',
    'real-time school updates parents',
    'parent access school software',
    'school parent app',
    'parent school management app',
    'school communication portal parents',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/parent-portal`,
    languages: {
      en: `${appUrl.origin}/features/parent-portal`,
      'x-default': `${appUrl.origin}/features/parent-portal`,
    },
  },
  openGraph: {
    title: 'School Parent Portal | Stay Connected | Shiksha Cloud',
    description: 'Keep parents connected with attendance, fees, exam results & WhatsApp alerts.',
    url: `${appUrl.origin}/features/parent-portal`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Parent Portal',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Parent Portal | Shiksha Cloud',
    description: 'Keep parents connected with real-time updates via app & WhatsApp.',
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
  'name': 'Shiksha Cloud — Parent Portal',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Dedicated parent portal for real-time access to child attendance, fees, exam results, homework, and school announcements with WhatsApp alerts.',
  'url': `${appUrl.origin}/features/parent-portal`,
  'offers': {
    '@type': 'Offer',
    'price': '79',
    'priceCurrency': 'INR',
    'description': 'Per student per month, no setup fees',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'reviewCount': '1200',
    'bestRating': '5',
  },
  'featureList': [
    'Real-time attendance tracking',
    'Fee payment & receipt history',
    'Exam results & report cards',
    'WhatsApp notification alerts',
    'Multi-child parent accounts',
    'Homework & assignment viewing',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'Parents and guardians of school students in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What can parents see in the portal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Parents can view their child\'s attendance history, fee status and payment receipts, exam results and report cards, homework assignments, school announcements, and holiday calendar — all in one unified dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do parents need to download a separate app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Parents can access the portal through the Shiksha Cloud mobile app (Android & iOS) or through any web browser. WhatsApp notifications also keep parents informed without needing to open the app.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can parents with multiple children manage all profiles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Parents can link multiple children to a single account and switch between profiles seamlessly. They receive notifications for all their children in one place.',
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
    { '@type': 'ListItem', position: 3, name: 'Parent Portal', item: `${appUrl.origin}/features/parent-portal` },
  ],
};

export default function ParentPortalPage() {
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
      <ParentPortalLanding />
      <CallToAction
        variant="dark"
        heading={<>Keep Parents Connected<br />Without the Effort</>}
        description="One portal for attendance, fees, exam results, and announcements — with instant WhatsApp alerts for every parent."
      />
    </>
  );
}
