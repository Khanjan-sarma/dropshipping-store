import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  fulfillmentStatus: z
    .enum(["new", "confirmed", "shipped", "delivered", "rto", "cancelled"])
    .optional(),
  paymentStatus: z
    .enum(["pending", "paid", "failed", "cod_pending"])
    .optional(),
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
