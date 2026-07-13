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
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {category ? categoryLabel(category) : "All Products"}
      </h1>

      {/* Category filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !category
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === c.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No products found in this category.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
