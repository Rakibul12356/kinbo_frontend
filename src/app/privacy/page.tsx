import type { Metadata } from "next";
import SiteContent from "@/components/layout/SiteContent";

export const metadata: Metadata = {
  title: "Privacy Policy - Kinbo",
  description: "How Kinbo collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <SiteContent
      title="Privacy Policy"
      subtitle="Last updated: November 2026"
    >
      <p>
        Kinbo (“we”, “us”) respects your privacy. This policy explains what data we
        collect when you browse, create an account, or place an order, and how we
        use it.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Information we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account details: name, email, phone number</li>
        <li>Order and shipping details needed to fulfill purchases</li>
        <li>Support messages you send through Contact</li>
        <li>Basic device and usage data to improve the storefront</li>
      </ul>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">How we use information</h2>
      <p>
        We use your information to process orders, provide customer support, send
        order updates, prevent fraud, and improve product recommendations. We do
        not sell personal data.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Storage</h2>
      <p>
        This demo store currently keeps some data in your browser (localStorage)
        until a production backend is connected. Production deployments will store
        data on secured servers with access controls.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Contact</h2>
      <p>
        For privacy questions email{" "}
        <a href="mailto:support@kinbo.com" className="font-semibold text-[#082F6B] hover:underline">
          support@kinbo.com
        </a>
        .
      </p>
    </SiteContent>
  );
}
