import { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password · Bangles by Beauty",
  description: "Reset your Bangles by Beauty account password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className="size-10 rounded-full bg-brand-c100 flex items-center justify-center text-brand-ink font-semibold">
            B
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Forgot password</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Enter your email address and we&rsquo;ll send you a link to reset your password.
        </p>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
