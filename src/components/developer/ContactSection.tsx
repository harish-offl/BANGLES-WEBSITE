"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="mt-20 sm:mt-28 lg:mt-36"
    >
      <motion.div
        className="max-w-5xl mx-auto space-y-10"
      >
        <div className="text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-dev-accent">
            07 / Let&apos;s Connect
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
            Have an Idea? Let’s Build It.
          </h2>
        </div>

        <p className="max-w-xl mx-auto sm:mx-0 text-secondary-foreground leading-relaxed sm:text-base">
          I’m always interested in meaningful projects, creative collaborations
          and opportunities to build something valuable.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h4 className="font-display text-lg font-medium text-foreground mb-2">
                Portfolio
              </h4>
              <a
                href="https://annamalaiportfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-dev-accent-foreground hover:text-dev-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
                aria-label="Visit M. R. M. Annamalai portfolio (opens in a new tab)"
              >
                https://annamalaiportfolio.vercel.app/
              </a>
            </div>
            <div>
              <h4 className="font-display text-lg font-medium text-foreground mb-2">
                Agency
              </h4>
              <a
                href="https://arrisedigital.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-dev-accent-foreground hover:text-dev-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
                aria-label="Visit Arrise Digital website (opens in a new tab)"
              >
                https://arrisedigital.vercel.app/
              </a>
            </div>
            <div>
              <h4 className="font-display text-lg font-medium text-foreground mb-2">
                LinkedIn
              </h4>
              <a
                href="https://linkedin.com/in/mrmannamalai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-dev-accent-foreground hover:text-dev-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
                aria-label="Connect on LinkedIn (opens in a new tab)"
              >
                https://linkedin.com/in/mrmannamalai
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="https://annamalaiportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-dev-accent-foreground bg-dev-accent-foreground px-6 py-3 text-xs font-medium text-dev-accent transition-colors hover:bg-dev-accent hover:text-dev-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
              aria-label="Visit Portfolio (opens in a new tab)"
            >
              Visit Portfolio
            </Link>
            <Link
              href="https://arrisedigital.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-dev-accent-foreground bg-transparent px-6 py-3 text-xs font-medium text-dev-accent-foreground transition-colors hover:bg-dev-accent-foreground hover:text-dev-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
              aria-label="Explore Arrise Digital (opens in a new tab)"
            >
              Explore Arrise Digital
            </Link>
            <a
              href="https://linkedin.com/in/mrmannamalai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-dev-accent-foreground bg-transparent px-6 py-3 text-xs font-medium text-dev-accent-foreground transition-colors hover:bg-dev-accent-foreground hover:text-dev-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
              aria-label="Connect on LinkedIn (opens in a new tab)"
            >
              Connect on LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-dev-accent-foreground bg-dev-accent-foreground px-6 py-3 text-sm font-medium text-dev-accent transition-colors hover:bg-dev-accent hover:text-dev-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
          >
            ← Back to Bangles by Beauty
          </Link>
        </div>
      </motion.div>
    </section>
  );
}





