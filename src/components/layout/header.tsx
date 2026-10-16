"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartCount } from "@/hooks/use-cart";
import { useScrolled } from "@/hooks/use-ui";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/customize", label: "Customize" },
  { href: "/contact", label: "Contact" },
] as const;

interface HeaderProps {
  categories: Category[];
  announcement: string | null;
}

export function Header({ categories, announcement }: HeaderProps) {
  const cartCount = useCartCount();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled(8);

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <header className="sticky top-0 z-50 w-full">
      {announcement ? (
        <div className="bg-brand-ink px-4 py-2 text-center text-[0.72rem] uppercase tracking-[0.14em] text-gold">
          <span className="mx-auto block max-w-5xl">{announcement}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "border-b border-border bg-background/95 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-background/80",
          scrolled && "shadow-[0_6px_24px_rgba(146,91,99,0.10)]",
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 md:h-[72px]">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-[86%] max-w-sm sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-lg tracking-wide">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Jump to the catalogue, collections and contact details.
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {PRIMARY_NAV.filter((item) => item.href !== "/collections").map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-base text-foreground transition-colors hover:bg-brand-c100 focus-visible:bg-brand-c100"
                  >
                    {item.label}
                  </Link>
                ))}

                {activeCategories.length > 0 ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="px-3 pb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Collections
                    </p>
                    <Link
                      href="/collections"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-base font-medium text-gold-strong transition-colors hover:bg-brand-c100"
                    >
                      All collections
                    </Link>
                    {activeCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/collections/${category.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-base text-foreground transition-colors hover:bg-brand-c100"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </nav>

              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 w-full justify-start gap-2",
                )}
              >
                <Search className="size-4" aria-hidden="true" />
                Search the catalogue
              </Link>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Bangles by Beauty home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/logo.png"
              alt=""
              width={40}
              height={40}
              className="size-9 w-auto shrink-0 rounded-full object-contain sm:size-10"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-lg tracking-[0.06em] text-foreground sm:text-xl">
                Bangles
              </span>
              <span className="truncate text-[0.6rem] uppercase tracking-[0.34em] text-gold-strong">
                by Beauty
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((item) =>
              item.href === "/collections" ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen((v) => !v)}
                    aria-expanded={categoriesOpen}
                    className="flex items-center gap-1 rounded-full px-4 py-2 text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", categoriesOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {categoriesOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute left-0 top-full z-50 w-[420px] rounded-xl border border-border bg-popover p-2 shadow-[0_20px_60px_rgba(146,91,99,0.16)]"
                      >
                        <div className="grid grid-cols-2 gap-1">
                          {activeCategories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/collections/${category.slug}`}
                              onClick={() => setCategoriesOpen(false)}
                              className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-brand-c100"
                            >
                              {category.name}
                              {typeof category.product_count === "number" ? (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                  ({category.product_count})
                                </span>
                              ) : null}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-1 border-t border-border pt-1">
                          <Link
                            href="/collections"
                            onClick={() => setCategoriesOpen(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gold-strong hover:bg-brand-c100"
                          >
                            All collections
                          </Link>
                          <Link
                            href="/shop"
                            onClick={() => setCategoriesOpen(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gold-strong hover:bg-brand-c100"
                          >
                            View all products
                          </Link>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/search"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Search the catalogue"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>

            <Link
              href="/wishlist"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Saved items"
            >
              <Heart className="size-5" aria-hidden="true" />
            </Link>

            <Link
              href="/admin/login"
              className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
              aria-label="Admin sign in"
            >
              <User className="size-5" aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              className="relative rounded-full p-2 text-foreground transition-colors hover:bg-brand-c100"
              aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              <span
                aria-live="polite"
                className={cn(
                  "absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.62rem] font-semibold leading-4 text-primary-foreground transition-transform",
                  cartCount === 0 && "scale-0",
                )}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
