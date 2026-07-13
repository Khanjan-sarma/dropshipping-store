"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/money";

export type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  active: boolean;
  source: string | null;
  maxUses: number | null;
  usedCount: number;
  orderCount: number;
  paidOrderCount: number;
  totalRevenue: number;
  paidRevenue: number;
};

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function fmtDiscount(c: CouponRow) {
    return c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`;
  }

  async function create() {
    setError("");
    if (!code || !value) {
      setError("Code and value are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: Number(value),
        source: source || "",
        maxUses: maxUses ? Number(maxUses) : null,
        active: true,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not create coupon.");
      return;
    }
    setShowForm(false);
    setCode("");
    setValue("");
    setSource("");
    setMaxUses("");
    router.refresh();
  }

  async function toggle(c: CouponRow) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Coupons &amp; attribution
        </h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Close" : "+ New coupon"}
        </button>
      </div>

      {showForm && (
        <div className="card mt-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label">Code</label>
              <input
                className="input uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MLBB10"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as "percent" | "flat")}
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">
                {type === "percent" ? "Percent off" : "Amount off (₹)"}
              </label>
              <input
                className="input"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Source (attribution)</label>
              <input
                className="input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="influencer:mlbb_friend"
              />
            </div>
            <div>
              <label className="label">Max uses (optional)</label>
              <input
                className="input"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4">
            <button onClick={create} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Create coupon"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Paid orders</th>
              <th className="px-4 py-3">Revenue (paid)</th>
              <th className="px-4 py-3">Revenue (all)</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3">{fmtDiscount(c)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.source || "—"}</td>
                  <td className="px-4 py-3">
                    {c.usedCount}
                    {c.maxUses != null && (
                      <span className="text-gray-400"> / {c.maxUses}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3">{c.paidOrderCount}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatINR(c.paidRevenue)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatINR(c.totalRevenue)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(c)}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.active ? "Active" : "Off"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        &quot;Uses&quot; increments on verified prepaid payment. &quot;Orders&quot;
        counts every order that applied the code (incl. COD/pending). Paid
        revenue reflects prepaid captured orders.
      </p>
    </div>
  );
}
