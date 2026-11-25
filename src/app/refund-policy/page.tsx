import type { Metadata } from "next";
import SiteContent from "@/components/layout/SiteContent";

export const metadata: Metadata = {
  title: "Refund Policy - Kinbo",
  description: "Kinbo return and refund guidelines for eligible products.",
};

export default function RefundPolicyPage() {
  return (
    <SiteContent title="Refund Policy" subtitle="Last updated: November 2026">
      <p>
        We want you to be happy with every purchase. If something is wrong with
        your order, contact support promptly so we can help.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Eligibility</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Request within 7 days of delivery for most eligible items</li>
        <li>Item unused, in original packaging, with proof of purchase</li>
        <li>Damaged or incorrect items should be reported within 48 hours</li>
      </ul>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Non-returnable</h2>
      <p>
        Personal care sealed goods, perishable grocery items, and digital
        vouchers are generally non-returnable unless defective on arrival.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Refund process</h2>
      <p>
        Approved refunds are processed to the original payment method or as store
        credit. Cash-on-delivery refunds may be issued via bank transfer or
        mobile wallet after verification.
      </p>
      <p>
        Start a return from{" "}
        <a href="/contact" className="font-semibold text-[#082F6B] hover:underline">
          Contact
        </a>{" "}
        with your order ID and photos if the item is damaged.
      </p>
    </SiteContent>
  );
}
