export type AuthErrorField = "email" | "password" | "otp" | "form";

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
  error?: {
    code?: string;
    message?: string;
  };
};

type AuthErrorMessageOptions = {
  fallback: string;
  messages?: Partial<Record<string, string>>;
};

const BASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "No account exists for this email. Please sign up first.",
  ACCOUNT_NOT_FOUND: "No account exists for this email. Please sign up first.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "No password account exists for this email. Try Google sign in or sign up first.",
  USER_EMAIL_NOT_FOUND: "No email address was found for this account.",
  INVALID_PASSWORD: "Incorrect password. Please try again.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_EMAIL_OR_PASSWORD: "Email or password is incorrect. Please check both and try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  USER_ALREADY_EXISTS: "This email already has an account. Please sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "This email already has an account. Please use another email.",
  PASSWORD_TOO_SHORT: "Use a longer password.",
  PASSWORD_TOO_LONG: "Use a shorter password.",
  INVALID_TOKEN: "This code or link is invalid. Check it and try again.",
  TOKEN_EXPIRED: "This code or link has expired. Request a new one.",
  SESSION_EXPIRED: "Your session expired. Please sign in again.",
  VALIDATION_ERROR: "Please check the form and try again.",
  MISSING_FIELD: "Please fill in the required fields.",
  FAILED_TO_CREATE_USER: "We could not create your account. Please try again.",
  FAILED_TO_CREATE_SESSION: "We could not start your session. Please sign in again.",
  FAILED_TO_GET_SESSION: "We could not load your session. Please sign in again.",
  INVALID_ORIGIN: "This request came from an invalid origin. Please refresh and try again.",
  INVALID_CALLBACK_URL: "The return URL is invalid. Please refresh and try again.",
  INVALID_REDIRECT_URL: "The redirect URL is invalid. Please refresh and try again.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: "For your security, this sign in request was blocked. Please try again.",
  VERIFICATION_EMAIL_NOT_ENABLED: "Email verification is not enabled. Please contact support.",
  EMAIL_ALREADY_VERIFIED: "This email is already verified.",
  EMAIL_MISMATCH: "This code does not belong to that email address.",
};

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_callback_request: "Google sign in could not be completed. Please try again.",
  state_not_found: "Your Google sign in session expired. Please try again.",
  state_mismatch: "Your Google sign in session could not be verified. Please try again.",
  state_invalid: "Your Google sign in session could not be read. Please try again.",
  state_security_mismatch: "Your Google sign in session could not be trusted. Please try again.",
  state_generation_error: "We could not start Google sign in. Please try again.",
  no_code: "Google did not return a sign in code. Please try again.",
  invalid_code: "Google sign in code expired. Please try again.",
  no_callback_url: "Google sign in is missing a return URL. Please try again.",
  oauth_provider_not_found: "Google sign in is not configured correctly.",
  unable_to_get_user_info: "We could not get your Google account details. Please try again.",
  email_not_found: "Google did not return an email address. Please use another account.",
  "email_doesn't_match": "This Google account email does not match the linked account.",
  unable_to_link_account: "We could not link this Google account. Please try again.",
  account_already_linked_to_different_user: "This Google account is already linked to another user.",
  account_not_linked: "This Google account is not linked yet. Please sign in with email first.",
  unable_to_create_user: "We could not create your account from Google. Please try again.",
  unable_to_create_session: "We could not start your Google session. Please try again.",
  signup_disabled: "New sign ups are currently disabled.",
  please_restart_the_process: "Please restart Google sign in.",
  internal_server_error: "Google sign in failed on our side. Please try again.",
};

const SIGN_IN_ERROR_MESSAGES: Partial<Record<string, string>> = {
  USER_NOT_FOUND: "No account exists for this email. Please sign up first.",
  ACCOUNT_NOT_FOUND: "No account exists for this email. Please sign up first.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "No password account exists for this email. Try Google sign in or sign up first.",
  INVALID_PASSWORD: "Incorrect password. Please try again.",
  INVALID_EMAIL_OR_PASSWORD: "Email or password is incorrect. Please check both and try again.",
};

const SIGN_UP_ERROR_MESSAGES: Partial<Record<string, string>> = {
  USER_ALREADY_EXISTS: "This email already has an account. Please sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "This email already has an account. Please use another email.",
  INVALID_EMAIL_OR_PASSWORD: "Please check your email and password, then try again.",
};

const OTP_ERROR_MESSAGES: Partial<Record<string, string>> = {
  INVALID_TOKEN: "The verification code is invalid. Check it and try again.",
  TOKEN_EXPIRED: "The verification code has expired. Request a new code.",
  EMAIL_MISMATCH: "This code does not belong to that email address.",
};

export function getAuthErrorCode(error: unknown): string | undefined {
  if (typeof error === "string") {
    return getKnownErrorCode(error) ?? inferCodeFromMessage(error);
  }

  const authError = asAuthError(error);
  const explicitCode = authError?.code ?? authError?.error?.code;

  if (explicitCode) {
    return getKnownErrorCode(explicitCode) ?? explicitCode;
  }

  return inferCodeFromMessage(getRawAuthErrorMessage(error));
}

export function getAuthErrorField(error: unknown): AuthErrorField {
  const code = getAuthErrorCode(error);

  if (!code) return "form";

  if (["USER_NOT_FOUND", "ACCOUNT_NOT_FOUND", "CREDENTIAL_ACCOUNT_NOT_FOUND", "USER_EMAIL_NOT_FOUND", "INVALID_EMAIL"].includes(code)) {
    return "email";
  }

  if (["INVALID_PASSWORD", "PASSWORD_TOO_SHORT", "PASSWORD_TOO_LONG", "USER_ALREADY_HAS_PASSWORD", "PASSWORD_ALREADY_SET"].includes(code)) {
    return "password";
  }

  if (["INVALID_TOKEN", "TOKEN_EXPIRED", "EMAIL_MISMATCH"].includes(code)) {
    return "otp";
  }

  return "form";
}

export function getAuthErrorMessage(error: unknown, options: AuthErrorMessageOptions): string {
  const code = getAuthErrorCode(error);

  if (code) {
    const message = options.messages?.[code] ?? BASE_AUTH_ERROR_MESSAGES[code] ?? OAUTH_ERROR_MESSAGES[code];
    if (message) return message;
  }

  return options.fallback;
}

export function getSignInErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, {
    fallback: "Sign in failed. Please check your email and password.",
    messages: SIGN_IN_ERROR_MESSAGES,
  });
}

export function getSignUpErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, {
    fallback: "We could not create your account. Please check the form and try again.",
    messages: SIGN_UP_ERROR_MESSAGES,
  });
}

export function getOtpErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, {
    fallback: "Verification failed. Please check the code and try again.",
    messages: OTP_ERROR_MESSAGES,
  });
}

export function getOAuthErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, {
    fallback: "Google sign in failed. Please try again.",
    messages: OAUTH_ERROR_MESSAGES,
  });
}

function asAuthError(error: unknown): AuthErrorLike | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  return error as AuthErrorLike;
}

function getRawAuthErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;

  const authError = asAuthError(error);
  return authError?.message ?? authError?.error?.message;
}

function getKnownErrorCode(value: string): string | undefined {
  const trimmed = value.trim();

  if (BASE_AUTH_ERROR_MESSAGES[trimmed] || OAUTH_ERROR_MESSAGES[trimmed]) {
    return trimmed;
  }

  const upper = trimmed.toUpperCase();
  if (BASE_AUTH_ERROR_MESSAGES[upper]) {
    return upper;
  }

  const lower = trimmed.toLowerCase();
  if (OAUTH_ERROR_MESSAGES[lower]) {
    return lower;
  }

  return undefined;
}

function inferCodeFromMessage(message: string | undefined): string | undefined {
  if (!message) return undefined;

  const normalized = message.trim().toLowerCase();

  if (normalized.includes("credential account not found")) return "CREDENTIAL_ACCOUNT_NOT_FOUND";
  if (normalized.includes("user not found")) return "USER_NOT_FOUND";
  if (normalized.includes("account not found")) return "ACCOUNT_NOT_FOUND";
  if (normalized.includes("invalid password")) return "INVALID_PASSWORD";
  if (normalized.includes("invalid email or password")) return "INVALID_EMAIL_OR_PASSWORD";
  if (normalized.includes("invalid email")) return "INVALID_EMAIL";
  if (normalized.includes("email not verified")) return "EMAIL_NOT_VERIFIED";
  if (normalized.includes("user already exists")) return "USER_ALREADY_EXISTS";
  if (normalized.includes("password too short")) return "PASSWORD_TOO_SHORT";
  if (normalized.includes("password too long")) return "PASSWORD_TOO_LONG";
  if (normalized.includes("invalid token")) return "INVALID_TOKEN";
  if (normalized.includes("token expired")) return "TOKEN_EXPIRED";
  if (normalized.includes("validation error")) return "VALIDATION_ERROR";

  return undefined;
}
