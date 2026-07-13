import Link from "next/link";
import { getOrders } from "@/lib/adminData";
import { formatINR } from "@/lib/money";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const paymentFilters = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "cod_pending", label: "COD" },
  { value: "failed", label: "Failed" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { paymentStatus?: string };
}) {
  const paymentStatus = searchParams.paymentStatus || "";
  const orders = await getOrders(
    paymentStatus ? { paymentStatus } : undefined,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <div className="flex flex-wrap gap-2">
          {paymentFilters.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/admin/orders?paymentStatus=${f.value}` : "/admin/orders"}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                paymentStatus === f.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3">Coupon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {o.phone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {formatINR(o.total)}
                  </td>
                  <td className="px-4 py-3 uppercase text-gray-600">
                    {o.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.paymentStatus} kind="payment" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={o.fulfillmentStatus}
                      kind="fulfillment"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {o.couponCode || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
