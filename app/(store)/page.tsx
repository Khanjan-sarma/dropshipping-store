import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { RefCapture } from "@/components/RefCapture";
import { CATEGORIES } from "@/lib/config";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        slug: true,
        title: true,
        images: true,
        price: true,
        compareAt: true,
      },
    });
  } catch {
    // DB not configured yet — render an empty grid gracefully.
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div>
      <RefCapture />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-orange-100">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-700">
              Trending in India
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
              Cool gadgets & home essentials, delivered to your door.
            </h1>
            <p className="mt-4 text-base text-gray-600">
              Neck fans, mini coolers, kitchen organizers and more. Cash on
              Delivery available. Fast delivery across India.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Shop Now
              </Link>
              <Link href="/products?category=cooling" className="btn-secondary">
                Beat the Heat
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/60 shadow-lg">
            <div className="flex h-full items-center justify-center text-center text-brand-700">
              <div>
                <div className="text-6xl">🛍️</div>
                <p className="mt-3 px-6 text-sm font-medium">
                  Handpicked trending products at honest prices
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-page py-8">
        <TrustBadges />
      </section>

      {/* Categories */}
      <section className="container-page py-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="card flex items-center justify-center p-6 text-center font-semibold text-gray-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Featured products</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            No products yet. Add products from the admin panel or run the seed
            script.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
