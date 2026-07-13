# UI Design Guide

> **For Kiro IDE:** This is the visual design system for the store. Apply it across every page so the site looks like a real, trusted D2C brand — not a generic template. Follow the design tokens, component specs, and layout rules below **exactly**. When in doubt, prefer restraint (whitespace, alignment, one accent color) over decoration.
>
> **Design north star:** Clean and confident like [Vercel's Next.js Commerce](https://github.com/vercel/commerce), structured like [Medusa's Next.js starter](https://github.com/medusajs/nextjs-starter-medusa) and [Saleor's storefront](https://github.com/saleor/storefront), but warmed up with the conversion patterns Indian D2C shoppers respond to (clear offers, strong trust signals, COD front-and-center, real reviews). *(Reference approaches summarized/rephrased for compliance.)*

---

## 0. The "Vibe-Coded" Tells to Eliminate

The current UI looks AI-generated. Fix these specific things — they are the giveaways:

| ❌ Generic tell | ✅ Do this instead |
|-----------------|--------------------|
| Purple/indigo gradient hero, `bg-gradient-to-r from-purple-500` | One brand color used intentionally; flat or subtle imagery-based hero |
| Everything centered, all same font size | Clear typographic hierarchy; left-aligned body text |
| Cards with heavy drop shadows everywhere | Flat cards with 1px borders; shadow only on hover/overlays |
| Emoji as icons (🚀🔥✨) in the UI | A real icon set (**lucide-react**) |
| Inconsistent spacing (random `mt-3`, `p-7`) | A strict 4px spacing scale (see §4) |
| Rounded-full everything, or sharp 0 radius | Consistent radius tokens (§6) |
| Default system font | A defined typeface pair (§3) |
| Fake "Lorem ipsum" or filler | Real product copy from PRODUCTS_SEED.md |
| Rainbow of accent colors | One accent + neutrals + semantic colors only |

---

## 1. Brand Direction

- **Personality:** Practical, friendly, trustworthy, energetic. Value-for-money, not luxury.
- **Feel:** Bright, clean, fast. Lots of white space. Product photos are the hero — the UI stays out of the way.
- **Two theme options** (pick one and commit; A recommended for the cooling/gadget range):
  - **Theme A — "Fresh Cool":** primary a confident teal/cyan; energetic, summery, fits fans/coolers.
  - **Theme B — "Warm Trust":** primary a deep indigo-blue with an amber accent; classic, dependable retail.

---

## 2. Color Tokens

Define these as CSS variables and in `tailwind.config.ts`. Use **semantic names**, never raw hex in components.

### Theme A — Fresh Cool (recommended)
```css
/* Brand */
--color-primary: #0EA5A5;         /* teal-500 — buttons, links, active states */
--color-primary-hover: #0B8A8A;   /* darker for hover */
--color-primary-fg: #FFFFFF;      /* text on primary */

/* Neutrals (the backbone — use these the most) */
--color-bg: #FFFFFF;              /* page background */
--color-surface: #F7F8F8;         /* cards, section bands */
--color-border: #E6E8EA;          /* 1px borders, dividers */
--color-text: #0F1720;            /* near-black headings/body */
--color-text-muted: #5B6570;      /* secondary text, captions */

/* Accents / semantic */
--color-accent: #F59E0B;          /* amber — sale badges, savings, urgency ONLY */
--color-success: #16A34A;         /* "COD available", in stock */
--color-danger: #DC2626;          /* errors, low stock */
--color-price: #0F1720;           /* price text (near-black, bold) */
--color-strike: #9AA4AE;          /* struck-through MRP */
```

### Theme B — Warm Trust
```css
--color-primary: #1E3A8A;         /* indigo-800 */
--color-primary-hover: #172E6B;
--color-accent: #F59E0B;          /* amber */
/* keep the same neutrals + semantic colors as Theme A */
```

**Rules:**
- 90% of the page is neutrals (white + one grey surface + near-black text).
- Primary color only on: primary buttons, links, active nav, focus rings.
- Amber accent **only** for savings/offer/urgency — never decorative.
- Never introduce a color that isn't a token.

---

## 3. Typography

Use two Google fonts via `next/font` (self-hosted, no layout shift):

| Role | Font | Notes |
|------|------|-------|
| Headings / display | **Plus Jakarta Sans** (or Satoshi/Sora) | Weights 600–800. Tight tracking on large sizes. |
| Body / UI | **Inter** | Weights 400–600. Highly legible on mobile. |

> Alternative single-font route (cleaner, Vercel-style): use **Geist** or **Inter** for everything with strong weight contrast.

### Type scale (mobile → desktop)
| Token | Size / line-height | Weight | Use |
|-------|--------------------|--------|-----|
| `display` | 32/40 → 48/56 | 800 | Hero headline |
| `h1` | 26/32 → 32/40 | 700 | Page titles |
| `h2` | 20/28 → 24/32 | 700 | Section headings |
| `h3` | 17/24 → 18/28 | 600 | Card titles, PDP subheads |
| `body` | 15/24 → 16/26 | 400 | Paragraphs |
| `small` | 13/20 | 400–500 | Captions, meta |
| `price` | 20/28 → 22/30 | 700 | Product price |

**Rules:** left-align body text (never justify). Max line length ~68 chars. Headings near-black; secondary text uses `--color-text-muted`.

---

## 4. Spacing System (strict 4px scale)

Only use these steps: **4, 8, 12, 16, 24, 32, 48, 64, 96 px** (Tailwind `1,2,3,4,6,8,12,16,24`).

- Section vertical padding: `py-16` mobile, `py-24` desktop.
- Card inner padding: `p-4`.
- Gap between grid items: `gap-4` mobile, `gap-6` desktop.
- Max content width: `max-w-7xl` (1280px), centered, with `px-4 md:px-6` gutters.
- Never use arbitrary one-off values (`p-7`, `mt-[13px]`). Pick from the scale.

---

## 5. Layout Grid

- **Container:** `max-w-7xl mx-auto px-4 md:px-6`.
- **Product grid:** 2 columns on mobile, 3 on tablet, 4 on desktop (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- **PDP:** single column mobile; 2-column on desktop (gallery left ~55%, buy-box right ~45%), buy-box `sticky top-24`.
- Consistent vertical rhythm — sections separated by the `--color-surface` band or a hairline border, not shadows.

---

## 6. Radius, Borders, Shadows, Motion

```css
--radius-sm: 8px;    /* inputs, small chips */
--radius-md: 12px;   /* buttons, cards */
--radius-lg: 16px;   /* modals, image containers */
--radius-pill: 9999px; /* badges, category chips only */

--border: 1px solid var(--color-border);

/* Shadows: subtle, and mostly reserved for floating/hover elements */
--shadow-sm: 0 1px 2px rgba(15,23,32,0.06);
--shadow-md: 0 8px 24px rgba(15,23,32,0.10);  /* dropdowns, cart drawer, hover lift */
```

- **Cards:** flat with a 1px border by default. On hover (desktop): lift with `--shadow-md` + image zoom `scale-105`, `transition 200ms ease`.
- **Motion:** 150–250ms `ease-out`. Animate transform/opacity only. No bounce, no long/janky animations. Respect `prefers-reduced-motion`.

---

## 7. Core Components (specs)

### Buttons
- **Primary:** `bg-primary text-white`, `rounded-md`, `h-12` (mobile tappable), `px-6`, weight 600. Hover → `primary-hover`. Full-width on mobile PDP/checkout.
- **Secondary:** white bg, 1px border, `text` color. Hover → `surface`.
- **Focus:** always a visible focus ring `ring-2 ring-primary/40`.
- Only **one** primary button per screen section (one clear action).

### Inputs (forms/checkout)
- `h-12`, `rounded-sm`, 1px border, `px-3`. Label above (not placeholder-only). Error state: `border-danger` + small danger text below. Large tap targets, `inputmode` set correctly (numeric for phone/pincode).

### Badges / chips
- Sale badge: amber bg, white text, `rounded-pill`, `text-xs font-semibold`, top-left of product image (e.g. "58% OFF").
- Trust chips: `success` colored dot + label ("COD Available", "In Stock").

### Product Card (critical — this drives the grid look)
Structure top→bottom:
1. Square image (`aspect-square`), `object-cover`, `rounded-md`, sale badge overlaid top-left, wishlist heart top-right (optional).
2. Title — `h3`, max 2 lines (`line-clamp-2`).
3. Rating row — stars (lucide) + count in muted small text (e.g. "★ 4.6 (214)").
4. Price row — bold price + struck MRP (`--color-strike`) + amber "Save ₹X".
5. Full-width "Add to Cart" button appears on hover (desktop) / always visible (mobile).

### Header / Nav
- Sticky, white, hairline bottom border, `h-16`. Left: logo. Center/left: category links (desktop). Right: search icon, cart icon with item-count bubble.
- **Announcement bar** above header: thin strip in primary color — "Free shipping over ₹999 • Cash on Delivery available • Easy 7-day returns."
- Mobile: hamburger → slide-in drawer; cart opens a right-side drawer (not a new page).

### Footer
- `surface` background. 3–4 columns: Shop (categories), Help (policy links), Contact (WhatsApp), and a short brand blurb. Payment method logos row + "Made in India 🇮🇳" line.

---

## 8. Page Layouts

### Home (`/`)
1. **Announcement bar** + sticky header.
2. **Hero:** left = headline (`display`) + subcopy + primary CTA ("Shop Cooling" ); right = a strong product/lifestyle image. On mobile stack image-then-text. NO purple gradient — use a real image or a soft solid `surface` panel.
3. **Trust strip:** 3–4 items with lucide icons — Cash on Delivery • Fast 3–5 Day Delivery • Easy Returns • Secure Payments.
4. **Category tiles:** 2–4 cards (Cooling, Kitchen, Toys) with image + label.
5. **Best sellers:** product grid (from seed data), section heading + "View all".
6. **Featured product / bundle banner:** highlight the Summer Cooling Combo with the savings.
7. **Social proof:** a row of 3 customer review cards (name, stars, quote). Can be static in v1.
8. **Newsletter/WhatsApp CTA**, then footer.

### Product Detail (`/product/[slug]`)
- Gallery (main image + thumbnails; swipeable on mobile) | Buy box (sticky on desktop).
- Buy box order: title → rating → price block (price, struck MRP, "Save ₹X (58%)") → short bullet highlights → quantity stepper → **Add to Cart** (primary, full-width) + **Buy Now** (secondary) → COD/returns/delivery trust chips → collapsible sections (Description, Shipping & Returns, FAQ).
- Below the fold: full description, reviews section, "You may also like" grid.

### Cart drawer / `/cart`
- Line items with thumbnail, title, qty stepper, remove. Coupon input with "Apply". Order summary (subtotal, discount, shipping, total). Sticky "Proceed to Checkout". Show "You're ₹X away from free shipping" progress bar.

### Checkout (`/checkout`)
- Clean single-column (or 2-col with sticky summary on desktop). Address form with proper Indian validation. Payment method as two large selectable cards: **Prepaid (UPI/Cards)** and **Cash on Delivery**. One clear "Place Order" button. Trust chips + secure-payment note near the button.

---

## 9. Imagery Rules

- Product images on **pure white or very light** backgrounds, consistent framing, square crop. Use Cloudinary transforms (`f_auto,q_auto`, sized per breakpoint).
- Always use `next/image` with width/height to prevent layout shift.
- No random stock photos or generic gradients. If a lifestyle shot isn't available, use a clean product-on-white shot.
- Every image needs meaningful `alt` text (SEO + accessibility).

---

## 10. Mobile-First & Performance (non-negotiable)

- Design mobile layout first; 80%+ of traffic is Instagram mobile.
- Tap targets ≥ 44px. Sticky "Add to Cart" bar on mobile PDP.
- Target < 3s load / good LCP: lazy-load below-the-fold images, prioritize the hero image, avoid heavy libraries, no huge hero videos.
- Test at 360px width first.

---

## 11. Accessibility

- Color contrast ≥ 4.5:1 for text. Don't rely on color alone (pair icons/labels).
- Semantic HTML (`<header> <nav> <main> <button>`). Visible focus states. Keyboard-navigable cart/checkout. Alt text on all images.

---

## 12. Recommended Implementation Libraries

- **Icons:** `lucide-react` (no emoji in UI).
- **Components/primitives:** headless **Radix UI** (dialog for cart drawer, accordion for PDP sections) or **shadcn/ui** for a consistent, accessible base — then restyle with the tokens above.
- **Fonts:** `next/font/google` (Plus Jakarta Sans + Inter, or Geist).
- **Class utilities:** `tailwind-merge` + `clsx` for clean variants.
- Keep it lightweight — don't pull in a heavy UI kit that fights the tokens.

---

## 13. Definition of Done (design QA checklist)

Before considering the UI complete, verify:
- [ ] One brand color + neutrals only; no stray gradients or rainbow accents.
- [ ] Type hierarchy is obvious; body text left-aligned; consistent font.
- [ ] All spacing pulled from the 4px scale; grid aligns; consistent gutters.
- [ ] Product cards match §7 spec; hover states smooth.
- [ ] Trust signals (COD, delivery, returns) visible on home, PDP, and checkout.
- [ ] lucide icons used, not emoji.
- [ ] Real seed copy/prices, formatted as ₹ with thousands separators and struck MRP + savings.
- [ ] Fully usable at 360px; sticky mobile Add-to-Cart; tap targets ≥44px.
- [ ] Visible focus rings; images have alt text; contrast passes.
- [ ] Lighthouse mobile performance is healthy (LCP good, no CLS from images).

---

### Reference storefronts (for structure/quality inspiration — build our own tokens, don't copy code verbatim)
- Next.js Commerce — [github.com/vercel/commerce](https://github.com/vercel/commerce)
- Medusa Next.js starter — [github.com/medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa)
- Saleor storefront — [github.com/saleor/storefront](https://github.com/saleor/storefront)
