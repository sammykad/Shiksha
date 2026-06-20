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
import { emailOtp, signIn, signUp } from "@/lib/auth-client";
import { markEmailVerifiedWithOwnershipToken } from "@/lib/auth-account-actions";
import { cn } from "@/lib/utils";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";
import { Google } from "../website/Icons";

type SignUpStep = "email" | "verify" | "existing" | "new";
type PasswordRequirement = { label: string; met: boolean };

export interface SignUpProps {
  className?: string;
  showOAuth?: boolean;
  heading?: string;
  subheading?: string;
  redirectUrl?: string;
  signInUrl?: string;
  initialError?: string | null;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const emailSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

const passwordRules = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Z]/, "Add one uppercase letter.")
  .regex(/\d/, "Add one number.");

const newAccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  password: passwordRules,
});

const existingAccountSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

type EmailValues = z.infer<typeof emailSchema>;
type NewAccountValues = z.infer<typeof newAccountSchema>;
type ExistingAccountValues = z.infer<typeof existingAccountSchema>;

type OwnershipResponse =
  | { exists: boolean; token: string; error?: never }
  | { error: string; exists?: never; token?: never };

function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
  ];
}

export function BetterAuthSignUp({
  className,
  showOAuth = true,
  heading = "Create your account",
  subheading = "Enter your email first. We will verify it before creating a new account.",
  redirectUrl = "/select-organization",
  signInUrl = "/sign-in",
  initialError = null,
}: SignUpProps) {
  const router = useRouter();
  const [isRouting, startTransition] = useTransition();
  const [step, setStep] = useState<SignUpStep>("email");
  const [error, setError] = useState<string | null>(initialError);
  const [pendingEmail, setPendingEmail] = useState("");
  const [ownershipToken, setOwnershipToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showExistingPassword, setShowExistingPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const newAccountForm = useForm<NewAccountValues>({
    resolver: zodResolver(newAccountSchema),
    mode: "onChange",
    defaultValues: { firstName: "", lastName: "", password: "" },
  });

  const existingAccountForm = useForm<ExistingAccountValues>({
    resolver: zodResolver(existingAccountSchema),
    mode: "onChange",
    defaultValues: { password: "" },
  });

  const newPassword = newAccountForm.watch("password");
  const passwordRequirements = useMemo(() => getPasswordRequirements(newPassword), [newPassword]);
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

  const resetOtpState = useCallback(() => {
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setOwnershipToken("");
  }, []);

  const sendOwnershipOtp = useCallback(async (email: string) => {
    const { error } = await emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (error) {
      setError(error.message ?? "Failed to send verification code");
      toast.error(error.message ?? "Failed to send verification code");
      return false;
    }

    return true;
  }, []);

  const handleOAuth = useCallback(async () => {
    if (isBusy) return;

    setError(null);
    setIsOAuthSubmitting(true);

    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
        errorCallbackURL: "/sign-up",
      });

      if (error) {
        const message = error.message ?? "Failed to sign in with Google";
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsOAuthSubmitting(false);
    }
  }, [isBusy, redirectUrl]);

  const handleRequestCode = useCallback(async (values: EmailValues) => {
    if (isBusy) return;

    const normalizedEmail = values.email.trim().toLowerCase();
    setError(null);
    setIsSubmitting(true);

    try {
      const sent = await sendOwnershipOtp(normalizedEmail);
      if (!sent) return;

      setPendingEmail(normalizedEmail);
      resetOtpState();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("verify");
      toast.success("Verification code sent.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isBusy, resetOtpState, sendOwnershipOtp]);

  const handleVerifyEmail = useCallback(async () => {
    if (!canVerify || isBusy || !pendingEmail) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth-email-ownership/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: otpCode }),
      });
      const result = (await response.json()) as OwnershipResponse;

      if (!response.ok || "error" in result) {
        const message =
          "error" in result && result.error
            ? result.error
            : "Verification failed. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      setOwnershipToken(result.token);
      setError(null);
      toast.success("Email verified.");

      if (result.exists) {
        existingAccountForm.reset({ password: "" });
        setStep("existing");
        return;
      }

      newAccountForm.reset({ firstName: "", lastName: "", password: "" });
      setStep("new");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canVerify, existingAccountForm, isBusy, newAccountForm, otpCode, pendingEmail]);

  const handleResendCode = useCallback(async () => {
    if (isBusy || resendCooldown > 0 || !pendingEmail) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const sent = await sendOwnershipOtp(pendingEmail);
      if (!sent) return;

      resetOtpState();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      otpRefs.current[0]?.focus();
      toast.success("Code resent.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isBusy, pendingEmail, resendCooldown, resetOtpState, sendOwnershipOtp]);

  const handleExistingSignIn = useCallback(async (values: ExistingAccountValues) => {
    if (isBusy || !pendingEmail) return;

    setError(null);
    existingAccountForm.clearErrors();
    setIsSubmitting(true);

    try {
      const { error } = await signIn.email({
        email: pendingEmail,
        password: values.password,
        callbackURL: redirectUrl,
      });

      if (error) {
        const message = error.message ?? "Invalid email or password";
        setError(message);
        toast.error(message);
        return;
      }
      startTransition(() => {
        router.push(redirectUrl);
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [existingAccountForm, isBusy, pendingEmail, redirectUrl, router, startTransition]);

  const handleCreateVerifiedAccount = useCallback(async (values: NewAccountValues) => {
    if (isBusy || !pendingEmail || !ownershipToken) return;

    setError(null);
    newAccountForm.clearErrors();
    setIsSubmitting(true);

    try {
      const { error } = await signUp.email({
        email: pendingEmail,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
        callbackURL: redirectUrl,
      });

      if (error) {
        const message = error.message ?? "Could not create account";
        setError(message);
        toast.error(message);
        return;
      }

      const verification = await markEmailVerifiedWithOwnershipToken(pendingEmail, ownershipToken);
      if (!verification.ok) {
        const message = verification.message ?? "Email verification expired. Please request a new code.";
        setError(message);
        toast.error(message);
        setStep("verify");
        return;
      }

      const { error: signInError } = await signIn.email({
        email: pendingEmail,
        password: values.password,
        callbackURL: redirectUrl,
      });

      if (signInError) {
        const message = signInError.message || "Account created, but sign in failed."
        setError(message);
        toast.error(message);
        return;
      }

      startTransition(() => {
        router.push(redirectUrl);
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isBusy, newAccountForm, ownershipToken, pendingEmail, redirectUrl, router, startTransition]);

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

  const handleBack = useCallback(() => {
    setError(null);

    if (step === "email") {
      router.push(signInUrl);
      return;
    }

    if (step === "verify") {
      setStep("email");
      resetOtpState();
      return;
    }

    setStep("verify");
  }, [resetOtpState, router, signInUrl, step]);

  return (
    <AuthCard data-slot="sign-up" className={className}>
      <AuthCardPanel className="rounded-lg border border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
        <SignUpHeader
          step={step}
          email={pendingEmail}
          heading={heading}
          subheading={subheading}
          isBusy={isBusy}
          onBack={handleBack}
        />

        {step === "email" ? (
          <EmailStep
            form={emailForm}
            error={error}
            isBusy={isBusy}
            isOAuthSubmitting={isOAuthSubmitting}
            showOAuth={showOAuth}
            onSubmit={handleRequestCode}
            onGoogle={handleOAuth}
            onSignIn={() => router.push(signInUrl)}
          />
        ) : step === "verify" ? (
          <VerifyEmailStep
            error={error}
            isBusy={isBusy}
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
        ) : step === "existing" ? (
          <ExistingAccountStep
            form={existingAccountForm}
            error={error}
            isBusy={isBusy}
            showPassword={showExistingPassword}
            onSubmit={handleExistingSignIn}
            onTogglePassword={() => setShowExistingPassword((value) => !value)}
            onResetPassword={() => {
              const params = new URLSearchParams({ email: pendingEmail });
              router.push(`/reset-password?${params.toString()}`);
            }}
          />
        ) : (
          <NewAccountStep
            form={newAccountForm}
            error={error}
            isBusy={isBusy}
            showPassword={showNewPassword}
            passwordRequirements={passwordRequirements}
            onSubmit={handleCreateVerifiedAccount}
            onTogglePassword={() => setShowNewPassword((value) => !value)}
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
  const title =
    step === "email"
      ? heading
      : step === "verify"
        ? "Verify your email"
        : step === "existing"
          ? "Welcome back"
          : "Finish creating your account";
  const description =
    step === "email"
      ? subheading
      : step === "verify"
        ? `Enter the verification code sent to ${email}`
        : step === "existing"
          ? `${email} already has an account. Enter your password to continue.`
          : `Email verified for ${email}. Add your name and password.`;

  return (
    <div data-slot="header" className="px-8 pb-5 pt-8 text-center">
      {step !== "email" ? (
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

      <h1 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-neutral-900">{title}</h1>
      <p className="mt-1.5 text-[0.8125rem] text-neutral-500">{description}</p>
    </div>
  );
}

function EmailStep({
  form,
  error,
  isBusy,
  isOAuthSubmitting,
  showOAuth,
  onSubmit,
  onGoogle,
  onSignIn,
}: {
  form: ReturnType<typeof useForm<EmailValues>>;
  error: string | null;
  isBusy: boolean;
  isOAuthSubmitting: boolean;
  showOAuth: boolean;
  onSubmit: (values: EmailValues) => Promise<void>;
  onGoogle: () => Promise<void>;
  onSignIn: () => void;
}) {
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
            <Google width={16} height={16} />
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
                  className={authInputClass(fieldState.invalid)}
                  {...field}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
              </Field>
            )}
          />

          {error ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[0.8125rem] font-medium text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? "Sending code..." : "Continue"}
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

function ExistingAccountStep({
  form,
  error,
  isBusy,
  showPassword,
  onSubmit,
  onTogglePassword,
  onResetPassword,
}: {
  form: ReturnType<typeof useForm<ExistingAccountValues>>;
  error: string | null;
  isBusy: boolean;
  showPassword: boolean;
  onSubmit: (values: ExistingAccountValues) => Promise<void>;
  onTogglePassword: () => void;
  onResetPassword: () => void;
}) {
  return (
    <div data-slot="existing-account-body" className="px-8 pb-7">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PasswordField
            control={form.control}
            name="password"
            id="existing-password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            showPassword={showPassword}
            disabled={isBusy}
            onTogglePassword={onTogglePassword}
          />

          <button
            type="button"
            onClick={onResetPassword}
            disabled={isBusy}
            className="mt-2 text-[0.75rem] font-medium text-violet-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-violet-300"
          >
            Reset password
          </button>

          {error ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[0.8125rem] font-medium text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </Form>
    </div>
  );
}

function NewAccountStep({
  form,
  error,
  isBusy,
  showPassword,
  passwordRequirements,
  onSubmit,
  onTogglePassword,
}: {
  form: ReturnType<typeof useForm<NewAccountValues>>;
  error: string | null;
  isBusy: boolean;
  showPassword: boolean;
  passwordRequirements: PasswordRequirement[];
  onSubmit: (values: NewAccountValues) => Promise<void>;
  onTogglePassword: () => void;
}) {
  const password = form.watch("password");

  return (
    <div data-slot="new-account-body" className="px-8 pb-7">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-3.5">
            <div className="flex gap-3">
              <NameField form={form} name="firstName" label="First name" />
              <NameField form={form} name="lastName" label="Last name" />
            </div>

            <PasswordField
              control={form.control}
              name="password"
              id="signup-password"
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              showPassword={showPassword}
              disabled={isBusy}
              onTogglePassword={onTogglePassword}
            />

            {password ? <PasswordChecklist requirements={passwordRequirements} /> : null}
          </FieldGroup>

          {error ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[0.8125rem] font-medium text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isBusy ? "Creating account..." : "Create account"}
          </button>
        </form>
      </Form>
    </div>
  );
}

function NameField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<NewAccountValues>>;
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
            disabled={form.formState.isSubmitting}
            className={authInputClass(fieldState.invalid)}
            {...field}
          />
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} className="text-[0.75rem] text-red-500" />
        </Field>
      )}
    />
  );
}

function PasswordField<T extends ExistingAccountValues | NewAccountValues>({
  control,
  name,
  id,
  label,
  placeholder,
  autoComplete,
  showPassword,
  disabled,
  onTogglePassword,
}: {
  control: ReturnType<typeof useForm<T>>["control"];
  name: keyof T & string;
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  showPassword: boolean;
  disabled: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name as never}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
          <FieldLabel htmlFor={id} className="block text-[0.8125rem] font-medium text-neutral-700">
            {label}
          </FieldLabel>
          <div className="relative">
            <input
              id={id}
              type={showPassword ? "text" : "password"}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              disabled={disabled}
              className={cn(authInputClass(fieldState.invalid), "pr-9")}
              {...field}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={onTogglePassword}
              disabled={disabled}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
            disabled={isBusy}
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
        disabled={!canVerify || isBusy}
        onClick={onVerify}
        className={cn(
          "mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-all active:scale-[0.99]",
          canVerify && !isBusy
            ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
            : "cursor-not-allowed bg-violet-300 text-white"
        )}
      >
        {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {isBusy ? "Verifying..." : "Verify"}
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

function authInputClass(hasError: boolean) {
  return cn(
    "h-9 w-full rounded-lg border bg-white px-3 text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
      : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20"
  );
}
