import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

/* ----------------------------------------------
 * Indian Realistic Data Constants
 * ---------------------------------------------- */
const INDIAN_FIRST_NAMES_MALE = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Rohan', 'Aryan', 'Reyansh', 'Mohammed', 'Dhruv', 'Kabir', 'Shivansh', 'Atharv', 'Karthik', 'Rahul',
  'Vikram', 'Suresh', 'Rajesh', 'Amit', 'Sanjay', 'Pradeep', 'Manoj', 'Deepak', 'Sunil', 'Anil',
  'Ravi', 'Mohan', 'Gopal', 'Krishna', 'Ram', 'Shyam', 'Lakshman', 'Bharat', 'Arvind', 'Nitin',
];

const INDIAN_FIRST_NAMES_FEMALE = [
  'Aadhya', 'Ananya', 'Aanya', 'Aaradhya', 'Diya', 'Saanvi', 'Kavya', 'Anika', 'Myra', 'Ira',
  'Priya', 'Neha', 'Pooja', 'Ritu', 'Sneha', 'Kavita', 'Meera', 'Shreya', 'Riya', 'Tanya',
  'Lakshmi', 'Saraswati', 'Durga', 'Parvati', 'Radha', 'Sita', 'Gita', 'Uma', 'Jaya', 'Nisha',
  'Anjali', 'Sunita', 'Rekha', 'Sangeeta', 'Vandana', 'Pallavi', 'Swati', 'Madhuri', 'Asha', 'Komal',
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Joshi', 'Iyer', 'Nair',
  'Reddy', 'Rao', 'Pillai', 'Mukherjee', 'Chatterjee', 'Banerjee', 'Das', 'Mehta', 'Desai', 'Pandey',
  'Tiwari', 'Dubey', 'Mishra', 'Saxena', 'Agarwal', 'Bansal', 'Goel', 'Tandon', 'Kapoor', 'Malhotra',
  'Chopra', 'Khanna', 'Sethi', 'Bhatia', 'Arora', 'Saini', 'Chauhan', 'Rathore', 'Thakur', 'Yadav',
  'Jadhav', 'Patil', 'Kulkarni', 'Deshmukh', 'Gaikwad', 'Pawar', 'More', 'Bhosale', 'Shinde', 'Gore',
];

const INDIAN_ADDRESSES = [
  '12, MG Road', '45, Station Road', '78, Gandhi Nagar', '23, Park Street',
  '56, Nehru Place', '89, Ring Road', '34, Civil Lines', '67, Mall Road',
  '90, Lake View', '15, Hill Road', '42, Market Street', '88, Temple Road',
  '21, Shivaji Chowk', '55, Tilak Road', '33, JM Road', '77, FC Road',
  '11, KP Road', '44, SB Road', '66, Law College Road', '99, Kothrud',
];

const INDIAN_CITIES = [
  { city: 'Pune', state: 'Maharashtra', pinCodes: ['411001', '411038', '411057', '411045', '411004', '411005', '411009', '411016'] },
  { city: 'Mumbai', state: 'Maharashtra', pinCodes: ['400001', '400050', '400060', '400092', '400053', '400067', '400077', '400089'] },
  { city: 'Nashik', state: 'Maharashtra', pinCodes: ['422001', '422002', '422005', '422009', '422010', '422011', '422012', '422013'] },
  { city: 'Nagpur', state: 'Maharashtra', pinCodes: ['440001', '440002', '440008', '440010', '440012', '440013', '440015', '440022'] },
  { city: 'Thane', state: 'Maharashtra', pinCodes: ['400601', '400602', '400603', '400604', '400605', '400606', '400607', '400608'] },
];

const BLOOD_GROUPS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
const CASTES = ['General', 'OBC', 'SC', 'ST', ''];

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

/* ----------------------------------------------
 * Utility Functions
 * ---------------------------------------------- */
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateIndianPhone(): string {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '88', '87', '86', '85', '84', '83', '82', '81', '80', '78', '77', '76', '75', '74', '73', '72', '71', '70'];
  const prefix = randomItem(prefixes);
  const rest = String(randomInt(10000000, 99999999));
  return `+91${prefix}${rest}`;
}

function generateIndianEmail(firstName: string, lastName: string, seed: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'rediffmail.com', 'outlook.com'];
  const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${seed.toString(36)}${randomInt(1, 999)}`;
  return `${name}@${randomItem(domains)}`;
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 25; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateReceiptNumber(index: number): string {
  return `RCP-${Date.now()}-${String(index).padStart(4, '0')}`;
}

/* ----------------------------------------------
 * Main Seed Function
 * ---------------------------------------------- */
async function main() {
  console.log('\n👨‍🎓 Adding 7000 More Students...\n');

  const now = new Date();

  // Get existing org, academic year, grades, sections
  const orgResult = await pool.query(`SELECT id FROM "Organization" LIMIT 1`);
  const orgId = orgResult.rows[0].id;

  const academicYearResult = await pool.query(`SELECT id FROM "AcademicYear" LIMIT 1`);
  const academicYearId = academicYearResult.rows[0].id;

  const gradesResult = await pool.query(`SELECT id, grade FROM "Grade" ORDER BY grade`);
  const grades = gradesResult.rows;

  const sectionsResult = await pool.query(`SELECT id, name, "gradeId" FROM "Section" ORDER BY "gradeId", name`);
  const sectionsByGrade: Record<string, { id: string; name: string }[]> = {};
  for (const sec of sectionsResult.rows) {
    if (!sectionsByGrade[sec.gradeId]) sectionsByGrade[sec.gradeId] = [];
    sectionsByGrade[sec.gradeId].push(sec);
  }

  // Get fee categories
  const fcResult = await pool.query(`SELECT id, name FROM "FeeCategory"`);
  const fcMap: Record<string, string> = {};
  for (const fc of fcResult.rows) {
    fcMap[fc.name] = fc.id;
  }

  // Get admin user
  const adminResult = await pool.query(`SELECT id FROM "User" WHERE email = 'sameerkad2001@gmail.com'`);
  const adminId = adminResult.rows[0]?.id;

  console.log(`   Organization: ${orgId}`);
  console.log(`   Academic Year: ${academicYearId}`);
  console.log(`   Grades: ${grades.length}`);
  console.log(`   Sections: ${sectionsResult.rows.length}\n`);

  // Calculate students per section (7000 distributed across sections)
  const totalSections = sectionsResult.rows.length;
  const basePerSection = Math.floor(7000 / totalSections);
  const remainder = 7000 % totalSections;

  let studentCount = 0;
  let feeCount = 0;
  let paymentCount = 0;
  let totalCollected = 0;
  let sectionIndex = 0;

  // Process each section
  for (const grade of grades) {
    const gradeNum = grade.grade.replace('Grade ', '');
    const sections = sectionsByGrade[grade.id] || [];
    const fs = FEE_STRUCTURE_BY_GRADE[gradeNum] || FEE_STRUCTURE_BY_GRADE['1'];

    for (const section of sections) {
      // Add extra students to first few sections for remainder
      const studentsForThisSection = basePerSection + (sectionIndex < remainder ? 1 : 0);
      sectionIndex++;

      console.log(`   📚 ${grade.grade} Section ${section.name}: ${studentsForThisSection} students`);

      for (let i = 0; i < studentsForThisSection; i++) {
        const isMale = Math.random() > 0.48;
        const firstName = isMale ? randomItem(INDIAN_FIRST_NAMES_MALE) : randomItem(INDIAN_FIRST_NAMES_FEMALE);
        const lastName = randomItem(INDIAN_LAST_NAMES);
        const city = randomItem(INDIAN_CITIES);
        const baseYear = 2025 - (parseInt(gradeNum) + 5);
        const dob = new Date(baseYear, randomInt(0, 11), randomInt(1, 28));
        const rollNumber = `${gradeNum}${section.name}-${String(i + 1).padStart(3, '0')}`;

        const userId = `user_${generateId()}`;
        const studentId = generateId();

        // Create User
        await pool.query(
          `INSERT INTO "User" (id, email, "firstName", "lastName", name, image, "emailVerified", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [userId, generateIndianEmail(firstName, lastName, studentCount), firstName, lastName, `${firstName} ${lastName}`, '', false, true, now, now]
        );

        // Create Parent
        const parentFirstName = randomItem(isMale ? INDIAN_FIRST_NAMES_FEMALE : INDIAN_FIRST_NAMES_MALE);
        const parentId = generateId();
        const parentPhone = generateIndianPhone();

        await pool.query(
          `INSERT INTO "Parent" (id, "organizationId", "userId", "firstName", "lastName", email, "phoneNumber", "whatsAppNumber", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [parentId, orgId, null, parentFirstName, lastName, generateIndianEmail(parentFirstName, lastName, studentCount), parentPhone, parentPhone, now, now]
        );

        // Create Student
        await pool.query(
          `INSERT INTO "Student" (id, "userId", "organizationId", "gradeId", "sectionId", "firstName", "lastName", "fullName", "motherName", "dateOfBirth", "bloodGroup", address, caste, "subCaste", "profileImage", "rollNumber", "phoneNumber", "whatsAppNumber", email, "emergencyContact", gender, status, "admissionDate", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
          [
            studentId, userId, orgId, grade.id, section.id,
            firstName, lastName, `${firstName} ${lastName}`, randomItem(INDIAN_FIRST_NAMES_FEMALE),
            dob, randomItem(BLOOD_GROUPS),
            `${randomItem(INDIAN_ADDRESSES)}, ${city.city}, ${city.state} - ${randomItem(city.pinCodes)}`,
            randomItem(CASTES), '', '', rollNumber, generateIndianPhone(), generateIndianPhone(),
            generateIndianEmail(firstName, lastName, studentCount), parentPhone,
            isMale ? 'MALE' : 'FEMALE', 'ACTIVE',
            randomDate(new Date('2025-03-01'), new Date('2025-04-15')),
            now, now
          ]
        );

        // Link Parent-Student
        await pool.query(
          `INSERT INTO "ParentStudent" (id, "studentId", "parentId", relationship, "isPrimary")
           VALUES ($1, $2, $3, $4, $5)`,
          [generateId(), studentId, parentId, isMale ? 'Mother' : 'Father', true]
        );

        // Create Membership
        await pool.query(
          `INSERT INTO "Membership" (id, "userId", "organizationId", role, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [generateId(), userId, orgId, 'STUDENT', 'ACTIVE', now, now]
        );

        // Create Fees
        const feeTypes = [
          { cat: 'Tuition Fee', amount: fs.tuition, due: '2025-04-30' },
          { cat: 'Transport Fee', amount: fs.transport, due: '2025-04-30', skip: Math.random() < 0.3 },
          { cat: 'Examination Fee', amount: fs.exam, due: '2025-08-15' },
          { cat: 'Lab Fee', amount: fs.lab, due: '2025-05-31', skip: parseInt(gradeNum) < 4 },
          { cat: 'Annual Day Fee', amount: fs.annual, due: '2026-02-28' },
        ];

        for (const ft of feeTypes) {
          if (ft.skip) continue;

          const feeId = generateId();
          const scenario = Math.random();
          let paidAmount = 0;
          let pendingAmount = ft.amount;
          let status = 'UNPAID';

          if (scenario < 0.45) {
            // Fully paid
            paidAmount = ft.amount;
            pendingAmount = 0;
            status = 'PAID';
          } else if (scenario < 0.65) {
            // Partially paid
            paidAmount = Math.round(ft.amount * 0.5);
            pendingAmount = ft.amount - paidAmount;
            status = 'UNPAID';
          }

          await pool.query(
            `INSERT INTO "Fee" (id, "totalFee", "paidAmount", "pendingAmount", "dueDate", status, "studentId", "feeCategoryId", "organizationId", "academicYearId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [feeId, ft.amount, paidAmount, pendingAmount, ft.due, status, studentId, fcMap[ft.cat], orgId, academicYearId, now, now]
          );
          feeCount++;

          // Create payment if paid
          if (paidAmount > 0) {
            const paymentMethod = randomItem(['UPI', 'CASH', 'ONLINE', 'BANK_TRANSFER']);
            const paymentDate = randomDate(new Date('2025-04-01'), new Date('2025-12-31'));
            const transactionId = paymentMethod === 'UPI' ? `UPI${randomInt(100000000, 999999999)}` : null;

            await pool.query(
              `INSERT INTO "FeePayment" (id, "feeId", amount, status, "paymentMethod", "paymentDate", "receiptNumber", "payerId", "organizationId", "transactionId", note, "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                generateId(), feeId, paidAmount, 'COMPLETED', paymentMethod,
                paymentDate, generateReceiptNumber(paymentCount), adminId, orgId, transactionId,
                `Payment for ${ft.cat}`, now, now
              ]
            );
            paymentCount++;
            totalCollected += paidAmount;
          }
        }

        studentCount++;
      }
    }
  }

  console.log('\n✅ ==========================================');
  console.log('✅ 7000 Students Added Successfully!');
  console.log('✅ ==========================================');
  console.log(`\n📊 Summary:`);
  console.log(`   New Students: ${studentCount}`);
  console.log(`   Fee Records Created: ${feeCount}`);
  console.log(`   Payments Created: ${paymentCount}`);
  console.log(`   Total Collected: ₹${(totalCollected / 100).toLocaleString('en-IN')}`);
  console.log('\n🎉 Done!\n');

  await pool.end();
}

main().catch(async (e) => {
  console.error('\n❌ Error:', e);
  await pool.end();
  process.exit(1);
});
