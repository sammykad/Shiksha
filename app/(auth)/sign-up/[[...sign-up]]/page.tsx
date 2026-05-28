import { BetterAuthSignUp } from "@/components/auth/sign-up";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { appendAuthCallbackUrl, getSafeAuthCallbackUrl } from "@/lib/auth-navigation";

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
    const params = await searchParams;
    const callbackUrl = Array.isArray(params.callbackUrl)
        ? params.callbackUrl[0]
        : params.callbackUrl;
    const error = Array.isArray(params.error)
        ? params.error[0]
        : params.error;
    const safeCallbackUrl = getSafeAuthCallbackUrl(callbackUrl);
    const initialError = error
        ? getAuthErrorMessage(error, {
            fallback: "Authentication failed. Please try again.",
        })
        : null;

    return (
        <div className='flex w-full flex-1 items-center justify-center p-6 md:p-10'>
            <BetterAuthSignUp
                redirectUrl={safeCallbackUrl}
                signInUrl={appendAuthCallbackUrl("/sign-in", safeCallbackUrl)}
                initialError={initialError}
            />
        </div>
    );
}
