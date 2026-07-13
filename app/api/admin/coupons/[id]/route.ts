import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
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
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }
}
