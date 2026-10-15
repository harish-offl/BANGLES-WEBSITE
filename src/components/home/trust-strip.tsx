import { Gem, HandHeart, Sparkles, Truck } from "lucide-react";

import { LEGACY_FACTS } from "@/lib/site";

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

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-border bg-brand-paper">
      <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-c100 text-gold">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
