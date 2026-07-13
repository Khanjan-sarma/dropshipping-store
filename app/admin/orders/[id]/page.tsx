import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/adminData";
import { formatINR } from "@/lib/money";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderById(params.id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-gray-500 hover:text-brand-600"
      >
        ← Back to orders
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">
          Order {order.orderNumber}
        </h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.paymentStatus} kind="payment" />
          <StatusBadge status={order.fulfillmentStatus} kind="fulfillment" />
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Placed{" "}
        {new Date(order.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>

      {order.paymentMethod === "cod" && order.fulfillmentStatus === "new" && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          ⚠️ COD order — confirm with the customer on WhatsApp before shipping
          to reduce RTO.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items + actions */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900">Items</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between gap-2 py-2 text-sm"
                >
                  <span className="text-gray-700">
                    {it.title} × {it.quantity}
                  </span>
                  <span className="font-medium">
                    {formatINR(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discount > 0 && (
                <Row
                  label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                  value={`− ${formatINR(order.discount)}`}
                />
              )}
              <Row
                label="Shipping"
                value={
                  order.shippingFee === 0
                    ? "FREE"
                    : formatINR(order.shippingFee)
                }
              />
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
            <div className="mt-3">
              <OrderActions
                order={{
                  id: order.id,
                  orderNumber: order.orderNumber,
                  customerName: order.customerName,
                  phone: order.phone,
                  address1: order.address1,
                  address2: order.address2,
                  city: order.city,
                  state: order.state,
                  pincode: order.pincode,
                  total: order.total,
                  paymentMethod: order.paymentMethod,
                  fulfillmentStatus: order.fulfillmentStatus,
                  items: order.items.map((it) => ({
                    title: it.title,
                    price: it.price,
                    quantity: it.quantity,
                  })),
                }}
              />
            </div>
          </section>
        </div>

        {/* Customer + payment info */}
        <div className="space-y-6">
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p className="font-medium">{order.customerName}</p>
              <p>{order.phone}</p>
              {order.email && <p>{order.email}</p>}
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Shipping address
            </h2>
            <address className="mt-2 not-italic text-sm text-gray-700">
              {order.address1}
              {order.address2 && (
                <>
                  <br />
                  {order.address2}
                </>
              )}
              <br />
              {order.city}, {order.state} - {order.pincode}
            </address>
          </section>

          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p>
                Method:{" "}
                <span className="font-medium uppercase">
                  {order.paymentMethod}
                </span>
              </p>
              <p>
                Status: <StatusBadge status={order.paymentStatus} kind="payment" />
              </p>
              {order.razorpayPaymentId && (
                <p className="break-all font-mono text-xs text-gray-500">
                  {order.razorpayPaymentId}
                </p>
              )}
              {order.refSource && (
                <p className="text-xs text-gray-500">
                  Ref: {order.refSource}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-600">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
