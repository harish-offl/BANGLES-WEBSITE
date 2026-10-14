import Link from "next/link";

import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LIFESTYLE_IMAGES = [
  { src: "/images/lifestyle/18.jpg", alt: "Coin and kundan flower bangles styled together" },
  { src: "/images/lifestyle/51.jpg", alt: "Thamarai bangles in red and lemon yellow" },
  { src: "/images/lifestyle/53.jpg", alt: "Ratna bangles in dark green and grey" },
  { src: "/images/lifestyle/54.jpg", alt: "Minimal red and gold bangle design" },
];

/**
 * Brand story block. Uses the studio's own product photography and the
 * location and processing facts published on the legacy site.
 */
export function StorySection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-y border-border bg-brand-paper py-14 sm:py-20"
    >
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Our craft</p>
          <h2 className="section-title mt-3">
            Made by hand, <em>made to order</em>
          </h2>
          <div className="gold-rule mt-5 h-px w-32" aria-hidden="true" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bangles by Beauty is a small studio in Pattukottai, Tamil Nadu. Every bangle,
            centre clip and hair accessory is assembled by hand using silk thread, kundan,
            crystals and traditional motifs — the same way it has always been done.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Because each piece is made to order, please allow 5 to 7 days for your order to
            be prepared before it is dispatched.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Silk thread, kundan, crystal and mirror work
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Bridal sets, border bangles and accessories
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Handmade to order in Pattukottai
            </li>
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#products"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
            >
              Browse the collection
            </Link>
            <Link
              href="#cat-bridal-bangles"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base",
              )}
            >
              Explore bridal bangles
            </Link>
          </div>
        </div>

        <div className="order-1 grid grid-cols-2 gap-3 sm:gap-4 lg:order-2">
          <div className="col-span-2 overflow-hidden rounded-2xl">
            <SmartImage
              src={LIFESTYLE_IMAGES[0].src}
              alt={LIFESTYLE_IMAGES[0].alt}
              width={900}
              height={600}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="h-auto w-full object-cover"
            />
          </div>
          {LIFESTYLE_IMAGES.slice(1).map((image) => (
            <div key={image.src} className="overflow-hidden rounded-2xl">
              <SmartImage
                src={image.src}
                alt={image.alt}
                width={450}
                height={450}
                sizes="(min-width: 1024px) 20vw, 45vw"
                className="aspect-square size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
