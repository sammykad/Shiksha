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
      { label: "Try with real school data, not dummy screens", included: true },
      { label: "We help you set up students, classes and fees", included: true },
      { label: "Start with fees, attendance, notices and admissions", included: true },
      { label: "Parents and teachers can join without paid seats", included: true },
      { label: "Leave with your data if it is not a fit", included: true },
      { label: "Continue on EarlyBird pricing after trial", included: true },
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
      { label: "Best for owners who want to stop fee chasing", included: true },
      { label: "Receipts, pending fees and reminders in one place", included: true },
      { label: "Parents can see attendance and fee status themselves", included: true },
      { label: "Admissions follow-ups are not lost in notebooks", included: true },
      { label: "Notices, holidays, documents and certificates included", included: true },
      { label: "Parents, teachers, admins and staff stay free", included: true },
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
      { label: "Best for growing schools with more office workload", included: true },
      { label: "AI summaries show fee and attendance issues early", included: true },
      { label: "QR certificates, ID cards, hall tickets and verification", included: true },
      { label: "More room for reminders, reports and daily operations", included: true },
      { label: "Priority onboarding for office and academic teams", included: true },
      { label: "Custom integration projects are for Scale", included: false },
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
      { label: "Best for trusts, chains, colleges and large groups", included: true },
      { label: "Compare branches on fees, attendance and admissions", included: true },
      { label: "Custom permissions, roles and terminology", included: true },
      { label: "Custom integrations, imports and workflows", included: true },
      { label: "Dedicated migration, training and success plan", included: true },
      { label: "SLA, deployment support and governance reviews", included: true },
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
  note?: string
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
    group: "Collect Fees Without Daily Chasing",
    rows: [
      {
        label: "Parents can pay online and get receipts instantly",
        note: "PhonePe payments, UPI/cards/net banking, and branded PDF receipts reduce office counter pressure.",
        ...included,
      },
      {
        label: "Pending fees are visible before they become a headache",
        note: "See collected, pending, overdue and student-wise balances without opening Excel every day.",
        ...included,
      },
      {
        label: "Automatic reminders reduce awkward fee calls",
        note: "Send reminders on WhatsApp, SMS, email and push. Usage costs stay separate and visible.",
        free: "Usage based",
        school: "Usage based",
        multi: "Usage based",
        enterprise: "Custom volume",
      },
      {
        label: "Cheque, cash and online payments stay in one record",
        note: "Record cash, cheque, DD, UPI and online payments together so accounts do not split across notebooks.",
        ...included,
      },
      {
        label: "Reconciliation is easier for the accounts team",
        note: "Compare internal fee records with PhonePe settlement reports when closing the month.",
        free: "Basic",
        school: "Basic",
        multi: "Advanced",
        enterprise: "Custom",
      },
    ],
  },
  {
    group: "Reduce Office Work",
    rows: [
      {
        label: "Student records are ready in bulk, not one-by-one",
        note: "Import students, parents, classes, sections and key details instead of typing everything manually.",
        ...included,
      },
      {
        label: "Class, section, batch and academic year setup is clean",
        note: "Works for schools, coaching classes, colleges and academies without forcing one naming style.",
        ...included,
      },
      {
        label: "Documents can be collected and verified online",
        note: "Aadhaar, TC, birth certificate, photos and marksheets can move through an admin approval flow.",
        ...included,
      },
      {
        label: "Teachers and staff are part of the same system",
        note: "Teacher profiles, subject assignments, class ownership and staff records stay connected.",
        ...included,
      },
      {
        label: "Our team can help with migration and setup",
        note: "The bigger the institution, the more hands-on the onboarding and migration support becomes.",
        free: "Self-serve",
        school: "Guided",
        multi: "Priority",
        enterprise: "Dedicated",
      },
    ],
  },
  {
    group: "Keep Parents Informed",
    rows: [
      {
        label: "Parents can see fees, receipts, notices and attendance",
        note: "Less front-office calling because parents get the information directly in their portal.",
        ...included,
      },
      {
        label: "Attendance updates can reach parents quickly",
        note: "Absent and late alerts can go through the notification channels your institution enables.",
        ...included,
      },
      {
        label: "Notices reach the right class, role or section",
        note: "Send a holiday, exam notice or deadline to only the people who need it.",
        ...included,
      },
      {
        label: "Emergency holiday alerts are not manual chaos",
        note: "Declare urgent holidays and push high-priority communication from one place.",
        ...included,
      },
      {
        label: "Parents and students get role-specific views",
        note: "Admin, teacher, parent and student portals all pull from the same organization data.",
        ...included,
      },
    ],
  },
  {
    group: "Improve Admissions",
    rows: [
      {
        label: "Every enquiry has an owner and next follow-up",
        note: "Admissions teams can track calls, visits, WhatsApp notes, priority and follow-up dates.",
        ...included,
      },
      {
        label: "You can see where enquiries are getting stuck",
        note: "The funnel view shows movement from new enquiry to contacted, qualified and converted.",
        ...included,
      },
      {
        label: "Facebook and Instagram leads can enter automatically",
        note: "Useful for schools and coaching centres that run admission campaigns.",
        free: "Connect",
        school: "Connect",
        multi: "Connect",
        enterprise: "Custom",
      },
      {
        label: "A converted lead can become a student record",
        note: "Admissions work connects to student management instead of being lost after enrolment.",
        ...included,
      },
    ],
  },
  {
    group: "Give Owners Control",
    rows: [
      {
        label: "Fee, attendance, admission and exam reports stay together",
        note: "Owners can review the institution without asking every department for a separate sheet.",
        ...included,
      },
      {
        label: "AI summaries highlight what needs attention",
        note: "Monthly fee, attendance and operations summaries help management act earlier.",
        free: false,
        school: "Basic",
        multi: true,
        enterprise: "Custom",
      },
      {
        label: "Low attendance and fee risk are easier to spot",
        note: "See warning signs before they become dropout, complaint or collection problems.",
        free: false,
        school: "Basic",
        multi: true,
        enterprise: "Custom",
      },
      {
        label: "One login can manage multiple institutions",
        note: "Useful for owners running a school, coaching centre, preschool or multiple branches.",
        free: true,
        school: true,
        multi: true,
        enterprise: true,
      },
      {
        label: "Multi-branch reporting for education groups",
        note: "Compare branches on fee collection, attendance and admissions from one command view.",
        free: false,
        school: false,
        multi: "Limited",
        enterprise: true,
      },
    ],
  },
  {
    group: "Build Trust & Compliance",
    rows: [
      {
        label: "Certificates and ID cards can be verified by QR",
        note: "Anyone can scan and verify authenticity without needing an app or login.",
        ...included,
      },
      {
        label: "Hindi and Marathi certificate support is available",
        note: "Helpful for Indian institutions that need local-language documents.",
        free: true,
        school: true,
        multi: true,
        enterprise: "Custom templates",
      },
      {
        label: "Anonymous complaints can be tracked properly",
        note: "Students or parents can raise sensitive issues while admins keep a status trail.",
        free: true,
        school: true,
        multi: true,
        enterprise: "Policy workflow",
      },
      {
        label: "Sensitive records stay role-based",
        note: "Admins, teachers, parents and students only see what their role should see.",
        ...included,
      },
      {
        label: "PhonePe, WhatsApp, email, push and storage are integrated",
        note: "Core Indian workflows are connected instead of becoming separate vendor work.",
        ...included,
      },
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
    question: "Why does pricing show so many included workflows?",
    answer:
      "Because Shiksha.cloud is priced as an institution operating system, not as separate mini-products. Start with the modules you need today, then enable more workflows as your team is ready.",
  },
  {
    id: "faq-8",
    question: "Do you support multi-branch institutions?",
    answer:
      "Yes. Multi-branch management, cross-branch reporting, custom permissions, and migration support are best handled on the Scale plan.",
  },
  {
    id: "faq-9",
    question: "How is Shiksha.cloud cheaper than buying separate tools?",
    answer:
      "Most schools pay for fee software (₹500/mo), attendance (₹300/mo), CRM (₹400/mo), exam management (₹300/mo), and a communication tool (₹400/mo) — totalling ₹2,100+/mo. Shiksha.cloud replaces all of them starting at ₹999/mo. No integration costs, no multiple logins, no separate vendor support.",
  },
  {
    id: "faq-10",
    question: "What happens if we don't use every module?",
    answer:
      "Every module is included in your plan whether you use it today or not. That means you can roll out fee management first, add attendance next term, enable CRM when admissions open — without ever paying more or signing up for another tool. It's designed to grow with your institution without surprise costs.",
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

export interface CostComparisonItem {
  category: string
  standaloneCost: number
  description: string
}

export const COST_COMPARISON_ITEMS: CostComparisonItem[] = [
  { category: "Fee management", standaloneCost: 500, description: "Fee setup, online payments, receipts, reconciliation, reminders" },
  { category: "Attendance tracking", standaloneCost: 300, description: "Daily marking, analytics, parent monitoring, exports" },
  { category: "Lead & admission CRM", standaloneCost: 400, description: "Enquiry capture, pipeline tracking, follow-ups, conversion" },
  { category: "Exam management", standaloneCost: 300, description: "Scheduling, hall tickets, results, report cards, grading" },
  { category: "Communication platform", standaloneCost: 400, description: "SMS, WhatsApp, email, push, notice board, reminders" },
  { category: "Reports & analytics", standaloneCost: 200, description: "Fee, attendance, exam dashboards, AI reports, exports" },
]

export const TOTAL_STANDALONE_COST = COST_COMPARISON_ITEMS.reduce(
  (sum, item) => sum + item.standaloneCost,
  0
)

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
