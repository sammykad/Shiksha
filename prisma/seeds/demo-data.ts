import {
  OrganizationType,
  NoticeType,
  NoticePriority,
  LeadSource,
  LeadPriority,
  LeadStatus,
  PaymentMethod,
  Gender,
  Severity,
  CalendarEventType,
} from '@/generated/prisma/enums';

/**
 * Returns tailored demo data configurations based on OrganizationType.
 * Use this during the Onboarding Wizard's final step to seed the database
 * so the dashboard is immediately populated with realistic "Wow" data.
 */
export const getDemoDataForOrgType = (orgType: OrganizationType) => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const templates = {
    [OrganizationType.SCHOOL]: {
      grades: [
        { grade: 'Grade 9', sections: ['A', 'B'] },
        { grade: 'Grade 10', sections: ['Science', 'Commerce'] },
      ],
      feeCategories: [
        { name: 'Annual Tuition Fee', description: 'Standard yearly tuition' },
        { name: 'Transport Fee', description: 'Bus service charges' },
        { name: 'Lab Fee', description: 'Science lab equipment usage' },
      ],
      leads: [
        {
          studentName: 'Aarav Sharma',
          parentName: 'Rahul Sharma',
          phone: '+919876543210',
          email: 'rahul.s@example.com',
          enquiryFor: 'Grade 9 Admission',
          source: LeadSource.WALK_IN,
          priority: LeadPriority.HIGH,
          status: LeadStatus.NEW,
          notes: 'Parent visited campus, very interested in sports facilities.',
        },
        {
          studentName: 'Diya Patel',
          parentName: 'Sneha Patel',
          phone: '+919123456780',
          email: 'sneha.p@example.com',
          enquiryFor: 'Grade 10 Science',
          source: LeadSource.WEBSITE,
          priority: LeadPriority.MEDIUM,
          status: LeadStatus.CONTACTED,
          notes: 'Requested call back regarding transport availability.',
        },
      ],
      notices: [
        {
          title: 'Annual Science Exhibition 2026',
          summary: 'Details and participation guidelines for the upcoming exhibition.',
          content: 'Dear Students and Parents, We are excited to announce our Annual Science Exhibition. Students interested in presenting projects must submit their abstracts by Friday.',
          noticeType: NoticeType.EVENT,
          priority: NoticePriority.MEDIUM,
          startDate: now,
          endDate: nextWeek,
        },
        {
          title: 'Upcoming Unit Tests Reminder',
          summary: 'Schedule for Term 1 Unit Tests.',
          content: 'This is a gentle reminder that Term 1 Unit Tests will commence from next Monday. The detailed timetable has been shared on the student portal.',
          noticeType: NoticeType.EXAM,
          priority: NoticePriority.HIGH,
          startDate: now,
          endDate: nextWeek,
        },
      ],
      calendarEvents: [
        {
          name: 'Diwali Break',
          type: CalendarEventType.PLANNED,
          startDate: nextWeek,
          endDate: nextMonth,
          reason: 'Festival Holidays',
        },
      ],
      teachers: [
        {
          firstName: 'Kavita',
          lastName: 'Deshmukh',
          email: 'kavita.d@demo.shiksha.cloud',
          phone: '+919876511111',
          employeeCode: 'EMP-001',
          subjects: ['Mathematics', 'Physics'],
        },
      ],
      students: [
        {
          firstName: 'Rohan',
          lastName: 'Verma',
          email: 'rohan.v@demo.shiksha.cloud',
          phone: '+919876522222',
          whatsAppNumber: '+919876522222',
          rollNumber: 'DEMO-001',
          gender: Gender.MALE,
          targetGrade: 'Grade 10',
          targetSection: 'Science',
          parent: {
            firstName: 'Amit',
            lastName: 'Verma',
            email: 'amit.v@example.com',
            phone: '+919876533333',
          },
          fee: {
            categoryName: 'Annual Tuition Fee',
            totalFee: 45000,
            paidAmount: 15000,
            paymentMethod: PaymentMethod.UPI,
          },
        },
      ],
      complaints: [
        {
          subject: 'Library AC not cooling',
          category: 'Infrastructure',
          description: 'The AC in the senior library section is blowing warm air.',
          severity: Severity.LOW,
        },
      ],
    },

    [OrganizationType.COLLEGE]: {
      grades: [
        { grade: 'First Year B.Tech', sections: ['CS-A', 'CS-B'] },
        { grade: 'Second Year B.Tech', sections: ['Mechanical', 'Civil'] },
      ],
      feeCategories: [
        { name: 'Semester Fee', description: 'Academic semester tuition' },
        { name: 'Hostel Fee', description: 'Accommodation charges' },
        { name: 'Library Deposit', description: 'Refundable caution deposit' },
      ],
      leads: [
        {
          studentName: 'Rohan Gupta',
          parentName: 'Amit Gupta',
          phone: '+919988776655',
          email: 'rohan.g@example.com',
          enquiryFor: 'B.Tech Computer Science',
          source: LeadSource.FACEBOOK_ADS,
          priority: LeadPriority.HIGH,
          status: LeadStatus.INTERESTED,
          notes: 'Asked about placement statistics and hostel fees.',
        },
      ],
      notices: [
        {
          title: 'Tech Fest "Avishkar 2026" Registration',
          summary: 'Registrations are open for the annual technical festival.',
          content: 'The organizing committee of Avishkar 2026 is officially accepting registrations for hackathons and robotics challenges.',
          noticeType: NoticeType.EVENT,
          priority: NoticePriority.MEDIUM,
          startDate: now,
          endDate: nextWeek,
        },
      ],
      calendarEvents: [
        {
          name: 'Semester 1 Exams',
          type: CalendarEventType.PLANNED,
          startDate: nextWeek,
          endDate: nextMonth,
          reason: 'University Exams',
        },
      ],
      teachers: [
        {
          firstName: 'Dr. Sanjay',
          lastName: 'Rathore',
          email: 'sanjay.r@demo.shiksha.cloud',
          phone: '+919999911111',
          employeeCode: 'PROF-001',
          subjects: ['Data Structures', 'Algorithms'],
        },
      ],
      students: [
        {
          firstName: 'Priya',
          lastName: 'Singh',
          email: 'priya.s@demo.shiksha.cloud',
          phone: '+919999922222',
          whatsAppNumber: '+919999922222',
          rollNumber: 'CS-DEMO-01',
          gender: Gender.FEMALE,
          targetGrade: 'First Year B.Tech',
          targetSection: 'CS-A',
          parent: {
            firstName: 'Rajender',
            lastName: 'Singh',
            email: 'rajender.s@example.com',
            phone: '+919999933333',
          },
          fee: {
            categoryName: 'Semester Fee',
            totalFee: 85000,
            paidAmount: 85000,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
          },
        },
      ],
      complaints: [
        {
          subject: 'Wi-Fi connectivity in Hostel B',
          category: 'IT/Network',
          description: 'Internet frequently drops on the 3rd floor of Hostel B.',
          severity: Severity.MEDIUM,
        },
      ],
    },

    [OrganizationType.COACHING_CLASS]: {
      grades: [
        { grade: 'JEE Target', sections: ['Morning Batch', 'Weekend Batch'] },
        { grade: 'NEET Target', sections: ['Droppers Batch', 'Evening Batch'] },
      ],
      feeCategories: [
        { name: 'Course Fee', description: 'Full syllabus coaching fee' },
        { name: 'Test Series Module', description: 'Access to premium mock tests' },
        { name: 'Study Material', description: 'Printed modules and books' },
      ],
      leads: [
        {
          studentName: 'Vikram Singh',
          parentName: 'Sunita Singh',
          phone: '+919876500000',
          email: 'vikram.s@example.com',
          enquiryFor: 'JEE Mains Crash Course',
          source: LeadSource.GOOGLE_ADS,
          priority: LeadPriority.URGENT,
          status: LeadStatus.NEW,
          notes: 'Needs immediate enrollment for the crash course starting next month.',
        },
      ],
      notices: [
        {
          title: 'Mega Mock Test Series Announcement',
          summary: 'All-India level mock test for JEE/NEET aspirants.',
          content: 'To help you evaluate your preparation, we are conducting a Mega Mock Test this Sunday at 10 AM. Mandatory for all target batch students.',
          noticeType: NoticeType.EXAM,
          priority: NoticePriority.HIGH,
          startDate: now,
          endDate: nextWeek,
        },
      ],
      calendarEvents: [
        {
          name: 'Doubt Clearing Marathon',
          type: CalendarEventType.INSTITUTION_SPECIFIC,
          startDate: now,
          endDate: nextWeek,
          reason: 'Pre-exam special session',
        },
      ],
      teachers: [
        {
          firstName: 'Ankit',
          lastName: 'Agarwal',
          email: 'ankit.a@demo.shiksha.cloud',
          phone: '+918888811111',
          employeeCode: 'FAC-001',
          subjects: ['Organic Chemistry'],
        },
      ],
      students: [
        {
          firstName: 'Arjun',
          lastName: 'Nair',
          email: 'arjun.n@demo.shiksha.cloud',
          phone: '+918888822222',
          whatsAppNumber: '+918888822222',
          rollNumber: 'JEE-DEMO-01',
          gender: Gender.MALE,
          targetGrade: 'JEE Target',
          targetSection: 'Morning Batch',
          parent: {
            firstName: 'Manoj',
            lastName: 'Nair',
            email: 'manoj.n@example.com',
            phone: '+918888833333',
          },
          fee: {
            categoryName: 'Course Fee',
            totalFee: 60000,
            paidAmount: 20000,
            paymentMethod: PaymentMethod.ONLINE,
          },
        },
      ],
      complaints: [
        {
          subject: 'Need more practice sheets',
          category: 'Academics',
          description: 'Please upload advanced level practice sheets for Integration.',
          severity: Severity.LOW,
        },
      ],
    },
  };

  return templates[orgType as keyof typeof templates] || templates[OrganizationType.SCHOOL];
};
