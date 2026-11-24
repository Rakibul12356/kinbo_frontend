"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/hooks/use-cart";
import { useIsClient } from "@/hooks/use-is-client";
import { useReviews } from "@/hooks/use-reviews";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { categoryListingHref, slugify } from "@/lib/categories";
import {
  Star,
  ShoppingCart,
  Check,
  Rocket,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, isInCart } = useCart();
  const isClient = useIsClient();
  const reviews = useReviews();
  const [activeIndex, setActiveIndex] = useState(0);
  const isAdded = isClient && isInCart(product.id);
  const approvedReviews = useMemo(
    () =>
      reviews.filter((r) => r.productId === product.id && r.status === "approved"),
    [reviews, product.id]
  );

  const images = product.images.length > 0 ? product.images : ["/images/logo.png"];
  const activeImage = images[Math.min(activeIndex, images.length - 1)];
  const discountPercent = calculateDiscount(product.price, product.originalPrice);

  const categoryHref = categoryListingHref(slugify(product.category));
  const aboutPoints = [
    product.description,
    product.stock > 0 ? "In stock and ready for express delivery." : "Currently out of stock.",
    product.deliveryTime
      ? `Estimated delivery: ${product.deliveryTime}.`
      : "Estimated delivery: 12-24 HOURS.",
    product.tags && product.tags.length > 0
      ? `Tags: ${product.tags.slice(0, 4).join(", ")}.`
      : null,
  ].filter(Boolean) as string[];

  const handleAddToCart = () => addToCart(product, 1);

  return (
    <div className="space-y-5 sm:space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-[#082F6B] transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href="/products" className="hover:text-[#082F6B] transition">
          Products
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={categoryHref} className="hover:text-[#082F6B] transition">
          {product.category}
        </Link>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-zinc-500">{product.subcategory}</span>
          </>
        )}
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="font-semibold text-[#1F2937] line-clamp-1 max-w-[14rem] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-5 lg:gap-6 lg:items-stretch">
        {/* Gallery matches purchase panel height; image fills leftover space */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-3 sm:p-4 h-full min-h-0 flex flex-col">
          <div className="flex flex-1 min-h-0 flex-col gap-3">
            <div className="relative w-full flex-1 min-h-56 sm:min-h-64 rounded-xl bg-[#F8FAFC] overflow-hidden border border-[#E5E7EB]">
              <img
                src={activeImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 z-10">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#ECEFF3] px-2 py-1 text-[11px] font-bold tracking-wide text-[#1E293B]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1E293B] text-amber-400">
                    <Rocket className="w-2.5 h-2.5 fill-amber-400" />
                  </span>
                  <span>{product.deliveryTime || "12-24 HOURS"}</span>
                </div>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto shrink-0">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                      activeIndex === i
                        ? "border-[#082F6B]"
                        : "border-[#E5E7EB] hover:border-[#082F6B]/40"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Purchase panel */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden flex flex-col h-full">
          <div className="flex-1 p-4 sm:p-5 space-y-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] leading-snug">
              {product.name}
            </h1>

            <Link
              href={categoryHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#082F6B] hover:text-[#FF6B00] transition"
            >
              <span>{product.category}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-[#1F2937]">{product.rating.toFixed(2)}/5</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-zinc-200 fill-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#082F6B] font-medium">
                ({product.reviewCount}) Ratings
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold ${
                product.stock > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              <Check className="w-4 h-4" strokeWidth={3} />
              <span>{product.stock > 0 ? "Stock: Available" : "Stock: Out of stock"}</span>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  {product.unit && (
                    <p className="text-xs font-medium text-zinc-500">{product.unit}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#1F2937]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-zinc-400 line-through font-medium">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-black tracking-wide text-rose-600">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAdded
                      ? "bg-[#062452] text-white"
                      : "bg-[#082F6B] text-white hover:bg-[#062452]"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={3} />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add To Cart
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] p-3.5 sm:p-4">
              <h2 className="text-sm font-bold text-[#1F2937] mb-2">About this item</h2>
              <ul className="space-y-2">
                {aboutPoints.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-zinc-600 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#082F6B]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Description */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 text-[#082F6B]">
            <FileText className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-bold">Product Description</h2>
          </div>
        </div>

        <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-[#1F2937] mb-1.5">What is it</h3>
            <p>{product.description}</p>
          </div>

          <div>
            <h3 className="font-bold text-[#1F2937] mb-1.5">Key Features</h3>
            <ul className="space-y-1.5">
              <li>• Category: {product.category}{product.subcategory ? ` / ${product.subcategory}` : ""}</li>
              <li>• Rated {product.rating.toFixed(1)}/5 from {product.reviewCount} reviews</li>
              {product.deliveryTime && <li>• Delivery window: {product.deliveryTime}</li>}
              {product.tags?.slice(0, 5).map((tag) => (
                <li key={tag}>• {tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-3 text-[#082F6B]">
          <Star className="h-5 w-5" />
          <h2 className="text-base font-bold sm:text-lg">Customer reviews</h2>
          <span className="text-xs font-semibold text-zinc-400">
            ({approvedReviews.length})
          </span>
        </div>
        {approvedReviews.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No approved reviews yet. Reviews appear here after admin accepts them.
          </p>
        ) : (
          <ul className="space-y-4">
            {approvedReviews.map((review) => (
              <li key={review.id} className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#1F2937]">{review.userName}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{review.comment}</p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
