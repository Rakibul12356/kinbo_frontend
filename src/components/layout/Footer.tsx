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
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

const socialLinks: {
  label: string;
  href: string;
  icon: LucideIcon;
  className: string;
}[] = [
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
    className:
      "bg-gradient-to-tr from-[#FF543E] via-[#C837AB] to-[#FFD521] text-white hover:opacity-90",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: Play,
    className: "bg-[#FF0000] text-white hover:bg-[#d40000]",
  },
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
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="hover:text-[#006AFF] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const t = useT();

  const quickLinks: { labelKey: MessageKey; href: string }[] = [
    { labelKey: "footer.about", href: "/about" },
    { labelKey: "footer.careers", href: "/careers" },
    { labelKey: "footer.privacy", href: "/privacy" },
    { labelKey: "footer.terms", href: "/terms" },
    { labelKey: "footer.refund", href: "/refund-policy" },
  ];

  const services: { labelKey: MessageKey; href: string }[] = [
    { labelKey: "footer.express", href: "/products" },
    { labelKey: "footer.genuine", href: "/products" },
    { labelKey: "footer.returns", href: "/refund-policy" },
    { labelKey: "footer.corporate", href: "/contact" },
    { labelKey: "footer.gifts", href: "/products" },
  ];

  const usefulLinks: { labelKey: MessageKey; href: string }[] = [
    { labelKey: "footer.faq", href: "/faq" },
    { labelKey: "footer.account", href: "/account" },
    { labelKey: "footer.track", href: "/orders" },
    { labelKey: "footer.contactUs", href: "/contact" },
  ];

  return (
    <footer className="border-t border-[#E5E7EB] bg-white text-zinc-700 text-sm">
      <div className="mx-auto w-full container px-4 sm:px-6 pt-12 sm:pt-14 pb-8">
        <div className="space-y-12 sm:space-y-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center"
                  aria-label={t("nav.home")}
                >
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
                {t("footer.tagline")}
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${s.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <BadgeCheck
                  className="w-12 h-12 text-[#006AFF]"
                  strokeWidth={1.75}
                />
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xs">
                {t("footer.authentic")}
              </p>
            </div>

            <div className="space-y-5">
              <div className="h-12 flex items-center">
                <Users
                  className="w-12 h-12 text-teal-700"
                  strokeWidth={2}
                  fill="currentColor"
                />
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-w-xs">
                {t("footer.customers")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <LinkColumn
              title={t("footer.quickLinks")}
              links={quickLinks.map((l) => ({
                label: t(l.labelKey),
                href: l.href,
              }))}
            />
            <LinkColumn
              title={t("footer.services")}
              links={services.map((l) => ({
                label: t(l.labelKey),
                href: l.href,
              }))}
            />
            <LinkColumn
              title={t("footer.usefulLinks")}
              links={usefulLinks.map((l) => ({
                label: t(l.labelKey),
                href: l.href,
              }))}
            />

            <div>
              <h4 className="text-xl font-medium text-[#1F2937] mb-6">
                {t("footer.contact")}
              </h4>
              <div className="space-y-3 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>{t("footer.hotline")}</span>
                  <a
                    href="tel:09610016778"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                  >
                    09610016778
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>{t("footer.whatsapp")}</span>
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
                  <span className="leading-snug">{t("footer.address")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-[#E5E7EB] text-center text-sm text-zinc-700">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
