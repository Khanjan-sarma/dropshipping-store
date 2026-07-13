import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, categoryLabel } from "@/lib/config";

export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const cat = searchParams.category;
  return {
    title: cat ? `${categoryLabel(cat)} Products` : "All Products",
  };
}

async function getProducts(category?: string) {
  try {
    return await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const products = await getProducts(category);

  return (
    <div className="container-page py-10 md:py-16">
      <h1 className="text-h1 md:text-[2rem]">
        {category ? categoryLabel(category) : "All Products"}
      </h1>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/products" active={!category}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.slug}
            href={`/products?category=${c.slug}`}
            active={category === c.slug}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-hairline p-8 text-center text-sm text-foreground-muted">
          No products found in this category.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`chip border transition-colors ${
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-hairline bg-white text-foreground-muted hover:bg-surface"
      }`}
    >
      {children}
    </Link>
  );
}
