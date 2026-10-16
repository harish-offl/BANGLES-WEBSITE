import { Gem, HandHeart, Sparkles, Truck } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";
import { LEGACY_FACTS } from "@/lib/site";
import { cn } from "@/lib/utils";

const POINTS = [
  {
    Icon: HandHeart,
    title: "Handcrafted to order",
    body: "Every piece is made by hand once you order it.",
  },
  {
    Icon: Sparkles,
    title: "5 to 7 day processing",
    body: "Made-to-order pieces are prepared with care before dispatch.",
  },
  {
    Icon: Truck,
    title: `Free delivery above ₹${LEGACY_FACTS.freeDeliveryThreshold}`,
    body: "Complimentary shipping on larger orders — confirmed with you on WhatsApp.",
  },
  {
    Icon: Gem,
    title: "Personal support",
    body: `Chat with us on WhatsApp, ${LEGACY_FACTS.supportHours}, every day.`,
  },
];

/** Three bangles shown in overlapping circular frames. */
const SHOWCASE = [
  { src: "/images/lifestyle/54.jpg", alt: "Minimal red and gold bangle design" },
  { src: "/images/lifestyle/51.jpg", alt: "Thamarai bangles in red and lemon yellow" },
  { src: "/images/lifestyle/53.jpg", alt: "Ratna bangles in dark green and grey" },
];

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-border bg-brand-paper">
      <div className="container-page py-12 sm:py-16">
        <ul className="flex items-center justify-center gap-0 -space-x-8 sm:-space-x-10">
          {SHOWCASE.map((image, index) => (
            <li
              key={image.src}
              className={cn("group relative", index === 1 && "z-10 sm:-translate-y-3")}
            >
              <div className="size-24 overflow-hidden rounded-full border-4 border-background shadow-[var(--shadow-card)] ring-1 ring-gold/40 transition-transform duration-300 group-hover:-translate-y-1.5 sm:size-32 lg:size-40">
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  width={360}
                  height={360}
                  sizes="(min-width: 1024px) 160px, (min-width: 640px) 128px, 96px"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-c100 text-gold">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
