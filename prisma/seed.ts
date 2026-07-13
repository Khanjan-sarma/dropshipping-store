/**
 * Database seed script.
 *
 * Product data comes from PRODUCTS_SEED.md. Prices are in PAISE (₹549 => 54900).
 * Images use labeled placeholders (placehold.co) so the store renders before
 * real photos exist — replace them from Admin → Products (Cloudinary upload)
 * or by editing the URLs below.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function placeholder(label: string): string {
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x800/f97316/ffffff?text=${text}`;
}

// --- Products (from PRODUCTS_SEED.md) ---------------------------------------
const products = [
  {
    slug: "portable-neck-fan",
    title: "Portable Rechargeable Neck Fan",
    category: "cooling",
    price: 54900,
    compareAt: 129900,
    costPrice: 16500,
    stock: 999,
    images: [placeholder("Neck Fan")],
    description:
      "Beat the heat hands-free. This lightweight, bladeless neck fan wraps comfortably around your neck and keeps cool air flowing for up to 4 hours on a single USB charge.\n\n• Up to 4 hours of cooling per charge\n• Bladeless & safe — no hair tangling\n• 3 speed settings, ultra-quiet motor\n• USB-C rechargeable, lightweight & travel-friendly\n\nPerfect for commutes, gaming marathons, outdoor work, and long summer days.",
    active: true,
  },
  {
    slug: "mini-usb-air-cooler",
    title: "Mini USB Personal Air Cooler",
    category: "cooling",
    price: 109900,
    compareAt: 199900,
    costPrice: 40000,
    stock: 999,
    images: [placeholder("Mini Cooler")],
    description:
      "Your personal cooling zone, anywhere. Fill the water tank, plug it in, and enjoy cool, misted air right at your desk, bedside, or study table.\n\n• Water-cooled misting for instant relief\n• USB powered — works with power banks & laptops\n• Multi-speed with 7-colour LED night light\n• Compact, quiet, and portable\n\nNote: this is a personal evaporative cooler for close-range cooling — not a replacement for an air conditioner.",
    active: true,
  },
  {
    slug: "fridge-organizer-bins-set",
    title: "Fridge Organizer Bins (Set of 4)",
    category: "kitchen",
    price: 99900,
    compareAt: 179900,
    costPrice: 30000,
    stock: 999,
    images: [placeholder("Fridge Bins")],
    description:
      "Turn your messy fridge into a satisfyingly organized space. This set of 4 clear, stackable bins with cut-out handles makes it easy to store fruits, veggies, drinks, and leftovers — and pull them out in one motion.\n\n• Set of 4 stackable, clear bins\n• Easy-grip handles, pull out in one motion\n• BPA-free, washable, food-safe\n• Works in fridge, pantry, bathroom & more",
    active: true,
  },
  {
    slug: "sensory-squeeze-toy",
    title: "Sensory Squeeze Stress Toy",
    category: "toys",
    price: 44900,
    compareAt: 99900,
    costPrice: 15000,
    stock: 999,
    images: [placeholder("Squeeze Toy")],
    description:
      "The oddly satisfying squeeze everyone's talking about. This super-soft sensory toy squishes, stretches, and slowly returns to shape — perfect for stress relief, focus, and fidgeting during study or gaming.\n\n• Ultra-satisfying slow-rise squish\n• Great for stress relief & focus\n• Soft, durable, and travel-sized\n• Fun gift for all ages (colour may vary)",
    active: true,
  },
  {
    slug: "summer-cooling-combo",
    title: "Summer Cooling Combo (Neck Fan + Mini Cooler)",
    category: "cooling",
    price: 139900,
    compareAt: 329800,
    costPrice: 56500,
    stock: 999,
    images: [placeholder("Cooling Combo")],
    description:
      "The ultimate personal cooling kit — get the Portable Neck Fan AND the Mini USB Air Cooler together and save big. Stay cool at your desk and on the move. Perfect gift for the summer.",
    active: true,
  },
];

// --- Coupons (from PRODUCTS_SEED.md) ----------------------------------------
// value for "flat" coupons is in PAISE; for "percent" it is a whole percentage.
const coupons = [
  {
    code: "MLBB10",
    type: "percent",
    value: 10,
    source: "influencer:mlbb_friend",
    active: true,
  },
  {
    code: "WELCOME50",
    type: "flat",
    value: 5000, // ₹50 in paise
    source: "site:welcome",
    active: true,
  },
  {
    code: "PREPAID5",
    type: "percent",
    value: 5,
    source: "site:prepaid_nudge",
    active: true,
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log("Seeding coupons...");
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        type: c.type,
        value: c.value,
        source: c.source,
        active: c.active,
      },
      create: c,
    });
  }

  // Seed an admin user from env if provided.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminEmail && adminHash) {
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminHash },
      create: { email: adminEmail, passwordHash: adminHash },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  } else if (adminEmail && process.env.ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash: hash },
      create: { email: adminEmail, passwordHash: hash },
    });
    console.log(`Admin user ready (hashed from ADMIN_PASSWORD): ${adminEmail}`);
  } else {
    console.log(
      "Skipping admin seed (set ADMIN_EMAIL + ADMIN_PASSWORD_HASH to create one).",
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
