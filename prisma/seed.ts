/**
 * Database seed script.
 *
 * IMPORTANT: The products below are PLACEHOLDERS. Replace them with your real
 * product details, prices (in paise), and Cloudinary image URLs before going
 * live. Run with:  npm run db:seed
 *
 * Prices are in PAISE: ₹999 => 99900.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Placeholder products (replace with real data) --------------------------
const products = [
  {
    slug: "portable-neck-fan",
    title: "Portable Bladeless Neck Fan (Rechargeable)",
    description:
      "Stay cool anywhere with this hands-free bladeless neck fan.\n\n• 3 speed settings\n• USB-C rechargeable, up to 8 hours\n• Bladeless & hair-safe design\n• Lightweight, wearable all day\n\nPerfect for commutes, outdoor work, travel and Indian summers.",
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800",
    ],
    price: 79900, // ₹799
    compareAt: 149900, // ₹1499
    costPrice: 35000, // ₹350
    category: "cooling",
    stock: 999,
  },
  {
    slug: "mini-usb-air-cooler",
    title: "Mini USB Air Cooler for Desk",
    description:
      "A compact personal air cooler for your desk or bedside.\n\n• Water-based cooling with ice tray\n• 3 fan speeds + 7-colour night light\n• USB powered — plug into laptop or power bank\n• Quiet operation\n\nGreat for study tables, work desks and small rooms.",
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800",
    ],
    price: 99900, // ₹999
    compareAt: 199900, // ₹1999
    costPrice: 45000,
    category: "cooling",
    stock: 999,
  },
  {
    slug: "kitchen-organizer-rack",
    title: "Multipurpose Kitchen Organizer Rack",
    description:
      "Declutter your kitchen with this sturdy multipurpose rack.\n\n• Rust-proof coated steel\n• Holds spices, bottles, utensils\n• Easy no-drill setup\n• Space-saving design\n\nKeeps your counter tidy and everything within reach.",
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
    ],
    price: 59900, // ₹599
    compareAt: 119900,
    costPrice: 25000,
    category: "kitchen",
    stock: 999,
  },
  {
    slug: "sensory-fidget-toy-set",
    title: "Sensory Fidget Toy Set (Pack of 6)",
    description:
      "A calming set of sensory fidget toys for kids and adults.\n\n• 6 different textures & mechanisms\n• Stress and anxiety relief\n• BPA-free, safe materials\n• Great gift idea\n\nHelps focus and relaxation, at home or on the go.",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800",
    ],
    price: 49900, // ₹499
    compareAt: 99900,
    costPrice: 18000,
    category: "toys",
    stock: 999,
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

  console.log("Seeding influencer coupon MLBB10...");
  await prisma.coupon.upsert({
    where: { code: "MLBB10" },
    update: {},
    create: {
      code: "MLBB10",
      type: "percent",
      value: 10, // 10% off
      active: true,
      source: "influencer:mlbb_friend",
    },
  });

  // Seed an admin user from env if provided and none exists yet.
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
    // Convenience: hash a plaintext ADMIN_PASSWORD if provided.
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
