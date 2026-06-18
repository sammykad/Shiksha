"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { Google } from "../website/Icons";


export interface SignInProps {
  className?: string;
  aftersignin?: string;
  signUpUrl?: string;
  resetPasswordUrl?: string;
  initialError?: string | null;
}

const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function BetterAuthSignIn({
  className,
  aftersignin,
  signUpUrl = "/sign-up",
  resetPasswordUrl = "/reset-password",
  initialError = null,
}: SignInProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isAuthBusy = isEmailSubmitting || isGoogleSubmitting;
  const canSubmit = !isAuthBusy;
  const afterSignInUrl = aftersignin ?? "/dashboard";

  const handleEmailSignIn = useCallback(async (values: SignInValues) => {
    if (!canSubmit) return;

    setError(null);
    form.clearErrors();
    setIsEmailSubmitting(true);

    try {
      const { error } = await signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        callbackURL: afterSignInUrl,
      });

      if (error) {
        const errorMessage = error.message ?? "Invalid email or password";
        setError(errorMessage);
        return;
      }

      toast.success("Signed in successfully.");
      router.push(afterSignInUrl);
    } finally {
      setIsEmailSubmitting(false);
    }
  }, [afterSignInUrl, canSubmit, form, router]);

  const handleGoogleSignIn = useCallback(async () => {
    if (isAuthBusy) return;

    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: afterSignInUrl,
        errorCallbackURL: "/sign-in",
      });

      if (error) {
        const errorMessage = error.message ?? "Failed to sign in with Google";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  }, [afterSignInUrl, isAuthBusy]);

  return (
    <AuthCard data-slot="sign-in" className={className}>
      <AuthCardPanel className=" border border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
        <div data-slot="header" className="px-8 pt-8 pb-5 text-center">
          <h1 className="text-[1.125rem] font-semibold text-neutral-900">Sign in to Shiksha Cloud</h1>
          <p className="mt-1.5 text-[0.8125rem] text-neutral-500">Use your institution / personal account to continue.</p>
        </div>

        <div data-slot="form-body" className="px-8 pb-7">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthBusy}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-[0.8125rem] font-medium text-neutral-800 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGoogleSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            <Google width={16} height={16} />
            Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-neutral-400">or</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSignIn)}>
              <FieldGroup className="gap-3.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel htmlFor="signin-email" className="block text-[0.8125rem] font-medium text-neutral-700">
                        Email address
                      </FieldLabel>
                      <input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        aria-invalid={fieldState.invalid}
                        disabled={isAuthBusy}
                        className={cn(
                          "h-9 w-full rounded-lg border bg-white px-3 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
                          fieldState.invalid
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20",
                        )}
                        {...field}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
                    </Field>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel htmlFor="signin-password" className="block text-[0.8125rem] font-medium text-neutral-700">
                        Password
                      </FieldLabel>
                      <div className="relative">
                        <input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          aria-invalid={fieldState.invalid}
                          disabled={isAuthBusy}
                          className={cn(
                            "h-9 w-full rounded-lg border bg-white px-3 pr-9 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
                            fieldState.invalid
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20",
                          )}
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((value) => !value)}
                          disabled={isAuthBusy}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
                    </Field>
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    const email = form.getValues("email").trim();
                    const params = new URLSearchParams();
                    if (email) params.set("email", email);
                    router.push(params.size > 0 ? `${resetPasswordUrl}?${params.toString()}` : resetPasswordUrl);
                  }}
                  className="self-end text-[0.75rem] font-medium text-violet-600 underline-offset-4 hover:underline"
                >
                  Reset password
                </button>
              </FieldGroup>

              {error && <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-all active:scale-[0.99]",
                  canSubmit
                    ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
                    : "cursor-not-allowed bg-violet-300 text-white",
                )}
              >
                {isEmailSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {isEmailSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </Form>

          <p className="mt-4 text-center text-[0.8125rem] text-neutral-500">
            New to Shiksha Cloud?{" "}
            <button
              type="button"
              onClick={() => router.push(signUpUrl)}
              className="font-medium text-violet-600 underline-offset-4 hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </AuthCardPanel>
      <AuthFooter />
    </AuthCard>
  );
}
