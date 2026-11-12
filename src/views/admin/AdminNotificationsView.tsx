"use client";

import React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Package } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/lib/orders/order-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";

export default function AdminNotificationsView() {
  const { ready, notifications, unreadCount } = useOrders();

  return (
    <RouteGuard step="admin">
      <AdminShell
        title="Notifications"
        description="Order alerts and store activity in one place."
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllAdminNotificationsRead()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          ) : undefined
        }
      >
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#FF6B00]" />
              <h2 className="text-sm font-bold text-[#1F2937]">All notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <Link
              href={ADMIN_ROUTES.orders}
              className="text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Open orders
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {!ready ? (
              <p className="px-4 py-8 text-sm text-zinc-500 sm:px-5">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center sm:px-5">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F7FC] text-[#082F6B]">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-[#1F2937]">No notifications yet</p>
                <p className="mt-1 text-xs text-zinc-500">
                  New checkout confirmations will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAdminNotificationRead(n.id)}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition hover:bg-[#F8FAFC] sm:px-5 ${
                    n.read ? "opacity-70" : "bg-[#FFF7F0]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      n.read ? "bg-zinc-100 text-zinc-500" : "bg-[#FF6B00]/10 text-[#FF6B00]"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1F2937]">{n.title}</p>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">{n.message}</p>
                    <Link
                      href={ADMIN_ROUTES.orderDetail(n.orderId)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex text-xs font-semibold text-[#082F6B] hover:underline"
                    >
                      View order {n.orderId}
                    </Link>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF6B00]" aria-label="Unread" />
                  )}
                </button>
              ))
            )}
          </div>
        </section>
      </AdminShell>
    </RouteGuard>
  );
}
