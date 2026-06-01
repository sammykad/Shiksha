"use client";

import { animate, motion, useMotionValue, useSpring, useTransform, type Transition } from "motion/react";
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface FunnelGradientStop {
  offset: string | number;
  color: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
  gradient?: FunnelGradientStop[];
}

export interface FunnelChartProps {
  data: FunnelStage[];
  orientation?: "horizontal" | "vertical";
  color?: string;
  layers?: number;
  className?: string;
  style?: CSSProperties;
  showPercentage?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  formatPercentage?: (pct: number) => string;
  formatValue?: (value: number) => string;
  staggerDelay?: number;
  enterTransition?: Transition;
  gap?: number;
  renderPattern?: (id: string, color: string) => ReactNode;
  edges?: "curved" | "straight";
  labelLayout?: "spread" | "grouped";
  labelOrientation?: "vertical" | "horizontal";
  labelAlign?: "center" | "start" | "end";
  grid?:
    | boolean
    | {
        bands?: boolean;
        bandColor?: string;
        lines?: boolean;
        lineColor?: string;
        lineOpacity?: number;
        lineWidth?: number;
      };
}

const defaultEnterTransition: Transition = {
  type: "tween",
  duration: 0.7,
  ease: [0.85, 0, 0.15, 1],
};

const numberFormatter = new Intl.NumberFormat("en-IN");
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatNumber = (value: number) => numberFormatter.format(value);
const hoverSpring = { stiffness: 300, damping: 24 };

function useMountProgress(
  enterTransition: Transition | undefined,
  delaySeconds: number,
  replayKey: number | string
) {
  const progress = useMotionValue(0);
  const transitionRef = useRef(enterTransition);
  transitionRef.current = enterTransition;

  useEffect(() => {
    progress.set(0);
    const controls = animate(0 as number, 1 as number, {
      ...(transitionRef.current ?? defaultEnterTransition),
      delay: delaySeconds,
      onUpdate: (latest: number) => progress.set(latest),
    } as Parameters<typeof animate<number>>[2]);

    return () => controls.stop();
  }, [delaySeconds, replayKey, progress]);

  return progress;
}

function hSegmentPath(
  normStart: number,
  normEnd: number,
  segW: number,
  fullH: number,
  layerScale: number,
  straight = false
) {
  const midY = fullH / 2;
  const startH = normStart * fullH * 0.44 * layerScale;
  const endH = normEnd * fullH * 0.44 * layerScale;

  if (straight) {
    return `M 0 ${midY - startH} L ${segW} ${midY - endH} L ${segW} ${midY + endH} L 0 ${midY + startH} Z`;
  }

  const cx = segW * 0.55;
  const top = `M 0 ${midY - startH} C ${cx} ${midY - startH}, ${segW - cx} ${midY - endH}, ${segW} ${midY - endH}`;
  const bottom = `L ${segW} ${midY + endH} C ${segW - cx} ${midY + endH}, ${cx} ${midY + startH}, 0 ${midY + startH}`;
  return `${top} ${bottom} Z`;
}

function vSegmentPath(
  normStart: number,
  normEnd: number,
  segH: number,
  fullW: number,
  layerScale: number,
  straight = false
) {
  const midX = fullW / 2;
  const startW = normStart * fullW * 0.44 * layerScale;
  const endW = normEnd * fullW * 0.44 * layerScale;

  if (straight) {
    return `M ${midX - startW} 0 L ${midX - endW} ${segH} L ${midX + endW} ${segH} L ${midX + startW} 0 Z`;
  }

  const cy = segH * 0.55;
  const left = `M ${midX - startW} 0 C ${midX - startW} ${cy}, ${midX - endW} ${segH - cy}, ${midX - endW} ${segH}`;
  const right = `L ${midX + endW} ${segH} C ${midX + endW} ${segH - cy}, ${midX + startW} ${cy}, ${midX + startW} 0`;
  return `${left} ${right} Z`;
}

function HRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}: {
  d: string;
  color: string;
  fill?: string;
  opacity: number;
  hovered: boolean;
  ringIndex: number;
  totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const scaleY = useSpring(1, {
    stiffness: 300 - ringIndex * 60,
    damping: 24 - ringIndex * 3,
  });

  useEffect(() => {
    scaleY.set(hovered ? extraScale : 1);
  }, [extraScale, hovered, scaleY]);

  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleY, transformOrigin: "center center" }}
    />
  );
}

function VRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}: {
  d: string;
  color: string;
  fill?: string;
  opacity: number;
  hovered: boolean;
  ringIndex: number;
  totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const scaleX = useSpring(1, {
    stiffness: 300 - ringIndex * 60,
    damping: 24 - ringIndex * 3,
  });

  useEffect(() => {
    scaleX.set(hovered ? extraScale : 1);
  }, [extraScale, hovered, scaleX]);

  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleX, transformOrigin: "center center" }}
    />
  );
}

function HSegment({
  index,
  normStart,
  normEnd,
  segW,
  fullH,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}: {
  index: number;
  normStart: number;
  normEnd: number;
  segW: number;
  fullH: number;
  color: string;
  layers: number;
  staggerDelay: number;
  enterTransition?: Transition;
  hovered: boolean;
  dimmed: boolean;
  renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean;
  gradientStops?: FunnelGradientStop[];
}) {
  const patternId = `funnel-h-pattern-${index}`;
  const gradientId = `funnel-h-gradient-${index}`;
  const mountProgress = useMountProgress(enterTransition, index * staggerDelay, index);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => {
    dimOpacity.set(dimmed ? 0.4 : 1);
  }, [dimOpacity, dimmed]);

  const rings = Array.from({ length: layers }, (_, layerIndex) => {
    const scale = 1 - (layerIndex / layers) * 0.35;
    const opacity = 0.18 + (layerIndex / (layers - 1 || 1)) * 0.65;
    return {
      d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{ width: segW, height: fullH, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleX: entranceScaleX,
          scaleY: entranceScaleY,
          transformOrigin: "left center",
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="presentation"
          viewBox={`0 0 ${segW} ${fullH}`}
        >
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map((stop) => (
                  <stop
                    key={`${stop.offset}-${stop.color}`}
                    offset={typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
            {renderPattern?.(patternId, color)}
          </defs>
          {rings.map((ring, ringIndex) => {
            const isInnermost = ringIndex === rings.length - 1;
            const fill = isInnermost && renderPattern
              ? `url(#${patternId})`
              : isInnermost && gradientStops
                ? `url(#${gradientId})`
                : undefined;

            return (
              <HRing
                color={color}
                d={ring.d}
                fill={fill}
                hovered={hovered}
                key={`h-ring-${index}-${ringIndex}`}
                opacity={ring.opacity}
                ringIndex={ringIndex}
                totalRings={layers}
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function VSegment({
  index,
  normStart,
  normEnd,
  segH,
  fullW,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}: {
  index: number;
  normStart: number;
  normEnd: number;
  segH: number;
  fullW: number;
  color: string;
  layers: number;
  staggerDelay: number;
  enterTransition?: Transition;
  hovered: boolean;
  dimmed: boolean;
  renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean;
  gradientStops?: FunnelGradientStop[];
}) {
  const patternId = `funnel-v-pattern-${index}`;
  const gradientId = `funnel-v-gradient-${index}`;
  const mountProgress = useMountProgress(enterTransition, index * staggerDelay, index);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => {
    dimOpacity.set(dimmed ? 0.4 : 1);
  }, [dimOpacity, dimmed]);

  const rings = Array.from({ length: layers }, (_, layerIndex) => {
    const scale = 1 - (layerIndex / layers) * 0.35;
    const opacity = 0.18 + (layerIndex / (layers - 1 || 1)) * 0.65;
    return {
      d: vSegmentPath(normStart, normEnd, segH, fullW, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{ width: fullW, height: segH, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleY: entranceScaleY,
          scaleX: entranceScaleX,
          transformOrigin: "center top",
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="presentation"
          viewBox={`0 0 ${fullW} ${segH}`}
        >
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                {gradientStops.map((stop) => (
                  <stop
                    key={`${stop.offset}-${stop.color}`}
                    offset={typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
            {renderPattern?.(patternId, color)}
          </defs>
          {rings.map((ring, ringIndex) => {
            const isInnermost = ringIndex === rings.length - 1;
            const fill = isInnermost && renderPattern
              ? `url(#${patternId})`
              : isInnermost && gradientStops
                ? `url(#${gradientId})`
                : undefined;

            return (
              <VRing
                color={color}
                d={ring.d}
                fill={fill}
                hovered={hovered}
                key={`v-ring-${index}-${ringIndex}`}
                opacity={ring.opacity}
                ringIndex={ringIndex}
                totalRings={layers}
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function SegmentLabel({
  stage,
  pct,
  isHorizontal,
  showValues,
  showPercentage,
  showLabels,
  formatPercentage,
  formatValue,
  index,
  staggerDelay,
  layout = "spread",
  orientation,
  align = "center",
}: {
  stage: FunnelStage;
  pct: number;
  isHorizontal: boolean;
  showValues: boolean;
  showPercentage: boolean;
  showLabels: boolean;
  formatPercentage: (pct: number) => string;
  formatValue: (value: number) => string;
  index: number;
  staggerDelay: number;
  layout?: "spread" | "grouped";
  orientation?: "vertical" | "horizontal";
  align?: "center" | "start" | "end";
}) {
  const display = stage.displayValue ?? formatValue(stage.value);
  const valueEl = showValues ? (
    <span className="whitespace-nowrap text-sm font-semibold text-foreground">{display}</span>
  ) : null;
  const percentEl = showPercentage ? (
    <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background shadow-sm">
      {formatPercentage(pct)}
    </span>
  ) : null;
  const labelEl = showLabels ? (
    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">{stage.label}</span>
  ) : null;

  if (layout === "spread") {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className={cn("absolute inset-0 flex", isHorizontal ? "flex-col items-center" : "flex-row items-center")}
        initial={{ opacity: 0 }}
        transition={{ delay: index * staggerDelay + 0.25, duration: 0.35, ease: "easeOut" }}
      >
        {isHorizontal ? (
          <>
            <div className="flex h-[16%] items-end justify-center pb-1">{valueEl}</div>
            <div className="flex flex-1 items-center justify-center">{percentEl}</div>
            <div className="flex h-[16%] items-start justify-center pt-1">{labelEl}</div>
          </>
        ) : (
          <>
            <div className="flex w-[16%] items-center justify-end pr-2">{valueEl}</div>
            <div className="flex flex-1 items-center justify-center">{percentEl}</div>
            <div className="flex w-[16%] items-center justify-start pl-2">{labelEl}</div>
          </>
        )}
      </motion.div>
    );
  }

  const resolvedOrientation = orientation ?? (isHorizontal ? "vertical" : "horizontal");
  const isVerticalStack = resolvedOrientation === "vertical";
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  } as const;
  const itemsMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  } as const;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(
        "absolute inset-0 flex",
        isHorizontal ? cn("flex-col items-center", justifyMap[align]) : cn("flex-row items-center", justifyMap[align])
      )}
      initial={{ opacity: 0 }}
      style={{ padding: isHorizontal ? "8% 0" : "0 8%" }}
      transition={{ delay: index * staggerDelay + 0.25, duration: 0.35, ease: "easeOut" }}
    >
      <div
        className={cn(
          "flex gap-1.5",
          isVerticalStack ? cn("flex-col", itemsMap[isHorizontal ? "center" : align]) : cn("flex-row", itemsMap.center)
        )}
      >
        {valueEl}
        {percentEl}
        {labelEl}
      </div>
    </motion.div>
  );
}

export function FunnelChart({
  data,
  orientation = "horizontal",
  color = "hsl(var(--chart-1))",
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  formatPercentage = formatPercent,
  formatValue = formatNumber,
  staggerDelay = 0.12,
  enterTransition,
  gap = 4,
  renderPattern,
  edges = "curved",
  labelLayout = "spread",
  labelOrientation,
  labelAlign = "center",
  grid: gridProp = false,
}: FunnelChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);
  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const max = Math.max(data[0]?.value ?? 0, 1);

  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );

  const measure = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { width, height } = ref.current.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height });
    }
  }, []);

  useEffect(() => {
    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, [measure]);

  if (!data.length) {
    return null;
  }

  const isHorizontal = orientation === "horizontal";
  const { w: fullW, h: fullH } = size;
  const count = data.length;
  const norms = data.map((item) => Math.max(0.04, Math.min(1, item.value / max)));
  const totalGap = gap * (count - 1);
  const segW = (fullW - (isHorizontal ? totalGap : 0)) / count;
  const segH = (fullH - (isHorizontal ? 0 : totalGap)) / count;
  const gridEnabled = gridProp !== false;
  const gridConfig = typeof gridProp === "object" ? gridProp : {};
  const showBands = gridEnabled && (gridConfig.bands ?? true);
  const bandColor = gridConfig.bandColor ?? "hsl(var(--muted) / 0.45)";
  const showGridLines = gridEnabled && (gridConfig.lines ?? true);
  const gridLineColor = gridConfig.lineColor ?? "hsl(var(--border))";
  const gridLineOpacity = gridConfig.lineOpacity ?? 0.75;
  const gridLineWidth = gridConfig.lineWidth ?? 1;

  return (
    <div
      className={cn("relative w-full select-none overflow-visible", className)}
      ref={ref}
      style={{ aspectRatio: isHorizontal ? "2.2 / 1" : "1 / 1.8", ...style }}
    >
      {fullW > 0 && fullH > 0 && (
        <>
          {gridEnabled && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${fullW} ${fullH}`}
            >
              {showBands &&
                data.map((stage, index) => {
                  if (index % 2 !== 0) {
                    return null;
                  }

                  if (isHorizontal) {
                    return (
                      <rect
                        fill={bandColor}
                        height={fullH}
                        key={`band-${stage.label}`}
                        width={segW}
                        x={(segW + gap) * index}
                        y={0}
                      />
                    );
                  }

                  return (
                    <rect
                      fill={bandColor}
                      height={segH}
                      key={`band-${stage.label}`}
                      width={fullW}
                      x={0}
                      y={(segH + gap) * index}
                    />
                  );
                })}
            </svg>
          )}

          <div className={cn("absolute inset-0 flex overflow-visible", isHorizontal ? "flex-row" : "flex-col")} style={{ gap }}>
            {data.map((stage, index) => {
              const normStart = norms[index] ?? 0;
              const normEnd = norms[Math.min(index + 1, count - 1)] ?? 0;
              const firstStop = stage.gradient?.[0];
              const segmentColor = firstStop ? firstStop.color : (stage.color ?? color);

              return isHorizontal ? (
                <HSegment
                  color={segmentColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== index}
                  enterTransition={enterTransition}
                  fullH={fullH}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === index}
                  index={index}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={renderPattern}
                  segW={segW}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              ) : (
                <VSegment
                  color={segmentColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== index}
                  enterTransition={enterTransition}
                  fullW={fullW}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === index}
                  index={index}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={renderPattern}
                  segH={segH}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              );
            })}
          </div>

          {gridEnabled && showGridLines && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${fullW} ${fullH}`}
            >
              {Array.from({ length: count - 1 }, (_, index) => {
                const nextIndex = index + 1;
                if (isHorizontal) {
                  const x = segW * nextIndex + gap * index + gap / 2;
                  return (
                    <line
                      key={`grid-${nextIndex}`}
                      stroke={gridLineColor}
                      strokeOpacity={gridLineOpacity}
                      strokeWidth={gridLineWidth}
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={fullH}
                    />
                  );
                }

                const y = segH * nextIndex + gap * index + gap / 2;
                return (
                  <line
                    key={`grid-${nextIndex}`}
                    stroke={gridLineColor}
                    strokeOpacity={gridLineOpacity}
                    strokeWidth={gridLineWidth}
                    x1={0}
                    x2={fullW}
                    y1={y}
                    y2={y}
                  />
                );
              })}
            </svg>
          )}

          {data.map((stage, index) => {
            const pct = (stage.value / max) * 100;
            const positionStyle: CSSProperties = isHorizontal
              ? { left: (segW + gap) * index, width: segW, top: 0, height: fullH }
              : { top: (segH + gap) * index, height: segH, left: 0, width: fullW };
            const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <motion.div
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                key={`label-${stage.label}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ ...positionStyle, zIndex: 20 }}
                transition={hoverSpring}
              >
                <SegmentLabel
                  align={labelAlign}
                  formatPercentage={formatPercentage}
                  formatValue={formatValue}
                  index={index}
                  isHorizontal={isHorizontal}
                  layout={labelLayout}
                  orientation={labelOrientation}
                  pct={pct}
                  showLabels={showLabels}
                  showPercentage={showPercentage}
                  showValues={showValues}
                  stage={stage}
                  staggerDelay={staggerDelay}
                />
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}
