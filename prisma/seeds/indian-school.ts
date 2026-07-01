import 'dotenv/config';
import { Pool } from 'pg';
import {
  GuardianType,
  InstitutionType,
  OrganizationType,
  YearType,
  Role,
  MembershipStatus,
  RoundingRule,
  PointsMode,
  EmploymentStatus,
  AssignmentStatus,
  BloodGroup,
  Gender,
  StudentStatus,
  PaymentMethod,
  FeeStatus,
  PaymentStatus,
  CalendarEventType,
  NoticeType,
  NoticePriority,
  NoticeStatus,
  EvaluationType,
  ExamMode,
  ExamStatus,
  LeadStatus,
  LeadSource,
  LeadPriority,
  LeadActivityType,
  Sentiment,
  NotificationType,
} from '@/generated/prisma/enums';
import {
  INDIAN_FIRST_NAMES_MALE, INDIAN_FIRST_NAMES_FEMALE, INDIAN_LAST_NAMES,
  INDIAN_CITIES, INDIAN_ADDRESSES,
  randomItem, randomInt, randomDate, generateIndianPhone, generateIndianEmail,
  generateId, generatePgArray,
} from './constants';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const INDIAN_SUBJECTS_BY_GRADE: Record<string, string[]> = {
  '1': ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'],
  '2': ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'],
  '3': ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'],
  '4': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'],
  '5': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'],
  '6': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '7': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '9': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
  '10': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'],
};

const FEE_STRUCTURE_BY_GRADE: Record<string, { tuition: number; transport: number; exam: number; lab: number; annual: number }> = {
  '1': { tuition: 18000, transport: 12000, exam: 2000, lab: 0, annual: 3000 },
  '2': { tuition: 18000, transport: 12000, exam: 2000, lab: 0, annual: 3000 },
  '3': { tuition: 20000, transport: 12000, exam: 2500, lab: 0, annual: 3000 },
  '4': { tuition: 22000, transport: 12000, exam: 2500, lab: 1000, annual: 3500 },
  '5': { tuition: 24000, transport: 14000, exam: 3000, lab: 1000, annual: 3500 },
  '6': { tuition: 28000, transport: 14000, exam: 3000, lab: 2000, annual: 4000 },
  '7': { tuition: 30000, transport: 14000, exam: 3500, lab: 2000, annual: 4000 },
  '8': { tuition: 32000, transport: 16000, exam: 3500, lab: 2500, annual: 4500 },
  '9': { tuition: 36000, transport: 16000, exam: 4000, lab: 3000, annual: 5000 },
  '10': { tuition: 40000, transport: 18000, exam: 5000, lab: 3500, annual: 6000 },
};

const INDIAN_HOLIDAYS_2025_26 = [
  { name: 'Gandhi Jayanti', start: '2025-10-02', end: '2025-10-02', reason: 'National Holiday' },
  { name: 'Diwali Break', start: '2025-10-20', end: '2025-10-24', reason: 'Festival Holidays' },
  { name: 'Republic Day', start: '2026-01-26', end: '2026-01-26', reason: 'National Holiday' },
  { name: 'Holi', start: '2026-03-14', end: '2026-03-15', reason: 'Festival Holidays' },
  { name: 'Summer Vacation', start: '2026-05-15', end: '2026-06-30', reason: 'Summer Break' },
  { name: 'Independence Day', start: '2025-08-15', end: '2025-08-15', reason: 'National Holiday' },
  { name: 'Dussehra', start: '2025-10-01', end: '2025-10-01', reason: 'Festival Holidays' },
  { name: 'Christmas Break', start: '2025-12-25', end: '2025-12-31', reason: 'Winter Holidays' },
];

const SCHOOL_NOTICES = [
  { title: 'Annual Day Celebration 2026', summary: 'Annual Day function scheduled for 15th March 2026', content: 'Dear Parents and Students,\n\nWe are delighted to invite you all to our Annual Day Celebration on 15th March 2026 at the school auditorium.', type: NoticeType.EVENT, priority: NoticePriority.HIGH },
  { title: 'Mid-Term Examination Schedule - March 2026', summary: 'Mid-term exams for all grades starting 10th March 2026', content: 'Dear Parents and Students,\n\nThe Mid-Term Examinations for Academic Year 2025-26 will commence from 10th March 2026.', type: NoticeType.EXAM, priority: NoticePriority.URGENT },
  { title: 'Fee Payment Reminder - Q4 2025-26', summary: 'Last date for Q4 fee payment is 15th February 2026', content: 'Dear Parents,\n\nThis is a gentle reminder that the last date for payment of Q4 fees is 15th February 2026.', type: NoticeType.DEADLINE, priority: NoticePriority.HIGH },
  { title: 'Republic Day Celebration', summary: 'Republic Day function on 26th January 2026', content: 'Dear Students and Parents,\n\nThe school will celebrate Republic Day on 26th January 2026 with flag hoisting at 8:00 AM.', type: NoticeType.EVENT, priority: NoticePriority.MEDIUM },
  { title: 'Revised Timetable - Winter Session', summary: 'New school timings effective from 1st November 2025', content: 'Dear Parents,\n\nPlease note that the school timings will be revised for the winter session effective 1st November 2025.', type: NoticeType.TIMETABLE, priority: NoticePriority.MEDIUM },
  { title: 'Science Exhibition - "Innovation 2026"', summary: 'Science exhibition on 20th February 2026', content: 'Dear Students,\n\nThe annual Science Exhibition "Innovation 2026" will be held on 20th February 2026.', type: NoticeType.EVENT, priority: NoticePriority.MEDIUM },
  { title: 'Parent-Teacher Meeting - Term 2', summary: 'PTM scheduled for 8th February 2026', content: 'Dear Parents,\n\nA Parent-Teacher Meeting for Term 2 will be held on 8th February 2026 from 9:00 AM to 1:00 PM.', type: NoticeType.GENERAL, priority: NoticePriority.MEDIUM },
];

const CONFIG = {
  grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  sectionsPerGrade: { 'Grade 1': ['A', 'B'], 'Grade 2': ['A', 'B'], 'Grade 3': ['A', 'B'], 'Grade 4': ['A', 'B'], 'Grade 5': ['A', 'B'], 'Grade 6': ['A', 'B', 'C'], 'Grade 7': ['A', 'B', 'C'], 'Grade 8': ['A', 'B', 'C'], 'Grade 9': ['A', 'B'], 'Grade 10': ['A', 'B'] },
  studentsPerSection: { 'Grade 1': 35, 'Grade 2': 35, 'Grade 3': 35, 'Grade 4': 35, 'Grade 5': 35, 'Grade 6': 30, 'Grade 7': 30, 'Grade 8': 30, 'Grade 9': 28, 'Grade 10': 28 },
  teachersCount: 45, leadsCount: 50,
  examSessions: [
    { title: 'Unit Test 1', start: '2025-08-18', end: '2025-08-22' },
    { title: 'Unit Test 2', start: '2025-11-10', end: '2025-11-14' },
    { title: 'Mid-Term Examination', start: '2026-01-12', end: '2026-01-22' },
    { title: 'Final Examination', start: '2026-03-02', end: '2026-03-15' },
  ],
};
/* ----------------------------------------------
 * Main Seed Function
 * ---------------------------------------------- */
async function main() {
  console.log('\n🏫 Starting Indian School Data Seed (via pg)...\n');

  // Clear existing data (reverse dependency order)
  console.log('🧹 Clearing existing data...');
  const tables = [
    '"NotificationSetting"', '"AiAgentReport"', '"AiAgentExecutionLog"', '"AiAgentConfig"', '"AiAgent"',
    '"LeadActivity"', '"Lead"', '"LeaveStatusTimeline"', '"Leave"',
    '"HallTicket"', '"ReportCard"', '"ExamResult"', '"ExamEnrollment"', '"Exam"', '"ExamSession"',
    '"NoticeAttachment"', '"Notice"', '"AcademicCalendar"',
    '"ChequeDetail"', '"FeePayment"', '"Fee"', '"FeeCategory"',
    '"ParentStudent"', '"Parent"', '"StudentAttendance"', '"StudentDocument"', '"IdCard"', '"Student"',
    '"TeachingAssignment"', '"Section"', '"Subject"', '"Grade"',
    '"GradeBand"', '"GradingScale"', '"TeacherProfile"', '"Teacher"',
    '"Membership"', '"Invitation"', '"AcademicYear"',
    '"Organization"', '"Institution"',
    '"Notification"', '"NotificationLog"', '"ScheduledJob"', '"Certificate"',
    '"ComplaintStatusTimeline"', '"AnonymousComplaint"',
    '"DeviceToken"', '"Account"', '"Session"', '"Verification"', '"User"'
  ];
  for (const table of tables) {
    try {
      await pool.query(`DELETE FROM ${table}`);
    } catch {
      // Ignore errors for tables that don't exist or have no data
    }
  }
  console.log('   ✅ Data cleared\n');

  const now = new Date();
  const adminId = `user_${generateId()}`;

  // ==========================================
  // 1. Create Admin User
  // ==========================================
  console.log('👤 Creating Admin User...');
  await pool.query(
    `INSERT INTO "User" (id, email, "firstName", "lastName", name, image, "emailVerified", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [adminId, 'admin@svmpune.edu.in', 'Rajesh', 'Deshmukh', 'Rajesh Deshmukh', '', true, true, now, now]
  );
  console.log(`   ✅ Admin User: admin@svmpune.edu.in`);

  // ==========================================
  // 2. Create Institution (Trust)
  // ==========================================
  console.log('🏛️ Creating Institution...');
  const institutionId = generateId();
  await pool.query(
    `INSERT INTO "Institution" (id, name, slug, description, type, "contactEmail", "contactPhone", website, address, city, state, "pinCode", "ownerId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      institutionId, 'Saraswati Vidya Mandir Trust', 'svm-trust',
      'A premier educational trust running quality schools across India since 1985.',
      InstitutionType.TRUST, 'info@svmtrust.edu.in', '+912012345678', 'https://www.svmtrust.edu.in',
      'Plot No. 45, Education Hub, Kothrud', 'Pune', 'Maharashtra', '411038',
      adminId, now, now
    ]
  );
  console.log(`   ✅ Institution: Saraswati Vidya Mandir Trust`);

  // ==========================================
  // 3. Create Organization (School)
  // ==========================================
  console.log('🏫 Creating Organization...');
  const orgId = `org_${generateId()}`;
  await pool.query(
    `INSERT INTO "Organization" (id, name, slug, "institutionId", "contactEmail", "contactPhone", website, "isActive", "walletBalance", "organizationType", "establishedYear", "createdBy", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      orgId, 'Saraswati Vidya Mandir English Medium School', 'svm-school-pune',
      institutionId, 'admin@svmpune.edu.in', '+912012345679', 'https://www.svmpune.edu.in',
      true, 500000, OrganizationType.SCHOOL, 1995,
      adminId, now, now
    ]
  );
  console.log(`   ✅ Organization: SVM English Medium School`);

  // ==========================================
  // 4. Create Academic Year
  // ==========================================
  console.log('📅 Creating Academic Year 2025-26...');
  const academicYearId = generateId();
  await pool.query(
    `INSERT INTO "AcademicYear" (id, "organizationId", name, "startDate", "endDate", type, "isCurrent", description, "createdBy", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      academicYearId, orgId, '2025-26', '2025-04-01', '2026-03-31',
      YearType.ANNUAL, true, 'Academic Year 2025-26 (April 2025 - March 2026)',
      adminId, now, now
    ]
  );
  console.log(`   ✅ Academic Year: 2025-26`);

  // ==========================================
  // 5. Create Admin User & Membership
  // ==========================================
  console.log('🔑 Creating Admin User & Membership...');
  const adminUserId = `user_${generateId()}`;
  await pool.query(
    `INSERT INTO "User" (id, email, "firstName", "lastName", name, image, "emailVerified", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [adminUserId, 'sameerkad2001@gmail.com', 'Sameer', 'Kad', 'Sameer Kad', '', true, true, now, now]
  );
  console.log(`   ✅ Admin User: sameerkad2001@gmail.com`);

  await pool.query(
    `INSERT INTO "Membership" (id, "userId", "organizationId", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
     [generateId(), adminUserId, orgId, Role.ADMIN, MembershipStatus.ACTIVE, now, now]
  );

  // Also create membership for original admin
  await pool.query(
    `INSERT INTO "Membership" (id, "userId", "organizationId", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
     [generateId(), adminId, orgId, Role.ADMIN, MembershipStatus.ACTIVE, now, now]
  );

  // ==========================================
  // 6. Create Grading Scale (CBSE Style)
  // ==========================================
  console.log('📊 Creating Grading Scale...');
  const gradingScaleId = generateId();
  await pool.query(
    `INSERT INTO "GradingScale" (id, name, "organizationId", "isDefault", rounding, "passThreshold", "pointsMode", "allowGrace", "maxGraceMarks", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
     [gradingScaleId, 'CBSE Secondary Grading System', orgId, true, RoundingRule.NEAREST, 33.0, PointsMode.GPA, true, 3, now, now]
  );

  const gradeBands = [
    ['A1', 91, 100, 10, 'Outstanding'],
    ['A2', 81, 90, 9, 'Excellent'],
    ['B1', 71, 80, 8, 'Very Good'],
    ['B2', 61, 70, 7, 'Good'],
    ['C1', 51, 60, 6, 'Above Average'],
    ['C2', 41, 50, 5, 'Average'],
    ['D', 33, 40, 4, 'Below Average'],
    ['E', 0, 32, 0, 'Fail'],
  ];
  for (const [label, min, max, points, desc] of gradeBands) {
    await pool.query(
      `INSERT INTO "GradeBand" (id, "gradingScaleId", label, "minPercentage", "maxPercentage", points, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [generateId(), gradingScaleId, label, min, max, points, desc]
    );
  }
  console.log(`   ✅ Grading Scale: CBSE`);

  // ==========================================
  // 7. Create Grades
  // ==========================================
  console.log('📚 Creating Grades (1-10)...');
  const gradeRecords: Record<string, string> = {};
  for (const gradeName of CONFIG.grades) {
    const gradeId = generateId();
    await pool.query(
      `INSERT INTO "Grade" (id, grade, "organizationId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [gradeId, gradeName, orgId, now, now]
    );
    gradeRecords[gradeName] = gradeId;
  }
  console.log(`   ✅ 10 Grades created`);

  // ==========================================
  // 8. Create Subjects
  // ==========================================
  console.log('📖 Creating Subjects...');
  const subjectRecords: Record<string, Record<string, string>> = {};
  for (const gradeName of CONFIG.grades) {
    const gradeNum = gradeName.replace('Grade ', '');
    const subjects = INDIAN_SUBJECTS_BY_GRADE[gradeNum] || [];
    subjectRecords[gradeName] = {};

    for (const subjectName of subjects) {
      const code = `${gradeNum}${subjectName.substring(0, 3).toUpperCase()}`;
      const subjectId = generateId();
      await pool.query(
        `INSERT INTO "Subject" (id, name, code, description, "organizationId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [subjectId, subjectName, code, `${subjectName} for ${gradeName}`, orgId, now, now]
      );
      subjectRecords[gradeName][subjectName] = subjectId;
    }
  }
  console.log(`   ✅ Subjects created for all grades`);

  // ==========================================
  // 9. Create Sections
  // ==========================================
  console.log('🏠 Creating Sections...');
  const sectionRecords: Record<string, Record<string, string>> = {};
  for (const gradeName of CONFIG.grades) {
    const sections = CONFIG.sectionsPerGrade[gradeName as keyof typeof CONFIG.sectionsPerGrade] || ['A'];
    sectionRecords[gradeName] = {};

    for (const sectionName of sections) {
      const sectionId = generateId();
      await pool.query(
        `INSERT INTO "Section" (id, name, "gradeId", "organizationId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sectionId, sectionName, gradeRecords[gradeName], orgId, now, now]
      );
      sectionRecords[gradeName][sectionName] = sectionId;
    }
  }
  console.log(`   ✅ Sections created for all grades`);

  // ==========================================
  // 10. Create Teachers
  // ==========================================
  console.log(`👨‍🏫 Creating ${CONFIG.teachersCount} Teachers...`);
  const teacherRecords: { id: string; userId: string }[] = [];
  const teacherSubjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education', 'EVS'];

  for (let i = 0; i < CONFIG.teachersCount; i++) {
    const isMale = Math.random() > 0.4;
    const firstName = isMale ? randomItem(INDIAN_FIRST_NAMES_MALE) : randomItem(INDIAN_FIRST_NAMES_FEMALE);
    const lastName = randomItem(INDIAN_LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@svmpune.edu.in`;
    const userId = `user_${generateId()}`;
    const teacherId = generateId();

    // Create User
    await pool.query(
      `INSERT INTO "User" (id, email, "firstName", "lastName", name, "image", "emailVerified", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, email, firstName, lastName, `${firstName} ${lastName}`, '', true, true, now, now]
    );

    // Create Teacher
    const joinedDate = randomDate(new Date('2018-04-01'), new Date('2025-03-31'));
    await pool.query(
      `INSERT INTO "Teacher" (id, "userId", "employeeCode", "organizationId", "employmentStatus", "isActive", "joinedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
       [teacherId, userId, `TCH-${String(i + 1).padStart(3, '0')}`, orgId, EmploymentStatus.ACTIVE, true, joinedDate, now, now]
    );

    // Create Teacher Profile
    const city = randomItem(INDIAN_CITIES);
    await pool.query(
      `INSERT INTO "TeacherProfile" (id, "teacherId", "contactEmail", "contactPhone", address, city, state, "dateOfBirth", qualification, "experienceInYears", "resumeUrl", "joinedAt", bio, "teachingPhilosophy", "specializedSubjects", "preferredGrades", "idProofUrl", "languagesKnown", "certificateUrls")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        generateId(), teacherId, email, generateIndianPhone(),
        `${randomItem(INDIAN_ADDRESSES)}, ${city.city}`, city.city, city.state,
        randomDate(new Date('1975-01-01'), new Date('1995-12-31')),
        randomItem(['B.Ed', 'M.Ed', 'B.Sc B.Ed', 'M.Sc B.Ed', 'BA B.Ed']),
        randomInt(2, 20), '', joinedDate,
        `Experienced ${randomItem(teacherSubjects)} teacher.`,
        'Believes in holistic development.',
        generatePgArray([randomItem(teacherSubjects)]),
        generatePgArray([['Grade 1', 'Grade 2', 'Grade 3'], ['Grade 4', 'Grade 5', 'Grade 6'], ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']][randomInt(0, 2)]),
        '',
        generatePgArray(['English', 'Hindi', randomItem(['Marathi', 'Tamil', 'Telugu', 'Gujarati'])]),
        '[]'
      ]
    );

    // Create Membership
    await pool.query(
      `INSERT INTO "Membership" (id, "userId", "organizationId", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
       [generateId(), userId, orgId, Role.TEACHER, MembershipStatus.ACTIVE, now, now]
    );

    teacherRecords.push({ id: teacherId, userId });
  }
  console.log(`   ✅ ${CONFIG.teachersCount} Teachers created`);

  // ==========================================
  // 11. Create Teaching Assignments
  // ==========================================
  console.log('📋 Creating Teaching Assignments...');
  for (const gradeName of CONFIG.grades) {
    const gradeNum = gradeName.replace('Grade ', '');
    const subjects = INDIAN_SUBJECTS_BY_GRADE[gradeNum] || [];
    const sections = CONFIG.sectionsPerGrade[gradeName as keyof typeof CONFIG.sectionsPerGrade] || ['A'];

    for (const subjectName of subjects) {
      for (const sectionName of sections) {
        const teacher = teacherRecords[randomInt(0, teacherRecords.length - 1)];
        try {
          await pool.query(
            `INSERT INTO "TeachingAssignment" (id, "academicYearId", "organizationId", "teacherId", "subjectId", "gradeId", "sectionId", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              generateId(), academicYearId, orgId, teacher.id,
              subjectRecords[gradeName][subjectName], gradeRecords[gradeName],
               sectionRecords[gradeName][sectionName], AssignmentStatus.ASSIGNED, now, now
            ]
          );
        } catch (e) {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`   ✅ Teaching Assignments created`);

  // ==========================================
  // 12. Set Class Teachers
  // ==========================================
  console.log('👨‍🏫 Assigning Class Teachers...');
  let teacherIndex = 0;
  for (const gradeName of CONFIG.grades) {
    const sections = CONFIG.sectionsPerGrade[gradeName as keyof typeof CONFIG.sectionsPerGrade] || ['A'];
    for (const sectionName of sections) {
      const sectionId = sectionRecords[gradeName][sectionName];
      const classTeacher = teacherRecords[teacherIndex % teacherRecords.length];
      await pool.query(
        `UPDATE "Section" SET "classTeacherId" = $1 WHERE id = $2`,
        [classTeacher.id, sectionId]
      );
      teacherIndex++;
    }
  }
  console.log(`   ✅ Class Teachers assigned`);

  // ==========================================
  // 13. Create Students
  // ==========================================
  console.log('👨‍🎓 Creating Students...');
  const studentRecords: { id: string; gradeId: string; sectionId: string; rollNumber: string }[] = [];
  let studentGlobalIndex = 1;

  const castes = ['General', 'OBC', 'SC', 'ST', ''];

  for (const gradeName of CONFIG.grades) {
    const gradeNum = gradeName.replace('Grade ', '');
    const sections = CONFIG.sectionsPerGrade[gradeName as keyof typeof CONFIG.sectionsPerGrade] || ['A'];
    const studentsPerSection = CONFIG.studentsPerSection[gradeName as keyof typeof CONFIG.studentsPerSection] || 30;

    for (const sectionName of sections) {
      for (let i = 1; i <= studentsPerSection; i++) {
        const isMale = Math.random() > 0.48;
        const firstName = isMale ? randomItem(INDIAN_FIRST_NAMES_MALE) : randomItem(INDIAN_FIRST_NAMES_FEMALE);
        const lastName = randomItem(INDIAN_LAST_NAMES);
        const email = generateIndianEmail(firstName, lastName);
        const phone = generateIndianPhone();
        const city = randomItem(INDIAN_CITIES);
        const baseYear = 2025 - (parseInt(gradeNum) + 5);
        const dob = new Date(baseYear, randomInt(0, 11), randomInt(1, 28));
        const rollNumber = `${gradeNum}${sectionName}-${String(i).padStart(2, '0')}`;

        const userId = `user_${generateId()}`;
        const studentId = generateId();

        // Create User
        await pool.query(
          `INSERT INTO "User" (id, email, "firstName", "lastName", name, "image", "emailVerified", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [userId, email, firstName, lastName, `${firstName} ${lastName}`, '', false, true, now, now]
        );

        // Create Parent
        const parentFirstName = randomItem(isMale ? INDIAN_FIRST_NAMES_FEMALE : INDIAN_FIRST_NAMES_MALE);
        const parentEmail = generateIndianEmail(parentFirstName, lastName);
        const parentPhone = generateIndianPhone();
        const parentId = generateId();

        await pool.query(
          `INSERT INTO "Parent" (id, "organizationId", "userId", "firstName", "lastName", email, "phoneNumber", "whatsAppNumber", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [parentId, orgId, null, parentFirstName, lastName, parentEmail, parentPhone, parentPhone, now, now]
        );

        // Create Student
        await pool.query(
          `INSERT INTO "Student" (id, "userId", "organizationId", "gradeId", "sectionId", "firstName", "lastName", "fullName", "motherName", "dateOfBirth", "bloodGroup", address, caste, "subCaste", "profileImage", "rollNumber", "phoneNumber", "whatsAppNumber", email, "emergencyContact", gender, status, "admissionDate", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
          [
            studentId, userId, orgId, gradeRecords[gradeName], sectionRecords[gradeName][sectionName],
            firstName, lastName, `${firstName} ${lastName}`, randomItem(INDIAN_FIRST_NAMES_FEMALE),
            dob, randomItem(Object.values(BloodGroup)),
            `${randomItem(INDIAN_ADDRESSES)}, ${city.city}, ${city.state}`,
            randomItem(castes), '', '', rollNumber, phone, phone, email, parentPhone,
            isMale ? Gender.MALE : Gender.FEMALE, StudentStatus.ACTIVE,
            randomDate(new Date('2025-03-01'), new Date('2025-04-15')),
            now, now
          ]
        );

        // Link Parent-Student
        await pool.query(
          `INSERT INTO "ParentStudent" (id, "studentId", "parentId", relationship, "isPrimary")
           VALUES ($1, $2, $3, $4, $5)`,
          [generateId(), studentId, parentId, isMale ? GuardianType.MOTHER : GuardianType.FATHER, true]
        );

        // Create Membership
        await pool.query(
          `INSERT INTO "Membership" (id, "userId", "organizationId", role, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [generateId(), userId, orgId, Role.STUDENT, MembershipStatus.ACTIVE, now, now]
        );

        studentRecords.push({ id: studentId, gradeId: gradeRecords[gradeName], sectionId: sectionRecords[gradeName][sectionName], rollNumber });
        studentGlobalIndex++;
      }
    }
  }
  console.log(`   ✅ ${studentRecords.length} Students created`);

  // ==========================================
  // 14. Create Fee Categories
  // ==========================================
  console.log('💰 Creating Fee Categories...');
  const feeCategoryNames = [
    { name: 'Tuition Fee', description: 'Annual tuition fee for academic year' },
    { name: 'Transport Fee', description: 'School bus transportation charges' },
    { name: 'Examination Fee', description: 'Term examination fees' },
    { name: 'Lab Fee', description: 'Science and computer lab charges' },
    { name: 'Annual Day Fee', description: 'Annual function and cultural event charges' },
    { name: 'Library Fee', description: 'Library and book bank charges' },
    { name: 'Sports Fee', description: 'Sports equipment and coaching charges' },
    { name: 'Computer Fee', description: 'Computer lab and IT infrastructure' },
  ];

  const feeCategoryIds: Record<string, string> = {};
  for (const fc of feeCategoryNames) {
    const fcId = generateId();
    await pool.query(
      `INSERT INTO "FeeCategory" (id, name, description, "organizationId", "academicYearId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [fcId, fc.name, fc.description, orgId, academicYearId, now, now]
    );
    feeCategoryIds[fc.name] = fcId;
  }
  console.log(`   ✅ ${feeCategoryNames.length} Fee Categories created`);

  // ==========================================
  // 15. Create Fees for Students
  // ==========================================
  console.log('📄 Creating Fee Records...');
  let feeCount = 0;
  const feeRecordsToPay: Array<{ id: string; paidAmount: number }> = [];
  const paymentMethods = [PaymentMethod.CASH, PaymentMethod.UPI, PaymentMethod.ONLINE, PaymentMethod.BANK_TRANSFER];

  for (const student of studentRecords) {
    const gradeName = CONFIG.grades.find(g => gradeRecords[g] === student.gradeId) || 'Grade 1';
    const gradeNum = gradeName.replace('Grade ', '');
    const fs = FEE_STRUCTURE_BY_GRADE[gradeNum] || FEE_STRUCTURE_BY_GRADE['1'];

    const feeTypes = [
      { cat: 'Tuition Fee', amount: fs.tuition, due: '2025-04-30' },
      { cat: 'Transport Fee', amount: fs.transport, due: '2025-04-30', skip: Math.random() < 0.3 },
      { cat: 'Examination Fee', amount: fs.exam, due: '2025-08-15' },
      { cat: 'Lab Fee', amount: fs.lab, due: '2025-05-31', skip: parseInt(gradeNum) < 4 },
      { cat: 'Annual Day Fee', amount: fs.annual, due: '2026-02-28' },
    ];

    for (const ft of feeTypes) {
      if (ft.skip) continue;
      const isPaid = Math.random() > 0.35;
      const paidAmount = isPaid ? ft.amount : ft.amount * 0.5;
      const pendingAmount = isPaid ? 0 : ft.amount * 0.5;
      const feeId = generateId();

      await pool.query(
        `INSERT INTO "Fee" (id, "totalFee", "paidAmount", "pendingAmount", "dueDate", status, "studentId", "feeCategoryId", "organizationId", "academicYearId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          feeId, ft.amount, paidAmount, pendingAmount, ft.due,
          isPaid ? FeeStatus.PAID : FeeStatus.UNPAID, student.id, feeCategoryIds[ft.cat], orgId, academicYearId, now, now
        ]
      );
      feeCount++;

      if (paidAmount > 0) {
        feeRecordsToPay.push({ id: feeId, paidAmount });
      }
    }
  }
  console.log(`   ✅ ${feeCount} Fee Records created`);

  // Create FeePayment records for fees with paidAmount > 0
  console.log('💳 Creating Fee Payments...');
  let payCount = 0;
  for (const fr of feeRecordsToPay) {
    const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const recNum = `SVM-RCP-${String(1000 + payCount)}`;
    const payId = generateId();
    const paymentDate = randomDate(new Date('2025-04-01'), new Date('2026-03-31'));

    await pool.query(
      `INSERT INTO "FeePayment" (id, "feeId", amount, status, "paymentMethod", "paymentDate", "receiptNumber", "payerId", "organizationId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        payId, fr.id, fr.paidAmount, PaymentStatus.COMPLETED, payMethod,
        paymentDate, recNum, adminId, orgId, now, now,
      ]
    );
    payCount++;
  }
  console.log(`   ✅ ${payCount} Fee Payments created`);

  // ==========================================
  // 16. Create Academic Calendar Events
  // ==========================================
  console.log('📅 Creating Academic Calendar Events...');
  for (const holiday of INDIAN_HOLIDAYS_2025_26) {
    await pool.query(
      `INSERT INTO "AcademicCalendar" (id, "organizationId", name, "startDate", "endDate", type, reason, "isRecurring", "createdBy", "createdAt", "updatedAt", "academicYearId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [generateId(), orgId, holiday.name, holiday.start, holiday.end, CalendarEventType.PLANNED, holiday.reason, true, adminId, now, now, academicYearId]
    );
  }
  console.log(`   ✅ ${INDIAN_HOLIDAYS_2025_26.length} Calendar Events created`);

  // ==========================================
  // 17. Create Notices
  // ==========================================
  console.log('📢 Creating Notices...');
  for (const noticeData of SCHOOL_NOTICES) {
    const startDate = randomDate(new Date('2025-08-01'), new Date('2026-02-01'));
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO "Notice" (id, "organizationId", "academicYearId", title, summary, content, "startDate", "endDate", "noticeType", priority, status, "createdBy", "approvedBy", "approvedAt", "publishedBy", "publishedAt", "isPinned", "isUrgent", "emailNotification", "pushNotification", "whatsAppNotification", "smsNotification", "targetRoles", "targetGrades", "targetSections", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)`,
      [
        generateId(), orgId, academicYearId, noticeData.title, noticeData.summary, noticeData.content,
         startDate, endDate, noticeData.type, noticeData.priority, NoticeStatus.PUBLISHED,
         adminId, adminId, now, adminId, now,
         noticeData.priority === NoticePriority.URGENT, noticeData.priority === NoticePriority.URGENT,
         true, true, false, false,
         generatePgArray([Role.STUDENT, Role.PARENT, Role.TEACHER]),
        generatePgArray([]), generatePgArray([]),
        now, now
      ]
    );
  }
  console.log(`   ✅ ${SCHOOL_NOTICES.length} Notices created`);

  // ==========================================
  // 18. Create Exam Sessions
  // ==========================================
  console.log('📝 Creating Exam Sessions...');
  const examSessionIds: string[] = [];
  for (const sessionData of CONFIG.examSessions) {
    const sessionId = generateId();
    await pool.query(
      `INSERT INTO "ExamSession" (id, title, description, "academicYearId", "organizationId", "startDate", "endDate", "createdBy", "createdAt", "updatedAt", "gradingScaleId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [sessionId, sessionData.title, `${sessionData.title} for Academic Year 2025-26`, academicYearId, orgId, sessionData.start, sessionData.end, adminId, now, now, gradingScaleId]
    );
    examSessionIds.push(sessionId);
  }
  console.log(`   ✅ ${CONFIG.examSessions.length} Exam Sessions created`);

  // ==========================================
  // 19. Create Exams
  // ==========================================
  console.log('📋 Creating Exams...');
  let examCount = 0;
  const examSubjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit'];

  for (const sessionId of examSessionIds) {
    const session = CONFIG.examSessions.find(s => examSessionIds.indexOf(sessionId) === CONFIG.examSessions.indexOf(s))!;
    for (const gradeName of CONFIG.grades) {
      const gradeNum = gradeName.replace('Grade ', '');
      const sections = CONFIG.sectionsPerGrade[gradeName as keyof typeof CONFIG.sectionsPerGrade] || ['A'];
      const subjects = (INDIAN_SUBJECTS_BY_GRADE[gradeNum] || []).filter(s => examSubjects.includes(s));

      for (const subjectName of subjects) {
        for (const sectionName of sections) {
          const maxMarks = parseInt(gradeNum) >= 9 ? 80 : 50;
          const passingMarks = Math.ceil(maxMarks * 0.33);

          try {
            const startDate = randomDate(new Date(session.start), new Date(session.end));
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

            await pool.query(
              `INSERT INTO "Exam" (id, title, description, "examSessionId", "subjectId", "gradeId", "sectionId", "organizationId", "maxMarks", "passingMarks", weightage, "evaluationType", mode, status, instructions, "durationInMinutes", venue, supervisors, "startDate", "endDate", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
              [
                generateId(), `${subjectName} - ${session.title}`, `${subjectName} for ${gradeName} Section ${sectionName}`,
                sessionId, subjectRecords[gradeName][subjectName], gradeRecords[gradeName], sectionRecords[gradeName][sectionName],
                 orgId, maxMarks, passingMarks, 0.25, EvaluationType.EXAM, ExamMode.OFFLINE, ExamStatus.UPCOMING,
                'Answer all questions. Write neatly.', parseInt(gradeNum) >= 9 ? 180 : 120,
                `Room ${gradeNum}${sectionName}`, generatePgArray([adminId]),
                startDate, endDate, now, now
              ]
            );
            examCount++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
    }
  }
  console.log(`   ✅ ${examCount} Exams created`);

  // ==========================================
  // 20. Create Leads
  // ==========================================
  console.log(`🎯 Creating ${CONFIG.leadsCount} Leads...`);
  const leadStatuses = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.INTERESTED, LeadStatus.VISITED, LeadStatus.QUALIFIED, LeadStatus.NOT_INTERESTED, LeadStatus.CONVERTED, LeadStatus.UNRESPONSIVE];
  const leadSources = [LeadSource.WALK_IN, LeadSource.WEBSITE, LeadSource.WORD_OF_MOUTH, LeadSource.FACEBOOK_ADS, LeadSource.GOOGLE_ADS, LeadSource.REFERRAL_PROGRAM, LeadSource.PRINT_MEDIA, LeadSource.PHONE_CALL];

  for (let i = 0; i < CONFIG.leadsCount; i++) {
    const isMale = Math.random() > 0.45;
    const studentName = `${isMale ? randomItem(INDIAN_FIRST_NAMES_MALE) : randomItem(INDIAN_FIRST_NAMES_FEMALE)} ${randomItem(INDIAN_LAST_NAMES)}`;
    const parentName = `${randomItem(INDIAN_FIRST_NAMES_MALE)} ${randomItem(INDIAN_LAST_NAMES)}`;
    const city = randomItem(INDIAN_CITIES);
    const status = randomItem(leadStatuses);
    const leadId = generateId();

    await pool.query(
      `INSERT INTO "Lead" (id, "organizationId", "academicYearId", "studentName", "parentName", phone, email, "whatsappNumber", "enquiryFor", "currentSchool", address, city, state, "pinCode", source, status, priority, score, "assignedToUserId", "assignedAt", "nextFollowUpAt", "lastContactedAt", "followUpCount", "convertedAt", notes, requirements, "budgetRange", "closureReason", "createdByUserId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)`,
      [
        leadId, orgId, academicYearId, studentName, parentName,
        generateIndianPhone(), Math.random() > 0.3 ? generateIndianEmail(studentName.split(' ')[0], studentName.split(' ')[1]) : null,
        generateIndianPhone(), `Grade ${randomInt(1, 10)} Admission`,
        randomItem(['St. Mary\'s School', 'DAV Public School', 'Kendriya Vidyalaya', 'Ryan International', '']),
        `${randomItem(INDIAN_ADDRESSES)}, ${city.city}`, city.city, city.state, randomItem(city.pinCodes),
        randomItem(leadSources), status, randomItem([LeadPriority.LOW, LeadPriority.MEDIUM, LeadPriority.HIGH]),
        randomInt(20, 95),
        Math.random() > 0.5 ? randomItem(teacherRecords).userId : null,
        Math.random() > 0.5 ? randomDate(new Date('2025-06-01'), new Date('2025-12-01')) : null,
        Math.random() > 0.4 ? randomDate(new Date('2026-01-01'), new Date('2026-03-01')) : null,
        Math.random() > 0.5 ? randomDate(new Date('2025-10-01'), new Date('2025-12-31')) : null,
        randomInt(0, 8),
        status === LeadStatus.CONVERTED ? now : null,
        randomItem(['Parent interested in admission.', 'Visited campus during open house.', 'Requested fee structure.', 'Looking for transportation.']),
        generatePgArray(randomItem([['Transportation'], ['Scholarship'], ['Transportation', 'Scholarship'], []])),
        randomItem(['50k-1L', '1L-2L', '2L-3L', '3L+', '']),
        ([LeadStatus.NOT_INTERESTED, LeadStatus.INVALID, LeadStatus.UNRESPONSIVE] as LeadStatus[]).includes(status) ? randomItem(['Moved to another city', 'Admitted elsewhere', 'Fee not affordable']) : null,
        adminId, now, now
      ]
    );

    // Lead Activities
    const activityCount = randomInt(1, 3);
    for (let j = 0; j < activityCount; j++) {
      await pool.query(
        `INSERT INTO "LeadActivity" (id, "leadId", type, title, description, outcome, sentiment, "performedById", "performedAt", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          generateId(), leadId,
          randomItem([LeadActivityType.CALL, LeadActivityType.WHATSAPP, LeadActivityType.EMAIL, LeadActivityType.VISIT, LeadActivityType.FOLLOW_UP]),
          randomItem(['Called parent for follow-up', 'Sent brochure via WhatsApp', 'Email sent with fee structure']),
          randomItem(['Parent showed interest.', 'Requested transport details.', 'Asked about scholarship.']),
          randomItem(['Interested', 'Will decide later', 'Positive response']),
          randomItem([Sentiment.POSITIVE, Sentiment.NEUTRAL]),
          adminId, randomDate(new Date('2025-08-01'), new Date('2025-12-31')), now
        ]
      );
    }
  }
  console.log(`   ✅ ${CONFIG.leadsCount} Leads created`);

  // ==========================================
  // 21. Create Default AI Agents
  // ==========================================
  console.log('🤖 Creating FeeSense AI Agent...');
  const feeSenseAgentId = generateId();
  await pool.query(
    `INSERT INTO "AiAgent" (id, "organizationId", name, description, status, "llmModel", "llmMaxSteps", "totalRuns", "successfulRuns", "failedRuns", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      feeSenseAgentId, orgId, 'FeeSense AI',
      'Fee collection and payment reminders',
      'ACTIVE', 'google/gemini-2.5-flash', 20, 0, 0, 0, now, now,
    ]
  );
  await pool.query(
    `INSERT INTO "AiAgentConfig" (id, "agentId", config, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [
      generateId(), feeSenseAgentId,
      JSON.stringify({
        riskThresholds: { low: 30, medium: 60, high: 80 },
        channels: { email: true, sms: true, whatsapp: true, voice: false },
        notification: { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 },
        report: { deliverTo: [], channels: ['EMAIL'] },
        llmMaxOutputTokens: 8192,
        throttle: { monthlyCap: 4, notificationWindow: { startHour: 11, endHour: 19 }, voiceWindow: { startHour: 11, endHour: 19 } },
      }),
      now, now,
    ]
  );
  console.log(`   ✅ FeeSense Agent created`);

  console.log('🤖 Creating Attendance Monitor Agent...');
  const attendanceAgentId = generateId();
  await pool.query(
    `INSERT INTO "AiAgent" (id, "organizationId", name, description, status, "llmModel", "llmMaxSteps", "totalRuns", "successfulRuns", "failedRuns", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      attendanceAgentId, orgId, 'Attendance Monitor',
      'Attendance tracking and alerts',
      'ACTIVE', 'google/gemini-2.5-flash', 20, 0, 0, 0, now, now,
    ]
  );
  await pool.query(
    `INSERT INTO "AiAgentConfig" (id, "agentId", config, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [
      generateId(), attendanceAgentId,
      JSON.stringify({
        absenceThreshold: 75,
        lookbackDays: 90,
        notifyParent: true,
        notifyTeacher: true,
      }),
      now, now,
    ]
  );
  console.log(`   ✅ Attendance Monitor Agent created`);

  // ==========================================
  // 22. Create Notification Settings
  // ==========================================
  console.log('🔔 Creating Notification Settings...');
  const notificationTypes = [
    { type: NotificationType.NOTICE, label: 'Notice Alerts', description: 'Notifications for new notices and announcements' },
    { type: NotificationType.FEE, label: 'Fee Reminders', description: 'Fee payment reminders and receipts' },
    { type: NotificationType.ATTENDANCE, label: 'Attendance Alerts', description: 'Daily attendance notifications' },
    { type: NotificationType.DOCUMENT, label: 'Document Requests', description: 'Document submission reminders' },
    { type: NotificationType.EXAM, label: 'Exam Notifications', description: 'Exam schedules and result announcements' },
    { type: NotificationType.LEAVE, label: 'Leave Updates', description: 'Leave application status updates' },
    { type: NotificationType.ACADEMIC_REPORT, label: 'Academic Reports', description: 'Report cards and academic progress' },
    { type: NotificationType.GREETING, label: 'Greetings', description: 'Festival and special occasion greetings' },
  ];

  for (const nt of notificationTypes) {
    await pool.query(
      `INSERT INTO "NotificationSetting" (id, "organizationId", "notificationType", label, description, channels, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        generateId(), orgId, nt.type, nt.label, nt.description,
        JSON.stringify({ email: { enabled: true, locked: false }, sms: { enabled: true, locked: false }, whatsapp: { enabled: false, locked: false }, push: { enabled: true, locked: false } }),
        true, now, now
      ]
    );
  }
  console.log(`   ✅ ${notificationTypes.length} Notification Settings created`);

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n✅ ==========================================');
  console.log('✅ Indian School Data Seed Completed!');
  console.log('✅ ==========================================');
  console.log(`\n📊 Summary:`);
  console.log(`   Institution: 1 (Saraswati Vidya Mandir Trust)`);
  console.log(`   Organization: 1 (SVM English Medium School)`);
  console.log(`   Academic Year: 1 (2025-26)`);
  console.log(`   Grades: 10 (Grade 1 - Grade 10)`);
  console.log(`   Students: ${studentRecords.length}`);
  console.log(`   Teachers: ${CONFIG.teachersCount}`);
  console.log(`   Fee Categories: ${feeCategoryNames.length}`);
  console.log(`   Fee Records: ${feeCount}`);
  console.log(`   Exam Sessions: ${CONFIG.examSessions.length}`);
  console.log(`   Exams: ${examCount}`);
  console.log(`   Leads: ${CONFIG.leadsCount}`);
  console.log(`   Notices: ${SCHOOL_NOTICES.length}`);
  console.log(`   Calendar Events: ${INDIAN_HOLIDAYS_2025_26.length}`);
  console.log(`   Notification Settings: ${notificationTypes.length}`);
  console.log(`   AI Agents: 2 (FeeSense AI + Attendance Monitor)`);
  console.log('\n🎉 Seed data ready!\n');

  await pool.end();
}

main().catch(async (e) => {
  console.error('\n❌ Seed Error:', e);
  await pool.end();
  process.exit(1);
});
