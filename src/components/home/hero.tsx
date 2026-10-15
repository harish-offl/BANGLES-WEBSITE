import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { LEGACY_FACTS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Editorial hero. Copy is the legacy site's own tagline and hero paragraph so
 * the brand voice carries over exactly; only the presentation is new.
 */
export function Hero() {
  return (
    <section id="top" className="relative isolate scroll-mt-24 overflow-hidden bg-brand-ink">
      <SmartImage
        src="/images/banners/hero-13.jpg"
        alt="Handcrafted silk thread bangles in pink and green on a display board"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-60"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#342625]/92 via-[#342625]/70 to-[#342625]/25"
        aria-hidden="true"
      />

      <div className="container-page relative py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          <p className="eyebrow text-[#f4bbb1]">{LEGACY_FACTS.heroEyebrow}</p>
          <h1 className="text-display mt-4 text-white">{LEGACY_FACTS.heroHeading}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#f8dcd6] sm:text-lg">
            {LEGACY_FACTS.heroBody}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 px-6 text-base text-primary-foreground",
              )}
            >
              Shop the collection
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={`https://wa.me/${LEGACY_FACTS.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 gap-2 border-white/40 bg-white/5 px-6 text-base text-white hover:bg-white/15 hover:text-white",
              )}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Enquire on WhatsApp
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 text-white">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-[#f4bbb1]">
                Handmade
              </dt>
              <dd className="mt-1 font-display text-lg">Silk thread</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-[#f4bbb1]">
                Studio
              </dt>
              <dd className="mt-1 font-display text-lg">Pattukottai</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-[#f4bbb1]">
                Delivery
              </dt>
              <dd className="mt-1 font-display text-lg">
                Free over ₹{LEGACY_FACTS.freeDeliveryThreshold}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
