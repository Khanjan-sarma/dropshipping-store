"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/lib/pricing";

type AppliedCoupon = {
  code: string;
  discount: number;
  type: string;
  value: number;
};

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const [couponCode, setCouponCode] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checking, setChecking] = useState(false);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines],
  );

  const discount = applied?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingFee =
    lines.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_SHIPPING_FEE;
  const total = discountedSubtotal + shippingFee;

  async function applyCoupon() {
    setCouponError("");
    if (!couponCode.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApplied(null);
        setCouponError(data.error || "Invalid coupon");
        return;
      }
      setApplied({
        code: data.code,
        discount: data.discount,
        type: data.type,
        value: data.value,
      });
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCouponCode("");
    setCouponError("");
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <ShoppingCart
          className="mx-auto h-12 w-12 text-foreground-muted"
          aria-hidden
        />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-600">
          Add some trending products to get started.
        </p>
        <Link href="/products" className="btn-primary mt-6">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Line items */}
        <div className="space-y-4 lg:col-span-2">
          {lines.map((line) => (
            <div
              key={line.productId}
              className="card flex gap-4 p-3 sm:p-4"
            >
              <Link
                href={`/product/${line.slug}`}
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={line.image}
                  alt={line.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/product/${line.slug}`}
                    className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-primary"
                  >
                    {line.title}
                  </Link>
                  <button
                    onClick={() => removeItem(line.productId)}
                    className="text-gray-400 hover:text-danger"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      onClick={() =>
                        setQuantity(line.productId, line.quantity - 1)
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(line.productId, line.quantity + 1)
                      }
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatINR(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            {/* Coupon */}
            <div className="mt-4">
              <label className="label" htmlFor="coupon">
                Coupon code
              </label>
              {applied ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                  <span className="text-sm font-semibold text-green-700">
                    {applied.code} applied
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-medium text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    className="input uppercase"
                    placeholder="e.g. MLBB10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={checking}
                    className="btn-dark whitespace-nowrap"
                  >
                    {checking ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-1 text-xs text-red-600">{couponError}</p>
              )}
            </div>

            <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium">{formatINR(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">− {formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-medium">
                  {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                </dd>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-500">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - discountedSubtotal)}{" "}
                  more for free shipping
                </p>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>

            <Link
              href={
                applied
                  ? `/checkout?coupon=${encodeURIComponent(applied.code)}`
                  : "/checkout"
              }
              className="btn-primary mt-4 w-full"
            >
              Proceed to Checkout
            </Link>
            <p className="mt-2 text-center text-xs text-gray-500">
              Prices are re-verified securely at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
