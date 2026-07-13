const badges = [
  {
    title: "Cash on Delivery",
    subtitle: "Pay when it arrives",
    icon: "💵",
  },
  {
    title: "Fast Delivery",
    subtitle: "3–5 days across India",
    icon: "🚚",
  },
  {
    title: "Secure Payments",
    subtitle: "UPI, cards & netbanking",
    icon: "🔒",
  },
  {
    title: "Easy Returns",
    subtitle: "Hassle-free process",
    icon: "↩️",
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.title}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
        >
          <span className="text-2xl" aria-hidden>
            {b.icon}
          </span>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {b.title}
            </div>
            <div className="text-xs text-gray-500">{b.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
