"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { USER_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/ecommerce";

const PAGE_SIZE = 5;

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "PROCESSING":
      return "bg-indigo-100 text-indigo-700";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-700";
    case "PACKING":
    case "PACKED":
      return "bg-violet-100 text-violet-700";
    case "DELIVERING":
      return "bg-[#082F6B]/10 text-[#082F6B]";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    case "RETURNED":
      return "bg-orange-100 text-orange-700";
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { ready: authReady, user, admin } = useAuth();
  const { data: orders = [], isLoading } = useMyOrders();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = orders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, orders.length);

  const openDetails = (orderId: string) => {
    router.push(`/orders/${encodeURIComponent(orderId)}`);
  };

  return (
    <PageLayout className="bg-[#F3F7FC]">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Link href="/account" className="hover:text-[#082F6B]">
                Account
              </Link>
              <span>/</span>
              <span className="text-[#082F6B]">Orders</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] sm:text-3xl">My Orders</h1>
            {!isLoading && orders.length > 0 && (
              <p className="mt-1 text-xs text-zinc-500">
                Showing {rangeStart}–{rangeEnd} of {orders.length}
              </p>
            )}
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#082F6B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#062452]"
          >
            Continue Shopping
          </Link>
        </div>

        {!authReady || isLoading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : admin ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">
              You are signed in as Admin
            </p>
            <Link
              href="/admin/orders"
              className="mt-3 inline-flex rounded-xl bg-[#082F6B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#062452]"
            >
              Go to Admin Orders
            </Link>
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">Sign in to view your orders</p>
            <Link
              href={USER_ROUTES.login}
              className="mt-3 inline-flex rounded-xl bg-[#082F6B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#062452]"
            >
              Sign In
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No orders yet</p>
            <Link
              href="/products"
              className="mt-3 inline-flex text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pagedOrders.map((order) => (
              <div
                key={order.id}
                role="link"
                tabIndex={0}
                onClick={() => openDetails(order.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDetails(order.id);
                  }
                }}
                className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs transition hover:border-[#082F6B]/30 hover:shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-2 border-b border-[#E5E7EB] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#082F6B]" />
                      <span className="text-sm font-bold text-[#1F2937]">
                        {order.orderNumber || order.id}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-base font-bold text-[#082F6B]">
                      {formatPrice(order.finalOrderAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4">
                  <p className="text-xs font-medium text-zinc-600">
                    {order.itemsCount ?? 0} item{order.itemsCount === 1 ? "" : "s"} ·{" "}
                    {order.paymentMethod} ({order.paymentStatus})
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#082F6B]">
                    Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}

            {orders.length > PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs text-zinc-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={currentPage <= 1}
                    aria-label="First page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    const active = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition ${
                          active
                            ? "bg-[#082F6B] text-white"
                            : "border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F3F7FC]"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    aria-label="Last page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
