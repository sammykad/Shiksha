import React from 'react';
import ComingSoon from '@/components/website/shared/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Pre-school Management Software | Shiksha Cloud",
    description: "Specialized management solution for pre-schools and early childhood education centers. Coming soon to Shiksha Cloud.",
};

export default function PreSchoolsPage() {
    return (
        <ComingSoon
            title="Tailored for Pre-schools"
            description="Automating operations and parent communication for early childhood centers."
            badge="For Pre-schools"
            iconName="UsersRound"
        />
    );
}
