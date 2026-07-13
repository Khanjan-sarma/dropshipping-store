// Central site configuration. Update these to rebrand the store.
export const siteConfig = {
  name: "ShopSprint",
  tagline: "Trending gadgets & home essentials, delivered across India",
  description:
    "Shop trending gadgets, cooling, kitchen and fun products with Cash on Delivery across India. Fast delivery, easy returns, secure payments.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  supportEmail: "support@shopsprint.example",
};

export const CATEGORIES = [
  { slug: "cooling", label: "Cooling" },
  { slug: "kitchen", label: "Kitchen" },
  { slug: "toys", label: "Fun & Toys" },
  { slug: "home", label: "Home" },
] as const;

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
