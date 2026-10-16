"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { SmartImage } from "@/components/shared/smart-image";

/**
 * Full-bleed parallax band. The photograph drifts against the scroll while a
 * shimmer sweep crosses it and faint gold rings float over the deep-brown
 * backdrop — echoing the reference site's gallery parallax section.
 */
export function ParallaxBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={ref}
      className="relative isolate h-[clamp(260px,38vw,460px)] overflow-hidden bg-brand-ink"
    >
      <motion.div
        style={{ y }}
        className="shimmer absolute inset-x-0 -top-[15%] h-[130%] will-change-transform"
        aria-hidden="true"
      >
        <SmartImage
          src="/images/lifestyle/18.jpg"
          alt="Coin and kundan flower bangles styled together"
          fill
          sizes="100vw"
          className="object-cover object-center brightness-[0.32] saturate-[0.75]"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/70 via-brand-ink/40 to-brand-ink/75"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="animate-float absolute left-[12%] top-[16%] size-16 rounded-full border border-gold/30 sm:size-24" />
        <span className="animate-float-slow absolute bottom-[14%] right-[14%] size-24 rounded-full border border-gold/25 sm:size-32" />
        <span className="animate-float absolute left-[46%] top-[62%] size-10 rounded-full border border-brand-c300/30 sm:size-14" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <p className="max-w-3xl font-display text-2xl italic leading-tight text-white sm:text-4xl lg:text-5xl">
          Handcrafted with love
          <span className="mt-2 block text-gold">from Pattukottai</span>
        </p>
      </div>
    </section>
  );
}
