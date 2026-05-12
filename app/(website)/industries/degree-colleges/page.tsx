import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Degree College Management System | Shiksha Cloud",
    description: "Comprehensive ERP solution for degree colleges and higher education institutions. Coming soon to Shiksha Cloud.",
};

export default function DegreeCollegesPage() {
    return (
        <ComingSoon
            title="Advanced ERP for Degree Colleges"
            description="Streamlining timetables, attendance, and fee workflows for higher education."
            badge="For Degree Colleges"
            iconName="Library"
        />
    );
}
