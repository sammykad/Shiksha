import HolidayLanding from '@/components/website/features/holidays/HolidayLanding';
import type { Metadata } from 'next';
import { CallToAction } from '@/components/website/shared/CallToAction';

export const metadata: Metadata = {
  title:
    'Holiday Management System for Schools | Shiksha Cloud',
  description:
    'Manage school holidays instantly with real-time calculations and WhatsApp alerts. Save 40+ hours yearly with bulk imports. Trusted by 500+ Indian schools.',
  keywords: [
    'school holiday management system',
    'academic calendar software',
    'emergency holiday declaration',
    'school calendar app for parents',
    'parent notification system',
    'WhatsApp school alerts',
    'bulk import holidays',
    'working day calculator for schools',
    'school holiday tracking',
    'academic year planner',
  ],
  authors: [{ name: 'Shiksha Cloud' }],
  creator: 'Shiksha Cloud',
  publisher: 'Shiksha Cloud',
  openGraph: {
    title: 'Smart Holiday Management for Schools - Shiksha Cloud',
    description:
      'Declare holidays in 8 seconds. WhatsApp notifications. Real-time working day calculator. Trusted by 500+ schools across India.',
    url: 'https://shiksha.cloud/features/holidays',
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://shiksha.cloud/og-holiday-management.jpg',
        width: 1200,
        height: 630,
        alt: 'School Holiday Management Dashboard - Shiksha Cloud',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Holiday Management System - Shiksha Cloud',
    description:
      'Never miss a school holiday. Instant WhatsApp notifications. 8-second emergency declaration. Save 40+ hours yearly.',
    images: ['https://shiksha.cloud/twitter-holiday-management.jpg'],
    creator: '@ShikshaCloud',
  },
  alternates: {
    canonical: 'https://shiksha.cloud/features/holidays',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'bWVzc2FnZS1pZC1ub3QtLXJlcGxhY2Utd2l0aC1yZWFsLWNvZGU', // TODO: Replace with actual Google Search Console verification code
  },
};


const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Shiksha Cloud Holiday Management System',
  description:
    'Comprehensive school holiday management system with emergency declaration, WhatsApp notifications, and real-time working day calculation.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web, iOS, Android',
  url: 'https://shiksha.cloud/features/holidays',
  author: {
    '@type': 'Organization',
    name: 'Shiksha Cloud',
    url: 'https://shiksha.cloud',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '500',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Emergency Holiday Declaration in 8 Seconds',
    'Real-time Working Day Calculation',
    'WhatsApp Notifications to Parents',
    'Bulk Import from Google Sheets',
    'Academic Calendar Dashboard',
    'Multi-Channel Notifications (WhatsApp, Push, Email ,SMS)',
    'Parent Portal with Calendar Sync',
    'Smart Delete and Cleanup',
    '5 Import Methods (Google Sheets, Excel, CSV, Paste, Upload)',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://shiksha.cloud',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Features',
      item: 'https://shiksha.cloud/features',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Holiday Management',
      item: 'https://shiksha.cloud/features/holidays',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How quickly can I declare an emergency school holiday?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'With our one-click emergency declaration system, you can notify all parents, students, and teachers within 30 seconds via WhatsApp and push notifications. Simply click "Declare Emergency Holiday," add an optional reason, confirm, and the system automatically sends alerts and updates all calendars.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I import holidays from my existing Excel sheet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Upload Excel/CSV files, paste data directly, or connect Google Sheets. Import 100+ holidays in under 2 minutes using any of our 5 import methods: Google Sheets integration, single holiday addition, paste data, template download, or instant file upload.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do parents receive notifications automatically when holidays are declared?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Parents receive instant WhatsApp messages and push notifications for all holidays, with priority alerts for emergency declarations. Our system achieves 98% notification acknowledgment within 10 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the working day calculation work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Our system automatically calculates remaining working days based on your academic calendar, updating in real-time whenever holidays are added or removed. It recognizes your school's working days (configurable) and excludes weekends, holidays, and any other non-working days from calculations.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I delete all holidays at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, admins have a secure bulk delete option with confirmation safeguards and automatic backup creation. You can delete single holidays or reset the entire academic year. Safety confirmations are required for bulk actions, and an undo option is available within 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can parents add holidays to their personal calendars?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Parents can download the school calendar to Google Calendar, Apple Calendar, Outlook, or any calendar app with one click. The calendar syncs automatically and updates when new holidays are declared.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do WhatsApp notifications work for school holidays?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use WhatsApp Business API (official, secure, and compliant). Parents receive professional messages directly in WhatsApp with full holiday details including date, reason, and holiday type. This is completely automated and achieves 98% open rates within 10 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a limit on the number of holidays I can declare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No limits. Declare as many holidays as needed. Import 100+ at once if required. All features including notifications, calendar updates, and working day calculations work regardless of the number of holidays.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I make a mistake declaring a holiday?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Easy fix! Delete the holiday with one click, and parents get an automatic notification about the correction. You can also edit holiday details without deleting. An undo option is available within 24 hours, and all changes are logged for audit purposes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need technical knowledge to use the holiday management system?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not at all. Our system works with simple Excel sheets, Google Sheets, or even copy-paste from anywhere. If you can use email, you can use our holiday management system. We also provide dedicated onboarding support and video tutorials for every feature.',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Shiksha Cloud',
  url: 'https://shiksha.cloud',
  logo: 'https://shiksha.cloud/logo.svg',
  description:
    'Complete school management system with holiday management, attendance tracking, fee management, and more.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-8459324821',
    contactType: 'Customer Support',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/ShikshaCloud',
    'https://twitter.com/ShikshaCloud',
    'https://www.linkedin.com/company/shiksha-cloud',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Declare School Holidays Using Shiksha Cloud',
  description:
    'Step-by-step guide to declaring and managing school holidays with automated notifications and calendar updates.',
  totalTime: 'PT30S',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Choose Declaration Method',
      text: 'Select your preferred method: single add, bulk import, Google Sheets, paste data, or upload file.',
      url: 'https://shiksha.cloud/features/holidays#import-methods',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'System Processes Instantly',
      text: 'System validates dates, checks for conflicts, and calculates working day impact automatically.',
      url: 'https://shiksha.cloud/features/holidays#validation',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Automatic Notifications Sent',
      text: 'WhatsApp, push notifications, and emails are sent automatically to all relevant users within 30 seconds.',
      url: 'https://shiksha.cloud/features/holidays#notifications',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Calendars Update in Real-Time',
      text: 'Student, parent, and teacher calendars sync automatically across all devices and platforms.',
      url: 'https://shiksha.cloud/features/holidays#calendar-sync',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Analytics Dashboard Refreshes',
      text: 'Working days recalculated, dashboard refreshed, and reports updated automatically.',
      url: 'https://shiksha.cloud/features/holidays#analytics',
    },
  ],
};

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Review',
  itemReviewed: {
    '@type': 'SoftwareApplication',
    name: 'Shiksha Cloud Holiday Management System',
  },
  author: {
    '@type': 'Organization',
    name: 'Mumbai International School',
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: '5',
    bestRating: '5',
  },
  reviewBody:
    "During last month's unexpected storm, we declared an emergency holiday and had 98% parent acknowledgment within 5 minutes. This system has saved us 40+ hours per academic year on calendar management.",
};


export default function page() {
  return (
    <>
      {/* Structured Data - JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(reviewSchema),
        }}
      />

      {/* Main Content - Client Component */}
      <HolidayLanding />
      <CallToAction
        variant="dark"
        heading={<>Plan the Academic Year<br />With Confidence</>}
        description="Set holidays, define working days, and let the whole school stay aligned automatically."
      />
    </>
  );
}