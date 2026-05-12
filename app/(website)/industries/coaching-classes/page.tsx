import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Coaching Class Management Software | Shiksha Cloud",
    description: "Management solutions for NEET, JEE, and competitive exam centers. Coming soon to Shiksha Cloud.",
};

export default function CoachingClassesPage() {
    return (
        <ComingSoon
            title="For Competitive Coaching"
            description="Perfecting test series and batch management for NEET, JEE & competitive centers."
            badge="For Coaching Classes"
            iconName="PencilRuler"
        />
    );
}
