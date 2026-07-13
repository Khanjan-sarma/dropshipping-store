import crypto from "crypto";
import Razorpay from "razorpay";

// Server-side Razorpay client. NEVER import this into client components.
let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (client) return client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }
  client = new Razorpay({ key_id, key_secret });
  return client;
}

/**
 * Verify the checkout signature returned to the browser by Razorpay Checkout.
 * signature === HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, params.signature);
}

/**
 * Verify an incoming webhook payload signature.
 * signature === HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

// Constant-time comparison to avoid timing attacks.
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
