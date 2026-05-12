'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  getGradingVisuals,
  type GradeBandInfo,
} from '@/lib/data/exam/grade-utils';

interface BandPreviewBarProps {
  bands: GradeBandInfo[];
  passThreshold: number;
  className?: string;
}

/**
 * Minimal horizontal visualization of a grading rubric.
 * Each segment is color-coded and proportionally sized.
 */
export function BandPreviewBar({
  bands,
  passThreshold,
  className,
}: BandPreviewBarProps) {
  const sorted = [...bands].sort((a, b) => a.minPercentage - b.minPercentage);

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className="flex h-7 w-full overflow-hidden rounded-md border">
        {sorted.map((band, idx) => {
          const width = ((band.maxPercentage - band.minPercentage) / 100) * 100;
          const mid = (band.minPercentage + band.maxPercentage) / 2;
          const visuals = getGradingVisuals(mid, passThreshold);

          return (
            <TooltipProvider key={idx} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "h-full flex items-center justify-center text-[10px] font-semibold cursor-default transition-opacity hover:opacity-80 border-r last:border-r-0 border-background/60",
                      visuals.bg,
                      visuals.text
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {width > 8 ? band.label : ""}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{band.label}</p>
                  <p className="text-muted-foreground">{band.minPercentage}% – {band.maxPercentage}%</p>
                  {band.points != null && (
                    <p className="text-muted-foreground">{band.points} pts</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>0%</span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          Pass: {passThreshold}%
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}
