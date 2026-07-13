"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartLine } from "@/lib/store/cart";
import { formatINR } from "@/lib/money";

/**
 * Sticky bottom Add-to-Cart bar for mobile PDP (DESIGN_GUIDE §10).
 * Hidden on desktop where the sticky buy-box handles this.
 */
export function StickyAddToCart({
  product,
}: {
  product: Omit<CartLine, "quantity">;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-md backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs text-foreground-muted">
            {product.title}
          </div>
          <div className="text-price text-foreground">
            {formatINR(product.price)}
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary ml-auto flex-1">
          {added ? (
            <>
              <Check className="mr-1.5 h-4 w-4" aria-hidden /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
