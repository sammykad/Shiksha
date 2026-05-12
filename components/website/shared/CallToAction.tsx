/**
 * components/shared/call-to-action.tsx
 *
 * Reusable CTA component for Shiksha Cloud.
 * Supports two variants:
 *   - "bordered"  → light/themed, plus-corner style (used on homepage, generic pages)
 *   - "dark"      → dark card with grid overlay (used on feature pages)
 *
 * Usage examples:
 *
 *   // Default bordered variant
 *   <CallToAction />
 *
 *   // Dark variant with custom copy
 *   <CallToAction
 *     variant="dark"
 *     badge="Get Started Today"
 *     heading={<>Ready to Run Exams<br />Without the Chaos?</>}
 *     description="From session setup to report cards — your entire exam lifecycle, automated inside Shiksha Cloud."
 *     primaryLabel="Start Free Trial"
 *     primaryHref="/select-organization"
 *     secondaryLabel="Schedule a Demo"
 *     secondaryHref="/contact"
 *     footnote="No credit card required · CBSE & state board ready · Cancel anytime"
 *   />
 *
 *   // Override just the heading on a specific feature page
 *   <CallToAction
 *     variant="dark"
 *     heading={<>Simplify Fee Collection<br />Starting Today</>}
 *   />
 */

import { ArrowRight, PhoneCall } from "lucide-react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CallToActionProps {
  /** Visual variant. Defaults to "bordered". */
  variant?: "bordered" | "dark";

  /** Small pill label above the heading (dark variant only). */
  badge?: string;

  /** Main heading. Accepts a string or JSX (for <br /> line breaks). */
  heading?: ReactNode;

  /** Supporting paragraph below the heading. */
  description?: string;

  /** Label for the primary (filled) button. */
  primaryLabel?: string;

  /** href for the primary button. */
  primaryHref?: string;

  /** Label for the secondary (outline) button. */
  secondaryLabel?: string;

  /** href for the secondary button. Pass undefined to hide it. */
  secondaryHref?: string;

  /** Fine-print text below the buttons (dark variant only). */
  footnote?: string;

  /** Extra classes on the root wrapper. */
  className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  badge: "Get Started Today",
  heading: (
    <>
      Start for Free Today!
    </>
  ),
  description:
    "Begin your 30-day free trial to fully explore every feature Shiksha Cloud has to offer.",
  primaryLabel: "Get Started",
  primaryHref: "/select-organization",
  secondaryLabel: "Talk to an Expert",
  secondaryHref: "/contact",
  footnote: "No credit card required · CBSE & state board ready · Cancel anytime",
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Corner plus-marks + side border lines used in the "bordered" variant. */
function BorderedDecorations() {
  return (
    <>
      {/* Corner plus marks */}
      {(
        [
          "top-[-12.5px] left-[-11.5px]",
          "top-[-12.5px] right-[-11.5px]",
          "bottom-[-12.5px] left-[-11.5px]",
          "bottom-[-12.5px] right-[-11.5px]",
        ] as const
      ).map((pos) => (
        <PlusIcon
          key={pos}
          className={cn("absolute z-10 size-6", pos)}
          strokeWidth={1}
        />
      ))}

      {/* Side border lines that extend slightly beyond the component */}
      <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
      <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />

      {/* Centre dashed divider */}
      <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed" />
    </>
  );
}

// ─── Bordered Variant ─────────────────────────────────────────────────────────

function BorderedCTA({
  heading,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: Omit<CallToActionProps, "variant" | "badge" | "footnote">) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-y-4 border-y px-4 py-8",
        "dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)]",
        className
      )}
    >
      <BorderedDecorations />

      <h2 className="text-center font-semibold text-xl md:text-3xl">
        {heading ?? DEFAULTS.heading}
      </h2>

      <p className="text-balance text-center font-medium text-muted-foreground text-sm md:text-base">
        {description ?? DEFAULTS.description}
      </p>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        {secondaryHref && (
          <Button variant="outline" asChild>
            <Link href={secondaryHref} className="flex items-center gap-2">
              <PhoneCall className="size-4" />
              {secondaryLabel ?? DEFAULTS.secondaryLabel}
            </Link>
          </Button>
        )}

        <Button asChild>
          <Link href={primaryHref ?? DEFAULTS.primaryHref} className="flex items-center gap-2">
            {primaryLabel ?? DEFAULTS.primaryLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Dark Variant ─────────────────────────────────────────────────────────────

function DarkCTA({
  badge,
  heading,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  footnote,
  className,
}: Omit<CallToActionProps, "variant">) {
  return (
    <section className={cn("py-24 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-neutral-900 rounded-3xl px-10 py-16 text-center relative overflow-hidden">
          {/* Grid overlay texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
              backgroundSize: "3rem 3rem",
            }}
          />

          <div className="relative z-10">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d9f972]" />
              <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">
                {badge ?? DEFAULTS.badge}
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
              {heading ?? DEFAULTS.heading}
            </h2>

            {/* Description */}
            <p className="text-white/50 text-base max-w-lg mx-auto mb-10 leading-relaxed">
              {description ?? DEFAULTS.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={primaryHref ?? DEFAULTS.primaryHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d9f972] hover:bg-[#cff550] text-neutral-900 font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
              >
                {primaryLabel ?? DEFAULTS.primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>

              {secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent hover:bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-full text-sm transition-colors"
                >
                  {secondaryLabel ?? DEFAULTS.secondaryLabel}
                </Link>
              )}
            </div>

            {/* Footnote */}
            {footnote !== null && (
              <p className="text-white/30 text-xs mt-6">
                {footnote ?? DEFAULTS.footnote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function CallToAction({ variant = "bordered", ...props }: CallToActionProps) {
  if (variant === "dark") return <DarkCTA {...props} />;
  return <BorderedCTA {...props} />;
}