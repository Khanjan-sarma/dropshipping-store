import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { Gallery } from "@/components/Gallery";
import { AddToCart } from "@/components/AddToCart";
import { categoryLabel, siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { slug, active: true },
    });
  } catch {
    return null;
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

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const discountPct =
    product.compareAt && product.compareAt > product.price
      ? Math.round(
          ((product.compareAt - product.price) / product.compareAt) * 100,
        )
      : null;

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={product.images} title={product.title} />

        <div>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatINR(product.price)}
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatINR(product.compareAt)}
                </span>
                <span className="rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-700">
                  {discountPct}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>

          <div className="my-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                image: product.images[0] ?? "/placeholder.svg",
                price: product.price,
              }}
            />
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-200 p-3 text-center text-xs">
            <div>
              <div className="text-lg">💵</div>
              <div className="mt-1 font-medium text-gray-700">
                COD available
              </div>
            </div>
            <div>
              <div className="text-lg">🚚</div>
              <div className="mt-1 font-medium text-gray-700">
                3–5 day delivery
              </div>
            </div>
            <div>
              <div className="text-lg">🔒</div>
              <div className="mt-1 font-medium text-gray-700">
                Secure payment
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Product details
            </h2>
            <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {product.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
