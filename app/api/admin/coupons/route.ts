import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/requireAdmin";
import { rupeesToPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

// For "flat" coupons the value arrives in RUPEES and is stored in PAISE.
// For "percent" coupons the value is a whole-number percentage.
const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Code: letters, numbers, - and _ only"),
    type: z.enum(["percent", "flat"]),
    value: z.number().positive(),
    active: z.boolean().default(true),
    source: z.string().trim().max(120).optional().or(z.literal("")),
    maxUses: z.number().int().positive().optional().nullable(),
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, {
    message: "Percent value cannot exceed 100",
    path: ["value"],
  });

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
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
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: d.code.toUpperCase(),
        type: d.type,
        value: d.type === "flat" ? rupeesToPaise(d.value) : Math.round(d.value),
        active: d.active,
        source: d.source || null,
        maxUses: d.maxUses ?? null,
      },
    });
    return NextResponse.json({ coupon });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists." },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Could not create coupon." }, { status: 500 });
  }
}
