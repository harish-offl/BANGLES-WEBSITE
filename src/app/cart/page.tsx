import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { getCatalog } from "@/lib/data";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp/shared";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the bangles and accessories in your bag, then send your enquiry to us on WhatsApp.",
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const settings = await getCatalog().getSettings();

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Your bag" }]} />

      <header className="mt-5 max-w-2xl">
        <h1 className="section-title">Your bag</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Review your selection, then send it to us on WhatsApp. We will confirm availability,
          delivery and payment with you directly.
        </p>
      </header>

      <div className="mt-8">
        <CartView
          freeShippingThreshold={settings.free_shipping_threshold}
          deliveryFeeTn={settings.delivery_fee_tn}
          deliveryFeeOutsideTn={settings.delivery_fee_outside_tn}
          whatsappConfigured={Boolean(normaliseWhatsAppNumber(settings.whatsapp_number))}
        />
      </div>
    </div>
  );
}
