'use client';

/**
 * @author: @kokonutui
 * @description: AI Loading State
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useState, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface AILoadingSequence {
  status: string;
  lines: string[];
}

const TASK_SEQUENCES: AILoadingSequence[] = [
  {
    status: 'Starting Monthly Fee Report Analysis',
    lines: [
      'Fetching student fee records...',
      'Filtering by current academic year...',
      'Aggregating paid, pending, and overdue fees...',
      'Detecting anomalies and patterns...',
      'Identifying fee defaulters...',
    ],
  },
  {
    status: 'Generating AI Insights',
    lines: [
      'Preparing data for AI analysis...',
      'Summarizing key financial highlights...',
      'Analyzing collection trends...',
      'Generating insights on payment behavior...',
      'Evaluating monthly performance...',
      'Drafting AI-powered summary...',
    ],
  },
  {
    status: 'Finalizing Report',
    lines: [
      'Formatting report for PDF generation...',
      'Adding visual data (charts, stats)...',
      'Embedding AI-generated summary...',
      'Applying branding and styles...',
      'Optimizing for download and sharing...',
      'Finalizing report structure...',
    ],
  },
];

const LoadingAnimation = ({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) => (
  <div className={cn('relative size-6', className)}>
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`Loading progress: ${Math.round(progress)}%`}
    >
      <title>Loading Progress Indicator</title>

      <defs>
        <mask id="progress-mask">
          <rect width="240" height="240" fill="black" />
          <circle
            r="120"
            cx="120"
            cy="120"
            fill="white"
            strokeDasharray={`${(progress / 100) * 754}, 754`}
            transform="rotate(-90 120 120)"
          />
        </mask>
      </defs>

      <style>
        {`
                    @keyframes rotate-cw {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes rotate-ccw {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    .g-spin circle {
                        transform-origin: 120px 120px;
                    }
                    .g-spin circle:nth-child(1) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(2) { animation: rotate-ccw 8s linear infinite; }
                    .g-spin circle:nth-child(3) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(4) { animation: rotate-ccw 8s linear infinite; }
                    .g-spin circle:nth-child(5) { animation: rotate-cw 8s linear infinite; }
                    .g-spin circle:nth-child(6) { animation: rotate-ccw 8s linear infinite; }

                    .g-spin circle:nth-child(2n) { animation-delay: 0.2s; }
                    .g-spin circle:nth-child(3n) { animation-delay: 0.3s; }
                `}
      </style>

      <g
        className="g-spin"
        strokeWidth="16"
        strokeDasharray="18% 40%"
        mask="url(#progress-mask)"
      >
        <circle r="150" cx="120" cy="120" stroke="#FF2E7E" opacity="0.95" />
        <circle r="130" cx="120" cy="120" stroke="#00E5FF" opacity="0.95" />
        <circle r="110" cx="120" cy="120" stroke="#4ADE80" opacity="0.95" />
        <circle r="90" cx="120" cy="120" stroke="#FFA726" opacity="0.95" />
        <circle r="70" cx="120" cy="120" stroke="#FFEB3B" opacity="0.95" />
        <circle r="50" cx="120" cy="120" stroke="#FF4081" opacity="0.95" />
      </g>
    </svg>
  </div>
);

interface AILoadingStateProps {
  sequences?: AILoadingSequence[];
  className?: string;
  contentClassName?: string;
  statusClassName?: string;
  lineClassName?: string;
  lineNumberClassName?: string;
  overlayClassName?: string;
  lineHeight?: number;
  visibleLineCount?: number;
  intervalMs?: number;
  indicatorClassName?: string;
}

export default function AILoadingState({
  sequences = TASK_SEQUENCES,
  className,
  contentClassName,
  statusClassName,
  lineClassName,
  lineNumberClassName,
  overlayClassName,
  lineHeight = 28,
  visibleLineCount = 3,
  intervalMs = 2000,
  indicatorClassName,
}: AILoadingStateProps) {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<
    Array<{ id: number; text: string; number: number }>
  >([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);

  const currentSequence = sequences[sequenceIndex];
  const totalLines = currentSequence.lines.length;

  // Initialize visible lines
  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      const initialLines = [];
      for (let i = 0; i < Math.min(visibleLineCount, totalLines); i++) {
        initialLines.push({
          id: lineIdRef.current++,
          text: currentSequence.lines[i],
          number: i + 1,
        });
      }
      setVisibleLines(initialLines);
      setScrollPosition(0);
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [sequenceIndex, currentSequence.lines, totalLines, visibleLineCount]);

  // Handle line advancement
  useEffect(() => {
    const advanceTimer = setInterval(() => {
      // Get the current first visible line index
      const firstVisibleLineIndex = Math.floor(scrollPosition / lineHeight);
      const nextLineIndex = (firstVisibleLineIndex + 3) % totalLines;

      // If we're about to wrap around, move to next sequence
      if (nextLineIndex < firstVisibleLineIndex && nextLineIndex !== 0) {
        setSequenceIndex(
          (prevIndex) => (prevIndex + 1) % sequences.length
        );
        return;
      }

      // Add the next line if needed
      if (nextLineIndex >= visibleLines.length && nextLineIndex < totalLines) {
        setVisibleLines((prevLines) => [
          ...prevLines,
          {
            id: lineIdRef.current++,
            text: currentSequence.lines[nextLineIndex],
            number: nextLineIndex + 1,
          },
        ]);
      }

      // Scroll to the next line
      setScrollPosition((prevPosition) => prevPosition + lineHeight);
    }, intervalMs);

    return () => clearInterval(advanceTimer);
  }, [
    scrollPosition,
    visibleLines,
    totalLines,
    sequenceIndex,
    currentSequence.lines,
    lineHeight,
    intervalMs,
    sequences.length,
  ]);

  // Apply scroll position
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('w-auto space-y-3', contentClassName)}>
        <div
          className={cn(
            'ml-1 flex items-center space-x-2 font-medium text-gray-600 dark:text-gray-300',
            statusClassName
          )}
        >
          <LoadingAnimation
            progress={(sequenceIndex / sequences.length) * 100}
            className={indicatorClassName}
          />
          <span className="text-sm">{currentSequence.status}...</span>
        </div>

        <div className="relative">
          <div
            ref={codeContainerRef}
            className="relative w-full overflow-hidden rounded-lg font-mono text-xs"
            style={{
              scrollBehavior: 'smooth',
              height: lineHeight * visibleLineCount,
            }}
          >
            <div>
              {visibleLines.map((line) => (
                <div
                  key={line.id}
                  className="flex h-[28px] items-center px-2"
                >
                  {/* Line number */}
                  <div
                    className={cn(
                      'w-6 select-none pr-3 text-right text-gray-400 dark:text-gray-500',
                      lineNumberClassName
                    )}
                  >
                    {line.number}
                  </div>

                  {/* Task content */}
                  <div
                    className={cn(
                      'ml-1 flex-1 text-gray-800 dark:text-gray-200',
                      lineClassName
                    )}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linear gradient overlay */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 right-0 top-0 rounded-lg from-white/90 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent',
              overlayClassName
            )}
            style={{
              background:
                'linear-gradient(to bottom, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 30%, var(--tw-gradient-to) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
