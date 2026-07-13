import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  const wa = siteConfig.whatsappNumber;
  const waLink = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent("Hi ShopSprint, I have a question about")}`
    : null;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-2 text-gray-600">
          We&apos;re here to help with orders, delivery and returns.
        </p>

        <div className="mt-8 space-y-4">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full bg-green-600 text-white hover:bg-green-700"
            >
              Chat with us on WhatsApp
            </a>
          )}
          <a href={`mailto:${siteConfig.supportEmail}`} className="btn-secondary w-full">
            Email {siteConfig.supportEmail}
          </a>
        </div>

        <div className="mt-8 rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-900">Support hours:</span>{" "}
            Mon–Sat, 10am–7pm IST
          </p>
          <p className="mt-2">
            For order queries, please keep your order number (e.g. SS-1042)
            handy.
          </p>
        </div>
      </div>
    </div>
  );
}
