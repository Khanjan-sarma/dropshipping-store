import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrderSchema } from "@/lib/validation";
import { computeCartPricing, PricingError } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { nextOrderNumber } from "@/lib/orderNumber";
import { getRazorpayClient } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

// Creates the local Order (server-authoritative pricing). For prepaid, also
// creates a Razorpay order and returns the id + public key. For COD, no
// Razorpay order is created.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { items, couponCode, paymentMethod, address, refSource } = parsed.data;

  try {
    // 1. Recompute all prices server-side from DB. Never trust the client.
    const pricing = await computeCartPricing(items, couponCode);

    // 2. Attribution: prefer client-sent ref, fall back to cookie.
    const cookieRef = cookies().get("ss_ref")?.value;
    const attribution = refSource || cookieRef || null;

    // 3. Create local order + items in a transaction.
    const orderNumber = await nextOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: address.customerName,
        phone: address.phone,
        email: address.email || null,
        address1: address.address1,
        address2: address.address2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingFee: pricing.shippingFee,
        total: pricing.total,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
        fulfillmentStatus: "new",
        couponId: pricing.coupon?.id ?? null,
        couponCode: pricing.coupon?.couponCode ?? null,
        refSource: attribution,
        items: {
          create: pricing.lineItems.map((li) => ({
            productId: li.productId,
            title: li.title,
            price: li.price,
            quantity: li.quantity,
          })),
        },
      },
    });

    // 4a. COD → done, go straight to success.
    if (paymentMethod === "cod") {
      return NextResponse.json({
        orderNumber: order.orderNumber,
        cod: true,
      });
    }

    // 4b. Prepaid → create Razorpay order for the server-computed total.
    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: pricing.total, // paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rpOrder.id },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      razorpayOrderId: rpOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: pricing.total,
      currency: "INR",
      customerName: address.customerName,
      email: address.email || undefined,
      phone: address.phone,
    });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("create-order error", err);
    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 },
    );
  }
}
