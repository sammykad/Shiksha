import { BetterAuthSignIn } from "@/components/auth/sign-in";
import { getSafeAuthCallbackUrl } from "@/lib/auth-navigation";

export default async function SignInPage({
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
    <div className="flex min-h-svh w-full flex-1 items-center justify-center bg-neutral-50 p-4 sm:p-6 md:p-10">
      <BetterAuthSignIn callbackUrl={safeCallbackUrl} />
    </div>
  );
}
