import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  MessageSquareWarning,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from 'lucide-react';

export type RoleSlug = 'admins' | 'teachers' | 'parents';

type RolePage = {
  slug: RoleSlug;
  href: string;
  eyebrow: string;
  navLabel: string;
  title: string;
  h1: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  accent: string;
  soft: string;
  icon: typeof ShieldCheck;
  primaryCta: string;
  proof: string[];
  features: { icon: typeof ShieldCheck; title: string; description: string }[];
  outcomes: { value: string; label: string }[];
  faq: { question: string; answer: string }[];
};

const rolePanelCopy: Record<RoleSlug, { label: string; promise: string; availability: string }> = {
  admins: {
    label: 'For running',
    promise: 'Manage fees, attendance, exams, notices, complaints, and records from one calm command center.',
    availability: 'No per-admin fee',
  },
  teachers: {
    label: 'For teaching',
    promise: 'Mark attendance, manage classes, verify documents, and update exam work without office dependency.',
    availability: 'Always free for teachers',
  },
  parents: {
    label: 'For families',
    promise: 'Track attendance, pay fees, download receipts, and receive updates without calling the school.',
    availability: 'Always free for parents',
  },
};

function RolePanelVisual({
  role,
  variant = 'panel',
}: {
  role: RolePage;
  variant?: 'panel' | 'hero';
}) {
  const visualHeight = variant === 'hero' ? 'h-full min-h-[300px]' : 'h-52';

  if (role.slug === 'admins') {
    return (
      <div className={`group/visual relative mt-auto overflow-hidden border-t border-neutral-200 bg-[#fbfaf7] ${visualHeight}`}>
        <svg className="absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
          <defs>
            <pattern id="admin-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#e7e1d8" strokeWidth="1" />
            </pattern>
            <filter id="admin-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#29251f" floodOpacity="0.13" />
            </filter>
          </defs>
          <rect width="360" height="208" fill="url(#admin-grid)" />
          <path
            d="M54 150 C102 96 140 116 178 78 C216 40 258 54 307 26"
            fill="none"
            stroke="#f4d7a1"
            strokeWidth="9"
            strokeLinecap="round"
            className="transition-all duration-500 group-hover/visual:stroke-[#e0a020]"
          />
          <g filter="url(#admin-shadow)" className="origin-center transition-transform duration-500 group-hover/visual:-translate-y-2">
            <rect x="30" y="34" width="184" height="116" rx="15" fill="white" stroke="#d9d6cf" />
            <text x="48" y="58" fill="#292524" fontSize="12" fontWeight="700">Collection Health</text>
            {[42, 64, 88, 56, 96, 74, 86].map((height, index) => (
              <rect
                key={index}
                x={52 + index * 20}
                y={132 - height}
                width="10"
                height={height}
                rx="4"
                fill={index === 4 ? '#d97706' : '#d6a24b'}
                opacity={index === 4 ? '0.95' : '0.72'}
                className="transition-all duration-500 group-hover/visual:opacity-100"
              />
            ))}
          </g>
          <g filter="url(#admin-shadow)" className="origin-center transition-transform duration-500 group-hover/visual:translate-x-1 group-hover/visual:-translate-y-1">
            <rect x="168" y="112" width="156" height="66" rx="15" fill="white" stroke="#d9d6cf" />
            <text x="186" y="138" fill="#78716c" fontSize="11" fontWeight="700">Pending dues</text>
            <text x="280" y="138" fill="#b45309" fontSize="12" fontWeight="800">12%</text>
            <rect x="186" y="151" width="102" height="8" rx="4" fill="#f5f5f4" />
            <rect x="186" y="151" width="88" height="8" rx="4" fill="#d97706" />
          </g>
          <circle cx="307" cy="26" r="5" fill="#d97706" className="transition-transform duration-500 group-hover/visual:scale-125" />
        </svg>
      </div>
    );
  }

  if (role.slug === 'teachers') {
    return (
      <div className={`group/visual relative mt-auto overflow-hidden border-t border-neutral-200 bg-white ${visualHeight}`}>
        <svg className="absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
          <defs>
            <pattern id="teacher-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#d6dde8" />
            </pattern>
            <filter id="teacher-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#1c2a37" floodOpacity="0.13" />
            </filter>
          </defs>
          <rect width="360" height="208" fill="url(#teacher-dots)" />
          <g filter="url(#teacher-shadow)" className="transition-transform duration-500 group-hover/visual:-translate-y-2">
            <rect x="36" y="34" width="198" height="130" rx="16" fill="white" stroke="#d9d6cf" />
            <text x="56" y="60" fill="#292524" fontSize="12" fontWeight="800">Class 8-A</text>
            <rect x="184" y="44" width="34" height="18" rx="9" fill="#eff6ff" />
            <text x="193" y="57" fill="#0369a1" fontSize="9" fontWeight="800">Live</text>
            {[
              ['Present', '42', '#0284c7', 86],
              ['Late', '03', '#06b6d4', 46],
              ['Absent', '02', '#a8a29e', 30],
            ].map(([label, value, color, width], index) => (
              <g key={label} transform={`translate(56 ${84 + index * 28})`}>
                <circle cx="0" cy="0" r="5" fill={String(color)} />
                <text x="16" y="4" fill="#57534e" fontSize="11">{label}</text>
                <rect x="78" y="-6" width="92" height="8" rx="4" fill="#f5f5f4" />
                <rect x="78" y="-6" width={Number(width)} height="8" rx="4" fill={String(color)} opacity="0.75" className="transition-all duration-500 group-hover/visual:opacity-100" />
                <text x="178" y="4" fill="#292524" fontSize="12" fontWeight="800">{value}</text>
              </g>
            ))}
          </g>
          <g filter="url(#teacher-shadow)" className="transition-transform duration-500 group-hover/visual:translate-x-2 group-hover/visual:-translate-y-1">
            <rect x="194" y="128" width="132" height="46" rx="14" fill="white" stroke="#d9d6cf" />
            <path d="M215 151 h24 M227 139 v24" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
            <text x="252" y="154" fill="#292524" fontSize="12" fontWeight="800">Verified</text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`group/visual relative mt-auto overflow-hidden border-t border-neutral-200 bg-[#fbfdf9] ${visualHeight}`}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 360 208" aria-hidden="true">
        <defs>
          <pattern id="parent-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e4efe5" strokeWidth="1" />
          </pattern>
          <filter id="parent-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#1a372b" floodOpacity="0.13" />
          </filter>
        </defs>
        <rect width="360" height="208" fill="url(#parent-grid)" />
        <g filter="url(#parent-shadow)" className="transition-transform duration-500 group-hover/visual:-translate-y-2">
          <rect x="34" y="30" width="210" height="124" rx="18" fill="white" stroke="#d9d6cf" />
          <text x="54" y="56" fill="#292524" fontSize="12" fontWeight="800">Rahul Kad</text>
          <rect x="198" y="42" width="30" height="18" rx="9" fill="#ecfdf5" />
          <text x="207" y="55" fill="#047857" fontSize="9" fontWeight="800">Paid</text>
          <rect x="54" y="78" width="74" height="54" rx="12" fill="#f8faf8" />
          <text x="68" y="101" fill="#78716c" fontSize="9">Attendance</text>
          <text x="70" y="120" fill="#292524" fontSize="16" fontWeight="800">96%</text>
          <rect x="144" y="78" width="74" height="54" rx="12" fill="#f8faf8" />
          <text x="160" y="101" fill="#78716c" fontSize="9">Receipt</text>
          <text x="161" y="120" fill="#292524" fontSize="15" fontWeight="800">Ready</text>
        </g>
        <g filter="url(#parent-shadow)" className="transition-transform duration-500 group-hover/visual:translate-x-2 group-hover/visual:-translate-y-1">
          <rect x="168" y="132" width="158" height="48" rx="14" fill="white" stroke="#d9d6cf" />
          <circle cx="190" cy="156" r="8" fill="#10b981" />
          <path d="M186 156 l3 3 6 -7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="208" y="154" fill="#292524" fontSize="11" fontWeight="800">WhatsApp alert</text>
          <text x="208" y="168" fill="#78716c" fontSize="9">Receipt delivered</text>
        </g>
      </svg>
    </div>
  );
}

function RolePanels({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mt-10 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_22px_80px_rgba(32,29,25,0.08)] lg:mt-12">
      <div className="grid lg:grid-cols-3">
        {Object.values(rolePages).map((role, index) => {
          const Icon = role.icon;
          const panel = rolePanelCopy[role.slug];

          return (
            <Link
              key={role.slug}
              href={role.href}
              className={`group flex min-h-[585px] flex-col transition hover:bg-neutral-50/70 ${index > 0 ? 'border-t border-neutral-200 lg:border-l lg:border-t-0' : ''}`}
            >
              <div className="flex flex-1 flex-col p-7 md:p-8">
                <span className="w-fit rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm">
                  {panel.label}
                </span>

                <div className="mt-7 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                    <Icon className={`size-5 ${role.accent}`} />
                  </span>
                  <h3 className="text-2xl font-semibold tracking-normal text-neutral-950">
                    {role.title}
                  </h3>
                </div>

                <p className="mt-4 max-w-sm text-[15px] leading-7 text-neutral-700">
                  {compact ? role.description : panel.promise}
                </p>

                <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-950">
                  <CheckCircle2 className={`size-4 ${role.accent}`} />
                  {panel.availability}
                </p>
              </div>

              <RolePanelVisual role={role} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const rolePages: Record<RoleSlug, RolePage> = {
  admins: {
    slug: 'admins',
    href: '/for-admins',
    eyebrow: 'For school owners, principals, and admins',
    navLabel: 'For Admins',
    title: 'Admins',
    h1: 'School management software for admins in India',
    description:
      'Run admissions, fees, attendance, exams, certificates, documents, complaints, and notifications from one cloud dashboard built for Indian institutions.',
    metaTitle: 'School Management Software for Admins | Shiksha Cloud',
    metaDescription:
      'Admin dashboard for Indian schools. Manage fees, attendance, exams, documents, notices, certificates, complaints, and reports from one platform.',
    keywords: [
      'school management software for admins',
      'school admin dashboard',
      'school ERP for administrators',
      'school administration software India',
      'school fee management admin dashboard',
    ],
    accent: 'text-amber-700',
    soft: 'bg-amber-50',
    icon: ShieldCheck,
    primaryCta: 'See admin dashboard',
    proof: ['No setup fee', 'Multi-branch ready', 'Role-based access', 'Daily backups'],
    features: [
      {
        icon: UsersRound,
        title: 'Institution setup',
        description:
          'Configure organization details, academic years, grades, sections, subjects, teachers, and student batches.',
      },
      {
        icon: CreditCard,
        title: 'Fee command center',
        description:
          'Create fee categories, track dues, collect online payments, send reminders, and download audit-ready receipts.',
      },
      {
        icon: GraduationCap,
        title: 'Exam lifecycle',
        description:
          'Manage exam sessions, hall tickets, enrollment, marks, report cards, grading, and result publishing.',
      },
      {
        icon: Bell,
        title: 'Communication control',
        description:
          'Publish notices and configure WhatsApp, SMS, email, push, and in-app notifications by event.',
      },
      {
        icon: FileCheck2,
        title: 'Documents and certificates',
        description:
          'Verify student documents and generate official English or Marathi certificates in minutes.',
      },
      {
        icon: MessageSquareWarning,
        title: 'Complaint resolution',
        description:
          'Route anonymous complaints through a clear timeline from pending to resolved without exposing identity.',
      },
    ],
    outcomes: [
      { value: '24 hrs', label: 'typical setup time' },
      { value: 'Rs. 79', label: 'per student/month' },
      { value: '0', label: 'per-admin fees' },
    ],
    faq: [
      {
        question: 'Can admins manage multiple branches?',
        answer:
          'Yes. Shiksha Cloud is built for both single-campus and multi-branch institutions, with organization-level setup and role-based permissions.',
      },
      {
        question: 'Can we import students in bulk?',
        answer:
          'Yes. Admins can import student batches using CSV, which is useful during new academic year setup or migration from spreadsheets.',
      },
      {
        question: 'Does the admin dashboard support Indian fee structures?',
        answer:
          'Yes. Admins can create tuition, exam, lab, library, transport, and custom fee categories per academic year.',
      },
    ],
  },
  teachers: {
    slug: 'teachers',
    href: '/for-teachers',
    eyebrow: 'For teachers and class coordinators',
    navLabel: 'For Teachers',
    title: 'Teachers',
    h1: 'Teacher dashboard for attendance, exams, and class work',
    description:
      'Give teachers a focused workspace for attendance, class lists, document verification, notices, marks entry, hall ticket scanning, and leave requests.',
    metaTitle: 'Teacher Dashboard for Schools | Shiksha Cloud',
    metaDescription:
      'Teacher dashboard for Indian schools. Mark attendance, manage classes, verify documents, publish notices, enter marks, and track leave requests.',
    keywords: [
      'teacher dashboard for schools',
      'school attendance app for teachers',
      'teacher portal school management software',
      'marks entry software for teachers',
      'class teacher dashboard',
    ],
    accent: 'text-sky-700',
    soft: 'bg-sky-50',
    icon: BookOpenCheck,
    primaryCta: 'Explore teacher tools',
    proof: ['One-click attendance', 'Mobile friendly', 'Free for teachers', 'No training burden'],
    features: [
      {
        icon: CalendarDays,
        title: 'Digital attendance',
        description:
          'Mark present, absent, or late with a single click and view section-wise daily attendance summaries.',
      },
      {
        icon: UsersRound,
        title: 'Class management',
        description:
          'Access student lists, assigned grades, sections, subjects, and classroom details from one teacher dashboard.',
      },
      {
        icon: FileCheck2,
        title: 'Document verification',
        description:
          'Review student uploads like Aadhaar, TC, and birth certificate, then approve or reject with feedback.',
      },
      {
        icon: ClipboardCheck,
        title: 'Exam and result work',
        description:
          'Support exam setup, scan hall tickets, enter marks, and help publish report cards faster.',
      },
      {
        icon: Bell,
        title: 'Notice publishing',
        description:
          'Create and publish relevant notices for students and parents without waiting for manual circulars.',
      },
      {
        icon: FileText,
        title: 'Leave management',
        description:
          'Apply for leave, track status, and keep a complete approval timeline for school records.',
      },
    ],
    outcomes: [
      { value: '1 click', label: 'attendance marking' },
      { value: '0', label: 'teacher user fee' },
      { value: '100%', label: 'browser based' },
    ],
    faq: [
      {
        question: 'Can teachers mark attendance from mobile?',
        answer:
          'Yes. Shiksha Cloud is responsive and installable as a PWA, so teachers can mark attendance from mobile, tablet, or desktop.',
      },
      {
        question: 'Can teachers verify student documents?',
        answer:
          'Yes. Admins and class teachers receive upload notifications and can approve or reject documents with feedback.',
      },
      {
        question: 'Are teachers billed separately?',
        answer:
          'No. Teachers are always free. Shiksha Cloud charges only per enrolled student.',
      },
    ],
  },
  parents: {
    slug: 'parents',
    href: '/for-parents',
    eyebrow: 'For parents and guardians',
    navLabel: 'For Parents',
    title: 'Parents',
    h1: 'Parent portal for attendance, fees, notices, and receipts',
    description:
      'Keep parents informed without office calls. Parents can monitor attendance, pay fees, download receipts, read notices, and track complaints.',
    metaTitle: 'Parent Portal for Schools | Shiksha Cloud',
    metaDescription:
      'Parent portal for Indian schools with attendance alerts, online fee payments, WhatsApp receipts, notices, multi-child access, and complaint tracking.',
    keywords: [
      'parent portal for schools',
      'school parent app India',
      'parent teacher communication app',
      'attendance alerts for parents',
      'online fee payment parent portal',
    ],
    accent: 'text-emerald-700',
    soft: 'bg-emerald-50',
    icon: UsersRound,
    primaryCta: 'View parent portal',
    proof: ['WhatsApp alerts', 'Free for parents', 'Multi-child access', 'Instant receipts'],
    features: [
      {
        icon: CalendarDays,
        title: 'Attendance visibility',
        description:
          'Parents can view attendance history and receive instant alerts when a child is marked absent or late.',
      },
      {
        icon: CreditCard,
        title: 'Online fee payments',
        description:
          'Pay through UPI, cards, net banking, or wallets and access payment history anytime.',
      },
      {
        icon: ReceiptText,
        title: 'Instant receipts',
        description:
          'Receipts are generated automatically and delivered through WhatsApp, SMS, email, and download.',
      },
      {
        icon: Bell,
        title: 'Notices and announcements',
        description:
          'Parents receive priority notices, announcements, holiday updates, and school communication in real time.',
      },
      {
        icon: Smartphone,
        title: 'Multiple children',
        description:
          'One parent account can monitor multiple children across classes without separate logins.',
      },
      {
        icon: MessageSquareWarning,
        title: 'Anonymous complaints',
        description:
          'Parents can raise sensitive concerns privately and track status using a unique complaint ID.',
      },
    ],
    outcomes: [
      { value: '0', label: 'parent user fee' },
      { value: '24/7', label: 'receipt access' },
      { value: '5', label: 'notification channels' },
    ],
    faq: [
      {
        question: 'Do parents pay extra to use Shiksha Cloud?',
        answer:
          'No. Parents are always free. Schools pay only per enrolled student.',
      },
      {
        question: 'Can parents get WhatsApp fee receipts?',
        answer:
          'Yes. Receipts can be delivered through WhatsApp, SMS, and email, and remain available for download.',
      },
      {
        question: 'Can one parent manage multiple children?',
        answer:
          'Yes. A parent can access multiple child profiles from one account.',
      },
    ],
  },
};

export function getRolePage(slug: RoleSlug) {
  return rolePages[slug];
}

export function RoleLandingPage({ role }: { role: RolePage }) {
  const Icon = role.icon;

  return (
    <main className="bg-[#fbfaf7] text-neutral-950">
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto mb-5 w-fit rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 shadow-sm">
              {role.eyebrow}
            </p>
            <h1 className="text-balance font-serif text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
              {role.h1}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              {role.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {role.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-50"
              >
                View pricing
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {role.proof.map((item) => (
                <span key={item} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_22px_80px_rgba(32,29,25,0.08)]">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="flex flex-col p-8 md:p-10">
                <span className="w-fit rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm">
                  {role.navLabel}
                </span>
                <div className="mt-7 flex items-center gap-3">
                  <span className={`flex size-11 items-center justify-center rounded-xl ${role.soft}`}>
                    <Icon className={`size-5 ${role.accent}`} />
                  </span>
                  <h2 className="text-2xl font-semibold text-neutral-950">{role.title} workspace</h2>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-neutral-700">{role.features[0].description}</p>
                <p className="mt-6 flex items-center gap-2 text-[15px] font-semibold text-neutral-950">
                  <CheckCircle2 className={`size-4 ${role.accent}`} />
                  {role.proof[0]}
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {role.outcomes.map((outcome) => (
                    <div key={outcome.label} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="text-lg font-semibold text-neutral-950">{outcome.value}</p>
                      <p className="mt-1 text-[11px] leading-5 text-neutral-500">{outcome.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex min-h-full flex-col border-t border-neutral-200 lg:border-l lg:border-t-0">
                <div className="flex-1">
                  <RolePanelVisual role={role} variant="hero" />
                </div>
                <div className="grid border-t border-neutral-200 sm:grid-cols-3">
                  {role.features.slice(0, 3).map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={feature.title} className={`p-5 ${index > 0 ? 'border-t border-neutral-200 sm:border-l sm:border-t-0' : ''}`}>
                          <FeatureIcon className={`mb-3 size-5 ${role.accent}`} />
                          <p className="text-sm font-semibold text-neutral-950">{feature.title}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Role-specific features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-neutral-950 md:text-4xl">
              Everything {role.title.toLowerCase()} need, without extra software
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {role.features.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <FeatureIcon className={`mb-5 size-6 ${role.accent}`} />
                  <h3 className="text-lg font-semibold text-neutral-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-neutral-200 bg-white p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-neutral-950">Questions schools ask</h2>
          <div className="mt-6 divide-y divide-neutral-200">
            {role.faq.map((item) => (
              <div key={item.question} className="py-5">
                <h3 className="font-semibold text-neutral-950">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-neutral-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function RoleAudienceSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-serif text-4xl font-semibold leading-tight tracking-normal text-neutral-950 md:text-5xl">
          Get the most out of Shiksha.cloud for every role
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
          Admins run the institution, teachers manage daily classroom work, and parents stay connected without extra calls or paperwork.
        </p>
      </div>
      <RolePanels />
    </section>
  );
}

export function RoleHubPage() {
  return (
    <main className="bg-[#fbfaf7] py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="mx-auto mb-5 w-fit rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 shadow-sm">
          Shiksha.cloud by role
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-normal text-neutral-950 md:text-6xl">
          School management software for admins, teachers, and parents
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          Use this hub to find the right Shiksha.cloud workflow for each stakeholder in your institution.
        </p>
      </div>
      <RoleAudienceSection />
    </main>
  );
}
