import { Clock, MapPin, MessageCircle, Navigation } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { LEGACY_FACTS } from "@/lib/site";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp/shared";
import { cn } from "@/lib/utils";

interface MapSectionProps {
  location: string | null;
  whatsappNumber: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
}

/**
 * Location and contact block. The map is a keyless Google Maps embed, so it
 * works on any deployment without a billing-enabled API key. Directions open
 * in the Google Maps app on mobile.
 */
export function MapSection({
  location,
  whatsappNumber,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
}: MapSectionProps) {
  const place = `${location ?? LEGACY_FACTS.location}, Tamil Nadu, India`;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    place,
  )}&z=13&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    place,
  )}`;
  const whatsappDigits = normaliseWhatsAppNumber(whatsappNumber);
  const socials = [
    { href: facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
  ].filter((s) => Boolean(s.href));

  return (
    <section id="visit" className="scroll-mt-24 border-y border-border bg-brand-paper py-14 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Visit us"
          title={
            <>
              Find us in <em>Pattukottai</em>
            </>
          }
          description="We are a small studio in Pattukottai, Tamil Nadu. Message us on WhatsApp before you visit so we can have your pieces ready."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <iframe
              title={`Map of ${place}`}
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-[320px] w-full border-0 sm:h-[420px] lg:h-full lg:min-h-[440px]"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-c100 text-gold">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl">{LEGACY_FACTS.brandName}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{place}</p>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5 h-10 gap-2")}
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get directions
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-c100 text-gold">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl">WhatsApp</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm leading-relaxed text-muted-foreground">
                <Clock className="size-3.5 text-gold" aria-hidden="true" />
                {LEGACY_FACTS.supportHours}, seven days a week
              </p>
              {whatsappDigits ? (
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                    `Hello ${LEGACY_FACTS.brandName}, I would like to know more about your collection.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg" }), "mt-5 h-10 gap-2")}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>

            {socials.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-xl">Follow us</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  See our latest designs and bridal sets.
                </p>
                <ul className="mt-4 flex gap-3">
                  {socials.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                        aria-label={`${LEGACY_FACTS.brandName} on ${label} (opens in a new tab)`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
