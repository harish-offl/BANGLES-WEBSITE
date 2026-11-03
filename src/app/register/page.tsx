import { Metadata } from "next";

import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { RegisterForm } from "@/components/auth/register-form";
import { Separator } from "@/components/ui/separator";

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>;
}

export const metadata: Metadata = {
  title: "Create Account · Bangles by Beauty",
  description: "Create your Bangles by Beauty account to shop, track orders and save addresses.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const next = params.next || "/account";

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className="size-10 rounded-full bg-brand-c100 flex items-center justify-center text-brand-ink font-semibold">
            B
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Create account</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Join us to save your addresses, track orders and enjoy faster checkout.
        </p>

        <div className="mt-8">
          <RegisterForm next={next} />
        </div>

        <div className="mt-6">
          <Separator>
            <span className="px-2 text-xs text-muted-foreground">or</span>
          </Separator>
        </div>

        <div className="mt-6">
          <GoogleLoginButton next={next} label="Continue with Google" />
        </div>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-brand-ink font-semibold underline underline-offset-4">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}