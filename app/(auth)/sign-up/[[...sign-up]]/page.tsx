import { BetterAuthSignUp } from "@/components/auth/sign-up";

const PLAN_CODES = ["starter", "growth", "scale"] as const;

function getPlanParam(value: string | string[] | undefined) {
    const plan = Array.isArray(value) ? value[0] : value;
    if (!plan) return null;
    return PLAN_CODES.includes(plan as (typeof PLAN_CODES)[number]) ? plan : null;
}

function getPlanBillingUrl(plan: string | null) {
    const params = new URLSearchParams({ section: "billing" });
    if (plan) params.set("plan", plan);
    return `/dashboard/settings?${params.toString()}`;
}

function getPlanSelectionUrl(plan: string | null) {
    const params = new URLSearchParams({
        returnUrl: getPlanBillingUrl(plan),
        switch: "true",
    });

    return `/select-organization?${params.toString()}`;
}

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{
        error?: string | string[];
        plan?: string | string[];
    }>;
}) {
    const params = await searchParams;
    const plan = getPlanParam(params.plan);
    const error = Array.isArray(params.error)
        ? params.error[0]
        : params.error;
    const redirectUrl = getPlanSelectionUrl(plan);

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
