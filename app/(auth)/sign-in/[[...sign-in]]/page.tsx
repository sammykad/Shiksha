import type { Metadata } from "next";
import { BetterAuthSignIn } from "@/components/auth/sign-in";

const AFTER_SIGN_IN_URL = "/dashboard";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackURL?: string }>;
}) {
  const { error, callbackURL } = await searchParams;

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <BetterAuthSignIn aftersignin={callbackURL || AFTER_SIGN_IN_URL} initialError={error} />
    </main>
  );
}
