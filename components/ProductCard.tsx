import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { pseudoRating } from "@/lib/ui";
import { StarRating } from "@/components/StarRating";
import { AddToCartButton } from "@/components/AddToCartButton";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  images: string[];
  price: number;
  compareAt: number | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0] ?? "/placeholder.svg";
  const hasMrp = product.compareAt != null && product.compareAt > product.price;
  const discountPct = hasMrp
    ? Math.round(((product.compareAt! - product.price) / product.compareAt!) * 100)
    : null;
  const savings = hasMrp ? product.compareAt! - product.price : 0;
  const { rating, count } = pseudoRating(product.slug);

  return (
    <div className="group flex flex-col overflow-hidden rounded-md border border-hairline bg-white transition-shadow duration-200 ease-out hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-105"
        />
        {discountPct != null && (
          <span className="chip absolute left-2 top-2 bg-accent text-white">
            {discountPct}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`} className="focus:outline-none">
          <h3 className="line-clamp-2 text-h3 text-foreground">
            {product.title}
          </h3>
        </Link>

        <StarRating rating={rating} count={count} className="mt-2" />

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-price text-foreground">
            {formatINR(product.price)}
          </span>
          {hasMrp && (
            <span className="text-sm text-strike line-through">
              {formatINR(product.compareAt!)}
            </span>
          )}
        </div>
        {hasMrp && (
          <div className="mt-1 text-xs font-semibold text-accent">
            Save {formatINR(savings)}
          </div>
        )}

        <div className="mt-3 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image,
              price: product.price,
            }}
          />
        </div>
      </div>
    </div>
  );
}
