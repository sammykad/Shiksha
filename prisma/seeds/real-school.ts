import 'dotenv/config';
import { Pool } from 'pg';
import { GuardianType, InstitutionType, OrganizationType, YearType, BillingMetric, BillingCycle, PricingMode, OfferType, SubscriptionStatus, Role, Gender, StudentStatus, AssignmentStatus, EvaluationType, ExamMode, ExamStatus, StudentExamStatus, PaymentMethod, PaymentStatus, FeeStatus, AttendanceStatus, Severity, ComplaintStatus, NoticeType, NoticePriority, NoticeStatus, DocumentType, ChequeStatus, RoundingRule, PointsMode, ResultStatus, NotificationType, NotificationChannel, NotificationStatus, EmploymentStatus, LeaveStatus, LeaveType, LeadStatus, LeadPriority, LeadSource, LeadActivityType, Sentiment, AIAgentRunFrequency, AIAgentExecutionStatus, CalendarEventType, IdCardOrientation, VehicleType, AiAgentStatus, InvoiceStatus, SubscriptionPaymentStatus, PaymentProvider, MembershipStatus } from '@/generated/prisma/enums';

/* ============================================================================
 *  SEED: Shree Gurukul Vidyalaya — Pune
 *  A realistic Indian school seed covering ALL schema models.
 *
 *  School:   Shree Gurukul Vidyalaya English Medium School
 *  Trust:    Shree Gurukul Shikshan Prasarak Mandal
 *  Location: Kothrud, Pune, Maharashtra
 *  AY:       1 June 2026 – 1 April 2027
 *
 *  This seed creates a complete, self-contained school with data across
 *  every model in prisma/schema.prisma. Run it standalone against an empty
 *  DB or after the existing seed — it uses fresh IDs.
 * ============================================================================ */

const pool = new Pool({ connectionString: process.env.DIRECT_URL! });

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

let _cid = 0;
function cuid(): string {
  _cid++;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return 'c' + ts + rand + _cid.toString(36).padStart(6, '0');
}

function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function picks<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function rngDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function phone(): string {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '88', '87', '86', '85', '84', '83', '82', '81', '80'];
  return `+91${pick(prefixes)}${String(rng(10000000, 99999999))}`;
}

function email(first: string, last: string, domain = 'gurukul.edu.in'): string {
  const key = Math.random().toString(36).substring(2, 6);
  return `${first.toLowerCase()}.${last.toLowerCase()}.${key}@${domain}`;
}

function pgArr(arr: string[]): string {
  return `{${arr.map(s => `"${s}"`).join(',')}}`;
}

function now(): string {
  return new Date().toISOString();
}

/* ─── Maharashtrian Name Pools ────────────────────────────────────────────── */

const MALE_NAMES = [
  'Aniket', 'Omkar', 'Siddharth', 'Vaibhav', 'Chinmay', 'Hrishikesh', 'Kedar',
  'Mandar', 'Nachiket', 'Pratik', 'Rohan', 'Sahil', 'Tejas', 'Vedant', 'Yash',
  'Atharv', 'Dhruv', 'Shubham', 'Amol', 'Gaurav', 'Ruturaj', 'Swapnil', 'Pranav',
  'Abhijit', 'Mangesh', 'Sagar', 'Amit', 'Nilesh', 'Dhananjay', 'Sameer',
];

const FEMALE_NAMES = [
  'Aditi', 'Anjali', 'Vaishnavi', 'Rutuja', 'Sayali', 'Tejaswini', 'Prajakta',
  'Mrunal', 'Suvarna', 'Swati', 'Ketaki', 'Mugdha', 'Devika', 'Tanvi', 'Ashwini',
  'Shreya', 'Neha', 'Pooja', 'Sneha', 'Priya', 'Janhavi', 'Ankita', 'Kavita',
  'Madhuri', 'Shubhangi', 'Pallavi', 'Supriya', 'Manisha', 'Dipti', 'Revati',
];

const LAST_NAMES = [
  'Patil', 'Deshmukh', 'Jadhav', 'More', 'Kulkarni', 'Joshi', 'Shinde', 'Pawar',
  'Kadam', 'Sawant', 'Gaikwad', 'Dhumal', 'Sathe', 'Phadke', 'Godbole', 'Mahajan',
  'Deshpande', 'Gokhale', 'Bapat', 'Kelkar', 'Apte', 'Modak', 'Paranjape', 'Mhatre',
  'Lotlikar', 'Dixit', 'Kulkarni', 'Gadgil', 'Bhide', 'Vaidya',
];

const CASTES = ['General', 'OBC', 'SC', 'ST', 'NT', 'VJ', 'SBC'];

const BLOOD_GROUPS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];

/* ─── Constants ───────────────────────────────────────────────────────────── */

const ACADEMIC_YEAR_START = new Date('2026-06-01T00:00:00Z');
const ACADEMIC_YEAR_END = new Date('2027-04-01T00:00:00Z');
const AY_LABEL = '2026-27';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

const SECTIONS_PER_GRADE: Record<string, string[]> = {
  'Grade 1': ['A', 'B'],
  'Grade 2': ['A', 'B'],
  'Grade 3': ['A', 'B'],
  'Grade 4': ['A', 'B'],
  'Grade 5': ['A', 'B'],
  'Grade 6': ['A', 'B', 'C'],
  'Grade 7': ['A', 'B', 'C'],
  'Grade 8': ['A', 'B'],
  'Grade 9': ['A', 'B'],
  'Grade 10': ['A', 'B'],
};

const STUDENTS_PER_SECTION: Record<string, number> = {
  'Grade 1': 20, 'Grade 2': 20, 'Grade 3': 20,
  'Grade 4': 20, 'Grade 5': 20, 'Grade 6': 18,
  'Grade 7': 18, 'Grade 8': 18, 'Grade 9': 15,
  'Grade 10': 15,
};

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  '1': ['English', 'Hindi', 'Marathi', 'Mathematics', 'EVS', 'Art', 'Physical Education'],
  '2': ['English', 'Hindi', 'Marathi', 'Mathematics', 'EVS', 'Art', 'Physical Education'],
  '3': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'],
  '4': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'],
  '5': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '6': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '7': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '8': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '9': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Information Technology', 'Physical Education'],
  '10': ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Information Technology', 'Physical Education'],
};

const FEE_BREAKDOWN: Record<string, { tuition: number; transport: number; exam: number; lab: number; development: number; library: number }> = {
  '1': { tuition: 24000, transport: 15000, exam: 2000, lab: 500, development: 3000, library: 1500 },
  '2': { tuition: 24000, transport: 15000, exam: 2000, lab: 500, development: 3000, library: 1500 },
  '3': { tuition: 26000, transport: 15000, exam: 2500, lab: 1000, development: 3500, library: 1500 },
  '4': { tuition: 28000, transport: 18000, exam: 2500, lab: 1500, development: 3500, library: 1500 },
  '5': { tuition: 30000, transport: 18000, exam: 3000, lab: 2000, development: 4000, library: 2000 },
  '6': { tuition: 34000, transport: 20000, exam: 3000, lab: 2500, development: 4000, library: 2000 },
  '7': { tuition: 36000, transport: 20000, exam: 3500, lab: 3000, development: 4500, library: 2000 },
  '8': { tuition: 38000, transport: 22000, exam: 3500, lab: 3000, development: 4500, library: 2500 },
  '9': { tuition: 42000, transport: 22000, exam: 4000, lab: 3500, development: 5000, library: 2500 },
  '10': { tuition: 45000, transport: 25000, exam: 5000, lab: 4000, development: 6000, library: 3000 },
};

const HOLIDAYS = [
  { name: 'Guru Purnima', start: '2026-07-29', end: '2026-07-29', reason: 'Guru Purnima' },
  { name: 'Independence Day', start: '2026-08-15', end: '2026-08-15', reason: 'National Holiday' },
  { name: 'Ganesh Chaturthi', start: '2026-09-15', end: '2026-09-17', reason: 'Festival Holidays' },
  { name: 'Gandhi Jayanti', start: '2026-10-02', end: '2026-10-02', reason: 'National Holiday' },
  { name: 'Dussehra', start: '2026-10-20', end: '2026-10-20', reason: 'Festival' },
  { name: 'Diwali Break', start: '2026-11-05', end: '2026-11-10', reason: 'Diwali Holidays' },
  { name: 'Christmas Break', start: '2026-12-25', end: '2026-12-31', reason: 'Winter Holidays' },
  { name: 'Republic Day', start: '2027-01-26', end: '2027-01-26', reason: 'National Holiday' },
  { name: 'Shivaji Jayanti', start: '2027-02-19', end: '2027-02-19', reason: 'Shivaji Maharaj Jayanti' },
  { name: 'Holi', start: '2027-03-22', end: '2027-03-23', reason: 'Holi Festival' },
  { name: 'Gudi Padwa', start: '2027-03-30', end: '2027-03-30', reason: 'Marathi New Year' },
];

const NOTICE_CONTENT = [
  {
    title: 'Annual Day Celebration 2027',
    summary: 'Annual Day function on 28th February 2027',
    content: 'Shree Gurukul Vidyalaya proudly invites all parents and students to the Annual Day Celebration on 28th February 2027 at 5:00 PM in the school auditorium. Chief Guest: Dr. Milind Sardesai (Educationist).',
    type: 'EVENT', priority: 'HIGH',
  },
  {
    title: 'Parent-Teacher Meeting - Term 1',
    summary: 'PTM scheduled for 22nd November 2026',
    content: 'Dear Parents, the Term 1 Parent-Teacher Meeting will be held on Sunday, 22nd November 2026 from 9:00 AM to 1:00 PM. All parents are requested to attend.',
    type: 'GENERAL', priority: 'HIGH',
  },
  {
    title: 'Winter Uniform Change',
    summary: 'Winter uniform mandatory from 1st November 2026',
    content: 'All students must switch to winter uniform from 1st November 2026. Boys: Navy blue blazer, grey trousers. Girls: Navy blue blazer, grey skirt/trousers.',
    type: 'GENERAL', priority: 'MEDIUM',
  },
  {
    title: 'Science Exhibition - Vidnyan 2027',
    summary: 'Science exhibition on 22nd January 2027',
    content: 'The Annual Science Exhibition "Vidnyan 2027" will be held on 22nd January 2027. Students from Grades 5-10 can participate with working models.',
    type: 'EVENT', priority: 'MEDIUM',
  },
  {
    title: 'Final Exam Schedule - March 2027',
    summary: 'Final examinations from 15th March 2027',
    content: 'Final examinations for Academic Year 2026-27 will commence from 15th March 2027. Detailed schedule has been uploaded to the student portal.',
    type: 'EXAM', priority: 'URGENT',
  },
  {
    title: 'Fee Payment Deadline - Q3',
    summary: 'Q3 fees due by 15th December 2026',
    content: 'This is a reminder that Q3 fee payments must be completed by 15th December 2026. Late payment penalty of ₹100/day will apply after the deadline.',
    type: 'DEADLINE', priority: 'HIGH',
  },
  {
    title: 'Sports Day 2026',
    summary: 'Annual Sports Day on 26th December 2026',
    content: 'Shree Gurukul Vidyalaya Annual Sports Day will be held on 26th December 2026 at the Shiv Chhatrapati Sports Complex. Students are to report at 7:00 AM.',
    type: 'EVENT', priority: 'MEDIUM',
  },
  {
    title: 'Maharashtra Day Celebration',
    summary: 'Maharashtra Day on 1st May 2027',
    content: 'School will celebrate Maharashtra Day on 1st May 2027 with cultural programs showcasing Marathi heritage.',
    type: 'EVENT', priority: 'LOW',
  },
];

const EXAM_SESSIONS = [
  { title: 'Unit Test 1', start: '2026-08-10', end: '2026-08-14' },
  { title: 'Unit Test 2', start: '2026-10-12', end: '2026-10-16' },
  { title: 'Term 1 Examination', start: '2026-11-30', end: '2026-12-11' },
  { title: 'Preliminary Exam', start: '2027-02-08', end: '2027-02-19' },
  { title: 'Final Examination', start: '2027-03-15', end: '2027-03-31' },
];

/* ─── Main Seed ───────────────────────────────────────────────────────────── */

async function main() {
  console.log('\n🏫 ============================================');
  console.log('🏫  Shree Gurukul Vidyalaya — Full Seed');
  console.log('🏫 ============================================\n');

  console.log('🔍 Checking for existing shared records...\n');

  async function findOrCreateUser(first: string, last: string, email: string): Promise<string> {
    const existing = await pool.query(`SELECT id FROM "User" WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      console.log(`   ↳ Existing user: ${email}`);
      return existing.rows[0].id;
    }
    const id = `user_${cuid()}`;
    await pool.query(`INSERT INTO "User" (id,email,"firstName","lastName",name,image,"emailVerified","isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, email, first, last, `${first} ${last}`, '', true, true, $now, $now]);
    return id;
  }

  async function findOrCreatePlan(code: string, name: string, desc: string, _metric: string, _mPrice: number, _aPrice: number, _limit: number): Promise<string> {
    const existing = await pool.query(`SELECT id FROM "Plan" WHERE code = $1`, [code]);
    if (existing.rows.length > 0) return existing.rows[0].id;
    const id = cuid();
    await pool.query(`INSERT INTO "Plan" (id,code,name,description,"billingMetric","monthlyPrice","annualPrice","studentLimit","isPublic","isActive","sortOrder","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, code, name, desc, _metric, _mPrice, _aPrice, _limit, true, true, 30, $now, $now]);
    return id;
  }

  const $now = now();
  const ts = (d: string | Date) => new Date(d).toISOString();

  /* =====================================================================
   *  0 — CREATE USERS
   * ===================================================================== */
  console.log('👤 Creating Users...');
  const users: { id: string; first: string; last: string; email: string }[] = [];

  async function makeUser(first: string, last: string, email: string) {
    const id = await findOrCreateUser(first, last, email);
    const u = { id, first, last, email };
    users.push(u);
    return u;
  }

  // Owner / Super Admin
  const owner = await makeUser('Sameer', 'Kad', 'sameerkad2001@gmail.com');
  // Principal / Admin
  const principal = await makeUser('Aniket', 'Dhumal', email('aniket', 'dhumal', 'gurukul.edu.in'));

  console.log(`   ✅ ${users.length} users ready\n`);

  // ── Generate unique slugs ──────────────────────────────────────────
  const uidSuffix = cuid().substring(0, 6);

  /* =====================================================================
   *  1 — INSTITUTION (Trust)
   * ===================================================================== */
  console.log('🏛️ Creating Institution...');
  const institutionId = cuid();
  const instSlug = `gurukul-trust-${uidSuffix}`;
  await pool.query(`INSERT INTO "Institution" (id,name,slug,description,type,"contactEmail","contactPhone",website,address,city,state,"pinCode","ownerId","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
    institutionId, 'Shree Gurukul Shikshan Prasarak Mandal', instSlug,
    'A charitable educational trust dedicated to quality education in Maharashtra since 2000. Runs multiple educational institutions across Pune district.',
    InstitutionType.TRUST, 'trust@gurukul.edu.in', '+912012345001', 'https://gurukultrust.edu.in',
    'Shree Gurukul Bhavan, 222/B, Karve Road, Kothrud', 'Pune', 'Maharashtra', '411038',
    owner.id, $now, $now,
  ]);
  console.log('   ✅ Trust: Shree Gurukul Shikshan Prasarak Mandal\n');

  /* =====================================================================
   *  2 — ORGANIZATION (School)
   * ===================================================================== */
  console.log('🏫 Creating Organization...');
  const orgId = `org_${cuid()}`;
  const orgSlug = `gurukul-vidyalaya-${uidSuffix}`;
  await pool.query(`INSERT INTO "Organization" (id,name,slug,"institutionId","contactEmail","contactPhone",website,"isActive","walletBalance","organizationType","establishedYear","createdBy",metadata,"createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
    orgId, 'Shree Gurukul Vidyalaya English Medium School', orgSlug,
    institutionId, 'admin@gurukul.edu.in', '+912012345002', 'https://www.gurukulvidyalaya.edu.in',
    true, 10000, OrganizationType.SCHOOL, 2005, owner.id,
    JSON.stringify({ affiliation: 'CBSE', board: 'CBSE', principal: 'Aniket Dhumal', medium: 'English', established: 2005 }),
    $now, $now,
  ]);
  console.log('   ✅ School: Shree Gurukul Vidyalaya English Medium School, Kothrud, Pune\n');

  /* =====================================================================
   *  3 — ACADEMIC YEAR (June 2026 – April 2027)
   * ===================================================================== */
  console.log('📅 Creating Academic Year...');
  const ayId = cuid();
  await pool.query(`INSERT INTO "AcademicYear" (id,"organizationId",name,"startDate","endDate",type,"isCurrent",description,"createdBy","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
    ayId, orgId, AY_LABEL, ts(ACADEMIC_YEAR_START), ts(ACADEMIC_YEAR_END),
    YearType.ANNUAL, true,
    `Academic Year ${AY_LABEL} (June 2026 - April 2027) — Starting from June as per new education policy guidelines.`,
    owner.id, $now, $now,
  ]);
  console.log(`   ✅ Academic Year: ${AY_LABEL}\n`);

  /* =====================================================================
   *  4 — PLAN + OFFER + SUBSCRIPTION (Pricing/Billing)
   * ===================================================================== */
  console.log('💰 Creating Plans & Subscription...');
  const planId = await findOrCreatePlan('SCALE', 'Scale',
    'For colleges, trusts, and multi-branch education groups needing priority support.',
    BillingMetric.STUDENT, 19, 182, 3000);

  // Offer — check if exists first
  let offerId: string;
  const existingOffer = await pool.query(`SELECT id FROM "Offer" WHERE code = $1`, ['SCHOOL_OPENING_2026']);
  if (existingOffer.rows.length > 0) {
    offerId = existingOffer.rows[0].id;
  } else {
    offerId = cuid();
    await pool.query(`INSERT INTO "Offer" (id,code,name,type,"discountPercent","fixedPrice","trialDays","maxRedemptions","redeemedCount","startsAt","endsAt","isActive","description","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
      offerId, 'SCHOOL_OPENING_2026', 'School Opening Season 2026', OfferType.EARLY_BIRD,
      65, null, 90, 500, 1, ts(new Date('2026-01-01')), ts(new Date('2026-12-31')),
      true, 'Special school opening season discount — 65% off on Scale plan. Valid for first 500 schools.', $now, $now,
    ]);
  }

  const subId = cuid();
  await pool.query(`INSERT INTO "Subscription" (id,"organizationId","planId","offerId","pricingMode",status,"billingCycle","billingMetric",price,"unitPrice","customPrice","studentLimit","studentCount","currentPeriodStart","currentPeriodEnd","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [
    subId, orgId, planId, offerId, PricingMode.PLAN_BASED, SubscriptionStatus.ACTIVE, BillingCycle.MONTHLY, BillingMetric.STUDENT,
    19, null, null, 3000, 0,
    ts(ACADEMIC_YEAR_START), ts(new Date('2027-06-01')), $now, $now,
  ]);
  console.log('   ✅ Plan: SCALE, Subscription active\n');

  // PricingSlab (for CUSTOM_SLAB mode example)
  await pool.query(`INSERT INTO "PricingSlab" (id,"subscriptionId","minStudents","maxStudents","pricePerStudent","billingCycle","createdAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
    cuid(), subId, 1, 100, 25, BillingCycle.MONTHLY, $now,
  ]);
  await pool.query(`INSERT INTO "PricingSlab" (id,"subscriptionId","minStudents","maxStudents","pricePerStudent","billingCycle","createdAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
    cuid(), subId, 101, 500, 20, BillingCycle.MONTHLY, $now,
  ]);
  await pool.query(`INSERT INTO "PricingSlab" (id,"subscriptionId","minStudents","maxStudents","pricePerStudent","billingCycle","createdAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
    cuid(), subId, 501, null, 15, 'MONTHLY', $now,
  ]);
  console.log('   ✅ Pricing slab created\n');

  /* =====================================================================
  *  5 — MEMBERSHIPS (Admin / Owner) + ACCOUNTS + VERIFICATIONS
  * ===================================================================== */
  console.log('🔑 Creating Memberships...');

  const allAdmins = [owner, principal];
  for (const u of allAdmins) {
    try {
      await pool.query(`INSERT INTO "Membership" (id,"userId","organizationId",role,status,"createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [cuid(), u.id, orgId, Role.ADMIN, MembershipStatus.ACTIVE, $now, $now]);
    } catch { } // already a member
  }

  // Accounts for BetterAuth (credential provider)
  for (const u of allAdmins) {
    const existing = await pool.query(`SELECT id FROM "Account" WHERE "providerId"=$1 AND "accountId"=$2`, ['credential', u.email]);
    if (existing.rows.length === 0) {
      await pool.query(`INSERT INTO "Account" (id,"userId","providerId","accountId","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [cuid(), u.id, 'credential', u.email, $now, $now]);
    }
  }

  // Email verifications
  for (const u of allAdmins) {
    const existing = await pool.query(`SELECT id FROM "Verification" WHERE identifier=$1`, [u.email]);
    if (existing.rows.length === 0) {
      await pool.query(`INSERT INTO "Verification" (id,identifier,value,"expiresAt","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [cuid(), u.email, u.email, ts(new Date('2030-01-01')), $now, $now]);
    }
  }

  console.log('   ✅ Admin memberships + accounts created\n');

  /* =====================================================================
   *  6 — GRADING SCALE + BANDS (CBSE Style)
   * ===================================================================== */
  console.log('📊 Creating Grading Scale...');
  const scaleId = cuid();
  await pool.query(`INSERT INTO "GradingScale" (id,name,"organizationId","isDefault",rounding,"passThreshold","pointsMode","allowGrace","maxGraceMarks","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
    scaleId, 'CBSE Secondary & Senior Secondary Grading', orgId, true, RoundingRule.NEAREST, 33.0, PointsMode.GPA, true, 3, $now, $now,
  ]);

  const bands = [
    ['A1', 91, 100, 10, 'Outstanding'],
    ['A2', 81, 90, 9, 'Excellent'],
    ['B1', 71, 80, 8, 'Very Good'],
    ['B2', 61, 70, 7, 'Good'],
    ['C1', 51, 60, 6, 'Above Average'],
    ['C2', 41, 50, 5, 'Average'],
    ['D', 33, 40, 4, 'Below Average'],
    ['E', 0, 32, 0, 'Need Improvement'],
  ];
  for (const [label, min, max, pts, desc] of bands) {
    await pool.query(`INSERT INTO "GradeBand" (id,"gradingScaleId",label,"minPercentage","maxPercentage",points,description)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [cuid(), scaleId, label, min, max, pts, desc]);
  }
  console.log('   ✅ CBSE Grading Scale with 8 bands\n');

  /* =====================================================================
   *  7 — GRADES
   * ===================================================================== */
  console.log('📚 Creating Grades...');
  const gradeMap: Record<string, string> = {};
  for (const g of GRADES) {
    const id = cuid();
    await pool.query(`INSERT INTO "Grade" (id,grade,"organizationId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5)`,
      [id, g, orgId, $now, $now]);
    gradeMap[g] = id;
  }
  console.log(`   ✅ ${GRADES.length} Grades created\n`);

  /* =====================================================================
   *  8 — SUBJECTS
   * ===================================================================== */
  console.log('📖 Creating Subjects...');
  const subjectMap: Record<string, Record<string, string>> = {};
  for (const g of GRADES) {
    const num = g.replace('Grade ', '');
    const subs = SUBJECTS_BY_GRADE[num] || [];
    subjectMap[g] = {};
    for (const s of subs) {
      const id = cuid();
      const code = `${num}${s.substring(0, 3).toUpperCase()}`;
      await pool.query(`INSERT INTO "Subject" (id,name,code,description,"organizationId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, s, code, `${s} for ${g} — CBSE curriculum`, orgId, $now, $now]);
      subjectMap[g][s] = id;
    }
  }
  console.log('   ✅ Subjects created\n');

  /* =====================================================================
   *  9 — SECTIONS
   * ===================================================================== */
  console.log('🏠 Creating Sections...');
  const sectionMap: Record<string, Record<string, string>> = {};
  for (const g of GRADES) {
    const secs = SECTIONS_PER_GRADE[g] || ['A'];
    sectionMap[g] = {};
    for (const s of secs) {
      const id = cuid();
      await pool.query(`INSERT INTO "Section" (id,name,"gradeId","organizationId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, s, gradeMap[g], orgId, $now, $now]);
      sectionMap[g][s] = id;
    }
  }
  console.log('   ✅ Sections created\n');

  /* =====================================================================
   *  10 — TEACHERS + PROFILES + BANK ACCOUNTS
   * ===================================================================== */
  console.log('👨‍🏫 Creating Teachers...');
  const teacherList: { id: string; userId: string; first: string; last: string }[] = [];
  const TEACHER_COUNT = 28;

  for (let i = 0; i < TEACHER_COUNT; i++) {
    const isMale = Math.random() > 0.45;
    const first = isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const last = pick(LAST_NAMES);
    const uid = `user_${cuid()}`;
    const tid = cuid();
    const joined = rngDate(new Date('2015-04-01'), new Date('2025-06-01'));

    await pool.query(`INSERT INTO "User" (id,email,"firstName","lastName",name,image,"emailVerified","isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [uid, email(first, last), first, last, `${first} ${last}`, '', true, true, $now, $now]);

    await pool.query(`INSERT INTO "Teacher" (id,"userId","employeeCode","organizationId","employmentStatus","isActive","joinedAt","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [tid, uid, `GUR-TCH-${String(i + 1).padStart(3, '0')}`, orgId, EmploymentStatus.ACTIVE, true, ts(joined), $now, $now]);

    // Profile
    const qual = pick(['B.Ed', 'M.Ed', 'B.Sc B.Ed', 'M.Sc B.Ed', 'BA B.Ed', 'MA B.Ed', 'B.Com B.Ed', 'MBA']);
    const exp = rng(3, 22);
    const langs = pick([['English', 'Hindi', 'Marathi'], ['English', 'Marathi'], ['English', 'Hindi', 'Marathi', 'Sanskrit']]);
    const addr = pick(['22, Kothrud Depot Road', '45, Mayur Colony', '78, Vanaz Corner', '12, Paud Road', '89, Karve Nagar', '34, Warje']);
    const homeCity = pick(['Pune', 'Mumbai', 'Nashik', 'Satara', 'Kolhapur', 'Sangli']);

    await pool.query(`INSERT INTO "TeacherProfile" (id,"teacherId","contactEmail","contactPhone",address,city,state,"dateOfBirth",qualification,"experienceInYears","resumeUrl","joinedAt",bio,"teachingPhilosophy","specializedSubjects","preferredGrades","idProofUrl","languagesKnown","certificateUrls")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`, [
      cuid(), tid, email(first, last), phone(),
      `${addr}, ${homeCity}`, homeCity, 'Maharashtra',
      ts(rngDate(new Date('1978-01-01'), new Date('1995-12-31'))),
      qual, exp, '', ts(joined),
      `Passionate ${pick(['English', 'Mathematics', 'Science', 'Marathi', 'Social Studies'])} teacher with ${exp} years of experience.`,
      'Believes in experiential learning and holistic student development.',
      pgArr(picks(['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education', 'EVS'], rng(1, 3))),
      pgArr(picks(GRADES, rng(2, 5))),
      '', pgArr(langs), '[]',
    ]);

    // Membership
    await pool.query(`INSERT INTO "Membership" (id,"userId","organizationId",role,status,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7)`, [cuid(), uid, orgId, Role.TEACHER, MembershipStatus.ACTIVE, $now, $now]);

    teacherList.push({ id: tid, userId: uid, first, last });

    // Bank account for ~70% of teachers
    if (Math.random() < 0.7) {
      const banks = ['State Bank of India', 'Bank of Maharashtra', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Union Bank of India'];
      const bank = pick(banks);
      await pool.query(`INSERT INTO "TeacherBankAccount" (id,"teacherId","accountHolderName","bankName","accountNumber","ifscCode","branchName","upiId","panNumber","isActive","organizationId","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
        cuid(), tid, `${first} ${last}`, bank,
        `${rng(10000000001, 99999999999)}`, `${bank === 'State Bank of India' ? 'SBIN' : bank === 'Bank of Maharashtra' ? 'MAHB' : bank === 'HDFC Bank' ? 'HDFC' : 'ICIC'}000${rng(1000, 9999)}`,
        pick(['Kothrud Branch', 'Deccan Gymkhana', 'Shivajinagar', 'FC Road']),
        `${first.toLowerCase()}.${last.toLowerCase()}@${pick(['okhdfcbank', 'oksbi', 'paytm'])}`,
        `${pick(['ABCDE', 'PQRST', 'XYZAB'])}${rng(1000, 9999)}`,
        true, orgId, $now, $now,
      ]);
    }
  }

  // ─┬─ Custom Teacher: Vaishnavi Raykar ──────────────────────────────────
  const vaishnaviUid = await findOrCreateUser('Vaishnavi', 'Raykar', 'vaishnaviraykar768@gmail.com');

  let vaishnaviTid = (await pool.query(`SELECT id FROM "Teacher" WHERE "userId"=$1 AND "organizationId"=$2`, [vaishnaviUid, orgId])).rows[0]?.id;
  if (!vaishnaviTid) {
    vaishnaviTid = cuid();
    await pool.query(`INSERT INTO "Teacher" (id,"userId","employeeCode","organizationId","employmentStatus","isActive","joinedAt","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [vaishnaviTid, vaishnaviUid, 'GUR-TCH-SPCL', orgId, 'ACTIVE', true, ts(new Date('2024-06-01')), $now, $now]);
    await pool.query(`INSERT INTO "TeacherProfile" (id,"teacherId","contactEmail","contactPhone",address,city,state,"dateOfBirth",qualification,"experienceInYears","resumeUrl","joinedAt",bio,"teachingPhilosophy","specializedSubjects","preferredGrades","idProofUrl","languagesKnown","certificateUrls")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`, [
      cuid(), vaishnaviTid, 'vaishnaviraykar768@gmail.com', '+919876543200',
      '12, Baner Road, Pune', 'Pune', 'Maharashtra',
      ts(new Date('1994-05-12')), 'M.Sc B.Ed', 6, '', ts(new Date('2024-06-01')),
      'Passionate Science teacher with 6 years of experience in teaching secondary grades.',
      'Believes in hands-on learning and practical experiments.',
      pgArr(['Science', 'Mathematics']), pgArr(['Grade 8', 'Grade 9', 'Grade 10']),
      '', pgArr(['English', 'Hindi', 'Marathi']), '[]',
    ]);
    await pool.query(`INSERT INTO "Membership" (id,"userId","organizationId",role,status,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7)`, [cuid(), vaishnaviUid, orgId, Role.TEACHER, MembershipStatus.ACTIVE, $now, $now]);
  }
  teacherList.push({ id: vaishnaviTid, userId: vaishnaviUid, first: 'Vaishnavi', last: 'Raykar' });
  // ─────────────────────────────────────────────────────────────────────────

  console.log(`   ✅ ${TEACHER_COUNT + 1} Teachers created (incl. Vaishnavi Raykar)\n`);

  /* =====================================================================
   *  11 — TEACHING ASSIGNMENTS
   * ===================================================================== */
  console.log('📋 Creating Teaching Assignments...');
  let assignCount = 0;
  for (const g of GRADES) {
    const num = g.replace('Grade ', '');
    const subs = SUBJECTS_BY_GRADE[num] || [];
    const secs = SECTIONS_PER_GRADE[g] || ['A'];
    for (const s of subs) {
      for (const sec of secs) {
        const teacher = pick(teacherList);
        try {
          await pool.query(`INSERT INTO "TeachingAssignment" (id,"academicYearId","organizationId","teacherId","subjectId","gradeId","sectionId",status,"createdAt","updatedAt")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
            cuid(), ayId, orgId, teacher.id, subjectMap[g][s], gradeMap[g], sectionMap[g][sec],
            'ASSIGNED', $now, $now,
          ]);
          assignCount++;
        } catch { }
      }
    }
  }
  // Assign class teachers
  let cti = 0;
  for (const g of GRADES) {
    const secs = SECTIONS_PER_GRADE[g] || ['A'];
    for (const s of secs) {
      const ct = teacherList[cti % teacherList.length];
      await pool.query(`UPDATE "Section" SET "classTeacherId" = $1 WHERE id = $2`,
        [ct.id, sectionMap[g][s]]);
      cti++;
    }
  }
  console.log(`   ✅ ${assignCount} Teaching Assignments + class teachers set\n`);

  /* =====================================================================
   *  12 — STUDENTS + PARENTS
   * ===================================================================== */
  console.log('👨‍🎓 Creating Students & Parents...');
  const studentList: { id: string; userId: string; gradeId: string; sectionId: string; gradeName: string; sectionName: string; firstName: string; lastName: string; isMale: boolean }[] = [];
  const parentList: { id: string; userId: string | null }[] = [];

  for (const g of GRADES) {
    const num = parseInt(g.replace('Grade ', ''));
    const secs = SECTIONS_PER_GRADE[g] || ['A'];
    const perSec = STUDENTS_PER_SECTION[g] || 15;

    for (const sec of secs) {
      for (let i = 1; i <= perSec; i++) {
        const isMale = Math.random() > 0.48;
        const first = isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
        const last = pick(LAST_NAMES);
        const uid = `user_${cuid()}`;
        const sid = cuid();
        const dobYear = 2026 - (num + 5);
        const dob = ts(new Date(dobYear, rng(0, 11), rng(1, 28)));
        const roll = `${num}${sec}${String(i).padStart(2, '0')}`;
        const addrNum = pick([12, 45, 78, 23, 56, 89, 34, 67]);
        const addrStreet = pick(['MG Road, Kothrud', 'Karve Road', 'Paud Phata', 'Warje Junction', 'Sinhagad Road', 'Bharati Vidyapeeth Road', 'Dhayari', 'Nanded Village']);
        const caste = pick(CASTES);

        await pool.query(`INSERT INTO "User" (id,email,"firstName","lastName",name,image,"emailVerified","isActive","createdAt","updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [uid, email(first, last, 'gurukul.edu.in'), first, last, `${first} ${last}`, '', false, true, $now, $now]);

        // Parent (1 parent per student for simplicity — ~50% Father, ~50% Mother)
        const pIsMale = Math.random() > 0.5;
        const pFirst = pIsMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
        const pLink = pIsMale ? GuardianType.FATHER : GuardianType.MOTHER;
        const pEmail = email(pFirst, last, 'gmail.com');
        const pPhone = phone();
        const pId = cuid();

        await pool.query(`INSERT INTO "Parent" (id,"organizationId","userId","firstName","lastName",email,"phoneNumber","whatsAppNumber","createdAt","updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [pId, orgId, null, pFirst, last, pEmail, pPhone, pPhone, $now, $now]);

        await pool.query(`INSERT INTO "Student" (id,"userId","organizationId","gradeId","sectionId","firstName","lastName","fullName","motherName","dateOfBirth","bloodGroup",address,"caste","subCaste","rollNumber","phoneNumber","whatsAppNumber",email,"emergencyContact",gender,status,"admissionDate","createdAt","updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`, [
          sid, uid, orgId, gradeMap[g], sectionMap[g][sec],
          first, last, `${first} ${last}`, pick(FEMALE_NAMES),
          dob, pick(BLOOD_GROUPS),
          `${addrNum}, ${addrStreet}, Pune, Maharashtra`,
          caste, '', roll, phone(), phone(), email(first, last, 'gmail.com'),
          pPhone, isMale ? 'MALE' : 'FEMALE', 'ACTIVE',
          ts(rngDate(new Date('2026-03-15'), new Date('2026-05-31'))),
          $now, $now,
        ]);

        await pool.query(`INSERT INTO "ParentStudent" (id,"studentId","parentId",relationship,"isPrimary")
          VALUES ($1,$2,$3,$4,$5)`, [cuid(), sid, pId, pLink, true]);

        await pool.query(`INSERT INTO "Membership" (id,"userId","organizationId",role,status,"createdAt","updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7)`, [cuid(), uid, orgId, 'STUDENT', 'ACTIVE', $now, $now]);

        studentList.push({ id: sid, userId: uid, gradeId: gradeMap[g], sectionId: sectionMap[g][sec], gradeName: g, sectionName: sec, firstName: first, lastName: last, isMale });
        parentList.push({ id: pId, userId: null });
      }
    }
  }
  console.log(`   ✅ ${studentList.length} Students + ${parentList.length} Parents created\n`);

  // ─┬─ Custom Parent: Palavi Trust + Student: Dev Sammy Kad ────────────
  const palaviUserId = await findOrCreateUser('Palavi', 'Trust', 'trustpalavi@gmail.com');
  let palaviParentId = (await pool.query(`SELECT id FROM "Parent" WHERE "userId"=$1 AND "organizationId"=$2`, [palaviUserId, orgId])).rows[0]?.id;
  if (!palaviParentId) {
    palaviParentId = cuid();
    await pool.query(`INSERT INTO "Parent" (id,"organizationId","userId","firstName","lastName",email,"phoneNumber","whatsAppNumber","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [palaviParentId, orgId, palaviUserId, 'Palavi', 'Trust', 'trustpalavi@gmail.com', '+919876543001', '+919876543001', $now, $now]);
  }

  const sammyUid = await findOrCreateUser('Dev', 'Sammy', 'devsammykad@gmail.com');
  let sammySid = (await pool.query(`SELECT id FROM "Student" WHERE "userId"=$1 AND "organizationId"=$2`, [sammyUid, orgId])).rows[0]?.id;
  if (!sammySid) {
    sammySid = cuid();
    await pool.query(`INSERT INTO "Student" (id,"userId","organizationId","gradeId","sectionId","firstName","lastName","fullName","motherName","dateOfBirth","bloodGroup",address,"caste","subCaste","rollNumber","phoneNumber","whatsAppNumber",email,"emergencyContact",gender,status,"admissionDate","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`, [
      sammySid, sammyUid, orgId, gradeMap['Grade 3'], sectionMap['Grade 3']['A'],
      'Dev', 'Sammy', 'Dev Sammy', 'Palavi',
      ts(new Date('2018-08-15')), 'A_POSITIVE',
      '22, Baner Road, Pune, Maharashtra',
      'General', '', '3A-SPCL', '+919876543002', '+919876543002', 'devsammykad@gmail.com',
      '+919876543001', 'MALE', 'ACTIVE',
      ts(new Date('2026-04-01')), $now, $now,
    ]);
  }

  // Link parent-student (idempotent)
  const linkExists = await pool.query(`SELECT id FROM "ParentStudent" WHERE "studentId"=$1 AND "parentId"=$2`, [sammySid, palaviParentId]);
  if (linkExists.rows.length === 0) {
    await pool.query(`INSERT INTO "ParentStudent" (id,"studentId","parentId",relationship,"isPrimary")
      VALUES ($1,$2,$3,$4,$5)`, [cuid(), sammySid, palaviParentId, GuardianType.MOTHER, true]);
  }

  // Memberships (idempotent)
  for (const [uid, role] of [[palaviUserId, 'PARENT'], [sammyUid, 'STUDENT']] as const) {
    const memExists = await pool.query(`SELECT id FROM "Membership" WHERE "userId"=$1 AND "organizationId"=$2`, [uid, orgId]);
    if (memExists.rows.length === 0) {
      await pool.query(`INSERT INTO "Membership" (id,"userId","organizationId",role,status,"createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7)`, [cuid(), uid, orgId, role, 'ACTIVE', $now, $now]);
    }
  }

  // Accounts & Verifications for Better Auth credential login
  for (const [uid, email] of [[vaishnaviUid, 'vaishnaviraykar768@gmail.com'], [palaviUserId, 'trustpalavi@gmail.com'], [sammyUid, 'devsammykad@gmail.com']]) {
    const acctExists = await pool.query(`SELECT id FROM "Account" WHERE "providerId"=$1 AND "accountId"=$2`, ['credential', email]);
    if (acctExists.rows.length === 0) {
      await pool.query(`INSERT INTO "Account" (id,"userId","providerId","accountId","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6)`, [cuid(), uid, 'credential', email, $now, $now]);
    }
    const verExists = await pool.query(`SELECT id FROM "Verification" WHERE identifier=$1`, [email]);
    if (verExists.rows.length === 0) {
      await pool.query(`INSERT INTO "Verification" (id,identifier,value,"expiresAt","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6)`, [cuid(), email, email, ts(new Date('2030-01-01')), $now, $now]);
    }
  }

  studentList.push({ id: sammySid, userId: sammyUid, gradeId: gradeMap['Grade 3'], sectionId: sectionMap['Grade 3']['A'], gradeName: 'Grade 3', sectionName: 'A', firstName: 'Dev', lastName: 'Sammy', isMale: true });
  parentList.push({ id: palaviParentId, userId: palaviUserId });
  // ─────────────────────────────────────────────────────────────────────────

  /* =====================================================================
   *  13 — FEE CATEGORIES + FEES
   * ===================================================================== */
  console.log('💰 Creating Fee Categories & Fee Records...');
  const feeCats = [
    { name: 'Tuition Fee', desc: 'Annual tuition fee for academic year 2026-27' },
    { name: 'Transport Fee', desc: 'School bus transportation charges' },
    { name: 'Examination Fee', desc: 'Term-wise examination fees' },
    { name: 'Science Lab Fee', desc: 'Science & computer lab charges' },
    { name: 'Development Fee', desc: 'Building & infrastructure development' },
    { name: 'Library Fee', desc: 'Digital & physical library access' },
  ];
  const feeCatMap: Record<string, string> = {};
  for (const fc of feeCats) {
    const id = cuid();
    await pool.query(`INSERT INTO "FeeCategory" (id,name,description,"organizationId","academicYearId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, fc.name, fc.desc, orgId, ayId, $now, $now]);
    feeCatMap[fc.name] = id;
  }

  let feeCount = 0;
  for (const st of studentList) {
    const num = st.gradeName.replace('Grade ', '');
    const fs = FEE_BREAKDOWN[num] || FEE_BREAKDOWN['1'];

    const feeTypes: { cat: string; amount: number; due: string; skip?: boolean }[] = [
      { cat: 'Tuition Fee', amount: fs.tuition, due: '2026-06-15' },
      { cat: 'Transport Fee', amount: fs.transport, due: '2026-06-15', skip: Math.random() < 0.35 },
      { cat: 'Examination Fee', amount: fs.exam, due: '2026-08-01' },
      { cat: 'Science Lab Fee', amount: fs.lab, due: '2026-07-01', skip: parseInt(num) < 4 || Math.random() < 0.2 },
      { cat: 'Development Fee', amount: fs.development, due: '2026-09-01' },
      { cat: 'Library Fee', amount: fs.library, due: '2026-07-15' },
    ];

    for (const ft of feeTypes) {
      if (ft.skip) continue;
      const isPaid = Math.random() > 0.3;
      const paidAmount = isPaid ? ft.amount : ft.amount * (Math.random() < 0.3 ? 0.5 : 0);
      const pending = isPaid ? 0 : ft.amount - paidAmount;
      const status = paidAmount >= ft.amount ? 'PAID' : (paidAmount > 0 ? 'UNPAID' : 'UNPAID');

      await pool.query(`INSERT INTO "Fee" (id,"totalFee","paidAmount","pendingAmount","dueDate",status,"studentId","feeCategoryId","organizationId","academicYearId","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
        cuid(), ft.amount, paidAmount, pending, ft.due, status,
        st.id, feeCatMap[ft.cat], orgId, ayId, $now, $now,
      ]);
      feeCount++;
    }
  }
  console.log(`   ✅ ${feeCats.length} categories, ${feeCount} fee records\n`);

  /* =====================================================================
   *  14 — FEE PAYMENTS + CHEQUE DETAILS
   * ===================================================================== */
  console.log('💳 Creating Fee Payments & Cheque Details...');
  const allFees = (await pool.query(
    `SELECT id, "totalFee", "paidAmount", "studentId", "feeCategoryId" FROM "Fee" WHERE "organizationId" = $1 AND "paidAmount" > 0 LIMIT 200`,
    [orgId])).rows;

  let payCount = 0;
  let chequeCount = 0;
  for (const fee of allFees) {
    const isCheque = Math.random() < 0.25;
    const payMethod = isCheque ? 'CHEQUE' : pick(['CASH', 'UPI', 'BANK_TRANSFER', 'ONLINE']);
    const recNum = `GUR-RCP-${String(rng(1000, 9999))}-${String(payCount + 1).padStart(4, '0')}`;
    const payId = cuid();
    const payer = pick(allAdmins);

    await pool.query(`INSERT INTO "FeePayment" (id,"feeId",amount,status,"paymentMethod","paymentDate","receiptNumber","payerId","organizationId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
      payId, fee.id, fee.paidAmount, 'COMPLETED', payMethod,
      ts(rngDate(new Date('2026-06-10'), new Date('2027-03-15'))),
      recNum, payer.id, orgId, $now, $now,
    ]);
    payCount++;

    if (isCheque) {
      const chequeNo = String(rng(100000, 999999));
      const banks = ['State Bank of India', 'Bank of Maharashtra', 'HDFC Bank', 'ICICI Bank'];
      await pool.query(`INSERT INTO "ChequeDetail" (id,"feePaymentId","chequeNumber","chequeDate","bankName","branchName","ifscCode","micrCode","accountHolderName","accountNumberLast4",status,"createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
        cuid(), payId, chequeNo,
        ts(rngDate(new Date('2026-06-10'), new Date('2026-12-31'))),
        pick(banks), pick(['Kothrud Branch', 'Deccan Gymkhana', 'FC Road']),
        `SBIN000${rng(1000, 9999)}`, `${rng(100000, 999999)}`,
        `${pick(MALE_NAMES)} ${pick(LAST_NAMES)}`, String(rng(1000, 9999)),
        pick(['PENDING', 'CLEARED']), $now, $now,
      ]);
      chequeCount++;
    }
  }
  console.log(`   ✅ ${payCount} payments, ${chequeCount} cheque details\n`);

  /* =====================================================================
   *  15 — STUDENT ATTENDANCE (~30 days per student)
   * ===================================================================== */
  console.log('📅 Creating Student Attendance...');
  const attStart = new Date('2026-07-01');
  const attEnd = new Date('2026-08-15');
  let attCount = 0;
  // Get all students
  const allStudents = (await pool.query(
    `SELECT id, "sectionId" FROM "Student" WHERE "organizationId" = $1`, [orgId])).rows;

  for (let si = 0; si < allStudents.length; si++) {
    const st = allStudents[si];
    const daysThisMonth = rng(25, 30);
    for (let d = 0; d < daysThisMonth; d++) {
      const date = new Date(attStart);
      date.setDate(date.getDate() + si + d);
      if (date > attEnd) break;
      if (date.getDay() === 0) continue;
      const status = pick(['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'PRESENT', 'PRESENT']);
      const recordedBy = pick(teacherList).userId;

      try {
        await pool.query(
          `INSERT INTO "StudentAttendance" (id,date,status,note,"recordedBy","studentId","sectionId","academicYearId","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
          cuid(), ts(date), status, status === 'ABSENT' ? pick(['Sick', 'Family function', 'Traffic']) : null,
          recordedBy, st.id, st.sectionId, ayId, $now, $now,
        ]);
        attCount++;
      } catch { }
    }
  }
  console.log(`   ✅ ${attCount} attendance records\n`);

  /* =====================================================================
   *  16 — STUDENT DOCUMENTS
   * ===================================================================== */
  console.log('📁 Creating Student Documents...');
  const docTypes = ['AADHAAR', 'BIRTH_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'PARENT_ID', 'AGREEMENT'];
  let docCount = 0;
  const docStudents = allStudents.slice(0, 50);
  for (const st of docStudents) {
    for (const dt of picks(docTypes, rng(1, 3))) {
      const isVerified = Math.random() > 0.2;
      await pool.query(`INSERT INTO "StudentDocument" (id,type,"fileName","fileSize","fileType","documentUrl","studentId",verified,"verifiedBy","verifiedAt",rejected,"uploadedBy","uploadedAt",note,"isDeleted","organizationId","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`, [
        cuid(), dt,
        `${dt}_${st.id.substring(0, 8)}.pdf`, rng(50000, 500000), 'application/pdf',
        `https://storage.gurukul.edu.in/documents/${orgId}/${st.id}/${dt}_${Date.now()}.pdf`,
        st.id, isVerified, isVerified ? pick(allAdmins).id : null,
        isVerified ? $now : null, false,
        pick(allAdmins).id, $now, 'Document verified successfully',
        false, orgId, $now, $now,
      ]);
      docCount++;
    }
  }
  console.log(`   ✅ ${docCount} student documents\n`);

  /* =====================================================================
   *  17 — EXAM SESSIONS + EXAMS + ENROLLMENTS + RESULTS + HALL TICKETS
   * ===================================================================== */
  console.log('📝 Creating Exam Sessions & Exams...');
  const examSessionIds: string[] = [];
  const allExams: { id: string; sessionId: string; gradeId: string; sectionId: string }[] = [];

  for (const sd of EXAM_SESSIONS) {
    const esId = cuid();
    await pool.query(`INSERT INTO "ExamSession" (id,title,description,"academicYearId","organizationId","startDate","endDate","createdBy","createdAt","updatedAt","gradingScaleId")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
      esId, sd.title, `${sd.title} — AY ${AY_LABEL}`, ayId, orgId,
      ts(new Date(sd.start)), ts(new Date(sd.end)), owner.id, $now, $now, scaleId,
    ]);
    examSessionIds.push(esId);

    for (const g of GRADES) {
      const num = g.replace('Grade ', '');
      const subs = SUBJECTS_BY_GRADE[num] || [];
      const examSubs = subs.filter(s => !['Art', 'Physical Education'].includes(s));
      const secs = SECTIONS_PER_GRADE[g] || ['A'];

      for (const subName of examSubs) {
        for (const sec of secs) {
          const maxMarks = parseInt(num) >= 9 ? 80 : 50;
          const passing = Math.ceil(maxMarks * 0.33);
          const duration = parseInt(num) >= 9 ? 180 : 120;
          try {
            const start = rngDate(new Date(sd.start), new Date(sd.end));
            const end = new Date(start.getTime() + duration * 60 * 1000);
            const eId = cuid();
            await pool.query(`INSERT INTO "Exam" (id,title,description,"examSessionId","subjectId","gradeId","sectionId","organizationId","maxMarks","passingMarks",weightage,"evaluationType",mode,status,instructions,"durationInMinutes",venue,supervisors,"startDate","endDate","createdAt","updatedAt")
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`, [
              eId, `${subName} — ${sd.title}`, `${subName} for ${g} ${sec}`,
              esId, subjectMap[g][subName], gradeMap[g], sectionMap[g][sec],
              orgId, maxMarks, passing, parseFloat((1 / examSubs.length).toFixed(2)),
              sd.title.includes('Unit Test') ? 'TEST' : 'EXAM', 'OFFLINE', 'UPCOMING',
              'Read all questions carefully before answering.', duration,
              `Room ${g.replace('Grade ', '')}${sec}`, pgArr([owner.id]),
              ts(start), ts(end), $now, $now,
            ]);
            allExams.push({ id: eId, sessionId: esId, gradeId: gradeMap[g], sectionId: sectionMap[g][sec] });
          } catch { }
        }
      }
    }
  }
  console.log(`   ✅ ${examSessionIds.length} sessions, ${allExams.length} exams\n`);

  // Exam Enrollments + Results
  console.log('📋 Creating Exam Enrollments & Results...');
  let enrollCount = 0;
  let resultCount = 0;

  // Only enroll the 3 most recent sessions to keep data manageable
  const enrollSessions = allExams.slice(-Math.round(allExams.length * 0.6));
  for (const exam of enrollSessions) {
    const sectionStudents = studentList.filter(s => s.sectionId === exam.sectionId);
    // Batch insert enrollments
    const batchSize = 50;
    for (let i = 0; i < sectionStudents.length; i += batchSize) {
      const batch = sectionStudents.slice(i, i + batchSize);
      const placeholders = batch.flatMap((_, j) => [
        `$${j * 7 + 1}`, `$${j * 7 + 2}`, `$${j * 7 + 3}`, `$${j * 7 + 4}`,
        `$${j * 7 + 5}`, `$${j * 7 + 6}`, `$${j * 7 + 7}`,
      ]).join(',');
      const values = batch.flatMap(st => [cuid(), st.id, exam.id, 'ENROLLED', $now, owner.id, false]);
      await pool.query(
        `INSERT INTO "ExamEnrollment" (id,"studentId","examId",status,"enrolledAt","enrolledBy","hallTicketIssued") VALUES ${batch.map((_, j) => `($${j * 7 + 1},$${j * 7 + 2},$${j * 7 + 3},$${j * 7 + 4},$${j * 7 + 5},$${j * 7 + 6},$${j * 7 + 7})`).join(',')}`,
        values
      );
      enrollCount += batch.length;
    }
  }

  // Results for a subset (completed exams)
  for (const exam of enrollSessions) {
    if (!exam.sessionId) continue;
    const sectionStudents = studentList.filter(s => s.sectionId === exam.sectionId);
    for (const st of picks(sectionStudents, Math.min(sectionStudents.length, rng(8, 15)))) {
      const obtained = rng(15, 50);
      const max = 50;
      const pct = parseFloat(((obtained / max) * 100).toFixed(1));
      const isPassed = obtained >= Math.ceil(max * 0.33);
      try {
        await pool.query(`INSERT INTO "ExamResult" (id,"studentId","examId","obtainedMarks",percentage,"gradeLabel",remarks,"isPassed","isAbsent","createdAt","updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
          cuid(), st.id, exam.id, obtained, pct,
          pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : pct >= 41 ? 'C2' : pct >= 33 ? 'D' : 'E',
          isPassed ? 'Good performance, keep it up!' : 'Needs improvement, focus on basics.',
          isPassed, false, $now, $now,
        ]);
        resultCount++;
      } catch { }
    }

    // Hall tickets
    if (Math.random() < 0.15) {
      for (const st of picks(sectionStudents, Math.min(sectionStudents.length, 5))) {
        try {
          await pool.query(`INSERT INTO "HallTicket" (id,"studentId","examId","examSessionId","issuedAt","pdfUrl","qrCode","organizationId","generatedAt")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
            cuid(), st.id, exam.id, exam.sessionId, $now,
            `https://storage.gurukul.edu.in/halltickets/${orgId}/${exam.sessionId}/${st.id}.pdf`,
            `QR-DATA:${orgId}:${exam.sessionId}:${st.id}:${Date.now()}`, orgId, $now,
          ]);
        } catch { }
      }
    }
  }
  console.log(`   ✅ ${enrollCount} enrollments, ${resultCount} results\n`);

  /* =====================================================================
   *  18 — REPORT CARDS
   * ===================================================================== */
  console.log('📄 Creating Report Cards...');
  let rcCount = 0;
  for (const esId of examSessionIds.slice(0, 2)) {
    for (const st of picks(studentList, 30)) {
      const totalMax = 500;
      const totalOb = rng(250, 480);
      const pct = parseFloat(((totalOb / totalMax) * 100).toFixed(1));
      const cgpa = parseFloat((pct / 9.5).toFixed(2));
      await pool.query(`INSERT INTO "ReportCard" (id,"studentId","examSessionId","academicYearId","organizationId","totalMaxMarks","totalObtained",percentage,cgpa,"overallGrade","resultStatus","classRank","attendancePercent","conductGrade",remarks,"principalRemarks","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`, [
        cuid(), st.id, esId, ayId, orgId, totalMax, totalOb, pct, cgpa,
        pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : pct >= 41 ? 'C2' : pct >= 33 ? 'D' : 'E',
        pct >= 33 ? 'PASSED' : 'FAILED', rng(1, 30),
        parseFloat((80 + Math.random() * 18).toFixed(1)),
        pick(['A', 'A', 'A', 'B', 'B', 'C']),
        'Satisfactory progress. Encourage reading habits.',
        'Proud of your efforts this term. Keep striving for excellence.',
        $now, $now,
      ]);
      rcCount++;
    }
  }
  console.log(`   ✅ ${rcCount} report cards\n`);

  /* =====================================================================
   *  19 — NOTICES
   * ===================================================================== */
  console.log('📢 Creating Notices...');
  for (const nd of NOTICE_CONTENT) {
    const start = rngDate(new Date('2026-07-01'), new Date('2027-02-01'));
    const end = new Date(start.getTime() + rng(7, 30) * 24 * 60 * 60 * 1000);
    const nid = cuid();
    await pool.query(`INSERT INTO "Notice" (id,"organizationId","academicYearId",title,summary,content,"startDate","endDate","noticeType",priority,status,"createdBy","approvedBy","approvedAt","publishedBy","publishedAt","isPinned","isUrgent","emailNotification","pushNotification","whatsAppNotification","smsNotification","targetRoles","targetGrades","targetSections","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`, [
      nid, orgId, ayId, nd.title, nd.summary, nd.content,
      ts(start), ts(end), nd.type, nd.priority, 'PUBLISHED',
      owner.id, owner.id, $now, owner.id, $now,
      nd.priority === 'URGENT', nd.priority === 'URGENT',
      true, true, nd.priority === 'URGENT', nd.priority === 'URGENT',
      pgArr(['STUDENT', 'PARENT', 'TEACHER']),
      pgArr([]), pgArr([]), $now, $now,
    ]);

    // Attachments for ~50% notices
    if (Math.random() < 0.5) {
      await pool.query(`INSERT INTO "NoticeAttachment" (id,"noticeId","fileName","fileUrl","fileType","fileSize","publicId","uploadedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
        cuid(), nid, `${nd.title.replace(/\s+/g, '_').toLowerCase()}.pdf`,
        `https://storage.gurukul.edu.in/notices/${orgId}/${nid}.pdf`,
        'application/pdf', rng(100000, 2000000), `notice_${nid}`, $now,
      ]);
    }
  }
  console.log(`   ✅ ${NOTICE_CONTENT.length} notices\n`);

  /* =====================================================================
   *  20 — NOTIFICATION SETTINGS + NOTIFICATIONS + LOGS
   * ===================================================================== */
  console.log('🔔 Creating Notifications...');
  const notifTypes = [
    { type: 'NOTICE', label: 'Notice Alerts' },
    { type: 'FEE', label: 'Fee Reminders' },
    { type: 'ATTENDANCE', label: 'Attendance Alerts' },
    { type: 'DOCUMENT', label: 'Document Requests' },
    { type: 'EXAM', label: 'Exam Notifications' },
    { type: 'LEAVE', label: 'Leave Updates' },
    { type: 'ACADEMIC_REPORT', label: 'Academic Reports' },
    { type: 'GREETING', label: 'Festival Greetings' },
  ];
  for (const nt of notifTypes) {
    await pool.query(`INSERT INTO "NotificationSetting" (id,"organizationId","notificationType",label,channels,"isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
      cuid(), orgId, nt.type, nt.label,
      JSON.stringify({ email: { enabled: true, locked: false }, sms: { enabled: true, locked: false }, whatsapp: { enabled: true, locked: false }, push: { enabled: true, locked: false } }),
      true, $now, $now,
    ]);
  }

  // Sample notifications + logs
  let notifCount = 0;
  const notifMessages = [
    { type: 'FEE', title: 'Fee Payment Reminder', msg: 'Your ward\'s tuition fee for Q1 is pending. Please pay before 15th July 2026.' },
    { type: 'ATTENDANCE', title: 'Attendance Alert', msg: 'Your ward was marked absent on 12th July 2026. Please ensure regular attendance.' },
    { type: 'EXAM', title: 'Exam Schedule', msg: 'Unit Test 1 begins from 10th August 2026. Check timetable on portal.' },
    { type: 'NOTICE', title: 'Notice Published', msg: 'A new notice has been published regarding Annual Day celebrations.' },
    { type: 'GREETING', title: 'Ganesh Chaturthi Wishes', msg: 'Shree Gurukul Vidyalaya wishes you and your family a happy Ganesh Chaturthi!' },
  ];

  for (const nm of notifMessages) {
    for (const st of picks(studentList, rng(5, 15))) {
      const nid = cuid();
      const key = `${orgId}:${nm.type}:${st.id}:${Date.now()}`;
      try {
        await pool.query(`INSERT INTO "Notification" (id,"organizationId","userId","studentId","academicYearId",type,title,message,"isRead","idempotencyKey","createdAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
          nid, orgId, st.userId, st.id, ayId, nm.type, nm.title, nm.msg, false, key, $now,
        ]);
        notifCount++;

        // Log
        await pool.query(`INSERT INTO "NotificationLog" (id,"organizationId","notificationId","notificationType",channel,status,cost,units,"idempotencyKey","sentAt","createdAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
          cuid(), orgId, nid, nm.type, pick(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH']), 'SENT', rng(5, 50), 1,
          `${key}:${pick(['email', 'sms', 'whatsapp', 'push'])}`, $now, $now,
        ]);
      } catch { }
    }
  }
  console.log(`   ✅ ${notifTypes.length} settings, ${notifCount} notifications+logs\n`);

  /* =====================================================================
   *  21 — LEADS (Admissions CRM)
   * ===================================================================== */
  console.log('🎯 Creating Leads...');
  const leadSources = ['WALK_IN', 'WEBSITE', 'WORD_OF_MOUTH', 'GOOGLE_ADS', 'FACEBOOK_ADS', 'REFERRAL_PROGRAM', 'PHONE_CALL', 'WHATSAPP'];
  const leadStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISITED', 'QUALIFIED', 'CONVERTED', 'NOT_INTERESTED', 'UNRESPONSIVE'];
  const LEADS_COUNT = 35;
  let leadCount = 0;
  let leadActCount = 0;

  for (let i = 0; i < LEADS_COUNT; i++) {
    const isMale = Math.random() > 0.45;
    const sFirst = isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const sLast = pick(LAST_NAMES);
    const pFirst = pick(MALE_NAMES);
    const status = pick(leadStatuses);
    const lid = cuid();

    await pool.query(`INSERT INTO "Lead" (id,"organizationId","academicYearId","studentName","parentName",phone,email,"whatsappNumber","enquiryFor","currentSchool",address,city,state,"pinCode",source,status,priority,score,"assignedToUserId","nextFollowUpAt","followUpCount",notes,requirements,"budgetRange","createdByUserId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`, [
      lid, orgId, ayId, `${sFirst} ${sLast}`, `${pFirst} ${sLast}`,
      phone(), Math.random() > 0.3 ? email(sFirst, sLast, 'gmail.com') : null,
      phone(), `Grade ${rng(1, 10)} Admission`,
      pick(['', 'St. Mary\'s School', 'DAV Public School', 'Kendriya Vidyalaya', 'Ryan International', 'Podar International', 'Jawahar Navodaya']),
      `${rng(1, 99)}, ${pick(['MG Road', 'Station Road', 'Nagras Road', 'Warje', 'Sinhagad Road'])}`,
      'Pune', 'Maharashtra', pick(['411001', '411038', '411057', '411045', '411052']),
      pick(leadSources), status, pick(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
      rng(15, 95), Math.random() > 0.5 ? pick(teacherList).userId : null,
      Math.random() > 0.4 ? ts(rngDate(new Date('2026-07-01'), new Date('2027-03-01'))) : null,
      rng(0, 5),
      pick(['Parent interested in CBSE curriculum.', 'Looking for affordable school near Kothrud.', 'Enquired about transport facility.', 'Wants demo class before admission.']),
      pgArr(picks(['Transportation', 'Scholarship', 'Sports Facility', 'Hostel'], rng(0, 2))),
      pick(['50k-1L', '1L-2L', '2L-3L', '3L+']),
      owner.id, $now, $now,
    ]);
    leadCount++;

    // Activities
    for (let j = 0; j < rng(1, 3); j++) {
      await pool.query(`INSERT INTO "LeadActivity" (id,"leadId",type,title,description,outcome,sentiment,"performedById","performedAt","createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
        cuid(), lid,
        pick(['CALL', 'WHATSAPP', 'EMAIL', 'VISIT', 'FOLLOW_UP']),
        pick(['Called parent for follow-up', 'Sent fee structure via WhatsApp', 'Emailed prospectus', 'Campus tour arranged']),
        pick(['Parent showed interest.', 'Requested scholarship details.', 'Will visit campus next week.']),
        pick(['Positive response', 'Interested', 'Will decide later']),
        pick(['POSITIVE', 'NEUTRAL']),
        pick(teacherList).userId,
        ts(rngDate(new Date('2026-07-01'), new Date('2027-02-01'))), $now,
      ]);
      leadActCount++;
    }
  }
  console.log(`   ✅ ${leadCount} leads, ${leadActCount} activities\n`);

  /* =====================================================================
   *  22 — ANONYMOUS COMPLAINTS
   * ===================================================================== */
  console.log('🔒 Creating Anonymous Complaints...');
  const complaintCategories = ['Bullying', 'Teacher Behavior', 'Infrastructure', 'Cleanliness', 'Safety', 'Food Quality', 'Other'];
  const complaintMsgs = [
    { subject: 'Water leakage in classroom', desc: 'Water leaking from ceiling in Room 203, near the window area. This is causing books to get wet.' },
    { subject: 'Canteen food quality', desc: 'The food served in the canteen has been consistently below standard. Students have reported stomach issues.' },
    { subject: 'Bullying in playground', desc: 'Some senior students are bullying juniors during the lunch break near the basketball court.' },
    { subject: 'Broken bench in lab', desc: 'Three benches in the science lab are broken and need immediate replacement. Students are sharing seats.' },
    { subject: 'Unclean washrooms', desc: 'The boys washroom on the first floor has not been cleaned for 3 days. Very unhygienic conditions.' },
    { subject: 'Late bus arrival', desc: 'Bus number MH-02 has been arriving 20-30 minutes late consistently for the past week.' },
  ];

  for (const cm of complaintMsgs) {
    const cid = cuid();
    const tid = `GUR-${String(rng(10000, 99999))}`;
    const sev = pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
    await pool.query(`INSERT INTO "AnonymousComplaint" (id,"trackingId",category,severity,subject,description,"evidenceUrls","currentStatus","organizationId","academicYearId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
      cid, tid, pick(complaintCategories), sev, cm.subject, cm.desc,
      pgArr(Math.random() > 0.7 ? [`https://storage.gurukul.edu.in/complaints/${orgId}/${tid}.jpg`] : []),
      pick(['PENDING', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED']),
      orgId, ayId, $now, $now,
    ]);

    // Status timeline
    await pool.query(`INSERT INTO "ComplaintStatusTimeline" (id,"complaintId",status,note,"changedBy","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      cuid(), cid, 'PENDING', 'Complaint received and logged.', 'system', $now, $now,
    ]);
  }
  console.log(`   ✅ ${complaintMsgs.length} anonymous complaints\n`);

  /* =====================================================================
   *  23 — CERTIFICATES
   * ===================================================================== */
  console.log('📜 Creating Certificates...');
  const certTypes = ['BONAFIDE', 'LEAVING', 'CHARACTER', 'SCHOLARSHIP', 'TRANSFER', 'STUDY'];
  let certCount = 0;
  for (const st of picks(studentList, 15)) {
    const num = st.gradeName.replace('Grade ', '');
    await pool.query(`INSERT INTO "Certificate" (id,"CertificateNumber","CertificateType","studentId","studentName","rollNo",grade,section,year,language,"issuedAt","issuedBy","issuedByName",metadata,"organizationId","academicYearId","createdAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [
      cuid(),
      `GUR/${new Date().getFullYear()}/${String(certCount + 1).padStart(4, '0')}`,
      pick(certTypes),
      st.id, `${st.firstName} ${st.lastName}`, st.sectionName,
      num, st.sectionName, AY_LABEL, 'ENGLISH',
      ts(rngDate(new Date('2026-07-01'), new Date('2027-03-01'))),
      owner.id, 'Aniket Dhumal',
      JSON.stringify({ studentName: `${st.firstName} ${st.lastName}`, rollNumber: st.sectionName, grade: num, fatherName: pick(MALE_NAMES), motherName: pick(FEMALE_NAMES) }),
      orgId, ayId, $now,
    ]);
    certCount++;
  }
  console.log(`   ✅ ${certCount} certificates\n`);

  /* =====================================================================
   *  24 — LEAVES
   * ===================================================================== */
  console.log('🏖️ Creating Leave Records...');
  const leaveTypes = ['SICK', 'CASUAL', 'ANNUAL', 'EMERGENCY', 'VACATION', 'STUDY'];
  let leaveCount = 0;
  for (const t of picks(teacherList, rng(5, 10))) {
    const start = rngDate(new Date('2026-08-01'), new Date('2027-02-01'));
    const days = rng(1, 5);
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const lid = cuid();

    await pool.query(`INSERT INTO "Leave" (id,"startDate","endDate","totalDays",reason,type,"emergencyContact","currentStatus","approvedBy","approvedAt","userId","organizationId","academicYearId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
      lid, ts(start), ts(end), days,
      pick(['Not feeling well', 'Family function in village', 'Personal work', 'Medical checkup', 'Going out of station']),
      pick(leaveTypes), phone(),
      pick(['APPROVED', 'APPROVED', 'APPROVED', 'PENDING']),
      owner.id, $now, t.userId, orgId, ayId, $now, $now,
    ]);
    leaveCount++;

    await pool.query(`INSERT INTO "LeaveStatusTimeline" (id,"leaveId",status,note,"changedBy","changedAt")
      VALUES ($1,$2,$3,$4,$5,$6)`, [
      cuid(), lid, 'APPROVED', 'Leave approved by Principal.', owner.id, $now,
    ]);
  }
  console.log(`   ✅ ${leaveCount} leave records\n`);

  /* =====================================================================
   *  25 — ACADEMIC CALENDAR (Holidays)
   * ===================================================================== */
  console.log('📅 Creating Academic Calendar Events...');
  for (const h of HOLIDAYS) {
    await pool.query(`INSERT INTO "AcademicCalendar" (id,"organizationId",name,"startDate","endDate",type,reason,"isRecurring","createdBy","createdAt","updatedAt","academicYearId")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
      cuid(), orgId, h.name, ts(new Date(h.start)), ts(new Date(h.end)),
      'PLANNED', h.reason, h.name === 'Diwali Break', owner.id, $now, $now, ayId,
    ]);
  }
  console.log(`   ✅ ${HOLIDAYS.length} calendar events\n`);

  /* =====================================================================
   *  26 — AI AGENTS + EXECUTION LOGS + REPORTS
   * ===================================================================== */
  console.log('🤖 Creating AI Agents...');
  const agentFeeSense = cuid();
  await pool.query(`INSERT INTO "AiAgent" (id,"organizationId",name,description,status,"runFrequency","scheduleTime","llmModel","llmMaxSteps","totalRuns","successfulRuns","failedRuns","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [
    agentFeeSense, orgId, 'FeeSense AI',
    'Analyzes overdue fees, payment patterns, risk levels; sends personalized multi-channel reminders.',
    'ACTIVE', 'DAILY', '23:00', 'google/gemini-2.0-flash-exp', 20, 5, 5, 0, $now, $now,
  ]);
  await pool.query(`INSERT INTO "AiAgentConfig" (id,"agentId",config,"createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5)`, [
    cuid(), agentFeeSense, JSON.stringify({
      riskThresholds: { low: 30, medium: 60, high: 80 },
      channels: { email: true, sms: true, whatsapp: true, voice: false },
      notification: { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 },
      throttle: { monthlyCap: 4, notificationWindow: { startHour: 11, endHour: 19 } },
    }), $now, $now,
  ]);

  const agentAttend = cuid();
  await pool.query(`INSERT INTO "AiAgent" (id,"organizationId",name,description,status,"runFrequency","scheduleTime","llmModel","llmMaxSteps","totalRuns","successfulRuns","failedRuns","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [
    agentAttend, orgId, 'Attendance Monitor',
    'Detects absentee patterns, frequent lates, and students needing intervention.',
    'ACTIVE', 'WEEKLY', '22:00', 'google/gemini-2.0-flash-exp', 20, 8, 7, 1, $now, $now,
  ]);
  await pool.query(`INSERT INTO "AiAgentConfig" (id,"agentId",config,"createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5)`, [
    cuid(), agentAttend, JSON.stringify({
      absenceThreshold: 75, lookbackDays: 90,
      notifyParent: true, notifyTeacher: true,
    }), $now, $now,
  ]);

  // Execution logs
  for (let i = 0; i < 3; i++) {
    const logId = cuid();
    await pool.query(`INSERT INTO "AiAgentExecutionLog" (id,"agentId","organizationId","startedAt","completedAt",status,"studentsProcessed","notificationsSent","errorsCount","warningsCount","llmCost","llmTokens","durationMs","createdAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [
      logId, agentFeeSense, orgId,
      ts(new Date(Date.now() - (i + 1) * 86400000)),
      ts(new Date(Date.now() - (i + 1) * 86400000 + 30000)),
      'SUCCESS', rng(100, 200), rng(20, 50), 0, rng(0, 2),
      rng(100, 500), rng(5000, 15000), rng(15000, 45000), $now,
    ]);

    // Reports
    await pool.query(`INSERT INTO "AiAgentReport" (id,"agentId","logId","reportDate","reportType","totalProcessed","highRiskCount","mediumRiskCount","lowRiskCount","emailsSent","smsSent","whatsappSent",data,"deliveredTo","createdAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
      cuid(), agentFeeSense, logId,
      ts(new Date(Date.now() - i * 86400000)),
      pick(['DAILY_SUMMARY', 'WEEKLY_ANALYSIS', 'ALERT']),
      rng(180, 350), rng(3, 15), rng(10, 30), rng(50, 100),
      rng(5, 20), rng(5, 20), rng(10, 30),
      JSON.stringify({
        summary: `Processed ${rng(100, 200)} students. Found ${rng(10, 30)} high-risk fee defaulters.`,
        topDefaulters: picks(studentList, 3).map(s => `${s.firstName} ${s.lastName}`),
        recommendations: ['Send WhatsApp reminders to high-risk group', 'Call parents of top 5 defaulters'],
      }),
      pgArr(pick([['admin@gurukul.edu.in'], ['admin@gurukul.edu.in', 'trust@gurukul.edu.in']])),
      $now,
    ]);
  }
  console.log('   ✅ AI Agents + logs + reports\n');

  /* =====================================================================
   *  27 — ID CARDS
   * ===================================================================== */
  console.log('🪪 Creating ID Cards...');
  let idCardCount = 0;
  for (const st of picks(studentList, 40)) {
    const cardNo = `GUR-SID-${String(idCardCount + 1).padStart(5, '0')}`;
    await pool.query(`INSERT INTO "IdCard" (id,"cardNumber",version,"studentId","organizationId","academicYear","issuedAt","expiresAt","generatedBy",template,orientation,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
      cuid(), cardNo, 1, st.id, orgId, AY_LABEL,
      ts(rngDate(new Date('2026-06-01'), new Date('2026-06-30'))),
      ts(new Date('2027-04-01')), owner.id, 'default', 'HORIZONTAL', $now, $now,
    ]);
    idCardCount++;
  }
  for (const t of picks(teacherList, 10)) {
    const cardNo = `GUR-TID-${String(idCardCount + 1).padStart(5, '0')}`;
    await pool.query(`INSERT INTO "IdCard" (id,"cardNumber",version,"teacherId","organizationId","academicYear","issuedAt","expiresAt","generatedBy",template,orientation,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
      cuid(), cardNo, 1, t.id, orgId, AY_LABEL,
      $now, ts(new Date('2027-04-01')), owner.id, 'default', 'VERTICAL', $now, $now,
    ]);
    idCardCount++;
  }
  console.log(`   ✅ ${idCardCount} ID cards\n`);

  /* =====================================================================
   *  28 — TRANSPORT (Vehicles, Drivers, Helpers, Routes, Stops, Enrollments)
   * ===================================================================== */
  console.log('🚌 Creating Transport...');
  const drivers = [
    { name: 'Ramesh Shinde', phone: '+919876543210', license: 'MH14X20260012345' },
    { name: 'Dattatray Pawar', phone: '+919876543211', license: 'MH14X20260012346' },
    { name: 'Sanjay More', phone: '+919876543212', license: 'MH14X20260012347' },
  ];
  const driverIds: string[] = [];
  for (const d of drivers) {
    const did = cuid();
    await pool.query(`INSERT INTO "Driver" (id,"organizationId",name,phone,"licenseNumber","licenseExpiry","isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
      did, orgId, d.name, d.phone, d.license, ts(new Date('2028-12-31')), true, $now, $now,
    ]);
    driverIds.push(did);
  }

  const helpers = [
    { name: 'Prakash Gaikwad', phone: '+919876543220' },
    { name: 'Suresh Kadam', phone: '+919876543221' },
  ];
  const helperIds: string[] = [];
  for (const h of helpers) {
    const hid = cuid();
    await pool.query(`INSERT INTO "Helper" (id,"organizationId",name,phone,"isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7)`, [hid, orgId, h.name, h.phone, true, $now, $now]);
    helperIds.push(hid);
  }

  const vehicles = [
    { reg: 'MH12GH1234', type: 'BUS', capacity: 40 },
    { reg: 'MH12GH5678', type: 'BUS', capacity: 40 },
    { reg: 'MH12GH9012', type: 'MINI_BUS', capacity: 20 },
  ];
  const vehicleIds: string[] = [];
  for (const v of vehicles) {
    const vid = cuid();
    await pool.query(`INSERT INTO "Vehicle" (id,"organizationId","registrationNo",type,capacity,"isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [vid, orgId, v.reg, v.type, v.capacity, true, $now, $now]);
    vehicleIds.push(vid);
  }

  // Routes
  const routeDefs = [
    {
      name: 'Kothrud → Warje (Morning)', code: 'R-G01', vehicleIdx: 0, driverIdx: 0, helperIdx: 0,
      stops: [
        { name: 'Vanaz Corner', order: 1, landmark: 'Vanaz Bus Stop', pickup: '07:00' },
        { name: 'Mayur Colony', order: 2, landmark: 'Mayur Colony signal', pickup: '07:08' },
        { name: 'Kothrud Depot', order: 3, landmark: 'Kothrud Bus Depot', pickup: '07:15' },
        { name: 'Warje Circle', order: 4, landmark: 'Warje Chowk', pickup: '07:28' },
        { name: 'Nanded Village', order: 5, landmark: 'Nanded Phata', pickup: '07:35' },
      ]
    },
    {
      name: 'Paud Road → Sinhagad Road (Morning)', code: 'R-G02', vehicleIdx: 1, driverIdx: 1, helperIdx: 1,
      stops: [
        { name: 'Paud Phata', order: 1, landmark: 'Paud Road junction', pickup: '07:00' },
        { name: 'Bharati Vidyapeeth Gate', order: 2, landmark: 'Bharati Vidyapeeth', pickup: '07:10' },
        { name: 'Dhayari Gaon', order: 3, landmark: 'Dhayari bus stop', pickup: '07:20' },
        { name: 'Khate Wadi', order: 4, landmark: 'Khate Wadi signal', pickup: '07:30' },
        { name: 'Sinhagad Road', order: 5, landmark: 'Sinhagad Road start', pickup: '07:42' },
      ]
    },
    {
      name: 'Karve Nagar → Deccan (Morning)', code: 'R-G03', vehicleIdx: 2, driverIdx: 2, helperIdx: 0,
      stops: [
        { name: 'Karve Nagar Bus Stop', order: 1, landmark: 'Karve Nagar', pickup: '07:15' },
        { name: 'Hingne Gaon', order: 2, landmark: 'Hingne St. Anne\'s', pickup: '07:22' },
        { name: 'Deccan Corner', order: 3, landmark: 'Deccan Gymkhana', pickup: '07:35' },
      ]
    },
  ];

  const routeIds: string[] = [];
  const stopRecords: { routeId: string; stopId: string; name: string; order: number }[] = [];

  for (const rd of routeDefs) {
    const rid = cuid();
    await pool.query(`INSERT INTO "TransportRoute" (id,"organizationId",name,code,"vehicleId","driverId","helperId","createdBy","isActive","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [
      rid, orgId, rd.name, rd.code, vehicleIds[rd.vehicleIdx], driverIds[rd.driverIdx], helperIds[rd.helperIdx],
      owner.id, true, $now, $now,
    ]);
    routeIds.push(rid);

    for (const rs of rd.stops) {
      const sid = cuid();
      await pool.query(`INSERT INTO "TransportStop" (id,"routeId",name,"order",landmark,"pickupTime")
        VALUES ($1,$2,$3,$4,$5,$6)`, [sid, rid, rs.name, rs.order, rs.landmark, rs.pickup]);
      stopRecords.push({ routeId: rid, stopId: sid, name: rs.name, order: rs.order });
    }
  }

  // Enrollments
  let enrollCount2 = 0;
  for (const st of picks(studentList, rng(25, 40))) {
    const route = pick(routeIds);
    const stopsForRoute = stopRecords.filter(s => s.routeId === route);
    const stop = pick(stopsForRoute);
    try {
      await pool.query(`INSERT INTO "TransportEnrollment" (id,"organizationId","studentId","routeId","stopId","academicYearId","isActive","enrolledAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
        cuid(), orgId, st.id, route, stop.stopId, ayId, true, $now, $now,
      ]);
      enrollCount2++;
    } catch { }
  }
  console.log(`   ✅ ${vehicles.length} vehicles, ${drivers.length} drivers, ${routeDefs.length} routes, ${enrollCount2} enrollments\n`);

  /* =====================================================================
   *  29 — INVOICES + SUBSCRIPTION PAYMENTS + BILLING EVENTS + PRICING SLABS
   * ===================================================================== */
  console.log('🧾 Creating Billing Records...');
  for (let m = 0; m < 5; m++) {
    const invDate = new Date('2026-06-01');
    invDate.setMonth(invDate.getMonth() + m);
    const invEnd = new Date(invDate);
    invEnd.setMonth(invEnd.getMonth() + 1);

    const invId = cuid();
    await pool.query(`INSERT INTO "Invoice" (id,"subscriptionId","organizationId","invoiceNumber","periodStart","periodEnd","studentCount",subtotal,discount,total,status,"dueAt","paidAt","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [
      invId, subId, orgId, `INV-GUR-${String(m + 1).padStart(4, '0')}`,
      ts(invDate), ts(invEnd), rng(180, 200),
      rng(3500, 4000), 0, rng(3500, 4000),
      'PAID', ts(invDate), ts(new Date(invDate.getTime() + rng(1, 5) * 86400000)),
      $now, $now,
    ]);

    // Payment per invoice
    await pool.query(`INSERT INTO "SubscriptionPayment" (id,"subscriptionId","invoiceId",provider,amount,status,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
      cuid(), subId, invId, 'MANUAL', rng(3500, 4000), 'SUCCESS', $now, $now,
    ]);

    // Billing event
    await pool.query(`INSERT INTO "BillingEvent" (id,"subscriptionId",type,message,"createdBy","createdAt")
      VALUES ($1,$2,$3,$4,$5,$6)`, [
      cuid(), subId, 'INVOICE_GENERATED', `Monthly invoice for ${invDate.toLocaleString('default', { month: 'long' })} 2026 generated.`,
      owner.id, $now,
    ]);
  }
  console.log('   ✅ Invoices, payments, billing events\n');

  /* =====================================================================
   *  30 — DEVICE TOKENS (Push notifications)
   * ===================================================================== */
  console.log('📱 Creating Device Tokens...');
  for (const u of allAdmins) {
    await pool.query(`INSERT INTO "DeviceToken" (id,"userId",token,platform,"createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6)`, [
      cuid(), u.id,
      `fcm-token-${cuid()}-${Date.now()}`,
      pick(['web', 'android', 'ios']), $now, $now,
    ]);
  }
  console.log('   ✅ Device tokens created\n');

  /* =====================================================================
   *  31 — META INTEGRATION (Facebook Lead Ads)
   * ===================================================================== */
  console.log('📘 Creating Meta Integration...');
  await pool.query(`INSERT INTO "MetaIntegration" (id,"organizationId","metaUserId","pageId","pageName","pageAccessToken","subscribedFormIds","isActive","connectedAt","connectedByUserId","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
    cuid(), orgId, 'meta_user_987654321', 'page_gurukulvidyalaya_12345',
    'Shree Gurukul Vidyalaya Pune',
    'EAAxYz...encrypted-token-placeholder...ZCD4',
    pgArr(['form_admission_2026_01', 'form_enquiry_2026_02']),
    true, ts(new Date('2026-05-15')), owner.id, $now, $now,
  ]);
  console.log('   ✅ Meta (Facebook) integration created\n');

  /* =====================================================================
   *  32 — SCHEDULED JOBS
   * ===================================================================== */
  console.log('⏰ Creating Scheduled Jobs...');
  await pool.query(`INSERT INTO "ScheduledJob" (id,data,type,"scheduledAt",status,"createdBy","organizationId","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
    cuid(), JSON.stringify({ channels: ['WHATSAPP', 'SMS'], grades: ['Grade 1', 'Grade 2', 'Grade 3'] }),
    'FEE_REMINDER', ts(new Date('2026-08-01')), 'PENDING', owner.id, orgId, $now, $now,
  ]);
  await pool.query(`INSERT INTO "ScheduledJob" (id,data,type,"scheduledAt",status,"createdBy","organizationId","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
    cuid(), JSON.stringify({ noticeId: 'all', channels: ['EMAIL', 'PUSH'] }),
    'NOTICE', ts(new Date('2026-09-15')), 'PENDING', owner.id, orgId, $now, $now,
  ]);
  console.log('   ✅ Scheduled jobs created\n');

  /* =====================================================================
   *  33 — INVITATIONS (for future teachers & parents)
   * ===================================================================== */
  console.log('✉️ Creating Invitations...');
  await pool.query(`INSERT INTO "Invitation" (id,"organizationId",email,role,status,"inviterId","expiresAt","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
    cuid(), orgId, 'new.teacher@gurukul.edu.in', 'TEACHER', 'pending', owner.id,
    ts(new Date('2027-06-01')), $now, $now,
  ]);
  await pool.query(`INSERT INTO "Invitation" (id,"organizationId",email,role,status,"inviterId","expiresAt","createdAt","updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
    cuid(), orgId, 'new.parent@gurukul.edu.in', 'PARENT', 'pending', owner.id,
    ts(new Date('2027-06-01')), $now, $now,
  ]);
  console.log('   ✅ Invitations created\n');

  /* =====================================================================
   *  DONE — Summary
   * ===================================================================== */
  const totalStudents = (await pool.query(`SELECT COUNT(*)::int as c FROM "Student" WHERE "organizationId" = $1`, [orgId])).rows[0].c;
  const totalTeachers = (await pool.query(`SELECT COUNT(*)::int as c FROM "Teacher" WHERE "organizationId" = $1`, [orgId])).rows[0].c;
  const totalFees = (await pool.query(`SELECT COUNT(*)::int as c FROM "Fee" WHERE "organizationId" = $1`, [orgId])).rows[0].c;
  const totalPayments = (await pool.query(`SELECT COUNT(*)::int as c FROM "FeePayment" WHERE "organizationId" = $1`, [orgId])).rows[0].c;
  const totalExams = (await pool.query(`SELECT COUNT(*)::int as c FROM "Exam" WHERE "organizationId" = $1`, [orgId])).rows[0].c;
  const totalAttendance = (await pool.query(`SELECT COUNT(*)::int as c FROM "StudentAttendance" sa JOIN "Student" s ON s.id = sa."studentId" WHERE s."organizationId" = $1`, [orgId])).rows[0].c;
  const totalLeads = (await pool.query(`SELECT COUNT(*)::int as c FROM "Lead" WHERE "organizationId" = $1`, [orgId])).rows[0].c;

  console.log('✅ ==========================================');
  console.log('✅  Shree Gurukul Vidyalaya — Seed Complete!');
  console.log('✅ ==========================================');
  console.log(``);
  console.log(`📊 Summary:`);
  console.log(`   Institution          : 1  (Shree Gurukul Shikshan Prasarak Mandal)`);
  console.log(`   Organization         : 1  (Shree Gurukul Vidyalaya English Medium)`);
  console.log(`   Academic Year        : 1  (${AY_LABEL} — June 2026 to April 2027)`);
  console.log(`   Grades               : ${GRADES.length}  (Grade 1 – Grade 10)`);
  console.log(`   Students             : ${totalStudents}`);
  console.log(`   Teachers             : ${totalTeachers}`);
  console.log(`   Parents              : ${parentList.length}`);
  console.log(`   Fee Categories       : ${feeCats.length}`);
  console.log(`   Fee Records          : ${totalFees}`);
  console.log(`   Fee Payments         : ${totalPayments}`);
  console.log(`   Cheque Details       : ${chequeCount}`);
  console.log(`   Attendance Records   : ${totalAttendance}`);
  console.log(`   Student Documents    : ${docCount}`);
  console.log(`   Exam Sessions        : ${examSessionIds.length}`);
  console.log(`   Exams                : ${totalExams}`);
  console.log(`   Exam Enrollments     : ${enrollCount}`);
  console.log(`   Exam Results         : ${resultCount}`);
  console.log(`   Report Cards         : ${rcCount}`);
  console.log(`   Notices              : ${NOTICE_CONTENT.length}`);
  console.log(`   Notifications        : ${notifCount}+`);
  console.log(`   Leads                : ${totalLeads}`);
  console.log(`   Anonymous Complaints : ${complaintMsgs.length}`);
  console.log(`   Certificates         : ${certCount}`);
  console.log(`   Leaves               : ${leaveCount}`);
  console.log(`   Academic Calendar    : ${HOLIDAYS.length}`);
  console.log(`   AI Agents            : 2  (FeeSense + Attendance Monitor)`);
  console.log(`   ID Cards             : ${idCardCount}`);
  console.log(`   Transport Routes     : ${routeDefs.length}`);
  console.log(`   Transport Enrollments: ${enrollCount2}`);
  console.log(`   Invoices             : 5`);
  console.log(`   Active Admins        : ${allAdmins.length}  (Sameer Kad + Aniket Dhumal)`);
  console.log(``);
  console.log('🏫  Shree Gurukul Vidyalaya, Kothrud, Pune — Ready!');
  console.log('📅  Academic Year 2026-27 (June 2026 – April 2027)');
  console.log(``);

  await pool.end();
}

main().catch(async (e) => {
  console.error('\n❌ Seed Error:', e);
  await pool.end();
  process.exit(1);
});
