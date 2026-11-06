import type { Metadata } from "next";
import Link from "next/link";
import { Code, Globe, Link as LinkIcon } from "lucide-react";

import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "M. R. M. Annamalai — Developer Profile",
  description:
    "Founder & Developer at Arrise Digital. Passionate about building modern digital experiences through creative design, technology, and innovation.",
  alternates: { canonical: "/developer" },
  openGraph: {
    type: "profile",
    title: "M. R. M. Annamalai — Developer Profile",
    description:
      "Founder & Developer at Arrise Digital. Turning ideas into digital experiences.",
    url: `${SITE_URL}/developer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "M. R. M. Annamalai — Developer Profile",
    description:
      "Founder & Developer at Arrise Digital. Turning ideas into digital experiences.",
  },
  robots: { index: true, follow: true },
};

const SKILLS = [
  "Web Development",
  "UI/UX Design",
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="container-page flex-1 py-12 sm:py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <header className="text-center sm:text-left mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 mb-3">
              <Code className="size-4 text-brand-gold" aria-hidden="true" />
              <span className="font-display text-base uppercase tracking-[0.2em] text-brand-deep">
                Developer Profile
              </span>
              <span className="h-4 w-px bg-brand-c300" aria-hidden="true" />
              <span className="text-sm font-medium text-brand-ink-mid">
                Arrise Digital
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-brand-ink mb-4 tracking-tight">
              M. R. M. Annamalai
            </h1>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold mb-3">
              Founder &amp; Developer
            </p>
            <p className="font-display text-lg text-brand-ink mb-6 leading-tight">
              Turning Ideas Into Digital Experiences.
            </p>
            <p className="text-brand-ink-mid max-w-2xl mx-auto sm:mx-0 leading-relaxed">
              “Passionate about building modern digital experiences through
              creative design, technology, and innovation.”
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-8">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 className="font-display text-lg font-semibold text-brand-ink mb-5">
                  Profile
                </h2>
                <div className="space-y-5 text-brand-ink-mid text-sm leading-relaxed">
                  <p>
                    <span className="text-brand-ink font-medium block sm:inline">
                      Name:
                    </span>{" "}
                    M. R. M. Annamalai
                  </p>
                  <p>
                    <span className="text-brand-ink font-medium block sm:inline">
                      Title:
                    </span>{" "}
                    Founder &amp; Developer — Arrise Digital
                  </p>
                  <p>
                    <span className="text-brand-ink font-medium block sm:inline">
                      Agency:
                    </span>{" "}
                    Arrise Digital
                  </p>
                  <p>
                    <span className="text-brand-ink font-medium block sm:inline">
                      Location:
                    </span>{" "}
                    Pattukottai, Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 className="font-display text-lg font-semibold text-brand-ink mb-5">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-gold/40 bg-brand-paper px-3 py-1 text-xs font-medium text-brand-deep transition-colors hover:bg-brand-c100 hover:border-gold-strong"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center sm:text-left">
                <div className="mx-auto sm:mx-0 mb-5">
                  <div
                    className="mx-auto mb-3 size-16 rounded-full border-2 border-brand-gold bg-brand-paper flex items-center justify-center text-brand-deep font-display font-bold text-xl"
                    aria-label="Developer avatar"
                  >
                    MR
                  </div>
                  <div className="h-px w-24 mx-auto sm:mx-0 mt-3 bg-border" aria-hidden="true" />
                </div>
                <p className="text-brand-ink-mid leading-relaxed mb-8">
                  I craft digital products and experiences — from ecommerce
                  storefronts to agency-grade websites — with a focus on
                  performance, accessibility, and clean, maintainable code.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
                  <a
                    href="https://annamalaioffl.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gold-strong bg-brand-deep px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  >
                    <Globe className="size-3.5" aria-hidden="true" />
                    Portfolio
                  </a>
                  <a
                    href="https://arrisedigital.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gold-strong bg-brand-deep px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  >
                    <LinkIcon className="size-3.5" aria-hidden="true" />
                    Arrise Digital
                  </a>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gold-strong bg-brand-deep px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <Code className="size-4" aria-hidden="true" />
                Back to Bangles by Beauty
              </Link>
            </div>
          </div>

          <footer className="mt-16 pt-10 border-t border-border text-center animate-fade-in">
            <p className="text-xs text-brand-ink-soft">
              © {new Date().getFullYear()} M. R. M. Annamalai · Arrise Digital
              ·
              <a
                href="mailto:banglesbybeauty@gmail.com"
                className="text-brand-gold underline underline-offset-2 hover:text-brand-deep"
              >
                Contact
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
