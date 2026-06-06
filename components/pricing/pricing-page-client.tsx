"use client"

import { Fragment, useEffect, useState, useTransition, type ReactNode } from "react"
import {
  BadgeCheck,
  BellRing,
  CheckCircle2,
  CheckIcon,
  ChevronDown,
  CreditCard,
  HardDrive,
  MinusIcon,
  Quote,
  ShieldCheck,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallToAction } from "@/components/website/shared/CallToAction"
import {
  ADD_ONS,
  ANNUAL_DISCOUNT,
  COMPARISON,
  FAQ_ITEMS,
  PLANS,
  STUDENT_STEPS,
  TESTIMONIALS,
  TRUSTED_SCHOOLS,
  formatINR,
  formatStudentLabel,
  getEffectivePrice,
  type BillingCycle,
  type CellValue,
  type ComparisonRow,
  type Plan,
  type StudentStep,
} from "@/lib/pricing-data"
import { cn } from "@/lib/utils"

const PLAN_HEADERS = ["Starter", "Growth", "Scale"] as const

const addonMeta = {
  notifications: {
    icon: BellRing,
    shortLabel: "Messages",
    simpleNote: "WhatsApp, SMS, email, push or voice messages, only when sent.",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  payments: {
    icon: CreditCard,
    shortLabel: "Online payments",
    simpleNote: "Gateway fees apply only when parents pay fees online.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  storage: {
    icon: HardDrive,
    shortLabel: "Storage",
    simpleNote: "Normal document storage is included. Extra storage is separate.",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
} as const

export function PricingPageClient() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-20 px-4 pb-0 sm:px-6 lg:px-8">
        <PricingHero />
        <PlansGrid />
        <AddonCards />
        <FeatureTable />
        <TestimonialsCarousel />
        <FaqSection />
      </div>

      <CallToAction
        variant="dark"
        className="mt-20"
        badge="Pricing made simple"
        heading={
          <>
            Ready to run your institution
            <br />
            without pricing confusion?
          </>
        }
        description="Start with every Shiksha.cloud module included. Parents, teachers, and admins stay free while your institution only pays for the plan that fits."
        primaryLabel="Start free trial"
        primaryHref="/sign-up"
        secondaryLabel="Talk to sales"
        secondaryHref="/contact"
        footnote="All features included. No setup fees. Usage costs stay transparent."
      />
    </main>
  )
}

function PricingHero() {
  return (
    <div className="space-y-5 pt-16 pb-4 text-center">
      <Badge
        variant="outline"
        className="border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
      >
        Built for Indian Institutions
      </Badge>

      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Simple, honest pricing.
      </h1>

      <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
        Pay only for students. Parents, teachers, and admins are always{" "}
        <span className="font-medium text-foreground">free</span>. No setup
        fees.
      </p>
    </div>
  )
}

function PlansGrid() {
  const [billing, setBilling] = useState<BillingCycle>("monthly")
  const [studentCount, setStudentCount] = useState<StudentStep>(STUDENT_STEPS[2])
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  return (
    <section className="space-y-10">
      <div className="flex flex-col items-center gap-6">
        <BillingToggle value={billing} onChange={setBilling} />
        <StudentSlider value={studentCount} onChange={setStudentCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            studentCount={studentCount}
            showAllFeatures={showAllFeatures}
          />
        ))}
      </div>

      <button
        onClick={() => setShowAllFeatures(!showAllFeatures)}
        className="mx-auto flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {showAllFeatures ? "Show fewer features" : "Show all features across plans"}
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            showAllFeatures && "rotate-180"
          )}
        />
      </button>

      <div className="mx-auto max-w-5xl rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.07] via-background to-background px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Core school platform included in every plan
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Fees, attendance, admissions, exams, certificates, documents,
                reports, AI and parent portals stay together.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5 md:justify-end">
            {["Parents free", "Teachers free", "Admins free"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                <CheckCircle2 className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface BillingToggleProps {
  value: BillingCycle
  onChange: (value: BillingCycle) => void
}

function BillingToggle({ value, onChange }: BillingToggleProps) {
  const discountPct = Math.round(ANNUAL_DISCOUNT * 100)

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as BillingCycle)}>
      <TabsList className="h-10 rounded-full border border-border bg-muted/50 px-1">
        <TabsTrigger
          value="monthly"
          className="rounded-full px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="annual"
          className="flex items-center gap-2 rounded-full px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Annual
          <Badge
            variant="secondary"
            className="border-0 bg-emerald-500/10 px-2 py-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
          >
            Save {discountPct}%
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

interface StudentSliderProps {
  value: StudentStep
  onChange: (value: StudentStep) => void
}

function StudentSlider({ value, onChange }: StudentSliderProps) {
  const selectedIndex = STUDENT_STEPS.indexOf(value)
  const [draftIndex, setDraftIndex] = useState(selectedIndex)
  const [, startTransition] = useTransition()
  const mobileLabels = [
    STUDENT_STEPS[0],
    STUDENT_STEPS[Math.floor(STUDENT_STEPS.length / 2)],
    STUDENT_STEPS[STUDENT_STEPS.length - 1],
  ]

  useEffect(() => {
    setDraftIndex(selectedIndex)
  }, [selectedIndex])

  function getSafeIndex(index: number) {
    return Math.min(Math.max(Math.round(index), 0), STUDENT_STEPS.length - 1)
  }

  function handleChange([index]: number[]) {
    const nextIndex = getSafeIndex(index)

    setDraftIndex(nextIndex)

    if (nextIndex !== selectedIndex) {
      startTransition(() => {
        onChange(STUDENT_STEPS[nextIndex])
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">How many students?</span>
        <span className="min-w-24 text-right font-normal text-primary tabular-nums">
          {formatStudentLabel(STUDENT_STEPS[draftIndex])}
        </span>
      </div>

      <Slider
        min={0}
        max={STUDENT_STEPS.length - 1}
        step={1}
        value={[draftIndex]}
        onValueChange={handleChange}
        className="w-full cursor-pointer"
      />

      <div className="hidden justify-between px-px text-[10px] text-muted-foreground/60 sm:flex">
        {STUDENT_STEPS.map((s) => (
          <span key={s}>{s >= 1000 ? `${s / 1000}K` : s}</span>
        ))}
      </div>
      <div className="flex justify-between px-px text-[10px] text-muted-foreground/60 sm:hidden">
        {mobileLabels.map((s) => (
          <span key={s}>{s >= 1000 ? `${s / 1000}K` : s}</span>
        ))}
      </div>
    </div>
  )
}

interface PlanCardProps {
  plan: Plan
  billing: BillingCycle
  studentCount: StudentStep
  showAllFeatures: boolean
  className?: string
}

function PlanCard({
  plan,
  billing,
  studentCount,
  showAllFeatures,
  className,
}: PlanCardProps) {
  const isLimitedOffer = plan.id === "free" || plan.id === "starter"
  const effectivePrice =
    plan.pricePerStudent !== undefined
      ? getEffectivePrice(plan.pricePerStudent, billing)
      : null

  const visibleFeatures = showAllFeatures
    ? plan.features
    : plan.features.slice(0, 5)

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200",
        plan.featured
          ? "z-10 border-primary bg-card shadow-xl shadow-primary/15 ring-1 ring-primary lg:-translate-y-2"
          : "border-border bg-card/80 lg:saturate-[0.82] lg:opacity-80 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:opacity-100 hover:saturate-100 hover:shadow-sm",
        className
      )}
    >
      {plan.badge && (
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 bg-background px-1.5">
          <Badge
            variant={isLimitedOffer ? "secondary" : "default"}
            className={cn(
              "whitespace-nowrap border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
              isLimitedOffer
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-primary bg-primary text-primary-foreground"
            )}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="space-y-2 pb-3 pt-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {plan.name}
        </p>

        <div className="flex items-baseline gap-0.5 leading-none">
          {effectivePrice === 0 ? (
            <span className="text-4xl font-semibold tracking-tight">Free</span>
          ) : (
            <>
              <span className="text-4xl font-semibold tracking-tight tabular-nums">
                ₹{effectivePrice}
              </span>
              <span className="text-sm text-muted-foreground">/student/mo</span>
            </>
          )}
        </div>

        <CardDescription className="text-sm leading-relaxed">
          {plan.description}
        </CardDescription>

        {plan.pricePerStudent && plan.pricePerStudent > 0 && studentCount < 5000 && (
          <div className="space-y-1 pt-2 pb-1">
            <p className="text-xs font-medium text-primary">
              Estimated {billing === "annual" ? "annual" : "monthly"} bill:{" "}
              {formatINR(
                studentCount *
                (effectivePrice ?? 0) *
                (billing === "annual" ? 12 : 1)
              )}{" "}
              for {formatStudentLabel(studentCount)}
            </p>
            {billing === "annual" && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                You save{" "}
                {formatINR(
                  studentCount *
                  (plan.pricePerStudent - (effectivePrice ?? 0)) *
                  12
                )}{" "}
                annually
              </p>
            )}
          </div>
        )}
        {studentCount >= 5000 && (
          <p className="text-xs font-medium text-primary">
            Contact us for organization pricing
          </p>
        )}
        {plan.footnote &&
          (!plan.pricePerStudent || plan.pricePerStudent <= 0) && (
            <p className="text-xs text-muted-foreground">{plan.footnote}</p>
          )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col border-t border-border/70 pt-5 pb-6">
        <ul className="flex-1 space-y-3">
          {visibleFeatures.map((feature) => (
            <PlanFeatureRow key={feature.label} feature={feature} />
          ))}
        </ul>

        <div className="mt-6">
          <Separator className="mb-5" />
          <Button
            variant={plan.ctaVariant}
            className={cn(
              "w-full",
              plan.featured && plan.ctaVariant === "default" && "shadow-sm"
            )}
            asChild
          >
            <a href={plan.id === "scale" ? "/contact" : `/sign-up?plan=${plan.id}`}>
              {plan.ctaLabel}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface PlanFeatureRowProps {
  feature: Plan["features"][number]
}

function PlanFeatureRow({ feature }: PlanFeatureRowProps) {
  const included = feature.included

  return (
    <li className="flex items-start gap-2.5 text-sm">
      {included === true || included === "addon" || included === "included-plus" ? (
        <BadgeCheck className="mt-px size-4 shrink-0 text-primary" />
      ) : (
        <MinusIcon className="mt-px size-4 shrink-0 text-muted-foreground/40" />
      )}
      <span
        className={cn(
          "leading-snug",
          included === false
            ? "text-muted-foreground/50 line-through decoration-muted-foreground/30"
            : "text-foreground/80"
        )}
      >
        {feature.label}
      </span>
    </li>
  )
}

function AddonCards() {
  return (
    <section className="space-y-4">
      <SectionLabel>Fair usage layer</SectionLabel>

      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex flex-col gap-6 p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No hidden add-ons
              </p>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-7 text-foreground">
              Your plan includes the core Shiksha.cloud platform.
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              A few outside costs may apply only when your school actually uses
              them. If you do not use them, you do not pay for them.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {ADD_ONS.map((addon) => {
              const meta = addonMeta[addon.id as keyof typeof addonMeta]
              const Icon = meta.icon

              return (
                <div
                  key={addon.id}
                  className="group rounded-lg border border-border bg-background/90 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("flex size-8 items-center justify-center rounded-lg border", meta.tone)}>
                      <Icon className="size-4" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {meta.shortLabel}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {meta.simpleNote}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureTable() {
  const [showAllRows, setShowAllRows] = useState(false)

  function allSame(row: ComparisonRow): boolean {
    return row.starter === row.growth && row.growth === row.scale
  }

  const allRows = COMPARISON.flatMap((g) => g.rows)
  const differentiators = allRows.filter((r) => !allSame(r))
  const commonCount = allRows.filter((r) => allSame(r) && r.starter === true).length

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionLabel>Plan differences</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">
            Only the meaningful differences are shown first.
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
        >
          Growth highlighted
        </Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="w-[38%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Feature
                </th>
                {PLAN_HEADERS.map((header, i) => (
                  <th
                    key={header}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em]",
                      i === 1
                        ? "border-x border-primary/10 bg-primary/[0.06] text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {header}
                    {i === 1 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 border-0 bg-primary/10 px-1.5 py-0 text-[11px] font-semibold text-primary align-middle"
                      >
                        Popular
                      </Badge>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {COMPARISON.map(({ group, rows }) => {
                const show = showAllRows ? rows : rows.filter((r) => !allSame(r))
                if (show.length === 0) return null

                return (
                  <Fragment key={group}>
                    {show.map((row, rowIndex) => (
                      <tr
                        key={row.label}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/15"
                      >
                        <td className="px-4 py-3.5">
                          {rowIndex === 0 && (
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/45">
                              {group}
                            </p>
                          )}
                          <p className="text-sm leading-snug text-foreground">
                            {row.label}
                          </p>
                        </td>
                        {(["starter", "growth", "scale"] as const).map(
                          (plan, i) => (
                            <td
                              key={plan}
                              className={cn(
                                "px-4 py-3.5 text-center",
                                i === 1 &&
                                  "border-x border-primary/10 bg-primary/[0.035]"
                              )}
                            >
                              <Cell value={row[plan]} highlight={i === 1} />
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </Fragment>
                )
              })}
              {showAllRows && (
                <tr className="bg-muted/10">
                  <td colSpan={4} className="px-3 py-1.5 text-[11px] text-center text-muted-foreground/50">
                    All features listed above
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2">
        <p className="text-xs leading-5 text-muted-foreground">
          {showAllRows
            ? `${allRows.length} features across all plans`
            : `${differentiators.length} key differences`
          }
          {!showAllRows && (
            <> &middot; <span className="text-muted-foreground/60">{commonCount} features included in all plans</span></>
          )}
        </p>

        <button
          onClick={() => setShowAllRows(!showAllRows)}
          className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          {showAllRows ? "Collapse" : `Full list (${allRows.length})`}
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-200",
              showAllRows && "rotate-180"
            )}
          />
        </button>
      </div>
    </section>
  )
}

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center">
        <CheckIcon className={cn("text-emerald-500", highlight ? "size-4" : "size-3.5")} />
      </span>
    )
  }

  if (value === false) {
    return (
      <span className="inline-flex justify-center">
        <MinusIcon className={cn("text-muted-foreground/30", highlight ? "size-4" : "size-3.5")} />
      </span>
    )
  }

  if (value === "addon") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-primary/40 bg-primary/5 px-1.5 py-0 text-[11px] font-medium",
          highlight && "border-primary/60 bg-primary/10"
        )}
      >
        Add-on
      </Badge>
    )
  }

  if (value === "included-plus") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-emerald-500/40 bg-emerald-500/5 px-1.5 py-0 text-[11px] font-medium text-emerald-600 dark:text-emerald-400",
          highlight && "border-emerald-500/60 bg-emerald-500/10"
        )}
      >
        Included
      </Badge>
    )
  }

  return (
    <span className={cn("text-xs font-medium", highlight ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {value}
    </span>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function TrustedSchools() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 text-center">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
          Built for education teams across India
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          One operating system for every institution format
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
          From K-12 schools to multi-branch education groups, Shiksha.cloud
          adapts to how Indian teams run admissions, fees, attendance, notices,
          and parent communication.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {TRUSTED_SCHOOLS.map((school) => (
          <span
            key={school}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {school}
          </span>
        ))}
      </div>
    </div>
  )
}

function TestimonialsCarousel() {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <TrustedSchools />

      <div
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Customer testimonials"
      >
        {TESTIMONIALS.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
          />
        ))}
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number]
}) {
  return (
    <article className="flex min-h-[232px] flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Quote className="size-4" aria-hidden="true" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-auto">
        <p className="text-sm font-semibold text-foreground">
          {testimonial.name}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {testimonial.role}
        </p>
      </div>
    </article>
  )
}

function FaqSection() {
  return (
    <section className="space-y-5">
      <SectionLabel>Frequently asked questions</SectionLabel>

      <Accordion
        type="single"
        collapsible
        className="divide-y divide-border overflow-hidden rounded-xl border border-border"
      >
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border-0 bg-card px-5 data-[state=open]:bg-muted/20"
          >
            <AccordionTrigger className="py-4 text-left text-sm font-normal hover:text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
