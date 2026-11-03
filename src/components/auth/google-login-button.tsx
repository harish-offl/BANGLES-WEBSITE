"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { googleSignInAction } from "@/lib/auth/google-signin-action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Authentic Google "G" logo SVG. The four colour bands match Google's brand
 * colours (blue / red / yellow / green) and are used under fair use for
 * sign-in affordance.
 */
const GOOGLE_LOGO_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
    role="img"
    aria-label="Google logo"
    focusable="false"
  >
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 14.7 4 6.8 9.6 4.2 15.6l2.1-1.1z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.9 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8.2l-6.5 5C8.4 38.4 15.5 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.9 36.2 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
  </svg>
);

interface GoogleLoginButtonProps {
  next?: string;
  label?: string;
  className?: string;
}

export function GoogleLoginButton({
  next = "/account",
  label = "Continue with Google",
  className,
}: GoogleLoginButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await googleSignInAction(next);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        // Full-page navigation to Google's consent screen. The user leaves
        // this page intentionally; the loading spinner stays visible until
        // the redirect fires.
        window.location.assign(result.url);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "w-full h-11 border border-border bg-white text-foreground hover:bg-brand-c100 hover:border-brand-c300 transition-colors",
        className,
      )}
    >
      <span className="flex items-center justify-center gap-2.5">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          GOOGLE_LOGO_SVG
        )}
        {label}
      </span>
    </Button>
  );
}

export { GOOGLE_LOGO_SVG };