"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ArrowLeft, MapPin, Package, User } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrderDetail, ORDER_QUERY_KEYS } from "@/hooks/use-orders";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { orderService } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/ecommerce";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "CONFIRMED",
  "PACKING",
  "PACKED",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function statusClass(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PROCESSING":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "CONFIRMED":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "PACKING":
    case "PACKED":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "DELIVERING":
      return "bg-[#082F6B]/10 text-[#082F6B] border-[#082F6B]/20";
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "RETURNED":
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const id = decodeURIComponent(params.id);
  const { data: order, isLoading } = useOrderDetail(id);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const msg = await orderService.advanceOrderStatus(order.id, {
        status: nextStatus,
        note: note.trim() || undefined,
      });
      toast.success(msg);
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.adminOrders }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    } catch (error) {
      toast.error(extractApiError(error, "Could not update order status."));
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Order details" description="Products and delivery address for this order.">
        <p className="text-sm text-zinc-500">Loading order…</p>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell title="Order details" description="Products and delivery address for this order.">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
          <p className="text-sm font-semibold text-[#1F2937]">Order not found</p>
          <Link
            href={ADMIN_ROUTES.orders}
            className="mt-4 inline-flex text-xs font-semibold text-[#082F6B] hover:underline"
          >
            Back to orders
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Order details"
      description={`${order.orderNumber || order.id} · ${order.paymentMethod} (${order.paymentStatus})`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={ADMIN_ROUTES.orders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Status note (optional)"
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs outline-none focus:border-[#082F6B]"
          />
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${statusClass(order.status)}`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
            <Package className="h-4 w-4 text-[#082F6B]" />
            <h2 className="text-sm font-bold text-[#1F2937]">Products</h2>
            <span className="text-xs text-zinc-400">({order.items.length})</span>
          </div>
          <ul className="divide-y divide-[#E5E7EB]">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 px-4 py-4 sm:px-5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  <img
                    src={item.productImage || "/images/logo.png"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1F2937]">{item.productName}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.quantity} × {formatPrice(item.finalUnitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#082F6B]">
                  {formatPrice(item.totalPrice)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4 text-sm sm:px-5">
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#1F2937]">
              <span>Total</span>
              <span className="text-[#082F6B]">{formatPrice(order.finalOrderAmount)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {order.shippingAddress && (
            <>
              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#082F6B]" />
                  <h2 className="text-sm font-bold text-[#1F2937]">Customer</h2>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                      Name
                    </dt>
                    <dd className="mt-0.5 font-semibold text-[#1F2937]">
                      {order.shippingAddress.customerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                      Phone
                    </dt>
                    <dd className="mt-0.5 text-[#1F2937]">{order.shippingAddress.phone}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#082F6B]" />
                  <h2 className="text-sm font-bold text-[#1F2937]">Delivery address</h2>
                </div>
                <div className="space-y-1 text-sm text-[#1F2937]">
                  <p className="font-semibold">{order.shippingAddress.customerName}</p>
                  <p className="leading-relaxed text-zinc-600">
                    {order.shippingAddress.streetAddress}
                  </p>
                  <p className="text-zinc-600">
                    {order.shippingAddress.city} ·{" "}
                    {order.shippingAddress.deliveryArea === "INSIDE_DHAKA"
                      ? "Inside Dhaka"
                      : "Outside Dhaka"}
                  </p>
                </div>
              </section>
            </>
          )}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-[#1F2937]">Status History</h2>
              <ul className="space-y-2.5 text-xs">
                {order.statusHistory.map((h, i) => (
                  <li key={`${h.status}-${i}`} className="border-l-2 border-[#082F6B] pl-3">
                    <p className="font-bold text-[#1F2937]">{h.status}</p>
                    {h.note && <p className="text-zinc-600">{h.note}</p>}
                    <p className="text-[11px] text-zinc-400">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}

export default function AdminOrderDetailView() {
  return (
    <RouteGuard step="admin">
      <OrderDetailContent />
    </RouteGuard>
  );
}
