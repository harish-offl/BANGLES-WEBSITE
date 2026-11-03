"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { requestPasswordResetAction, type ResetRequestState } from "@/lib/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await requestPasswordResetAction({} as ResetRequestState, formData);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("If an account exists for that email, you&rsquo;ll receive a reset link shortly.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          className="text-brand-ink placeholder:text-brand-ink-soft"
          defaultValue=""
        />
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
            Sending…
          </span>
        ) : (
          "Send reset link"
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
