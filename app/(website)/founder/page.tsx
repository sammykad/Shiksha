'use client';

import * as React from 'react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  MapPin,
  Rocket,
  Code,
  Database,
  Brain,
  Target,
  ExternalLink,
  Github,
  Globe,
  Building,
  GraduationCap,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Terminal,
  Server,
  Activity,
  TrendingUp,
  Shield,
  Cloud,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const TECH_STACK = [
  {
    icon: Code,
    title: 'Frontend',
    items: [
      { name: 'Next.js 15 + 16', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Framer Motion', level: 85 },
    ],
  },
  {
    icon: Server,
    title: 'Backend',
    items: [
      { name: 'Node.js', level: 92 },
      { name: 'Prisma ORM', level: 88 },
      { name: 'PostgreSQL', level: 85 },
      { name: 'Supabase', level: 90 },
    ],
  },
  {
    icon: Brain,
    title: 'AI & Tools',
    items: [
      { name: 'Hugging Face', level: 80 },
      { name: 'OpenRouter', level: 75 },
      { name: 'BetterAuth', level: 95 },
      { name: 'AI Agents', level: 90 },
    ],
  },
];

const DASH_STATS = [
  { icon: Database, label: 'Total students', value: '1,247', change: '+12%' },
  { icon: CreditCard, label: 'Fee collection', value: '₹2.4L', change: '+8%' },
  { icon: Activity, label: 'Attendance rate', value: '94.2%', change: '+2%' },
  { icon: TrendingUp, label: 'Growth', value: '23%', change: '+5%' },
];

const FEATURES = [
  { icon: Shield, title: 'Auth & access control', desc: 'Multi-role access with BetterAuth' },
  { icon: Database, title: 'Real-time data', desc: 'PostgreSQL with Prisma ORM' },
  { icon: Brain, title: 'AI insights', desc: 'Automated summaries and analytics' },
  { icon: CreditCard, title: 'Payment integration', desc: 'UPI, wallets, WhatsApp receipts' },
  { icon: Smartphone, title: 'Mobile ready', desc: 'Responsive across all devices' },
  { icon: Cloud, title: 'Cloud native', desc: 'Deployed on Vercel with Supabase' },
];

type GoalStatus = 'done' | 'active' | 'pending';

interface Phase {
  name: string;
  period: string;
  percent: number;
  color: string;
  goals: { name: string; desc: string; status: GoalStatus; progress: number }[];
}

const PHASES: Phase[] = [
  {
    name: 'Phase 1 — Foundation',
    period: 'Q1–Q2 2024',
    percent: 75,
    color: '#22c55e',
    goals: [
      { name: 'MVP launch', desc: 'Core feature set shipped and stable', status: 'done', progress: 100 },
      { name: 'Pilot schools', desc: 'Onboard 10 schools for testing', status: 'active', progress: 60 },
      { name: 'Digital marksheets', desc: 'Complete digital mark sheet module', status: 'pending', progress: 30 },
    ],
  },
  {
    name: 'Phase 2 — Scale',
    period: 'Q3–Q4 2024',
    percent: 25,
    color: '#3b82f6',
    goals: [
      { name: 'AI auto-reports', desc: 'Recurring billing and AI reports', status: 'active', progress: 40 },
      { name: 'Analytics dashboard', desc: 'Org-level analytics and insights', status: 'pending', progress: 15 },
      { name: 'Marketing site', desc: 'Launch with live demos', status: 'pending', progress: 20 },
    ],
  },
  {
    name: 'Phase 3 — Dominate',
    period: '2025–2026',
    percent: 8,
    color: '#a1a1aa',
    goals: [
      { name: '#1 school CRM', desc: "India's leading school CRM platform", status: 'pending', progress: 8 },
      { name: 'Market expansion', desc: 'Coaching and higher education', status: 'pending', progress: 5 },
      { name: 'Mobile app', desc: 'App for all stakeholders', status: 'pending', progress: 12 },
    ],
  },
];

const METRICS = [
  { label: 'Schools onboarded', current: '3', target: '100+' },
  { label: 'Students managed', current: '1.2K', target: '10K+' },
  { label: 'Revenue generated', current: '₹50K', target: '₹10L+' },
  { label: 'User satisfaction', current: '4.8', target: '4.9+' },
];

const STATUS_LABEL: Record<GoalStatus, string> = {
  done: 'Done',
  active: 'Active',
  pending: 'Pending',
};

const STATUS_CLASS: Record<GoalStatus, string> = {
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-zinc-50 text-zinc-500 border-zinc-200',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6">
        <Hero />
        <TechStack />
        <ProductShowcase />
        <Roadmap />
        <ContactCta />
      </main>
      <SiteFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <Code className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">Sameer Kad</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="text-zinc-600 hover:text-zinc-900">
            <Link href="https://github.com/DevSammyKad" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Link href="https://shiksha.cloud" target="_blank">
              Shiksha.cloud
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="py-20 md:py-28">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Available for unique projects
      </div>

      <h1 className="mb-4 text-5xl font-medium tracking-tight md:text-7xl">
        Sameer Kad
      </h1>

      <p className="mb-5 text-lg text-zinc-600 md:text-xl">
        <span className="font-medium text-zinc-900">Founder</span> &amp; full-stack developer
      </p>

      <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-zinc-600">
        I build things that make people&rsquo;s lives easier. Currently building{' '}
        <Link
          href="https://shiksha.cloud"
          target="_blank"
          className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900"
        >
          Shiksha.cloud
        </Link>
        , a school management platform built for India&rsquo;s Tier 2 and Tier 3 cities.
      </p>

      <div className="mb-10 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2 text-zinc-500">
          <Trophy className="h-4 w-4" />
          State gold medalist <span className="text-zinc-900">— Volleyball</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <MapPin className="h-4 w-4" />
          Based in <span className="text-zinc-900">India</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <Building className="h-4 w-4" />
          Status <span className="text-zinc-900">Pre-launch MVP</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
          <Link href="https://shiksha.cloud" target="_blank">
            <Rocket className="mr-2 h-4 w-4" />
            Explore Shiksha.cloud
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="border-zinc-300 text-zinc-700 hover:bg-zinc-50">
          <Link href="#tech-stack">
            <Terminal className="mr-2 h-4 w-4" />
            View tech stack
          </Link>
        </Button>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section id="tech-stack" className="border-t border-zinc-200 py-20">
      <SectionLabel>Tech stack</SectionLabel>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TECH_STACK.map((group) => (
          <div key={group.title} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                <group.icon className="h-4 w-4 text-zinc-600" />
              </div>
              <h3 className="text-sm font-medium">{group.title}</h3>
            </div>
            <div className="space-y-3">
              {group.items.map((tech) => (
                <div key={tech.name}>
                  <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                    <span>{tech.name}</span>
                    <span>{tech.level}%</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-zinc-200">
                    <div
                      className="h-[3px] rounded-full bg-zinc-900"
                      style={{ width: `${tech.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductShowcase() {
  return (
    <section className="border-t border-zinc-200 py-20">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-zinc-200 bg-zinc-50 text-zinc-600"
          >
            <Building className="mr-1.5 h-3 w-3" />
            Current focus
          </Badge>
          <h2 className="mb-1 text-3xl font-medium tracking-tight">Shiksha.cloud</h2>
          <p className="text-sm text-zinc-500">India&rsquo;s next-gen school management platform</p>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      {/* Dashboard mock */}
      <div className="mb-6 overflow-hidden rounded-xl border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">School dashboard</p>
              <p className="text-xs text-zinc-500">Management overview</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-zinc-200 md:grid-cols-4">
          {DASH_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-5 ${i !== DASH_STATS.length - 1 ? 'border-r border-zinc-200' : ''} ${i < 2 ? 'border-b border-zinc-200 md:border-b-0' : ''
                }`}
            >
              <p className="mb-2 text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-medium tracking-tight">{stat.value}</p>
              <p className="mt-0.5 text-xs text-emerald-600">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
            <span>Revenue analytics</span>
            <span>Apr – Jun 2024</span>
          </div>
          <ChartAreaInteractive />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-lg border border-zinc-200 p-4">
            <feature.icon className="mb-3 h-4.5 w-4.5 text-zinc-500" />
            <h3 className="mb-1 text-sm font-medium">{feature.title}</h3>
            <p className="text-xs leading-relaxed text-zinc-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="border-t border-zinc-200 py-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-zinc-200 bg-zinc-50 text-zinc-600">
            <Target className="mr-1.5 h-3 w-3" />
            Strategic roadmap
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight">Vision &amp; roadmap</h2>
        </div>
      </div>

      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase.name} className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: phase.color }}
                />
                <div>
                  <p className="text-sm font-medium">{phase.name}</p>
                  <p className="text-xs text-zinc-500">{phase.period}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-600">{phase.percent}%</span>
            </div>
            <div className="h-[2px] bg-zinc-100">
              <div
                className="h-[2px]"
                style={{ width: `${phase.percent}%`, backgroundColor: phase.color }}
              />
            </div>
            <div className="grid grid-cols-1 divide-y divide-zinc-200 border-t border-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {phase.goals.map((goal) => (
                <div key={goal.name} className="p-5">
                  <span
                    className={`mb-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[goal.status]}`}
                  >
                    {STATUS_LABEL[goal.status]}
                  </span>
                  <p className="mb-1 text-[13px] font-medium">{goal.name}</p>
                  <p className="mb-3 text-xs leading-relaxed text-zinc-500">{goal.desc}</p>
                  <div className="h-[2px] rounded-full bg-zinc-100">
                    <div
                      className="h-[2px] rounded-full bg-zinc-400"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="mt-12">
        <h3 className="mb-1 text-lg font-medium">Success metrics</h3>
        <p className="mb-6 text-sm text-zinc-500">Key performance indicators for measuring impact</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
              <p className="text-xl font-medium tracking-tight">{metric.current}</p>
              <p className="mb-2 text-xs text-zinc-500">{metric.label}</p>
              <p className="text-xs text-zinc-400">Target: {metric.target}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section className="border-t border-zinc-200 py-20">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-10 text-center md:p-14">
        <h2 className="mb-3 text-2xl font-medium tracking-tight md:text-3xl">
          Let&rsquo;s build something
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-zinc-600">
          Interested in Shiksha.cloud or want to collaborate on education technology? Let&rsquo;s connect.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Link href="https://cal.com/sammykad" target="_blank">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule a demo
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-zinc-300 text-zinc-700 hover:bg-white">
            <Link href="https://github.com/DevSammyKad" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-10 text-center">
      <p className="text-xs text-zinc-500">
        Built with Next.js 15 + 16, shadcn/ui &middot; &copy; 2025 Sameer Kad
      </p>
    </footer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-7 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------

const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-05-06', desktop: 498, mobile: 520 },
  { date: '2024-05-13', desktop: 197, mobile: 160 },
  { date: '2024-05-20', desktop: 177, mobile: 230 },
  { date: '2024-05-27', desktop: 420, mobile: 460 },
  { date: '2024-06-03', desktop: 103, mobile: 160 },
  { date: '2024-06-10', desktop: 155, mobile: 200 },
  { date: '2024-06-17', desktop: 475, mobile: 520 },
  { date: '2024-06-24', desktop: 132, mobile: 180 },
  { date: '2024-06-30', desktop: 446, mobile: 400 },
];

const chartConfig = {
  desktop: { label: 'Desktop', color: '#18181b' },
  mobile: { label: 'Mobile', color: '#a1a1aa' },
} satisfies ChartConfig;

function ChartAreaInteractive() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
            <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f4f4f5" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          stroke="#a1a1aa"
          fontSize={11}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="mobile"
          type="natural"
          fill="url(#fillMobile)"
          stroke="var(--color-mobile)"
          strokeWidth={1.5}
          stackId="a"
        />
        <Area
          dataKey="desktop"
          type="natural"
          fill="url(#fillDesktop)"
          stroke="var(--color-desktop)"
          strokeWidth={1.5}
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}