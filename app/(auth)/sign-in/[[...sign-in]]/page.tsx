import { BetterAuthSignIn } from "@/components/auth/sign-in";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getSafeAuthCallbackUrl } from "@/lib/auth-navigation";

export default async function SignInPage({
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
    <div className="flex min-h-svh w-full flex-1 items-center justify-center bg-neutral-50 p-4 sm:p-6 md:p-10">
      <BetterAuthSignIn callbackUrl={safeCallbackUrl} initialError={initialError} />
    </div>
  );
}
