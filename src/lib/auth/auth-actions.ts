"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAuthClient } from "@/lib/supabase/server";

/**
 * Validation schemas for customer auth forms.
 */

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^\+?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/* -------------------------------------------------------------------------- */
/*  Sign up (customer registration)                                           */
/* -------------------------------------------------------------------------- */

export interface SignUpState {
  error?: string;
  success?: boolean;
  email?: string;
}

/**
 * Registers a new customer with Supabase Auth and creates a matching
 * `public.profiles` row (handled automatically by the
 * `on_auth_user_created` database trigger).
 */
export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid registration data." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    // Do not reveal whether the email exists.
    return { error: "Unable to create account. Please try again." };
  }

  if (data.user && !data.session) {
    // Email confirmation required.
    return {
      success: true,
      email: parsed.data.email,
    };
  }

  // Auto-confirmed (email confirmations disabled): sign in and redirect.
  redirect("/account");
}

/**
 * Signs the customer in with email + password via Supabase Auth.
 */
export interface SignInState {
  error?: string;
}

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately vague: do not reveal whether the email exists.
    return { error: "Those credentials did not match our records." };
  }

  const next = String(formData.get("next") ?? "/account");
  redirect(next);
}

/**
 * Signs the customer out and clears the session cookie.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createAuthClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const cookieStore = await cookies();
  try {
    cookieStore.delete("sb-access-token");
  } catch {
    /* ignore */
  }
  try {
    cookieStore.delete("sb-refresh-token");
  } catch {
    /* ignore */
  }
  redirect("/");
}

/**
 * Requests a password reset email for the given email address.
 *
 * Always returns success (even if the email is not found) to prevent email
 * enumeration.
 */
export interface ResetRequestState {
  error?: string;
  success?: boolean;
  email?: string;
}

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const raw = {
    email: String(formData.get("email") ?? "").trim(),
  };

  const parsed = resetRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { error: "Unable to send reset email. Please try again later." };
  }

  return { success: true, email: parsed.data.email };
}

/**
 * Resets the password using a recovery token from the password reset flow.
 */
export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid password data." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Unable to reset password. The link may have expired." };
  }

  return { success: true };
}

/**
 * Updates the customer's profile (name, phone) in the `public.profiles` table.
 */
export interface UpdateProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  if (!raw.fullName) {
    return { error: "Full name is required." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: raw.fullName,
      phone: raw.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Unable to update profile. Please try again." };
  }

  return { success: true };
}
