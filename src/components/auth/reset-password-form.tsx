"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { resetPasswordAction, type ResetPasswordState } from "@/lib/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ResetPasswordForm({ token }: { token?: string | null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formToken, setFormToken] = useState<string | null>(token ?? null);

  // No need for useEffect - token is passed as prop

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    // Append the token from URL params if present
    if (formToken) {
      formData.append("token", formToken);
    }
    const result = await resetPasswordAction({} as ResetPasswordState, formData);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("Password reset successfully. You can now sign in.");
      router.push("/login");
    }
  }

  if (!formToken) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="font-display text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The reset link is invalid or has expired. Please request a new one.
        </p>
        <a href="/forgot-password" className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-lg border border-border bg-background px-4 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-c100">
          Request new reset link
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            required
            className="text-brand-ink placeholder:text-brand-ink-soft pr-10"
            defaultValue=""
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-ink"
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          At least 8 characters with one uppercase, one lowercase and one number.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={confirmPasswordVisible ? "text" : "password"}
            required
            className="text-brand-ink placeholder:text-brand-ink-soft pr-10"
            defaultValue=""
          />
          <button
            type="button"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-ink"
          >
            {confirmPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold"
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="relative size-4">
              <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-1.664 1.665c-.748.747-1.776.748-2.524 0l-1.664-1.665a8 8 0 010-11.314l1.664-1.665a8 8 0 0111.314 0l1.664 1.665a7.954 7.954 0 01-2.447 8.752l-1.663-1.663z"></path>
              </svg>
            </span>
            Resetting…
          </span>
        ) : (
          "Reset password"
        )}
      </Button>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <a href="/login" className="text-brand-ink font-semibold underline underline-offset-4">
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
}
