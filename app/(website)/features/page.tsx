import { CallToAction } from '@/components/website/shared/CallToAction';
import FeaturesList from '@/components/website/features/FeaturesList';
import { generateLocationPaths } from '@/lib/locations';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Star, CheckCircle2, ArrowRight } from 'lucide-react';

export const generateStaticParams = generateLocationPaths;
export const dynamicParams = false;
export const dynamic = 'force-static';

interface Props {
  params: Promise<{ location: string }>;
}

const CITY_DATA: Record<string, { areaServed: string; landmarks: string[] }> = {
  pune: {
    areaServed: 'Pune, Pimpri-Chinchwad, Hinjewadi, Wakad, Baner, Aundh',
    landmarks: ['Symbiosis Institute', 'MIT', 'Modern College', 'FC Road', 'JM Road'],
  },
  mumbai: {
    areaServed: 'Mumbai, Navi Mumbai, Thane, Kalyan, Vasai-Virar',
    landmarks: ['University of Mumbai', 'IIT Bombay', 'NMIMS', 'Andheri', 'Bandra'],
  },
  delhi: {
    areaServed: 'Delhi, NCR, Gurgaon, Noida, Faridabad, Ghaziabad',
    landmarks: ['Delhi University', 'IIT Delhi', 'Connaught Place', 'Dwarka'],
  },
  bangalore: {
    areaServed: 'Bangalore, Whitefield, Electronic City, Koramangala, Indiranagar',
    landmarks: ['IISc', 'IIM Bangalore', 'MG Road', 'Whitefield IT Hub'],
  },
  hyderabad: {
    areaServed: 'Hyderabad, Gachibowli, Madhapur, Secunderabad, Kukatpally',
    landmarks: ['IIIT Hyderabad', 'ISB', 'HITEC City', 'Charminar'],
  },
  chennai: {
    areaServed: 'Chennai, T Nagar, Anna Nagar, Adyar, Velachery',
    landmarks: ['IIT Madras', 'Anna University', 'T Nagar', 'Marina Beach'],
  },
  kolkata: {
    areaServed: 'Kolkata, Howrah, Salt Lake, New Town, Dum Dum',
    landmarks: ['Presidency University', 'IIM Calcutta', 'Park Street'],
  },
  ahmedabad: {
    areaServed: 'Ahmedabad, Gandhinagar, GIFT City, Satellite, Vastrapur',
    landmarks: ['IIM Ahmedabad', 'Gujarat University', 'SG Highway'],
  },
  jaipur: {
    areaServed: 'Jaipur, Malviya Nagar, Vaishali Nagar, Tonk Road',
    landmarks: ['University of Rajasthan', 'MNIT', 'Pink City'],
  },
  lucknow: {
    areaServed: 'Lucknow, Gomti Nagar, Aliganj, Indira Nagar',
    landmarks: ['Lucknow University', 'IIM Lucknow', 'Hazratganj'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: rawLocation } = await params;
  const location = rawLocation ?? 'india';
  const locationName = location.charAt(0).toUpperCase() + location.slice(1);
  const canonicalUrl = `https://shiksha.cloud/${location}/school-management-software`;
  const cityInfo = CITY_DATA[location];

  const title = `Best School Management Software in ${locationName} | Shiksha Cloud`;
  const description = `Leading cloud-based school ERP in ${locationName}. Automate attendance, fees, communication & admin. Trusted by 500+ schools. Free demo available.`;

  return {
    title,
    description,
    keywords: [
      `school management software ${locationName}`,
      `school ERP ${locationName}`,
      `school management system ${locationName}`,
      `educational software ${locationName}`,
      `student management system ${locationName}`,
      `fee management software ${locationName}`,
      `attendance management system ${locationName}`,
      `cloud school software ${locationName}`,
      `digital school platform ${locationName}`,
      `education ERP ${locationName}`,
      'school automation',
      'online fee payment',
      'student portal',
      'parent app',
      'teacher management',
      ...(cityInfo?.landmarks || []),
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: { en: canonicalUrl, 'x-default': canonicalUrl },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_IN',
      url: canonicalUrl,
      siteName: 'Shiksha Cloud',
      images: [{ url: 'https://shiksha.cloud/og-image.png', width: 1200, height: 630, alt: `Shiksha Cloud - School Management Software in ${locationName}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shiksha_cloud',
      title,
      description,
      images: ['https://shiksha.cloud/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

function generateStructuredData(locationName: string, location: string) {
  const cityInfo = CITY_DATA[location];

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://shiksha.cloud',
    name: `Shiksha Cloud - School Management Software in ${locationName}`,
    description: `Cloud-based school management software serving educational institutions in ${locationName}.`,
    url: 'https://shiksha.cloud',
    logo: 'https://shiksha.cloud/logo.svg',
    telephone: '+91-8459324821',
    address: { '@type': 'PostalAddress', addressLocality: locationName, addressCountry: 'IN' },
    areaServed: cityInfo?.areaServed || locationName,
    priceRange: '₹79 - ₹199 per student/month',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '500', bestRating: '5', worstRating: '1' },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shiksha.cloud/' },
      { '@type': 'ListItem', position: 2, name: 'Locations', item: 'https://shiksha.cloud/locations' },
      { '@type': 'ListItem', position: 3, name: locationName, item: `https://shiksha.cloud/${location}/school-management-software` },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the best school management software in ${locationName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Shiksha Cloud is the leading school management software in ${locationName}, trusted by 500+ schools. Starting at ₹79/student/month.` },
      },
      {
        '@type': 'Question',
        name: 'How much does school management software cost?',
        acceptedAnswer: { '@type': 'Answer', text: 'Shiksha Cloud starts at ₹79 per student per month with no setup fees or hidden charges.' },
      },
      {
        '@type': 'Question',
        name: 'Is there a mobile app for parents and teachers?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Shiksha Cloud includes mobile apps for both Android and iOS with real-time notifications.' },
      },
    ],
  };

  return { localBusiness, breadcrumb, faq };
}

export default async function LocationPage({ params }: Props) {
  const { location: rawLocation } = await params;
  const location = rawLocation ?? 'india';
  const locationName = location.charAt(0).toUpperCase() + location.slice(1);
  const cityInfo = CITY_DATA[location];
  const { localBusiness, breadcrumb, faq } = generateStructuredData(locationName, location);

  return (
    <>
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      {/* Location hero banner — replaces the generic FeaturesList header */}
      <div className="pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">

          {/* Location badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-7">
            <MapPin className="w-3.5 h-3.5 text-[#7fb800]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Now serving {locationName} & surrounding areas
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl mx-auto">
            School Management Software in{' '}
            <span className="relative inline-block">
              {locationName}
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#d9f972] -z-10 block" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Trusted by 500+ schools across India — Shiksha Cloud automates attendance,
            fees, communication & administration so you can focus on education.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link
              href="/select-organization"
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              Book Free Demo <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              href="tel:+918459324821"
              className="w-full sm:w-auto bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={2} /> +91-8459324821
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              { value: '500+', label: 'Schools Trust Us' },
              { value: '8.4L+', label: 'Students Managed' },
              { value: '₹79', label: 'Per Student/Month' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-neutral-100 rounded-2xl px-6 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
                <div className="text-xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Coverage strip */}
          {cityInfo && (
            <div className="mt-8 bg-white border border-neutral-100 rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#7fb800]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-neutral-700">Coverage in {locationName}</span>
                </div>
                <p className="text-sm text-neutral-500">{cityInfo.areaServed}</p>
              </div>
              {cityInfo.landmarks.length > 0 && (
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Nearby Institutions</p>
                  <div className="flex flex-wrap gap-2">
                    {cityInfo.landmarks.map((lm) => (
                      <span key={lm} className="text-xs bg-[#f4fdd4] text-lime-700 border border-lime-200 px-2.5 py-1 rounded-full font-medium">
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All features — reuses the exact same component as /features */}
      <FeaturesList />

      {/* Why us — local SEO content block */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto bg-white border border-neutral-100 rounded-3xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={1} />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Why {locationName} Schools Choose Us</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-6">
            Everything included, no surprises
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'No setup fees or hidden charges',
              'Free data migration from existing software',
              'Onboarding & training included',
              'CBSE, ICSE & State Board compliant',
              'Android & iOS mobile apps',
              'Dedicated customer support',
            ].map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d9f972] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-neutral-800" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-neutral-700 font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
        <CallToAction />
      </div>
    </>
  );
}