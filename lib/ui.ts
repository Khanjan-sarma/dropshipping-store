// Small presentation helpers.

// Deterministic hash so the same slug always yields the same rating/count.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Stable pseudo rating + review count derived from the product slug.
 * Ratings land between 4.3 and 4.9; counts between ~80 and ~460.
 * (Static social proof for v1 — replace with real reviews later.)
 */
export function pseudoRating(slug: string): { rating: number; count: number } {
  const h = hash(slug);
  const rating = 4.3 + (h % 7) / 10; // 4.3 .. 4.9
  const count = 80 + (h % 380);
  return { rating: Math.round(rating * 10) / 10, count };
}

// Category tile background images (labeled placeholders until real photos exist).
const CATEGORY_IMAGE: Record<string, string> = {
  cooling: "https://placehold.co/600x400/0ea5a5/ffffff?text=Cooling",
  kitchen: "https://placehold.co/600x400/0f1720/ffffff?text=Kitchen",
  toys: "https://placehold.co/600x400/f59e0b/ffffff?text=Fun+%26+Toys",
  home: "https://placehold.co/600x400/5b6570/ffffff?text=Home",
};

export function categoryImage(slug: string): string {
  return (
    CATEGORY_IMAGE[slug] ??
    `https://placehold.co/600x400/0ea5a5/ffffff?text=${encodeURIComponent(slug)}`
  );
}
