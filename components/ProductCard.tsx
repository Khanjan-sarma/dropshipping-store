import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";

export type ProductCardData = {
  slug: string;
  title: string;
  images: string[];
  price: number;
  compareAt: number | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0] ?? "/placeholder.svg";
  const discountPct =
    product.compareAt && product.compareAt > product.price
      ? Math.round(
          ((product.compareAt - product.price) / product.compareAt) * 100,
        )
      : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discountPct && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-600 px-2 py-1 text-xs font-bold text-white">
            {discountPct}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatINR(product.price)}
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatINR(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
