import { Font } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

Font.register({
  family: "Geist",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Medium.ttf", fontWeight: 500 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-SemiBold.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Bold.ttf", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Regular.ttf", fontWeight: 400, fontStyle: "italic" },
  ],
});

export const COLORS = {
  // ── Brand ───────────────────────────────────────────
  brand: "#2563eb",  // primary blue
  brandLight: "#dbeafe",  // blue tint bg
  brandDark: "#1d4ed8",  // blue hover/deep

  // ── Text ────────────────────────────────────────────
  ink: "#111827",  // headings, labels
  body: "#374151",  // body text
  muted: "#6b7280",  // secondary text
  subtle: "#9ca3af",  // placeholders, hints

  // ── Surfaces ────────────────────────────────────────
  white: "#ffffff",
  bg: "#f9fafb",  // page background
  bgDark: "#f3f4f6",  // table row alt, section bg
  bgDeep: "#e9eaec",  // deep section dividers

  // ── Borders ─────────────────────────────────────────
  rule: "#e5e7eb",  // light dividers
  ruleDark: "#d1d5db",  // table borders, strong rules

  // ── Semantic: Status ────────────────────────────────
  success: "#059669",  // paid, present, pass
  successLight: "#d1fae5",  // paid badge bg
  warning: "#d97706",  // pending, partial, late
  warningLight: "#fef3c7",  // pending badge bg
  error: "#dc2626",  // overdue, absent, fail
  errorLight: "#fee2e2",  // overdue badge bg
  info: "#0284c7",  // neutral info, notes
  infoLight: "#e0f2fe",  // info badge bg

  // ── Document-specific accents ───────────────────────
  // SubscriptionInvoicePDF
  invoice: "#7c3aed",  // purple — billing/SaaS
  invoiceLight: "#ede9fe",

  // FeeReceiptPDF
  receipt: "#0891b2",  // cyan — payment confirmed
  receiptLight: "#cffafe",

  // StudentReportPDF
  report: "#0d9488",  // teal — academic
  reportLight: "#ccfbf1",

  // AttendanceReportPDF
  attendance: "#ea580c",  // orange — attendance
  attendanceLight: "#ffedd5",

  // HallTicketPDF
  hallTicket: "#4f46e5",  // indigo — exam/official
  hallTicketLight: "#e0e7ff",

} as const;

export const FONT_FAMILY = {
  sans: "Geist",
  mono: "Courier",
} as const;

type SpacingKey = keyof typeof SPACING_SCALE;
type FontSizeKey = keyof typeof FONT_SIZE_MAP;

type KnownColorName =
  | 'white' | 'black' | 'transparent' | 'current'
  | keyof typeof COLORS;

type DirSuffix = '' | 'x' | 'y' | 't' | 'r' | 'b' | 'l';

type TwToken =
  | keyof typeof exact
  | `text-${KnownColorName | FontSizeKey}`
  | `bg-${KnownColorName}`
  | `bg-${KnownColorName}/${'0' | '5' | '10' | '20' | '25' | '30' | '40' | '50' | '60' | '70' | '75' | '80' | '90' | '95' | '100'}`
  | `decoration-${KnownColorName}`
  | `font-${'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'}`
  | `font-${'sans' | 'serif' | 'mono'}`
  | `p${DirSuffix}-${SpacingKey | 'auto'}`
  | `m${DirSuffix}-${SpacingKey | 'auto'}`
  | `-m${DirSuffix}-${SpacingKey}`
  | `w-${SpacingKey | 'full' | 'auto' | 'screen' | 'fit'}`
  | `h-${SpacingKey | 'full' | 'auto' | 'screen' | 'fit'}`
  | `min-w-${SpacingKey | 'full' | '0'}`
  | `max-w-${SpacingKey | 'full' | '0'}`
  | `min-h-${SpacingKey | 'full' | '0'}`
  | `max-h-${SpacingKey | 'full' | '0'}`
  | `gap${'' | '-x' | '-y'}-${SpacingKey}`
  | `tracking-${'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest'}`
  | `leading-${'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'}`
  | 'rounded'
  | `rounded-${'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | SpacingKey}`
  | `rounded-t-${'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | SpacingKey}`
  | `rounded-b-${'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | SpacingKey}`
  | `rounded-l-${'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | SpacingKey}`
  | `rounded-r-${'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | SpacingKey}`
  | `border-${'0' | '2' | '4' | '8'}`
  | `border-t-${'0' | '2' | '4' | '8'}` | `border-t`
  | `border-r-${'0' | '2' | '4' | '8'}` | `border-r`
  | `border-b-${'0' | '2' | '4' | '8'}` | `border-b`
  | `border-l-${'0' | '2' | '4' | '8'}` | `border-l`
  | `border-${KnownColorName}`
  | `border-t-${KnownColorName}`
  | `border-r-${KnownColorName}`
  | `border-b-${KnownColorName}`
  | `border-l-${KnownColorName}`
  | `divide-${KnownColorName}`
  | `inset-${SpacingKey | 'auto'}`
  | `top-${SpacingKey | 'auto'}`
  | `right-${SpacingKey | 'auto'}`
  | `bottom-${SpacingKey | 'auto'}`
  | `left-${SpacingKey | 'auto'}`
  | `basis-${SpacingKey | 'full'}`
  | `z-${SpacingKey | 'auto'}`
  | `order-${'first' | 'last' | 'none' | SpacingKey}`
  | `opacity-${'0' | '5' | '10' | '20' | '25' | '30' | '40' | '50' | '60' | '70' | '75' | '80' | '90' | '95' | '100'}`
  | `scale-${'0' | '50' | '75' | '90' | '95' | '100' | '105' | '110' | '125' | '150'}`
  | `scale-x-${'0' | '50' | '75' | '90' | '95' | '100' | '105' | '110' | '125' | '150'}`
  | `scale-y-${'0' | '50' | '75' | '90' | '95' | '100' | '105' | '110' | '125' | '150'}`
  | `aspect-${'square' | 'video'}`;

const COLOR_MAP: Record<string, string> = {
  white: COLORS.white,
  black: COLORS.ink,
  transparent: "transparent",
  current: "currentColor",
  ...Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, v])),
};

const colorScales: Record<string, Record<string, string>> = {
  neutral: {
    "50": "#fafafa", "100": "#f5f5f5", "200": "#e5e5e5", "300": "#d4d4d4",
    "400": "#a3a3a3", "500": COLORS.muted, "600": COLORS.subtle,
    "700": "#404040", "800": "#262626", "900": "#171717", "950": "#0a0a0a",
  },
  gray: {
    "50": "#f9fafb", "100": "#f3f4f6", "200": "#e5e7eb", "300": "#d1d5db",
    "400": "#9ca3af", "500": COLORS.muted, "600": COLORS.subtle,
    "700": "#374151", "800": "#1f2937", "900": "#111827", "950": "#030712",
  },
  slate: {
    "50": "#f8fafc", "100": "#f1f5f9", "200": "#e2e8f0", "300": "#cbd5e1",
    "400": "#94a3b8", "500": COLORS.muted, "600": COLORS.subtle,
    "700": "#334155", "800": "#1e293b", "900": "#0f172a", "950": "#020617",
  },
  zinc: {
    "50": "#fafafa", "100": "#f4f4f5", "200": "#e4e4e7", "300": "#d4d4d8",
    "400": "#a1a1aa", "500": COLORS.muted, "600": COLORS.subtle,
    "700": "#3f3f46", "800": "#27272a", "900": "#18181b", "950": "#09090b",
  },
};

const SPACING_SCALE = {
  "0": 0, "0.5": 2, "1": 4, "1.5": 6, "2": 8, "2.5": 10,
  "3": 12, "3.5": 14, "4": 16, "5": 20, "6": 24, "7": 28,
  "8": 32, "9": 36, "10": 40, "11": 44, "12": 48, "14": 56,
  "16": 64, "20": 80, "24": 96, "28": 112, "32": 128, "36": 144,
  "40": 160, "44": 176, "48": 192, "52": 208, "56": 224,
  "60": 240, "64": 256, "72": 288, "80": 320, "96": 384,
} as const;

const FONT_SIZE_MAP = {
  "3xs": 6, "2xs": 7, xs: 8, sm: 9, base: 10, md: 11,
  lg: 12, xl: 14, "2xl": 16, "3xl": 20,
  h3: 16, h2: 18, h1: 24,
} as const;

const BORDER_WIDTHS: Record<string, number> = { "0": 0, "2": 2, "4": 4, "8": 8 };

const ASPECT_RATIOS: Record<string, number> = {
  square: 1,
  video: 16 / 9,
};

const LEADING_MAP: Record<string, number> = {
  none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2,
};

const TRACKING_MAP: Record<string, number> = {
  tighter: -0.6, tight: -0.3, normal: 0, wide: 0.3, wider: 0.6, widest: 1.2,
};

function getSpacing(n: string): number | undefined {
  if (n in SPACING_SCALE) return SPACING_SCALE[n as keyof typeof SPACING_SCALE];
  const parsed = parseFloat(n);
  if (!isNaN(parsed)) return parsed * 4;
  return undefined;
}

function bracketValue(raw: string): string | number {
  const inner = raw.slice(1, -1).replace(/_/g, " ");
  if (inner.endsWith("px") || inner.endsWith("pt")) return parseFloat(inner) || inner;
  if (inner.endsWith("%")) return inner;
  const num = parseFloat(inner);
  return isNaN(num) ? inner : num;
}

function resolveColor(raw: string): string | undefined {
  if (raw in COLOR_MAP) return COLOR_MAP[raw];
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl")) return raw;
  for (const [, shades] of Object.entries(colorScales)) {
    const shade = raw.startsWith(Object.keys(shades)[0] ?? "") ? null : null;
    const prefix = Object.values(colorScales).find((s) => {
      const key = Object.entries(s).find(([k]) => raw.endsWith(`-${k}`));
      return key;
    });
    if (prefix) {
      const parts = raw.split("-");
      const shadeKey = parts[parts.length - 1];
      const scaleName = parts.slice(0, -1).join("-");
      const scale = colorScales[scaleName];
      if (scale && shadeKey in scale) return scale[shadeKey];
    }
  }
  const [scaleName, shade] = raw.split("-");
  const scale = colorScales[scaleName];
  if (scale && shade && shade in scale) return scale[shade];
  return undefined;
}

const exact: Record<string, Style> = {
  flex: { display: "flex" },
  hidden: { display: "none" },
  "flex-row": { flexDirection: "row" },
  "flex-col": { flexDirection: "column" },
  "flex-row-reverse": { flexDirection: "row-reverse" },
  "flex-col-reverse": { flexDirection: "column-reverse" },
  "flex-wrap": { flexWrap: "wrap" },
  "flex-nowrap": { flexWrap: "nowrap" },
  "flex-1": { flex: "1 1 0%" },
  "flex-auto": { flex: "1 1 auto" },
  "flex-none": { flex: "none" },
  grow: { flexGrow: 1 },
  "grow-0": { flexGrow: 0 },
  shrink: { flexShrink: 1 },
  "shrink-0": { flexShrink: 0 },
  "items-start": { alignItems: "flex-start" },
  "items-end": { alignItems: "flex-end" },
  "items-center": { alignItems: "center" },
  "items-baseline": { alignItems: "baseline" },
  "items-stretch": { alignItems: "stretch" },
  "justify-start": { justifyContent: "flex-start" },
  "justify-end": { justifyContent: "flex-end" },
  "justify-center": { justifyContent: "center" },
  "justify-between": { justifyContent: "space-between" },
  "justify-around": { justifyContent: "space-around" },
  "justify-evenly": { justifyContent: "space-evenly" },
  "content-start": { alignContent: "flex-start" },
  "content-end": { alignContent: "flex-end" },
  "content-center": { alignContent: "center" },
  "content-between": { alignContent: "space-between" },
  "content-around": { alignContent: "space-around" },
  "content-stretch": { alignContent: "stretch" },
  "self-auto": { alignSelf: "auto" },
  "self-start": { alignSelf: "flex-start" },
  "self-end": { alignSelf: "flex-end" },
  "self-center": { alignSelf: "center" },
  "self-baseline": { alignSelf: "baseline" },
  "self-stretch": { alignSelf: "stretch" },
  "text-left": { textAlign: "left" },
  "text-center": { textAlign: "center" },
  "text-right": { textAlign: "right" },
  "text-justify": { textAlign: "justify" },
  italic: { fontStyle: "italic" },
  "not-italic": { fontStyle: "normal" },
  underline: { textDecoration: "underline" },
  "line-through": { textDecoration: "line-through" },
  "no-underline": { textDecoration: "none" },
  uppercase: { textTransform: "uppercase" },
  lowercase: { textTransform: "lowercase" },
  capitalize: { textTransform: "capitalize" },
  "font-thin": { fontWeight: 100 },
  "font-extralight": { fontWeight: 200 },
  "font-light": { fontWeight: 300 },
  "font-normal": { fontWeight: 400 },
  "font-medium": { fontWeight: 500 },
  "font-semibold": { fontWeight: 600 },
  "font-bold": { fontWeight: 700 },
  "font-extrabold": { fontWeight: 800 },
  "font-black": { fontWeight: 900 },
  "object-contain": { objectFit: "contain" },
  "object-cover": { objectFit: "cover" },
  "object-fill": { objectFit: "fill" },
  "object-none": { objectFit: "none" },
  "object-scale-down": { objectFit: "scale-down" },
  absolute: { position: "absolute" },
  relative: { position: "relative" },
  "overflow-hidden": { overflow: "hidden" } as Style,
  truncate: { overflow: "hidden", textOverflow: "ellipsis" },
  "border-solid": { borderStyle: "solid" },
  "border-dashed": { borderStyle: "dashed" },
  "border-dotted": { borderStyle: "dotted" },
  border: { borderWidth: 1 },

  "divide-y": { borderTopWidth: 0, borderBottomWidth: 0 },
  "divide-x": { borderLeftWidth: 0, borderRightWidth: 0 },
};

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: FONT_FAMILY.sans,
  serif: "Times-Roman",
  mono: FONT_FAMILY.mono,
};

function spacingValue(dir: string | undefined, val: string, negate: boolean): Style {
  const s = getSpacing(val);
  if (s === undefined) return {};
  const d = negate ? -s : s;
  switch (dir) {
    case "x": return { marginLeft: d, marginRight: d };
    case "y": return { marginTop: d, marginBottom: d };
    case "t": return { marginTop: d };
    case "r": return { marginRight: d };
    case "b": return { marginBottom: d };
    case "l": return { marginLeft: d };
    default: return { margin: d };
  }
}

function borderDir(dir: string, width: number, color: string): Style {
  const props: Record<string, string | number> = {};
  const sides = dir === "x" ? ["Left", "Right"] : dir === "y" ? ["Top", "Bottom"] : [dir.charAt(0).toUpperCase() + dir.slice(1)];
  for (const side of dir === "x" ? ["Left", "Right"] : dir === "y" ? ["Top", "Bottom"] : [capitalize(dir)]) {
    props[`border${side}Width` as keyof Style] = width;
    (props as any)[`border${side}Color`] = color;
  }
  return props as Style;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseClass(cls: string): Style {
  if (cls in exact) return exact[cls];

  // tracking-* (named + bracket)
  if (cls.startsWith("tracking-")) {
    const val = cls.slice(9);
    if (val in TRACKING_MAP) return { letterSpacing: TRACKING_MAP[val] };
    if (val.startsWith("[")) {
      const raw = val.slice(1, -1).replace(/_/g, " ");
      const num = parseFloat(raw);
      if (!isNaN(num)) return { letterSpacing: num };
      if (raw.endsWith("em")) return { letterSpacing: parseFloat(raw) * 12 };
      return { letterSpacing: raw };
    }
  }

  // leading-* (named, numeric, bracket)
  if (cls.startsWith("leading-")) {
    const val = cls.slice(8);
    if (val in LEADING_MAP) return { lineHeight: LEADING_MAP[val] };
    if (val.startsWith("[")) {
      const raw = val.slice(1, -1).replace(/_/g, " ");
      return { lineHeight: parseFloat(raw) || raw };
    }
    const num = parseInt(val);
    if (!isNaN(num)) return { lineHeight: num * 4 / 12 };
  }

  // aspect-*
  if (cls.startsWith("aspect-")) {
    const val = cls.slice(7);
    if (val in ASPECT_RATIOS) return { aspectRatio: ASPECT_RATIOS[val] };
    if (val.startsWith("[")) {
      const raw = val.slice(1, -1).replace(/_/g, " ");
      const [num, den] = raw.split("/");
      if (num && den) return { aspectRatio: parseFloat(num) / parseFloat(den) };
      const n = parseFloat(raw);
      return { aspectRatio: isNaN(n) ? raw : n };
    }
  }

  // w-* and h-*
  if (cls.startsWith("w-") || cls.startsWith("h-")) {
    const prop: "width" | "height" = cls[0] === "w" ? "width" : "height";
    const val = cls.slice(2);
    const result = sizeValue(val, prop);
    if (result) return result;
  }

  // min-w-*, max-w-*, min-h-*, max-h-*
  {
    const m = cls.match(/^(min-w|max-w|min-h|max-h)-(.+)$/);
    if (m) {
      const propMap: Record<string, keyof Style> = { "min-w": "minWidth", "max-w": "maxWidth", "min-h": "minHeight", "max-h": "maxHeight" };
      const prop = propMap[m[1]];
      const val = m[2];
      if (prop) {
        if (val === "full") return { [prop]: "100%" } as Style;
        if (val === "0") return { [prop]: 0 } as Style;
        if (val.startsWith("[")) return { [prop]: bracketValue(val) } as Style;
        const s = getSpacing(val);
        if (s !== undefined) return { [prop]: s } as Style;
      }
    }
  }

  // bg-*
  if (cls.startsWith("bg-")) {
    const val = cls.slice(3);
    const colorResult = parseColorValue(val);
    if (colorResult) return { backgroundColor: colorResult };
    if (val === "darkmode") return { backgroundColor: "#181818" };
    // Opacity modifier: bg-brand/20
    const slashIdx = val.lastIndexOf("/");
    if (slashIdx > 0) {
      const c = parseColorValue(val.slice(0, slashIdx));
      const opacity = parseInt(val.slice(slashIdx + 1)) / 100;
      if (c && !isNaN(opacity)) return { backgroundColor: c, opacity: Math.min(Math.max(opacity, 0), 1) };
    }
  }

  // decoration-*
  if (cls.startsWith("decoration-")) {
    const val = cls.slice(11);
    const c = parseColorValue(val);
    if (c) return { textDecorationColor: c };
    if (val.startsWith("[")) return { textDecorationColor: val.slice(1, -1).replace(/_/g, " ") };
  }

  // text-* (color or font-size)
  if (cls.startsWith("text-") && !["text-left", "text-center", "text-right", "text-justify"].includes(cls)) {
    const val = cls.slice(5);
    const colorResult = parseColorValue(val);
    if (colorResult) return { color: colorResult };
    if (val === "darkmode") return { color: "#ffffff" };
    // Opacity modifier: text-ink/50
    const slashIdx = val.lastIndexOf("/");
    if (slashIdx > 0) {
      const c = parseColorValue(val.slice(0, slashIdx));
      const opacity = parseInt(val.slice(slashIdx + 1)) / 100;
      if (c && !isNaN(opacity)) return { color: c, opacity: Math.min(Math.max(opacity, 0), 1) };
    }
    if (val in FONT_SIZE_MAP) return { fontSize: FONT_SIZE_MAP[val as keyof typeof FONT_SIZE_MAP] };
    if (val.startsWith("[")) {
      const raw = val.slice(1, -1).replace(/_/g, " ");
      const num = parseFloat(raw);
      return { fontSize: isNaN(num) ? raw : num };
    }
  }

  // font-* (family, weight bracket)
  if (cls.startsWith("font-")) {
    const val = cls.slice(5);
    if (val in FONT_FAMILY_MAP) return { fontFamily: FONT_FAMILY_MAP[val] };
    if (val.startsWith("[")) {
      const raw = val.slice(1, -1);
      const num = parseInt(raw);
      return { fontWeight: isNaN(num) ? raw : num };
    }
  }

  // Padding & Margin (with negative support)
  const padMatch = cls.match(/^(-?)p([xylrtb])?-([.\d]+)$/);
  if (padMatch) {
    const negate = !!padMatch[1];
    const dir = padMatch[2];
    const val = padMatch[3];
    return paddingValue(dir, val, negate);
  }

  const marMatch = cls.match(/^(-?)m([xylrtb])?-([.\d]+|auto)$/);
  if (marMatch) {
    const negate = !!marMatch[1];
    const dir = marMatch[2];
    const val = marMatch[3];
    if (val === "auto") return marginAuto(dir);
    return spacingValue(dir, val, negate);
  }

  // gap-x-*, gap-y-*, gap-*
  const gapMatch = cls.match(/^gap(-([xy]))?-([.\d]+)$/);
  if (gapMatch) {
    const axis = gapMatch[2];
    const val = gapMatch[3];
    const s = getSpacing(val);
    if (s === undefined) return {};
    if (axis === "x") return { columnGap: s };
    if (axis === "y") return { rowGap: s };
    return { gap: s };
  }

  // rounded-* (with side variants)
  const roundMatch = cls.match(/^rounded(-([trbl]{1,2}))?-(.+)$/);
  if (roundMatch) {
    const side = roundMatch[2] ?? "";
    const val = roundMatch[3];
    return borderRadiusValue(side, val);
  }
  if (cls === "rounded") return { borderRadius: 4 };

  // border-* (side + width, side + color, or plain)
  const borderMatch = cls.match(/^border(-([trblxy]))?(-(\d+|\[\S+\]|[\w#/]+))?$/);
  if (borderMatch) {
    const side = borderMatch[2] ?? "";
    const rawVal = borderMatch[4];
    if (!rawVal) {
      if (!side) return { borderWidth: 1 };
      return borderDir(side, 1, COLORS.rule);
    }
    // Check if it's a width
    if (rawVal in BORDER_WIDTHS || rawVal.startsWith("[")) {
      const w = rawVal.startsWith("[") ? parseFloat(rawVal.slice(1, -1)) || 1 : BORDER_WIDTHS[rawVal] ?? 1;
      if (!side) return { borderWidth: w };
      return borderDir(side, w, COLORS.rule);
    }
    // It's a color
    const c = parseColorValue(rawVal);
    if (c) {
      if (!side) return { borderColor: c };
      return borderDir(side, 1, c);
    }
  }

  // divide-* (color)
  if (cls.startsWith("divide-")) {
    const val = cls.slice(7);
    const c = parseColorValue(val);
    if (c) return { borderColor: c };
  }

  // inset-*, top-, right-, bottom-, left-
  const posMatch = cls.match(/^(-?)(inset(-([xy]))?|top|right|bottom|left)-(.+)$/);
  if (posMatch) {
    const negate = !!posMatch[1];
    const prop = posMatch[2];
    const val = posMatch[5];
    const props = insetProps(prop, val, negate);
    if (props) return props;
  }

  // basis-*
  if (cls.startsWith("basis-")) {
    const val = cls.slice(6);
    if (val.includes("/")) {
      const [num, den] = val.split("/");
      return { flexBasis: `${(parseInt(num) / parseInt(den)) * 100}%` };
    }
    if (val.startsWith("[")) return { flexBasis: bracketValue(val) };
    const s = getSpacing(val);
    if (s !== undefined) return { flexBasis: s };
    if (val === "full") return { flexBasis: "100%" };
  }

  // object-* (position)
  const objPos = ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"];
  if (cls.startsWith("object-") && !objPos.includes(cls.slice(7))) {
    const val = cls.slice(7).replace(/-/g, " ");
    return { objectPosition: val };
  }

  // z-*
  if (cls.startsWith("z-")) {
    const val = cls.slice(2);
    return { zIndex: val === "auto" ? "auto" : (parseInt(val) || 0) as any };
  }

  // order-* (cast - React-PDF supports it at runtime even if types don't)
  if (cls.startsWith("order-")) {
    const val = cls.slice(6);
    const n = val === "first" ? -9999 : val === "last" ? 9999 : val === "none" ? 0 : parseInt(val) || 0;
    return { order: n } as any;
  }

  // opacity-*
  if (cls.startsWith("opacity-")) {
    const val = cls.slice(8);
    return { opacity: Math.min(Math.max(parseInt(val) / 100, 0), 1) };
  }

  // scale-*
  if (cls.startsWith("scale-")) {
    const val = cls.slice(6);
    const direction = val.startsWith("x-") || val.startsWith("y-") ? val[0] : "";
    const numStr = direction ? val.slice(2) : val;
    const num = (parseInt(numStr) || 100) / 100;
    if (direction === "x") return { transform: `scaleX(${num})` } as Style;
    if (direction === "y") return { transform: `scaleY(${num})` } as Style;
    return { transform: `scale(${num})` } as Style;
  }

  return {};
}

function sizeValue(val: string, prop: "width" | "height"): Style | undefined {
  if (val === "full") return { [prop]: "100%" } as Style;
  if (val === "auto") return { [prop]: "auto" } as Style;
  if (val === "screen") return { [prop]: prop === "width" ? "100vw" : "100vh" } as Style;
  if (val === "fit") return { [prop]: "fit-content" } as Style;
  if (val.includes("/")) {
    const [num, den] = val.split("/");
    return { [prop]: `${(parseInt(num) / parseInt(den)) * 100}%` } as Style;
  }
  if (val.startsWith("[")) return { [prop]: bracketValue(val) } as Style;
  const s = getSpacing(val);
  if (s !== undefined) return { [prop]: s } as Style;
  return undefined;
}

function parseColorValue(val: string): string | undefined {
  if (val.startsWith("[")) {
    const inner = val.slice(1, -1).replace(/_/g, " ");
    return resolveColor(inner) || inner;
  }
  if (val in COLOR_MAP) return COLOR_MAP[val];
  for (const [name, shades] of Object.entries(colorScales)) {
    if (val.startsWith(`${name}-`)) {
      const shade = val.slice(name.length + 1);
      if (shade in shades) return shades[shade];
    }
  }
  if (val.startsWith("#") || val.startsWith("rgb") || val.startsWith("hsl")) return val;
  return undefined;
}

function paddingValue(dir: string | undefined, val: string, negate: boolean): Style {
  const s = getSpacing(val);
  if (s === undefined) return {};
  const d = negate ? -s : s;
  switch (dir) {
    case "x": return { paddingLeft: d, paddingRight: d };
    case "y": return { paddingTop: d, paddingBottom: d };
    case "t": return { paddingTop: d };
    case "r": return { paddingRight: d };
    case "b": return { paddingBottom: d };
    case "l": return { paddingLeft: d };
    default: return { padding: d };
  }
}

function marginAuto(dir: string | undefined): Style {
  switch (dir) {
    case "x": return { marginLeft: "auto", marginRight: "auto" };
    case "y": return { marginTop: "auto", marginBottom: "auto" };
    case "l": return { marginLeft: "auto" };
    case "r": return { marginRight: "auto" };
    case "t": return { marginTop: "auto" };
    case "b": return { marginBottom: "auto" };
    default: return { margin: "auto" };
  }
}

function borderRadiusValue(side: string, val: string): Style {
  const r = val === "none" ? 0 : val === "sm" ? 2 : val === "md" || val === "DEFAULT" ? 4 : val === "lg" ? 8 : val === "xl" ? 12 : val === "2xl" ? 16 : val === "full" ? 9999 : val.startsWith("[") ? parseFloat(val.slice(1, -1)) || val.slice(1, -1) : undefined;
  if (r === undefined) return {};

  const corners: Record<string, string[]> = {
    t: ["TopLeft", "TopRight"],
    r: ["TopRight", "BottomRight"],
    b: ["BottomRight", "BottomLeft"],
    l: ["BottomLeft", "TopLeft"],
    tl: ["TopLeft"],
    tr: ["TopRight"],
    br: ["BottomRight"],
    bl: ["BottomLeft"],
  };

  const pair = corners[side];
  if (!pair) return { borderRadius: typeof r === "number" ? r : r };

  const result: Style = {};
  for (const corner of pair) {
    (result as any)[`border${corner}Radius`] = r;
  }
  return result;
}

function insetProps(prop: string, val: string, negate: boolean): Style | undefined {
  const props: string[] = [];
  if (prop === "inset") props.push("top", "right", "bottom", "left");
  else if (prop === "inset-x") props.push("left", "right");
  else if (prop === "inset-y") props.push("top", "bottom");
  else if (["top", "right", "bottom", "left"].includes(prop)) props.push(prop);
  else return undefined;

  const result: Style = {};
  let resolved: string | number | undefined;

  if (val === "auto") resolved = "auto";
  else if (val.includes("/")) {
    const [num, den] = val.split("/");
    resolved = `${(parseInt(num) / parseInt(den)) * 100}%`;
  } else if (val.startsWith("[")) {
    resolved = bracketValue(val);
  } else {
    const s = getSpacing(val);
    if (s !== undefined) resolved = negate ? -s : s;
  }

  if (resolved === undefined) return undefined;
  for (const p of props) (result as any)[p] = resolved;
  return result;
}

export function tw(...tokens: (TwToken | (string & {}))[]): Style {
  if (!tokens.length) return {};
  return tokens
    .flatMap(c => c.trim().split(/\s+/))
    .filter(Boolean)
    .reduce<Style>((acc, cls) => {
      const style = parseClass(cls.trim());
      return { ...acc, ...style };
    }, {});
}
