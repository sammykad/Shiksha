import AnonymousComplaintsLanding from '@/components/website/features/anonymous-complaints/AnonymousComplaintsLanding';
import type { Metadata } from 'next';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Anonymous Complaint System for Schools | Shiksha Cloud',
  description: 'Protect students with secure anonymous reporting. Reduce harassment by 85%. POCSO Act compliant. Trusted by 500+ Indian schools. Request a free demo.',
  keywords: [
    'anonymous complaint system schools',
    'school safety reporting system',
    'POCSO compliant school software',
    'student harassment prevention',
    'anonymous student reporting India',
    'school harassment prevention',
    'student grievance system India',
    'women safety school management',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/anonymous-complaints`,
    languages: {
      en: `${appUrl.origin}/features/anonymous-complaints`,
      'x-default': `${appUrl.origin}/features/anonymous-complaints`,
    },
  },
  openGraph: {
    title: 'Anonymous School Complaint System | Student Safety',
    description: 'Protect students with secure anonymous reporting. POCSO Act compliant. Trusted by 500+ schools.',
    url: `${appUrl.origin}/features/anonymous-complaints`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Anonymous Complaint System',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'Anonymous School Complaint System | Shiksha Cloud',
    description: 'Protect students with secure anonymous reporting. POCSO compliant.',
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
  'name': 'Shiksha Cloud — Anonymous Complaint System',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Secure anonymous reporting system for schools. POCSO Act compliant. Students report harassment and safety concerns without fear. Full admin dashboard for tracking and resolution.',
  'url': `${appUrl.origin}/features/anonymous-complaints`,
  'offers': {
    '@type': 'Offer',
    'price': '79',
    'priceCurrency': 'INR',
    'description': 'Per student per month, no setup fees',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.9',
    'reviewCount': '500',
    'bestRating': '5',
  },
  'featureList': [
    'Anonymous complaint submission',
    'POCSO Act compliant reporting',
    'Unique complaint tracking IDs',
    'Admin investigation dashboard',
    'Mandatory escalation paths',
    'Audit trail & resolution logging',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School administrators, counselors, and safety officers in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the anonymous complaint system work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Students can submit complaints anonymously through a secure portal without revealing their identity. Each complaint gets a unique tracking ID. School admins receive alerts and can investigate while maintaining student privacy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the anonymous complaint system POCSO Act compliant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our system is designed to comply with the Protection of Children from Sexual Offences (POCSO) Act reporting requirements. Schools can configure mandatory escalation paths and audit trails.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can schools track resolution of anonymous complaints?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Admins get a full dashboard to track complaint status, assign investigators, set deadlines, and log resolution steps. Students can check their complaint status using their unique tracking ID.',
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
    { '@type': 'ListItem', position: 3, name: 'Anonymous Complaints', item: `${appUrl.origin}/features/anonymous-complaints` },
  ],
};

export default function AnonymousComplaintsPage() {
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
      <AnonymousComplaintsLanding />
      <CallToAction
        variant="dark"
        heading={<>Build a Safer School<br />Community</>}
        description="Give students and parents a secure, anonymous channel to raise concerns with confidence."
      />
    </>
  );
}
