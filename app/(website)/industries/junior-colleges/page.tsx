import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Junior College Management Software | Shiksha Cloud",
    description: "Class tracking and exam management solutions for junior colleges. Coming soon to Shiksha Cloud.",
};

export default function JuniorCollegesPage() {
    return (
        <ComingSoon
            title="Efficiency for Junior Colleges"
            description="Optimized class tracking and exam management for intermediate education."
            badge="For Junior Colleges"
            iconName="Building2"
        />
    );
}
