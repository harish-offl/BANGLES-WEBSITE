import "server-only";

import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Razorpay integration for Bangles by Beauty.
 *
 * All methods here run on the server only. The Razorpay Key Secret and webhook
 * secret are never exposed to the browser.
 */

export interface RazorpayOrderInput {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string | null;
}

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (client) return client;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.",
    );
  }
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export interface CreateOrderResult extends RazorpayOrder {
  keyId: string | null;
}

export async function createRazorpayOrder(input: RazorpayOrderInput): Promise<CreateOrderResult> {
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: input.amountPaise,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    receipt: order.receipt ?? null,
    keyId: process.env.RAZORPAY_KEY_ID ?? null,
  };
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Verifies a Razorpay Checkout payment signature using HMAC-SHA256 over
 * `${razorpay_order_id}|${razorpay_payment_id}` with the key secret.
 */
export function verifyPaymentSignature(input: VerifyPaymentInput): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(input.razorpay_signature, "hex"),
  );
}

export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}

export interface PaymentEvent {
  event_id: string;
  event: string;
  payload: unknown;
}
