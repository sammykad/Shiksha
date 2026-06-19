import { ResetPasswordWithOtp } from "@/components/auth/reset-password-with-otp";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex w-full flex-1 items-center justify-center p-6 md:p-10">
      <ResetPasswordWithOtp initialEmail={email ?? ''} signInUrl="/sign-in" />
    </div>
  );
}
