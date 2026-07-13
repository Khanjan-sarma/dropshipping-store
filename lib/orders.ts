import { prisma } from "@/lib/prisma";

/**
 * Idempotently mark an order as paid.
 *
 * Uses a conditional updateMany (paymentStatus != "paid") so that concurrent
 * calls from /verify and the webhook cannot double-process:
 * only the first call that flips the status will also increment the coupon.
 *
 * @returns true if THIS call transitioned the order to paid, false if it was
 *          already paid (or not found).
 */
export async function markOrderPaid(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<{ transitioned: boolean; orderNumber?: string }> {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: params.razorpayOrderId },
    select: { id: true, orderNumber: true, couponId: true },
  });
  if (!order) return { transitioned: false };

  return prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "paid" } },
      data: {
        paymentStatus: "paid",
        razorpayPaymentId: params.razorpayPaymentId,
        fulfillmentStatus: "confirmed",
      },
    });

    const transitioned = result.count > 0;

    // Only increment coupon usage on the first successful transition.
    if (transitioned && order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return { transitioned, orderNumber: order.orderNumber };
  });
}

export async function markOrderFailed(razorpayOrderId: string): Promise<void> {
  await prisma.order.updateMany({
    where: { razorpayOrderId, paymentStatus: { notIn: ["paid"] } },
    data: { paymentStatus: "failed" },
  });
}
