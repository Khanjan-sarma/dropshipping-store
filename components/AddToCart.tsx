"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useCart, type CartLine } from "@/lib/store/cart";

export function AddToCart({ product }: { product: Omit<CartLine, "quantity"> }) {
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center rounded-sm border border-hairline">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-foreground-muted hover:bg-surface"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-10 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-foreground-muted hover:bg-surface"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={handleAdd} className="btn-primary w-full">
          {added ? (
            <>
              <Check className="mr-1.5 h-4 w-4" aria-hidden /> Added to cart
            </>
          ) : (
            <>
              <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden /> Add to Cart
            </>
          )}
        </button>
        <button onClick={handleBuyNow} className="btn-secondary w-full">
          Buy Now
        </button>
      </div>
    </div>
  );
}
