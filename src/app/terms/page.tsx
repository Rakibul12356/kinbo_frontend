import type { Metadata } from "next";
import SiteContent from "@/components/layout/SiteContent";

export const metadata: Metadata = {
  title: "Terms of Service - Kinbo",
  description: "Terms that govern use of the Kinbo storefront and services.",
};

export default function TermsPage() {
  return (
    <SiteContent title="Terms of Service" subtitle="Last updated: November 2026">
      <p>
        By using Kinbo you agree to these terms. If you do not agree, please do
        not use the website or place orders.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure and for
        activity under your account. Provide accurate shipping and contact
        details so we can fulfill orders.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Orders & pricing</h2>
      <p>
        Product availability and prices may change. We may refuse or cancel an
        order for suspected fraud, pricing errors, or stock issues, and will
        notify you when that happens.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Prohibited use</h2>
      <p>
        Do not misuse the site, attempt unauthorized access, scrape content at
        scale, or interfere with other customers’ experience.
      </p>
      <h2 className="pt-2 text-base font-bold text-[#1F2937]">Liability</h2>
      <p>
        Kinbo is provided as-is for this demonstration storefront. Production
        warranties and liability limits will be finalized with legal counsel
        before a public launch.
      </p>
    </SiteContent>
  );
}
