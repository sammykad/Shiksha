import { BetterAuthSignUp } from "@/components/auth/sign-up";
import { appendAuthCallbackUrl, getSafeAuthCallbackUrl } from "@/lib/auth-navigation";

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
    const params = await searchParams;
    const callbackUrl = Array.isArray(params.callbackUrl)
        ? params.callbackUrl[0]
        : params.callbackUrl;
    const safeCallbackUrl = getSafeAuthCallbackUrl(callbackUrl);

    return (
        <div className='flex w-full flex-1 items-center justify-center p-6 md:p-10'>
            <BetterAuthSignUp
                redirectUrl={safeCallbackUrl}
                signInUrl={appendAuthCallbackUrl("/sign-in", safeCallbackUrl)}
            />
        </div>
    );
}
