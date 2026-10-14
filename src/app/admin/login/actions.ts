"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  isCorrectLocalPassphrase,
  isLocalAdminAvailable,
  LOCAL_ADMIN_COOKIE,
  localAdminToken,
} from "@/lib/admin/access";
import { createAuthClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
}

/** Email + password sign-in against Supabase Auth. */
export async function signInWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return { error: "Authentication is not configured for this deployment." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Deliberately vague: do not reveal whether the email exists.
    return { error: "Those credentials did not match our records." };
  }

  redirect("/admin");
}

/** Passphrase gate for the local, database-free development mode. */
export async function signInLocalAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isLocalAdminAvailable()) {
    return { error: "Local admin mode is not enabled." };
  }

  const candidate = String(formData.get("passphrase") ?? "");
  if (!isCorrectLocalPassphrase(candidate)) {
    return { error: "Incorrect passphrase." };
  }

  const token = localAdminToken();
  if (!token) return { error: "Local admin mode is misconfigured." };

  const store = await cookies();
  store.set(LOCAL_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createAuthClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const store = await cookies();
  store.delete({ name: LOCAL_ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
