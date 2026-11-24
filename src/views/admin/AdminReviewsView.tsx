"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Star, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useReviews } from "@/hooks/use-reviews";
import { approveReview, deleteReview } from "@/lib/reviews/review-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";

type Filter = "pending" | "approved" | "all";

function ReviewsContent() {
  const reviews = useReviews();
  const [filter, setFilter] = useState<Filter>("pending");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <AdminShell
      title="Reviews"
      description="Approve reviews before they show on public product pages. Delete to discard."
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-[#1F2937]">Product reviews</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-bold text-white">
              {pendingCount} pending
            </span>
          )}
          <div className="ms-auto flex gap-1">
            {(["pending", "approved", "all"] as Filter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize cursor-pointer ${
                  filter === value
                    ? "bg-[#082F6B] text-white"
                    : "border border-[#E5E7EB] text-zinc-600 hover:bg-[#F3F7FC]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No reviews here</p>
            <p className="mt-1 text-xs text-zinc-500">
              Delivered orders can submit reviews from the order details page.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {filtered.map((review) => (
              <li key={review.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={review.productImage} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={ADMIN_ROUTES.productDetail(review.productId)}
                      className="text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                    >
                      {review.productName}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        review.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
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
                  <p className="mt-2 text-sm text-zinc-600">{review.comment}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {review.userName}
                    {review.userEmail ? ` · ${review.userEmail}` : ""} · order{" "}
                    <Link
                      href={ADMIN_ROUTES.orderDetail(review.orderId)}
                      className="font-mono text-[#082F6B] hover:underline"
                    >
                      {review.orderId}
                    </Link>{" "}
                    · {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {review.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => {
                        approveReview(review.id);
                        toast.success("Review approved — now public.");
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#082F6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Delete this review?")) return;
                      deleteReview(review.id);
                      toast.success("Review deleted.");
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

export default function AdminReviewsView() {
  return (
    <RouteGuard step="admin">
      <ReviewsContent />
    </RouteGuard>
  );
}
