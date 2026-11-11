"use client";

import React from "react";
import Link from "next/link";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  updateOrderStatus,
  type StoreOrder,
} from "@/lib/orders/order-store";
import { formatPrice } from "@/lib/utils";
import { Bell, Package, CheckCheck } from "lucide-react";

const STATUS_OPTIONS: StoreOrder["status"][] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
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
  }
}

export default function AdminOrdersView() {
  const { ready, orders, notifications, unreadCount } = useOrders();

  return (
    <RouteGuard step="admin">
    <AdminShell
      title="Orders"
      description="Customer confirmations from checkout. Update status as you fulfill."
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllAdminNotificationsRead()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC] cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark notices read
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="text-sm font-bold text-[#1F2937]">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {!ready ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">
                No order notifications yet. New checkout confirmations will appear here.
              </p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAdminNotificationRead(n.id)}
                  className={`w-full text-left px-4 py-3 transition hover:bg-[#F8FAFC] cursor-pointer ${
                    n.read ? "opacity-70" : "bg-[#FFF7F0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{n.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB]">
            <Package className="w-4 h-4 text-[#082F6B]" />
            <h2 className="text-sm font-bold text-[#1F2937]">All orders</h2>
            <span className="text-xs text-zinc-400">({orders.length})</span>
          </div>

          {!ready ? (
            <p className="px-4 py-8 text-sm text-zinc-500">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="px-4 py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1F2937]">No orders yet</p>
              <p className="text-xs text-zinc-500">
                When a customer confirms checkout, the order shows up here.
              </p>
              <Link href="/" className="inline-block text-xs font-semibold text-[#082F6B] hover:underline">
                Open storefront
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {orders.map((order) => (
                    <tr key={order.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#082F6B] font-mono text-xs">{order.id}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
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
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize outline-none cursor-pointer ${statusClass(order.status)}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
    </RouteGuard>
  );
}
