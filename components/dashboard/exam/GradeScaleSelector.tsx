'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getGradingVisuals,
  type GradingScaleInfo,
  PRESET_SCALES,
} from '@/lib/data/exam/grade-utils';
import { Settings2, Loader2, Plus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createGradingScale } from '@/lib/data/exam/grading-scales';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GradeScaleSelectorProps {
  selectedScale: GradingScaleInfo;
  onScaleChange: (scale: GradingScaleInfo) => void;
  availableScales?: GradingScaleInfo[];
}

export default function GradeScaleSelector({
  selectedScale,
  onScaleChange,
  availableScales = [],
}: GradeScaleSelectorProps) {
  const router = useRouter();
  const [isQuickApplying, setIsQuickApplying] = useState<string | null>(null);

  const handleQuickApply = async (presetKey: string) => {
    const preset = PRESET_SCALES[presetKey];
    setIsQuickApplying(presetKey);

    try {
      const result = await createGradingScale({
        name: preset.name,
        rounding: 'NEAREST' as any,
        passThreshold: 33,
        pointsMode: preset.pointsMode as any,
        allowGrace: false,
        maxGraceMarks: 0,
        isDefault: true,
        bands: preset.bands.map(b => ({
          label: b.label,
          minPercentage: b.minPercentage,
          maxPercentage: b.maxPercentage,
          points: b.points,
          description: b.description ?? undefined
        }))
      });

      if (result.success && result.data) {
        toast.success(`${preset.name} configured as default.`);
        onScaleChange(result.data as any);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to configure preset.");
      }
    } catch (error) {
      toast.error("Error during setup.");
    } finally {
      setIsQuickApplying(null);
    }
  };

  // ── No scales configured yet → show presets ──────────────
  if (availableScales.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold">Choose a Grading System</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            No system configured yet. Pick a preset to get started.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(PRESET_SCALES).map(([key, preset]) => (
            <button
              key={key}
              className={cn(
                "relative rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                isQuickApplying === key && "opacity-50 pointer-events-none"
              )}
              onClick={() => handleQuickApply(key)}
              disabled={isQuickApplying !== null}
            >
              {/* Mini color bar */}
              <div className="flex h-1 w-full rounded-full overflow-hidden mb-2.5">
                {preset.bands.map((b, i) => {
                  const mid = (b.minPercentage + b.maxPercentage) / 2;
                  const v = getGradingVisuals(mid, 33);
                  return (
                    <div
                      key={i}
                      className={v.bubble}
                      style={{ width: `${((b.maxPercentage - b.minPercentage) / 100) * 100}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold truncate">{preset.name}</span>
                {isQuickApplying === key ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                ) : (
                  <Plus className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                {preset.bands.length} bands · {preset.pointsMode.toLowerCase()}
              </span>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0" asChild>
            <Link href="/dashboard/settings">
              <Settings2 className="h-3 w-3 mr-1" />
              Or configure in Settings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Scales exist → show selector as a simple dropdown ────
  return (
    <Select
      value={selectedScale.id}
      onValueChange={(value) => {
        const scale = availableScales.find((s) => s.id === value);
        if (scale) onScaleChange(scale);
      }}
    >
      <SelectTrigger className="w-full h-9 text-xs bg-background">
        <SelectValue placeholder="Select grading system..." />
      </SelectTrigger>
      <SelectContent>
        {availableScales.map((scale) => (
          <SelectItem key={scale.id} value={scale.id} className="text-xs">
            {scale.name} {scale.isDefault ? '(Default)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
