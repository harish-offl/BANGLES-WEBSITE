import { Suspense } from "react";

import { WhatsAppIcon } from "@/components/icons/social-icons";
import { SITE_NAME } from "@/lib/site";
import { buildWhatsAppUrl, normaliseWhatsAppNumber } from "@/lib/whatsapp/shared";

interface WhatsAppFabProps {
  phone: string | null;
  storeName?: string;
}

/**
 * Persistent click-to-chat entry point. Rendered as a plain link so it works
 * without JavaScript and carries a pre-filled greeting.
 */
export function WhatsAppFab({ phone, storeName = SITE_NAME }: WhatsAppFabProps) {
  if (!normaliseWhatsAppNumber(phone)) return null;

  const href = buildWhatsAppUrl(
    phone,
    `Hello ${storeName}, I would like to know more about your bangles.`,
  );
  if (!href) return null;

  return (
    <Suspense fallback={null}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-transform hover:scale-105 focus-visible:outline-offset-4 print:hidden"
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon className="size-5" />
        <span className="hidden sm:inline">Chat with us</span>
      </a>
    </Suspense>
  );
}
