"use client"

import { Fragment, useEffect, useState, useTransition, type ReactNode } from "react"
import {
  BellRing,
  CheckCircle2,
  CheckIcon,
  CreditCard,
  HardDrive,
  MinusIcon,
  ShieldCheck,
  Sparkles,
  UsersRound,
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
  CardFooter,
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
  computeMonthlyTotal,
  formatINR,
  formatStudentLabel,
  getEffectivePrice,
  type BillingCycle,
  type CellValue,
  type Plan,
  type StudentStep,
} from "@/lib/pricing-data"
import { cn } from "@/lib/utils"

const PLAN_HEADERS = ["Free Trial", "EarlyBird", "Growth", "Scale"] as const

const addonMeta = {
  notifications: {
    icon: BellRing,
    label: "Live channel meter",
    accent: "text-primary bg-primary/5 border-primary/20",
  },
  payments: {
    icon: CreditCard,
    label: "Charged on success",
    accent: "text-primary bg-primary/5 border-primary/20",
  },
  storage: {
    icon: HardDrive,
    label: "Included first",
    accent: "text-primary bg-primary/5 border-primary/20",
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
        <TrustedSchools />
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
        Pay only for students or learners. Parents, teachers, and admins are always{" "}
        <span className="font-medium text-foreground">free</span>. No setup
        fees.
      </p>
    </div>
  )
}

function PlansGrid() {
  const [billing, setBilling] = useState<BillingCycle>("monthly")
  const [studentCount, setStudentCount] = useState<StudentStep>(STUDENT_STEPS[2])

  return (
    <section className="space-y-10">
      <div className="mx-auto grid max-w-5xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:grid-cols-3">
        <ValueNote
          icon={Sparkles}
          title="All core modules included"
          description="Fees, attendance, CRM, exams, certificates, documents, reports, AI and portals."
        />
        <ValueNote
          icon={UsersRound}
          title="No per-role billing"
          description="Parents, teachers, admins and staff are free, so the real user count can grow."
        />
        <ValueNote
          icon={CheckCircle2}
          title="Built to replace many tools"
          description="One operating layer for daily institution work, not a tiny feature bundle."
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <BillingToggle value={billing} onChange={setBilling} />
        <StudentSlider value={studentCount} onChange={setStudentCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            studentCount={studentCount}
          />
        ))}
      </div>
    </section>
  )
}

function ValueNote({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-background/80 p-3 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none text-foreground">
          {title}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
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
        <span className="min-w-24 text-right font-semibold text-primary tabular-nums">
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
  className?: string
}

function PlanCard({
  plan,
  billing,
  studentCount,
  className,
}: PlanCardProps) {
  const isLimitedOffer = plan.id === "free" || plan.id === "earlybird"
  const effectivePrice =
    plan.pricePerStudent !== undefined
      ? getEffectivePrice(plan.pricePerStudent, billing)
      : null

  const monthlyTotal =
    plan.pricePerStudent && plan.pricePerStudent > 0
      ? computeMonthlyTotal(studentCount, plan.pricePerStudent, billing)
      : null

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

      <CardHeader className="space-y-3 pb-4 pt-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {plan.name}
        </p>

        <div className="flex items-end gap-1.5 leading-none">
          {plan.customLabel ? (
            <span className="text-4xl font-semibold tracking-tight">
              {plan.customLabel}
            </span>
          ) : effectivePrice === 0 ? (
            <span className="text-4xl font-semibold tracking-tight">Free</span>
          ) : (
            <>
              <span className="mt-1 text-2xl font-medium text-muted-foreground">
                Rs
              </span>
              <span className="text-4xl font-semibold tracking-tight tabular-nums">
                {effectivePrice}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                /student/mo
              </span>
            </>
          )}
        </div>

        <CardDescription className="min-h-[48px] text-sm leading-relaxed">
          {plan.description}
        </CardDescription>

        {monthlyTotal && (
          <p className="text-xs font-medium text-primary">{monthlyTotal}</p>
        )}
        {plan.footnote && !monthlyTotal && (
          <p className="text-xs text-muted-foreground">{plan.footnote}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <Button
          variant={plan.ctaVariant}
          className={cn(
            "w-full",
            plan.featured && plan.ctaVariant === "default" && "shadow-sm"
          )}
          asChild
        >
          <a href={plan.id === "enterprise" ? "/contact" : "/sign-up"}>
            {plan.ctaLabel}
          </a>
        </Button>

        <Separator className="my-5" />

        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <PlanFeatureRow key={feature.label} feature={feature} />
          ))}
        </ul>
      </CardContent>

      <CardFooter />
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
        <CheckIcon
          className={cn(
            "mt-px size-4 shrink-0",
            included === true ? "text-emerald-500" : "text-primary"
          )}
        />
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
    <section className="space-y-6">
      <SectionLabel>Fair usage layer</SectionLabel>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Your subscription stays clean. Variable costs stay visible.
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These are not hidden add-ons. They are pass-through or usage-based
            costs that only move when your institution actually uses them.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
          <ShieldCheck className="size-4" />
          No surprise billing
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ADD_ONS.map((addon) => {
          const meta = addonMeta[addon.id as keyof typeof addonMeta]
          const Icon = meta.icon

          return (
            <Card
              key={addon.id}
              className="border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
            >
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border",
                      meta.accent
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    {meta.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {addon.name}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-2xl font-semibold tracking-tight text-primary">
                      {addon.price > 0 ? formatINR(addon.price) : "Only if used"}
                    </p>
                    {addon.price > 0 && (
                      <span className="pb-1 text-sm text-muted-foreground">
                        / mo
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {addon.description}
                </p>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-foreground/80">
                    Included in plan. Usage is shown separately.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function FeatureTable() {
  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <SectionLabel>Feature comparison</SectionLabel>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">
            This is the value stack behind the price.
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Most institutions buy separate tools for fees, attendance, CRM,
            exams, documents, communication, reports and AI. Shiksha.cloud
            brings them into one product so every plan feels bigger than the
            monthly number.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-[38%] px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Feature
                </th>
                {PLAN_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {COMPARISON.map(({ group, rows }) => (
                <Fragment key={group}>
                  <tr className="border-y border-border bg-muted/20">
                    <td
                      colSpan={5}
                      className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70"
                    >
                      {group}
                    </td>
                  </tr>

                  {rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 text-foreground/80">
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Cell value={row.free} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Cell value={row.school} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Cell value={row.multi} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Cell value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center">
        <CheckIcon className="size-4 text-emerald-500" />
      </span>
    )
  }

  if (value === false) {
    return (
      <span className="inline-flex justify-center">
        <MinusIcon className="size-4 text-muted-foreground/30" />
      </span>
    )
  }

  if (value === "addon") {
    return (
      <Badge
        variant="outline"
        className="border-primary/40 bg-primary/5 px-2 py-0 text-[10px] font-medium text-primary"
      >
        Add-on
      </Badge>
    )
  }

  if (value === "included-plus") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/5 px-2 py-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
      >
        Included
      </Badge>
    )
  }

  return (
    <span className="text-xs font-medium text-muted-foreground">{value}</span>
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
    <div className="space-y-4 py-6 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
        Built for education teams across India
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {TRUSTED_SCHOOLS.map((school) => (
          <span
            key={school}
            className="text-sm italic text-muted-foreground/60"
          >
            {school}
          </span>
        ))}
      </div>
    </div>
  )
}

function TestimonialsCarousel() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="space-y-5">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
        aria-label="Customer testimonials"
      >
        <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.id}-${index}`}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
      `}</style>
    </section>
  )
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number]
}) {
  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-auto">
        <p className="text-sm font-medium text-foreground">
          {testimonial.name}
        </p>
        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
      </div>
    </div>
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
