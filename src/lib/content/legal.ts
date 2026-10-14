export interface PolicySection {
  heading: string;
  body?: string;
  list?: string[];
}

export interface PolicyPage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  /** True when the legacy site published no such policy and the text is a draft. */
  pendingApproval: boolean;
  summary: string[];
  sections: PolicySection[];
}

export const POLICY_PAGES: Record<string, PolicyPage> = {
  "privacy-policy": {
    slug: "privacy-policy",
    eyebrow: "Legal",
    title: "Privacy policy",
    description:
      "How Bangles by Beauty handles the small amount of information you share with us when you browse or enquire.",
    pendingApproval: true,
    summary: [
      "We only collect what we need to answer your enquiry and deliver your order.",
      "We do not sell or rent your information.",
      "Enquiries are handled over WhatsApp and, where you provide it, email.",
    ],
    sections: [
      {
        heading: "What we collect",
        body: "We keep data collection to a minimum. When you send an enquiry we receive the items in your bag, the note you add, and the WhatsApp number or email address you contact us from.",
        list: [
          "Your name and contact details, when you provide them",
          "The items and quantities you enquire about",
          "Any delivery address you share so we can quote delivery",
          "Basic, anonymous usage statistics if analytics is enabled",
        ],
      },
      {
        heading: "How we use it",
        body: "We use your information solely to confirm availability, arrange delivery and support you after your order. We do not sell or rent your information to anyone.",
      },
      {
        heading: "Your bag",
        body: "The items in your bag are stored in your own browser. They are not sent to us until you choose to send an enquiry.",
      },
      {
        heading: "Your choices",
        body: "You can ask us to correct or delete the information we hold about you at any time by messaging us on WhatsApp. Because we process enquirers manually, deletion means removing your conversation from our records.",
      },
    ],
  },
  terms: {
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms & conditions",
    description:
      "The terms that apply when you browse this website and place an enquiry with Bangles by Beauty.",
    pendingApproval: true,
    summary: [
      "This website is a catalogue; ordering is confirmed personally over WhatsApp.",
      "Every item is made by order, with a processing time of 5 to 7 days.",
      "Prices and availability are confirmed at the time of your enquiry.",
    ],
    sections: [
      {
        heading: "Using this website",
        body: "This site presents our catalogue. No purchase is completed and no payment is taken online. An enquiry you send is an expression of interest, not a confirmed order, until we reply on WhatsApp with availability and pricing.",
      },
      {
        heading: "Products and pricing",
        body: "Because everything is handcrafted, colours, finishes and sizes can vary slightly between pieces. Prices shown are indicative and are confirmed when we reply to your enquiry.",
      },
      {
        heading: "Enquiries and confirmation",
        body: "An order is confirmed only once we have agreed the item, price, delivery and payment with you on WhatsApp.",
      },
    ],
  },
  "shipping-policy": {
    slug: "shipping-policy",
    eyebrow: "Legal",
    title: "Shipping policy",
    description:
      "How our made-to-order processing time and delivery work.",
    pendingApproval: true,
    summary: [
      "Made by order, with a processing time of 5 to 7 days before dispatch.",
      "Free delivery on orders above ₹2499.",
      "Delivery details are confirmed with you on WhatsApp.",
    ],
    sections: [
      {
        heading: "Processing time",
        body: "Every order is made by hand after we confirm it with you. Please allow 5 to 7 days for processing before your order is dispatched.",
      },
      {
        heading: "Delivery charges",
        body: "Delivery is free on orders above ₹2499. For orders below that, any delivery charge is confirmed with you on WhatsApp before we proceed.",
      },
      {
        heading: "Tracking",
        body: "Once your order is dispatched we share the courier details with you on WhatsApp so you can follow it to your door.",
      },
    ],
  },
  "returns-policy": {
    slug: "returns-policy",
    eyebrow: "Legal",
    title: "Returns & refunds",
    description:
      "What to do if something is not right with your order.",
    pendingApproval: true,
    summary: [
      "Handmade pieces can vary slightly — that is part of their charm.",
      "If something arrives damaged, contact us on WhatsApp right away.",
      "We will always work with you to put things right.",
    ],
    sections: [
      {
        heading: "Handmade variations",
        body: "Every piece is crafted by hand, so small differences in colour, finish and bead placement are expected and are not defects.",
      },
      {
        heading: "Damaged or incorrect items",
        body: "If your order arrives damaged or is not what you discussed, message us on WhatsApp as soon as you receive it. Share a photo and we will arrange a replacement or another solution.",
      },
      {
        heading: "Made-to-order items",
        body: "Because each piece is made specifically for you, please confirm your design, colour and size on WhatsApp before we begin. This helps us get it right the first time.",
      },
    ],
  },
};
