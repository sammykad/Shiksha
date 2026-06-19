import { nativeEnum, z } from 'zod';
import {
  BloodGroup,
  CalendarEventType,
  DocumentType,
  EvaluationType,
  ExamMode,
  ExamStatus,
  Gender,
  LeadActivityType,
  LeadCommunicationPreference,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeaveType,
  NoticePriority,
  NoticeType,
  NotificationChannel,
  OrganizationType,
  PaymentMethod,
  Role,
  YearType,
} from '@/generated/prisma/enums';
// const ACCEPTED_IMAGE_TYPES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/webp',git
// ];
// const MAX_FILE_SIZE = 5000000;

export const FileSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  url: z.string(),
  publicId: z.string(),
});

export type FileSchemaType = z.infer<typeof FileSchema>;

export const createNoticeSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
    summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
    startDate: z.date({
      required_error: 'Start date is required',
    }),
    endDate: z.date({
      required_error: 'End date is required',
    }),
    noticeType: nativeEnum(NoticeType).default('GENERAL'),
    priority: nativeEnum(NoticePriority).default('MEDIUM'),
    isUrgent: z.boolean().default(false),
    isPinned: z.boolean().default(false),
    targetRoles: z.array(z.nativeEnum(Role)).min(1, 'Select at least one audience'),
    targetGrades: z.array(z.string()).default([]),
    targetSections: z.array(z.string()).default([]),

    emailNotification: z.boolean().default(true),
    pushNotification: z.boolean().default(false),
    whatsAppNotification: z.boolean().default(false),
    smsNotification: z.boolean().default(false),
    attachments: z.array(FileSchema).default([]),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type createNoticeFormData = z.infer<typeof createNoticeSchema>;

export const gradeSchema = z.object({
  name: z.string().min(1, 'Grade name is required'),
});

export type GradeFormData = z.infer<typeof gradeSchema>;

export const sectionSchema = z.object({
  gradeId: z.string(),
  name: z.string().min(1, 'Section name is required'),
});
export type SectionFormData = z.infer<typeof sectionSchema>;

export const parentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsAppNumber: z.string().optional(),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']),
  isPrimary: z.boolean().optional().default(false),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),

  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsAppNumber: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits'),

  rollNumber: z.string().min(1, 'Roll number is required'),

  dateOfBirth: z
    .date()
    .max(new Date(), { message: 'Date of birth must be in the past' }),

  gender: z.nativeEnum(Gender).default("MALE"),
  sectionId: z.string().min(1, 'Section ID is required'),
  gradeId: z.string().min(1, 'Grade ID is required'),

  emergencyContact: z.string().min(1, 'Emergency contact is required'),

  profileImage: z.string(),

  motherName: z.string().optional(),
  fullName: z.string().optional(),
  parents: z
    .array(parentSchema)
    .optional(),
});
export const updateStudentSchema = studentSchema.extend({
  id: z.string().min(1, 'ID is required'),
});

export const documentUploadSchema = z.object({
  type: z.nativeEnum(DocumentType, {
    required_error: 'Please select a document type',
  }),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      'File size must be less than 2MB'
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(
          file.type
        ),
      'Only JPEG, PNG, WebP, and PDF files are allowed'
    ),
  note: z.string().optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// Fees

export const feeCategorySchema = z.object({
  categoryName: z.string().min(1, 'Fee Category is required'),
  description: z.string().min(1, 'Description is required'),
});

export const feeAssignmentSchema = z.object({
  feeCategoryId: z.string().min(1, 'Fee Category ID is required'),

  feeAmount: z.coerce
    .number()
    .min(1, 'Fee Amount is required')
    .refine((val) => val > 0, {
      message: 'Fee Amount must be greater than 0',
    }),
  dueDate: z.date({
    required_error: 'A due date is required',
  }),
  studentIds: z.union([
    z.string().min(1), // for single student
    z.array(z.string().min(1)), // for multiple students
  ]),
});

export const singleHolidayFormSchema = z.object({
  name: z.string().min(1, { message: 'Holiday name is required' }),
  startDate: z.date(),
  endDate: z.date(),
  type: z.nativeEnum(CalendarEventType),
  reason: z.string().min(1, { message: 'Reason is required' }),
  isRecurring: z.boolean().default(false).optional(),
});

export const goggleImportHolidayFormSchema = z.array(
  z.object({
    name: z.string().min(1, { message: 'Holiday name is required' }),
    startDate: z.date(),
    endDate: z.date(),
    type: z.nativeEnum(CalendarEventType),
    reason: z.string().min(1, { message: 'Reason is required' }),
    isRecurring: z.boolean().default(false),
  })
);

export const studentProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  motherName: z.string().min(2, "Mother's name must be at least 2 characters"),
  dateOfBirth: z
    .date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Invalid date format',
    })
    .refine(
      (date) => date <= new Date(),
      'Date of birth cannot be in the future'
    ),
  bloodGroup: z.nativeEnum(BloodGroup).nullable().optional(),
  address: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  gender: z.nativeEnum(Gender, {
    required_error: 'Please select a gender',
  }),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsAppNumber: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  emergencyContact: z
    .string()
    .min(10, 'Emergency contact must be at least 10 digits'),
  profileImage: z.string().optional(),
});

export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

export const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  organizationType: z.nativeEnum(OrganizationType, { required_error: "Organization type is required." }),
  logo: z.string().optional().or(z.literal('')),
  establishedYear: z.coerce
    .number()
    .int('Must be a valid year')
    .min(1800, 'Year must be 1800 or later')
    .max(new Date().getFullYear() + 5, 'Year cannot be in the distant future')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

// Teacher

export const teacherProfileSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  profilePhoto: z.string().optional(),

  // Contact Information
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  address: z.string().min(10, 'Please enter a complete address'),
  city: z.string().optional(),
  state: z.string().optional(),
  dateOfBirth: z
    .date()
    .max(new Date(), { message: 'Date of birth must be in the past' }),

  // Professional Information
  qualification: z.string().min(2, 'Please enter your qualification details'),
  experienceInYears: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience seems too high'),
  resumeUrl: z.string().optional(),

  // Teaching Preferences
  specializedSubjects: z
    .array(z.string())
    .min(1, 'Please select at least one subject'),
  preferredGrades: z
    .array(z.string())
    .min(1, 'Please select at least one grade'),

  // Optional Information
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  linkedinPortfolio: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  languagesKnown: z.array(z.string()).optional(),
  teachingPhilosophy: z
    .string()
    .max(1000, 'Teaching philosophy must be less than 1000 characters')
    .optional(),

  // Documents
  certificateUrls: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  idProofUrl: z.string().optional(),
});

export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;

export const createTeacherSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  employeeCode: z
    .string()
    .min(3, 'Employee code must be at least 3 characters'),

  // Contact Information
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),

  // Professional Information
  dateOfBirth: z
    .date()
    .max(new Date(), { message: 'Date of birth must be in the past' }),
  qualification: z.string().min(2, 'Qualification is required'),
  experienceInYears: z.number().min(0, 'Experience cannot be negative'),
  joinedAt: z.date({ required_error: 'Joining date is required' }),

  idProofUrl: z.string().url().optional(),

  // Teaching Information
  specializedSubjects: z
    .array(z.string())
    .min(1, 'At least one subject is required'),
  preferredGrades: z.array(z.string()).min(1, 'At least one grade is required'),

  // Optional Information
  bio: z.string().optional(),
  teachingPhilosophy: z.string().optional(),
  linkedinPortfolio: z.string().url().optional().or(z.literal('')),
  languagesKnown: z.array(z.string()).optional(),
});

export type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;

// Leaves

export const LeaveCreateSchema = z
  .object({
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    type: z.nativeEnum(LeaveType).default('SICK'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    emergencyContact: z
      .string({
        required_error: 'Emergency contact is required',
        invalid_type_error: 'Phone must be digits',
      })
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    academicYearId: z.string().min(1, 'Academic year is required'),
  })
  .refine(
    (v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      return start <= end;
    },
    { path: ['endDate'], message: 'End date must be same or after start date' }
  );

export type LeaveCreateFromData = z.infer<typeof LeaveCreateSchema>;

export const ReviewActionSchema = z.object({
  leaveId: z.string().min(1),
  rejectedNote: z.string().optional(),
});

export type ReviewActionFormData = z.infer<typeof ReviewActionSchema>;

export const academicYearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  type: z.nativeEnum(YearType).default('ANNUAL'),
  description: z.string().optional(),
  isCurrent: z.boolean().default(false),
  organizationId: z.string().min(1, 'Organization ID is required'),
});

export type AcademicYearFormData = z.infer<typeof academicYearSchema>;

export const academicYearUpdateSchema = academicYearSchema.extend({
  id: z.string().min(1, 'ID is required'),
});

export type AcademicYearUpdateFormData = z.infer<
  typeof academicYearUpdateSchema
>;

//  Payment Reminder schema
export const reminderFormSchema = z.object({
  recipients: z.array(z.string()).min(1, 'Select at least one recipient'),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .optional(),
  templateId: z.string().min(1, 'Please select a template'),
  templateType: z.enum([
    'FEE_FRIENDLY_REMINDER',
    'FEE_DUE_TODAY',
    'FEE_OVERDUE',
  ]),
  scheduleDate: z.date().optional(),
  scheduleTime: z.string().optional(),
  sendNow: z.boolean().default(true),
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;

// Offline Payment

export const offlinePaymentSchema = z.object({
  feeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.nativeEnum(PaymentMethod).refine(
    (val) => val !== "ONLINE",
    { message: "ONLINE not allowed for offline payment" }
  ),
  transactionId: z.string().optional(),
  note: z.string().optional(),
  payerId: z.string(),
});

export type offlinePaymentFormData = z.infer<typeof offlinePaymentSchema>;

export const pdcPaymentSchema = z.object({
  feeId: z.string().min(1, 'Fee ID is required'),
  payerId: z.string().min(1, 'Payer ID is required'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),

  // Cheque core
  chequeNumber: z
    .string()
    .min(1, 'Cheque number is required')
    .max(6, 'Cheque number must be 6 digits')
    .regex(/^\d+$/, 'Cheque number must contain only digits'),
  chequeDate: z
    .date({ required_error: 'Cheque date is required' })
    .refine((d) => d > new Date(), {
      message: 'Cheque date must be a future date (post-dated)',
    }),
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format')
    .optional()
    .or(z.literal('')),
  micrCode: z
    .string()
    .regex(/^\d{9}$/, 'MICR code must be exactly 9 digits')
    .optional()
    .or(z.literal('')),

  // Account holder
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  accountNumberLast4: z
    .string()
    .regex(/^\d{4}$/, 'Enter last 4 digits only')
    .optional()
    .or(z.literal('')),

  // Admin notes
  remarks: z.string().optional(),

  // Internally set — not from form
  method: z.literal(PaymentMethod.CHEQUE).default(PaymentMethod.CHEQUE),
});

export type PdcPaymentFormData = z.infer<typeof pdcPaymentSchema>;

export const subjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be less than 100 characters'),
  code: z
    .string()
    .min(1, 'Subject code is required')
    .min(2, 'Subject code must be at least 2 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Subject code must contain only uppercase letters and numbers'
    )
    .transform((val) => val.toUpperCase()),

  description: z
    .string()
    .max(512, 'Description must be less than 512 characters')
    .optional(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

// Exams

export const examSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  academicYearId: z.string().min(1, 'Academic Year is required'),
  description: z.string().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
});

export type ExamSessionFormData = z.infer<typeof examSessionSchema>;

export const examSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().max(1000).optional().or(z.literal('')),
    subjectId: z.string().min(1, 'Subject is required'),
    gradeSectionKey: z.string().min(1, 'Class & Section is required'), // "GradeName||SectionName"
    maxMarks: z.coerce
      .number()
      .positive('Max marks must be > 0')
      .max(1000, 'Max too large'),
    passingMarks: z
      .union([z.coerce.number(), z.literal('')])
      .transform((v) => (v === '' ? undefined : v))
      .optional(),
    weightage: z.coerce.number().optional(),
    evaluationType: z.nativeEnum(EvaluationType),
    mode: z.nativeEnum(ExamMode),
    status: z.nativeEnum(ExamStatus).default('UPCOMING'),
    instructions: z.string().max(2000).optional().or(z.literal('')),
    durationInMinutes: z.coerce.number().optional(),
    venueMapUrl: z.string().optional(),

    venue: z.string().max(200).optional().or(z.literal('')),
    supervisors: z.array(z.string()).default([]), // teacher IDs
    startDate: z.string().min(1, 'Start date/time is required'), // ISO string
    endDate: z.string().min(1, 'End date/time is required'),
    // Optional: link to session later. DB schema requires, but allow backend to attach by policy.
    examSessionId: z.string().min(1, 'Exam session is required'),
    gradingScaleId: z.string().optional(),
  })
  .refine(
    (v) => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      return start < end;
    },
    { path: ['endDate'], message: 'End must be after start' }
  )
  .refine(
    (v) => {
      if (v.passingMarks == null) return true;
      return v.passingMarks <= v.maxMarks;
    },
    { path: ['passingMarks'], message: 'Passing marks must be ≤ Max marks' }
  )
  .refine(
    (v) => {
      // For OFFLINE/PRACTICAL/VIVA, require at least one supervisor
      if (['OFFLINE', 'PRACTICAL', 'VIVA'].includes(v.mode)) {
        return v.supervisors && v.supervisors.length > 0;
      }
      return true;
    },
    {
      path: ['supervisors'],
      message:
        'At least one supervisor is required for offline/practical/viva exams',
    }
  );

export type ExamFormData = z.infer<typeof examSchema>;

//

export const bulkExamSchema = z.object({
  sessionId: z.string().min(1, 'Session is required'),
  sectionId: z.string().min(1, 'Section is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  gradingScaleId: z.string().optional(),
  exams: z.array(
    z.object({
      subjectId: z.string().min(1, 'Select a subject'),
      title: z.string().min(1, 'Title is required'),
      startDate: z.string().min(1, 'Start date/time is required'),
      endDate: z.string().min(1, 'End date/time is required'),
      max: z.coerce.number().min(1).max(1000),
      pass: z.coerce.number().min(0),
      mode: z.nativeEnum(ExamMode),
      weightage: z.coerce.number().min(0).optional().default(0),
      evaluationType: z
        .nativeEnum(EvaluationType)
        .optional()
        .default(EvaluationType.EXAM),
      venue: z.string().optional().default(''),
      venueMapUrl: z.string().optional(),
      supervisors: z.array(z.string()).default([]),
      description: z.string().optional(),
      instructions: z.string().optional(),
    }).refine(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      return start < end;
    }, { path: ['endDate'], message: 'End must be after start' })
      .refine(v => v.pass <= v.max, { path: ['pass'], message: 'Pass marks must be ≤ Max marks' })
  ),
});

export type bulkExamFormData = z.infer<typeof bulkExamSchema>;

export const studentExamResultSchema = z.object({
  results: z.array(
    z.object({
      studentId: z.string(),
      examId: z.string(),
      obtainedMarks: z.number().nullable(),
      percentage: z.number().nullable(),
      gradeLabel: z.string().optional().nullable(),
      remarks: z.string().optional().nullable(),
      isPassed: z.boolean().optional().nullable(),
      isAbsent: z.boolean().default(false),
    })
  ),
});

export type studentExamResultFormData = z.infer<typeof studentExamResultSchema>;

// Leads

export const createLeadSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  enquiryFor: z.string().min(1, 'Enquiry field is required'),
  parentName: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  currentSchool: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.WEBSITE),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  notes: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  budgetRange: z.string().optional(),
  communicationPreference: z
    .array(z.nativeEnum(LeadCommunicationPreference))
    .default([]),
  organizationId: z.string().min(1, 'Organization ID is required'),
  academicYearId: z.string(),
});

export type createLeadFormData = z.infer<typeof createLeadSchema>;

export const editLeadSchema = createLeadSchema.extend({
  id: z.string().min(1, 'Lead ID is required'),
});

export type editLeadFormData = z.infer<typeof editLeadSchema>;

export const createLeadActivitySchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  type: z.nativeEnum(LeadActivityType, {
    required_error: 'Activity type is required',
  }),
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  outcome: z.string().optional(),
  performedAt: z.date({
    required_error: 'Activity date is required',
  }),
  followUpDate: z.date().optional().nullable(),
  followUpNote: z.string().optional(),
});

export type createLeadActivityFormData = z.infer<
  typeof createLeadActivitySchema
>;

export const assignLeadSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  assignedToUserId: z.string().min(1, 'Please select a user to assign'),
});

export type AssignLeadFormData = z.infer<typeof assignLeadSchema>;
