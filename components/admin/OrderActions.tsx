"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/money";

type OrderItem = { title: string; price: number; quantity: number };

type OrderData = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
  total: number;
  paymentMethod: string;
  fulfillmentStatus: string;
  items: OrderItem[];
};

const FULFILLMENT_STEPS = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "rto",
  "cancelled",
] as const;

export function OrderActions({ order }: { order: OrderData }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.fulfillmentStatus);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Customer phone with India country code for wa.me.
  const waNumber = `91${order.phone}`;
  const itemLines = order.items
    .map((it) => `- ${it.title} x${it.quantity} (${formatINR(it.price * it.quantity)})`)
    .join("\n");
  const waMessage = `Hi ${order.customerName}, this is ShopSprint confirming your order ${order.orderNumber}:\n${itemLines}\nTotal: ${formatINR(order.total)} (${order.paymentMethod.toUpperCase()})\nDeliver to: ${addressText(order)}\n\nCan you please confirm this order?`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  async function updateStatus(next: string) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not update status.");
        return;
      }
      setStatus(next);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function copyAddress() {
    const text = `${order.customerName}\n${addressText(order)}\nPhone: ${order.phone}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy. Copy manually.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-green-600 text-white hover:bg-green-700"
        >
          Confirm on WhatsApp
        </a>
        <button onClick={copyAddress} className="btn-secondary">
          {copied ? "Copied ✓" : "Copy address for supplier"}
        </button>
      </div>

      <div>
        <div className="label">Update fulfillment status</div>
        <div className="flex flex-wrap gap-2">
          {FULFILLMENT_STEPS.map((s) => (
            <button
              key={s}
              disabled={saving || status === s}
              onClick={() => updateStatus(s)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${
                status === s
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function addressText(order: OrderData): string {
  return [
    order.address1,
    order.address2,
    `${order.city}, ${order.state} - ${order.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");
}
