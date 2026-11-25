"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import SiteContent from "@/components/layout/SiteContent";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Most Dhaka orders arrive within 12–48 hours. Outside Dhaka, delivery usually takes 2–5 business days depending on the courier zone.",
  },
  {
    q: "What payment methods do you accept?",
    a: "You can place orders with Cash on Delivery. Online wallets and cards will be enabled as payment integrations go live.",
  },
  {
    q: "Can I cancel or return an order?",
    a: "Yes. Cancel before the order is shipped from the order details page (when available). Returns follow our Refund Policy for eligible items within the stated window.",
  },
  {
    q: "How do I track my order?",
    a: "Go to Orders from the navbar or account menu. Open an order to see its status timeline and delivery address.",
  },
  {
    q: "How do I contact support?",
    a: "Use the Contact page to submit a support request or complaint. Our team reviews tickets from the admin Reports page.",
  },
  {
    q: "I forgot my password. What now?",
    a: "Use Forgot password on the login screen. We will send a reset link to your email (mocked locally until the backend email service is connected).",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SiteContent title="FAQ" subtitle="Quick answers about shopping, delivery, and your Kinbo account.">
      <div className="space-y-2">
        {FAQS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.q} className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-[#1F2937]">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-zinc-400 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-zinc-600">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SiteContent>
  );
}
