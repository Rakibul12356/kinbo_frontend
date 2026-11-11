"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, Sparkles } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAddedProducts } from "@/hooks/use-catalog";
import { useOrders } from "@/hooks/use-orders";
import { PRODUCTS_DATA } from "@/data/products";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import AdminShell from "./AdminShell";

function DashboardContent() {
  const addedProducts = useAddedProducts();
  const { orders, unreadCount } = useOrders();
  const totalProducts = PRODUCTS_DATA.length + addedProducts.length;
  const featuredCount = [...addedProducts, ...PRODUCTS_DATA].filter((p) => p.isFeatured).length;

  return (
    <AdminShell title="Admin Dashboard" description="Catalog overview.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Products"
          value={totalProducts}
          icon={Package}
          hint={`${addedProducts.length} added from this dashboard`}
        />
        <StatCard
          label="Featured"
          value={featuredCount}
          icon={Sparkles}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Orders"
          value={orders.length}
          icon={ShoppingBag}
          hint={unreadCount > 0 ? `${unreadCount} new notification${unreadCount === 1 ? "" : "s"}` : "From customer checkout"}
          accent="bg-[#FF6B00]/10 text-[#FF6B00]"
        />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#082F6B] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold">Add a product</h2>
            <p className="mt-1 text-sm text-white/75">Publish from the sidebar and it appears on the storefront.</p>
          </div>
          <Link
            href={ADMIN_ROUTES.products}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
          >
            Open products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Manage orders</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {unreadCount > 0
                ? `${unreadCount} unread order notification${unreadCount === 1 ? "" : "s"}.`
                : "View customer confirmations and update status."}
            </p>
          </div>
          <Link
            href={ADMIN_ROUTES.orders}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082F6B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#062452]"
          >
            Open orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-base font-bold text-[#1F2937]">Recently added</h2>
        </div>
        {addedProducts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            No products added yet. Open Products to publish one.
          </p>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {addedProducts.slice(0, 5).map((product) => (
              <li key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#082F6B]/10 text-sm font-bold text-[#082F6B]">
                  {product.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1F2937]">{product.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {product.category}
                    {product.subcategory ? ` · ${product.subcategory}` : ""}
                  </p>
                </div>
                <Link
                  href={`/products/${product.id}`}
                  className="text-xs font-semibold text-[#082F6B] hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
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
