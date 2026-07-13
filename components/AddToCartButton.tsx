"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart, type CartLine } from "@/lib/store/cart";

/**
 * Compact "Add to Cart" button used on product cards. Rendered as a sibling of
 * the card's Link (not nested inside it) so it stays valid, non-navigating HTML.
 */
export function AddToCartButton({
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
    <button
      type="button"
      onClick={handleAdd}
      className="btn-primary w-full"
      aria-label={`Add ${product.title} to cart`}
    >
      {added ? (
        <>
          <Check className="mr-1.5 h-4 w-4" aria-hidden /> Added
        </>
      ) : (
        <>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Add to Cart
        </>
      )}
    </button>
  );
}
