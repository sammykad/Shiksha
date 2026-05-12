import PricingSection from '@/components/website/pricing/PricingSection';
import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'School Software Pricing | ₹79/Student/Month | Shiksha Cloud',
  description: 'Transparent pricing at ₹79/student/month. No setup fees, no hidden charges. All features included. Start free today.',
  keywords: [
    'school management software pricing',
    'affordable school ERP India',
    'low cost school management system',
    'school software price India',
    'cheap school management software',
    'budget school ERP',
    'school CRM pricing',
    'student-based pricing school software',
    'monthly school management subscription',
  ],
  alternates: {
    canonical: `${appUrl.origin}/pricing`,
    languages: {
      en: `${appUrl.origin}/pricing`,
      'x-default': `${appUrl.origin}/pricing`,
    },
  },
  openGraph: {
    title: 'Transparent School Management Pricing | Shiksha Cloud',
    description: 'Empower your institution with premium features at the most affordable price in India. Starting at ₹79/student/month with no hidden fees.',
    url: `${appUrl.origin}/pricing`,
    siteName: 'Shiksha Cloud',
    images: [`${appUrl.origin}/og-image.png`],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'Affordable School Management Pricing | Shiksha Cloud',
    description: 'Only ₹79/student per month. Teachers and admins FREE. No setup fees or hidden costs.',
    images: [`${appUrl.origin}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const page = () => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is Shiksha Cloud pricing structured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Shiksha Cloud charges only ₹79 per student per month. Parents, teachers, and admins access the system for FREE. There are no setup fees or hidden charges.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a free trial available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer a free onboarding and trial period. You can start with any number of students and scale as your institution grows.',
        },
      },
      {
        '@type': 'Question',
        name: 'What features are included in the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All features are included: student management, attendance tracking, fee collection, exam management, parent communication, document verification, AI reports, and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can cancel your subscription anytime with no penalties. There are no long-term contracts.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="pricing-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen py-20">
        <PricingSection />
      </div>
    </>
  );
};

export default page;
