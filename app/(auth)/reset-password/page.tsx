import { ResetPasswordWithOtp } from "@/components/auth/reset-password-with-otp";
import { appendAuthCallbackUrl, getSafeAuthCallbackUrl } from "@/lib/auth-navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; email?: string | string[] }>;
}) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const callbackUrl = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;
  const safeCallbackUrl = getSafeAuthCallbackUrl(callbackUrl);
  const signInUrl = appendAuthCallbackUrl("/sign-in", safeCallbackUrl);

  return (
    <div className="flex w-full flex-1 items-center justify-center p-6 md:p-10">
      <ResetPasswordWithOtp initialEmail={email ?? ""} signInUrl={signInUrl} />
    </div>
  );
}
