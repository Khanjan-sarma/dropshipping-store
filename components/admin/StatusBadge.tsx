const paymentColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cod_pending: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const fulfillmentColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  rto: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
};

const labels: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  cod_pending: "COD",
  failed: "Failed",
  new: "New",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  rto: "RTO",
  cancelled: "Cancelled",
};

export function StatusBadge({
  status,
  kind,
}: {
  status: string;
  kind: "payment" | "fulfillment";
}) {
  const colors = kind === "payment" ? paymentColors : fulfillmentColors;
  const cls = colors[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
