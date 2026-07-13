import { Banknote, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const badges: { title: string; subtitle: string; Icon: LucideIcon }[] = [
  {
    title: "Cash on Delivery",
    subtitle: "Pay when it arrives",
    Icon: Banknote,
  },
  {
    title: "Fast Delivery",
    subtitle: "3–5 days across India",
    Icon: Truck,
  },
  {
    title: "Secure Payments",
    subtitle: "UPI, cards & netbanking",
    Icon: ShieldCheck,
  },
  {
    title: "Easy Returns",
    subtitle: "7-day hassle-free",
    Icon: RotateCcw,
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map(({ title, subtitle, Icon }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-md border border-hairline bg-white p-4"
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-surface text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <div className="text-xs text-foreground-muted">{subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
