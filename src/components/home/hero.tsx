import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { LEGACY_FACTS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Editorial hero. Copy is the legacy site's own tagline and hero paragraph so
 * the brand voice carries over exactly. The premium bangle photograph is framed
 * beside the copy (rather than cropped full-bleed) so the jewellery always reads
 * clearly, with floating gold/blush orbs and a shimmer sweep in the brand
 * palette.
 */
export function Hero() {
  return (
    <section id="top" className="relative isolate scroll-mt-36 lg:scroll-mt-28 overflow-hidden bg-brand-ink">
      <div
        className="animate-float-slow pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(226,200,120,0.4),transparent_70%)] blur-2xl sm:size-96"
        aria-hidden="true"
      />
      <div
        className="animate-float pointer-events-none absolute bottom-8 left-[6%] size-48 rounded-full bg-[radial-gradient(circle_at_60%_60%,rgba(240,173,162,0.45),transparent_70%)] blur-2xl sm:size-64"
        aria-hidden="true"
      />

      <div className="container-page relative py-12 sm:py-14 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">{LEGACY_FACTS.heroEyebrow}</p>
            <h1 className="text-display mt-4 text-white">{LEGACY_FACTS.heroHeading}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-c200 sm:text-lg">
              {LEGACY_FACTS.heroBody}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                  "h-11 gap-2 border-gold/50 bg-transparent px-6 text-base text-gold hover:border-gold hover:bg-white/10 hover:text-brand-shine",
                )}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Enquire on WhatsApp
              </a>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-5 text-white">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-gold">Handmade</dt>
                <dd className="mt-1 font-display text-base sm:text-lg">Silk thread</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-gold">Studio</dt>
                <dd className="mt-1 font-display text-base sm:text-lg">Pattukottai</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-gold">Delivery</dt>
                <dd className="mt-1 font-display text-base sm:text-lg">
                  Free over ₹{LEGACY_FACTS.freeDeliveryThreshold}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:mx-0 lg:ml-auto lg:justify-self-end lg:max-w-[400px]">
            <div className="shimmer relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-gold/40 shadow-2xl shadow-black/40">
              <SmartImage
                src="/images/products/bng-177-yazhi-bridal-set-2-0.jpg"
                alt="Premium handcrafted bridal bangle set in gold and gem tones"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border border-gold/40 bg-brand-ink/95 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-gold shadow-lg backdrop-blur">
              <Sparkles className="size-4" aria-hidden="true" />
              Handcrafted
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
