import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid, markOrderFailed } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Razorpay webhook for redundancy: if the customer closes the tab before
// /verify runs, this still marks the order paid. Signature is verified with
// RAZORPAY_WEBHOOK_SECRET and payment-marking is idempotent.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("webhook secret not configured", err);
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = event?.event as string | undefined;
  const paymentEntity = event?.payload?.payment?.entity;

  try {
    if (type === "payment.captured" && paymentEntity) {
      await markOrderPaid({
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
      });
    } else if (type === "payment.failed" && paymentEntity) {
      await markOrderFailed(paymentEntity.order_id);
    }
  } catch (err) {
    console.error("webhook handling error", err);
    // Still return 200 so Razorpay doesn't hammer retries for our internal
    // errors; we log for investigation.
  }

  // Always acknowledge receipt.
  return NextResponse.json({ received: true });
}
