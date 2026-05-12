'use client';

import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  ArrowRightIcon,
  Bell,
  ClipboardList,
  CreditCard,
  GraduationCap,
  IndianRupee,
  Sparkles,
  Workflow,
} from 'lucide-react';
import React, { lazy, Suspense, memo, useMemo } from 'react';
import AnimatedShinyText from '@/components/ui/animated-shiny-text';
import { MagicCard } from '@/components/ui/magic-card';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { LucideIcon } from 'lucide-react';
import { WhatsAppIcon } from '@/public/icons/WhatsAppIcon';

const Compare = lazy(() => import('@/components/ui/compare').then(mod => ({ default: mod.Compare })));
const AnimatedBeamMultipleOutput = lazy(() => import('./AnimatedBeamMultipleOutput').then(mod => ({ default: mod.AnimatedBeamMultipleOutput })));
const DisplayCards = lazy(() => import('@/components/ui/display-cards').then(mod => ({ default: mod.default })));

const NOTIFICATIONS = [
  { name: 'Fee Payment Received', description: 'A payment was successfully processed.', time: '15m ago', icon: '💰', color: '#00C9A7' },
  { name: 'Student Admission Approved', description: 'A new student has been enrolled.', time: '10m ago', icon: '🎓', color: '#28A745' },
  { name: 'New Complaint Filed', description: 'A complaint has been registered.', time: '5m ago', icon: '📝', color: '#FF3D71' },
  { name: 'New Notice Published', description: 'A new holiday or event notice is available.', time: '2m ago', icon: '📢', color: '#1E86FF' },
];

const Notification = memo(({ name, description, icon, color, time }: {
  name: string; description: string; icon: string; color: string; time: string;
}) => (
  <figure className={cn(
    'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
    'transition-all duration-200 ease-in-out hover:scale-[103%]',
    '[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
    'transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'
  )}>
    <div className="flex flex-row items-center gap-3">
      <div className="flex size-8 lg:size-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: color }}>
        <span className="text-base lg:text-lg">{icon}</span>
      </div>
      <div className="flex flex-col overflow-hidden">
        <figcaption className="flex items-center font-medium dark:text-white whitespace-pre">
          <span className="text-xs lg:text-sm">{name}</span>
          <span className="text-xs text-gray-500">. {time}</span>
        </figcaption>
        <p className="text-xs font-normal dark:text-white/60 truncate">{description}</p>
      </div>
    </div>
  </figure>
));
Notification.displayName = 'Notification';

const CardHeader = memo(({ icon: Icon, title, description }: {
  icon: LucideIcon; title: string; description: string;
}) => (
  <div className="mb-4 lg:mb-6">
    <div className="flex items-start gap-3 mb-3">
      <div className="mt-0.5 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shrink-0">
        <Icon className="size-4 lg:size-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm lg:text-xl font-semibold tracking-tight mb-1 lg:mb-2">{title}</h2>
        <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="h-px bg-white/10" />
  </div>
));
CardHeader.displayName = 'CardHeader';

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-slate-200 rounded', className)} />
);

const BentoGrid = () => {
  const notifications = useMemo(() => Array.from({ length: 4 }, () => NOTIFICATIONS).flat(), []);

  const defaultCards = useMemo(() => [
    {
      icon: <GraduationCap className="size-4 text-blue-300" />,
      title: 'Attendance Tracker',
      description: 'Mark & view attendance in seconds',
      date: 'Today',
      iconClassName: 'text-emerald-500',
      titleClassName: 'text-emerald-500',
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <IndianRupee className="size-4 text-blue-300" />,
      title: 'Fee Collection',
      description: 'Auto reminders & instant receipts',
      date: 'Just now',
      iconClassName: 'text-orange-500',
      titleClassName: 'text-orange-500',
      className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <ClipboardList className="size-4 text-blue-300" />,
      title: 'Exam Results',
      description: 'Publish results & share reports',
      date: '2 days ago',
      iconClassName: 'text-blue-500',
      titleClassName: 'text-blue-500',
      className: '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10',
    },
  ], []);

  return (
    <>
      {/* Badge */}
      <div className="mx-5 mb-5 mt-12 lg:mt-20 flex justify-center text-center">
        <div className={cn(
          'group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800'
        )}>
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <span>✨ Key Feature of this Cloud CRM</span>
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* 1 — Notifications (full width on mobile, 1 col on tablet+) */}
        <div className="col-span-1 sm:row-span-2">
          <MagicCard
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="h-full min-h-[420px] lg:min-h-[520px] p-4 lg:p-6"
          >
            <CardHeader
              icon={Bell}
              title="Real-time Notifications"
              description="Stay updated with instant alerts for payments, admissions, attendance, complaints, and announcements."
            />
            <div className="overflow-hidden max-h-[320px] lg:max-h-[380px]">
              <AnimatedList>
                {notifications.map((item, idx) => (
                  <AnimatedListItem key={idx}>
                    <Notification {...item} />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </div>
          </MagicCard>
        </div>

        {/* 2 — Compare (full width on mobile, 1 col on tablet+) */}
        <div className="col-span-1 sm:row-span-2">
          <MagicCard
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="h-full p-4 lg:p-6"
          >
            <CardHeader
              icon={ArrowLeftRight}
              title="Transform Your Workflow"
              description="See the difference between manual chaos and automated efficiency. Save 2.5+ hours daily."
            />
            {/* ✅ Remove fixed w-[470px] — use w-full instead */}
            <div className="flex items-center justify-center w-full overflow-hidden rounded-lg">
              <Suspense fallback={<SkeletonLoader className="h-[240px] lg:h-[370px] w-full" />}>
                <Compare
                  firstImage="/images/compare-one.png"
                  secondImage="/images/compare-two.png"
                  firstImageAlt="Manual school management chaos"
                  secondImageAlt="Streamlined school management with Shiksha Cloud"
                  firstImageClassName="object-cover object-left-top"
                  secondImageClassname="object-cover object-left-top"
                  className="h-[240px] sm:h-[300px] lg:h-[370px] w-full" // ✅ responsive height, full width
                  slideMode="hover"
                  autoplay={true}
                />
              </Suspense>
            </div>
          </MagicCard>
        </div>

        {/* 3 — Animated Beam (full width on mobile, 1 col on tablet+) */}
        <div className="col-span-1 sm:row-span-2">
          <MagicCard
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="h-full p-4 lg:p-6"
          >
            <CardHeader
              icon={Workflow}
              title="Smart Lead Management"
              description="Capture leads from Google Forms, Facebook, Instagram, and WhatsApp into your CRM dashboard."
            />
            <Suspense fallback={<SkeletonLoader className="h-48 lg:h-64 w-full" />}>
              <AnimatedBeamMultipleOutput />
            </Suspense>
          </MagicCard>
        </div>

        {/* 4 — Display Cards (full on mobile, 1 col on tablet, 1 col on desktop) */}
        <div className="col-span-1">
          <MagicCard
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="p-4 lg:p-6 rounded-2xl lg:rounded-3xl border"
          >
            <CardHeader
              icon={Sparkles}
              title="Continuous Innovation"
              description="Powerful features built from real educator feedback. Your needs shape our roadmap."
            />
            <div className="overflow-hidden">
              <Suspense fallback={<SkeletonLoader className="h-40 lg:h-48 w-full bg-red-200" />}>
                <DisplayCards cards={defaultCards} />
              </Suspense>
            </div>
          </MagicCard>
        </div>

        {/* 5 — Fee Management (full on mobile, full width on tablet+) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <MagicCard
            gradientFrom="#38bdf8"
            gradientTo="#3b82f6"
            gradientColor="rgba(59,130,246,0.1)"
            className="p-4 lg:p-6"
          >
            <CardHeader
              icon={CreditCard}
              title="Automated Fee Management"
              description="Smart WhatsApp reminders, instant online payments, and auto-generated receipts make fee collection 3x faster."
            />

            <div className="mt-2 h-36 sm:h-44 lg:h-48 w-full rounded-md bg-slate-50 ring-1 ring-slate-200 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:22px_22px]" />
              <div className="absolute -inset-20 bg-[radial-gradient(60%_40%_at_30%_50%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(60%_40%_at_70%_50%,rgba(59,130,246,0.10),transparent_60%)]" />

              <div className="relative z-10 h-full flex items-center justify-between gap-2 px-3 sm:px-6">

                {/* WhatsApp reminder bubble */}
                <div className="relative group shrink-0">
                  <span className="absolute -left-1 -top-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-400/20 animate-ping" />
                  <div className="relative w-36 sm:w-44 lg:w-52 rounded-lg bg-white ring-1 ring-slate-300 p-2 sm:p-3 shadow-sm hover:ring-slate-400 transition">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-full bg-[url('https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=120&auto=format&fit=crop')] bg-cover bg-center ring-1 ring-slate-300" />
                      <div className="h-2 w-16 sm:w-24 rounded bg-slate-300 animate-pulse" />
                    </div>
                    <div className="mt-2 h-2 w-20 sm:w-28 rounded bg-slate-300 animate-pulse" />
                    <div className="mt-2 flex items-center gap-1.5">
                      <WhatsAppIcon />
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-700">WhatsApp sent</span>
                    </div>
                  </div>
                </div>

                {/* Processing spinner — hide on small mobile */}
                <div className="relative hidden sm:flex items-center justify-center shrink-0">
                  <div className="relative h-16 w-16 lg:h-24 lg:w-24">
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_#38bdf8,_#3b82f6,_transparent_65%)] opacity-80 animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-white ring-1 ring-slate-200" />
                    <div className="absolute inset-0 flex items-center justify-center text-sky-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Receipt card */}
                <div className="w-36 sm:w-44 lg:w-60 shrink-0 rounded-lg bg-white p-2 sm:p-3 ring-1 ring-slate-300 hover:ring-slate-400 transition">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700">Payment received</span>
                  </div>
                  <div className="mt-2 space-y-1.5 sm:space-y-2">
                    <div className="h-2 w-20 sm:w-28 lg:w-36 rounded bg-slate-300 animate-pulse" />
                    <div className="h-2 w-16 sm:w-24 lg:w-32 rounded bg-slate-300 animate-pulse" />
                    <div className="h-2 w-14 sm:w-20 lg:w-28 rounded bg-slate-300 animate-pulse" />
                    <div className="pt-1">
                      <div className="h-1.5 w-full rounded bg-emerald-100 overflow-hidden ring-1 ring-emerald-300">
                        <div className="h-1.5 w-2/3 rounded bg-emerald-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>
          </MagicCard>
        </div>

      </div>
    </>
  );
};

export default BentoGrid;