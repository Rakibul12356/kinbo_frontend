"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, categoryListingHref } from "@/lib/categories";

const SHORT_LABELS: Record<string, string> = {
  "Fashion & Clothing": "Fashion",
  "Electronics & Gadgets": "Electronics",
  "Beauty & Personal Care": "Beauty",
  "Home & Kitchen": "Home",
  "Grocery & Food": "Grocery",
  "Baby, Kids & Toys": "Kids & Toys",
  "Books, Stationery & Office Supplies": "Books",
  "Sports, Fitness & Outdoor": "Sports",
  "Watches, Jewelry & Accessories": "Watches",
  "Home Appliances & Furniture": "Appliances",
};

const ITEMS = CATEGORIES.map((category) => ({
  id: category.slug,
  label: SHORT_LABELS[category.name] ?? category.name,
  href: categoryListingHref(category.slug),
}));

const PAGE_SIZE = 5;

export default function CategoryExpandSlider() {
  const [active, setActive] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageCount = Math.max(1, Math.ceil(ITEMS.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = ITEMS.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setActive(null);
  }, [page]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const goPage = (next: number) => {
    setPage(((next % pageCount) + pageCount) % pageCount);
  };

  const onEnter = (index: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActive(index);
  };

  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setActive(null), 180);
  };

  return (
    <section className="bg-white border-b border-[#E5E7EB] py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2937]">
            Shop By Category
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goPage(page - 1)}
              aria-label="Previous categories"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#082F6B]/25 text-[#082F6B] transition hover:bg-[#F3F7FC] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goPage(page + 1)}
              aria-label="Next categories"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#082F6B]/25 text-[#082F6B] transition hover:bg-[#F3F7FC] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="flex h-72 sm:h-80 lg:h-[22rem] gap-3 sm:gap-4"
          onMouseLeave={onLeave}
        >
          {visible.map((item, i) => {
            const index = start + i;
            const expanded = active === index;

            return (
              <Link
                key={item.id}
                href={item.href}
                onMouseEnter={() => onEnter(index)}
                onFocus={() => onEnter(index)}
                aria-label={item.label}
                className={`group relative flex h-full flex-1 items-center justify-center overflow-hidden rounded-2xl px-4 transition-all duration-500 ease-out ${
                  expanded
                    ? "flex-[3.4] bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20"
                    : "bg-[#082F6B] text-white hover:bg-[#0a3a82]"
                }`}
              >
                <span
                  className={`whitespace-nowrap text-base sm:text-lg font-semibold tracking-wide transition-all duration-500 ${
                    expanded
                      ? "rotate-0"
                      : "[writing-mode:vertical-rl] rotate-180"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Category page ${i + 1}`}
              aria-current={i === page}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === page ? "w-7 bg-[#FF6B00]" : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
