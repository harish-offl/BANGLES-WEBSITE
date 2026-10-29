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
    title: "Return, Exchange & Refund Policy",
    description:
      "How returns, exchanges, cancellations and refunds work for our handmade, made-to-order products.",
    pendingApproval: false,
    summary: [
      "Products are handmade and made to order, so please confirm size, colour and design before ordering.",
      "Report damaged, defective or incorrect products within 48 hours of delivery.",
      "Cancellations may not be accepted once production has started.",
    ],
    sections: [
      {
        heading: "Returns & Exchanges",
        body: "At Bangles by Beauty, every product is handcrafted and customised with love and care, especially for you. As our products are made to order, we request that you carefully review your order details, including size, colour, design, and customisation, before placing your order.",
        list: [
          "We do not accept returns or exchanges for customised, made-to-order, or personalised products if the customer changes their mind or selects the wrong size, colour, or design.",
          "Please confirm your bangle size and customisation details before placing your order.",
          "Minor variations in colour, design, and finishing may occur because our products are handmade. These natural variations are not considered defects.",
        ],
      },
      {
        heading: "Damaged or Incorrect Products",
        body: "If you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery. To help us resolve the issue, please provide your order number, clear photos or an unboxing video showing the issue, and photos of the product and its packaging.",
        list: [
          "After reviewing the issue, we will inform you of the available resolution, which may include a replacement, exchange, or refund, as applicable.",
          "Please retain the original packaging until your request has been resolved.",
        ],
      },
      {
        heading: "Order Cancellation",
        body: "Since our products are handmade and customised, cancellations may not be accepted once production has started. If you wish to cancel an order, please contact us as soon as possible. Cancellation requests will be reviewed based on the stage of production.",
      },
      {
        heading: "Refund Policy",
        body: "Refunds will be considered for eligible cases, such as confirmed damaged, defective, or incorrect products, in accordance with applicable consumer laws. Once a refund is approved, it will be processed through the original payment method wherever possible. The time taken for the amount to appear in your account may depend on your bank or payment provider.",
      },
      {
        heading: "Shipping Charges",
        body: "Shipping charges for approved returns or replacements will be communicated by our team based on the reason for the issue and the applicable policy.",
      },
      {
        heading: "Contact Us",
        body: "For any return, exchange, or refund-related queries, please contact us through our official Instagram page @bangles_by_beauty or WhatsApp at 6381137076. We appreciate your trust in Bangles by Beauty and thank you for supporting handmade products.",
      },
    ],
  },
};
