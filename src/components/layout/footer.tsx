import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";
import { LEGACY_FACTS } from "@/lib/site";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp/shared";
import type { StoreSettings } from "@/types";

interface FooterProps {
  settings: StoreSettings;
}

const SHOP_LINKS: { href: string; label: string }[] = [
  { href: "#products", label: "All products" },
  { href: "#cat-bridal-bangles", label: "Bridal bangles" },
  { href: "#cat-border-bangles", label: "Border bangles" },
  { href: "#cat-glass-bangles", label: "Glass bangles" },
  { href: "#cat-kundan-hair-bands", label: "Kundan hair bands" },
];

const INFO_LINKS = [
  { href: "#about", label: "About us" },
  { href: "#visit", label: "Contact" },
  { href: "#faq", label: "FAQ" },
] as const;

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms & conditions" },
  { href: "/shipping-policy", label: "Shipping policy" },
  { href: "/returns-policy", label: "Returns & refunds" },
] as const;

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsappDigits = normaliseWhatsAppNumber(settings.whatsapp_number);
  const socials = [
    { href: settings.facebook_url, label: "Facebook", Icon: FacebookIcon },
    { href: settings.instagram_url, label: "Instagram", Icon: InstagramIcon },
    { href: settings.youtube_url, label: "YouTube", Icon: YoutubeIcon },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="mt-auto border-t border-border bg-brand-paper">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-2xl tracking-[0.06em] text-foreground">
            Bangles <span className="text-gold-strong">by Beauty</span>
          </p>
          <div className="gold-rule mt-3 h-px w-24" aria-hidden="true" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings.footer_note ?? LEGACY_FACTS.heroBody}
          </p>

          {socials.length > 0 ? (
            <ul className="mt-5 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-gold hover:text-gold-strong"
                    aria-label={`${settings.store_name} on ${label} (opens in a new tab)`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Shop">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-foreground uppercase">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Information">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-foreground uppercase">
            Information
          </h2>
          <ul className="mt-4 space-y-2.5">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-foreground uppercase">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings.location ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <span>{settings.location}, Tamil Nadu, India</span>
              </li>
            ) : null}

            {whatsappDigits ? (
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Chat on WhatsApp · {LEGACY_FACTS.supportHours}
                </a>
              </li>
            ) : null}

            {settings.contact_email ? (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {settings.contact_email}
                </a>
              </li>
            ) : (
              <li className="text-xs leading-relaxed">
                Contact email not published yet — set it in
                <span className="text-foreground"> Admin → Settings</span>.
              </li>
            )}
          </ul>

          {settings.announcement ? (
            <p className="mt-5 rounded-lg border border-border bg-background px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              {settings.announcement}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.store_name}. All rights reserved.
          </p>
          <p>{settings.shipping_info}</p>
        </div>
      </div>
    </footer>
  );
}
