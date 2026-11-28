"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Package,
  RotateCcw,
  ShoppingBag,
  Users,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import GrowthChart from "@/components/dashboard/GrowthChart";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { adminService, type ChartFilter } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/ecommerce";
import AdminShell from "./AdminShell";

const CHART_FILTERS: { value: ChartFilter; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "12m", label: "12 Months" },
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

function DashboardContent() {
  const { ready: authReady, admin } = useAuth();
  const [filter, setFilter] = useState<ChartFilter>("7d");

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: () => adminService.getAnalyticsOverview(),
    enabled: authReady && Boolean(admin),
  });

  const { data: chartRes } = useQuery({
    queryKey: ["admin", "analytics", "charts", filter],
    queryFn: () => adminService.getAnalyticsCharts(filter),
    enabled: authReady && Boolean(admin),
  });

  const kpis = overview?.kpis;
  const recentOrders = overview?.recentOrders ?? [];
  const recentReturns = overview?.recentReturnRequests ?? [];
  const chartPoints = chartRes?.data ?? [];

  const salesSeries = chartPoints.map((p) => ({
    key: p.date,
    label: p.date,
    value: p.sales,
  }));
  const ordersSeries = chartPoints.map((p) => ({
    key: p.date,
    label: p.date,
    value: p.orders,
  }));

  return (
    <AdminShell
      title="Overview"
      description="Live sales, net revenue, customers, and analytics from Kinbo backend."
      actions={
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
          {CHART_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition ${
                filter === item.value
                  ? "bg-[#082F6B] text-white"
                  : "text-zinc-600 hover:bg-[#F3F7FC]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Delivered Sales"
          value={overviewLoading ? "—" : formatPrice(kpis?.totalDeliveredSales ?? 0)}
          icon={Banknote}
          hint={`${kpis?.deliveredOrdersCount ?? 0} delivered orders`}
          accent="bg-[#082F6B]/10 text-[#082F6B]"
        />
        <StatCard
          label="Net Revenue"
          value={overviewLoading ? "—" : formatPrice(kpis?.totalNetRevenue ?? 0)}
          icon={ShoppingBag}
          hint="After discounts & refunds"
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Customers"
          value={overviewLoading ? "—" : kpis?.totalCustomers ?? 0}
          icon={Users}
          hint="Registered customers"
          accent="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="Returned Orders"
          value={overviewLoading ? "—" : kpis?.returnedOrdersCount ?? 0}
          icon={RotateCcw}
          hint="Return requests & returns"
          accent="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <GrowthChart
          title="Sales Revenue"
          subtitle={`Filter: ${filter}`}
          points={salesSeries}
          color="#082F6B"
          formatValue={formatPrice}
        />
        <GrowthChart
          title="Orders Volume"
          subtitle={`Filter: ${filter}`}
          points={ordersSeries}
          color="#FF6B00"
        />
      </div>

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

          {overviewLoading ? (
            <LoadingSpinner size="sm" label="Loading recent orders..." />
          ) : recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No recent orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#082F6B]/10 text-[#082F6B]">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={ADMIN_ROUTES.orderDetail(order.id)}
                      className="truncate text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                    >
                      {order.orderNumber || order.id}
                      {order.customerName ? ` · ${order.customerName}` : ""}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-[#1F2937]">
                      {formatPrice(order.finalOrderAmount)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(order.status)}`}
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
              <h2 className="text-base font-bold text-[#1F2937]">Recent Return Requests</h2>
              <p className="text-xs text-zinc-500">Returned and disputed orders</p>
            </div>
            <Link
              href={ADMIN_ROUTES.returns}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {overviewLoading ? (
            <LoadingSpinner size="sm" label="Loading return requests..." />
          ) : recentReturns.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No return requests right now.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {recentReturns.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <RotateCcw className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={ADMIN_ROUTES.returns}
                      className="truncate text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                    >
                      {order.orderNumber || order.id}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">
                      {formatPrice(order.finalOrderAmount)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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
