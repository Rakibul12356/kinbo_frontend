"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Copy,
  Headphones,
  Package,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useOrderDetail, ORDER_QUERY_KEYS } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { buildOrderTimeline } from "@/lib/orders/order-timeline";
import { extractApiError } from "@/lib/axios";
import { orderService } from "@/services/order.service";
import { reviewService } from "@/services/review.service";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = params?.id;
  const id =
    typeof rawId === "string"
      ? decodeURIComponent(rawId)
      : Array.isArray(rawId)
        ? decodeURIComponent(rawId[0] ?? "")
        : "";

  const { user, ready: authReady } = useAuth();
  const { data: order, isLoading, isError, error } = useOrderDetail(id);

  const timeline = useMemo(() => (order ? buildOrderTimeline(order) : []), [order]);
  const canReview = order?.status === "DELIVERED";
  const canCancel =
    order?.status === "PENDING" ||
    order?.status === "PROCESSING" ||
    order?.status === "CONFIRMED" ||
    order?.status === "PACKING";
  const canReturn = useMemo(() => {
    if (!order || order.status !== "DELIVERED") return false;
    if (order.returnRequest) return false;
    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
    if (!deliveredAt || Number.isNaN(deliveredAt.getTime())) return true;
    const ms = Date.now() - deliveredAt.getTime();
    return ms <= 3 * 24 * 60 * 60 * 1000;
  }, [order]);

  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Record<string, boolean>>({});
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [actionMode, setActionMode] = useState<"cancel" | "return" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order?.orderNumber || id);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleSubmitReview = async (productId: string) => {
    if (!user) {
      toast.info("Log in to leave a review");
      router.push(USER_ROUTES.login);
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    try {
      const msg = await reviewService.submitReview({
        orderId: order!.id,
        productId,
        rating,
        comment: comment.trim(),
      });
      toast.success(msg);
      setReviewedProductIds((prev) => ({ ...prev, [productId]: true }));
      setReviewingProductId(null);
      setComment("");
      setRating(5);
    } catch (error) {
      toast.error(extractApiError(error, "Could not submit review."));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOrderAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !actionMode) return;
    if (!actionReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    setSubmittingAction(true);
    try {
      const msg =
        actionMode === "cancel"
          ? await orderService.cancelOrder(order.id, actionReason.trim())
          : await orderService.returnOrder(order.id, actionReason.trim());
      toast.success(msg);
      setActionMode(null);
      setActionReason("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.myOrders }),
      ]);
    } catch (error) {
      toast.error(extractApiError(error, "Could not process request."));
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <PageLayout className="bg-[#F3F7FC]">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {!authReady || isLoading ? (
          <LoadingSpinner size="lg" label="Loading order..." />
        ) : !order ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">
              {isError ? extractApiError(error, "Order not found") : "Order not found"}
            </p>
            <Link
              href="/orders"
              className="mt-3 inline-flex text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Back to orders
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-[#1F2937] sm:text-2xl">
                    Order: #{order.orderNumber || order.id}
                  </h1>
                  <button
                    type="button"
                    onClick={copyId}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-white hover:text-[#082F6B] cursor-pointer"
                    aria-label="Copy order number"
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
              <div className="flex flex-wrap items-center gap-2">
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setActionMode("cancel")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </button>
                )}
                {canReturn && (
                  <button
                    type="button"
                    onClick={() => setActionMode("return")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Request Return
                  </button>
                )}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
                >
                  <Headphones className="h-4 w-4 text-[#082F6B]" />
                  Help
                </Link>
              </div>
            </div>

            {actionMode && (
              <form
                onSubmit={handleOrderAction}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3 shadow-xs"
              >
                <h2 className="text-sm font-bold text-[#1F2937]">
                  {actionMode === "cancel" ? "Cancel Order" : "Request Order Return (Within 3 Days)"}
                </h2>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    actionMode === "cancel"
                      ? "Why would you like to cancel this order?"
                      : "Describe the issue for your return request..."
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="rounded-xl bg-[#082F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer disabled:opacity-60"
                  >
                    {submittingAction ? "Submitting…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionMode(null);
                      setActionReason("");
                    }}
                    className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>
            )}

            {(order.status === "CANCELLED" || order.status === "RETURNED") && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                This order is <span className="font-bold">{order.status}</span>.
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 sm:px-5">
                <h2 className="text-sm font-bold text-[#1F2937]">Timeline</h2>
                <span className="text-xs font-semibold text-[#082F6B]">
                  {order.paymentMethod} · {order.paymentStatus}
                </span>
              </div>
              <ol className="px-4 py-5 sm:px-6">
                {timeline.map((step, index) => {
                  const nextDone = timeline[index + 1]?.done;
                  return (
                    <li
                      key={step.key}
                      className="grid grid-cols-[7.5rem_1.75rem_1fr] gap-3 sm:grid-cols-[9rem_2rem_1fr]"
                    >
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
                        <p
                          className={`text-sm font-bold ${
                            step.done ? "text-[#1F2937]" : "text-zinc-400"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`mt-0.5 text-xs leading-relaxed ${
                            step.done ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          {step.description}
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
                  const prodId = item.productId;
                  const open = Boolean(prodId && reviewingProductId === prodId);
                  const alreadyReviewed = Boolean(prodId && reviewedProductIds[prodId]);

                  return (
                    <li key={item.id} className="px-4 py-4 sm:px-5">
                      <div className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                          <img
                            src={item.productImage || "/images/logo.png"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          {prodId ? (
                            <Link
                              href={`/products/${prodId}`}
                              className="text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-[#1F2937]">
                              {item.productName}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-zinc-500">
                            {item.quantity} × {formatPrice(item.finalUnitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#082F6B]">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>

                      {canReview && prodId && (
                        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                          {alreadyReviewed ? (
                            <p className="text-xs font-medium text-emerald-700">
                              Review submitted and pending admin approval.
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
                                  disabled={submittingReview}
                                  onClick={() => handleSubmitReview(prodId)}
                                  className="rounded-xl bg-[#082F6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer disabled:opacity-60"
                                >
                                  {submittingReview ? "Submitting…" : "Submit for approval"}
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
                                setReviewingProductId(prodId);
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
                <span className="font-bold text-[#082F6B]">
                  {formatPrice(order.finalOrderAmount)}
                </span>
              </div>
            </section>

            {order.shippingAddress && (
              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <h2 className="text-sm font-bold text-[#1F2937]">Delivery address</h2>
                <p className="mt-2 text-sm font-semibold text-[#1F2937]">
                  {order.shippingAddress.customerName}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {order.shippingAddress.streetAddress}
                </p>
                <p className="text-sm text-zinc-600">
                  {order.shippingAddress.city} ·{" "}
                  {order.shippingAddress.deliveryArea === "INSIDE_DHAKA"
                    ? "Inside Dhaka"
                    : "Outside Dhaka"}
                </p>
                <p className="mt-2 text-xs text-zinc-500">{order.shippingAddress.phone}</p>
              </section>
            )}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
