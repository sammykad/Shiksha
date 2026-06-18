import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NotificationChannel } from '@/generated/prisma/enums';
import { startOfDay, endOfDay, startOfMonth, startOfYear, subDays, isSameDay, addMonths } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const naturalCollator = new Intl.Collator('en-IN', {
  numeric: true,
  sensitivity: 'base',
  ignorePunctuation: true,
});

export function compareNaturalText(a: string, b: string) {
  return naturalCollator.compare(a.trim(), b.trim());
}

export function sortByNaturalText<T>(
  items: T[],
  getText: (item: T) => string
) {
  return [...items].sort((a, b) => compareNaturalText(getText(a), getText(b)));
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────
// IST DATE UTILITIES
//
// RULE: All dates stored in DB via toISTDate()
//   = IST midnight as UTC  e.g. Feb 25 IST = 2026-02-24T18:30:00.000Z
//
// ✅ Single day:  where: { date: toISTDate(someDate) }
// ✅ Range:       where: { date: { gte: toISTDate(start), lt: toISTDate(end) } }
// ❌ NEVER use gte/lt range for a single day — exact match always works
// ❌ NEVER add getStartOfDayIST / getEndOfDayIST — not needed
// ─────────────────────────────────────────────────────────────

const IST = 'Asia/Kolkata';

/** Core — use for ALL DB writes and queries */
export function toISTDate(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, IST);
  zoned.setHours(0, 0, 0, 0);
  return fromZonedTime(zoned, IST);
}

/** Start of month in IST — for monthly report range queries */
export function getStartOfMonthIST(date: Date = new Date()): Date {
  return toISTDate(startOfMonth(toZonedTime(date, IST)));
}

/** Start of next month in IST — upper bound for monthly ranges
 *  where: { date: { gte: getStartOfMonthIST(), lt: getStartOfNextMonthIST() } }
 */
export function getStartOfNextMonthIST(date: Date = new Date()): Date {
  return toISTDate(startOfMonth(addMonths(toZonedTime(date, IST), 1)));
}

/** Start of year in IST — for yearly report range queries */
export function getStartOfYearIST(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, IST);
  zoned.setMonth(0, 1);
  return toISTDate(zoned);
}

/** 30 days ago in IST — for recent activity queries */
export function getStartOfLast30DaysIST(): Date {
  return toISTDate(subDays(new Date(), 30));
}

// ─────────────────────────────────────────────────────────────
// COMPARISON HELPERS
// ─────────────────────────────────────────────────────────────

export function isSameDayIST(a: Date, b: Date): boolean {
  return toISTDate(a).getTime() === toISTDate(b).getTime();
}

export function isBeforeIST(a: Date, b: Date): boolean {
  return toISTDate(a).getTime() < toISTDate(b).getTime();
}

export function isAfterIST(a: Date, b: Date): boolean {
  return toISTDate(a).getTime() > toISTDate(b).getTime();
}

// ─────────────────────────────────────────────────────────────
// DISPLAY FORMATTERS — never use these for DB queries
// ─────────────────────────────────────────────────────────────

/** Custom format string in IST — use for one-off display formats */
export function formatInIST(date: Date | string | number, formatStr: string): string {
  return formatInTimeZone(new Date(date), IST, formatStr);
}

export function formatDateIN(date?: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '-' : formatInTimeZone(d, IST, 'dd/MM/yyyy');
}

export function formatDateTimeIN(date?: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '-' : formatInTimeZone(d, IST, 'dd MMM yyyy, hh:mm a');
}

export function formatTimeIN(date?: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '-' : formatInTimeZone(d, IST, 'hh:mm a');
}

export function getRelativeTime(date?: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const diffInMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST,
  });
}

export function formatDateRange(start: Date, end: Date): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = formatInTimeZone(s, IST, 'yyyy-MM-dd') === formatInTimeZone(e, IST, 'yyyy-MM-dd');

  const date = formatInTimeZone(s, IST, 'd MMM yyyy');
  const st = formatInTimeZone(s, IST, 'hh:mm a');
  const et = formatInTimeZone(e, IST, 'hh:mm a');

  return sameDay
    ? `${date} • ${st} – ${et}`
    : `${date} – ${formatInTimeZone(e, IST, 'd MMM yyyy')}`;
}

export function formatDateRangeDateOnly(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sD = formatInTimeZone(s, IST, 'yyyy-MM-dd');
  const eD = formatInTimeZone(e, IST, 'yyyy-MM-dd');
  const sY = formatInTimeZone(s, IST, 'yyyy');
  const eY = formatInTimeZone(e, IST, 'yyyy');

  if (sD === eD) return formatInTimeZone(s, IST, 'd MMM yyyy');
  if (sY === eY) return `${formatInTimeZone(s, IST, 'd MMM')} - ${formatInTimeZone(e, IST, 'd MMM yyyy')}`;
  return `${formatInTimeZone(s, IST, 'd MMM yyyy')} - ${formatInTimeZone(e, IST, 'd MMM yyyy')}`;
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const s = formatInTimeZone(new Date(start), IST, 'hh:mm a');
  const e = formatInTimeZone(new Date(end), IST, 'hh:mm a');
  return s === e ? s : `${s} - ${e}`;
}

export function timeUntil(target: Date): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return 'Starts soon';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const UNITS = {
  day: 1440,
  hour: 60,
};
export const getDurationBreakdown = (totalMinutes: number): {
  days: number;
  hours: number;
  minutes: number;
} => {
  const days = Math.floor(totalMinutes / UNITS.day);
  const hours = Math.floor((totalMinutes % UNITS.day) / UNITS.hour);
  const minutes = totalMinutes % UNITS.hour;

  return { days, hours, minutes };
};
/**
 * Formats minutes into a human-readable string (e.g., "1d 2h 30m")
 */
export const formatDuration = (totalMinutes: number): string => {
  if (totalMinutes === 0) return '0m';

  const { days, hours, minutes } = getDurationBreakdown(totalMinutes);
  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};
/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Split array into chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`⏳ Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}
export function formatCurrencyIN(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyINWithSymbol(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Billing-only formatter — always shows paise (2 decimal places).
 *  Use this for notification costs and wallet balances, NOT for fee amounts. */
export function formatCostINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Cost mapping for each notification channel (INR per unit).
 */
const CHANNEL_COST_MAP: Record<NotificationChannel, number> = {
  EMAIL: 0.36, // ~₹0.5 – ₹1 per 100 emails via services like SES, SendGrid
  SMS: 0.9, // ₹0.15 – ₹0.25 typical bulk SMS rate (domestic transactional)
  WHATSAPP: 0.75, // ₹0.7 – ₹0.9 per template msg (Meta Business pricing in India)
  PUSH: 0.2, // Free (Firebase, OneSignal, or in-app push)
};

/**
 * Get the cost per message for a given notification channel.
 * @param channel - NotificationChannel enum value
 * @returns Cost per unit in RUPEES (float)
 */
export function getChannelUnitCost(channel: NotificationChannel): number {
  return CHANNEL_COST_MAP[channel];
}

/**
 * Calculate the total cost for a notification.
 * @param channel - NotificationChannel enum value
 * @param units - Number of messages sent (default = 1)
 * @returns Total cost, rounded to 2 decimals
 */
export function calculateNotificationCost(
  channel: NotificationChannel,
  units: number = 1
): number {
  return getChannelUnitCost(channel) * units;
}

// ─────────────────────────────────────────────────────────────
// GRADING SYSTEM — Re-exported from the single source of truth
// All grading logic lives in lib/data/exam/grade-utils.ts
// ─────────────────────────────────────────────────────────────
export {
  type GradeScale,
  type Grade,
  DEFAULT_GRADING_SCALE,
  calculateGrade,
  calculateGradeLabel,
  calculateCGPA,
  determineResultStatus,
  isPassingGrade,
  getGradeColorBadge,
  getPercentageColorBadge,
  getGradingScale,
} from '@/lib/data/exam/grade-utils';

export function formatBytes(
  bytes: number | null,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  if (bytes === null || bytes === undefined) return 'N/A';

  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

  if (bytes === 0) return '0 Byte';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate'
    ? (accurateSizes[i] ?? 'Bytes')
    : (sizes[i] ?? 'Bytes')
    }`;
}

export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function convertToWords(num: number): string {
  if (num === 0) return ""
  if (num < 20) return ones[num]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convertToWords(num % 100) : "")
  if (num < 100000)
    return convertToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convertToWords(num % 1000) : "")
  if (num < 10000000)
    return convertToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convertToWords(num % 100000) : "")
  return (
    convertToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convertToWords(num % 10000000) : "")
  )
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Zero Rupees Only"

  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)

  let words = "Rupees " + convertToWords(rupees)
  if (paise > 0) {
    words += " and " + convertToWords(paise) + " Paise"
  }
  words += " Only"

  return words
}

/**
 * Normalizes a string into a URL-safe slug.
 *
 * - Converts accented Latin chars (é, ü, ñ) to ASCII equivalents
 * - Strips non-ASCII characters (Devanagari, Arabic, CJK, etc.)
 * - Collapses whitespace and hyphens
 * - Returns a timestamp-based fallback if the result is empty
 *   (handles Indian-language school names like शिक्षा विद्यालय)
 */
export function normalizeSlug(value: string): string {
  if (!value?.trim()) return `school-${Date.now().toString(36)}`;

  let slug = value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug || slug.length < 2) {
    slug = `school-${Date.now().toString(36)}`;
  }

  if (slug.length > 100) {
    slug = slug.slice(0, 100).replace(/-+$/, "");
  }

  return slug;
}
