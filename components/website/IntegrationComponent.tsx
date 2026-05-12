'use client';

import { cn } from '@/lib/utils';
import {
  Google,
  Facebook,
  Instagram,
  WhatsApp,
  ShikshaLogo,
  GoogleClassroom,
  Resend,
} from '@/components/website/Icons';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useRef, useEffect, useState, forwardRef, createRef } from 'react';

const INTEGRATIONS = [
  {
    icon: Google,
    label: 'Google Forms',
    description: 'Capture admission leads directly from Google Forms into your CRM.',
  },
  {
    icon: Facebook,
    label: 'Facebook Ads',
    description: 'Sync Facebook ad leads to your admission pipeline automatically.',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    description: 'Pull DMs and lead forms from Instagram into one dashboard.',
  },
  {
    icon: WhatsApp,
    label: 'WhatsApp',
    description: 'Send fee reminders, notices, and receipts via WhatsApp instantly.',
  },
  {
    icon: GoogleClassroom,
    label: 'Google Classroom',
    description: 'Link class assignments and student data with your school records.',
  },
  {
    icon: Resend,
    label: 'Email (Resend)',
    description: 'Deliver transactional emails — receipts, alerts, reports — reliably.',
  },
];

// ─── Animated beam between two DOM refs ───────────────────────────────────────
function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  delay = 0,
  id,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  delay?: number;
  id: string;
}) {
  const [coords, setCoords] = useState<{ path: string; len: number } | null>(null);

  useEffect(() => {
    function calculate() {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!container || !from || !to) return;

      const cRect = container.getBoundingClientRect();
      const fRect = from.getBoundingClientRect();
      const tRect = to.getBoundingClientRect();

      const x1 = fRect.left - cRect.left + fRect.width / 2;
      const y1 = fRect.top - cRect.top + fRect.height / 2;
      const x2 = tRect.left - cRect.left + tRect.width / 2;
      const y2 = tRect.top - cRect.top + tRect.height / 2;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 - 24;
      const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) * 1.15;

      setCoords({ path, len });
    }

    // Wait a tick for layout to settle
    const t = setTimeout(calculate, 50);
    window.addEventListener('resize', calculate);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', calculate);
    };
  }, [containerRef, fromRef, toRef]);

  if (!coords) return null;

  const { path, len } = coords;
  const gradId = `grad-${id}`;
  const beamLen = len * 0.28;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible', zIndex: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Static dim track */}
      <path
        d={path}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        className="dark:stroke-neutral-700"
      />

      {/* Moving beam */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${beamLen} ${len}`}
        strokeDashoffset="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          from={`${len + beamLen}`}
          to={`${-(len + beamLen)}`}
          dur="2s"
          begin={`${delay}s`}
          repeatCount="indefinite"
          calcMode="linear"
        />
      </path>
    </svg>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function ConnectedChannels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>(
    INTEGRATIONS.map(() => createRef<HTMLDivElement>())
  );

  return (
    <section className="py-24 dark:bg-neutral-900">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            Connected Channels
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4 leading-snug">
            Works with the tools your school already uses
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Shiksha Cloud connects to WhatsApp, Google, Facebook, and more —
            so leads, notices, and payments flow in automatically. No manual copy-paste.
          </p>
        </div>

        {/* Canvas: beams + logo + cards */}
        <div ref={containerRef} className="relative">

          {/* Beams — rendered at z-0, behind cards */}
          {cardRefs.current.map((cardRef, i) => (
            <AnimatedBeam
              key={i}
              id={`beam-${i}`}
              containerRef={containerRef as React.RefObject<HTMLDivElement>}
              fromRef={centerRef as React.RefObject<HTMLDivElement>}
              toRef={cardRef}
              delay={i * 0.32}
            />
          ))}

          {/* Center hub */}
          <div className="flex justify-center mb-10" style={{ position: 'relative', zIndex: 10 }}>
            <div
              ref={centerRef}
              className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm"
            >
              <ShikshaLogo className="size-9" />
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" style={{ position: 'relative', zIndex: 10 }}>
            {INTEGRATIONS.map((item, index) => (
              <IntegrationCard
                key={index}
                item={item}
                ref={cardRefs.current[index]}
              />
            ))}
          </div>
        </div>

        {/* CTA bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            More channels coming soon.{' '}
            <span className="font-medium text-slate-800 dark:text-white">
              Your workflow, connected end to end.
            </span>
          </p>
          <Link
            href="/features"
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline shrink-0"
          >
            See all connected channels
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
const IntegrationCard = forwardRef<HTMLDivElement, { item: (typeof INTEGRATIONS)[0] }>(
  ({ item }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group flex items-start gap-4 px-5 py-5',
          'bg-white dark:bg-neutral-800',
          'border border-slate-100 dark:border-neutral-700',
          'rounded-2xl',
          'hover:border-blue-200 dark:hover:border-blue-800',
          'hover:shadow-sm',
          'transition-all duration-200'
        )}
      >
        <div className="w-10 h-10 rounded-xl border border-slate-100 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 flex items-center justify-center shrink-0">
          <item.icon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {item.label}
          </p>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    );
  }
);

IntegrationCard.displayName = 'IntegrationCard';