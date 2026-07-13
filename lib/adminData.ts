import { prisma } from "@/lib/prisma";

// Shared server-side data helpers for the admin panel.

export async function getOrders(filter?: {
  paymentStatus?: string;
  fulfillmentStatus?: string;
  paymentMethod?: string;
}) {
  return prisma.order.findMany({
    where: {
      ...(filter?.paymentStatus ? { paymentStatus: filter.paymentStatus } : {}),
      ...(filter?.fulfillmentStatus
        ? { fulfillmentStatus: filter.fulfillmentStatus }
        : {}),
      ...(filter?.paymentMethod
        ? { paymentMethod: filter.paymentMethod }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, coupon: true },
  });
}

export type CouponReportRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  active: boolean;
  source: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  orderCount: number;
  paidOrderCount: number;
  totalRevenue: number; // paise, all attributed orders
  paidRevenue: number; // paise, only paid/delivered orders
};

/**
 * Per-code usage and revenue report for influencer attribution.
 * Counts orders attributed to each coupon and the revenue they drove.
 */
export async function getCouponReport(): Promise<CouponReportRow[]> {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: CouponReportRow[] = [];
  for (const c of coupons) {
    const orders = await prisma.order.findMany({
      where: { couponId: c.id },
      select: { total: true, paymentStatus: true },
    });
    const paidStatuses = new Set(["paid"]);
    let totalRevenue = 0;
    let paidRevenue = 0;
    let paidOrderCount = 0;
    for (const o of orders) {
      totalRevenue += o.total;
      // Count COD as realized revenue only when delivered? We treat "paid"
      // (prepaid captured) as confirmed revenue; COD is pending until delivered.
      if (paidStatuses.has(o.paymentStatus)) {
        paidRevenue += o.total;
        paidOrderCount += 1;
      }
    }
    rows.push({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      active: c.active,
      source: c.source,
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      createdAt: c.createdAt,
      orderCount: orders.length,
      paidOrderCount,
      totalRevenue,
      paidRevenue,
    });
  }
  return rows;
}
