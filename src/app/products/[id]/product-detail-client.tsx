"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useProduct } from "@/hooks/use-products";
import { useProductReviews } from "@/hooks/use-reviews";
import {
  useWishlist,
  useNotifiedProducts,
  ACCOUNT_QUERY_KEYS,
} from "@/hooks/use-account";
import { useIsClient } from "@/hooks/use-is-client";
import { accountService } from "@/services/account.service";
import { extractApiError } from "@/lib/axios";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { categoryHref, categoryListingHref, slugify } from "@/lib/categories";
import {
  Star,
  ShoppingCart,
  Check,
  Rocket,
  FileText,
  ChevronRight,
  Heart,
  Bell,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProductDetailClient({
  product: initialProduct,
}: {
  product?: Product;
}) {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const idOrSlug =
    typeof rawId === "string"
      ? decodeURIComponent(rawId)
      : Array.isArray(rawId)
        ? decodeURIComponent(rawId[0] ?? "")
        : "";

  const { data: fetchedProduct, isLoading } = useProduct(
    initialProduct ? "" : idOrSlug
  );
  const product = initialProduct ?? fetchedProduct ?? null;

  if (!initialProduct && isLoading) {
    return <LoadingSpinner size="lg" label="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#1F2937]">Product not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This product may have been removed or is no longer available.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex rounded-xl bg-[#082F6B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#062452]"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return <ProductDetailContent product={product} />;
}

function ProductDetailContent({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const isClient = useIsClient();
  const { data: fetchedReviews = [] } = useProductReviews(product.id);
  const { data: wishlist = [] } = useWishlist();
  const { data: notifiedList = [] } = useNotifiedProducts();

  const [activeIndex, setActiveIndex] = useState(0);
  const [submittingNotify, setSubmittingNotify] = useState(false);

  const isAdded = isClient && isInCart(product.id);
  const isWishlisted = wishlist.some((w) => w.productId === product.id);
  const isNotified = notifiedList.some((n) => n.productId === product.id);
  const outOfStock = product.stock <= 0 || Boolean(product.isOutOfStockManual);

  const approvedReviews = useMemo(() => {
    if (fetchedReviews.length > 0) return fetchedReviews;
    return product.reviews ?? [];
  }, [fetchedReviews, product.reviews]);

  const images = product.images.length > 0 ? product.images : ["/images/logo.png"];
  const activeImage = images[Math.min(activeIndex, images.length - 1)];
  const discountPercent = calculateDiscount(product.price, product.originalPrice);

  const categorySlug = product.categorySlug || slugify(product.category);
  const subcategorySlug =
    product.subcategorySlug || (product.subcategory ? slugify(product.subcategory) : "");
  const categoryLink = categoryListingHref(categorySlug);
  const subcategoryLink = subcategorySlug
    ? categoryHref(categorySlug, subcategorySlug)
    : null;

  const aboutPoints = [
    product.description,
    !outOfStock ? "In stock and ready for express delivery." : "Currently out of stock.",
    product.brand ? `Brand: ${product.brand}.` : null,
    product.deliveryTime
      ? `Estimated delivery: ${product.deliveryTime}.`
      : "Estimated delivery: 12-24 HOURS.",
  ].filter(Boolean) as string[];

  const handleAddToCart = () => addToCart(product, 1);

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.info("Please sign in to save items to your wishlist.");
      return;
    }
    try {
      if (isWishlisted) {
        const msg = await accountService.removeFromWishlist(product.id);
        toast.success(msg);
      } else {
        const msg = await accountService.addToWishlist(product.id);
        toast.success(msg);
      }
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.wishlist });
    } catch (error) {
      toast.error(extractApiError(error, "Could not update wishlist."));
    }
  };

  const handleNotifyRestock = async () => {
    if (!user) {
      toast.info("Please sign in to subscribe to restock alerts.");
      return;
    }
    setSubmittingNotify(true);
    try {
      const msg = await accountService.subscribeStockAlert(product.id);
      toast.success(msg);
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.notified });
    } catch (error) {
      toast.error(extractApiError(error, "Could not subscribe to restock alert."));
    } finally {
      setSubmittingNotify(false);
    }
  };

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
        <Link href={categoryLink} className="hover:text-[#082F6B] transition">
          {product.category}
        </Link>
        {product.subcategory && subcategoryLink && (
          <>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href={subcategoryLink} className="hover:text-[#082F6B] transition">
              {product.subcategory}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="font-semibold text-[#1F2937] line-clamp-1 max-w-[14rem] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-5 lg:gap-6 lg:items-stretch">
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

        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden flex flex-col h-full">
          <div className="flex-1 p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] leading-snug">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
                  isWishlisted
                    ? "border-rose-200 bg-rose-50 text-rose-500"
                    : "border-[#E5E7EB] bg-white text-zinc-500 hover:text-rose-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 text-sm font-semibold text-[#082F6B]">
              <Link href={categoryLink} className="hover:text-[#FF6B00] transition">
                {product.category}
              </Link>
              {product.subcategory && subcategoryLink && (
                <>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                  <Link href={subcategoryLink} className="hover:text-[#FF6B00] transition">
                    {product.subcategory}
                  </Link>
                </>
              )}
            </div>

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
                ({approvedReviews.length || product.reviewCount}) Reviews
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold ${
                !outOfStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              <Check className="w-4 h-4" strokeWidth={3} />
              <span>
                {!outOfStock
                  ? `Stock: Available (${product.stock})`
                  : "Stock: Out of stock"}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  {product.brand && (
                    <p className="text-xs font-medium text-zinc-500">{product.brand}</p>
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

                {!outOfStock ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition cursor-pointer ${
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
                ) : (
                  <button
                    type="button"
                    disabled={submittingNotify || isNotified}
                    onClick={handleNotifyRestock}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E85D00] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Bell className="w-4 h-4" />
                    {isNotified
                      ? "Restock Alert Active"
                      : submittingNotify
                        ? "Subscribing..."
                        : "Notify When In Stock"}
                  </button>
                )}
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
              <li>
                • Category: {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </li>
              {product.brand && <li>• Brand: {product.brand}</li>}
              <li>
                • Rated {product.rating.toFixed(1)}/5 from{" "}
                {approvedReviews.length || product.reviewCount} reviews
              </li>
              {product.deliveryTime && <li>• Delivery window: {product.deliveryTime}</li>}
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
            No approved reviews yet. Verified buyers can review delivered orders.
          </p>
        ) : (
          <ul className="space-y-4">
            {approvedReviews.map((review) => (
              <li
                key={review.id}
                className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#1F2937]">
                    {review.user?.name || "Customer"}
                  </p>
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
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {review.comment}
                </p>
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
