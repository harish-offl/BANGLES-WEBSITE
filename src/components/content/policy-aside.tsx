import { PackageCheck, ScrollText, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";

export type PolicyTopic = "privacy" | "terms" | "shipping" | "returns";

interface TopicConfig {
  icon: LucideIcon;
  image: string;
  alt: string;
  title: string;
  body: string;
}

const TOPICS: Record<PolicyTopic, TopicConfig> = {
  privacy: {
    icon: ShieldCheck,
    image: "/images/lifestyle/18.jpg",
    alt: "Handmade bangles from the Bangles by Beauty studio",
    title: "Your details stay private",
    body: "We keep only what we need to answer your enquiry and deliver your order, and we never sell or rent your information to anyone.",
  },
  terms: {
    icon: ScrollText,
    image: "/images/lifestyle/53.jpg",
    alt: "Handcrafted bangles arranged for a customer enquiry",
    title: "Plain, friendly terms",
    body: "This website is a catalogue. No payment is taken online — every order is confirmed personally with you on WhatsApp first.",
  },
  shipping: {
    icon: Truck,
    image: "/images/lifestyle/54.jpg",
    alt: "Handmade bangles ready to be packed and shipped",
    title: "Delivered to your door",
    body: "Each piece is made by hand in 5 to 7 days, and delivery is free on orders above ₹2499. We share courier details once it ships.",
  },
  returns: {
    icon: PackageCheck,
    image: "/images/lifestyle/51.jpg",
    alt: "Handmade bangles inspected before dispatch",
    title: "Made by hand, checked by hand",
    body: "Every piece is inspected before dispatch. If anything arrives damaged, defective or incorrect, contact us within 48 hours and we will make it right.",
  },
};

interface PolicyAsideProps {
  topic: PolicyTopic;
}

/**
 * Topic-themed support card shown beside the legal/policy pages: a studio
 * photograph with a related icon badge and a short, plain-language summary.
 */
export function PolicyAside({ topic }: PolicyAsideProps) {
  const { icon: Icon, image, alt, title, body } = TOPICS[topic];

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-brand-paper">
      <div className="relative">
        <SmartImage
          src={image}
          alt={alt}
          width={640}
          height={800}
          sizes="(min-width: 1024px) 320px, 100vw"
          className="aspect-[4/5] w-full object-cover"
        />
        <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-full bg-brand-paper/95 text-gold-strong shadow-[var(--shadow-card)] ring-1 ring-gold/40 backdrop-blur">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="space-y-2 p-5">
        <p className="font-display text-lg">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </aside>
  );
}
