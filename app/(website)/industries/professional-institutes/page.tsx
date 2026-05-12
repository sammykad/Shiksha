import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Professional Institute Management Software | CRM + ERP",
    description: "Management solutions for nursing, pharmacy, paramedical, and other professional institutes. Coming soon to Shiksha Cloud.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function ProfessionalInstitutesPage() {
    return (
        <ComingSoon
            title="For Professional Institutes"
            description="Specialized workflows for nursing, pharmacy, and paramedical institutes."
            badge="For Professional Institutes"
            iconName="ClipboardCheck"
        />
    );
}
