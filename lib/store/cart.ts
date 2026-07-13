"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Client cart. Stores minimal product info for display; prices are ALWAYS
// re-verified server-side at checkout. The display price here is convenience only.
export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number; // paise (display only; server recomputes)
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalQuantity: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === line.productId,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId
                ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      totalQuantity: () =>
        get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "ss-cart-v1" },
  ),
);
