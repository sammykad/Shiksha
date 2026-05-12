'use client';

import { OrganizationType } from '@/generated/prisma/client';
import { createContext, useContext, ReactNode } from 'react';
import { getTerminology, TerminologyLabels } from '@/lib/terminology';
const defaultTerminology: TerminologyLabels = {
    grade: 'Class',
    section: 'Section',
    student: 'Student',
    classTeacher: 'Class Teacher',
    grades: 'Classes',
    sections: 'Sections',
    students: 'Students',
    institute: 'School'
};

const TerminologyContext = createContext<TerminologyLabels>(defaultTerminology);

export const TerminologyProvider = ({
    children,
    organizationType,
}: {
    children: ReactNode;
    organizationType: OrganizationType | null | undefined;
}) => {
    const terminology = getTerminology(organizationType);

    return (
        <TerminologyContext.Provider value={terminology}>
            {children}
        </TerminologyContext.Provider>
    );
};

export const useTerminology = () => {
    const context = useContext(TerminologyContext);
    if (!context) {
        throw new Error('useTerminology must be used within a TerminologyProvider');
    }
    return context;
};