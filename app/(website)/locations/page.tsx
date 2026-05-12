'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight, MapPin, Building2, GraduationCap, Star, Zap, Phone, Users, Globe2, Clock } from 'lucide-react';
import { LOCATION_PAGES } from '@/lib/locations';

/* ═══════════════════ DATA ═══════════════════ */

const stats = [
  { value: '500+', label: 'Schools Trust Us', icon: Users },
  { value: '10+', label: 'Cities Covered', icon: Globe2 },
  { value: '8.4L+', label: 'Active Students', icon: GraduationCap },
  { value: '24/7', label: 'Local Support', icon: Clock },
];

const whyLocal = [
  {
    icon: GraduationCap,
    title: 'Local Expertise',
    description: 'We understand the unique challenges of schools in your city — from CBSE compliance to state board requirements.',
    impact: 'Region-aware',
  },
  {
    icon: MapPin,
    title: 'On-Ground Support',
    description: 'Our team is present in your city for in-person training, support, and quick issue resolution.',
    impact: 'Same-day response',
  },
  {
    icon: Building2,
    title: 'Community Trust',
    description: 'Join hundreds of schools in your city who trust Shiksha Cloud for their daily operations.',
    impact: '500+ schools',
  },
];

/* ═══════════════════ CITY CARD ═══════════════════ */

function CityCard({ location, index }: { location: typeof LOCATION_PAGES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      viewport={{ once: true }}
    >
      <Link href={`/${location.slug}/school-management-software`} className="block h-full group">
        <div className="relative bg-white rounded-2xl border border-neutral-100 p-6 h-full flex flex-col hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden">
          {/* Hover tint */}
          <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                <Building2 className="w-4.5 h-4.5 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
              </div>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-colors duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
              </div>
            </div>

            {/* City name */}
            <div className="mb-1.5">
              <h3 className="text-base font-semibold tracking-tight text-neutral-900">{location.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium line-clamp-1">{location.areaServed}</p>
            </div>

            {/* Landmark pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 flex-1">
              {location.landmarks.slice(0, 3).map((lm) => (
                <span key={lm} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-[#f4fdd4] text-lime-700 border-lime-200">
                  {lm}
                </span>
              ))}
              {location.landmarks.length > 3 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-neutral-50 text-neutral-500 border-neutral-200">
                  +{location.landmarks.length - 3} more
                </span>
              )}
            </div>

            {/* Bottom impact */}
            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-neutral-400" strokeWidth={2} />
              <span className="text-xs font-semibold text-neutral-500">View local page</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════ WHY LOCAL CARD ═══════════════════ */

function WhyCard({ item, index }: { item: typeof whyLocal[0]; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.09 }}
      className="group relative bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300 mb-5">
          <Icon className="w-4.5 h-4.5 text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-neutral-900 mb-1">{item.title}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed flex-1">{item.description}</p>
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
          <Zap className="w-3 h-3 text-neutral-400" strokeWidth={2} />
          <span className="text-xs font-semibold text-neutral-500">{item.impact}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ PAGE ═══════════════════ */

export default function LocationsPage() {
  return (
    <div className="relative overflow-x-hidden bg-[#f8f8f6] min-h-screen">

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-center text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-7"
            >
              <MapPin className="w-3.5 h-3.5 text-[#7fb800]" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                Serving Schools Across India
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-3xl">
              School Management Software{' '}
              <span className="relative inline-block">
                In Your City
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-[#d9f972] -z-10 block"
                />
              </span>
            </h1>

            <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Shiksha Cloud is trusted by 500+ schools across 10+ Indian cities.
              From Pune to Kolkata, we're transforming education management with
              cloud-based ERP built for Indian schools.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-9">
              <Link
                href="/select-organization"
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="tel:+918459324821"
                className="w-full sm:w-auto bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                +91-8459324821
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="bg-white border border-neutral-100 rounded-2xl px-6 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center"
                >
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                  <div className="text-xs text-neutral-400 mt-0.5 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Cities Grid ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={1} />
              <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                {LOCATION_PAGES.length} Cities · Growing Every Month
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] max-w-2xl mx-auto">
              Our Presence Across India
            </h2>
            <p className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Select your city to explore school management software tailored to
              your region's specific requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOCATION_PAGES.map((location, i) => (
              <CityCard key={location.slug} location={location} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Local ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] max-w-2xl mx-auto">
              Why Choose a Local School Management Partner?
            </h2>
            <p className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Local presence means better support, understanding of regional
              requirements, and faster response times.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyLocal.map((item, i) => (
              <WhyCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pb-24 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-900 rounded-3xl px-10 py-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
                <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">Get Started</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4 leading-[1.15]">
                Ready to Transform Your School?
              </h2>
              <p className="text-white/50 text-base max-w-lg mx-auto mb-9 leading-relaxed">
                Join schools across India using Shiksha Cloud for seamless management.
                No credit card. No setup fee.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/select-organization"
                  className="w-full sm:w-auto bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="tel:+918459324821"
                  className="w-full sm:w-auto bg-transparent hover:bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                  Call +91-8459324821
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}