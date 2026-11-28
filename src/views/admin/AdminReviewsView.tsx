"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Star } from "lucide-react";
import { toast } from "react-toastify";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAdminReviews } from "@/hooks/use-reviews";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { reviewService } from "@/services/review.service";

type Filter = "pending" | "approved" | "all";

function ReviewsContent() {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useAdminReviews();
  const [filter, setFilter] = useState<Filter>("pending");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => {
      const normalized = (r.status || "").toLowerCase();
      if (filter === "approved") return normalized === "approved" || normalized === "published";
      return normalized !== "approved" && normalized !== "published";
    });
  }, [reviews, filter]);

  const handlePublish = async (id: string) => {
    try {
      const msg = await reviewService.publishReview(id);
      toast.success(msg);
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error) {
      toast.error(extractApiError(error, "Could not publish review."));
    }
  };

  return (
    <AdminShell
      title="Reviews"
      description="Approve verified buyer reviews before they show on public product pages."
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-[#1F2937]">Product reviews</h2>
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

        {isLoading ? (
          <LoadingSpinner label="Loading reviews..." />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No reviews here</p>
            <p className="mt-1 text-xs text-zinc-500">
              Verified buyers can submit reviews from delivered orders.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {filtered.map((review) => {
              const isPublished =
                review.status?.toLowerCase() === "approved" ||
                review.status?.toLowerCase() === "published";
              return (
                <li
                  key={review.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {review.productId && (
                        <Link
                          href={ADMIN_ROUTES.productDetail(review.productId)}
                          className="text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                        >
                          {review.productName || review.productId}
                        </Link>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {review.status || "PENDING"}
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
                      {review.user?.name || "Customer"} ·{" "}
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={() => handlePublish(review.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#082F6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Publish
                    </button>
                  )}
                </li>
              );
            })}
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
