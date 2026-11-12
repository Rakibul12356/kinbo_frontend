"use client";

import React, { useMemo } from "react";
import { Banknote, BarChart3, MapPin, Package, RotateCcw, ShoppingBag } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import GrowthChart from "@/components/dashboard/GrowthChart";
import StatCard from "@/components/dashboard/StatCard";
import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import type { StoreOrder } from "@/lib/orders/order-store";

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
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return days;
}

function statusLabel(status: StoreOrder["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function ReportsContent() {
  const { ready, orders } = useOrders();

  const report = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
    const revenue = active.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = active.length ? Math.round(revenue / active.length) : 0;

    const byStatus = (
      ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"] as StoreOrder["status"][]
    ).map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of active) {
      for (const item of order.items) {
        const current = productMap.get(item.productId) ?? {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        current.qty += item.quantity;
        current.revenue += item.price * item.quantity;
        productMap.set(item.productId, current);
      }
    }
    const topProducts = [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const cityMap = new Map<string, { orders: number; revenue: number }>();
    for (const order of active) {
      const city = order.shipping.city || "Unknown";
      const current = cityMap.get(city) ?? { orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += order.total;
      cityMap.set(city, current);
    }
    const topCities = [...cityMap.entries()]
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const days = lastNDays(14);
    const revenueSeries = days.map((day) => {
      const dayOrders = active.filter((o) => dayKey(new Date(o.createdAt)) === day.key);
      return {
        key: day.key,
        label: day.label,
        value: dayOrders.reduce((sum, o) => sum + o.total, 0),
      };
    });

    return {
      revenue,
      sales: active.length,
      avgOrder,
      returns: orders.filter((o) => o.status === "returned" || o.status === "cancelled").length,
      byStatus,
      topProducts,
      topCities,
      revenueSeries,
    };
  }, [orders]);

  return (
    <AdminShell
      title="Reports"
      description="Sales performance, top products, and delivery cities."
    >
      {!ready ? (
        <p className="text-sm text-zinc-500">Loading reports…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" value={formatPrice(report.revenue)} icon={Banknote} />
            <StatCard label="Sales" value={String(report.sales)} icon={ShoppingBag} />
            <StatCard label="Avg. order" value={formatPrice(report.avgOrder)} icon={BarChart3} />
            <StatCard label="Returns / cancels" value={String(report.returns)} icon={RotateCcw} />
          </div>

          <GrowthChart
            title="Revenue (14 days)"
            subtitle="Active orders only"
            points={report.revenueSeries}
            color="#082F6B"
            formatValue={(v) => formatPrice(v)}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white lg:col-span-1">
              <div className="border-b border-[#E5E7EB] px-4 py-3">
                <h2 className="text-sm font-bold text-[#1F2937]">Orders by status</h2>
              </div>
              <ul className="divide-y divide-[#E5E7EB]">
                {report.byStatus.map((row) => (
                  <li key={row.status} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="capitalize text-zinc-600">{statusLabel(row.status)}</span>
                    <span className="font-bold text-[#1F2937]">{row.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white lg:col-span-1">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                <Package className="h-4 w-4 text-[#082F6B]" />
                <h2 className="text-sm font-bold text-[#1F2937]">Top products</h2>
              </div>
              {report.topProducts.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">No product sales yet.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {report.topProducts.map((product) => (
                    <li key={product.name} className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#1F2937]">{product.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {product.qty} sold · {formatPrice(product.revenue)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white lg:col-span-1">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                <MapPin className="h-4 w-4 text-[#082F6B]" />
                <h2 className="text-sm font-bold text-[#1F2937]">Top cities</h2>
              </div>
              {report.topCities.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">No city data yet.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {report.topCities.map((city) => (
                    <li key={city.city} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{city.city}</p>
                        <p className="text-xs text-zinc-500">{city.orders} orders</p>
                      </div>
                      <p className="text-sm font-bold text-[#082F6B]">{formatPrice(city.revenue)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminReportsView() {
  return (
    <RouteGuard step="admin">
      <ReportsContent />
    </RouteGuard>
  );
}
