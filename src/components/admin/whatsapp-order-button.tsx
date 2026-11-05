"use client";

import { Send, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Order } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/lifecycle";

interface WhatsAppOrderButtonProps {
  order: Order;
}

export function WhatsAppOrderButton({ order }: WhatsAppOrderButtonProps) {
  const customerPhone = order.customer_phone ?? null;
  const hasPhone = Boolean(customerPhone);

  // Format phone number: remove spaces, +, and other special chars; ensure country code 91
  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    // If already starts with country code 91, keep as is
    if (digits.startsWith("91") && digits.length >= 10) {
      return digits;
    }
    // If starts with 0 (Indian trunk prefix), remove it and add 91
    if (digits.startsWith("0")) {
      return "91" + digits.slice(1);
    }
    // If 10-digit mobile number, add 91
    if (digits.length === 10) {
      return "91" + digits;
    }
    return digits;
  };

  const buildWhatsAppMessage = (): string => {
    const customerName = order.customer_name ?? "Valued Customer";
    const orderNumber = order.order_number;
    const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;

    const items = order.items ?? [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const lines: string[] = [];
    lines.push(`Dear ${customerName},`);
    lines.push("");
    lines.push("Greetings from Bangles by Beauty!");
    lines.push("");
    lines.push("Thank you for choosing us. We have received your order successfully.");
    lines.push("");
    lines.push("**ORDER DETAILS**");
    lines.push("");
    lines.push(`Order ID: ${orderNumber}`);
    lines.push(`Order Date: ${orderDate}`);
    lines.push("");
    lines.push("**PRODUCT DETAILS**");

    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.product_name_snapshot}`);
      lines.push(`   Quantity: ${item.quantity}`);
      if (item.unit_price != null) {
        lines.push(`   Price: ₹${item.unit_price}`);
      }
    });

    lines.push("");
    lines.push(`Total Items: ${totalQuantity}`);
    lines.push("");
    lines.push("**ORDER SUMMARY**");
    lines.push("");
    lines.push(`Total Amount: ₹${order.total_amount}`);

    if (order.payment_status) {
      lines.push("");
      lines.push(`Payment Method: Razorpay`);
      lines.push(`Payment Status: ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}`);
    }

    lines.push("");
    lines.push("**DELIVERY DETAILS**");
    lines.push("");
    lines.push(`Customer Name: ${customerName}`);
    lines.push(`Mobile Number: ${order.customer_phone ?? "—"}`);
    lines.push("");
    lines.push(`Delivery Address:`);
    lines.push(`${order.shipping_address ?? "—"}`);
    lines.push("");

    lines.push("**ORDER STATUS**");
    lines.push("");
    lines.push(`Current Status: ${statusLabel}`);
    lines.push("");

    lines.push("**TRACK YOUR ORDER**");
    lines.push("");
    lines.push("You can track your order using the Order ID provided above.");
    lines.push("");
    lines.push(`Order ID: ${orderNumber}`);
    lines.push("");
    lines.push("Track your order here:");
    lines.push(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.banglesbybeauty.com"}/track-order`);
    lines.push("");
    lines.push("Thank you for shopping with Bangles by Beauty!");
    lines.push("");
    lines.push("For any queries or assistance, feel free to contact us.");
    lines.push("");
    lines.push("With love,");
    lines.push("Bangles by Beauty");

    return lines.join("\n");
  };

  const handleWhatsApp = () => {
    if (!customerPhone) return;

    const phone = normalizePhone(customerPhone);
    const message = buildWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!hasPhone}
            onClick={handleWhatsApp}
            title={hasPhone ? "Send order details via WhatsApp" : "Customer phone number not available"}
          >
            {hasPhone ? (
              <Send className="size-4 text-green-600" />
            ) : (
              <PhoneOff className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {hasPhone ? "Send order details via WhatsApp" : "Customer phone number not available"}
        </TooltipContent>
      </Tooltip>
  );
}
