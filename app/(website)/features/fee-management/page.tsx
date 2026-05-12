import { Metadata } from 'next';
import FeeManagementLanding from '@/components/website/features/fee-management/FeeManagementLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'Fee Management Software for Schools | Shiksha Cloud',
  description: 'Automate fee collection & get paid 3x faster. WhatsApp reminders, UPI payments, instant reconciliation. Trusted by 500+ schools. ₹79/student/month.',
  keywords: [
    'school fee management software',
    'online fee collection system India',
    'automated school fee reminders',
    'school fee tracking software',
    'school payment gateway',
    'UPI payment for school fees',
    'school fee software',
    'digital fee collection system',
    'school accounts software',
    'fee reminder system school',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/fee-management`,
    languages: {
      en: `${appUrl.origin}/features/fee-management`,
      'x-default': `${appUrl.origin}/features/fee-management`,
    },
  },
  openGraph: {
    title: 'Online Fee Collection | Get Paid 3x Faster | Shiksha Cloud',
    description: 'Automate fee collection for your school. Get paid faster with automated reminders and UPI payments.',
    url: `${appUrl.origin}/features/fee-management`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Fee Management',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Fee Management | Shiksha Cloud',
    description: 'Automate fee collection. Get paid 3x faster.',
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
  'name': 'Shiksha Cloud — Fee Management',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Automate school fee collection with WhatsApp reminders, UPI payments, and instant reconciliation. Trusted by 500+ Indian schools.',
  'url': `${appUrl.origin}/features/fee-management`,
  'offers': {
    '@type': 'Offer',
    'price': '79',
    'priceCurrency': 'INR',
    'description': 'Per student per month, no setup fees',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'reviewCount': '500',
    'bestRating': '5',
  },
  'featureList': [
    'Automated WhatsApp fee reminders',
    'UPI & online payment collection',
    'Instant payment reconciliation',
    'Real-time collection dashboard',
    'Custom fee categories & structures',
    'Digital receipt generation',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School administrators and principals in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does automated fee collection work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Set up fee categories, assign them to students, and the system automatically sends WhatsApp/SMS reminders when payments are due. Parents pay via UPI, and payments are auto-reconciled in your dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do parents use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Parents can pay via UPI (Google Pay, PhonePe, Paytm), net banking, credit/debit cards, or digital wallets. All transactions are secure and receipt is generated automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send fee reminders via WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our built-in WhatsApp Business API sends automated fee reminders, payment confirmations, and overdue alerts to parents. Achieves 95%+ open rates.',
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
    { '@type': 'ListItem', position: 3, name: 'Fee Management', item: `${appUrl.origin}/features/fee-management` },
  ],
};

export default function FeeManagementFeaturePage() {
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
      <FeeManagementLanding />
      <CallToAction
        variant="dark"
        heading={<>Simplify Fee Collection<br />Starting Today</>}
        description="Automate reminders, accept online payments, and generate instant receipts — all from one dashboard."
        secondaryLabel="Schedule a Demo"
        secondaryHref="/contact"
      />
    </>
  );
}
