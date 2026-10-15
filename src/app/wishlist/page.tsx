import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Saved items",
  description: "Pieces you have saved for later at Bangles by Beauty.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Saved items" }]} />

      <header className="mt-5 max-w-2xl">
        <h1 className="section-title">Saved items</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your hand-picked favourites, saved in this browser. Add them to your bag when you are
          ready to enquire.
        </p>
      </header>

      <div className="mt-8">
        <WishlistView />
      </div>
    </div>
  );
}
