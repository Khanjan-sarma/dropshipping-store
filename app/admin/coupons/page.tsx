import { getCouponReport } from "@/lib/adminData";
import { CouponManager } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const report = await getCouponReport();
  return <CouponManager coupons={report} />;
}
