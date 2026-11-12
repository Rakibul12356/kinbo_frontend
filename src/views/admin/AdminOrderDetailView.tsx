"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Package, User } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import { updateOrderStatus, type StoreOrder } from "@/lib/orders/order-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";

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

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { ready, orders } = useOrders();
  const order = orders.find((item) => item.id === id);

  if (!ready) {
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
          <p className="mt-1 text-xs text-zinc-500">It may have been removed.</p>
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
      description={`${order.id} · ${new Date(order.createdAt).toLocaleString()}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={ADMIN_ROUTES.orders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
          <select
            value={order.status}
            onChange={(e) =>
              updateOrderStatus(order.id, e.target.value as StoreOrder["status"])
            }
            className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold capitalize outline-none ${statusClass(order.status)}`}
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
              <li key={`${order.id}-${item.productId}`} className="flex gap-3 px-4 py-4 sm:px-5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1F2937]">{item.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{item.productId}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#082F6B]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4 text-sm sm:px-5">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#1F2937]">
              <span>Total</span>
              <span className="text-[#082F6B]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
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
                <dd className="mt-0.5 font-semibold text-[#1F2937]">{order.shipping.fullName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Phone
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">{order.shipping.phone}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Email
                </dt>
                <dd className="mt-0.5 break-all text-[#1F2937]">
                  {order.shipping.email || "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#082F6B]" />
              <h2 className="text-sm font-bold text-[#1F2937]">Delivery address</h2>
            </div>
            <div className="space-y-1 text-sm text-[#1F2937]">
              <p className="font-semibold">{order.shipping.fullName}</p>
              <p className="leading-relaxed text-zinc-600">{order.shipping.address}</p>
              <p className="text-zinc-600">
                {order.shipping.city}
                {order.shipping.postalCode ? ` · ${order.shipping.postalCode}` : ""}
              </p>
              <p className="pt-2 text-xs text-zinc-500">{order.shipping.phone}</p>
            </div>
          </section>
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
