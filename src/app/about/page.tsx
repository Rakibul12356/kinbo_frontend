import type { Metadata } from "next";
import SiteContent from "@/components/layout/SiteContent";

export const metadata: Metadata = {
  title: "About Us - Kinbo",
  description: "Learn about Kinbo — premium shopping for Bangladesh.",
};

export default function AboutPage() {
  return (
    <SiteContent
      title="About Kinbo"
      subtitle="Premium electronics, fashion, and essentials — delivered with care."
    >
      <p>
        Kinbo is a Bangladesh-focused ecommerce storefront built for trusted brands,
        fast delivery, and a simple checkout experience. We started with a simple
        idea: shoppers deserve clear prices, genuine products, and support that
        actually replies.
      </p>
      <p>
        From phones and gadgets to fashion and home essentials, our catalog is
        curated for everyday needs. Behind the scenes our team manages inventory,
        orders, and customer care so you can buy with confidence.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">What we stand for</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Authentic products from verified suppliers</li>
        <li>Transparent pricing with clear delivery windows</li>
        <li>Human support for orders, returns, and complaints</li>
      </ul>
      <p>
        Questions? Reach us anytime via{" "}
        <a href="/contact" className="font-semibold text-[#082F6B] hover:underline">
          Contact & Support
        </a>
        .
      </p>
    </SiteContent>
  );
}
