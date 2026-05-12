import { CallToAction } from "@/components/website/shared/CallToAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Building2,
  FileText,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  BarChart3,
  UserCheck,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

const appUrl = new URL("https://shiksha.cloud");

export const metadata: Metadata = {
  title: "College & University Management System",
  description:
    "Complete ERP solution for colleges and higher education institutions. Manage admissions, courses, exams, placements, and campus operations efficiently.",
  keywords: [
    "college management software",
    "university ERP system",
    "higher education software",
    "campus management system",
    "college administration software",
  ],
  alternates: {
    canonical: `${appUrl.origin}/industries/colleges-higher-education`,
    languages: {
      en: `${appUrl.origin}/industries/colleges-higher-education`,
      "x-default": `${appUrl.origin}/industries/colleges-higher-education`,
    },
  },
  openGraph: {
    title: "College & University Management System | Shiksha.cloud",
    description:
      "Streamline your college operations with our comprehensive management system designed for higher education.",
    url: `${appUrl.origin}/industries/colleges-higher-education`,
    siteName: "Shiksha.cloud",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CollegesPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <GraduationCap className="size-3 mr-1" />
              For Colleges & Universities
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
              Empower Your Higher Education
              <span className="block text-primary mt-2">
                Institution with Modern ERP
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 text-pretty">
              From admissions to placements—manage students, faculty, courses,
              exams, and campus life seamlessly. Save 60%+ administrative time
              with features built for Indian colleges and universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/select-organization">Request Demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">View All Features</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxDb2xsZWdlJTIwc3R1ZGVudHMlMjBpbiUyMHVuaXZlcnNpdHklMjBjYW1wdXMlMjBlZHVjYXRpb258ZW58MHwwfHx8MTc2OTAwNzgyOHww&ixlib=rb-4.1.0&q=85"
              alt="College students in university campus education - Vitaly Gariev on Unsplash"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="200+" label="Colleges & Universities" />
            <StatCard number="5L+" label="Students Enrolled" />
            <StatCard number="95%" label="Faculty Adoption" />
            <StatCard number="60%" label="Admin Time Saved" />
          </div>
        </div>
      </section>

      {/* Key Challenges Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Higher Education Management Challenges
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Managing a college is complex. Our platform simplifies every aspect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ChallengeCard
              icon={<Users className="size-6 text-blue-600" />}
              title="Complex Admissions Process"
              description="Managing thousands of applications, entrance exams, merit lists, and document verification manually is overwhelming."
              solution="Automated admission workflow with online applications, document verification & WhatsApp updates"
            />
            <ChallengeCard
              icon={<BookOpen className="size-6 text-emerald-600" />}
              title="Course & Curriculum Management"
              description="Multiple departments, various courses, different semesters—keeping track of everything is chaotic."
              solution="Centralized course management with automated timetable generation and faculty allocation"
            />
            <ChallengeCard
              icon={<Calendar className="size-6 text-purple-600" />}
              title="Exam Administration"
              description="Scheduling exams across departments, internal assessments, external exams, and result compilation takes weeks."
              solution="Automated exam scheduling, online assessments, and instant result processing"
            />
            <ChallengeCard
              icon={<UserCheck className="size-6 text-amber-600" />}
              title="Faculty Management"
              description="Tracking faculty attendance, workload, leaves, and performance manually is time-consuming."
              solution="Digital faculty portal with attendance tracking and workload management"
            />
            <ChallengeCard
              icon={<Briefcase className="size-6 text-rose-600" />}
              title="Placement Coordination"
              description="Connecting students with companies, managing placement drives, and tracking offers is disorganized."
              solution="Integrated placement module with company database and offer tracking"
            />
            <ChallengeCard
              icon={<Building2 className="size-6 text-indigo-600" />}
              title="Hostel & Campus Management"
              description="Managing hostel allotment, mess fees, library, transport, and other facilities separately is inefficient."
              solution="All-in-one campus management including hostel, library, and transport modules"
            />
          </div>
        </div>
      </section>

      {/* Features for Colleges */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Comprehensive Solutions for Higher Education
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              Everything your college needs in one integrated platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="size-8 text-blue-600" />}
              title="Admissions & Enrollment"
              features={[
                "Online application portal",
                "Automated document verification",
                "Merit list generation",
                "Integrated fee collection",
              ]}
            />
            <FeatureCard
              icon={<BookOpen className="size-8 text-emerald-600" />}
              title="Academic Management"
              features={[
                "Course & curriculum planning",
                "Subject allocation",
                "Timetable generation",
                "Syllabus tracking",
              ]}
            />
            <FeatureCard
              icon={<FileText className="size-8 text-purple-600" />}
              title="Examination System"
              features={[
                "Exam scheduling",
                "Internal assessment",
                "Online exam support",
                "Result processing",
              ]}
            />
            <FeatureCard
              icon={<UserCheck className="size-8 text-amber-600" />}
              title="Faculty Portal"
              features={[
                "Attendance management",
                "Leave tracking",
                "Workload monitoring",
                "Performance analytics",
              ]}
            />
            <FeatureCard
              icon={<Briefcase className="size-8 text-rose-600" />}
              title="Placement Cell"
              features={[
                "Company database",
                "Drive scheduling",
                "Student profiles",
                "Offer tracking",
              ]}
            />
            <FeatureCard
              icon={<BarChart3 className="size-8 text-indigo-600" />}
              title="Analytics & Reports"
              features={[
                "Student performance",
                "Department insights",
                "Attendance analytics",
                "Custom reports",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center text-balance">
            Beyond Academics
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Building2 className="size-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Hostel Management
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Room allotment and occupancy tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Mess fee management and menu planning</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Visitor and gate pass management</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Complaint and maintenance tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-8">
                <div className="size-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                  <BookOpen className="size-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Library & Resources
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Digital library catalog and inventory</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Book issue and return tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Fine calculation for overdue books</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>E-resources and journal management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
              Why Colleges Trust Shiksha.cloud
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              icon={<Award className="size-6 text-amber-600" />}
              title="Scalable Platform"
              description="From 500 to 50,000 students—our platform grows with you"
            />
            <BenefitCard
              icon={<TrendingUp className="size-6 text-emerald-600" />}
              title="Affordable Pricing"
              description="Only ₹79/student/month. Faculty and admins are completely FREE"
            />
            <BenefitCard
              icon={<UserCheck className="size-6 text-blue-600" />}
              title="Multi-role Access"
              description="Separate portals for admin, faculty, students, and parents"
            />
            <BenefitCard
              icon={<BarChart3 className="size-6 text-purple-600" />}
              title="AI-Powered Analytics"
              description="Automated reports and data-driven insights for better decisions"
            />
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

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 text-pretty">{description}</p>
      </CardContent>
    </Card>
  );
}
