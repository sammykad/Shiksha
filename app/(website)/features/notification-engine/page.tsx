import { Metadata } from 'next';
import NotificationEngineLanding from '@/components/website/features/notification-engine/NotificationEngineLanding';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'School Notification System | 5-Channel Alerts | Shiksha',
  description: 'Automate alerts via WhatsApp, SMS, Email, Push & In-App. 95%+ delivery rate, <1s latency. Trusted by 1,200+ Indian schools. ₹79/student/month.',
  keywords: [
    'school notification system',
    'WhatsApp school alerts',
    'multi-channel school communication',
    'parent notification system school',
    'SMS alerts for schools',
    'school email system',
    'push notifications school',
    'school messaging platform',
    'automated school alerts',
    'school communication platform',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/notification-engine`,
    languages: {
      en: `${appUrl.origin}/features/notification-engine`,
      'x-default': `${appUrl.origin}/features/notification-engine`,
    },
  },
  openGraph: {
    title: 'School Notification Engine | 5 Channels | Shiksha Cloud',
    description: 'SMS, WhatsApp, Email, Push, and In-App alerts. 95%+ delivery rate.',
    url: `${appUrl.origin}/features/notification-engine`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Notification Engine',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Notification Engine | Shiksha Cloud',
    description: '5-channel alert system. 95%+ delivery rate, <1s latency.',
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
  'name': 'Shiksha Cloud — Notification Engine',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Multi-channel school notification engine with WhatsApp, SMS, Email, Push, and In-App alerts. 95%+ delivery rate, under 1-second latency.',
  'url': `${appUrl.origin}/features/notification-engine`,
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
    '5-channel notification system (WhatsApp, SMS, Email, Push, In-App)',
    'Custom message templates in English & Hindi',
    'WhatsApp Business API integration',
    'Automated event-triggered alerts',
    'Delivery tracking & read receipts',
    'Fallback routing across channels',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School administrators and communication teams in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What notification channels are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Shiksha Cloud supports 5 channels: WhatsApp, SMS, Email, Push Notifications (mobile app), and In-App notifications. You can configure which events trigger which channels.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast are notifications delivered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our notification engine delivers alerts in under 1 second. WhatsApp messages achieve 98% open rates within 10 minutes, significantly higher than email or SMS alone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I customize notification messages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Create custom message templates for each notification type. Support for both English and Hindi. Templates are pre-approved via WhatsApp Business API for instant delivery.',
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
    { '@type': 'ListItem', position: 3, name: 'Notification Engine', item: `${appUrl.origin}/features/notification-engine` },
  ],
};

export default function NotificationEngineFeaturePage() {
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
      <NotificationEngineLanding />
      <CallToAction
        variant="dark"
        heading={<>Reach Every Parent<br />at the Right Moment</>}
        description="SMS, WhatsApp, email — send the right message automatically and keep everyone in the loop."
      />
    </>
  );
}
