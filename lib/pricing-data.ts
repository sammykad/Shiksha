export type BillingCycle = "monthly" | "annual"

export const ANNUAL_DISCOUNT = 0.2

export const STUDENT_STEPS = [50, 100, 300, 500, 1000, 2000, 5000, 10000] as const
export type StudentStep = (typeof STUDENT_STEPS)[number]

export interface PlanFeature {
  label: string
  included: boolean | "addon" | "included-plus" | string
}

export interface Plan {
  id: string
  name: string
  badge?: string
  pricePerStudent?: number
  flatMonthlyPrice?: number
  customLabel?: string
  description: string
  ctaLabel: string
  ctaVariant: "default" | "outline"
  featured?: boolean
  features: PlanFeature[]
  footnote?: string
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Launch Offer",
    badge: "Limited seats",
    pricePerStudent: 0,
    description:
      "Free for 3 months. No card needed. Use real students, real data, and every feature with zero risk.",
    ctaLabel: "Claim launch offer",
    ctaVariant: "outline",
    footnote: "After 3 months, stay at Rs 29/student/month or leave with your data.",
    features: [
      { label: "Rs 0 for 3 months", included: true },
      { label: "No card needed", included: true },
      { label: "Every feature unlocked", included: true },
      { label: "Real students and real data", included: true },
      { label: "Export your data anytime", included: true },
      { label: "Then Rs 29/student/month", included: true },
    ],
  },
  {
    id: "earlybird",
    name: "EarlyBird",
    badge: "First 50 only",
    pricePerStudent: 29,
    description:
      "For the first 50 schools that want the lowest lifetime rate before public pricing settles.",
    ctaLabel: "Claim EarlyBird ->",
    ctaVariant: "default",
    footnote: "No card for 3 months. Locked forever after purchase.",
    features: [
      { label: "Rs 29/student/month locked forever", included: true },
      { label: "No card required for 3 months", included: true },
      { label: "All core academic and admin modules", included: true },
      { label: "Unlimited parents, teachers, and admins", included: true },
      { label: "Fee collection and receipt workflows", included: true },
      { label: "Attendance analytics and exports", included: true },
      { label: "Lead CRM and admission pipeline", included: true },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    badge: "Most Popular",
    pricePerStudent: 45,
    description:
      "For growing institutions that need automation, analytics, and stronger operations.",
    ctaLabel: "Start free trial ->",
    ctaVariant: "default",
    featured: true,
    footnote: "Best fit around 500 learners",
    features: [
      { label: "Everything in EarlyBird", included: true },
      { label: "Higher-volume fee and notification workflows", included: true },
      { label: "AI monthly reports and agent configuration", included: true },
      { label: "Document and certificate workflows", included: true },
      { label: "Recorded sessions and learning support", included: true },
      { label: "Priority onboarding support", included: true },
      { label: "Advanced custom integrations", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Scale",
    pricePerStudent: 35,
    description:
      "For colleges, trusts, coaching chains, and large multi-branch groups.",
    ctaLabel: "Contact sales",
    ctaVariant: "outline",
    footnote: "For 1500+ learners. Annual organization plans available.",
    features: [
      { label: "Everything in Growth", included: true },
      { label: "Multi-branch institution management", included: true },
      { label: "Cross-branch reporting and analytics", included: true },
      { label: "Custom roles, permissions, and terminology", included: true },
      { label: "Custom integrations and data workflows", included: true },
      { label: "Dedicated success and migration planning", included: true },
      { label: "Custom SLA and deployment support", included: true },
    ],
  },
]

export interface AddOn {
  id: string
  name: string
  price: number
  description: string
}

export const ADD_ONS: AddOn[] = [
  {
    id: "notifications",
    name: "Notification usage credits",
    price: 0,
    description:
      "SMS, WhatsApp, email, push, and voice usage is tracked transparently. Institutions pay only for actual channel costs where applicable.",
  },
  {
    id: "payments",
    name: "Payment gateway charges",
    price: 0,
    description:
      "Online payment gateway charges are passed through for fee payments, with instant receipts and reconciliation context.",
  },
  {
    id: "storage",
    name: "Extra storage",
    price: 0,
    description:
      "Document, certificate, gallery, and receipt storage is included for normal usage. Extra storage applies only beyond included limits.",
  },
]

export type CellValue = boolean | "addon" | "included-plus" | string

export interface ComparisonRow {
  label: string
  free: CellValue
  school: CellValue
  multi: CellValue
  enterprise: CellValue
}

export interface ComparisonGroup {
  group: string
  rows: ComparisonRow[]
}

const included = { free: true, school: true, multi: true, enterprise: true }

export const COMPARISON: ComparisonGroup[] = [
  {
    group: "Student, Learner & Academic Records",
    rows: [
      { label: "Student or learner profiles", ...included },
      { label: "Bulk student import", ...included },
      { label: "Document upload and verification", ...included },
      { label: "Academic performance dashboards", ...included },
      { label: "Self-service student profile editing", ...included },
      { label: "Digital ID card generation", free: "Planned", school: "Planned", multi: "Planned", enterprise: "Custom" },
    ],
  },
  {
    group: "Fees, Payments & Finance",
    rows: [
      { label: "Fee categories and assignments", ...included },
      { label: "Online payments through UPI, cards, net banking, and wallets", ...included },
      { label: "Offline payment recording", ...included },
      { label: "PDF fee receipts", ...included },
      { label: "Manual and automated fee reminders", ...included },
      { label: "PDC cheque tracking", free: false, school: true, multi: true, enterprise: true },
      { label: "Fee reconciliation", free: "Basic", school: "Basic", multi: "Advanced", enterprise: "Custom" },
      { label: "Parent, student, and teacher fee views", ...included },
    ],
  },
  {
    group: "Attendance & Leave",
    rows: [
      { label: "Daily attendance marking", ...included },
      { label: "Section-wise attendance summaries", ...included },
      { label: "Attendance calendar, table, filters, and exports", ...included },
      { label: "Ring chart, heatmap, skyline, and analytics views", ...included },
      { label: "Parent child-attendance monitoring", ...included },
      { label: "Attendance completion tracking", ...included },
      { label: "QR or face attendance workflows", free: "Planned", school: "Planned", multi: "Planned", enterprise: "Custom" },
      { label: "Leave application and approval workflow", ...included },
    ],
  },
  {
    group: "Academic Setup, Teachers & Subjects",
    rows: [
      { label: "Grades, sections, batches, and class groups", ...included },
      { label: "Subject management with codes and electives", ...included },
      { label: "Teacher profiles and staff listings", ...included },
      { label: "Teaching assignments by subject, grade, section, or batch", ...included },
      { label: "Academic year setup and switching", ...included },
      { label: "Terminology customization for schools, colleges, coaching, and batches", ...included },
    ],
  },
  {
    group: "Exams, Certificates & Learning Support",
    rows: [
      { label: "Exam sessions and exam setup", ...included },
      { label: "Hall ticket generation with QR code", free: "META", school: "META", multi: "META", enterprise: "Custom" },
      { label: "Results entry and publication", free: "META", school: "META", multi: "META", enterprise: "Custom" },
      { label: "Grading scale configuration", free: "META", school: "META", multi: "META", enterprise: "Custom" },
      { label: "Report cards and exam analytics", free: "Planned", school: "Planned", multi: "Planned", enterprise: "Custom" },
      { label: "Certificate generation and public verification", ...included },
      { label: "Recorded session links", ...included },
      { label: "Assignment/LMS workflows", free: "Planned", school: "Planned", multi: "Planned", enterprise: "Custom" },
    ],
  },
  {
    group: "Admissions, CRM & Growth",
    rows: [
      { label: "Lead capture and enquiry management", ...included },
      { label: "Lead status pipeline and priority tracking", ...included },
      { label: "Activity timeline and follow-up management", ...included },
      { label: "Lead assignment to staff", ...included },
      { label: "Convert lead to student", ...included },
      { label: "Meta/Facebook lead integration", free: "META", school: "META", multi: "META", enterprise: "Custom" },
      { label: "Cross-branch lead analytics", free: false, school: false, multi: true, enterprise: true },
    ],
  },
  {
    group: "Communication, Notifications & Safety",
    rows: [
      { label: "Notice board with audience targeting", ...included },
      { label: "Email, SMS, WhatsApp, push, and in-app notifications", ...included },
      { label: "Notification templates and delivery logs", ...included },
      { label: "Notification settings, cooldowns, and cost tracking", ...included },
      { label: "Anonymous complaint submission and tracking", ...included },
      { label: "Complaint investigation workflow and analytics", ...included },
      { label: "Voice call reminders", free: "Planned", school: "Planned", multi: "Planned", enterprise: "Custom" },
    ],
  },
  {
    group: "Reports, AI & Automation",
    rows: [
      { label: "Reports hub for fees, attendance, exams, reconciliation, and staff", ...included },
      { label: "PDF and CSV report downloads", ...included },
      { label: "AI monthly reports", free: false, school: true, multi: true, enterprise: true },
      { label: "FeeSense AI agent", free: false, school: true, multi: true, enterprise: true },
      { label: "Attendance AI agent", free: false, school: true, multi: true, enterprise: true },
      { label: "Scheduled agent runs and background jobs", free: false, school: "Basic", multi: true, enterprise: true },
      { label: "Custom AI and automation workflows", free: false, school: false, multi: false, enterprise: true },
    ],
  },
  {
    group: "Portals, Integrations & Scale",
    rows: [
      { label: "Admin, teacher, student, and parent portals", ...included },
      { label: "Role-based permissions", ...included },
      { label: "PhonePe payment gateway", ...included },
      { label: "Firebase push, Cloudinary/Uploadthing storage, and email delivery", ...included },
      { label: "Google Sheets and CSV imports", ...included },
      { label: "Organization setup wizard and staff invitations", ...included },
      { label: "Multi-branch management", free: false, school: false, multi: "Limited", enterprise: true },
      { label: "Custom integrations, migration, and SLA", free: false, school: false, multi: false, enterprise: true },
    ],
  },
]

export interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Fee collection used to take our office team 3 days every month. With Shiksha.cloud, parents get reminders, pay online, and receipts are ready instantly.",
    name: "Anjali Mehta",
    role: "Principal, Bright Minds Academy, Pune",
  },
  {
    id: "t2",
    quote:
      "We run batches like a coaching institute, not a traditional school. The terminology and sections still fit our workflow without forcing us into someone else's structure.",
    name: "Rajesh Kumar",
    role: "Director, Sunrise Learning Centre, Surat",
  },
  {
    id: "t3",
    quote:
      "For our junior college, the combination of fee tracking, certificates, notices, and student records removed a lot of repeated office work.",
    name: "Sr. Theresa George",
    role: "Administrator, Holy Cross Junior College, Kolkata",
  },
  {
    id: "t4",
    quote:
      "Lead tracking helped us see every enquiry, follow-up, and admission conversion in one place. That matters as much as academics for a growing institute.",
    name: "Vinod Sharma",
    role: "Admissions Head, CareerPath Academy, Nagpur",
  },
  {
    id: "t5",
    quote:
      "Students can raise sensitive concerns anonymously, and the admin team can resolve them with a proper timeline. It gives parents and learners confidence.",
    name: "Priya Iyer",
    role: "Counsellor, St. Xavier's Institute, Chennai",
  },
  {
    id: "t6",
    quote:
      "We manage multiple branches from one operational view. Attendance, fee collection, leads, and reports are easier to compare before issues become serious.",
    name: "Arun Desai",
    role: "Chairman, Ryan Education Group, Mumbai",
  },
]

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Is Shiksha.cloud only for schools?",
    answer:
      "No. It is built for Indian educational institutions, including K-12 schools, coaching classes, colleges, junior colleges, academies, vocational institutes, and multi-branch education groups.",
  },
  {
    id: "faq-2",
    question: "Do parents, teachers, and admins pay extra?",
    answer:
      "No. Pricing is based on students or learners. Parents, teachers, admins, and staff accounts are not billed as separate paid users.",
  },
  {
    id: "faq-3",
    question: "What costs are extra?",
    answer:
      "Subscription is separate from actual notification usage, payment gateway charges on online fee payments, and storage only when usage crosses included limits.",
  },
  {
    id: "faq-4",
    question: "Can the platform use college, coaching, or batch terminology?",
    answer:
      "Yes. Terminology customization lets institutions adapt labels such as class, grade, section, batch, course, learner, or student to their own workflow.",
  },
  {
    id: "faq-5",
    question: "How long does setup take?",
    answer:
      "Most institutions can start within 24 hours after basic organization setup, academic year setup, student import, fee setup, and notification testing.",
  },
  {
    id: "faq-6",
    question: "Can we switch plans as we grow?",
    answer:
      "Yes. You can move from a small learner-based plan to higher-volume or organization-based pricing as your institution grows.",
  },
  {
    id: "faq-7",
    question: "Are all listed modules fully live?",
    answer:
      "The comparison marks some workflows as META or Planned where the docs show they are still being validated or expanded. Core operations like students, fees, attendance, notices, documents, CRM, portals, and reports are represented as included.",
  },
  {
    id: "faq-8",
    question: "Do you support multi-branch institutions?",
    answer:
      "Yes. Multi-branch management, cross-branch reporting, custom permissions, and migration support are best handled on the Scale plan.",
  },
]

export const TRUSTED_SCHOOLS = [
  "K-12 Schools",
  "Coaching Classes",
  "Junior Colleges",
  "Degree Colleges",
  "Vocational Institutes",
  "Multi-Branch Education Groups",
]

export function getEffectivePrice(
  pricePerStudent: number,
  billing: BillingCycle
): number {
  return billing === "annual"
    ? Math.round(pricePerStudent * (1 - ANNUAL_DISCOUNT))
    : pricePerStudent
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatStudentLabel(count: number): string {
  return count >= 1000 ? `${count / 1000}K learners` : `${count} learners`
}

export function computeMonthlyTotal(
  count: number,
  pricePerStudent: number,
  billing: BillingCycle
): string {
  if (count >= 5000) return "Contact us for organization pricing"
  const price = getEffectivePrice(pricePerStudent, billing)
  return `~ ${formatINR(count * price)} / month for ${formatStudentLabel(count)}`
}
