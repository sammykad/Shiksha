import { CallToAction } from "@/components/website/shared/CallToAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    School,
    GraduationCap,
    BookOpen,
    Users,
    Building2,
    Baby,
    Briefcase,
    Dumbbell,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    Shield,
    Zap,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

const appUrl = new URL("https://shiksha.cloud");

export const metadata: Metadata = {
    title: "Education Management Software | All Institutions",
    description:
        "Complete management solutions for schools, colleges, coaching centers, and educational institutions. Choose your industry and transform your operations today.",
    keywords: [
        "school management software",
        "college management system",
        "coaching center ERP",
        "educational institution software",
        "school CRM India",
        "college administration software",
        "tuition class management",
        "K-12 school software",
        "higher education management",
    ],
    alternates: {
        canonical: `${appUrl.origin}/industries`,
        languages: {
            en: `${appUrl.origin}/industries`,
            "x-default": `${appUrl.origin}/industries`,
        },
    },
    openGraph: {
        title: "Education Management Software for All Institutions | Shiksha Cloud",
        description:
            "Comprehensive management solutions tailored for every type of educational institution in India.",
        url: `${appUrl.origin}/industries`,
        siteName: "Shiksha Cloud",
        locale: "en_IN",
        type: "website",
        images: [
            {
                url: `${appUrl.origin}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Shiksha Cloud - Education Management",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@shiksha_cloud",
        title: "Education Management Software for All Institutions",
        description:
            "Complete management solutions for schools, colleges, coaching centers, and educational institutions.",
        images: [`${appUrl.origin}/og-image.png`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const industries = [
    {
        slug: "pre-schools",
        title: "Pre-Schools & Daycare",
        description:
            "Manage admissions, daily activities, parent communication, and child development tracking for early learning centers.",
        icon: Baby,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
        features: [
            "Daily activity logs",
            "Parent updates & photos",
            "Admission management",
            "Fee tracking",
        ],
        stats: { schools: "200+", students: "15K+", satisfaction: "99%" },
    },
    {
        slug: "k-12-schools",
        title: "K-12 Schools",
        description:
            "Complete school management system for primary and secondary schools. Manage students, teachers, academics, and parent communication.",
        icon: School,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        features: [
            "Student information system",
            "Attendance & fees",
            "Exam & report cards",
            "Parent communication",
        ],
        stats: { schools: "500+", students: "2.5L+", satisfaction: "98%" },
    },
    {
        slug: "junior-colleges",
        title: "Junior Colleges (11-12)",
        description:
            "Streamline operations for junior colleges with batch management, attendance tracking, and exam preparation tools.",
        icon: GraduationCap,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        features: [
            "Stream-wise batches",
            "Attendance automation",
            "Performance analytics",
            "College application support",
        ],
        stats: { schools: "150+", students: "50K+", satisfaction: "97%" },
    },
    {
        slug: "degree-colleges",
        title: "Degree Colleges",
        description:
            "Comprehensive management for undergraduate colleges with department-wise organization, exams, and placement tracking.",
        icon: Building2,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        features: [
            "Department management",
            "Semester system",
            "Placement tracking",
            "Alumni network",
        ],
        stats: { schools: "100+", students: "1L+", satisfaction: "96%" },
    },
    {
        slug: "colleges-higher-education",
        title: "Higher Education",
        description:
            "Advanced management solutions for universities and postgraduate institutions with research and PhD program support.",
        icon: BookOpen,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        features: [
            "Research management",
            "PhD tracking",
            "Publication records",
            "Grant management",
        ],
        stats: { schools: "50+", students: "30K+", satisfaction: "98%" },
    },
    {
        slug: "coaching-classes",
        title: "Tuition Classes (1-10)",
        description:
            "Perfect for small to medium tuition centers. Manage batches, attendance, tests, and parent communication effortlessly.",
        icon: Users,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        features: [
            "Subject-wise batches",
            "Test series",
            "Performance reports",
            "Fee reminders",
        ],
        stats: { schools: "800+", students: "1L+", satisfaction: "99%" },
    },
    {
        slug: "coaching-centers",
        title: "Coaching Centers",
        description:
            "Built for competitive exam coaching—JEE, NEET, UPSC, SSC, Banking. Manage test series, batches, and student performance.",
        icon: TargetIcon,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        features: [
            "Test series management",
            "Rank lists & percentiles",
            "Chapter-wise analysis",
            "Mock test platform",
        ],
        stats: { schools: "1000+", students: "8L+", satisfaction: "97%" },
    },
    {
        slug: "skill-academies",
        title: "Skill Development Academies",
        description:
            "Manage coding bootcamps, design schools, and vocational training centers with project tracking and placement support.",
        icon: Dumbbell,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        features: [
            "Project portfolios",
            "Skill assessments",
            "Placement records",
            "Industry partnerships",
        ],
        stats: { schools: "120+", students: "25K+", satisfaction: "95%" },
    },
    {
        slug: "professional-institutes",
        title: "Professional Institutes",
        description:
            "For management, law, medical, and engineering colleges. Handle accreditation, industry partnerships, and placements.",
        icon: Briefcase,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        features: [
            "Accreditation support",
            "Industry tie-ups",
            "Internship tracking",
            "Corporate relations",
        ],
        stats: { schools: "80+", students: "40K+", satisfaction: "96%" },
    },
    {
        slug: "small-tutors-academies",
        title: "Small Tutors & Academies",
        description:
            "Simple, affordable solution for individual tutors and small academies. Get started in minutes with zero setup costs.",
        icon: Heart,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        features: [
            "Quick student onboarding",
            "Simple attendance",
            "Basic fee tracking",
            "Parent updates",
        ],
        stats: { schools: "2000+", students: "50K+", satisfaction: "99%" },
    },
];

function TargetIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}

export default function IndustriesPage() {
    return (
        <div className="min-h-dvh bg-white">
            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4">
                            <School className="size-3 mr-1" />
                            For All Education Institutions
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
                            Built for Every Type of
                            <span className="block text-primary mt-2">
                                Educational Institution
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 text-pretty">
                            From pre-schools to universities, coaching centers to professional
                            institutes—find the perfect management solution tailored to your
                            specific needs.
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
                            alt="Diverse group of students collaborating in a modern educational setting"
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
                        <StatCard number="5000+" label="Institutions" />
                        <StatCard number="5L+" label="Students Managed" />
                        <StatCard number="98%" label="Satisfaction Rate" />
                        <StatCard number="10+" label="Industries Served" />
                    </div>
                </div>
            </section>

            {/* Industries Grid */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
                            Choose Your Industry
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
                            Each solution is purpose-built with features that matter most to
                            your specific type of institution.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {industries.map((industry) => (
                            <IndustryCard key={industry.slug} industry={industry} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
                            Why 5000+ Institutions Trust Shiksha.cloud
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
                            Built by educators, for educators. We understand the unique
                            challenges of running educational institutions in India.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <WhyChooseCard
                            icon={<Zap className="size-6 text-amber-600" />}
                            title="Quick Setup"
                            description="Get your institution online in less than 24 hours. No technical expertise required."
                        />
                        <WhyChooseCard
                            icon={<Shield className="size-6 text-emerald-600" />}
                            title="100% Secure"
                            description="Bank-level security with automatic backups. Your data is always safe with us."
                        />
                        <WhyChooseCard
                            icon={<TrendingUp className="size-6 text-blue-600" />}
                            title="Scalable"
                            description="From 50 to 50,000 students—our platform grows seamlessly with your institution."
                        />
                        <WhyChooseCard
                            icon={<Heart className="size-6 text-rose-600" />}
                            title="Dedicated Support"
                            description="Phone, WhatsApp, and email support in English and Hindi. Quick resolution guaranteed."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">
                            Affordable for Every Institution
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
                            Only ₹79 per student/month. Parents, teachers, and admins are
                            completely FREE.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            tier="Starter"
                            price="₹79"
                            period="per student/month"
                            description="Perfect for small institutions"
                            features={[
                                "Up to 200 students",
                                "All core features",
                                "WhatsApp & SMS integration",
                                "Basic reports",
                                "Email support",
                            ]}
                            cta="Start Free Trial"
                            highlighted={false}
                        />
                        <PricingCard
                            tier="Professional"
                            price="₹69"
                            period="per student/month"
                            description="Most popular choice"
                            features={[
                                "Up to 1000 students",
                                "Everything in Starter",
                                "Advanced analytics",
                                "Custom workflows",
                                "Priority support",
                                "Dedicated account manager",
                            ]}
                            cta="Start Free Trial"
                            highlighted={true}
                        />
                        <PricingCard
                            tier="Enterprise"
                            price="Custom"
                            period="based on size"
                            description="For large institutions"
                            features={[
                                "Unlimited students",
                                "Everything in Professional",
                                "Custom integrations",
                                "White-label options",
                                "24/7 phone support",
                                "On-site training",
                            ]}
                            cta="Contact Sales"
                            highlighted={false}
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

function IndustryCard({ industry }: { industry: typeof industries[0] }) {
    const Icon = industry.icon;

    return (
        <Card
            className={`border-2 hover:border-primary transition-all hover:shadow-lg group cursor-pointer ${industry.borderColor}`}
        >
            <CardContent className="p-6">
                <Link href={`/industries/${industry.slug}`}>
                    <div
                        className={`size-12 rounded-lg ${industry.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                        <Icon className={`size-6 ${industry.color}`} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {industry.title}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 text-pretty">
                        {industry.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                        {industry.features.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-center gap-2 text-sm text-slate-600"
                            >
                                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                        <div className="text-center">
                            <div className="text-lg font-bold text-slate-900 tabular-nums">
                                {industry.stats.schools}
                            </div>
                            <div className="text-xs text-slate-600">Schools</div>
                        </div>
                        <div className="text-center border-l">
                            <div className="text-lg font-bold text-slate-900 tabular-nums">
                                {industry.stats.students}
                            </div>
                            <div className="text-xs text-slate-600">Students</div>
                        </div>
                        <div className="text-center border-l">
                            <div className="text-lg font-bold text-slate-900 tabular-nums">
                                {industry.stats.satisfaction}
                            </div>
                            <div className="text-xs text-slate-600">Satisfaction</div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Learn more <ArrowRight className="size-4 ml-1" />
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}

function WhyChooseCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6">
                <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 text-pretty">{description}</p>
            </CardContent>
        </Card>
    );
}

function PricingCard({
    tier,
    price,
    period,
    description,
    features,
    cta,
    highlighted,
}: {
    tier: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
}) {
    return (
        <Card
            className={`border-2 relative ${highlighted
                ? "border-primary shadow-lg"
                : "border-slate-200 hover:border-primary transition-colors"
                }`}
        >
            {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
            )}
            <CardContent className="p-6 pt-8">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tier}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-4xl font-bold text-slate-900">{price}</span>
                        <span className="text-sm text-slate-600">{period}</span>
                    </div>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <Button className="w-full" variant={highlighted ? "default" : "outline"} asChild>
                    <Link href="/select-organization">{cta}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
