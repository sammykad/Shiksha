'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  Users, Clock, CreditCard, FileText, Bell, FileCheck,
  Calendar, BarChart3, Target, Plug, Shield,
} from 'lucide-react';
import type { FeatureConfig } from '@/lib/features-config';

/* ── icon map ── */
const ICON_MAP: Record<string, React.ElementType> = {
  Users, Clock, CreditCard, FileText, Bell, FileCheck,
  Calendar, BarChart3, Target, Plug, Shield,
};

interface RelatedFeaturesProps {
  features: FeatureConfig[];
  currentSlug: string;
  title?: string;
}

export function RelatedFeatures({
  features,
  currentSlug,
  title = 'Related Features',
}: RelatedFeaturesProps) {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              More Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            {title}
          </h2>
          <p className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Explore more features that work seamlessly together
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = ICON_MAP[feature.icon] ?? Shield;
            const isCurrentPage = feature.slug === currentSlug;

            const card = (
              <div className={`group relative bg-white rounded-2xl border border-neutral-100 p-6 h-full flex flex-col transition-all duration-300 overflow-hidden ${!isCurrentPage
                  ? 'hover:border-neutral-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] cursor-pointer'
                  : 'opacity-60 cursor-default'
                }`}>
                {/* Hover tint */}
                {!isCurrentPage && (
                  <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                )}

                <div className="relative z-10 flex flex-col h-full">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] border border-neutral-200 flex items-center justify-center group-hover:bg-[#d9f972] group-hover:border-transparent transition-all duration-300">
                      <Icon className="w-[18px] h-[18px] text-neutral-600 group-hover:text-neutral-800 transition-colors" strokeWidth={1.8} />
                    </div>
                    {!isCurrentPage && (
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-colors duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold tracking-tight text-neutral-900 mb-1">
                    {feature.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 mt-2">
                    {feature.description}
                  </p>


                </div>
              </div>
            );

            return isCurrentPage ? (
              <div key={feature.slug} className="h-full">{card}</div>
            ) : (
              <Link key={feature.slug} href={`/features/${feature.slug}`} className="h-full block">
                {card}
              </Link>
            );
          })}
        </div>

        {/* Footer link */}
        <div className="text-center mt-10">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors group"
          >
            View all features
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
          </Link>
        </div>

      </div>
    </section>
  );
}