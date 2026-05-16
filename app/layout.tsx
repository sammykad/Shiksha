import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from 'sonner';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LazyMotion, domAnimation } from 'motion/react';
import { NotificationSummaryToaster, NotificationToaster } from '@/components/notification-toaster';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  // REMOVED: maximum-scale: 1 - this was causing the accessibility issue
  viewportFit: 'cover', // for notch support
  userScalable: true, // explicitly allow zooming
};
const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  metadataBase: new URL('https://shiksha.cloud'),
  alternates: {
    canonical: '/',
    languages: {
      'en': 'https://shiksha.cloud/',
      'hi': 'https://shiksha.cloud/',
      'x-default': 'https://shiksha.cloud/',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shiksha Cloud',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Shiksha Cloud',
    'format-detection': 'telephone=no',
    // 'apple-touch-fullscreen': 'yes',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  title: {
    default: 'School CRM | All-in-One School Management Platform',
    template: '%s | School CRM',
  },
  description:
    "India's most affordable school management software. Automate fees, attendance, exams & parent communication on one platform. Trusted by 100+ Indian schools, colleges, and coaching institutes. Free demo available.",
  generator: 'Next.js',
  keywords:
    'School CRM, School Management Software, Educational CRM, Student Management System, Attendance Tracker, Fee Management, School Administration Software, Coaching Institute Software',
  authors: [{ name: 'Sameer Kad', url: 'https://github.com/DevSammyKad' }],
  creator: 'Sameer Kad',
  applicationName: 'shiksha.cloud',
  publisher: 'Sameer Kad',
  referrer: 'origin-when-cross-origin',
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
  openGraph: {
    url: appUrl,
    title: 'Shiksha Cloud — School Management Software India',
    description:
      'India\'s all-in-one school management software. Automate fees, attendance, exams & parent communication. Trusted by schools across India.',
    type: 'website',
    siteName: 'Shiksha Cloud',
    images: [
      {
        url: `${appUrl.origin}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Shiksha Cloud — School Management Software Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    creator: '@DevSammyKad',
    title: 'Shiksha Cloud — School Management Software India',
    description:
      'India\'s all-in-one school management software. Automate fees, attendance, exams & parent communication.',
    images: [`${appUrl.origin}/og-image.png`],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Shiksha Cloud',
  url: 'https://shiksha.cloud',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://shiksha.cloud/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Shiksha Cloud',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: 'https://shiksha.cloud',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '100',
  },
};

// function DeferredAnalytics() {
//   return (
//     <>
//       <GoogleAnalytics gaId="G-Z9HW1EQ694" />
//       <GoogleTagManager gtmId="GTM-5KFRG7HG" />
//     </>
//   );
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className={`${GeistSans.variable} h-full`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <LazyMotion features={domAnimation}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </LazyMotion>
        <Toaster position="bottom-right" richColors />
        <NotificationToaster />
        <NotificationSummaryToaster />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-Z9HW1EQ694" />
        <Script
          id="gtm"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-5KFRG7HG"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
