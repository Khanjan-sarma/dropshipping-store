import { NextResponse } from "next/server";
import { validateCouponSchema } from "@/lib/validation";
import { computeCartPricing, PricingError } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Validates a coupon against the current cart and returns the server-computed
// discount. Never trusts client prices — recomputes from DB.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { code, items } = parsed.data;

  try {
    const pricing = await computeCartPricing(items, code);
    if (!pricing.coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 },
      );
    }
    const coupon = await prisma.coupon.findUnique({
      where: { code: pricing.coupon.code },
      select: { code: true, type: true, value: true },
    });
    return NextResponse.json({
      code: pricing.coupon.code,
      discount: pricing.discount,
      subtotal: pricing.subtotal,
      total: pricing.total,
      type: coupon?.type,
      value: coupon?.value,
    });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("coupon validate error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
