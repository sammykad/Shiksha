import { Metadata } from 'next';
import Link from 'next/link';
import { CallToAction } from '@/components/website/shared/CallToAction';
import { Plug, Shield, Zap, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
  title: 'School Software Integrations | UPI, WhatsApp | Shiksha',
  description: 'Connect UPI payments, WhatsApp Business, SMS gateways, biometric devices & more. All integrations included in every plan. Trusted by 1,200+ schools.',
  keywords: [
    'school software integrations',
    'UPI payment integration school',
    'WhatsApp Business API school',
    'school ERP API',
    'biometric attendance integration',
    'school SMS gateway',
    'school software connectors',
  ],
  alternates: {
    canonical: `${appUrl.origin}/features/integration`,
    languages: {
      en: `${appUrl.origin}/features/integration`,
      'x-default': `${appUrl.origin}/features/integration`,
    },
  },
  openGraph: {
    title: 'School Software Integrations | Shiksha Cloud',
    description: 'Connect with UPI, WhatsApp, SMS, biometric devices and more.',
    url: `${appUrl.origin}/features/integration`,
    siteName: 'Shiksha Cloud',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${appUrl.origin}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Shiksha Cloud - Integrations',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Software Integrations | Shiksha Cloud',
    description: 'Connect with UPI, WhatsApp, SMS, biometric devices and more.',
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
  'name': 'Shiksha Cloud — Integrations',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'Web, Android, iOS',
  'description': 'Connect Shiksha Cloud with UPI payments, WhatsApp Business API, SMS gateways, biometric/RFID devices, and cloud services. All integrations included in every plan.',
  'url': `${appUrl.origin}/features/integration`,
  'offers': {
    '@type': 'Offer',
    'price': '79',
    'priceCurrency': 'INR',
    'description': 'Per student per month, all integrations included',
  },
  'featureList': [
    'UPI payment gateway (Google Pay, PhonePe, Paytm)',
    'WhatsApp Business API built-in',
    'SMS gateway for bulk alerts',
    'Biometric & RFID device integration',
    'Email service integration',
    'API access for custom integrations',
  ],
  'audience': {
    '@type': 'Audience',
    'audienceType': 'School IT administrators and technology teams in India',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What payment gateways does Shiksha Cloud support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Shiksha Cloud supports UPI payments (Google Pay, PhonePe, Paytm), net banking, credit/debit cards, and digital wallets through our integrated payment gateway partners.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I integrate biometric/RFID attendance with Shiksha Cloud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Shiksha Cloud supports optional RFID and biometric device integration for schools that want hardware-based attendance tracking alongside our 2-tap digital system.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Shiksha Cloud integrate with WhatsApp Business API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Shiksha Cloud has built-in WhatsApp Business API integration for automated attendance alerts, fee reminders, exam notifications, and emergency announcements.',
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
    { '@type': 'ListItem', position: 3, name: 'Integrations', item: `${appUrl.origin}/features/integration` },
  ],
};

const integrations = [
  {
    icon: Zap,
    title: 'UPI Payments',
    description: 'Accept fees via Google Pay, PhonePe, Paytm, and any UPI-enabled app. Auto-reconciliation included.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Plug,
    title: 'WhatsApp Business API',
    description: 'Automated attendance alerts, fee reminders, exam notifications, and emergency announcements via WhatsApp.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'SMS Gateway',
    description: 'Bulk SMS for announcements, alerts, and notifications. Fallback channel when WhatsApp is unavailable.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Shield,
    title: 'Biometric & RFID Devices',
    description: 'Optional hardware integration for RFID cards, fingerprint scanners, and facial recognition attendance.',
    color: 'from-orange-500 to-red-600',
  },
];

export default function IntegrationPage() {
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

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
            <Plug className="w-3.5 h-3.5 text-[#7fb800]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Integrations & Connectivity
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
            School Software Integrations —{' '}
            <span className="text-[#7fb800]">Connect Everything, Zero Effort.</span>
          </h1>

          <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Shiksha Cloud connects with UPI payments, WhatsApp Business, SMS gateways,
            biometric devices, and more — so you can run your entire school from one platform.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.title}
                className="group relative bg-white border border-neutral-200 rounded-2xl p-8 hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {integration.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-neutral-100 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              All Integrations Included in Every Plan
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'UPI payment gateway (GPay, PhonePe, Paytm)',
                'WhatsApp Business API built-in',
                'SMS gateway for bulk alerts',
                'Email service integration',
                'Push notification system',
                'Optional RFID/biometric support',
                'Cloud backup & data sync',
                'API access for custom integrations',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7fb800] flex-shrink-0" />
                  <span className="text-sm text-neutral-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Features That Work Together
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Fee Management', href: '/features/fee-management', desc: 'Auto-collect fees via UPI with WhatsApp reminders' },
              { title: 'Smart Notifications', href: '/features/notification-engine', desc: '5-channel alert system for every event' },
              { title: 'Attendance Tracking', href: '/features/attendance', desc: '2-tap attendance with RFID option' },
            ].map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group block bg-slate-50 rounded-xl p-6 border-2 border-slate-200 hover:border-[#7fb800] hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-[#7fb800] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">{feature.desc}</p>
                <div className="text-[#7fb800] text-sm font-medium group-hover:underline flex items-center gap-1">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CallToAction
        variant="dark"
        badge="Integrations"
        heading={<>Connects With the Tools<br />You Already Use</>}
        description="Plug Shiksha Cloud into your existing ERP, payment gateways, and communication platforms."
      />
    </>
  );
}
