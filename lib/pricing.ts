import { prisma } from "@/lib/prisma";

// Server-authoritative pricing. Totals, discounts and shipping are ALWAYS
// recomputed here from DB values. Client-sent prices are never trusted.

// Free shipping above this subtotal (paise); otherwise a flat fee applies.
export const FREE_SHIPPING_THRESHOLD = 49900; // ₹499
export const FLAT_SHIPPING_FEE = 5000; // ₹50

export type CartItemInput = { productId: string; quantity: number };

export type PricedLineItem = {
  productId: string;
  title: string;
  price: number; // paise, from DB
  quantity: number;
  lineTotal: number; // paise
};

export type PricingResult = {
  lineItems: PricedLineItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  coupon: {
    id: string;
    code: string;
    couponCode: string;
  } | null;
};

export class PricingError extends Error {}

/**
 * Recompute the full price of a cart from DB data.
 * @param items    cart items (productId + quantity) — prices are ignored/looked up
 * @param couponCode optional coupon to apply
 */
export async function computeCartPricing(
  items: CartItemInput[],
  couponCode?: string | null,
): Promise<PricingResult> {
  if (!items.length) {
    throw new PricingError("Cart is empty");
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems: PricedLineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new PricingError(
        "One or more products are no longer available. Please refresh your cart.",
      );
    }
    const quantity = Math.max(1, Math.floor(item.quantity));
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    lineItems.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity,
      lineTotal,
    });
  }

  // Coupon (validated server-side).
  let discount = 0;
  let coupon: PricingResult["coupon"] = null;

  if (couponCode && couponCode.trim()) {
    const normalized = couponCode.trim().toUpperCase();
    const found = await prisma.coupon.findUnique({
      where: { code: normalized },
    });
    if (!found || !found.active) {
      throw new PricingError("Invalid or inactive coupon code");
    }
    if (found.maxUses != null && found.usedCount >= found.maxUses) {
      throw new PricingError("This coupon has reached its usage limit");
    }
    if (found.type === "percent") {
      discount = Math.floor((subtotal * found.value) / 100);
    } else {
      discount = found.value;
    }
    // Never let discount exceed subtotal.
    discount = Math.min(discount, subtotal);
    coupon = { id: found.id, code: found.code, couponCode: found.code };
  }

  const discountedSubtotal = subtotal - discount;
  const shippingFee =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = discountedSubtotal + shippingFee;

  return { lineItems, subtotal, discount, shippingFee, total, coupon };
}
