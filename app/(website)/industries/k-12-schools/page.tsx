import { CallToAction } from "@/components/website/shared/CallToAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  School,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  Bell,
  FileText,
  TrendingUp,
  Heart,
  BookOpen,
  Award,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

const appUrl = new URL("https://shiksha.cloud");

export const metadata: Metadata = {
  title: 'K-12 School Management Software | Primary & Secondary School ERP',
  description: 'Complete school management system for K-12 institutions. Manage students, attendance, fees, parent communication, and academics seamlessly. Built for Indian schools.',
  keywords: [
    'K-12 school software India',
    'primary school management system',
    'secondary school ERP',
    'school management software for K-12',
    'CBSE school management software',
    'ICSE school ERP',
    'state board school software',
    'school student information system',
    'school attendance management',
    'school fee collection system',
    'parent teacher communication app',
  ],
  alternates: {
    canonical: `${appUrl.origin}/industries/k-12-schools`,
    languages: {
      en: `${appUrl.origin}/industries/k-12-schools`,
      'x-default': `${appUrl.origin}/industries/k-12-schools`,
    },
  },
  openGraph: {
    title: 'K-12 School Management Software | Shiksha Cloud',
    description: 'Transform your K-12 school operations with our comprehensive management system. Attendance, fees, exams, parent communication - all in one place.',
    url: `${appUrl.origin}/industries/k-12-schools`,
    siteName: 'Shiksha Cloud',
    images: [`${appUrl.origin}/og-image.png`],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'K-12 School Management Software | Shiksha Cloud',
    description: 'Complete school management system for K-12 institutions. Built for Indian schools.',
    images: [`${appUrl.origin}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function K12SchoolsPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <School className="size-3 mr-1" />
              For K-12 Schools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
              Transform Your K-12 School with
              <span className="block text-primary mt-2">
                Smart Management System
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 text-pretty">
              From nursery to high school—manage students, teachers, parents,
              and academics effortlessly. Save 70%+ administrative time with
              features built specifically for Indian K-12 institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/select-organization">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border shadow-lg">
            <Image
              src="https://images.pexels.com/photos/8926453/pexels-photo-8926453.jpeg"
              alt="Female teacher engaging with students during a geography lesson in a classroom. - Thirdman on Pexels"
              className="w-full h-[500px] object-cover" width={1000}
              height={1000}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="500+" label="K-12 Schools" />
            <StatCard number="2.5L+" label="Students Managed" />
            <StatCard number="98%" label="Parent Satisfaction" />
            <StatCard number="3hrs" label="Time Saved Daily" />
          </div>
        </div>
      </section>

      {/* Key Challenges Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Challenges K-12 Schools Face Daily
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              We understand the unique challenges of running a K-12 school in
              India. Our solution addresses them all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChallengeCard
              icon={<Clock className="size-6 text-amber-600" />}
              title="Manual Attendance Chaos"
              description="Teachers waste 20+ minutes daily marking attendance on paper registers. Parents call constantly asking if their child reached school."
              solution="2-tap digital attendance with instant WhatsApp, SMS & email alerts to parents"
            />
            <ChallengeCard
              icon={<FileText className="size-6 text-blue-600" />}
              title="Fee Collection Headaches"
              description="Endless follow-ups for pending fees. Parents lose receipts. Manual tallying takes hours at month-end."
              solution="Online payments via UPI/cards, automated WhatsApp reminders & instant digital receipts"
            />
            <ChallengeCard
              icon={<Users className="size-6 text-emerald-600" />}
              title="Parent Communication Gap"
              description="Important notices don't reach all parents. Multiple WhatsApp groups become unmanageable. No proof of delivery."
              solution="Built-in WhatsApp, SMS & email integration with delivery tracking and read receipts"
            />
            <ChallengeCard
              icon={<BookOpen className="size-6 text-purple-600" />}
              title="Exam & Report Cards"
              description="Manual mark entry is error-prone. Creating report cards takes days. Progress tracking is difficult."
              solution="Quick mark entry, auto-generated report cards, and progress analytics"
            />
            <ChallengeCard
              icon={<Shield className="size-6 text-rose-600" />}
              title="Data Security Concerns"
              description="Student records in physical files are at risk. No backup. Data can be lost or damaged."
              solution="Cloud-based secure storage with automatic backups and role-based access"
            />
            <ChallengeCard
              icon={<TrendingUp className="size-6 text-indigo-600" />}
              title="Growth Insights Missing"
              description="No visibility into school performance. Hard to identify areas needing improvement. Decision-making based on gut feel."
              solution="Real-time dashboards with actionable insights and trend analysis"
            />
          </div>
        </div>
      </section>

      {/* Features for K-12 */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Everything Your K-12 School Needs
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Purpose-built features for primary and secondary schools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="size-8 text-blue-600" />}
              title="Student Management"
              features={[
                "Admission & enrollment",
                "Bulk student import (CSV)",
                "Document upload & verification",
                "Sibling linking",
              ]}
            />
            <FeatureCard
              icon={<CheckCircle2 className="size-8 text-emerald-600" />}
              title="Smart Attendance"
              features={[
                "2-tap marking system",
                "Instant parent alerts",
                "Absence tracking",
                "Monthly reports",
              ]}
            />
            <FeatureCard
              icon={<FileText className="size-8 text-purple-600" />}
              title="Fee Management"
              features={[
                "Online UPI/card payments",
                "WhatsApp fee reminders",
                "Instant digital receipts",
                "Real-time collection tracking",
              ]}
            />
            <FeatureCard
              icon={<BookOpen className="size-8 text-amber-600" />}
              title="Academic Management"
              features={[
                "Exam scheduling",
                "Mark entry & grading",
                "Report card generation",
                "Progress tracking",
              ]}
            />
            <FeatureCard
              icon={<Bell className="size-8 text-rose-600" />}
              title="Communication Hub"
              features={[
                "Built-in WhatsApp, SMS & email",
                "Targeted group messaging",
                "Anonymous complaint system",
                "Delivery & read receipts",
              ]}
            />
            <FeatureCard
              icon={<LineChart className="size-8 text-indigo-600" />}
              title="Analytics & Reports"
              features={[
                "AI-powered insights",
                "Fee collection dashboard",
                "Attendance trends",
                "Export in multiple formats",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-balance">
                Why K-12 Schools Love Shiksha.cloud
              </h2>
              <div className="space-y-6">
                <BenefitItem
                  icon={<Heart className="size-5 text-rose-600" />}
                  title="Easy to Use"
                  description="So simple, even your 60-year-old teachers will love it. No tech training needed."
                />
                <BenefitItem
                  icon={<Shield className="size-5 text-emerald-600" />}
                  title="100% Secure"
                  description="Bank-level security for all student data. Regular automatic backups included."
                />
                <BenefitItem
                  icon={<Award className="size-5 text-amber-600" />}
                  title="Affordable Pricing"
                  description="Only ₹79 per student/month. Parents, teachers, and admins are completely FREE."
                />
                <BenefitItem
                  icon={<Users className="size-5 text-blue-600" />}
                  title="Dedicated Support"
                  description="Phone, WhatsApp, and email support in English and Hindi. Quick resolution guaranteed."
                />
              </div>
            </div>
            <div className="relative">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="size-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Real Feedback
                    </h3>
                    <p className="text-slate-600 text-pretty">
                      "हमारे स्कूल में पहले हर छोटी बात के लिए फाइलें पलटनी पड़ती
                      थीं — कौन-सा बच्चा किस सेक्शन में है, किसकी फीस बाकी है, ये
                      सब ढूँढना मुश्किल होता था। जब से Shiksha.cloud आया है,
                      सबकुछ एक क्लिक पर है। अब स्टाफ को भी राहत मिली है और
                      पेरेंट्स भी खुश हैं।"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="size-12 rounded-full bg-slate-200" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        School Administrator
                      </div>
                      <div className="text-sm text-slate-600">
                        K-12 School, Mumbai
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Fair & Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Only ₹79 per student/month. Parents, teachers, and admins are
              completely FREE.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-2">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Example: A School with 140 Total Users
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-slate-900 font-semibold">
                        Users
                      </th>
                      <th className="text-right py-3 px-2 text-slate-900 font-semibold">
                        Quantity
                      </th>
                      <th className="text-right py-3 px-2 text-slate-900 font-semibold">
                        Competitor
                      </th>
                      <th className="text-right py-3 px-2 text-primary font-semibold">
                        Shiksha.cloud
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-2 text-slate-700">
                        🎓 Students (Paid)
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        40
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        ₹3,160/mo
                      </td>
                      <td className="py-3 px-2 text-right text-primary font-semibold tabular-nums">
                        ₹3,160/mo
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-slate-700">
                        👨‍👩‍👧 Parents (FREE)
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        80
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        ₹4,000-8,000/mo
                      </td>
                      <td className="py-3 px-2 text-right text-emerald-600 font-semibold">
                        ₹0
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-slate-700">
                        🧑‍🏫 Teachers (FREE)
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        10
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        ₹500-1,000/mo
                      </td>
                      <td className="py-3 px-2 text-right text-emerald-600 font-semibold">
                        ₹0
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-slate-700">
                        👨‍💼 Admins (FREE)
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        10
                      </td>
                      <td className="py-3 px-2 text-right text-slate-700 tabular-nums">
                        ₹500-1,000/mo
                      </td>
                      <td className="py-3 px-2 text-right text-emerald-600 font-semibold">
                        ₹0
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-4 px-2 text-slate-900">Total</td>
                      <td className="py-4 px-2 text-right text-slate-900 tabular-nums">
                        140 users
                      </td>
                      <td className="py-4 px-2 text-right text-slate-900 tabular-nums">
                        ₹8,160-13,160/mo
                      </td>
                      <td className="py-4 px-2 text-right text-primary text-lg tabular-nums">
                        ₹3,160/mo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-center text-emerald-800 font-semibold">
                  💰 You save ₹5,000-10,000/month compared to competitors!
                </p>
              </div>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">
                    No hidden costs—what you see is what you pay
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">
                    No per-user fees for parents and teachers
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">
                    No setup fees—get started immediately
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Transparent billing—only pay for enrolled students
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <CallToAction />
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tabular-nums">
        {number}
      </div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}

function ChallengeCard({
  icon,
  title,
  description,
  solution,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  solution: string;
}) {
  return (
    <Card className="border-2 hover:border-primary transition-colors">
      <CardContent className="p-6">
        <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4 text-pretty">{description}</p>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-emerald-700 text-pretty">
            {solution}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  features: string[];
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600 text-pretty">{description}</p>
      </div>
    </div>
  );
}
