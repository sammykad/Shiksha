import { CallToAction } from "@/components/website/shared/CallToAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Presentation,
  Users,
  CheckCircle2,
  Target,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  UserCheck,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

const appUrl = new URL("https://shiksha.cloud");

export const metadata: Metadata = {
  title: "Coaching Center Management Software",
  description:
    "Complete management system for coaching centers and tuition classes. Manage batches, tests, student progress, and fees effortlessly.",
  keywords: [
    "coaching center software",
    "tuition class management",
    "test series management",
    "batch management software",
    "coaching institute ERP",
  ],
  alternates: {
    canonical: `${appUrl.origin}/industries/coaching-centers`,
    languages: {
      en: `${appUrl.origin}/industries/coaching-centers`,
      "x-default": `${appUrl.origin}/industries/coaching-centers`,
    },
  },
  openGraph: {
    title: "Coaching Center Management Software | Shiksha.cloud",
    description:
      "Streamline your coaching center operations with our comprehensive management system.",
    url: `${appUrl.origin}/industries/coaching-centers`,
    siteName: "Shiksha.cloud",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CoachingCentersPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Presentation className="size-3 mr-1" />
              For Coaching Centers & Tuition Classes
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
              Scale Your Coaching Center
              <span className="block text-primary mt-2">
                with Smart Automation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 text-pretty">
              From JEE to NEET, CA to UPSC—manage batches, tests, student
              performance, and fees seamlessly. Save 5+ hours weekly with
              automation built for competitive exam coaching institutes.
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
              src="https://images.pexels.com/photos/5212697/pexels-photo-5212697.jpeg"
              alt="Group of teenagers in a classroom collaboratively working on laptops, fostering team learning. - Max Fischer on Pexels"
              className="w-full h-auto"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="1000+" label="Coaching Centers" />
            <StatCard number="8L+" label="Students Coached" />
            <StatCard number="45%" label="Better Results" />
            <StatCard number="5hrs" label="Saved Per Week" />
          </div>
        </div>
      </section>

      {/* Key Challenges Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Common Challenges Coaching Centers Face
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Running a coaching center requires juggling multiple tasks. We
              make it effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChallengeCard
              icon={<Users className="size-6 text-blue-600" />}
              title="Batch Management Chaos"
              description="Multiple batches for different exams, shifting schedules, student transfers—tracking everything manually is nightmare."
              solution="Smart batch management with automated scheduling, capacity tracking and student allocation"
            />
            <ChallengeCard
              icon={<Target className="size-6 text-emerald-600" />}
              title="Test Series Overload"
              description="Creating tests, evaluating papers, generating reports, and tracking improvement manually takes too much time."
              solution="Digital test series with AI-powered analytics and comparative performance reports"
            />
            <ChallengeCard
              icon={<FileText className="size-6 text-purple-600" />}
              title="Performance Tracking Gap"
              description="Hard to track individual student progress across multiple tests. Parents constantly ask for updates."
              solution="Real-time dashboards showing student performance with parent access"
            />
            <ChallengeCard
              icon={<Clock className="size-6 text-amber-600" />}
              title="Attendance Issues"
              description="Students miss classes, tracking attendance manually, and informing parents takes up valuable teaching time."
              solution="2-tap attendance marking with instant WhatsApp, SMS & email notifications to parents"
            />
            <ChallengeCard
              icon={<Award className="size-6 text-rose-600" />}
              title="Fee Collection Delays"
              description="Chasing students for installment payments, managing cash, issuing receipts—all time-consuming."
              solution="Online UPI/card payments with automated WhatsApp reminders and instant digital receipts"
            />
            <ChallengeCard
              icon={<TrendingUp className="size-6 text-indigo-600" />}
              title="Limited Growth Insights"
              description="No clear data on which batches perform best, which teachers are most effective, or where to improve."
              solution="Comprehensive analytics on batches, teachers, and student outcomes"
            />
          </div>
        </div>
      </section>

      {/* Features for Coaching Centers */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Everything Your Coaching Center Needs
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Purpose-built for competitive exam coaching institutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="size-8 text-blue-600" />}
              title="Batch Management"
              features={[
                "Create unlimited batches",
                "Subject-wise allocation",
                "Batch transfers & merging",
                "Capacity management",
              ]}
            />
            <FeatureCard
              icon={<Target className="size-8 text-emerald-600" />}
              title="Test Series Management"
              features={[
                "Online & offline tests",
                "Question bank management",
                "Auto-evaluation support",
                "Comparative analysis",
              ]}
            />
            <FeatureCard
              icon={<BarChart3 className="size-8 text-purple-600" />}
              title="Performance Analytics"
              features={[
                "Individual progress tracking",
                "Subject-wise analysis",
                "Rank lists & percentiles",
                "Improvement trends",
              ]}
            />
            <FeatureCard
              icon={<CheckCircle2 className="size-8 text-amber-600" />}
              title="Attendance System"
              features={[
                "Quick batch-wise marking",
                "Defaulter alerts",
                "Parent notifications",
                "Attendance reports",
              ]}
            />
            <FeatureCard
              icon={<FileText className="size-8 text-rose-600" />}
              title="Fee Management"
              features={[
                "Installment tracking",
                "UPI/card payments",
                "WhatsApp payment reminders",
                "Real-time collection dashboard",
              ]}
            />
            <FeatureCard
              icon={<Calendar className="size-8 text-indigo-600" />}
              title="Schedule Management"
              features={[
                "Timetable generation",
                "Class rescheduling",
                "Holiday management",
                "Teacher allocation",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center text-balance">
            Perfect for All Types of Coaching
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard
              title="JEE/NEET Coaching"
              description="Manage multiple test series, track chapter-wise performance, and maintain detailed student profiles for medical and engineering entrance exams."
            />
            <UseCaseCard
              title="CA/CS/CMA Classes"
              description="Handle different levels (Foundation, Inter, Final), track paper-wise performance, and manage revision batches efficiently."
            />
            <UseCaseCard
              title="UPSC/SSC/Banking"
              description="Organize current affairs tests, track GK scores, manage prelims and mains batches separately with detailed analytics."
            />
            <UseCaseCard
              title="School Tuitions (1-12)"
              description="Create subject-wise batches, track school exam performance, provide chapter-wise tests, and keep parents informed."
            />
            <UseCaseCard
              title="Language Classes"
              description="Manage speaking, writing, and grammar batches separately. Track proficiency levels and certification progress."
            />
            <UseCaseCard
              title="Skill Development"
              description="Handle different skill modules, track practical assignments, manage certification batches, and placement records."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-balance">
                Why Coaching Centers Choose Shiksha.cloud
              </h2>
              <div className="space-y-6">
                <BenefitItem
                  icon={<Zap className="size-5 text-amber-600" />}
                  title="Quick Setup"
                  description="Get your coaching center online in less than 24 hours. No technical expertise needed."
                />
                <BenefitItem
                  icon={<Target className="size-5 text-emerald-600" />}
                  title="Exam-Focused Design"
                  description="Built specifically for competitive exam coaching with features that matter most."
                />
                <BenefitItem
                  icon={<Award className="size-5 text-blue-600" />}
                  title="Affordable Pricing"
                  description="Only ₹79/student/month. Teachers and admins are FREE. No hidden charges."
                />
                <BenefitItem
                  icon={<UserCheck className="size-5 text-purple-600" />}
                  title="Teacher & Student Apps"
                  description="Mobile apps for teachers and students to access from anywhere, anytime."
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
                      Success Story
                    </h3>
                    <p className="text-slate-600 text-pretty">
                      "मैंने कई सॉफ्टवेयर देखे थे, लेकिन ज़्यादातर दिखावे के थे।
                      Shiksha.cloud पहली बार लगा कि किसी ने वाकई स्कूल की
                      ज़रूरत को समझा है। हमारे टीचर्स से लेकर ऑफिस स्टाफ तक
                      सब इसे सहजता से चला रहे हैं। इससे हमारे काम में एक
                      अनुशासन आ गया है।"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="size-12 rounded-full bg-slate-200" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        Coaching Center Director
                      </div>
                      <div className="text-sm text-slate-600">
                        JEE/NEET Coaching Institute
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 text-pretty">{description}</p>
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
