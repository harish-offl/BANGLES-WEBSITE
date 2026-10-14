import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { LEGACY_FACTS } from "@/lib/site";
import { cn } from "@/lib/utils";

interface CtaBandProps {
  whatsappNumber: string | null;
  supportHours?: string;
}

/** Closing call to action — ordering is completed over WhatsApp by design. */
export function CtaBand({ whatsappNumber, supportHours = LEGACY_FACTS.supportHours }: CtaBandProps) {
  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello ${LEGACY_FACTS.brandName}, I would like to place an order.`,
      )}`
    : null;

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-brand-c100 px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="gold-rule absolute inset-x-0 top-0 h-px" aria-hidden="true" />
        <p className="eyebrow">Ordering</p>
        <h2 className="section-title mt-3 text-balance">
          Add to bag, then send your enquiry on <em>WhatsApp</em>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Choose your pieces, review your bag and we will open WhatsApp with your selection
          already written out. We confirm availability, delivery and payment with you
          directly — you are never charged online.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#products"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
          >
            Start shopping
          </Link>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 gap-2 px-6 text-base",
              )}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat with us · {supportHours}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
