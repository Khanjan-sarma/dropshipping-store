import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

type Policy = { title: string; body: string[] };

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      "We ship across India (domestic only). Orders are processed within 1–2 business days after confirmation.",
      "Estimated delivery time is 3–5 business days for most pincodes. Remote locations may take slightly longer.",
      "Cash on Delivery (COD) is available on eligible orders. Our team may contact you to confirm COD orders before dispatch.",
      "You will receive tracking details once your order ships. For any delay, reach us via the Contact page.",
    ],
  },
  returns: {
    title: "Returns & Refunds Policy",
    body: [
      "We want you to love your purchase. If a product arrives damaged, defective, or incorrect, contact us within 7 days of delivery.",
      "To be eligible for a return, the item must be unused and in its original packaging.",
      "Once your return is received and inspected, approved refunds are processed to the original payment method within 5–7 business days. For COD orders, refunds are issued via UPI/bank transfer.",
      "Certain items may be non-returnable for hygiene or safety reasons; this will be noted on the product page.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only the information needed to process and deliver your order: name, phone number, email (optional), and shipping address.",
      "Your payment is processed securely by Razorpay. We do not store your card or UPI details on our servers.",
      "We do not sell your personal information. We may share your address and contact details with our shipping and fulfillment partners solely to deliver your order.",
      "You can request access to or deletion of your data by contacting us.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "By placing an order, you agree to provide accurate contact and delivery information.",
      "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.",
      "We reserve the right to cancel orders in cases of suspected fraud, pricing errors, or unavailability. Any amount paid for a cancelled order is refunded in full.",
      "Discount codes are subject to their individual terms and may be withdrawn at any time.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const policy = POLICIES[params.slug];
  return { title: policy ? policy.title : "Policy" };
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{policy.title}</h1>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
          {policy.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="mt-8 text-xs text-gray-400">
          Questions? Reach us at {siteConfig.supportEmail} or via the Contact
          page.
        </p>
      </div>
    </div>
  );
}
