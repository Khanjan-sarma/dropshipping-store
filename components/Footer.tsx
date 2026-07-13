import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { CATEGORIES } from "@/lib/config";

const PAYMENT_METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "COD"];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-lg font-extrabold">
            <span className="text-primary">Shop</span>Sprint
          </div>
          <p className="mt-2 max-w-[32ch] text-sm text-foreground-muted">
            {siteConfig.tagline}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/products" className="hover:text-foreground">
                All Products
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="hover:text-foreground"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/policies/shipping" className="hover:text-foreground">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="hover:text-foreground">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact us
              </Link>
            </li>
            <li>{siteConfig.supportEmail}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 text-xs text-foreground-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {siteConfig.name} · Made in India
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="rounded-sm border border-hairline bg-white px-2 py-1 text-[11px] font-semibold text-foreground-muted"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
