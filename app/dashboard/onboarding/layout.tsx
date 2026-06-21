// app/dashboard/onboarding/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { orgRole } = await auth({
        returnUrl: '/dashboard/onboarding',
    });
    if (orgRole !== 'ADMIN') redirect('/dashboard');

    return <>{children}</>;
}
