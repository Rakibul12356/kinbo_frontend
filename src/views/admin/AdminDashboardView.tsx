"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";
import type { StoreOrder } from "@/lib/orders/order-store";
import AdminShell from "./AdminShell";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastNDays(n: number) {
  const days: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return days;
}

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

function DashboardContent() {
  const { ready, orders } = useOrders();

  const analytics = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
    const returns = orders.filter((o) => o.status === "returned" || o.status === "cancelled");
    const revenue = active.reduce((sum, o) => sum + o.total, 0);
    const customers = new Set(orders.map((o) => o.shipping.email.trim().toLowerCase()).filter(Boolean));

    const days = lastNDays(7);
    const revenueByDay = days.map((day) => {
      const dayRevenue = active
        .filter((o) => dayKey(new Date(o.createdAt)) === day.key)
        .reduce((sum, o) => sum + o.total, 0);
      return { ...day, revenue: dayRevenue };
    });
    const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

    return {
      sales: active.length,
      revenue,
      newCustomers: customers.size,
      returns: returns.length,
      recent: orders.slice(0, 6),
      returnOrders: returns.slice(0, 5),
      revenueByDay,
      maxRevenue,
      avgOrder: active.length ? revenue / active.length : 0,
    };
  }, [orders]);

  return (
    <AdminShell
      title="Overview"
      description="Sales, revenue, customers, and order activity at a glance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales"
          value={ready ? analytics.sales : "—"}
          icon={ShoppingBag}
          hint="Orders excluding returns & cancellations"
          accent="bg-[#082F6B]/10 text-[#082F6B]"
        />
        <StatCard
          label="Revenue"
          value={ready ? formatPrice(analytics.revenue) : "—"}
          icon={Banknote}
          hint={
            analytics.sales
              ? `Avg ${formatPrice(analytics.avgOrder)} per order`
              : "From confirmed checkouts"
          }
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="New customers"
          value={ready ? analytics.newCustomers : "—"}
          icon={UserPlus}
          hint="Unique emails from orders"
          accent="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Return orders"
          value={ready ? analytics.returns : "—"}
          icon={RotateCcw}
          hint="Returned + cancelled"
          accent="bg-orange-50 text-orange-600"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#1F2937]">
              <TrendingUp className="h-4 w-4 text-[#082F6B]" />
              Revenue — last 7 days
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">Active order totals by day</p>
          </div>
          <Link
            href={ADMIN_ROUTES.orders}
            className="text-xs font-semibold text-[#082F6B] hover:underline"
          >
            All orders
          </Link>
        </div>

        <div className="flex h-44 items-end gap-2 sm:gap-3">
          {analytics.revenueByDay.map((day) => {
            const height = Math.max(6, Math.round((day.revenue / analytics.maxRevenue) * 100));
            return (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <p className="text-[10px] font-semibold text-zinc-500 tabular-nums">
                  {day.revenue > 0 ? formatPrice(day.revenue) : "—"}
                </p>
                <div className="flex h-28 w-full items-end justify-center rounded-lg bg-[#F3F7FC] px-1">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-[#082F6B] transition-all"
                    style={{ height: `${height}%` }}
                    title={formatPrice(day.revenue)}
                  />
                </div>
                <p className="text-[11px] font-medium text-zinc-500">{day.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Recent orders</h2>
              <p className="text-xs text-zinc-500">Latest checkout confirmations</p>
            </div>
            <Link
              href={ADMIN_ROUTES.orders}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!ready ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">Loading…</p>
          ) : analytics.recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No orders yet. Customer checkouts will show here.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {analytics.recent.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#082F6B]/10 text-[#082F6B]">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1F2937]">
                      {order.id} · {order.shipping.fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-[#1F2937]">{formatPrice(order.total)}</p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Return orders</h2>
              <p className="text-xs text-zinc-500">Returned and cancelled orders</p>
            </div>
            <Link
              href={ADMIN_ROUTES.orders}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!ready ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">Loading…</p>
          ) : analytics.returnOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No returns or cancellations yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {analytics.returnOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <RotateCcw className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1F2937]">
                      {order.id} · {order.shipping.fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {order.shipping.phone} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#082F6B] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Keep the catalog moving</h2>
          <p className="mt-1 text-sm text-white/75">
            Add products or update order status from the marketplace tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={ADMIN_ROUTES.products}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
          >
            Products <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={ADMIN_ROUTES.orders}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            Orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}

export default function AdminDashboardView() {
  return (
    <RouteGuard step="admin">
      <DashboardContent />
    </RouteGuard>
  );
}
