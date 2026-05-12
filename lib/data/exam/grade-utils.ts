/**
 * ─────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH — Grading System Utilities
 *
 * All grading logic for the Exam module lives here.
 * Both ExamResultsForm (marks entry) and report-card-generation
 * import from this file to guarantee identical outputs.
 *
 * If you need grading utilities anywhere in the codebase,
 * import from here or from the re-exports in lib/utils.ts.
 * ─────────────────────────────────────────────────────────────
 */

import { RoundingRule, PointsMode } from '@/generated/prisma/enums';

// ── Types ────────────────────────────────────────────────────

/**
 * Represent a grading band for calculations.
 * Compatible with Prisma GradeBand and legacy Grade.
 */
export interface GradeBandInfo {
  label: string;
  minPercentage: number;
  maxPercentage: number;
  points?: number | null;
  description?: string | null;
}

/**
 * Represents a complete grading scale for calculations.
 * Compatible with Prisma GradingScale and legacy GradeScale.
 */
export interface GradingScaleInfo {
  id: string;
  name: string;
  rounding: RoundingRule;
  passThreshold: number;
  pointsMode: PointsMode;
  allowGrace: boolean;
  maxGraceMarks: number;
  isDefault: boolean;
  bands: GradeBandInfo[];
}

// Backward compatibility aliases
export type GradeScale = GradingScaleInfo;
export type Grade = GradeBandInfo;

// ── Predefined Grading Scales (Legacy/Defaults) ──────────────

/**
 * Fail-safe grading scale used as an absolute fallback only if:
 * 1. No exam-specific scale is set
 * 2. No session-specific scale is set
 * 3. No organization default is configured in the database
 */
export const DEFAULT_GRADING_SCALE: GradingScaleInfo = {
  id: 'fail-safe',
  name: 'Standard (Fail-safe)',
  rounding: RoundingRule.NEAREST,
  passThreshold: 33,
  pointsMode: PointsMode.NONE,
  allowGrace: false,
  maxGraceMarks: 0,
  isDefault: true,
  bands: [
    { label: 'PASSED', minPercentage: 33, maxPercentage: 100 },
    { label: 'FAILED', minPercentage: 0, maxPercentage: 32.99 }
  ],
};

/**
 * Predefined institutional grading presets.
 * Used for quick-start configurations in the creation flow.
 */
export const PRESET_SCALES: Record<string, { name: string; bands: GradeBandInfo[]; pointsMode: PointsMode }> = {
  cbse: {
    name: "CBSE (A1–E2)", pointsMode: PointsMode.CGPA, bands: [
      { label: "A1", minPercentage: 91, maxPercentage: 100, points: 10, description: "Outstanding" },
      { label: "A2", minPercentage: 81, maxPercentage: 90.99, points: 9, description: "Excellent" },
      { label: "B1", minPercentage: 71, maxPercentage: 80.99, points: 8, description: "Very Good" },
      { label: "B2", minPercentage: 61, maxPercentage: 70.99, points: 7, description: "Good" },
      { label: "C1", minPercentage: 51, maxPercentage: 60.99, points: 6, description: "Above Average" },
      { label: "C2", minPercentage: 41, maxPercentage: 50.99, points: 5, description: "Average" },
      { label: "D", minPercentage: 33, maxPercentage: 40.99, points: 4, description: "Pass" },
      { label: "E1", minPercentage: 21, maxPercentage: 32.99, points: 0, description: "Fail" },
      { label: "E2", minPercentage: 0, maxPercentage: 20.99, points: 0, description: "Fail" },
    ]
  },
  outstanding: {
    name: "Outstanding (O–E)", pointsMode: PointsMode.NONE, bands: [
      { label: "O+", minPercentage: 95, maxPercentage: 100, points: null, description: "Outstanding Plus" },
      { label: "O", minPercentage: 90, maxPercentage: 94.99, points: null, description: "Outstanding" },
      { label: "A+", minPercentage: 85, maxPercentage: 89.99, points: null, description: "Excellent Plus" },
      { label: "A", minPercentage: 80, maxPercentage: 84.99, points: null, description: "Excellent" },
      { label: "B+", minPercentage: 75, maxPercentage: 79.99, points: null, description: "Very Good Plus" },
      { label: "B", minPercentage: 70, maxPercentage: 74.99, points: null, description: "Very Good" },
      { label: "C", minPercentage: 60, maxPercentage: 69.99, points: null, description: "Good" },
      { label: "D", minPercentage: 50, maxPercentage: 59.99, points: null, description: "Satisfactory" },
      { label: "E", minPercentage: 0, maxPercentage: 49.99, points: null, description: "Needs Improvement" },
    ]
  },
  standard: {
    name: "Standard (A–F)", pointsMode: PointsMode.GPA, bands: [
      { label: "A+", minPercentage: 97, maxPercentage: 100, points: 4.0 },
      { label: "A", minPercentage: 93, maxPercentage: 96.99, points: 4.0 },
      { label: "A-", minPercentage: 90, maxPercentage: 92.99, points: 3.7 },
      { label: "B+", minPercentage: 87, maxPercentage: 89.99, points: 3.3 },
      { label: "B", minPercentage: 83, maxPercentage: 86.99, points: 3.0 },
      { label: "B-", minPercentage: 80, maxPercentage: 82.99, points: 2.7 },
      { label: "C+", minPercentage: 77, maxPercentage: 79.99, points: 2.3 },
      { label: "C", minPercentage: 73, maxPercentage: 76.99, points: 2.0 },
      { label: "D", minPercentage: 65, maxPercentage: 72.99, points: 1.0 },
      { label: "F", minPercentage: 0, maxPercentage: 64.99, points: 0.0 },
    ]
  },
  simple: {
    name: "Pass / Fail", pointsMode: PointsMode.NONE, bands: [
      { label: "Pass", minPercentage: 33, maxPercentage: 100, points: null },
      { label: "Fail", minPercentage: 0, maxPercentage: 32.99, points: null },
    ]
  },
};

// ── Core Calculation Functions ───────────────────────────────

/**
 * Core rounding logic based on specified RoundingRule.
 */
export function applyRounding(value: number, rule: RoundingRule): number {
  switch (rule) {
    case RoundingRule.UP:
      return Math.ceil(value);
    case RoundingRule.DOWN:
      return Math.floor(value);
    case RoundingRule.NEAREST:
      return Math.round(value);
    case RoundingRule.NONE:
    default:
      return Math.round(value * 100) / 100; // Default to 2 decimal places
  }
}

/**
 * Calculate the absolute passing marks needed for an exam based on its scale.
 * Formula: (Max Marks * Pass Threshold %) / 100
 */
export function calculatePassingMarks(
  maxMarks: number,
  scale: GradingScaleInfo
): number {
  const raw = (maxMarks * scale.passThreshold) / 100;
  return applyRounding(raw, scale.rounding);
}

/**
 * Calculate the grade for a given percentage using the specified scale.
 * Returns the matching Grade object or null if out of range.
 */
export function calculateGrade(
  percentage: number,
  scale: GradingScaleInfo,
): GradeBandInfo | null {
  // 1. Apply rounding to the incoming percentage based on scale rules
  const roundedPercentage = applyRounding(percentage, scale.rounding);

  if (roundedPercentage < 0 || roundedPercentage > 100) return null;

  // 2. Find the matching band
  return (
    scale.bands.find(
      (band) =>
        roundedPercentage >= band.minPercentage && 
        roundedPercentage <= band.maxPercentage
    ) || null
  );
}

/**
 * Shorthand: get just the label string for a percentage.
 * Used by report-card-generation where we only need the label.
 */
/**
 * Shorthand: get just the label string for a percentage.
 */
export function calculateGradeLabel(
  percentage: number,
  scale: GradingScaleInfo = DEFAULT_GRADING_SCALE,
): string {
  const grade = calculateGrade(percentage, scale);
  return grade?.label ?? 'N/A';
}

/**
 * Convert a percentage to a 10-point CGPA using the CBSE formula.
 */
export function calculateCGPA(percentage: number): number {
  return Number((percentage / 9.5).toFixed(2));
}

/**
 * Determine overall result status from individual exam results.
 *
 * - All passed → PASSED
 * - 1–2 subjects failed → COMPARTMENT
 * - 3+ subjects failed → FAILED
 */
export function determineResultStatus(
  examResults: Array<{ isPassed: boolean | null }>,
  allPassed: boolean,
): 'PASSED' | 'FAILED' | 'COMPARTMENT' {
  if (allPassed) return 'PASSED';

  const failedCount = examResults.filter((r) => r.isPassed === false).length;
  if (failedCount >= 1 && failedCount <= 2) return 'COMPARTMENT';

  return 'FAILED';
}

/**
 * Check if a percentage meets the passing threshold.
 */
/**
 * Check if a percentage meets the passing threshold.
 * Supports Grace Marks: if the score is slightly below threshold but within grace limit.
 */
export function isPassingGrade(
  percentage: number,
  scale: GradingScaleInfo,
): { isPassed: boolean; isGraceApplied: boolean } {
  // Round the percentage first
  const rounded = applyRounding(percentage, scale.rounding);

  if (rounded >= scale.passThreshold) {
    return { isPassed: true, isGraceApplied: false };
  }

  // Grace marks logic
  if (scale.allowGrace && scale.maxGraceMarks > 0) {
    // Note: grace marks are usually absolute marks, but here we calculate based on percentage
    // For simplicity, we check if the difference is within the allowed grace percentage.
    // In a real system, you'd calculate (obtained + grace) / maxMarks.
    if (scale.passThreshold - rounded <= scale.maxGraceMarks) {
      return { isPassed: true, isGraceApplied: true };
    }
  }

  return { isPassed: false, isGraceApplied: false };
}

// ── Badge Color Utilities ────────────────────────────────────

// ── Visual Theme Mapping ─────────────────────────────────────

/**
 * Standard colors for grading bands.
 * Consistent across: PREVIEW BAR, RESULT BADGES, and ROW HIGHLIGHTS.
 */
const GRADING_THEME = {
  OUTSTANDING: { bg: "bg-purple-500/35", text: "text-purple-800 dark:text-purple-200", border: "border-purple-500/30", bubble: "bg-purple-500", solid: "bg-purple-500" },
  EXCELLENT:   { bg: "bg-violet-500/35", text: "text-violet-800 dark:text-violet-200", border: "border-violet-500/30", bubble: "bg-violet-500", solid: "bg-violet-500" },
  GOOD:        { bg: "bg-emerald-500/35", text: "text-emerald-800 dark:text-emerald-200", border: "border-emerald-500/30", bubble: "bg-emerald-500", solid: "bg-emerald-500" },
  AVERAGE:     { bg: "bg-teal-500/35",    text: "text-teal-800 dark:text-teal-200",       border: "border-teal-500/30",    bubble: "bg-teal-500", solid: "bg-teal-500" },
  QUALIFIED:   { bg: "bg-blue-500/35",    text: "text-blue-800 dark:text-blue-200",       border: "border-blue-500/30",    bubble: "bg-blue-500", solid: "bg-blue-500" },
  PASS:        { bg: "bg-sky-500/35",     text: "text-sky-800 dark:text-sky-200",         border: "border-sky-500/30",     bubble: "bg-sky-500",  solid: "bg-sky-500" },
  LOW_PASS:    { bg: "bg-amber-500/35",   text: "text-amber-800 dark:text-amber-200",     border: "border-amber-500/30",   bubble: "bg-amber-500", solid: "bg-amber-500" },
  FAIL:        { bg: "bg-red-500/35",     text: "text-red-800 dark:text-red-200",         border: "border-red-500/30",     bubble: "bg-red-500",   solid: "bg-red-500" },
};

export type GradingColorScheme = keyof typeof GRADING_THEME;

/**
 * Single source of truth for color-coding grading results based on percentage.
 */
export function getGradingVisuals(percentage: number, passThreshold: number = 33) {
  if (percentage < passThreshold) return { ...GRADING_THEME.FAIL, id: 'FAIL' as const };
  if (percentage >= 95) return { ...GRADING_THEME.OUTSTANDING, id: 'OUTSTANDING' as const };
  if (percentage >= 85) return { ...GRADING_THEME.EXCELLENT, id: 'EXCELLENT' as const };
  if (percentage >= 75) return { ...GRADING_THEME.GOOD, id: 'GOOD' as const };
  if (percentage >= 65) return { ...GRADING_THEME.AVERAGE, id: 'AVERAGE' as const };
  if (percentage >= 55) return { ...GRADING_THEME.QUALIFIED, id: 'QUALIFIED' as const };
  if (percentage >= 45) return { ...GRADING_THEME.PASS, id: 'PASS' as const };
  return { ...GRADING_THEME.LOW_PASS, id: 'LOW_PASS' as const };
}

export function getGradeColorBadge(
  grade: Grade,
  isPassed: boolean,
  passThreshold: number = 33,
): any {
  if (!isPassed) return 'FAILED';
  const mid = (grade.minPercentage + grade.maxPercentage) / 2;
  const visuals = getGradingVisuals(mid, passThreshold);
  
  // Custom logic for returning established Badge variants if possible, 
  // currently we'll return a variant name compatible with our UI Badge component
  if (mid >= 90) return 'EXCELLENT';
  if (mid >= 80) return 'GOOD';
  if (mid >= 70) return 'VERY_GOOD';
  return 'PASS';
}

/**
 * Map a subject percentage score to a Badge variant.
 * Used in StudentSubjectsRadar and other performance views.
 */
export function getPercentageColorBadge(
  percentage: number,
  passThreshold: number = 33,
): any {
  if (percentage < passThreshold) return 'FAILED';
  if (percentage >= 90) return 'OUTSTANDING';
  if (percentage >= 80) return 'EXCELLENT';
  if (percentage >= 70) return 'VERY_GOOD';
  if (percentage >= 60) return 'GOOD';
  if (percentage >= 50) return 'ABOVE_AVERAGE';
  if (percentage >= 40) return 'AVERAGE';
  return 'PASS';
}

/**
 * Visual Helpers - Extracted from GradingSettings for reuse
 */
/**
 * Visual Helpers used for the BandPreviewBar segments.
 */
export function getBandStatusLabels(midPct: number, pass: number) {
  const v = getGradingVisuals(midPct, pass);
  return { 
    label: midPct < pass ? "Fail" : "Pass", 
    cls: `${v.bg} ${v.text} border ${v.border}` 
  };
}

export function getBandVisualColor(midPct: number, pass: number): string {
  const v = getGradingVisuals(midPct, pass);
  return `${v.bg} ${v.text}`;
}

// ── Lookup Helpers ───────────────────────────────────────────

/**
 * Find a grading scale by its ID string. Returns the default if not found.
 */
/**
 * Find a grading scale by its ID string. Returns the default if not found.
 */
export function getGradingScale(
  scaleId: string | null,
  context?: GradingScaleInfo[]
) {
  if (context) {
    return context.find((s) => s.id === scaleId) ?? DEFAULT_GRADING_SCALE;
  }
  return DEFAULT_GRADING_SCALE;
}
