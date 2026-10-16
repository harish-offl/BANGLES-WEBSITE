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
  { href: "/shop", label: "All products" },
  { href: "/collections", label: "Collections" },
  { href: "/gallery", label: "Gallery" },
  { href: "/cart", label: "Your bag" },
  { href: "/wishlist", label: "Saved items" },
];

const INFO_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/customize", label: "Customize your order" },
  { href: "/contact", label: "Contact" },
  { href: "/contact#faq", label: "FAQ" },
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
    <footer className="mt-auto bg-brand-ink text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-2xl tracking-[0.06em] text-white">
            Bangles <span className="text-gold">by Beauty</span>
          </p>
          <div className="gold-rule mt-3 h-px w-24" aria-hidden="true" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-c200">
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
                    className="grid size-11 place-items-center rounded-full border border-white/15 text-gold transition-colors hover:border-gold hover:text-white"
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
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-gold uppercase">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-brand-c200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Information">
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-gold uppercase">
            Information
          </h2>
          <ul className="mt-4 space-y-2.5">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-brand-c200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-brand-c200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-gold uppercase">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-c200">
            {settings.location ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{settings.location}, Tamil Nadu, India</span>
              </li>
            ) : null}

            {whatsappDigits ? (
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Chat on WhatsApp · {LEGACY_FACTS.supportHours}
                </a>
              </li>
            ) : null}

            {settings.contact_email ? (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="transition-colors hover:text-white"
                >
                  {settings.contact_email}
                </a>
              </li>
            ) : (
              <li className="text-xs leading-relaxed">
                Contact email not published yet — set it in
                <span className="text-white"> Admin → Settings</span>.
              </li>
            )}
          </ul>

          {settings.announcement ? (
            <p className="mt-5 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-brand-c200">
              {settings.announcement}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center gap-4 px-4 sm:px-0 py-5 pb-24 text-xs text-brand-c200 sm:flex-row sm:items-center sm:justify-center sm:text-center sm:pb-5 sm:gap-6">
          <div className="flex flex-col gap-1">
            <p>
              © {year} {settings.store_name}. All rights reserved.
            </p>
            <p>
              Website designed &amp; developed by{" "}
              <a
                href="https://arrisedigital.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-strong underline-offset-2 transition-colors hover:underline"
              >
                Arrise Digital
              </a>{" "}
              — Partners in Progress.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-center sm:text-right">
              <a href="/developers" className="underline-offset-2 hover:underline">
                Meet the developer
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
