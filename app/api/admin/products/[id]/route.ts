import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/requireAdmin";
import { rupeesToPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  images: z.array(z.string().url()).optional(),
  priceRupees: z.number().nonnegative().optional(),
  compareAtRupees: z.number().nonnegative().nullable().optional(),
  costPriceRupees: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  category: z.string().trim().min(1).max(60).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.title !== undefined) data.title = d.title;
  if (d.description !== undefined) data.description = d.description;
  if (d.images !== undefined) data.images = d.images;
  if (d.priceRupees !== undefined) data.price = rupeesToPaise(d.priceRupees);
  if (d.compareAtRupees !== undefined)
    data.compareAt =
      d.compareAtRupees === null ? null : rupeesToPaise(d.compareAtRupees);
  if (d.costPriceRupees !== undefined)
    data.costPrice = rupeesToPaise(d.costPriceRupees);
  if (d.stock !== undefined) data.stock = d.stock;
  if (d.category !== undefined) data.category = d.category;
  if (d.active !== undefined) data.active = d.active;

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ product });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // If the product has orders, deactivate instead of hard-deleting to keep
    // order history intact.
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });
    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { active: false },
      });
      return NextResponse.json({ success: true, deactivated: true });
    }
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, deactivated: false });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}
