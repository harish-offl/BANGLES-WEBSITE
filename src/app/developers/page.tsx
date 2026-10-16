import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Developer | Bangles by Beauty",
  description:
    "Discover the developer behind the Bangles by Beauty website and learn more about Arrise Digital's web development and digital design services.",
};

const specializations = [
  "Web Development",
  "UI/UX Design",
  "Video Editing",
  "Graphic Design",
  "Digital Solutions",
];

export default function DevelopersPage() {
  return (
    <main className="container-page py-16">
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Meet the Developer
          </p>
          <h1 className="font-display text-3xl leading-tight">
            Creative thinking. Thoughtful design. Digital experiences built for real businesses.
          </h1>
        </header>

        <article className="mx-auto max-w-7xl space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10">
          <div className="space-y-1">
            <h2 className="font-display text-xl">M.RM. Annamalai</h2>
            <p className="text-sm text-muted-foreground">
              Founder &amp; Digital Developer at Arrise Digital
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-gold-strong">
              Partners in Progress
            </p>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              M.RM. Annamalai is a web developer, video editor, and digital creator
              focused on building modern, responsive, and user-friendly digital
              experiences. Through Arrise Digital, he helps businesses establish and
              strengthen their online presence through website development,
              thoughtful user interface design, creative media production, and
              practical digital solutions.
            </p>
            <p>
              The Bangles by Beauty website was developed to deliver an elegant,
              accessible, and convenient online shopping experience that reflects the
              brand&apos;s identity.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Specializations</h3>
            <ul className="flex flex-wrap gap-2">
              {specializations.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Experience: 3+ years. Project statistics are shared only once verified.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="https://annamalaioffl.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              View Portfolio
            </Link>
            <Link
              href="https://linkedin.com/in/mrmannamalai"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Connect on LinkedIn
            </Link>
            <Link
              href="https://arrisedigital.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Explore Arrise Digital
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
