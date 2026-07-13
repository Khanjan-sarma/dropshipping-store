import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Banknote,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { pseudoRating } from "@/lib/ui";
import { Gallery } from "@/components/Gallery";
import { AddToCart } from "@/components/AddToCart";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { categoryLabel, siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  try {
    return await prisma.product.findFirst({ where: { slug, active: true } });
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeId: string) {
  try {
    return await prisma.product.findMany({
      where: { active: true, category, NOT: { id: excludeId } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        price: true,
        compareAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      type: "website",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  };
}

// Split seed description into bullet highlights (lines starting with "•") and
// the remaining prose body.
function parseDescription(description: string) {
  const lines = description.split("\n");
  const highlights: string[] = [];
  const bodyLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("•")) {
      highlights.push(trimmed.replace(/^•\s*/, ""));
    } else if (trimmed) {
      bodyLines.push(trimmed);
    }
  }
  return { highlights, body: bodyLines.join("\n\n") };
}

const TRUST_CHIPS = [
  { Icon: Banknote, label: "Cash on Delivery" },
  { Icon: Truck, label: "3–5 day delivery" },
  { Icon: RotateCcw, label: "7-day returns" },
  { Icon: ShieldCheck, label: "Secure payment" },
];

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const hasMrp = product.compareAt != null && product.compareAt > product.price;
  const discountPct = hasMrp
    ? Math.round(((product.compareAt! - product.price) / product.compareAt!) * 100)
    : null;
  const savings = hasMrp ? product.compareAt! - product.price : 0;
  const { rating, count } = pseudoRating(product.slug);
  const { highlights, body } = parseDescription(product.description);
  const related = await getRelated(product.category, product.id);

  const cartProduct = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? "/placeholder.svg",
    price: product.price,
  };

  return (
    <div className="container-page py-8 pb-24 md:py-12 md:pb-16">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-foreground-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-foreground"
        >
          {categoryLabel(product.category)}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Gallery ~55% */}
        <div className="lg:col-span-7">
          <Gallery images={product.images} title={product.title} />
        </div>

        {/* Buy box ~45%, sticky on desktop */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <span className="chip border border-hairline bg-white text-foreground-muted">
              {categoryLabel(product.category)}
            </span>
            <h1 className="mt-3 text-h1 md:text-[2rem] md:leading-[2.5rem]">
              {product.title}
            </h1>

            <div className="mt-3">
              <StarRating rating={rating} count={count} />
            </div>

            {/* Price block */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-3xl font-extrabold text-foreground">
                {formatINR(product.price)}
              </span>
              {hasMrp && (
                <span className="text-lg text-strike line-through">
                  {formatINR(product.compareAt!)}
                </span>
              )}
              {hasMrp && (
                <span className="text-sm font-semibold text-accent">
                  Save {formatINR(savings)} ({discountPct}%)
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-foreground-muted">
              Inclusive of all taxes
            </p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <ul className="mt-5 space-y-1.5">
                {highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="mt-6">
              <AddToCart product={cartProduct} />
            </div>

            {/* Trust chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_CHIPS.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="chip border border-hairline bg-white text-foreground-muted"
                >
                  <Icon className="h-3.5 w-3.5 text-success" aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            {/* Collapsible sections */}
            <div className="mt-6 divide-y divide-hairline border-y border-hairline">
              <Section title="Description" defaultOpen>
                <div className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                  {body || product.description}
                </div>
              </Section>
              <Section title="Shipping & Returns">
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Ships across India in 3–5 business days. Cash on Delivery
                  available. Easy 7-day returns on damaged or incorrect items —
                  see our{" "}
                  <Link href="/policies/returns" className="text-primary underline">
                    returns policy
                  </Link>
                  .
                </p>
              </Section>
              <Section title="FAQ">
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Have a question? Reach us on the{" "}
                  <Link href="/contact" className="text-primary underline">
                    contact page
                  </Link>{" "}
                  and we&apos;ll help you out.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-h2 md:text-2xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile Add-to-Cart bar */}
      <StickyAddToCart product={cartProduct} />
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
        {title}
        <ChevronDown
          className="h-4 w-4 text-foreground-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
