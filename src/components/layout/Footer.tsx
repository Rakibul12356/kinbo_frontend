"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  MessageCircle,
  MapPin,
  Phone,
  Play,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

const socialLinks: { label: string; href: string; icon: LucideIcon; className: string }[] = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: BriefcaseBusiness,
    className: "bg-[#0A66C2] text-white hover:bg-[#084e96]",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: ThumbsUp,
    className: "bg-[#1877F2] text-white hover:bg-[#1460c5]",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Camera,
    className: "bg-gradient-to-tr from-[#FF543E] via-[#C837AB] to-[#FFD521] text-white hover:opacity-90",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: Play,
    className: "bg-[#FF0000] text-white hover:bg-[#d40000]",
  },
];

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Return and Refund Policy", href: "/refund-policy" },
];

const services = [
  { label: "Express Home Delivery", href: "/products" },
  { label: "100% Genuine Guaranteed", href: "/products" },
  { label: "Easy Returns & Replacement", href: "/refund-policy" },
  { label: "Corporate & Bulk Orders", href: "/contact" },
  { label: "Gift Cards & Promotions", href: "/products" },
];

const usefulLinks = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Account", href: "/account" },
  { label: "Track My Order", href: "/orders" },
  { label: "Contact Us", href: "/contact" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xl font-medium text-[#1F2937] mb-6">{title}</h4>
      <ul className="space-y-3 text-sm text-zinc-700">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-[#006AFF] transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white text-zinc-700 text-sm">
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-8">
        <div className="space-y-12 sm:space-y-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <Link href="/" className="inline-flex items-center" aria-label="Kinbo home">
                  <Image
                    src="/images/logo-trimmed.png"
                    alt="Kinbo"
                    width={131}
                    height={36}
                    style={{ width: "auto" }}
                    className="h-8 sm:h-9 w-auto object-contain"
                    priority
                  />
                </Link>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xs">
                The Premier Multi-Category E-Commerce Platform for Bangladesh.
              </p>
            </div>

            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <BadgeCheck className="w-12 h-12 text-[#006AFF]" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xs">
                Authentic products sourced from verified manufacturers, distributors and
                importers.
              </p>
            </div>

            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <Users className="w-12 h-12 text-teal-700" strokeWidth={2} fill="currentColor" />
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xs">
                Our customers are at the heart of everything we do, with dedicated 24/7 care.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <LinkColumn title="Quick Links" links={quickLinks} />
            <LinkColumn title="Our Services" links={services} />
            <LinkColumn title="Useful Links" links={usefulLinks} />

            <div>

              <h4 className="text-xl font-medium text-[#1F2937] mb-6">Contact Info</h4>
              <div className="space-y-3 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>Hotline:</span>
                  <a
                    href="tel:09610016778"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                  >
                    09610016778
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>Whatsapp:</span>
                  <a
                    href="https://wa.me/8801810117100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                  >
                    01810117100
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Address: D/15-1, Road-36, Block-D, Section-10, Mirpur, Dhaka-1216
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#E5E7EB] text-center text-sm text-zinc-700">
          <p>© 2026 Kinbo Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
