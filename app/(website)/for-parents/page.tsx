import type { Metadata } from 'next';
import { getRolePage, RoleLandingPage } from '@/components/website/role-pages/RoleLandingPage';

const appUrl = 'https://shiksha.cloud';
const role = getRolePage('parents');

export const metadata: Metadata = {
  title: role.metaTitle,
  description: role.metaDescription,
  keywords: role.keywords,
  alternates: {
    canonical: `${appUrl}${role.href}`,
  },
  openGraph: {
    title: role.metaTitle,
    description: role.metaDescription,
    url: `${appUrl}${role.href}`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${appUrl}/og-image.png`, width: 1200, height: 630, alt: role.metaTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: role.metaTitle,
    description: role.metaDescription,
    images: [`${appUrl}/og-image.png`],
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Shiksha Cloud Parent Portal',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: `${appUrl}${role.href}`,
  description: role.metaDescription,
  offers: {
    '@type': 'Offer',
    price: '79',
    priceCurrency: 'INR',
    description: 'Per student per month. Admins, teachers, and parents are free.',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and guardians of school students in India',
  },
  featureList: role.features.map((feature) => feature.title),
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: role.faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${appUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'For Schools', item: `${appUrl}/for-schools` },
    { '@type': 'ListItem', position: 3, name: 'For Parents', item: `${appUrl}${role.href}` },
  ],
};

export default function ForParentsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RoleLandingPage role={role} />
    </>
  );
}
