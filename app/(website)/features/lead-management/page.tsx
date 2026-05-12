import { Metadata } from 'next';
import LeadManagementLanding from "@/components/website/features/lead-management/LeadManagementLanding";
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Admission CRM for Schools | Lead Management | Shiksha',
  description: 'Capture every inquiry, automate WhatsApp follow-ups & convert more leads into enrollments. Built for Indian schools. Trusted by 1,200+ institutions.',
  keywords: [
    'school admission CRM',
    'lead management system for schools',
    'student enrollment software',
    'school inquiry tracking',
    'admission follow-up system',
    'school enrollment software',
    'student lead management',
    'school CRM for admissions',
    'enrollment management system India',
    'school prospect management',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/lead-management`,
    languages: {
      en: `${appUrl.origin}/features/lead-management`,
      'x-default': `${appUrl.origin}/features/lead-management`,
    },
  },
  openGraph: {
    title: 'Admission Lead Management | Convert More Enrollments',
    description: 'Track admissions, manage inquiries, and convert more leads into enrollments.',
    url: `${appUrl.origin}/features/lead-management`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Lead Management System',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Admission CRM | Shiksha Cloud',
    description: 'Track admissions, manage inquiries, convert more leads.',
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
  'name': 'Shiksha Cloud — Admission CRM',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'School admission CRM to capture inquiries, automate WhatsApp follow-ups, score leads, and convert prospects into enrolled students.',
  'url': `${appUrl.origin}/features/lead-management`,
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
    'Multi-channel lead capture (walk-in, phone, web)',
    'Automated WhatsApp & SMS follow-ups',
    'Lead scoring 0-100',
    'Multi-stage admission pipeline',
    'One-click lead to student conversion',
    'Source tracking & conversion analytics',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School admission teams and administrators in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the admission CRM work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Track every inquiry from website, phone, or walk-in. Assign follow-ups, set reminders, and monitor conversion status from inquiry to enrollment. Never lose a potential student.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I automate follow-up messages to parents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Set up automated WhatsApp and SMS follow-ups at configurable intervals. The system sends admission brochures, fee details, and deadline reminders automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track admission sources?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Track where each lead came from — website, referral, social media, newspaper ad, or walk-in. Analyze which channels bring the most enrollments.',
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
    { '@type': 'ListItem', position: 3, name: 'Admission CRM', item: `${appUrl.origin}/features/lead-management` },
  ],
};

export default function LeadManagementFeaturePage() {
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
      <LeadManagementLanding />
      <CallToAction
        variant="dark"
        heading={<>Convert More Enquiries<br />Into Admissions</>}
        description="Track every lead, automate follow-ups, and close more admissions without lifting a finger."
      />
    </>
  );
}