// app/dashboard/onboarding/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ClerkProvider } from '@clerk/nextjs';

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, orgId, orgRole } = await auth();

    if (!userId) redirect('/sign-in');
    if (!orgId) redirect('/select-organization');
    if (orgRole !== 'org:admin') redirect('/dashboard');

    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            {children}
        </ClerkProvider>
    );
}