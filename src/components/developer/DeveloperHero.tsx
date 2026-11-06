"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import Link from "next/link";

const heroVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.8},
    },
  },
  label: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.6},
    },
  },
  heading: {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.4, duration: 0.7},
    },
  },
  subheading: {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.6, duration: 0.7},
    },
  },
  description: {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.8, duration: 0.7},
    },
  },
  tagline: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.0, duration: 0.6},
    },
  },
  cta: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.2, duration: 0.6},
    },
  },
  meta: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.4, duration: 0.6},
    },
  },
  portrait: {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: 0.6, duration: 0.8},
    },
  },
};

export function DeveloperHero() {
  return (
    <section className="relative">
      <motion.div
        variants={heroVariants.container}
        initial="hidden"
        animate="show"
        className="mb-16 sm:mb-24 lg:mb-32"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-6">
            <motion.div
              variants={heroVariants.label}
              className="inline-flex items-center gap-2"
            >
              <Code2 className="size-4 text-dev-accent" aria-hidden="true" />
              <span className="text-xs font-medium tracking-[0.22em] uppercase text-secondary-foreground">
                Personal Portfolio / Developer
              </span>
            </motion.div>

            <motion.h1
              variants={heroVariants.heading}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-[1.05]"
            >
              Hi, I’m{" "}
              <span className="block font-semibold text-dev-accent">
                M. R. M. Annamalai.
              </span>
            </motion.h1>

            <motion.p
              variants={heroVariants.subheading}
              className="font-serif text-lg sm:text-xl text-foreground leading-relaxed mb-6"
            >
              Full-Stack Developer & Founder of Arrise Digital.
            </motion.p>

            <motion.p
              variants={heroVariants.description}
              className="max-w-lg text-secondary-foreground leading-relaxed sm:text-base mb-8"
            >
              “I build modern websites, digital products and creative experiences
              by combining technology, design and innovation.”
            </motion.p>

            <motion.p
              variants={heroVariants.tagline}
              className="font-display text-xl sm:text-2xl font-medium text-foreground mb-10 tracking-tight"
            >
              Turning Ideas Into Digital Experiences.
            </motion.p>

            <motion.div
              variants={heroVariants.cta}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/developer#work"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-dev-accent-foreground bg-dev-accent-foreground px-6 py-3 text-xs font-medium text-dev-accent transition-colors hover:bg-dev-accent hover:text-dev-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
              >
                Explore My Work
                <span className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="https://linkedin.com/in/mrmannamalai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-dev-accent-foreground bg-transparent px-6 py-3 text-xs font-medium text-dev-accent-foreground transition-colors hover:bg-dev-accent-foreground hover:text-dev-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
                aria-label="Connect on LinkedIn (opens in a new tab)"
              >
                Connect With Me
              </a>
            </motion.div>

            <motion.div
              variants={heroVariants.meta}
              className="mt-10 flex flex-wrap items-center gap-6 text-xs font-medium text-secondary-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-dev-accent-foreground" aria-hidden="true" />
                Based in Madurai, India
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-dev-accent-foreground" aria-hidden="true" />
                Available for Freelance & Remote
              </span>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              variants={heroVariants.portrait}
              className="relative size-64 sm:size-80 mx-auto lg:mx-0 overflow-hidden rounded-2xl border border-dev-accent/40 bg-dev-accent shadow-[0_20px_40px_-10px_rgba(159,18,57,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-dev-accent/5 via-dev-accent/10 to-transparent" />
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl font-display font-medium text-dev-accent-foreground"
                aria-hidden="true"
              >
                MR
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}





