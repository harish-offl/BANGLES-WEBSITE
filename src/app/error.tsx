"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="section-title mt-3 text-3xl sm:text-4xl">We hit a snag</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Sorry about that. Please try again — if the problem continues, reach us on WhatsApp and
        we will help you personally.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-muted-foreground/70">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset} className="h-11 gap-2 px-6 text-base">
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 px-6 text-base",
          )}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
