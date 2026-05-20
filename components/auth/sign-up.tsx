"use client";

import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { emailOTP, signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";

type SignUpStep = "form" | "verify";
type PasswordRequirement = { label: string; met: boolean };

export interface SignUpProps {
  className?: string;
  showOAuth?: boolean;
  heading?: string;
  subheading?: string;
  redirectUrl?: string;
  signInUrl?: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Add one uppercase letter.")
    .regex(/\d/, "Add one number."),
});

type SignUpValues = z.infer<typeof signUpSchema>;

function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
  ];
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function BetterAuthSignUp({
  className,
  showOAuth = true,
  heading = "Create your account",
  subheading = "Welcome! Please fill in the details to get started.",
  redirectUrl = "/dashboard",
  signInUrl = "/sign-in",
}: SignUpProps) {
  const router = useRouter();
  const [isRouting, startTransition] = useTransition();
  const [step, setStep] = useState<SignUpStep>("form");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const email = form.watch("email").trim().toLowerCase();
  const password = form.watch("password");
  const passwordRequirements = useMemo(() => getPasswordRequirements(password), [password]);
  const otpCode = useMemo(() => otpDigits.join(""), [otpDigits]);
  const canVerify = otpCode.length === OTP_LENGTH;
  const isBusy = isSubmitting || isOAuthSubmitting || isRouting;

  useEffect(() => {
    if (step === "verify") {
      window.requestAnimationFrame(() => otpRefs.current[0]?.focus());
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const moveToVerifyStep = useCallback((nextEmail: string) => {
    form.setValue("email", nextEmail);
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setStep("verify");
  }, [form]);

  const handleOAuth = useCallback(async () => {
    if (isBusy) return;

    setError(null);
    setIsOAuthSubmitting(true);

    try {
      const { error: oauthError } = await signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
      });

      if (oauthError) {
        setError(oauthError.message ?? "Google sign up failed. Please try again.");
      }
    } finally {
      setIsOAuthSubmitting(false);
    }
  }, [isBusy, redirectUrl]);

  const handleCreateAccount = useCallback(async (values: SignUpValues) => {
    if (isBusy) return;

    const normalizedEmail = values.email.trim().toLowerCase();
    setError(null);
    setIsVerified(false);
    setIsSubmitting(true);

    try {
      const { error: signUpError } = await signUp.email({
        email: normalizedEmail,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
        callbackURL: redirectUrl,
      });

      if (signUpError) {
        const message = signUpError.message ?? "Sign up failed.";
        setError(message.includes("already exists")
          ? "This email already has an account. Please sign in instead."
          : message);
        return;
      }

      moveToVerifyStep(normalizedEmail);
    } finally {
      setIsSubmitting(false);
    }
  }, [isBusy, moveToVerifyStep, redirectUrl]);

  const handleVerifyEmail = useCallback(async () => {
    if (!canVerify || isBusy || isVerified) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: verifyError } = await emailOTP.verifyEmail({ email, otp: otpCode });
      if (verifyError) {
        setError(verifyError.message ?? "Verification failed.");
        return;
      }

      setIsVerified(true);
      toast.success("Email verified successfully.");

      const { error: signInError } = await signIn.email({
        email,
        password,
        callbackURL: redirectUrl,
      });

      if (signInError) {
        setError(signInError.message ?? "Email verified. Please sign in to continue.");
        return;
      }

      startTransition(() => {
        router.push(redirectUrl);
        router.refresh();
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canVerify, email, isBusy, isVerified, otpCode, password, redirectUrl, router, startTransition]);

  const handleResendCode = useCallback(async () => {
    if (isBusy || resendCooldown > 0) return;

    setError(null);
    setIsVerified(false);
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setIsSubmitting(true);

    try {
      const { error: resendError } = await emailOTP.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (resendError) {
        setError(resendError.message ?? "Failed to resend verification code.");
        return;
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isBusy, resendCooldown]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit && value) return;

    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedCode) return;

    setOtpDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pastedCode[index] ?? ""));
    otpRefs.current[Math.min(pastedCode.length, OTP_LENGTH) - 1]?.focus();
  }, []);

  return (
    <AuthCard data-slot="sign-up" className={className}>
      <AuthCardPanel className="rounded-lg border border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
        <SignUpHeader
          step={step}
          email={email}
          heading={heading}
          subheading={subheading}
          isBusy={isBusy}
          onBack={() => {
            setIsVerified(false);
            setStep("form");
            setError(null);
          }}
        />

        {step === "form" ? (
          <SignUpForm
            form={form}
            error={error}
            isBusy={isBusy}
            isOAuthSubmitting={isOAuthSubmitting}
            showOAuth={showOAuth}
            showPassword={showPassword}
            passwordRequirements={passwordRequirements}
            onSubmit={handleCreateAccount}
            onGoogle={handleOAuth}
            onTogglePassword={() => setShowPassword((value) => !value)}
            onSignIn={() => router.push(signInUrl)}
          />
        ) : (
          <VerifyEmailStep
            error={error}
            isBusy={isBusy}
            isVerified={isVerified}
            otpDigits={otpDigits}
            otpRefs={otpRefs}
            canVerify={canVerify}
            resendCooldown={resendCooldown}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onOtpPaste={handleOtpPaste}
            onVerify={handleVerifyEmail}
            onResend={handleResendCode}
          />
        )}
      </AuthCardPanel>
      <AuthFooter />
    </AuthCard>
  );
}

function SignUpHeader({
  step,
  email,
  heading,
  subheading,
  isBusy,
  onBack,
}: {
  step: SignUpStep;
  email: string;
  heading: string;
  subheading: string;
  isBusy: boolean;
  onBack: () => void;
}) {
  return (
    <div data-slot="header" className="px-8 pb-5 pt-8 text-center">
      {step === "verify" ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      ) : null}

      <h1 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-neutral-900">
        {step === "form" ? heading : "Verify your email"}
      </h1>
      <p className="mt-1.5 text-[0.8125rem] text-neutral-500">
        {step === "form" ? subheading : `Enter the verification code sent to ${email}`}
      </p>
    </div>
  );
}

function SignUpForm({
  form,
  error,
  isBusy,
  isOAuthSubmitting,
  showOAuth,
  showPassword,
  passwordRequirements,
  onSubmit,
  onGoogle,
  onTogglePassword,
  onSignIn,
}: {
  form: ReturnType<typeof useForm<SignUpValues>>;
  error: string | null;
  isBusy: boolean;
  isOAuthSubmitting: boolean;
  showOAuth: boolean;
  showPassword: boolean;
  passwordRequirements: PasswordRequirement[];
  onSubmit: (values: SignUpValues) => Promise<void>;
  onGoogle: () => Promise<void>;
  onTogglePassword: () => void;
  onSignIn: () => void;
}) {
  const password = form.watch("password");

  return (
    <div data-slot="form-body" className="px-8 pb-7">
      {showOAuth ? (
        <>
          <button
            type="button"
            onClick={onGoogle}
            disabled={isBusy}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-[0.8125rem] font-medium text-neutral-800 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isOAuthSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            <GoogleIcon />
            Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-neutral-400">or</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
        </>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-3.5">
            <div className="flex gap-3">
              <NameField form={form} name="firstName" label="First name" />
              <NameField form={form} name="lastName" label="Last name" />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel htmlFor="signup-email" className="block text-[0.8125rem] font-medium text-neutral-700">
                    Email address
                  </FieldLabel>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    aria-invalid={fieldState.invalid}
                    disabled={isBusy}
                    className={cn(
                      "h-9 w-full rounded-lg border bg-white px-3 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
                      fieldState.invalid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20"
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
                  <FieldLabel htmlFor="signup-password" className="block text-[0.8125rem] font-medium text-neutral-700">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      aria-invalid={fieldState.invalid}
                      disabled={isBusy}
                      className={cn(
                        "h-9 w-full rounded-lg border bg-white px-3 pr-9 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
                        fieldState.invalid
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20"
                      )}
                      {...field}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={onTogglePassword}
                      disabled={isBusy}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {password ? <PasswordChecklist requirements={passwordRequirements} /> : null}
                  <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
                </Field>
              )}
            />
          </FieldGroup>

          {error ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[0.8125rem] font-medium text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? "Creating account..." : "Continue"}
          </button>
        </form>
      </Form>

      <p className="mt-4 text-center text-[0.8125rem] text-neutral-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          disabled={isBusy}
          className="font-medium text-violet-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-violet-300"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

function NameField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<SignUpValues>>;
  name: "firstName" | "lastName";
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="flex-1 gap-1.5">
          <FieldLabel htmlFor={`signup-${name}`} className="block text-[0.8125rem] font-medium text-neutral-700">
            {label}
          </FieldLabel>
          <input
            id={`signup-${name}`}
            type="text"
            autoComplete={name === "firstName" ? "given-name" : "family-name"}
            aria-invalid={fieldState.invalid}
            className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            {...field}
          />
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
        </Field>
      )}
    />
  );
}

function PasswordChecklist({ requirements }: { requirements: PasswordRequirement[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {requirements.map((requirement) => (
        <li
          key={requirement.label}
          className={cn(
            "flex items-center gap-1 text-[0.75rem] transition-colors",
            requirement.met ? "text-emerald-500" : "text-neutral-400"
          )}
        >
          <Check className={cn("h-3 w-3 shrink-0", requirement.met ? "text-emerald-500" : "text-neutral-300")} />
          {requirement.label}
        </li>
      ))}
    </ul>
  );
}

function VerifyEmailStep({
  error,
  isBusy,
  isVerified,
  otpDigits,
  otpRefs,
  canVerify,
  resendCooldown,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onVerify,
  onResend,
}: {
  error: string | null;
  isBusy: boolean;
  isVerified: boolean;
  otpDigits: string[];
  otpRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  canVerify: boolean;
  resendCooldown: number;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
}) {
  return (
    <div data-slot="verify-body" className="px-8 pb-7">
      <div className="flex justify-center gap-2">
        {otpDigits.map((digit, index) => (
          <input
            key={`otp-${index}`}
            ref={(element) => {
              otpRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={isBusy || isVerified}
            onChange={(event) => onOtpChange(index, event.target.value)}
            onKeyDown={(event) => onOtpKeyDown(index, event)}
            onPaste={onOtpPaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              "h-12 w-10 rounded-xl border bg-white text-center text-lg font-semibold text-neutral-900 outline-none transition-all",
              digit
                ? "border-violet-500 ring-2 ring-violet-500/20"
                : "border-neutral-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            )}
          />
        ))}
      </div>

      {error ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p> : null}

      <button
        type="button"
        disabled={!canVerify || isBusy || isVerified}
        onClick={onVerify}
        className={cn(
          "mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-all active:scale-[0.99]",
          canVerify && !isBusy && !isVerified
            ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
            : "cursor-not-allowed bg-violet-300 text-white"
        )}
      >
        {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {isVerified ? "Verified" : isBusy ? "Verifying..." : "Verify"}
      </button>

      <p className="mt-4 text-center text-[0.8125rem] text-neutral-500">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={isBusy || resendCooldown > 0}
          className="font-medium text-violet-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-violet-300"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
        </button>
      </p>
    </div>
  );
}
