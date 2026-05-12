// app/[location]/school-management-software/page.tsx
// Server component — metadata + structured data + renders the client page

import type { Metadata } from 'next';
import { generateLocationPaths } from '@/lib/locations';
import Script from 'next/script';
import LocationLanding from '@/components/website/location/location-landing';

export const generateStaticParams = generateLocationPaths;
export const dynamicParams = false;
export const dynamic = 'force-static';

interface Props {
  params: Promise<{ location: string }>;
}

const CITY_DATA: Record<string, { areaServed: string; landmarks: string[] }> = {
  india: {
    areaServed: 'Pan India — Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad',
    landmarks: ['CBSE', 'ICSE', 'State Boards', 'IGCSE', 'IB Schools'],
  },
  pune: {
    areaServed: 'Pune, Pimpri-Chinchwad, Hinjewadi, Wakad, Baner, Aundh, Kothrud, Deccan',
    landmarks: ['Symbiosis Institute', 'MIT Pune', 'Modern College', 'FC Road', 'JM Road', 'MG Road', 'Koregaon Park', 'Viman Nagar'],
  },
  mumbai: {
    areaServed: 'Mumbai, Navi Mumbai, Thane, Kalyan, Vasai-Virar, Mira-Bhayandar',
    landmarks: ['University of Mumbai', 'IIT Bombay', 'NMIMS', 'Andheri', 'Bandra', 'Powai', 'Borivali'],
  },
  delhi: {
    areaServed: 'Delhi, NCR, Gurgaon, Noida, Faridabad, Ghaziabad, Dwarka',
    landmarks: ['Delhi University', 'IIT Delhi', 'Connaught Place', 'Dwarka', 'Rohini', 'Janakpuri'],
  },
  bangalore: {
    areaServed: 'Bangalore, Whitefield, Electronic City, Koramangala, Indiranagar, Jayanagar',
    landmarks: ['IISc Bangalore', 'IIM Bangalore', 'MG Road', 'Whitefield IT Hub', 'HSR Layout', 'Malleshwaram'],
  },
  hyderabad: {
    areaServed: 'Hyderabad, Gachibowli, Madhapur, Secunderabad, Kukatpally, LB Nagar',
    landmarks: ['IIIT Hyderabad', 'ISB Hyderabad', 'HITEC City', 'Charminar', 'Banjara Hills', 'Jubilee Hills'],
  },
  chennai: {
    areaServed: 'Chennai, T Nagar, Anna Nagar, Adyar, Velachery, Tambaram',
    landmarks: ['IIT Madras', 'Anna University', 'T Nagar', 'Marina Beach', 'Nungambakkam', 'Mylapore'],
  },
  kolkata: {
    areaServed: 'Kolkata, Howrah, Salt Lake, New Town, Dum Dum, Jadavpur',
    landmarks: ['Presidency University', 'IIM Calcutta', 'Park Street', 'Salt Lake', 'Ballygunge', 'New Alipore'],
  },
  ahmedabad: {
    areaServed: 'Ahmedabad, Gandhinagar, GIFT City, Satellite, Vastrapur, Bodakdev',
    landmarks: ['IIM Ahmedabad', 'Gujarat University', 'SG Highway', 'Maninagar', 'Navrangpura'],
  },
  jaipur: {
    areaServed: 'Jaipur, Malviya Nagar, Vaishali Nagar, Tonk Road, Civil Lines',
    landmarks: ['University of Rajasthan', 'MNIT Jaipur', 'Pink City', 'Malviya Nagar', 'C-Scheme'],
  },
  lucknow: {
    areaServed: 'Lucknow, Gomti Nagar, Aliganj, Indira Nagar, Hazratganj',
    landmarks: ['Lucknow University', 'IIM Lucknow', 'Hazratganj', 'Gomti Nagar', 'Alambagh'],
  },
  nagpur: {
    areaServed: 'Nagpur, Amravati, Wardha, Yavatmal, Chandrapur',
    landmarks: ['VNIT Nagpur', 'Nagpur University', 'Sitabuldi', 'Dharampeth', 'Ramdaspeth'],
  },
  indore: {
    areaServed: 'Indore, Bhopal, Ujjain, Dewas, Pithampur',
    landmarks: ['IIM Indore', 'IIT Indore', 'Vijay Nagar', 'Palasia', 'AB Road'],
  },
  bhopal: {
    areaServed: 'Bhopal, Indore, Jabalpur, Gwalior, Sagar',
    landmarks: ['MANIT Bhopal', 'Barkatullah University', 'MP Nagar', 'Arera Colony', 'Kolar Road'],
  },
  surat: {
    areaServed: 'Surat, Vadodara, Bharuch, Ankleshwar, Navsari',
    landmarks: ['SVNIT Surat', 'Veer Narmad South Gujarat University', 'Adajan', 'Vesu', 'Athwa'],
  },
  vadodara: {
    areaServed: 'Vadodara, Anand, Bharuch, Gandhinagar, Kheda',
    landmarks: ['MS University Vadodara', 'IIMA Vadodara', 'Alkapuri', 'Fatehgunj', 'Akota'],
  },
  kochi: {
    areaServed: 'Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Ernakulam',
    landmarks: ['CUSAT', 'IIM Kozhikode', 'Marine Drive', 'Kakkanad', 'Edapally'],
  },
  chandigarh: {
    areaServed: 'Chandigarh, Mohali, Panchkula, Zirakpur, Derabassi',
    landmarks: ['PU Chandigarh', 'PEC University', 'Sector 17', 'Sector 35', 'IT Park Mohali'],
  },
  visakhapatnam: {
    areaServed: 'Visakhapatnam, Vijayawada, Rajahmundry, Kakinada, Guntur',
    landmarks: ['GITAM University', 'Andhra University', 'Steel Plant Area', 'Gajuwaka', 'MVP Colony'],
  },
  coimbatore: {
    areaServed: 'Coimbatore, Madurai, Salem, Tiruchirappalli, Erode',
    landmarks: ['PSG College', 'Amrita University', 'RS Puram', 'Gandhipuram', 'Peelamedu'],
  },
  patna: {
    areaServed: 'Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga',
    landmarks: ['Patna University', 'NIT Patna', 'Bailey Road', 'Boring Road', 'Kankarbagh'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const locationName = location.charAt(0).toUpperCase() + location.slice(1);
  const canonicalUrl = `https://shiksha.cloud/${location}/school-management-software`;
  const cityInfo = CITY_DATA[location];

  const title = `School Management Software in ${locationName} | Shiksha Cloud`;
  const description = `Cloud-based school ERP in ${locationName}. Automate attendance, fees, communication & admin. Trusted by 500+ schools. Free demo.`;

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
      'academic management system',
      ...(cityInfo?.landmarks || []),
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': canonicalUrl,
        'hi': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    other: {
      'geo.region': `IN-${location.toUpperCase()}`,
      'geo.placename': locationName,
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

/* ── Structured data helpers (same as before) ── */

function localBusinessSD(locationName: string, cityInfo?: { areaServed: string }) {
  return {
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
    priceRange: '₹79 - ₹100 per student/month',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '500', bestRating: '5', worstRating: '1' },
  };
}

function faqSD(locationName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the best school management software in ${locationName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Shiksha Cloud is the leading school management software in ${locationName}, trusted by 500+ schools.` },
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
}

/* ── Page ── */

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  const locationName = location.charAt(0).toUpperCase() + location.slice(1);
  const cityInfo = CITY_DATA[location];

  return (
    <>
      {/* Structured data */}
      <Script
        id="local-business-sd"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSD(locationName, cityInfo)) }}
      />
      <Script
        id="faq-sd"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSD(locationName)) }}
      />

      {/* Client component with all visual UI */}
      <LocationLanding
        locationName={locationName}
        areaServed={cityInfo?.areaServed || locationName}
        landmarks={cityInfo?.landmarks || []}
      />
    </>
  );
}
