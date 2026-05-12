import { OrganizationType } from '@/generated/prisma/client';

export interface TerminologyLabels {
    grade: string;
    section: string;
    student: string;
    classTeacher: string;
    grades: string;
    sections: string;
    students: string;
    institute: string;
}

const defaultTerminology: TerminologyLabels = {
    grade: 'Class',
    section: 'Section',
    student: 'Student',
    classTeacher: 'Class Teacher',
    grades: 'Classes',
    sections: 'Sections',
    students: 'Students',
    institute: "School"
};

export const getTerminology = (
    orgType: OrganizationType | null | undefined
): TerminologyLabels => {
    if (!orgType) return defaultTerminology;

    switch (orgType) {
        case 'SCHOOL':
        case 'KINDERGARTEN':
            return {
                grade: 'Class',
                section: 'Section',
                student: 'Student',
                classTeacher: 'Class Teacher',
                grades: 'Classes',
                sections: 'Sections',
                students: 'Students',
                institute: "School"
            };
        case 'COLLEGE':
        case 'UNIVERSITY':
            return {
                grade: 'Course',
                section: 'Batch',
                student: 'Student',
                classTeacher: 'Mentor',
                grades: 'Courses',
                sections: 'Batches',
                students: 'Students',
                institute: "College"
            };
        case 'COACHING_CLASS':
            return {
                grade: 'Course',
                section: 'Batch',
                student: 'Student',
                classTeacher: 'Instructor',
                grades: 'Courses',
                sections: 'Batches',
                students: 'Students',
                institute: "Coaching Class"
            };
        case 'TRAINING_INSTITUTE':
            return {
                grade: 'Course',
                section: 'Batch',
                student: 'Student',
                classTeacher: 'Instructor',
                grades: 'Courses',
                sections: 'Batches',
                students: 'Students',
                institute: "Institute"
            };
        default:
            return defaultTerminology;
    }
};