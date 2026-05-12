'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RingData {
  monthlyStats: { percentage: number; presentDays: number; totalDays: number; absentDays: number; lateDays: number };
  annualStats: { percentage: number; presentDays: number; totalDays: number };
  overallStats: { percentage: number; presentDays: number; totalDays: number };
  currentStreak: number;
}

// ── Animated SVG arc ────────────────────────────────────────────────────────

function AnimatedRing({
  percentage,
  radius,
  strokeWidth,
  color,
  trackColor,
  delay = 0,
}: {
  percentage: number;
  radius: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  delay?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const offset = animated
    ? circumference - (percentage / 100) * circumference
    : circumference;

  return (
    <g>
      {/* Track */}
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        style={{
          transition: animated
            ? `stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
            : 'none',
        }}
      />
    </g>
  );
}

// ── Animated counter ────────────────────────────────────────────────────────

function CountUp({ target, duration = 1200, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = Date.now() + delay;
    const tick = () => {
      const now = Date.now();
      if (now < start) { requestAnimationFrame(tick); return; }
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, delay]);

  return <>{value}</>;
}

// ── Trend indicator ─────────────────────────────────────────────────────────

function Trend({ monthly, annual }: { monthly: number; annual: number }) {
  const diff = monthly - annual;
  if (Math.abs(diff) < 2) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (diff > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
}

// ── Month arc segments ───────────────────────────────────────────────────────

function MonthSegments({ annualPct }: { annualPct: number }) {
  // 12 month arcs on a tiny inner ring — decorative
  const r = 28;
  const cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  const segmentArc = circumference / 12;
  const gap = 2;

  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const filled = i < Math.round((annualPct / 100) * 12);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={filled ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
            strokeOpacity={filled ? 0.35 : 0.15}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${segmentArc - gap} ${circumference - (segmentArc - gap)}`}
            strokeDashoffset={-(i * segmentArc) + circumference / 4}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: `stroke 0.3s ease ${i * 60}ms`,
            }}
          />
        );
      })}
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function AttendanceRing({ monthlyStats, annualStats, overallStats, currentStreak }: RingData) {
  const SIZE = 200;

  // Ring config: outer = monthly, middle = annual, inner segments = overall
  const rings = [
    { pct: monthlyStats.percentage, r: 82, sw: 10, color: 'hsl(142 71% 45%)', track: 'hsl(142 71% 45% / 0.12)', delay: 0, label: 'Monthly' },
    { pct: annualStats.percentage, r: 66, sw: 10, color: 'hsl(217 91% 60%)', track: 'hsl(217 91% 60% / 0.12)', delay: 150, label: 'Annual' },
    { pct: overallStats.percentage, r: 50, sw: 10, color: 'hsl(262 83% 63%)', track: 'hsl(262 83% 63% / 0.12)', delay: 300, label: 'Overall' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">

          {/* ── SVG Rings ── */}
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
              {/* Glow filter */}
              <defs>
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Month segments (innermost decorative) */}
              <MonthSegments annualPct={annualStats.percentage} />

              {/* Three rings */}
              {rings.map((ring, i) => (
                <AnimatedRing
                  key={i}
                  percentage={ring.pct}
                  radius={ring.r}
                  strokeWidth={ring.sw}
                  color={ring.color}
                  trackColor={ring.track}
                  delay={ring.delay}
                />
              ))}

              {/* Center text */}
              <text
                x="100"
                y="94"
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
              >
                <CountUp target={monthlyStats.percentage} delay={200} />
                <tspan style={{ fontSize: 14, fontWeight: 500 }}>%</tspan>
              </text>
              <text
                x="100"
                y="112"
                textAnchor="middle"
                style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              >
                this month
              </text>
            </svg>
          </div>

          {/* ── Right side stats ── */}
          <div className="flex-1 w-full space-y-4">

            {/* Ring legend + values */}
            <div className="space-y-2.5">
              {rings.map((ring, i) => {
                const stat = i === 0 ? monthlyStats : i === 1 ? annualStats : overallStats;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: ring.color }}
                      />
                      <span className="text-muted-foreground">{ring.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {stat.presentDays}/{stat.totalDays} days
                      </span>
                      <span
                        className="font-semibold tabular-nums w-10 text-right"
                        style={{ color: ring.color }}
                      >
                        <CountUp target={ring.pct} delay={ring.delay + 200} />%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Bottom row: streak + trend + absent alert */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Streak</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tabular-nums">{currentStreak}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                  {currentStreak >= 5 && <span className="text-base">🔥</span>}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">vs Annual avg</p>
                <div className="flex items-center gap-1.5">
                  <Trend monthly={monthlyStats.percentage} annual={annualStats.percentage} />
                  <span className="text-lg font-bold tabular-nums">
                    {Math.abs(monthlyStats.percentage - annualStats.percentage)}
                    <span className="text-sm font-normal text-muted-foreground">%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Absent this month */}
            {monthlyStats.absentDays > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm">
                <span className="text-red-700 dark:text-red-400 text-xs">
                  {monthlyStats.absentDays} absent · {monthlyStats.lateDays} late this month
                </span>
                <Badge variant="outline" className="text-red-600 border-red-300 dark:border-red-800 text-[10px] h-5">
                  {100 - monthlyStats.percentage}% missed
                </Badge>
              </div>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}