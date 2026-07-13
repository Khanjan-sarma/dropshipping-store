import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

async function getOrder(orderNumber?: string) {
  if (!orderNumber) return null;
  try {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string };
}) {
  const orderNumber = searchParams.orderNumber;
  const order = await getOrder(orderNumber);

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-success" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Thank you for your order!
        </h1>
        {orderNumber ? (
          <p className="mt-2 text-gray-600">
            Your order{" "}
            <span className="font-semibold text-gray-900">{orderNumber}</span>{" "}
            has been placed successfully.
          </p>
        ) : (
          <p className="mt-2 text-gray-600">Your order has been placed.</p>
        )}

        {order && (
          <div className="card mt-6 p-4 text-left">
            <h2 className="text-sm font-semibold text-gray-900">
              Order details
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-2">
                  <span className="text-gray-600">
                    {it.title} × {it.quantity}
                  </span>
                  <span className="font-medium">
                    {formatINR(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm font-bold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Payment:{" "}
              <span className="font-medium">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentStatus === "paid"
                    ? "Paid online"
                    : "Processing"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-md bg-surface p-4 text-left text-sm text-gray-700">
          <h3 className="font-semibold text-gray-900">What happens next?</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>We&apos;ll confirm your order details.</li>
            {order?.paymentMethod === "cod" && (
              <li>
                Our team may call or WhatsApp you to confirm your COD order.
              </li>
            )}
            <li>Your order ships and is delivered in 3–5 days.</li>
          </ol>
        </div>

        <Link href="/products" className="btn-primary mt-6">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
