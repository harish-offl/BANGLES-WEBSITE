"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { signInAction, type SignInState } from "@/lib/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export function CustomerLoginCard() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.append("next", "/account");
    const result = await signInAction({} as SignInState, formData);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="remember" className="text-sm flex items-center gap-2 cursor-pointer text-muted-foreground">
            <input
              id="remember"
              type="checkbox"
              className="rounded border-brand-c300/70 text-brand-gold focus:ring-brand-gold"
            />
            Remember me
          </label>
          <a href="/forgot-password" className="text-sm text-brand-ink underline underline-offset-4">
            Forgot password?
          </a>
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-1.664-1.665c-.748.747-1.776.748-2.524 0l-1.664-1.665a8 8 0 010-11.314l1.664-1.665a8 8 0 0111.314 0l1.664 1.665a7.954 7.954 0 01-2.447 8.752l-1.663-1.663z"></path>
                </svg>
              </span>
              Signing in…
            </span>
          ) : (
            <>
              Sign in <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <Separator>
          <span className="px-2 text-xs text-muted-foreground">or</span>
        </Separator>
      </div>

      <div className="mt-6">
        <GoogleLoginButton next="/account" />
      </div>
    </div>
  );
}