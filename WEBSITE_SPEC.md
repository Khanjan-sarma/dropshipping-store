# Dropshipping Store — Website Build Specification

> **Purpose:** This document is the complete build specification for an India-focused dropshipping e-commerce website. Hand this file to Kiro IDE and ask it to build the project step by step. It contains the product vision, tech stack, data model, page-by-page requirements, Razorpay + COD payment flow, storage setup, and an ordered implementation task list.

---

## 1. Project Overview

**What we are building:** A direct-to-consumer online store selling trending gadgets and home products in India (neck fans, mini air coolers, kitchen organizers, sensory toys). Products are dropshipped — we do not hold inventory. When a customer orders, we forward the order to a supplier who ships directly to the customer.

**Business model context (drives design decisions):**
- **Market:** India only (domestic). No international shipping/customs.
- **Payments:** Razorpay (UPI, cards, netbanking) for prepaid **AND** Cash on Delivery (COD). COD is critical — 60–70% of Indian buyers prefer it.
- **Traffic source:** Instagram/Facebook reels and an influencer partner (gaming page). We must track which orders came from the influencer via **discount codes**.
- **Fulfillment:** Manual at first — admin sees order, forwards to supplier, ships via Shiprocket. The site does NOT need supplier auto-integration in v1.
- **Order verification:** Because COD has high return-to-origin (RTO), every COD order must be verifiable/confirmable (WhatsApp/phone). The site should capture a valid phone number and flag COD orders for confirmation.

**Success criteria for v1:**
1. A visitor can browse products, view a product page, add to cart, and check out.
2. Checkout supports both Razorpay prepaid and COD.
3. Prepaid payments are verified server-side (signature + webhook) before an order is marked paid.
4. Discount codes work and the order records which code was used (for influencer attribution).
5. An admin can log in and see all orders with customer details, items, payment status, and the discount code used.
6. Product images and data are stored and served reliably.

---

## 2. Tech Stack

Chosen for a single-developer build in Kiro IDE, one codebase, and easy Razorpay integration.

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14+ (App Router, TypeScript)** | Full-stack in one repo — React frontend + API routes for the server-side Razorpay logic. |
| Styling | **Tailwind CSS** | Fast, mobile-first (80%+ of traffic is mobile). |
| Database | **PostgreSQL via Prisma ORM** | Relational data (orders, products, coupons). Prisma gives type-safe queries. Use a hosted Postgres (Supabase / Neon / Railway). |
| Image storage | **Cloudinary** (or Supabase Storage) | Product images uploaded once, served via CDN with automatic resizing. Keeps images out of git. |
| Payments | **Razorpay** (Orders API + hosted Checkout + Webhooks) | Approved account already exists. |
| Auth (admin) | **NextAuth.js** (credentials) or a simple JWT-protected admin route | Only the store owner needs to log in. |
| Deployment | **Vercel** (frontend + API) + hosted Postgres | Simple, cheap, scales. |
| Notifications | **WhatsApp** via a click-to-chat link in admin (v1); optionally Interakt/Wati API later | For COD order confirmation. |

> **Note for Kiro:** Keep all secrets (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DATABASE_URL`, `CLOUDINARY_URL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_SECRET`) in `.env` and never commit them. Provide a `.env.example`.

---

## 3. Data Model (Prisma schema)

```prisma
model Product {
  id          String   @id @default(cuid())
  slug        String   @unique          // e.g. "mini-usb-air-cooler"
  title       String
  description String                     // long, sell-focused copy
  images      String[]                   // Cloudinary URLs, first = primary
  price       Int                        // selling price in paise (₹999 = 99900)
  compareAt   Int?                       // MRP / strike-through price in paise
  costPrice   Int                        // our supplier cost in paise (admin only, for margin)
  stock       Int      @default(999)     // soft stock; dropship so keep high
  category    String                     // "cooling" | "kitchen" | "toys" | ...
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  orderItems  OrderItem[]
}

model Coupon {
  id           String   @id @default(cuid())
  code         String   @unique          // e.g. "MLBB10"
  type         String                     // "percent" | "flat"
  value        Int                        // 10 (percent) or amount in paise (flat)
  active       Boolean  @default(true)
  source       String?                    // "influencer:mlbb_friend" for attribution
  maxUses      Int?                        // optional cap
  usedCount    Int      @default(0)
  createdAt    DateTime @default(now())
  orders       Order[]
}

model Order {
  id             String   @id @default(cuid())
  orderNumber    String   @unique          // human-friendly e.g. "SS-1042"
  customerName   String
  phone          String                    // Indian mobile, validated
  email          String?
  address1       String
  address2       String?
  city           String
  state          String
  pincode        String                    // 6-digit, validated
  items          OrderItem[]
  subtotal       Int                        // paise
  discount       Int      @default(0)       // paise
  shippingFee    Int      @default(0)       // paise
  total          Int                        // paise
  paymentMethod  String                     // "prepaid" | "cod"
  paymentStatus  String   @default("pending") // "pending" | "paid" | "failed" | "cod_pending"
  fulfillmentStatus String @default("new")    // "new" | "confirmed" | "shipped" | "delivered" | "rto" | "cancelled"
  razorpayOrderId   String?
  razorpayPaymentId String?
  couponId       String?
  coupon         Coupon?  @relation(fields: [couponId], references: [id])
  couponCode     String?                    // denormalized for easy reporting
  createdAt      DateTime @default(now())
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id])
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  title      String                          // snapshot of title at purchase time
  price      Int                             // snapshot of price (paise)
  quantity   Int
}

model AdminUser {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

**Why money is stored in paise (integers):** avoids floating-point rounding bugs. Convert to ₹ only for display (`amount / 100`).

---

## 4. Pages & Routes

### Public (storefront)
| Route | Description |
|-------|-------------|
| `/` | Home. Hero banner, featured products grid, trust badges (COD available, fast delivery, easy returns), category tiles. |
| `/products` | All products grid with category filter. |
| `/product/[slug]` | Product detail: image gallery, title, price + strike-through MRP, description, quantity selector, "Add to Cart" + "Buy Now". Show trust signals (COD, delivery time, secure payment). |
| `/cart` | Cart line items, quantity edit, coupon code input, order summary, "Proceed to Checkout". |
| `/checkout` | Address form (name, phone, email optional, address, city, state, pincode), payment method selector (Prepaid via Razorpay / COD), order summary, place order. |
| `/order/success?orderNumber=` | Thank-you page with order number and what happens next. |
| `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms` | Required policy pages (Razorpay & trust require these). |
| `/contact` | Contact info + WhatsApp click-to-chat button. |

### Admin (protected — login required)
| Route | Description |
|-------|-------------|
| `/admin/login` | Email + password login. |
| `/admin/orders` | Table of all orders: order number, date, customer, phone, total, payment method, payment status, fulfillment status, coupon code. Filter by status. Click row → detail. |
| `/admin/orders/[id]` | Full order detail. Show items, address, and a **"Confirm on WhatsApp"** click-to-chat link pre-filled with the order summary. Buttons to update fulfillment status. **"Copy address for supplier"** button. |
| `/admin/products` | List, create, edit, activate/deactivate products. Upload images to Cloudinary. |
| `/admin/coupons` | Create/manage discount codes; view usage count and orders per code (influencer attribution report). |

### API routes (server-side)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/checkout/create-order` | POST | Validates cart + coupon server-side (recompute totals — never trust client prices). If prepaid, creates a **Razorpay Order** and returns `razorpayOrderId` + `key_id`. Creates a local Order row with status `pending` (or `cod_pending` for COD). |
| `/api/checkout/verify` | POST | Receives `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. Verifies HMAC signature server-side. On success, marks order `paid`. |
| `/api/webhooks/razorpay` | POST | Verifies webhook signature with `RAZORPAY_WEBHOOK_SECRET`. Handles `payment.captured` / `payment.failed` for redundancy in case the browser closes before `/verify` runs. |
| `/api/coupons/validate` | POST | Validates a coupon code and returns discount for the cart. |
| `/api/admin/...` | * | CRUD for products, coupons, orders (protected). |

---

## 5. Razorpay Payment Flow (critical — implement exactly)

**Never create orders or verify payments on the client. Always recompute prices server-side.**

### Prepaid flow
1. Customer fills checkout and clicks "Pay".
2. Browser POSTs cart + address + coupon to `/api/checkout/create-order`.
3. Server: recomputes subtotal from DB prices, applies coupon, computes total. Creates a local `Order` (status `pending`). Calls Razorpay **Orders API** to create a Razorpay order for `total` (in paise). Returns `{ razorpayOrderId, keyId, orderNumber }`.
4. Browser opens **Razorpay Checkout** modal with `razorpayOrderId` and `keyId` (public key only).
5. Customer pays inside the Razorpay modal.
6. On success, Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to the browser handler.
7. Browser POSTs these to `/api/checkout/verify`.
8. Server verifies the signature:
   `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET) === razorpay_signature`.
   If valid → mark order `paid`, store `razorpayPaymentId`, increment coupon `usedCount`, redirect to success page.
9. **Redundancy:** Razorpay also fires a webhook to `/api/webhooks/razorpay`. Verify its signature with `RAZORPAY_WEBHOOK_SECRET`; if `payment.captured` and the order isn't already `paid`, mark it paid. (This protects against the customer closing the tab before step 7.)

> Signature verification and the server-first order creation are the security-critical steps — do not skip them. (Flow verified against current Razorpay Node.js integration docs; content rephrased for compliance.)

### COD flow
1. Same as steps 1–3 but `paymentMethod = "cod"`; no Razorpay order is created.
2. Server creates the local order with `paymentStatus = "cod_pending"` and `fulfillmentStatus = "new"`.
3. Redirect straight to success page.
4. In admin, COD orders are flagged for **WhatsApp confirmation** before shipping (to reduce RTO). Optionally offer a small prepaid discount to nudge customers toward prepaid.

### Environment variables
```
DATABASE_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_URL=
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
NEXT_PUBLIC_SITE_URL=
```

---

## 6. Storage (product images)

- Admin uploads product images from `/admin/products`. Backend uploads to **Cloudinary** and stores the returned secure URLs in `Product.images`.
- Serve images via Cloudinary transformation URLs (auto format/quality, resized for grid vs. detail). This keeps the site fast on mobile.
- Alternative if avoiding Cloudinary: **Supabase Storage** bucket `product-images` (public read). Store public URLs the same way.
- Do **not** commit images to the repo.

---

## 7. Discount Code / Influencer Attribution

This is how we measure the gaming-influencer partnership:
- Create a coupon like `MLBB10` (10% off) with `source = "influencer:mlbb_friend"`.
- The influencer shares the code in reels/bio.
- When used at checkout, the order stores `couponCode` and links `couponId`.
- `/admin/coupons` shows **uses and total revenue per code** → tells us exactly how many sales the influencer drove and what commission to pay (e.g., ₹50/sale).
- Also support UTM capture: read `?ref=` / `utm_source` on landing, store in a cookie, and save on the order for a second attribution signal.

---

## 8. Key Non-Functional Requirements

- **Mobile-first & fast:** most traffic is Instagram mobile. Optimize images, lazy-load, keep LCP low.
- **Trust signals everywhere:** "Cash on Delivery available", "Free/Fast Delivery 3–5 days", "Easy Returns", secure-payment badge, real product reviews section (can be static/manual in v1).
- **Indian validation:** phone = 10-digit starting 6–9; pincode = 6 digits. Show ₹ with proper formatting.
- **Server-authoritative pricing:** totals, discounts, and shipping are always recomputed on the server. Never trust amounts sent by the browser.
- **Idempotent payment marking:** `/verify` and the webhook must not double-process an order.
- **Policy pages present:** shipping, returns, privacy, terms (needed for Razorpay and buyer trust).
- **Accessibility & SEO basics:** semantic HTML, meta tags, product `og:image` for nice link previews when shared.

---

## 9. Suggested Project Structure

```
/app
  /(store)
    page.tsx                      # home
    /products/page.tsx
    /product/[slug]/page.tsx
    /cart/page.tsx
    /checkout/page.tsx
    /order/success/page.tsx
    /policies/*/page.tsx
    /contact/page.tsx
  /admin
    /login/page.tsx
    /orders/page.tsx
    /orders/[id]/page.tsx
    /products/page.tsx
    /coupons/page.tsx
  /api
    /checkout/create-order/route.ts
    /checkout/verify/route.ts
    /webhooks/razorpay/route.ts
    /coupons/validate/route.ts
    /admin/**/route.ts
/lib
  razorpay.ts                     # server Razorpay client + signature verify helpers
  prisma.ts                       # Prisma client singleton
  cloudinary.ts
  cart.ts                         # cart context / logic
  money.ts                        # paise <-> rupee helpers, INR formatting
  validation.ts                   # phone, pincode zod schemas
/components
  ProductCard, Gallery, CartDrawer, CheckoutForm, PaymentButtons, AdminTable, ...
/prisma
  schema.prisma
.env.example
```

---

## 10. Implementation Task List (build in this order)

1. **Scaffold** Next.js + TypeScript + Tailwind. Set up `.env.example`, Prisma, Postgres connection.
2. **Data layer:** add the Prisma schema (section 3), run migration, add seed script with the 3–4 real products (neck fan, mini cooler, kitchen organizer, sensory toy) and one coupon `MLBB10`.
3. **Storefront UI:** home, product grid, product detail, cart (with coupon field). Mobile-first Tailwind.
4. **Cart & coupon logic:** client cart state + `/api/coupons/validate`.
5. **Checkout page:** address form with Indian validation + payment method selector.
6. **Razorpay server integration:** `/api/checkout/create-order` (server-side price recompute + Razorpay order), `/api/checkout/verify` (signature verify), `/api/webhooks/razorpay` (webhook verify + redundancy). Wire up Razorpay Checkout modal on the frontend.
7. **COD path:** create order without Razorpay; success page.
8. **Order success page** + order confirmation.
9. **Admin auth** (NextAuth credentials or JWT).
10. **Admin orders** list + detail (WhatsApp confirm link, copy-address-for-supplier, status updates).
11. **Admin products** CRUD + Cloudinary image upload.
12. **Admin coupons** CRUD + per-code usage/revenue report (influencer attribution).
13. **Policy pages, contact page, trust badges, SEO meta/OG tags.**
14. **Polish:** loading states, empty states, error handling, idempotency checks on payment marking.
15. **Deploy** to Vercel + hosted Postgres; set live Razorpay keys and webhook URL in the dashboard.

---

## 11. Out of Scope for v1 (future)

- Automatic supplier order forwarding (Baapstore/CJ/IndiaMART API).
- Shiprocket API auto-shipping label generation (do manually in v1).
- Customer accounts/login (guest checkout only in v1).
- Automated WhatsApp API (use click-to-chat link in v1).
- Product reviews with user submissions (static/manual in v1).

---

### Handoff note for Kiro IDE
Build the project following section 10 in order. Prioritize the checkout + Razorpay flow correctness (section 5) and always recompute prices server-side. After each major step, run the app and verify the happy path before moving on. Ask me for the actual product details, prices, images, and Razorpay keys when you reach the seed and env steps.
