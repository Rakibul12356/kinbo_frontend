"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

interface HeroBannerProps {
  onExploreClick?: () => void;
}

const SLIDE_META = [
  {
    id: "lifestyle",
    eyebrow: "hero.slide1.eyebrow",
    title: "hero.slide1.title",
    subtitle: "hero.slide1.subtitle",
    ctaLabel: "hero.slide1.cta",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=80",
  },
  {
    id: "tech",
    eyebrow: "hero.slide2.eyebrow",
    title: "hero.slide2.title",
    subtitle: "hero.slide2.subtitle",
    ctaLabel: "hero.slide2.cta",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&auto=format&fit=crop&q=80",
  },
  {
    id: "deals",
    eyebrow: "hero.slide3.eyebrow",
    title: "hero.slide3.title",
    subtitle: "hero.slide3.subtitle",
    ctaLabel: "hero.slide3.cta",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&auto=format&fit=crop&q=80",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  eyebrow: MessageKey;
  title: MessageKey;
  subtitle: MessageKey;
  ctaLabel: MessageKey;
  image: string;
}>;

export default function HeroBanner({ onExploreClick }: HeroBannerProps) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDE_META.length;
  const slide = SLIDE_META[index];

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(timer);
  }, [paused, count]);

  const handleCta = () => {
    if (onExploreClick) onExploreClick();
  };

  return (
    <section className="relative border-b border-[#E5E7EB]">
      <div
        className="relative h-[min(78vh,640px)] sm:h-[min(82vh,700px)] overflow-hidden bg-[#061628]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {SLIDE_META.map((item, i) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={item.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-6500 ease-out ${
                i === index ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#04101f]/95 via-[#061628]/75 to-[#061628]/25" />
            <div className="absolute inset-0 bg-linear-to-t from-[#04101f]/70 via-transparent to-[#04101f]/30" />
          </div>
        ))}

        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-xl space-y-5 sm:space-y-6 text-white">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#FF6B00]" aria-hidden />
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                  {t(slide.eyebrow)}
                </p>
              </div>

              <h1
                key={slide.id}
                className="text-3xl sm:text-5xl lg:text-[3.35rem] font-black tracking-tight leading-[1.08] animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {t(slide.title)}
              </h1>

              <p
                key={`${slide.id}-sub`}
                className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md animate-in fade-in duration-500"
              >
                {t(slide.subtitle)}
              </p>

              <div className="pt-1">
                {slide.id === "deals" ? (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#e86000] px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B00]/25 transition transform hover:-translate-y-0.5"
                  >
                    <span>{t(slide.ctaLabel)}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCta}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#e86000] px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B00]/25 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t(slide.ctaLabel)}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label={t("hero.prev")}
          className="absolute start-3 sm:start-5 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label={t("hero.next")}
          className="absolute end-3 sm:end-5 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {SLIDE_META.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === index ? "w-8 bg-[#FF6B00]" : "w-5 bg-white/40 hover:bg-white/65"
              }`}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-6 end-5 sm:end-8 z-20 hidden sm:flex flex-col items-center gap-2 text-white/55">
          <span className="text-[10px] font-semibold tracking-[0.28em] uppercase [writing-mode:vertical-rl] rotate-180">
            {t("hero.scroll")}
          </span>
          <span className="h-10 w-px bg-white/35" aria-hidden />
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#082F6B]/10 flex items-center justify-center text-[#082F6B] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  {t("trust.delivery.title")}
                </h4>
                <p className="text-xs text-zinc-500">{t("trust.delivery.body")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  {t("trust.authentic.title")}
                </h4>
                <p className="text-xs text-zinc-500">{t("trust.authentic.body")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  {t("trust.support.title")}
                </h4>
                <p className="text-xs text-zinc-500">{t("trust.support.body")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
