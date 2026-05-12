import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Tutor & Micro-Academy CRM | Shiksha Cloud",
    description: "Simple CRM and operations management for small tutors and micro-institutes. Coming soon to Shiksha Cloud.",
};

export default function SmallTutorsPage() {
    return (
        <ComingSoon
            title="CRM for Micro-Academies"
            description="Simplifying operations for small tutors and private coaching centers."
            badge="For Small Tutors"
            iconName="Users2"
        />
    );
}
