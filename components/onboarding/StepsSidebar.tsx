'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STEPS, PHASES, type StepId } from './types';
import Image from 'next/image';

interface Props {
  currentStep: StepId;
  completedSteps: Set<number>;
  onStepClick?: (step: StepId) => void;
  maxStepReached: number;
}

export default function StepsSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  maxStepReached,
}: Props) {
  const phaseSteps = PHASES.map((phase) => ({
    ...phase,
    steps: STEPS.filter((s) => s.phase === phase.id),
  }));

  const totalCompleted = completedSteps.size;
  const progressPct = Math.round((totalCompleted / STEPS.length) * 100);

  return (
    <aside className="w-full shrink-0 flex flex-col bg-muted/20 overflow-y-auto">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={24} height={24} />
          <span className="text-sm font-semibold text-foreground">
            Setup Guide
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalCompleted} of {STEPS.length} done</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase + Steps */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {phaseSteps.map((phase) => (
          <div key={phase.id}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
              Phase {phase.id} · {phase.name}
            </p>
            <div className="space-y-0.5">
              {phase.steps.map((step) => {
                const isCompleted = completedSteps.has(step.id);
                const isActive = currentStep === step.id;
                const canClick = isCompleted || isActive || step.id <= maxStepReached;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (onStepClick && canClick) {
                        onStepClick(step.id as StepId);
                      }
                    }}
                    disabled={!canClick}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors text-left',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : canClick
                          ? 'text-foreground/80 hover:bg-muted/60 cursor-pointer'
                          : 'text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {/* Step indicator */}
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold border',
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isActive
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id + 1
                      )}
                    </span>
                    <span className="leading-tight truncate">{step.shortTitle}</span>
                    {step.optional && (
                      <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                        opt
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5 h-8"
          >
            Go to Dashboard →
          </Button>
        </Link>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          You can finish setup later
        </p>
      </div>
    </aside>
  );
}
