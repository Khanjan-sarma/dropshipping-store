import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/requireAdmin";
import { rupeesToPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

// Prices arrive from the admin form in RUPEES and are stored in PAISE.
const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(5000),
  images: z.array(z.string().url()).default([]),
  priceRupees: z.number().nonnegative(),
  compareAtRupees: z.number().nonnegative().optional().nullable(),
  costPriceRupees: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(999),
  category: z.string().trim().min(1).max(60),
  active: z.boolean().default(true),
});

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        slug: d.slug,
        title: d.title,
        description: d.description,
        images: d.images,
        price: rupeesToPaise(d.priceRupees),
        compareAt:
          d.compareAtRupees != null ? rupeesToPaise(d.compareAtRupees) : null,
        costPrice: rupeesToPaise(d.costPriceRupees),
        stock: d.stock,
        category: d.category,
        active: d.active,
      },
    });
    return NextResponse.json({ product });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
