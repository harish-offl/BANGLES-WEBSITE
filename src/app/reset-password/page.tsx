import { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password · Bangles by Beauty",
  description: "Reset your Bangles by Beauty account password.",
};

interface ResetPasswordPageProps {
  searchParams: { token?: string; code?: string };
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className="size-10 rounded-full bg-brand-c100 flex items-center justify-center text-brand-ink font-semibold">
            B
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Reset password</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Enter a new password for your account.
        </p>

        <div className="mt-8">
          <ResetPasswordForm token={searchParams.token || searchParams.code} />
        </div>
      </div>
    </main>
  );
}
