import { Metadata } from 'next';
import AIReportsLanding from '@/components/website/features/ai-reports/AIReportsLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'AI School Reports | Automated Insights | Shiksha Cloud',
  description: 'Generate instant school reports with AI. Save 10+ hours weekly on fee, attendance & performance analysis. No Excel needed. Trusted by 1,200+ schools.',
  keywords: [
    'AI school reports',
    'automated school analytics',
    'school performance reports',
    'smart school insights',
    'school data analysis',
    'school analytics software',
    'AI-powered education reports',
    'automated school dashboards',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/ai-reports`,
    languages: {
      en: `${appUrl.origin}/features/ai-reports`,
      'x-default': `${appUrl.origin}/features/ai-reports`,
    },
  },
  openGraph: {
    title: 'AI-Powered School Reports | Instant Insights',
    description: 'Generate instant school reports with AI. Save 10+ hours weekly.',
    url: `${appUrl.origin}/features/ai-reports`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - AI Reports',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'AI School Reports | Shiksha Cloud',
    description: 'Generate instant reports with AI. Save 10+ hours weekly.',
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
  'name': 'Shiksha Cloud — AI Reports',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'AI-powered school report generator. Ask questions in plain English and get instant reports on fees, attendance, exam performance, and enrollment forecasts.',
  'url': `${appUrl.origin}/features/ai-reports`,
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
    '15+ pre-built report templates',
    'Plain English AI query engine',
    'Fee collection summaries',
    'Attendance trend analysis',
    'Student risk indicators',
    'PDF, Excel & CSV export',
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
      name: 'What kind of reports can AI generate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI can generate fee collection summaries, attendance trend analysis, exam performance reports, student risk indicators, teacher workload analysis, and enrollment forecasts — all in plain English.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need technical skills to use AI reports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Simply ask questions in plain language like "Show me fee collection trends this month" or "Which students are at risk of dropping out?" and AI generates the report instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much time does AI save?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Schools report saving 10+ hours weekly on manual report generation. What used to take hours of Excel work is now done in seconds with AI.',
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
    { '@type': 'ListItem', position: 3, name: 'AI Reports', item: `${appUrl.origin}/features/ai-reports` },
  ],
};

export default function AIReportsFeaturePage() {
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
      <AIReportsLanding />
      <CallToAction
        variant="dark"
        badge="AI-Powered Insights"
        heading={<>Reports That Write<br />Themselves</>}
        description="Let AI analyse attendance, performance, and fee data so you can make decisions in minutes, not hours."
      />
    </>
  );
}
