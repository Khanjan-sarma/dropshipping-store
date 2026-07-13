"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/lib/pricing";
import { addressSchema } from "@/lib/validation";
import { readRefCookie } from "@/components/RefCapture";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className="container-page py-12">Loading checkout…</div>}
    >
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">(
    "prepaid",
  );
  const [couponCode] = useState(searchParams.get("coupon") || "");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines],
  );
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

  useEffect(() => {
    if (lines.length === 0) {
      router.replace("/cart");
    }
  }, [lines.length, router]);

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate(): boolean {
    const result = addressSchema.safeParse({
      ...form,
      email: form.email || "",
    });
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.errors) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  async function placeOrder() {
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          couponCode: couponCode || "",
          paymentMethod,
          refSource: readRefCookie() || "",
          address: { ...form, email: form.email || "" },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Could not place order.");
        setSubmitting(false);
        return;
      }

      // COD → straight to success.
      if (data.cod) {
        clear();
        router.push(
          `/order/success?orderNumber=${encodeURIComponent(data.orderNumber)}`,
        );
        return;
      }

      // Prepaid → open Razorpay checkout modal.
      openRazorpay(data);
    } catch {
      setServerError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  function openRazorpay(data: any) {
    if (!window.Razorpay) {
      setServerError("Payment SDK failed to load. Refresh and try again.");
      setSubmitting(false);
      return;
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "ShopSprint",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: data.customerName,
        email: data.email,
        contact: data.phone,
      },
      theme: { color: "#ea580c" },
      handler: async (response: any) => {
        // Verify server-side before treating payment as successful.
        try {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            clear();
            router.push(
              `/order/success?orderNumber=${encodeURIComponent(
                verifyData.orderNumber,
              )}`,
            );
          } else {
            setServerError(
              "Payment could not be verified. If money was deducted, it will be confirmed shortly.",
            );
            setSubmitting(false);
          }
        } catch {
          setServerError(
            "Payment verification failed. If money was deducted, we'll confirm your order shortly.",
          );
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setServerError("Payment failed. Please try again or choose COD.");
      setSubmitting(false);
    });
    rzp.open();
  }

  if (lines.length === 0) return null;

  return (
    <div className="container-page py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Address + payment */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.customerName}
                onChange={(v) => update("customerName", v)}
                error={errors.customerName}
                required
              />
              <Field
                label="Mobile number"
                value={form.phone}
                onChange={(v) =>
                  update("phone", v.replace(/\D/g, "").slice(0, 10))
                }
                error={errors.phone}
                inputMode="numeric"
                placeholder="10-digit mobile"
                required
              />
              <Field
                label="Email (optional)"
                value={form.email}
                onChange={(v) => update("email", v)}
                error={errors.email}
                type="email"
                className="sm:col-span-2"
              />
              <Field
                label="Address line 1"
                value={form.address1}
                onChange={(v) => update("address1", v)}
                error={errors.address1}
                className="sm:col-span-2"
                placeholder="House no, building, street"
                required
              />
              <Field
                label="Address line 2 (optional)"
                value={form.address2}
                onChange={(v) => update("address2", v)}
                error={errors.address2}
                className="sm:col-span-2"
                placeholder="Area, landmark"
              />
              <Field
                label="City"
                value={form.city}
                onChange={(v) => update("city", v)}
                error={errors.city}
                required
              />
              <div>
                <label className="label">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  className="input"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                )}
              </div>
              <Field
                label="Pincode"
                value={form.pincode}
                onChange={(v) =>
                  update("pincode", v.replace(/\D/g, "").slice(0, 6))
                }
                error={errors.pincode}
                inputMode="numeric"
                placeholder="6-digit pincode"
                required
              />
            </div>
          </section>

          <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment method
            </h2>
            <div className="mt-4 space-y-3">
              <PaymentOption
                selected={paymentMethod === "prepaid"}
                onSelect={() => setPaymentMethod("prepaid")}
                title="Pay Online (UPI / Card / Netbanking)"
                subtitle="Secure payment via Razorpay"
                badge="Recommended"
              />
              <PaymentOption
                selected={paymentMethod === "cod"}
                onSelect={() => setPaymentMethod("cod")}
                title="Cash on Delivery"
                subtitle="Pay in cash when your order arrives"
              />
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order summary
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-2">
                  <span className="line-clamp-1 text-gray-600">
                    {l.title} × {l.quantity}
                  </span>
                  <span className="font-medium">
                    {formatINR(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium">{formatINR(subtotal)}</dd>
              </div>
              {couponCode && (
                <div className="flex justify-between text-green-700">
                  <dt>Coupon</dt>
                  <dd className="font-medium">{couponCode}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-medium">
                  {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 rounded-lg bg-gray-50 p-2 text-xs text-gray-500">
              Final total (with any discount &amp; shipping) is calculated
              securely on the server.
            </p>

            {serverError && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {serverError}
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={submitting}
              className="btn-primary mt-4 w-full"
            >
              {submitting
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place COD Order"
                  : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required,
  className,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputMode?: "numeric" | "text" | "email";
}) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PaymentOption({
  selected,
  onSelect,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors ${
        selected
          ? "border-primary bg-surface"
          : "border-hairline hover:bg-surface"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-strike"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-sm text-gray-500">{subtitle}</span>
      </span>
    </button>
  );
}
