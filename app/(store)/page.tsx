import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { Reviews } from "@/components/Reviews";
import { RefCapture } from "@/components/RefCapture";
import { CATEGORIES, siteConfig } from "@/lib/config";
import { categoryImage } from "@/lib/ui";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        price: true,
        compareAt: true,
      },
    });
    const combo = products.find((p) => p.slug === "summer-cooling-combo") ?? null;
    return { products: products.slice(0, 8), combo };
  } catch {
    return { products: [], combo: null };
  }
}

export default async function HomePage() {
  const { products, combo } = await getHomeData();
  const heroImage = products[0]?.images[0] ?? "/placeholder.svg";

  return (
    <div>
      <RefCapture />

      {/* Hero (DESIGN_GUIDE §8.2) — solid surface panel, real image, no gradient */}
      <section className="border-b border-hairline bg-surface">
        <div className="container-page grid items-center gap-8 py-16 md:grid-cols-2 md:gap-12 md:py-24">
          <div className="order-2 md:order-1">
            <span className="chip bg-white text-primary ring-1 ring-hairline">
              Summer-ready gadgets
            </span>
            <h1 className="mt-4 font-display text-[2rem] font-extrabold leading-[2.5rem] tracking-tight text-foreground md:text-5xl md:leading-[3.5rem]">
              Cool gadgets & home essentials, delivered across India.
            </h1>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-foreground-muted">
              Neck fans, mini coolers, kitchen organizers and more — at honest
              prices. Cash on Delivery available, fast 3–5 day delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products?category=cooling" className="btn-primary">
                Shop Cooling
              </Link>
              <Link href="/products" className="btn-secondary">
                View all products
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-lg border border-hairline bg-white">
              <Image
                src={heroImage}
                alt="Featured trending product"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip (§8.3) */}
      <section className="container-page py-12 md:py-16">
        <TrustBadges />
      </section>

      {/* Category tiles (§8.4) — image-based */}
      <section className="container-page pb-12 md:pb-16">
        <h2 className="text-h2 md:text-2xl">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group relative block aspect-[3/2] overflow-hidden rounded-md border border-hairline"
            >
              <Image
                src={categoryImage(c.slug)}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-200 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-foreground/60 p-3 text-sm font-semibold text-white">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers (§8.5) */}
      <section className="container-page pb-12 md:pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-h2 md:text-2xl">Best sellers</h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="rounded-md border border-dashed border-hairline p-8 text-center text-sm text-foreground-muted">
            Products will appear here once the store database is connected.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Featured combo banner (§8.6) */}
      {combo && (
        <section className="container-page pb-12 md:pb-16">
          <div className="grid items-center gap-6 overflow-hidden rounded-lg border border-hairline bg-surface md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[280px]">
              <Image
                src={combo.images[0] ?? "/placeholder.svg"}
                alt={combo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-10">
              {combo.compareAt && combo.compareAt > combo.price && (
                <span className="chip bg-accent text-white">
                  Save {formatINR(combo.compareAt - combo.price)}
                </span>
              )}
              <h2 className="mt-3 text-h2 md:text-2xl">{combo.title}</h2>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-foreground-muted">
                Get the neck fan and the mini cooler together and save big — the
                ultimate personal cooling kit for your desk and on the move.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-price text-foreground">
                  {formatINR(combo.price)}
                </span>
                {combo.compareAt && combo.compareAt > combo.price && (
                  <span className="text-sm text-strike line-through">
                    {formatINR(combo.compareAt)}
                  </span>
                )}
              </div>
              <Link
                href={`/product/${combo.slug}`}
                className="btn-primary mt-6 w-full sm:w-auto"
              >
                Grab the combo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Social proof (§8.7) */}
      <section className="border-t border-hairline bg-surface">
        <div className="container-page py-12 md:py-16">
          <h2 className="text-h2 md:text-2xl">What our customers say</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Real feedback from shoppers across India.
          </p>
          <div className="mt-6">
            <Reviews />
          </div>
        </div>
      </section>

      {/* WhatsApp CTA (§8.8) */}
      <section className="container-page py-12 md:py-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-hairline p-6 md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="text-h2">Questions before you buy?</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Chat with us on WhatsApp — we usually reply within a few minutes.
            </p>
          </div>
          {siteConfig.whatsappNumber ? (
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-success text-white hover:opacity-90"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden /> Chat on
              WhatsApp
            </a>
          ) : (
            <Link href="/contact" className="btn-primary">
              Contact us
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
