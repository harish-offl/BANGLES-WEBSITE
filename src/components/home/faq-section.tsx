import { MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { LEGACY_FACTS } from "@/lib/site";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp/shared";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  whatsappNumber: string | null;
}

export function FaqSection({ whatsappNumber }: FaqSectionProps) {
  const whatsappDigits = normaliseWhatsAppNumber(whatsappNumber);

  return (
    <section id="faq" className="container-page scroll-mt-24 py-14 sm:py-20">
      <SectionHeading
        eyebrow="Help"
        title={
          <>
            Frequently asked <em>questions</em>
          </>
        }
        description="Everything you need to know about ordering, delivery and caring for your handcrafted pieces."
      />

      <div className="mt-8 max-w-3xl">
        <Accordion className="border-t border-border">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={String(index)}
              className="border-b border-border"
            >
              <AccordionTrigger className="py-4 font-display text-base hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-2xl border border-border bg-brand-paper p-6">
          <h3 className="font-display text-xl">Still have a question?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Message us on WhatsApp between {LEGACY_FACTS.supportHours} and we will help you
            personally.
          </p>
          {whatsappDigits ? (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "mt-4 h-10 gap-2")}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
