
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
// import { CreateOrganization } from '@clerk/nextjs';
import DotPattern from '@/components/ui/dot-pattern';
import AnimatedShinyText from '@/components/ui/animated-shiny-text';
import { indianEducationProblems } from '@/constants';
import { cn } from '@/lib/utils';
import CardFlip from '@/components/ui/card-flip';
import BentoGrid from '@/components/website/BentoGrid';
import Features from '@/components/website/Features';
import Testimonials from '@/components/website/shared/Testimonials';
import IntegrationComponent from '@/components/website/IntegrationComponent';
import InstitutesShowcase from '@/components/website/shared/InstituteShowcase';
import FeatureHoverDots from '@/components/website/FeatureHoverDots';
import SchoolPainPoints from '@/components/website/SchoolPainPoints';
import { RoleAudienceSection } from '@/components/website/role-pages/RoleLandingPage';

// ─── Extracted reusable CTA ─────────────────────────────────────────
function EarlyAccessButton() {
  return (

    <Button asChild>
      <Link href="/select-organization" prefetch={true}>
        Get Early Access
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </Button>

  );
}

// function EarlyAccessButton() {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button>
//           Get Early Access
//           <ArrowRight className="w-4 h-4 ml-2" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-full h-full border-none bg-transparent p-0">
//         {/* <CreateOrganization afterCreateOrganizationUrl="/dashboard" /> */}
//       </PopoverContent>
//     </Popover>
//   );
// }

// ─── Page-specific metadata only (base metadata lives in layout.tsx) ─
export const metadata: Metadata = {
  // Homepage overrides the layout template to avoid triple branding
  title: {
    default: 'Shiksha Cloud — School Management Software India',
    template: '%s',
  },
  description:
    "India's most affordable school management software. Automate fees, attendance, exams & parent communication on one platform. Trusted by 100+ schools, colleges, and coaching institutes. Free demo available.",
  keywords: [
    'school management software India',
    'school ERP software',
    'school management system',
    'best school management software',
    'school management app',
    'school CRM software',
    'student information system',
    'online fee collection system',
    'school attendance software',
    'parent teacher communication app',
    'affordable school management software',
    'cloud based school ERP',
    'Indian school management system',
  ],
  alternates: {
    canonical: 'https://shiksha.cloud/',
    languages: {
      'en': 'https://shiksha.cloud/',
      'hi': 'https://shiksha.cloud/',
      'x-default': 'https://shiksha.cloud/',
    },
  },
  openGraph: {
    title: 'Shiksha Cloud — #1 School Management Software India',
    description:
      "India's most affordable school management software. Automate fees, attendance, exams & parent communication. Trusted by 100+ schools.",
    url: 'https://shiksha.cloud/',
    siteName: 'Shiksha Cloud',
    images: [
      {
        url: 'https://shiksha.cloud/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shiksha Cloud — School Management Software Dashboard',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    creator: '@DevSammyKad',
    title: 'Shiksha Cloud — #1 School Management Software India',
    description: "India's most affordable school management software. Trusted by 100+ schools. Free demo available.",
    images: ['https://shiksha.cloud/og-image.png'],
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
};

export default function IndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shiksha.cloud',
    url: 'https://shiksha.cloud',
    logo: 'https://shiksha.cloud/logo.svg',
    description:
      'India\'s most affordable all-in-one School Management CRM and ERP for Modern Education.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Shiksha.cloud School ERP',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: 'https://shiksha.cloud',
    image: 'https://shiksha.cloud/og-image.png',
    description:
      'All-in-one school management software for students, fees, attendance, exams, and parent communication. Built for Indian schools, colleges, and coaching institutes.',
    offers: {
      '@type': 'Offer',
      url: 'https://shiksha.cloud/pricing',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: 'https://shiksha.cloud/og-image.png',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://shiksha.cloud/',
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: indianEducationProblems.flatMap((problem) =>
      problem.faq.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      }))
    ),
  };
  return (
    <main className="mx-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section aria-label="Hero" className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300">
            <span>✨ Built for Indian Education</span>
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>

          <DotPattern
            className={cn('[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]')}
          />

          <h1 className="text-4xl mt-4 md:text-5xl font-bold text-slate-900 mb-6">
            School Management Software for India
            <br />
            <span className="text-lg md:text-xl bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent mt-3">
              Fees, Attendance, Exams — All in One Dashboard
            </span>
          </h1>

          <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
            Replace hundreds of spreadsheets with one platform trusted by 100+ Indian schools and colleges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <EarlyAccessButton />
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing" prefetch={true}>
                View Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Problems grid */}
      <section aria-label="Common problems solved by Shiksha Cloud" className="w-full px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {indianEducationProblems.map((problem) => (
            <CardFlip
              key={problem.id}
              title={problem.title}
              subtitle={problem.subtitle}
              description={problem.description}
              features={problem.features}
              imageSrc={problem.imageSrc}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            ये Problems आपको भी परेशान करती हैं?
          </h2>
          <p className="text-slate-600 text-lg">
            हर Indian educator की daily life में ये situations आती हैं। Solution भी यहीं है।
          </p>
          <div className="mt-6">
            <EarlyAccessButton />
          </div>
        </div>
      </section>

      {/* Features */}
      {/* <RoleAudienceSection /> */}
      <BentoGrid />
      <Features />
      <FeatureHoverDots />
      <SchoolPainPoints />
      <IntegrationComponent />
      <Testimonials />

      {/* Footer CTA */}
      <section aria-label="Call to action" className="text-center">
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300">
          <span>✨ Built for Indian Education</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>

        <DotPattern
          className={cn('[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]')}
        />

        <InstitutesShowcase />

        <h2 className="text-lg font-bold md:text-xl bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent mb-8">
          Manage Everything. From One Dashboard.
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          100+ institutes already trust Shiksha Cloud to run smarter, faster, and fully digital.
        </p>

        <div className="flex items-center justify-center gap-5 mt-5">
          <EarlyAccessButton />
          <Button size="lg" variant="outline" asChild>
            <Link href="https://gamma.app/docs/Shikshacloud-gtpghwx8wdrjyxs" target="_blank">
              Download PDF
            </Link>
          </Button>
        </div>
      </section>

    </main>
  );
}
