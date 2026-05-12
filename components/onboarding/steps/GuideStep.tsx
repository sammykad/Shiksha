'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface GuideField {
  label: string;
}

interface GuideStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  fields: GuideField[];
  href: string;
  linkLabel: string;
  count: number;
  countLabel: string;
  optional?: boolean;
  onContinue: () => void;
  onSkip?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function GuideStep({
  icon,
  title,
  description,
  fields,
  href,
  linkLabel,
  count,
  countLabel,
  optional,
  onContinue,
  onSkip,
  onRefresh,
  loading,
}: GuideStepProps) {
  const isDone = count > 0;

  function handleOpenPage() {
    window.open(href, '_blank');
    // onRefresh fires on window focus already via the useEffect in OnboardingWizard
    // but we also call it explicitly here as a fallback
    onRefresh?.();
  }
  return (
    <div className="flex flex-col h-full gap-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'mt-0.5 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1 transition-all duration-300',
            isDone
              ? 'bg-emerald-50 ring-emerald-200 shadow-sm shadow-emerald-100'
              : 'bg-primary/5 ring-primary/15'
          )}
        >
          {isDone
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : <span className="text-primary/80">{icon}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground leading-snug">
              {title}
            </h2>
            {optional && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-full"
              >
                Optional
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* ── Status Card ── */}
      <Card
        className={cn(
          'flex-1 transition-all duration-300',
          isDone
            ? 'border-emerald-200 bg-emerald-50/40 shadow-sm shadow-emerald-100/60'
            : 'border-border/60 bg-muted/10'
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium tabular-nums',
                  isDone ? 'text-emerald-700' : 'text-muted-foreground'
                )}
              >
                {isDone
                  ? `${count} ${countLabel} added`
                  : `No ${countLabel} yet`}
              </span>
            </div>

            {isDone ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 text-[11px] gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[11px] text-muted-foreground border-dashed gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Pending
              </Badge>
            )}
          </div>
        </CardHeader>

        {!isDone && fields.length > 0 && (
          <>
            <Separator className="mx-4 w-auto" style={{ width: 'calc(100% - 2rem)' }} />
            <CardContent className="px-4 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
                You{'\u2019'}ll fill in
              </p>
              <div className="flex flex-wrap gap-1.5">
                {fields.map((f) => (
                  <Tooltip key={f.label}>
                    <TooltipTrigger asChild>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-background border border-border/70 text-muted-foreground cursor-default hover:border-primary/30 hover:text-foreground transition-colors duration-150">
                        {f.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Required field
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className={cn('px-4 pb-4', (!isDone && fields.length > 0) ? 'pt-2' : 'pt-0')}>
          <Button
            variant={isDone ? 'outline' : 'default'}
            size="sm"
            onClick={handleOpenPage}
            className={cn(
              'w-full gap-2 text-sm font-medium transition-all duration-200',
              isDone && 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-800'
            )}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {isDone ? `Manage ${countLabel}` : linkLabel}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        {onSkip ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground text-sm h-8 px-2"
          >
            {optional ? 'Skip for now' : 'Skip'}
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={onContinue}
          disabled={loading}
          size="sm"
          className="min-w-[130px] gap-2 text-sm font-medium"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Saving…
            </>
          ) : (
            <>
              {isDone ? 'Continue' : 'Continue anyway'}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>

    </div>
  );
}