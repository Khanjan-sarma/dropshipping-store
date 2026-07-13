import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="container-page grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="text-lg font-extrabold">
            <span className="text-brand-600">Shop</span>Sprint
          </div>
          <p className="mt-2 text-sm text-gray-600">{siteConfig.tagline}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/products" className="hover:text-brand-600">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-brand-600">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-600">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Policies</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/policies/shipping" className="hover:text-brand-600">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="hover:text-brand-600">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="hover:text-brand-600">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms" className="hover:text-brand-600">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Trust</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>Cash on Delivery</li>
            <li>Fast delivery 3–5 days</li>
            <li>Secure payments</li>
            <li>Easy returns</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
