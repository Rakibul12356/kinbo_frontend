"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Package,
} from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import { updateOrderStatus, type StoreOrder } from "@/lib/orders/order-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";

const PAGE_SIZE = 8;

const STATUS_OPTIONS: StoreOrder["status"][] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

function statusClass(status: StoreOrder["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "confirmed":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "shipped":
      return "bg-[#082F6B]/10 text-[#082F6B] border-[#082F6B]/20";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "returned":
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

export default function AdminOrdersView() {
  const { ready, orders } = useOrders();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = orders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, orders.length);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <RouteGuard step="admin">
      <AdminShell
        title="Orders"
        description="Customer confirmations from checkout. Update status as you fulfill."
      >
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
            <Package className="h-4 w-4 text-[#082F6B]" />
            <h2 className="text-sm font-bold text-[#1F2937]">All orders</h2>
            <span className="text-xs text-zinc-400">({orders.length})</span>
            {ready && orders.length > 0 && (
              <span className="ms-auto text-xs text-zinc-500">
                Showing {rangeStart}–{rangeEnd} of {orders.length}
              </span>
            )}
          </div>

          {!ready ? (
            <p className="px-4 py-8 text-sm text-zinc-500">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="space-y-2 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-[#1F2937]">No orders yet</p>
              <p className="text-xs text-zinc-500">
                When a customer confirms checkout, the order shows up here.
              </p>
              <Link href="/" className="inline-block text-xs font-semibold text-[#082F6B] hover:underline">
                Open storefront
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-left text-sm">
                  <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Items</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {pagedOrders.map((order) => (
                      <tr key={order.id} className="align-top">
                        <td className="px-4 py-3">
                          <Link
                            href={ADMIN_ROUTES.orderDetail(order.id)}
                            className="font-mono text-xs font-bold text-[#082F6B] hover:underline"
                          >
                            {order.id}
                          </Link>
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1F2937]">{order.shipping.fullName}</p>
                          <p className="text-xs text-zinc-500">{order.shipping.phone}</p>
                          <p className="text-xs text-zinc-400">{order.shipping.city}</p>
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-1">
                            {order.items.slice(0, 3).map((item) => (
                              <li key={`${order.id}-${item.productId}`} className="text-xs text-zinc-600">
                                {item.quantity}× {item.name}
                              </li>
                            ))}
                            {order.items.length > 3 && (
                              <li className="text-[11px] text-zinc-400">
                                +{order.items.length - 3} more
                              </li>
                            )}
                          </ul>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1F2937]">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value as StoreOrder["status"])
                            }
                            className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize outline-none ${statusClass(order.status)}`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={ADMIN_ROUTES.orderDetail(order.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length > PAGE_SIZE && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-4 py-3">
                  <p className="text-xs text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      disabled={currentPage <= 1}
                      aria-label="First page"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      aria-label="Previous page"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
                          aria-label={`Go to page ${pageNumber}`}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition cursor-pointer ${
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
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      aria-label="Last page"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </AdminShell>
    </RouteGuard>
  );
}
