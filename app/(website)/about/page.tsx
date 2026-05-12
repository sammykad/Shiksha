import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Users, Shield, Zap, Heart, TrendingUp, CheckCircle2, Phone } from 'lucide-react';
import { CallToAction } from '@/components/website/shared/CallToAction';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'About Shiksha Cloud | India\'s School Management Platform',
  description: 'Transforming Indian education with affordable, AI-powered school management software. Founded by Sameer Kad. Trusted by 500+ schools.',
  keywords: [
    'about Shiksha Cloud',
    'school management software India',
    'edtech company India',
    'Sameer Kad founder',
    'school ERP company',
    'Indian education technology',
  ],
  alternates: {
    canonical: `${appUrl.origin}/about`,
    languages: {
      en: `${appUrl.origin}/about`,
      'x-default': `${appUrl.origin}/about`,
    },
  },
  openGraph: {
    title: 'About Shiksha Cloud | India\'s School Management Platform',
    description: 'Transforming Indian education with affordable, AI-powered school management software.',
    url: `${appUrl.origin}/about`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'About Shiksha Cloud',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'About Shiksha Cloud',
    description: 'Transforming Indian education with affordable school management software.',
    images: [`${appUrl.origin}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'Shiksha Cloud',
    url: 'https://shiksha.cloud',
    logo: 'https://shiksha.cloud/logo.svg',
    description: 'All-in-one school management platform to streamline students, fees, attendance, and reports.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Sameer Kad',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      telephone: '+91-8459324821',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://twitter.com/shiksha_cloud',
      'https://www.linkedin.com/company/shiksha-cloud',
      'https://www.facebook.com/shikshacloud',
    ],
  },
};

const values = [
  {
    icon: Target,
    title: 'Affordability First',
    description: 'Quality software shouldn\'t be a luxury. At ₹79/student/month, we make digital transformation accessible to every school in India.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Innovation',
    description: 'We bring cutting-edge AI to schools that have never used it. Plain-language reports, smart insights, and automated workflows.',
  },
  {
    icon: Shield,
    title: 'Safety & Compliance',
    description: 'POCSO Act compliance, data encryption, and anonymous complaint systems — student safety is non-negotiable.',
  },
  {
    icon: Users,
    title: 'Built for India',
    description: 'From UPI payments to WhatsApp notifications, from CBSE to State Boards — every feature is designed for Indian realities.',
  },
  {
    icon: Heart,
    title: 'Human-Centered Design',
    description: 'No technical expertise needed. If you can use WhatsApp, you can use Shiksha Cloud. Simple, intuitive, effective.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Improvement',
    description: 'We ship updates weekly. Customer feedback drives every feature. We grow together with the schools we serve.',
  },
];

const stats = [
  { value: '500+', label: 'Schools Trust Us' },
  { value: '8.4L+', label: 'Students Managed' },
  { value: '₹79', label: 'Per Student/Month' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
            Building the Future of{' '}
            <span className="text-[#7fb800]">Indian Education</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Shiksha Cloud was born from a simple belief: every school in India — regardless of size
            or budget — deserves access to world-class management technology.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            The Problem We Solve
          </h2>
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <p className="text-neutral-600 leading-relaxed mb-4">
              Indian schools manage millions of students using Excel sheets, paper registers, phone calls,
              and WhatsApp groups. Teachers waste hours on attendance. Admins struggle with fee reconciliation.
              Parents feel disconnected from their children's education.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Existing software is either too expensive (₹500+/student/month), too complex (requires IT staff),
              or too limited (only does one thing well). Most require expensive hardware that small schools
              can't afford.
            </p>
            <p className="text-neutral-700 font-semibold leading-relaxed">
              Shiksha Cloud changes all that. One platform. All features. ₹79/student/month. Zero hardware
              required. That's our promise.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-10 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:border-neutral-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7fb800]/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-[#7fb800]" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{value.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Meet the Founder
          </h2>
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7fb800] to-emerald-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                SK
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Sameer Kad</h3>
                <p className="text-sm text-[#7fb800] font-medium mb-4">Founder & CEO</p>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  A passionate technologist from Pune, Maharashtra, Sameer built Shiksha Cloud after
                  witnessing firsthand how small schools struggle with outdated management processes.
                  His vision: democratize school technology so every educator can focus on what matters
                  most — teaching.
                </p>
                <Link
                  href="/founder"
                  className="text-[#7fb800] font-medium text-sm hover:underline inline-flex items-center gap-1"
                >
                  Read the full story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Trusted by 100+ Schools Across India
          </h2>
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'No setup fees or hidden charges',
                'Free data migration from existing software',
                'Onboarding & training included',
                'CBSE, ICSE & State Board compliant',
                'Android & iOS mobile apps',
                'Dedicated customer support',
                'AI-powered reports included',
                '99.9% uptime guarantee',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7fb800] flex-shrink-0" />
                  <span className="text-sm text-neutral-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Join Our Journey
          </h2>
          <p className="text-lg text-neutral-500 mb-8">
            Help us build the future of Indian education. Get started with Shiksha Cloud today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
            >
              <Phone className="w-4 h-4" /> Talk to Us
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-8 py-3.5 rounded-full text-sm transition-colors"
            >
              Explore Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center p-4">
        <CallToAction />
      </div>
    </>
  );
}
