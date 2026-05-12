'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Star, Flame, TrendingUp } from 'lucide-react';
import { toISTDate } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
  date: Date | string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY';
}

interface WeekData {
  weekIndex: number;
  score: number;
  days: DayData[];
  monthLabel: string | null;
  startDate: Date;
}

interface DayData {
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY' | 'FUTURE' | 'NO_DATA';
}

interface AttendanceSkylineProps {
  attendanceData: AttendanceRecord[];
  weeks?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// 4 clean rooftop styles
function rooftopPath(x: number, y: number, w: number, h: number, style: number): string {
  const b = y + h;
  const r = x + w;
  const cx = x + w / 2;
  switch (style % 4) {
    case 0: // flat + antenna
      return `M${x},${b} L${x},${y} L${cx - 1},${y} L${cx - 1},${y - 7} L${cx + 1},${y - 7} L${cx + 1},${y} L${r},${y} L${r},${b} Z`;
    case 1: // stepped
      return `M${x},${b} L${x},${y + 5} L${x + 4},${y + 5} L${x + 4},${y} L${r - 4},${y} L${r - 4},${y + 5} L${r},${y + 5} L${r},${b} Z`;
    case 2: // flat
      return `M${x},${b} L${x},${y} L${r},${y} L${r},${b} Z`;
    case 3: // peak
      return `M${x},${b} L${x},${y + 5} L${cx},${y} L${r},${y + 5} L${r},${b} Z`;
    default:
      return `M${x},${b} L${x},${y} L${r},${y} L${r},${b} Z`;
  }
}

function scoreToColors(score: number): { fill: string; stroke: string; win: string } {
  if (score >= 5) return { fill: '#dcfce7', stroke: '#16a34a', win: '#16a34a' };  // green
  if (score >= 4) return { fill: '#dbeafe', stroke: '#2563eb', win: '#2563eb' };  // blue
  if (score >= 3) return { fill: '#fef9c3', stroke: '#ca8a04', win: '#ca8a04' };  // yellow
  if (score >= 1) return { fill: '#fee2e2', stroke: '#dc2626', win: '#dc2626' };  // red
  return { fill: '#f3f4f6', stroke: '#d1d5db', win: '#9ca3af' };                  // gray
}

function statusWinColor(status: DayData['status']): string {
  switch (status) {
    case 'PRESENT': return '#16a34a';
    case 'LATE': return '#d97706';
    case 'ABSENT': return '#dc2626';
    case 'HOLIDAY': return '#7c3aed';
    default: return 'transparent';
  }
}

function buildWindows(bx: number, by: number, bw: number, bh: number, days: DayData[]) {
  const wins: Array<{ x: number; y: number; status: DayData['status'] }> = [];
  if (bh < 28) return wins;
  const padX = 4, padY = 7, gapX = 7, gapY = 6;
  const cols = Math.max(1, Math.floor((bw - padX * 2) / gapX));
  const rows = Math.max(1, Math.floor((bh - padY * 2) / gapY));
  let di = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const wx = bx + padX + col * gapX;
      const wy = by + padY + row * gapY;
      if (wx + 4 > bx + bw - 2 || wy + 3 > by + bh - 4) continue;
      wins.push({ x: wx, y: wy, status: days[di % days.length]?.status ?? 'NO_DATA' });
      di++;
    }
  }
  return wins;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AttendanceSkyline({ attendanceData, weeks = 22 }: AttendanceSkylineProps) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const { buildings, stats } = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of attendanceData) {
      const d = typeof r.date === 'string' ? new Date(r.date) : r.date;
      map.set(toDateKey(d), r);
    }

    const today = toISTDate(new Date());
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

    let totalPresent = 0, totalDays = 0;
    let bestScore = 0, bestWeekIdx = 0;
    let longestStreak = 0, curStreak = 0;

    const result: WeekData[] = [];

    for (let w = 0; w < weeks; w++) {
      const days: DayData[] = [];
      let score = 0;
      let monthLabel: string | null = null;

      for (let d = 1; d <= 6; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const key = toDateKey(date);
        const rec = map.get(key);
        const isFuture = date > today;

        if (d === 1 && date.getDate() <= 7) monthLabel = MONTH_NAMES[date.getMonth()];

        const status: DayData['status'] = isFuture ? 'FUTURE' : rec?.status ?? 'NO_DATA';
        const isPresent = !isFuture && (status === 'PRESENT' || status === 'LATE');

        days.push({ date, status });

        if (!isFuture && status !== 'NO_DATA') {
          totalDays++;
          if (isPresent) {
            totalPresent++; score++; curStreak++;
            if (curStreak > longestStreak) longestStreak = curStreak;
          } else {
            curStreak = 0;
          }
        }
      }

      if (score > bestScore) { bestScore = score; bestWeekIdx = w; }
      result.push({ weekIndex: w, score, days, monthLabel, startDate: new Date(startDate.getTime() + w * 7 * 86400000) });
    }

    return {
      buildings: result,
      stats: {
        totalPresent, totalDays,
        percentage: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0,
        bestWeekIdx, longestStreak, bestScore,
      },
    };
  }, [attendanceData, weeks]);

  // SVG layout
  const SVG_W = 880;
  const SVG_H = 200;
  const GROUND_Y = SVG_H - 28;
  const MAX_H = 138;
  const MIN_H = 10;
  const B_GAP = 3;
  const B_W = Math.floor((SVG_W - B_GAP * (weeks - 1)) / weeks);

  const hoveredBuilding = hovered !== null ? buildings[hovered] : null;

  return (
    <Card>
      {/* ── Header ── */}
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Attendance Skyline
              <Badge variant="secondary" className="text-[10px] font-normal">
                {weeks} weeks
              </Badge>
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Each building = 1 week · height = attendance · windows = daily status
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {[
              { color: '#16a34a', label: 'Present' },
              { color: '#d97706', label: 'Late' },
              { color: '#dc2626', label: 'Absent' },
              { color: '#7c3aed', label: 'Holiday' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-0">
        {/* ── SVG ── */}
        <div className="w-full overflow-x-auto rounded-md border bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full select-none"
            style={{ minWidth: 480, display: 'block' }}
          >
            <defs>
              {/* Subtle sky gradient */}
              <linearGradient id="sl-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              <linearGradient id="sl-sky-dark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Ground gradient */}
              <linearGradient id="sl-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Hover outline glow */}
              <filter id="sl-hover" x="-8%" y="-8%" width="116%" height="116%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.2" />
              </filter>

              {/* Win glow */}
              <filter id="sl-win-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Sky background */}
            <rect x="0" y="0" width={SVG_W} height={GROUND_Y} fill="url(#sl-sky)" className="dark:hidden" />
            <rect x="0" y="0" width={SVG_W} height={GROUND_Y} fill="url(#sl-sky-dark)" />

            {/* Subtle cloud-like horizontal bands */}
            {[0.25, 0.55, 0.72].map((yFrac, i) => (
              <ellipse
                key={i}
                cx={SVG_W * (0.2 + i * 0.3)}
                cy={GROUND_Y * yFrac}
                rx={80 + i * 40}
                ry={8}
                fill="white"
                opacity={0.04}
              />
            ))}

            {/* ── Buildings ── */}
            {buildings.map((b, wi) => {
              const ratio = b.score / 6;
              const bH = animated ? Math.max(MIN_H, Math.round(ratio * MAX_H)) : 3;
              const bX = wi * (B_W + B_GAP);
              const bY = GROUND_Y - bH;
              const colors = scoreToColors(b.score);
              const style = Math.floor(seededRand(wi * 17 + 3) * 4);
              const path = rooftopPath(bX, bY, B_W, bH, style);
              const wins = animated ? buildWindows(bX, bY, B_W, bH, b.days) : [];
              const isHov = hovered === wi;
              const isBest = wi === stats.bestWeekIdx;
              const delay = `${wi * 18}ms`;

              return (
                <g
                  key={wi}
                  onMouseEnter={() => setHovered(wi)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'default' }}
                >
                  {/* Building fill */}
                  <path
                    d={path}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isHov ? 1.2 : 0.8}
                    opacity={isHov ? 1 : b.score === 0 ? 0.5 : 0.82}
                    filter={isHov ? 'url(#sl-hover)' : undefined}
                    style={{
                      transition: `d 1s cubic-bezier(0.34,1.3,0.64,1) ${delay},
                                   opacity 0.15s ease`,
                    }}
                  />

                  {/* Windows */}
                  {wins.map((win, wIdx) => {
                    const isLit = win.status !== 'NO_DATA' && win.status !== 'FUTURE';
                    if (!isLit) return null;
                    return (
                      <rect
                        key={wIdx}
                        x={win.x} y={win.y}
                        width={4} height={3} rx={0.5}
                        fill={statusWinColor(win.status)}
                        opacity={isHov ? 0.9 : 0.55}
                        filter={isHov ? 'url(#sl-win-glow)' : undefined}
                        style={{ transition: `opacity 0.2s ease ${Math.min(wIdx * 6, 200)}ms` }}
                      />
                    );
                  })}

                  {/* Best week star */}
                  {isBest && animated && (
                    <text
                      x={bX + B_W / 2} y={bY - 6}
                      textAnchor="middle"
                      style={{ fontSize: 9, fill: '#f59e0b' }}
                    >★</text>
                  )}

                  {/* Month label */}
                  {b.monthLabel && (
                    <text
                      x={bX + B_W / 2} y={GROUND_Y + 15}
                      textAnchor="middle"
                      style={{ fontSize: 7, fill: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}
                    >
                      {b.monthLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ── Ground ── */}
            <rect
              x={0} y={GROUND_Y}
              width={SVG_W} height={3}
              fill="url(#sl-ground)"
            />

            {/* ── Tooltip ── */}
            {hovered !== null && hoveredBuilding && (() => {
              const bX = hovered * (B_W + B_GAP);
              const bH = Math.max(MIN_H, Math.round((hoveredBuilding.score / 6) * MAX_H));
              const bY = GROUND_Y - bH;
              const TW = 96, TH = 52;
              const tx = Math.max(4, Math.min(bX + B_W / 2 - TW / 2, SVG_W - TW - 4));
              const ty = Math.max(4, bY - TH - 12);
              const p = hoveredBuilding.days.filter(d => d.status === 'PRESENT' || d.status === 'LATE').length;
              const l = hoveredBuilding.days.filter(d => d.status === 'LATE').length;
              const a = hoveredBuilding.days.filter(d => d.status === 'ABSENT').length;
              const pct = Math.round((hoveredBuilding.score / 6) * 100);
              const colors = scoreToColors(hoveredBuilding.score);

              return (
                <g>
                  {/* Connector */}
                  <line
                    x1={bX + B_W / 2} y1={ty + TH + 1}
                    x2={bX + B_W / 2} y2={bY - 2}
                    stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="2 2"
                  />
                  {/* Box */}
                  <rect
                    x={tx} y={ty} width={TW} height={TH} rx={6}
                    fill="white" stroke={colors.stroke} strokeWidth={1}
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
                  />
                  {/* Week date */}
                  <text x={tx + TW / 2} y={ty + 13} textAnchor="middle"
                    style={{ fontSize: 8, fill: '#64748b', fontWeight: 500 }}
                  >
                    {hoveredBuilding.startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </text>
                  {/* Score + % */}
                  <text x={tx + TW / 2} y={ty + 27} textAnchor="middle"
                    style={{ fontSize: 13, fill: colors.stroke, fontWeight: 700 }}
                  >
                    {hoveredBuilding.score}/6
                    <tspan style={{ fontSize: 9, fontWeight: 500, fill: '#94a3b8' }}> days</tspan>
                  </text>
                  {/* P / L / A row */}
                  <text x={tx + 14} y={ty + 43} style={{ fontSize: 8, fill: '#16a34a', fontWeight: 600 }}>{p} P</text>
                  <text x={tx + 38} y={ty + 43} style={{ fontSize: 8, fill: '#d97706', fontWeight: 600 }}>{l} L</text>
                  <text x={tx + 62} y={ty + 43} style={{ fontSize: 8, fill: '#dc2626', fontWeight: 600 }}>{a} A</text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between py-3 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              Best week:
              <span className="font-semibold text-foreground">{stats.bestScore}/6 days</span>
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-orange-500" />
              Longest streak:
              <span className="font-semibold text-foreground">{stats.longestStreak} days</span>
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Period avg:
              <span className={`font-semibold ${stats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {stats.percentage}%
              </span>
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wider">
            MON – SAT · {weeks} WKS
          </span>
        </div>
      </CardContent>
    </Card>
  );
}