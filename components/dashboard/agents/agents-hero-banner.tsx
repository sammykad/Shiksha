'use client';

import dynamic from 'next/dynamic';
import {
  Bot,
  FileText,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import AILoadingState from '@/components/AILoadingState';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { Card, CardContent } from '@/components/ui/card';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

interface AgentsHeroBannerProps {
  activeAgents: number;
  totalAgents: number;
}

const liveMissions = [
  {
    label: 'Fee reminders',
    status: 'Preparing parent messages',
    detail: '8 reminders preparing',
    tone: 'text-blue-700',
  },
  {
    label: 'Attendance',
    status: 'Checking Class 8-A',
    detail: '2 absence nudges queued',
    tone: 'text-emerald-700',
  },
  {
    label: 'Parent updates',
    status: 'Keeping WhatsApp ready',
    detail: '42 messages on standby',
    tone: 'text-green-700',
  },
  {
    label: 'School reports',
    status: 'Drafting today’s summary',
    detail: 'Next run at 23:00 IST',
    tone: 'text-sky-700',
  },
];

const agentSequences = [
  {
    status: 'Preparing fee reminders',
    lines: [
      'Checking pending fees...',
      'Finding families to remind...',
      'Choosing WhatsApp message...',
      'Writing a polite reminder...',
    ],
  },
  {
    status: 'Checking attendance',
    lines: [
      'Reviewing Class 8-A...',
      'Noticing repeated absence...',
      'Preparing teacher update...',
      'Waiting for next attendance entry...',
    ],
  },
  {
    status: 'Preparing school summary',
    lines: [
      'Collecting today’s work...',
      'Summarizing parent updates...',
      'Preparing admin view...',
      'Scheduling evening report...',
    ],
  },
];

const outputSignals = [
  {
    title: 'Parent comms',
    detail: 'WhatsApp queue ready',
    icon: MessageCircle,
    meter: '78%',
    tone: 'from-cyan-400 to-blue-600',
  },
  {
    title: 'Reports',
    detail: 'Summary drafting',
    icon: FileText,
    meter: '56%',
    tone: 'from-emerald-400 to-cyan-500',
  },
  {
    title: 'Data guard',
    detail: 'Org scope verified',
    icon: ShieldCheck,
    meter: '92%',
    tone: 'from-blue-500 to-emerald-400',
  },
];

export default function AgentsHeroBanner({
  activeAgents,
  totalAgents,
}: AgentsHeroBannerProps) {
  const [missionIndex, setMissionIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftHandRef = useRef<HTMLDivElement | null>(null);
  const rightHandRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const activeMission = liveMissions[missionIndex];
  const activeOutput = outputSignals[missionIndex % outputSignals.length];
  const ActiveOutputIcon = activeOutput.icon;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMissionIndex((current) => (current + 1) % liveMissions.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <Card className="overflow-hidden border-border/70 bg-[radial-gradient(circle_at_72%_40%,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#edf7ff_100%)]">
      <CardContent className="relative min-h-[340px] overflow-hidden p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.36] [background-image:linear-gradient(to_right,rgba(59,130,246,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-96 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="relative z-10 grid min-h-[292px] gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)] md:items-stretch">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-blue-200/80 bg-white/85 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm shadow-blue-100/60">
                <Bot className="size-3.5" />
                AI Control Room
              </div>
              <div className="max-w-2xl space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Your school&apos;s AI team is always on duty.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                  Fee reminders, attendance updates, reports, and parent
                  messages keep moving in the background.
                </p>
              </div>
            </div>

            <div className="max-w-xl rounded-full border border-sky-200/70 bg-white/55 px-3 py-2 shadow-[0_0_24px_rgba(14,165,233,0.1)] backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="shrink-0 font-medium text-foreground">
                  Now working on
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-sky-300/80 via-emerald-300/80 to-transparent" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeMission.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="min-w-0 truncate text-muted-foreground"
                  >
                    {activeMission.label}: {activeMission.status}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            aria-hidden="true"
            className="relative hidden min-h-[292px] overflow-hidden rounded-lg border border-white/80 bg-[#e8edf2]/80 shadow-inner md:block"
          >
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(248,251,255,0.2)_45%,rgba(248,251,255,0.9)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-16 bg-gradient-to-b from-[#eef6fb]/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[4] w-24 bg-gradient-to-r from-white/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[4] w-16 bg-gradient-to-l from-sky-50/80 to-transparent" />

            <div className="absolute left-1/2 top-1/2 z-[2] h-[390px] w-[690px] -translate-x-1/2 -translate-y-[47%] overflow-hidden">
              <Spline
                scene="https://prod.spline.design/xLYKrm6x94VBn8Z6/scene.splinecode"
                className="size-full"
              />
            </div>

            <div
              ref={leftHandRef}
              className="pointer-events-none absolute left-[40%] top-[62%] z-[6] size-2 opacity-0"
            />
            <div
              ref={rightHandRef}
              className="pointer-events-none absolute left-[64%] top-[58%] z-[6] size-2 opacity-0"
            />

            <motion.div
              ref={consoleRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-10 left-10 z-[8] w-[262px] rounded-lg border border-sky-200/60 bg-white/48 p-3 shadow-[0_18px_60px_rgba(14,165,233,0.14)] backdrop-blur-xl"
            >
              <AILoadingState
                sequences={agentSequences}
                className="justify-start"
                contentClassName="w-full"
                indicatorClassName="size-5"
                statusClassName="text-slate-700"
                lineNumberClassName="text-sky-500/70"
                lineClassName="text-slate-700"
                overlayClassName="from-white/50 via-white/20 to-transparent"
                visibleLineCount={3}
                lineHeight={23}
                intervalMs={1800}
              />
            </motion.div>

            <motion.div
              ref={outputRef}
              layout
              className="absolute right-8 top-24 z-[8] w-[210px] rounded-lg border border-cyan-200/60 bg-white/48 p-3 shadow-[0_18px_52px_rgba(14,165,233,0.14)] backdrop-blur-xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeOutput.title}
                  initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-md border border-white/70 bg-white/55 text-sky-700">
                      <ActiveOutputIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {activeOutput.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {activeOutput.detail}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-sky-100/80">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${activeOutput.tone}`}
                      initial={{ width: '24%' }}
                      animate={{ width: activeOutput.meter }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <AnimatedBeam
              className="z-[7] drop-shadow-[0_0_10px_rgba(14,165,233,0.95)]"
              containerRef={containerRef}
              fromRef={leftHandRef}
              toRef={consoleRef}
              curvature={-56}
              delay={0}
              pathColor="#38bdf8"
              pathOpacity={0.34}
              pathWidth={1.8}
              gradientStartColor="#67e8f9"
              gradientStopColor="#2563eb"
              startYOffset={-4}
            />
            <AnimatedBeam
              className="z-[7] drop-shadow-[0_0_10px_rgba(14,165,233,0.95)]"
              containerRef={containerRef}
              fromRef={rightHandRef}
              toRef={outputRef}
              curvature={72}
              delay={0.5}
              pathColor="#38bdf8"
              pathOpacity={0.34}
              pathWidth={1.8}
              gradientStartColor="#67e8f9"
              gradientStopColor="#2563eb"
              startYOffset={-2}
            />

            <div className="absolute right-4 top-4 z-[9] flex items-center gap-2 rounded-full border border-cyan-200/70 bg-white/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-slate-600 shadow-[0_0_22px_rgba(14,165,233,0.16)] backdrop-blur-md">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400" />
              <span className="font-semibold text-sky-700">24/7 active</span>
              <span className="text-slate-400">/</span>
              <span>{activeAgents}/{totalAgents || 0}</span>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-20 bg-gradient-to-t from-[#eef6fb] via-[#eef6fb]/70 to-transparent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
