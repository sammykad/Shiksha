import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Skill Academy Management Software | Shiksha Cloud",
    description: "Software for coding, language, and other skill training institutes. Coming soon to Shiksha Cloud.",
};

export default function SkillAcademiesPage() {
    return (
        <ComingSoon
            title="Empowering Skill Academies"
            description="Modernizing operations for coding, language, and training centers."
            badge="For Skill Academies"
            iconName="Lightbulb"
        />
    );
}


