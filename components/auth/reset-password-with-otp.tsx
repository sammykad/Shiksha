"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { markEmailVerifiedAfterPasswordReset } from "@/lib/auth-account-actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";

type Step = "email" | "otp" | "password" | "done";

const OTP_LENGTH = 6;

const emailSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[0-9]/, "Add at least one number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

type EmailValues = z.infer<typeof emailSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type EmailOtpApi = {
  requestPasswordReset: (input: { email: string }) => Promise<{ error?: { message?: string } | null }>;
  checkVerificationOtp?: (input: { email: string; type: "forget-password"; otp: string }) => Promise<{ error?: { message?: string } | null }>;
  checkVerificationOTP?: (input: { email: string; type: "forget-password"; otp: string }) => Promise<{ error?: { message?: string } | null }>;
  resetPassword: (input: { email: string; otp: string; password: string }) => Promise<{ error?: { message?: string } | null }>;
};

export function ResetPasswordWithOtp({
  initialEmail = "",
  signInUrl = "/sign-in",
}: {
  initialEmail?: string;
  signInUrl?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const emailOtp = authClient.emailOtp as unknown as EmailOtpApi;

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialEmail },
    mode: "onTouched",
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const otp = useMemo(() => otpDigits.join(""), [otpDigits]);
  const canVerifyOtp = otp.length === OTP_LENGTH && !pending;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const startCooldown = () => setResendCooldown(30);

  const handleRequestOtp = async (values: EmailValues, options?: { stayOnOtp?: boolean }) => {
    const nextEmail = values.email.trim().toLowerCase();
    setPending(true);
    setOtpError(null);
    try {
      const { error } = await emailOtp.requestPasswordReset({ email: nextEmail });
      if (error) {
        const message = error.message ?? "Could not send reset code.";
        emailForm.setError("email", { message });
        toast.error(message);
        return;
      }

      setEmail(nextEmail);
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setVerifiedOtp("");
      setStep("otp");
      startCooldown();
      toast.success(options?.stayOnOtp ? "Code resent." : "Reset code sent.");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpError(null);
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
    setOtpError(null);
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleCheckOtp = async () => {
    if (!canVerifyOtp) {
      setOtpError("Enter the 6-digit code.");
      return;
    }

    setPending(true);
    setOtpError(null);
    try {
      const checkOtp = emailOtp.checkVerificationOtp ?? emailOtp.checkVerificationOTP;
      if (checkOtp) {
        const { error } = await checkOtp({
          email,
          type: "forget-password",
          otp,
        });
        if (error) {
          const message = error.message ?? "Invalid reset code.";
          setOtpError(message);
          toast.error(message);
          return;
        }
      }

      setVerifiedOtp(otp);
      setStep("password");
      toast.success("Code verified.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  const handleResetPassword = async (values: PasswordValues) => {
    setPending(true);
    try {
      const { error } = await emailOtp.resetPassword({
        email,
        otp: verifiedOtp,
        password: values.password,
      });
      if (error) {
        const message = error.message ?? "Could not reset password.";
        passwordForm.setError("password", { message });
        toast.error(message);
        return;
      }

      await markEmailVerifiedAfterPasswordReset(email);
      setStep("done");
      toast.success("Password reset.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  const goBack = () => {
    if (step === "email") {
      router.push(signInUrl);
      return;
    }
    if (step === "otp") {
      setStep("email");
      return;
    }
    if (step === "password") {
      setStep("otp");
      return;
    }
    router.push(signInUrl);
  };

  return (
    <AuthCard data-slot="reset-password" className="max-w-[400px]">
      <AuthCardPanel className="border border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
        <div className="px-8 pb-8 pt-8">
          {step !== "done" ? (
            <button
              type="button"
              onClick={goBack}
              className="mx-auto mb-5 flex items-center justify-center gap-1.5 text-[0.875rem] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : null}

          {step === "email" ? (
            <div className="text-center">
              <h1 className="text-[1.25rem] font-semibold text-neutral-950">Reset your password</h1>
              <p className="mx-auto mt-2 max-w-[270px] text-[0.875rem] leading-6 text-neutral-500">
                Enter your email and we&apos;ll send a verification code.
              </p>
            </div>
          ) : null}

          {step === "otp" ? (
            <div className="text-center">
              <h1 className="text-[1.25rem] font-semibold text-neutral-950">Verify your email</h1>
              <p className="mx-auto mt-2 max-w-[260px] text-[0.875rem] leading-6 text-neutral-500">
                Enter the verification code sent to {email}
              </p>
            </div>
          ) : null}

          {step === "password" ? (
            <div className="text-center">
              <h1 className="text-[1.25rem] font-semibold text-neutral-950">Create new password</h1>
              <p className="mx-auto mt-2 max-w-[270px] text-[0.875rem] leading-6 text-neutral-500">
                Choose a new password for {email}
              </p>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="text-[1.25rem] font-semibold text-neutral-950">Password reset</h1>
              <p className="mx-auto mt-2 max-w-[270px] text-[0.875rem] leading-6 text-neutral-500">
                Your password has been updated. Sign in with your new password.
              </p>
            </div>
          ) : null}

          {step === "email" ? (
            <Form {...emailForm}>
              <form className="mt-6 flex flex-col gap-4" onSubmit={emailForm.handleSubmit((values) => handleRequestOtp(values))}>
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[0.8125rem] font-medium text-neutral-700">Email address</FormLabel>
                      <FormControl>
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email address"
                          aria-invalid={fieldState.invalid}
                          className={cn(
                            "h-10 w-full rounded-lg border bg-white px-3 text-[0.875rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2",
                            fieldState.invalid
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[0.75rem] text-red-500" />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 text-[0.875rem] font-semibold text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300"
                >
                  {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Send code
                </button>
              </form>
            </Form>
          ) : null}

          {step === "otp" ? (
            <div className="mt-6">
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed OTP positions
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={pending}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    onFocus={(event) => event.target.select()}
                    className={cn(
                      "size-12 rounded-xl border bg-white text-center text-lg font-semibold text-neutral-950 outline-none transition-all",
                      digit
                        ? "border-violet-500 ring-2 ring-violet-500/20"
                        : "border-neutral-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
                      otpError && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                    )}
                  />
                ))}
              </div>

              {otpError ? <p className="mt-3 text-center text-[0.8125rem] text-red-500">{otpError}</p> : null}

              <button
                type="button"
                disabled={!canVerifyOtp}
                onClick={handleCheckOtp}
                className={cn(
                  "mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[0.875rem] font-semibold transition-colors",
                  canVerifyOtp
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "cursor-not-allowed bg-violet-300 text-white",
                )}
              >
                {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Verify
              </button>

              <p className="mt-4 text-center text-[0.8125rem] text-neutral-500">
                Didn&apos;t receive a code?{" "}
                <button
                  type="button"
                  disabled={pending || resendCooldown > 0}
                  onClick={() => handleRequestOtp({ email }, { stayOnOtp: true })}
                  className="font-medium text-violet-500 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-violet-300"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
              </p>
            </div>
          ) : null}

          {step === "password" ? (
            <Form {...passwordForm}>
              <form className="mt-6 flex flex-col gap-4" onSubmit={passwordForm.handleSubmit(handleResetPassword)}>
                <PasswordField
                  control={passwordForm.control}
                  name="password"
                  label="New password"
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
                <PasswordField
                  control={passwordForm.control}
                  name="confirmPassword"
                  label="Confirm new password"
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 text-[0.875rem] font-semibold text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300"
                >
                  {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Reset password
                </button>
              </form>
            </Form>
          ) : null}

          {step === "done" ? (
            <button
              type="button"
              onClick={() => router.push(signInUrl)}
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-violet-500 text-[0.875rem] font-semibold text-white transition-colors hover:bg-violet-600"
            >
              Back to sign in
            </button>
          ) : null}
        </div>
      </AuthCardPanel>
      <AuthFooter />
    </AuthCard>
  );
}

function PasswordField({
  control,
  name,
  label,
  show,
  onToggle,
}: {
  control: ReturnType<typeof useForm<PasswordValues>>["control"];
  name: keyof PasswordValues;
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-[0.8125rem] font-medium text-neutral-700">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                className={cn(
                  "h-10 w-full rounded-lg border bg-white px-3 pr-10 text-[0.875rem] text-neutral-900 outline-none placeholder:text-neutral-400 transition-all focus:ring-2",
                  fieldState.invalid
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/20",
                )}
                {...field}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-[0.75rem] text-red-500" />
        </FormItem>
      )}
    />
  );
}
