import { PRICING_TIERS } from '@/lib/constants/pricing';
import { BetterAuthSignUp } from "@/components/auth/sign-up";

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; plan?: string }>;
}) {
    const { plan, error } = await searchParams;

    const planParam = plan && PRICING_TIERS.some(t => t.id === plan) ? plan : null;

    const billingUrl = `/dashboard/settings?section=billing${planParam ? `&plan=${planParam}` : ''}`;
    const redirectUrl = `/select-organization?returnUrl=${encodeURIComponent(billingUrl)}`;

    return (
        <div className='flex w-full flex-1 items-center justify-center p-6 md:p-10'>
            <BetterAuthSignUp
                redirectUrl={redirectUrl}
                signInUrl="/sign-in"
                initialError={error ?? null}
            />
        </div>
    );
}
