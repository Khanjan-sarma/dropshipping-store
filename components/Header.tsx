"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { CATEGORIES } from "@/lib/config";

export function Header() {
  const totalQuantity = useCart((s) => s.totalQuantity());
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      {/* Announcement bar (DESIGN_GUIDE §7) */}
      <div className="bg-primary py-2 text-center text-xs font-medium text-primary-fg">
        Free shipping over ₹999 • Cash on Delivery available • Easy 7-day returns
      </div>

      <div className="border-b border-hairline">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="-ml-1 flex h-11 w-11 items-center justify-center md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
            </button>
            <Link
              href="/"
              className="font-display text-xl font-extrabold tracking-tight"
            >
              <span className="text-primary">Shop</span>Sprint
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-foreground-muted md:flex">
            <Link href="/products" className="hover:text-foreground">
              All Products
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="hover:text-foreground"
              >
                {c.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/products"
              aria-label="Search products"
              className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-surface"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-foreground hover:bg-surface"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              {mounted && totalQuantity > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-fg">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-b border-hairline bg-white px-4 py-2 md:hidden">
          <Link
            href="/products"
            className="block py-2 text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            All Products
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="block py-2 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
