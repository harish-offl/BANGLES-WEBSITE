"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Project = {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  website: string;
  badge?: string;
};

const PROJECTS: Project[] = [
  {
    title: "Bangles by Beauty",
    category: "E-commerce Website Development",
    description:
      "Designed and developed a modern e-commerce experience for a bangles and accessories brand, focusing on product discovery, responsive layouts and a smooth online shopping experience.",
    technologies: ["Next.js", "React", "TypeScript", "Supabase", "Razorpay", "Tailwind CSS"],
    website: "https://www.banglesbybeauty.in/",
    badge: "LIVE PROJECT",
  },
  {
    title: "Arrise Digital",
    category: "Agency Website / Digital Solutions",
    description:
      "Built a digital presence for a creative agency focused on website development, branding, content creation and digital growth solutions.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    website: "https://arrisedigital.vercel.app/",
  },
  {
    title: "SMP Food Products",
    category: "Business Website Development",
    description:
      "Created a digital platform for a food products brand to showcase its product range, company identity and digital presence.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    website: "https://smpfoodproducts.vercel.app/",
  },
  {
    title: "Personal Portfolio",
    category: "Personal Portfolio Development",
    description:
      "A personal portfolio designed to showcase development capabilities, creative work, technical skills and digital projects.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    website: "https://annamalaiportfolio.vercel.app/",
  },
];

const projectVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.15},
    },
  },
  card: {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6},
    },
  },
};

export function SelectedProjects() {
  return (
    <section
      id="work"
      className="mt-20 sm:mt-28 lg:mt-36"
    >
      <motion.div
        variants={projectVariants.container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-10"
      >
        <div className="text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-dev-accent">
            04 / Selected Work
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
            A Few Things I’ve Built.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {PROJECTS.map((project) => (
            <motion.div
              key={project.title}
              whileHover={{ y: -4 }}
              variants={projectVariants.card}
              className="group relative overflow-hidden rounded-xl border border-dev-accent/40 bg-dev-accent/5 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <span className="text-xs font-medium text-dev-accent-foreground">
                  {project.category}
                </span>
                {project.badge && (
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-dev-accent-foreground">
                    {project.badge}
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-medium text-foreground mb-3">
                {project.title}
              </h3>
              <p className="text-secondary-foreground text-sm leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 rounded border border-dev-accent/40 bg-dev-accent/10 text-[10px] font-medium text-dev-accent-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <Link
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-dev-accent-foreground hover:text-dev-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dev-accent/50"
                aria-label={`Visit ${project.title} website (opens in a new tab)`}
              >
                Visit Website
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}





