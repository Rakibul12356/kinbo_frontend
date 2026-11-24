"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Headphones,
  Package,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import { useOrders } from "@/hooks/use-orders";
import { useReviews } from "@/hooks/use-reviews";
import { useAuth } from "@/hooks/use-auth";
import { buildOrderTimeline } from "@/lib/orders/order-timeline";
import {
  findReviewForOrderProduct,
  submitProductReview,
} from "@/lib/reviews/review-store";
import { formatPrice } from "@/lib/utils";
import { USER_ROUTES } from "@/lib/auth/auth-store";

function formatTimelineDate(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const id =
    typeof rawId === "string"
      ? decodeURIComponent(rawId)
      : Array.isArray(rawId)
        ? decodeURIComponent(rawId[0] ?? "")
        : "";
  const { ready, orders } = useOrders();
  const reviews = useReviews();
  const { user, session, ready: authReady } = useAuth();
  const order = id ? orders.find((item) => item.id === id) : undefined;

  const timeline = useMemo(() => (order ? buildOrderTimeline(order) : []), [order]);
  const canReview = order?.status === "delivered";

  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Order id copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const submitReview = (productId: string, productName: string, productImage: string) => {
    if (!authReady || !session || session.role !== "user") {
      toast.info("Log in to leave a review");
      window.location.href = USER_ROUTES.login;
      return;
    }

    const result = submitProductReview({
      productId,
      productName,
      productImage,
      orderId: id,
      userName: user?.fullName ?? order?.shipping.fullName ?? "Customer",
      userEmail: user?.email ?? order?.shipping.email ?? "",
      rating,
      comment,
    });

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Review sent for admin approval");
    setReviewingProductId(null);
    setComment("");
    setRating(5);
  };

  return (
    <PageLayout className="bg-[#F3F7FC]">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {!ready ? (
          <p className="text-sm text-zinc-500">Loading order…</p>
        ) : !order ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">Order not found</p>
            <Link href="/orders" className="mt-3 inline-flex text-xs font-semibold text-[#082F6B] hover:underline">
              Back to orders
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-[#1F2937] sm:text-2xl">
                    View Order : #{order.id}
                  </h1>
                  <button
                    type="button"
                    onClick={copyId}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-white hover:text-[#082F6B] cursor-pointer"
                    aria-label="Copy order id"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  href="/orders"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#082F6B] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Link>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
              >
                <Headphones className="h-4 w-4 text-[#082F6B]" />
                Help
              </Link>
            </div>

            {(order.status === "cancelled" || order.status === "returned") && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                This order is <span className="font-bold capitalize">{order.status}</span>.
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
              <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 sm:px-5">
                <h2 className="text-sm font-bold text-[#1F2937]">Timeline</h2>
              </div>
              <ol className="px-4 py-5 sm:px-6">
                {timeline.map((step, index) => {
                  const nextDone = timeline[index + 1]?.done;
                  return (
                    <li key={step.key} className="grid grid-cols-[7.5rem_1.75rem_1fr] gap-3 sm:grid-cols-[9rem_2rem_1fr]">
                      <div className="pt-0.5 text-right text-[11px] leading-snug text-zinc-400 sm:text-xs">
                        {step.at ? formatTimelineDate(step.at) : ""}
                      </div>
                      <div className="relative flex flex-col items-center">
                        <span
                          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                            step.done
                              ? "bg-[#0F766E] text-white"
                              : "border-2 border-zinc-200 bg-white text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        {index < timeline.length - 1 && (
                          <span
                            className={`absolute top-7 bottom-0 w-0.5 ${
                              step.done && nextDone ? "bg-[#0F766E]" : "bg-zinc-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className={`pb-8 ${index === timeline.length - 1 ? "pb-1" : ""}`}>
                        <p className={`text-sm font-bold ${step.done ? "text-[#1F2937]" : "text-zinc-400"}`}>
                          {step.title}
                        </p>
                        <p className={`mt-0.5 text-xs leading-relaxed ${step.done ? "text-zinc-500" : "text-zinc-400"}`}>
                          {step.key === "placed"
                            ? `Your order # ${order.id} is successfully placed.`
                            : step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
                <Package className="h-4 w-4 text-[#082F6B]" />
                <h2 className="text-sm font-bold text-[#1F2937]">Products</h2>
              </div>
              <ul className="divide-y divide-[#E5E7EB]">
                {order.items.map((item) => {
                  const existing =
                    findReviewForOrderProduct(order.id, item.productId) ||
                    reviews.find((r) => r.orderId === order.id && r.productId === item.productId);
                  const open = reviewingProductId === item.productId;

                  return (
                    <li key={`${order.id}-${item.productId}`} className="px-4 py-4 sm:px-5">
                      <div className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-zinc-500">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#082F6B]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {canReview && (
                        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                          {existing ? (
                            <p className="text-xs font-medium text-zinc-500">
                              Review{" "}
                              <span className="font-semibold text-[#082F6B]">
                                {existing.status === "approved" ? "approved" : "waiting for admin"}
                              </span>
                              {existing.status === "pending" && " — not shown on the product page yet."}
                            </p>
                          ) : open ? (
                            <div className="space-y-3 rounded-xl bg-[#F8FAFC] p-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRating(value)}
                                    className="cursor-pointer p-0.5"
                                    aria-label={`${value} stars`}
                                  >
                                    <Star
                                      className={`h-5 w-5 ${
                                        value <= rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-zinc-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="How was this product?"
                                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    submitReview(item.productId, item.name, item.image)
                                  }
                                  className="rounded-xl bg-[#082F6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer"
                                >
                                  Submit for approval
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewingProductId(null);
                                    setComment("");
                                    setRating(5);
                                  }}
                                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-zinc-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingProductId(item.productId);
                                setComment("");
                                setRating(5);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Write a review
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm sm:px-5">
                <span className="font-semibold text-[#1F2937]">Total</span>
                <span className="font-bold text-[#082F6B]">{formatPrice(order.total)}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
              <h2 className="text-sm font-bold text-[#1F2937]">Delivery address</h2>
              <p className="mt-2 text-sm font-semibold text-[#1F2937]">{order.shipping.fullName}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{order.shipping.address}</p>
              <p className="text-sm text-zinc-600">
                {order.shipping.city}
                {order.shipping.postalCode ? ` · ${order.shipping.postalCode}` : ""}
              </p>
              <p className="mt-2 text-xs text-zinc-500">{order.shipping.phone}</p>
            </section>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
