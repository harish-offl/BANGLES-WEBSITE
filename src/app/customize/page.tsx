import type { Metadata } from "next";
import { MessageCircle, Palette, Ruler, Sparkles, Upload } from "lucide-react";

import { CustomizeForm } from "@/components/customize/customize-form";
import { getCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Customize your order",
  description:
    "Design your own bangles — upload a reference image, choose colours and size, then send your custom brief on WhatsApp.",
};

const STEPS = [
  {
    Icon: Upload,
    title: "Upload your design",
    body: "Add a reference photo of the look you want.",
  },
  {
    Icon: Palette,
    title: "Pick colours",
    body: "Choose from our palette or set a custom colour.",
  },
  {
    Icon: Ruler,
    title: "Select your size",
    body: "We craft in sizes 2.2, 2.4, 2.6 and 2.8.",
  },
  {
    Icon: MessageCircle,
    title: "Send on WhatsApp",
    body: "We confirm price and delivery with you directly.",
  },
] as const;

export default async function CustomizePage() {
  const settings = await getCatalog().getSettings();

  return (
    <>
      <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="container-page py-14 sm:py-20">
          <p className="eyebrow">Customize</p>
          <h1 className="section-title mt-3 max-w-3xl text-balance">Personalise Your Order</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Have a design in mind? Share a reference, choose your colours and size, and we will
            craft it by hand in Pattukottai.
          </p>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <CustomizeForm whatsappNumber={settings.whatsapp_number} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-border bg-brand-c100 p-6">
              <p className="eyebrow">How it works</p>
              <ol className="mt-4 space-y-4">
                {STEPS.map(({ Icon, title, body }, index) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-gold shadow-sm">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {index + 1}. {title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <span className="grid size-9 place-items-center rounded-full bg-brand-c100 text-gold">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-display text-lg">Made to order</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Custom pieces are handmade and take 5 to 7 days to prepare before dispatch. Free
                delivery on orders above ₹{settings.free_shipping_threshold ?? 2499}.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
