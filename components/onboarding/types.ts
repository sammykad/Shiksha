import type { OrganizationType } from "@/generated/prisma/enums";

export interface WizardGrade {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

export interface WizardData {
  orgId: string;
  orgName: string;
  orgType?: OrganizationType;
  orgEmail?: string;
  orgPhone?: string;
  hasOrg: boolean;
  academicYearId: string | null;
  grades: WizardGrade[];
  studentsCount: number;
  teachersCount: number;
  subjectsCount: number;
  feeCategoriesCount: number;
  parentsCount: number;
  documentsCount: number;
  teachingAssignmentsCount: number;
  feeAssignmentsCount: number;
}

export type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface StepDefinition {
  id: StepId;
  title: string;
  shortTitle: string;
  description: string;
  phase: number;
  optional?: boolean;
}

export const PHASES = [
  { id: 1, name: 'Foundation', color: 'text-blue-600' },
  { id: 2, name: 'Structure', color: 'text-violet-600' },
  { id: 3, name: 'People', color: 'text-emerald-600' },
  { id: 4, name: 'Academics', color: 'text-orange-600' },
] as const;

export const STEPS: StepDefinition[] = [
  {
    id: 0,
    title: 'Organization Setup',
    shortTitle: 'Organization',
    description: 'Set up your institution name, type and contact details.',
    phase: 1,
  },
  {
    id: 1,
    title: 'Academic Year',
    shortTitle: 'Academic Year',
    description: 'Define your current academic year and session dates.',
    phase: 1,
  },
  {
    id: 2,
    title: 'Create Grades',
    shortTitle: 'Grades',
    description: 'Add the grades or classes your institution offers.',
    phase: 2,
  },
  {
    id: 3,
    title: 'Create Sections',
    shortTitle: 'Sections',
    description: 'Add sections within each grade (A, B, C, etc.).',
    phase: 2,
  },
  {
    id: 4,
    title: 'Add Students',
    shortTitle: 'Students',
    description: 'Enrol your students and assign them to grades.',
    phase: 3,
  },
  {
    id: 5,
    title: 'Add Parents',
    shortTitle: 'Parents',
    description: 'Link parents and guardians to enrolled students.',
    phase: 3,
  },
  {
    id: 6,
    title: 'Student Documents',
    shortTitle: 'Documents',
    description: 'Upload Aadhaar, TC, birth certificates and more (per-student, configure anytime).',
    phase: 3,
    optional: true,
  },
  {
    id: 7,
    title: 'Add Teachers',
    shortTitle: 'Teachers',
    description: 'Onboard your teaching staff into the system.',
    phase: 4,
  },
  {
    id: 8,
    title: 'Create Subjects',
    shortTitle: 'Subjects',
    description: 'Add subjects taught at your institution.',
    phase: 4,
  },
  {
    id: 9,
    title: 'Fee Categories',
    shortTitle: 'Fee Types',
    description: 'Define fee types like tuition, exam, sports, etc.',
    phase: 4,
  },
  {
    id: 10,
    title: 'Teaching Assignments',
    shortTitle: 'Assignments',
    description: 'Link teachers to subjects, grades and sections.',
    phase: 4,
  },
  {
    id: 11,
    title: 'Assign Fees',
    shortTitle: 'Assign Fees',
    description: 'Assign fees to students with amounts and due dates.',
    phase: 4,
  },
];

export const PHASE_MESSAGES: Record<number, string> = {
  1: "Foundation complete! Your dashboard is now accessible. You can head to the dashboard or continue setting up grades, sections, and more.",
  3: "Structure ready! Now let's add your people—students, parents, and documents.",
  6: "Excellent! People are in. Now let's configure the academic side—teachers, subjects, and fees.",
};
