import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import {
  NoticeType,
  LeadSource,
  LeadStatus,
  LeadPriority,
  NoticeStatus,
  NoticePriority,
  VehicleType,
} from '../generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

/* ----------------------------------------------
 * Prisma Setup
 * ---------------------------------------------- */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const pool = new Pool({ connectionString: process.env.DIRECT_URL });

/* ----------------------------------------------
 * Constants
 * ---------------------------------------------- */
const ORGANIZATION_ID = 'cmqpa555u0004psp7trtpac5s';
const ACADEMIC_YEAR_ID = 'cmqpa55hy0006psp79vw3qpiu';

const organizationIds = [ORGANIZATION_ID];
const academicYearIds = [ACADEMIC_YEAR_ID];
const userIds = [
  'user_30XKQEOZdJramwXYJjub34hJHSX',
  'user_30XR4ETWH7g6hEal8p6hfpBk5Ax',
];

const requirementsOptions = [
  'Transportation',
  'Hostel',
  'Scholarship',
  'Sports Facility',
  'Day Care',
  'After School',
];

const budgets = ['50k-1L', '1L-2L', '2L-3L', '3L+'];

const closedLeadStatuses: LeadStatus[] = [
  'NOT_INTERESTED',
  'INVALID',
  'UNRESPONSIVE',
  'LOST',
];

/* ----------------------------------------------
 * Utility Functions
 * ---------------------------------------------- */
function randomDates() {
  const start = faker.date.soon({ days: 30 });
  const end = faker.date.soon({ days: faker.number.int({ min: 1, max: 7 }), refDate: start });

  return { start, end };
}

function randomItem<T>(arr: readonly T[]): T {
  return faker.helpers.arrayElement(arr);
}

function randomMultiple<T>(arr: readonly T[]): T[] {
  return faker.helpers.arrayElements(arr, {
    min: 1,
    max: 3,
  });
}

function randomBoolean() {
  return faker.datatype.boolean();
}
/* ----------------------------------------------
 * Notice Seeder
 * ---------------------------------------------- */
async function generateNotices(count: number) {
  console.log(`🌱 Creating ${count} notices...`);

  const notices = Array.from({ length: count }).map((_, i) => {
    const { start, end } = randomDates();

    return {
      noticeType: randomItem(Object.values(NoticeType)),
      title: `Event ${i + 1} ${faker.lorem.words(5)}`,
      startDate: start,
      endDate: end,
      status: randomItem(Object.values(NoticeStatus)),
      priority: randomItem(Object.values(NoticePriority)),
      summary: faker.lorem.sentence(),
      content: faker.lorem.paragraph(2),
      emailNotification: randomBoolean(),
      pushNotification: randomBoolean(),
      whatsAppNotification: randomBoolean(),
      smsNotification: randomBoolean(),
      targetRoles: [],
      publishedBy: 'SYSTEM_SEED',
      academicYearId: randomItem(academicYearIds),
      organizationId: randomItem(organizationIds),
      createdBy: 'admin',
    };
  });

  await prisma.notice.createMany({ data: notices });
}

/* ----------------------------------------------
 * FeeSense Agent Seeder
 * ---------------------------------------------- */
async function initFeeSenseAgent() {
  console.log(`⚙️ Initializing FeeSense Agent...`);

  const orgId = randomItem(organizationIds);

  await prisma.aiAgent.create({
    data: {
      organizationId: orgId,
      name: 'FeeSense AI',
      description: 'Fee collection and payment reminders',
      status: 'ACTIVE',
      config: {
        create: {
          config: {
            riskThresholds: { low: 30, medium: 60, high: 80 },
            channels: { email: true, sms: true, whatsapp: true, voice: false },
            notification: { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 },
            report: { deliverTo: [], channels: ['EMAIL'] },
            llmMaxOutputTokens: 8192,
            throttle: { monthlyCap: 4, notificationWindow: { startHour: 11, endHour: 19 }, voiceWindow: { startHour: 11, endHour: 19 } },
          },
        },
      },
    },
  });

  await prisma.aiAgent.create({
    data: {
      organizationId: orgId,
      name: 'Attendance Monitor',
      description: 'Attendance tracking and alerts',
      status: 'ACTIVE',
      config: {
        create: {
          config: {
            absenceThreshold: 75,
            lookbackDays: 90,
            notifyParent: true,
            notifyTeacher: true,
          },
        },
      },
    },
  });
}

/* ----------------------------------------------
 * Lead Seeder
 * ---------------------------------------------- */
async function generateLeads(count: number) {
  console.log(`🌱 Creating ${count} leads...`);

  for (let i = 0; i < count; i++) {
    const status = randomItem(Object.values(LeadStatus));
    const isClosed = closedLeadStatuses.includes(status);

    await prisma.lead.create({
      data: {
        organizationId: randomItem(organizationIds),
        academicYearId: randomItem(academicYearIds),

        studentName: faker.person.fullName(),
        parentName: faker.person.fullName(),

        phone: faker.phone.number({ style: 'national' }),
        whatsappNumber: faker.phone.number({ style: 'national' }),
        email: faker.internet.email(),

        enquiryFor: faker.word.words({ count: { min: 1, max: 3 } }),
        currentSchool: faker.company.name(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        pinCode: faker.location.zipCode('41####'),

        source: randomItem(Object.values(LeadSource)),
        status,
        priority: randomItem(Object.values(LeadPriority)),
        score: faker.number.int({ min: 0, max: 100 }),

        assignedToUserId: faker.helpers.maybe(() => randomItem(userIds), {
          probability: 0.5,
        }),

        assignedAt: faker.date.recent({ days: 10 }),
        nextFollowUpAt: faker.helpers.maybe(() => faker.date.soon({ days: 10 }), {
          probability: 0.5,
        }),

        lastContactedAt: faker.helpers.maybe(
          () => faker.date.recent({ days: 5 }),
          { probability: 0.5 }
        ),

        followUpCount: faker.number.int({ min: 0, max: 6 }),

        convertedAt:
          status === 'CONVERTED'
            ? faker.date.recent({ days: 15 })
            : null,

        // convertedToStudentId:
        //   status === 'CONVERTED'
        //     ? `student_${faker.string.uuid()}`
        //     : null,

        notes: faker.lorem.sentence(),
        requirements: randomMultiple(requirementsOptions),

        budgetRange: faker.helpers.maybe(
          () => randomItem(budgets),
          { probability: 0.4 }
        ),

        closureReason: isClosed ? faker.lorem.sentence() : null,

        createdByUserId: faker.helpers.maybe(
          () => randomItem(userIds),
          { probability: 0.8 }
        ),

        createdAt: faker.date.past({ years: 1 }),
      },
    });
  }
}

async function updateNotificationLog() {
  const notifications = await prisma.notificationLog.findMany({
    where: {
      // title: null,
      // message: null,
    },
  });

  for (const notification of notifications) {
    // await prisma.notificationLog.update({
    //   where: {
    //     id: notification.id,
    //   },
    //   data: {
    //     title: "Test Notification",
    //     message: "Test Notification lorem ipsum dolor sit amet consectetur adipiscing elit",
    //   },
    // });
  }
}

async function generateGradesAndSections() {
  const organizationId = 'org_30WQlEXgBepgHNrZYoYzx0xlqJg';

  // 1️⃣ Create Grades
  await prisma.grade.createMany({
    data: [
      // { grade: '1th', organizationId },
      // { grade: '2th', organizationId },
      { grade: '3th', organizationId },
      { grade: '4th', organizationId },
      { grade: '5th', organizationId },
      { grade: '6th', organizationId },
      { grade: '7th', organizationId },
      { grade: '8th', organizationId },
      { grade: '9th', organizationId },
      { grade: '10th', organizationId },
    ],
    skipDuplicates: true,
  });

  // // 2️⃣ Fetch created grades WITH IDs
  // const grades = await prisma.grade.findMany({
  //   where: { organizationId },
  // });

  // // 3️⃣ Create sections for EACH grade
  // const sectionNames = ['A', 'B', 'C', 'D',];

  // const sectionData = grades.flatMap((grade) =>
  //   sectionNames.map((name) => ({
  //     name,
  //     gradeId: grade.id,
  //     organizationId,
  //   }))
  // );

  // await prisma.section.createMany({
  //   data: sectionData,
  //   skipDuplicates: true,
  // });

  console.log("✅ Grades and sections created successfully");
}

async function seedTransport() {
  const orgId = ORGANIZATION_ID;
  const adminUserId = 'cmqpa4tu30001psp77xbsf56j';
  console.log('🚌 Seeding transport data...');

  let counter = 0;
  function cuid() {
    counter++;
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return 'c' + ts + rand + counter.toString(36).padStart(4, '0');
  }
  const now = new Date().toISOString();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM "TransportStop" WHERE "routeId" IN (SELECT id FROM "TransportRoute" WHERE "organizationId" = $1)', [orgId]);
    await client.query('DELETE FROM "TransportRoute" WHERE "organizationId" = $1', [orgId]);
    await client.query('DELETE FROM "Helper" WHERE "organizationId" = $1', [orgId]);
    await client.query('DELETE FROM "Driver" WHERE "organizationId" = $1', [orgId]);
    await client.query('DELETE FROM "Vehicle" WHERE "organizationId" = $1', [orgId]);

    const driverIds: string[] = [];
    for (const d of [
      { name: 'Ramesh Shinde', phone: '9876543210', alternatePhone: '9876543211', licenseNumber: 'MH12A20260012345', licenseExpiry: '2027-06-30' },
      { name: 'Suresh Kulkarni', phone: '9876543212', alternatePhone: null, licenseNumber: 'MH14B20260067890', licenseExpiry: '2026-12-31' },
      { name: 'Mahesh Jadhav', phone: '9876543213', alternatePhone: '9876543214', licenseNumber: 'MH02C20260054321', licenseExpiry: '2027-03-15' },
    ]) {
      const id = cuid();
      await client.query(
        'INSERT INTO "Driver" (id, "organizationId", name, phone, "alternatePhone", "licenseNumber", "licenseExpiry", "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8,$8)',
        [id, orgId, d.name, d.phone, d.alternatePhone, d.licenseNumber, d.licenseExpiry, now]
      );
      driverIds.push(id);
    }

    const helperIds: string[] = [];
    for (const h of [
      { name: 'Vikas Pawar', phone: '9876543215', alternatePhone: null },
      { name: 'Sunil Bhosale', phone: '9876543216', alternatePhone: '9876543217' },
    ]) {
      const id = cuid();
      await client.query(
        'INSERT INTO "Helper" (id, "organizationId", name, phone, "alternatePhone", "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,true,$6,$6)',
        [id, orgId, h.name, h.phone, h.alternatePhone, now]
      );
      helperIds.push(id);
    }

    const vehicleIds: string[] = [];
    for (const v of [
      { registrationNo: 'MH12PA1234', type: 'BUS', capacity: 52 },
      { registrationNo: 'MH12PA5678', type: 'BUS', capacity: 42 },
      { registrationNo: 'MH12PA9012', type: 'VAN', capacity: 16 },
    ]) {
      const id = cuid();
      await client.query(
        'INSERT INTO "Vehicle" (id, "organizationId", "registrationNo", type, capacity, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,true,$6,$6)',
        [id, orgId, v.registrationNo, v.type, v.capacity, now]
      );
      vehicleIds.push(id);
    }

    const routes = [
      {
        name: 'Kothrud → Deccan (Morning)', code: 'R-M01',
        vehicleIdx: 0, driverIdx: 0, helperIdx: 0,
        stops: [
          { name: 'Kothrud Bus Depot', order: 1, landmark: 'Near Kothrud Depot', pickupTime: '07:00', latitude: 18.5074, longitude: 73.8078, locationSource: 'map' },
          { name: 'Vanaz Corner', order: 2, landmark: 'Near Vanaz Company', pickupTime: '07:10', latitude: 18.5110, longitude: 73.8152, locationSource: 'map' },
          { name: 'Paud Road Phata', order: 3, landmark: 'Near DAV School', pickupTime: '07:18', latitude: 18.5167, longitude: 73.8250, locationSource: 'map' },
          { name: 'Deccan Corner', order: 4, landmark: 'Bal Gandharva Ranga Mandir', pickupTime: '07:30', latitude: 18.5196, longitude: 73.8398, locationSource: 'map' },
          { name: 'Shiksha School', order: 5, landmark: 'Deccan Gymkhana', pickupTime: '07:40', latitude: 18.5236, longitude: 73.8449, locationSource: 'map' },
        ],
      },
      {
        name: 'Warje → Kothrud (Morning)', code: 'R-M02',
        vehicleIdx: 1, driverIdx: 1, helperIdx: 1,
        stops: [
          { name: 'Warje Jakat Naka', order: 1, landmark: 'Near Warje bus stop', pickupTime: '07:15', latitude: 18.4800, longitude: 73.7960, locationSource: 'map' },
          { name: 'Sinhagad Road Nal Stop', order: 2, landmark: 'Ambegaon BK', pickupTime: '07:25', latitude: 18.4875, longitude: 73.8050, locationSource: 'map' },
          { name: 'Nanded Phata', order: 3, landmark: 'Near Dmart', pickupTime: '07:35', latitude: 18.4930, longitude: 73.8150, locationSource: 'map' },
          { name: 'Karvenagar', order: 4, landmark: 'Kirloskar Road', pickupTime: '07:45', latitude: 18.4985, longitude: 73.8220, locationSource: 'map' },
          { name: 'Kothrud Stand', order: 5, landmark: 'Near Kothrud Bus Stand', pickupTime: '07:55', latitude: 18.5050, longitude: 73.8080, locationSource: 'map' },
        ],
      },
    ];

    for (const r of routes) {
      const routeId = cuid();
      await client.query(
        'INSERT INTO "TransportRoute" (id, "organizationId", name, code, "vehicleId", "driverId", "helperId", "createdBy", "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$9)',
        [routeId, orgId, r.name, r.code, vehicleIds[r.vehicleIdx], driverIds[r.driverIdx], helperIds[r.helperIdx], adminUserId, now]
      );
      for (const s of r.stops) {
        const stopId = cuid();
        await client.query(
          'INSERT INTO "TransportStop" (id, "routeId", name, "order", landmark, "pickupTime", latitude, longitude, "locationSource") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [stopId, routeId, s.name, s.order, s.landmark, s.pickupTime, s.latitude, s.longitude, s.locationSource]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Transport seeded');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Transport seed failed:', e);
  } finally {
    client.release();
  }
}

async function main() {
  console.log('\n🚀 Seeding Started...\n');
  await seedTransport();
  // await generateGradesAndSections();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



// await prisma.scheduledJob.create({
//   data: {
//     organizationId: 'org_2yikjYDIq5D8AjIyLvq2T6K5jZF',
//     type: 'FEE_REMINDER',
//     scheduledAt: new Date('2025-07-22T22:00:00Z'),
//     channels: ['EMAIL', 'WHATSAPP'], // must be array of enums
//     data: {
//       studentId: '...',
//       feeId: '...',
//     },
//   },
// });
// const users = await prisma.user.findMany();
// console.log(users);
// await prisma.subject.create({
//   data: {
//     name: 'Mathematics',
//     code: 'MATH',
//     description: 'Mathematics',
//     organizationId: 'org_2yikjYDIq5D8AjIyLvq2T6K5jZF',
//     createdAt: new Date(),
//   },
// });
// const subjects = await prisma.subject.findMany();
// await prisma.teachingAssignment.create({
//   data: {
//     teacherId: 'cmc8vdrfm0003vhp4h0gch3iz',
//     subjectId: 'cmc943w5y0001vh5ofpt4u2pb',
//     gradeId: 'cmc3t7zso0003vhr8sr1hsy85',
//     organizationId: 'org_2yikjYDIq5D8AjIyLvq2T6K5jZF',
//     sectionId: 'cmc3tb2xn0007vhr8bf7gsi50',
//     academicYear: '2024-25',
//     status: 'PENDING',
//   },
// });
// console.log(subjects);
// co
// const data = await prisma.teachingAssignment.findMany({
//   where: {
//     subject: {
//       name: 'Mathematics',
//     },
//   },
//   include: {
//     teacher: { include: { user: true } },
//   },
// });
// console.log('data', data);
// const paymentData = await prisma.feePayment.findUnique({
//   where: {
//     receiptNumber: 'RCP-1750505949490-499-cmc65vvn30007vhwwlluht7lz',
//   },
// });
// console.log('paymentData', paymentData);
// const studentsWithFees = await prisma.student.findMany({
//   where: {
//     section: {
//       TeachingAssignment: {
//         some: {
//           teacherId: 'cmc8vdrfm0003vhp4h0gch3iz',
//           status: 'ASSIGNED',
//         },
//       },
//     },
//     Fee: {
//       some: {
//         status: { not: 'PAID' },
//       },
//     },
//   },
//   include: {
//     Fee: true,
//     section: true,
//     grade: true,
//   },
// });
// console.log('studentsWithFees', studentsWithFees);
// await prisma.teacherProfile.upsert({
//   where: {
//     teacherId: 'cmc8vdrfm0003vhp4h0gch3iz',
//   },
//   update: {},
//   create: {
//     teacherId: 'cmc8vdrfm0003vhp4h0gch3iz',
//     contactEmail: '',
//     contactPhone: '',
//     address: '',
//     city: '',
//     state: '',
//     dateOfBirth: new Date('2000-01-01'),
//     qualification: '',
//     experienceInYears: 0,
//     resumeUrl: '',
//     joinedAt: new Date(),
//     bio: '',
//     teachingPhilosophy: '',
//     specializedSubjects: [],
//     preferredGrades: [],
//     idProofUrl: '',
//     linkedinPortfolio: '',
//     languagesKnown: [],
//     certificateUrls: [],
//   },
// });
// const feePayment = await prisma.feePayment.findUnique({
//   where: {
//     id: 'cmcic6tco007tvhrk5la6hctm',
//   },
// });
// console.log('feePayment', feePayment);

// const exam:Exam = await prisma.exam.create({
//   data: {
//     title: 'Mathematics Midterm',

//     description:
//       'Class 10 Mathematics paper covering Algebra, Geometry, and Trigonometry',
//     examSessionId: examSession.id,
//     subject: {
//       connect: { id: 'subject-math-id' }, // Replace with real Subject ID
//     },
//     gradeId: 'grade-10-id', // Replace with real Grade ID
//     sectionId: 'section-a-id', // Replace with real Section ID
//     organizationId:"org_30WQlEXgBepgHNrZYoYzx0xlqJg",
//     maxMarks: 100,
//     passingMarks: 35,
//     weightage: 0.4,
//     evaluationType: 'EXAM',
//     mode: 'OFFLINE',
//     status: 'UPCOMING',
//     instructions: 'Answer all questions. Calculators not allowed.',
//     durationInMinutes: 180,
//     venue: 'Room 201',
//     supervisors: ['teacher-1-id', 'teacher-2-id'], // Replace with actual teacher IDs
//     startDate: new Date('2025-09-18T09:00:00.000Z'),
//     endDate: new Date('2025-09-18T12:00:00.000Z'),
//   },
// });

  //  Generate Real notice for school 
  // Generate real notice for school – Fee Reminder
  //   await prisma.notice.create({
  //     data: {
  //       title: "Fee Payment Reminder – Academic Year 2025",

  //       content: `
  // Dear Parents & Students,

  // This is a gentle reminder that the school fees for the current academic year 2025 are due.

  // We request all parents to clear the pending fees on or before the due date to avoid late fees or interruption in academic services.

  // For any fee-related queries, please contact the school office during working hours.

  // Thank you for your cooperation.

  // – School Administration
  //     `,

  //       summary: "Reminder to clear pending school fees for Academic Year 2025",

  //       startDate: new Date("2026-01-21"),
  //       endDate: new Date("2026-02-05"),

  //       noticeType: "EXAM",          // enum NoticeType
  //       priority: "HIGH",           // enum NoticePriority
  //       status: "PUBLISHED",        // enum NoticeStatus

  //       createdBy: randomItem(userIds),   // userId of teacher/admin
  //       approvedBy: randomItem(userIds),
  //       approvedAt: new Date(),

  //       publishedBy: randomItem(userIds),
  //       publishedAt: new Date(),

  //       isUrgent: true,

  //       emailNotification: true,
  //       pushNotification: true,
  //       whatsAppNotification: false,
  //       smsNotification: false,

  //       targetAudience: ["STUDENT", "PARENT"],

  //       organizationId: randomItem(organizationIds),
  //       academicYearId: randomItem(academicYearIds),
  //     },
  //   });