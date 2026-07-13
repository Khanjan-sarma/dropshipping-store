"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-50"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="px-3 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={handleAdd} className="btn-secondary flex-1">
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button onClick={handleBuyNow} className="btn-primary flex-1">
          Buy Now
        </button>
      </div>
    </div>
  );
}
