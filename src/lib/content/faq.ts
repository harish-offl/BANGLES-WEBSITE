export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ answers are limited to facts confirmed during the legacy-site audit.
 * Anything the owner has not published (payment methods, courier partners,
 * exact delivery windows) is deferred to WhatsApp rather than guessed.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I place an order?",
    answer:
      "Add the pieces you love to your bag, then choose \u201cSend enquiry on WhatsApp\u201d. Your selection arrives with us on WhatsApp and we confirm availability, delivery and payment with you there. You can also message us directly on WhatsApp at any time.",
  },
  {
    question: "How long will my order take?",
    answer:
      "Every piece is made by order. We ask for a processing time of 5 to 7 days from confirmation before dispatch. Delivery time after dispatch depends on your location.",
  },
  {
    question: "Do you offer free delivery?",
    answer:
      "Yes. Delivery is free on orders above \u20b92499. For smaller orders, delivery charges are confirmed with you on WhatsApp before we proceed.",
  },
  {
    question: "Are the bangles handmade?",
    answer:
      "Yes. Everything is handcrafted in Pattukottai. Because each piece is made by hand, small variations in colour and finish are part of what makes your jewellery unique.",
  },
  {
    question: "Can I request a custom design or colour?",
    answer:
      "Absolutely. Add a note to your enquiry describing the colour, size or design you have in mind, or send us reference images on WhatsApp, and we will let you know what is possible.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Payment options are confirmed with you on WhatsApp when we finalise your order. No payment is taken on this website.",
  },
  {
    question: "Where are you based?",
    answer:
      "We are based in Pattukottai, Tamil Nadu, India. You can reach us on WhatsApp between 10AM and 7PM.",
  },
];
