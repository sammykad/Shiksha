'use client';

import { AcademicYear } from '@/generated/prisma/client';
import { AcademicYearConfig } from './AcademicYearConfig';

interface ConfigSettingsProps {
    academicYears: AcademicYear[];
    organizationId: string;
}

export default function ConfigSettings({ academicYears, organizationId }: ConfigSettingsProps) {
    return (
        <div className="space-y-4">
            <AcademicYearConfig academicYears={academicYears} organizationId={organizationId} />
        </div>
    );
}
