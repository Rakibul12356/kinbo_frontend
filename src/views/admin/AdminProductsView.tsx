"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  PackagePlus,
  Search,
} from "lucide-react";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { useProducts } from "@/hooks/use-products";
import { useManagedCategories } from "@/hooks/use-categories";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";
import AdminShell from "./AdminShell";

const PAGE_SIZE = 10;

type StockFilter = "all" | "in_stock" | "low" | "out";

function stockLabel(stock: number, isManualOut?: boolean) {
  if (isManualOut || stock <= 0) {
    return { text: "Out of stock", className: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (stock <= 5) {
    return { text: "Low stock", className: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  return { text: "In stock", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function ProductsContent() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useManagedCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (stockFilter === "in_stock" && product.stock <= 5) return false;
      if (stockFilter === "low" && (product.stock <= 0 || product.stock > 5)) return false;
      if (stockFilter === "out" && product.stock > 0) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.subcategory?.toLowerCase().includes(q) ?? false) ||
        product.id.toLowerCase().includes(q)
      );
    });
  }, [products, search, category, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <AdminShell
      title="Products"
      description="Manage catalog inventory, stock availability, and new product listings."
      actions={
        <Link
          href={ADMIN_ROUTES.productNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#082F6B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0a3a85]"
        >
          <PackagePlus className="h-4 w-4" />
          New product
        </Link>
      }
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="space-y-3 border-b border-[#E5E7EB] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="h-4 w-4 text-[#082F6B]" />
            <h2 className="text-sm font-bold text-[#1F2937]">All products</h2>
            <span className="text-xs text-zinc-400">
              ({filtered.length} shown · {products.length} total)
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, category…"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as StockFilter);
                setPage(1);
              }}
              aria-label="Filter by stock"
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="all">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="low">Low stock (1–5)</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading products..." />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F7FC] text-[#082F6B]">
              <Package className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#1F2937]">No products found</p>
            <p className="mt-1 text-xs text-zinc-500">Try clearing filters or add a new product.</p>
            <Link
              href={ADMIN_ROUTES.productNew}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              <PackagePlus className="h-3.5 w-3.5" />
              New product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paged.map((product) => {
                    const stock = stockLabel(product.stock, product.isOutOfStockManual);
                    return (
                      <tr key={product.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                              <img
                                src={product.images[0] || "/images/logo.png"}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={ADMIN_ROUTES.productDetail(product.id)}
                                className="block truncate text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                              >
                                {product.name}
                              </Link>
                              <p className="truncate font-mono text-[11px] text-zinc-400">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[#1F2937]">{product.category}</p>
                          {product.subcategory && (
                            <p className="text-[11px] text-zinc-400">{product.subcategory}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#082F6B]">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${stock.className}`}
                          >
                            {product.stock} · {stock.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ProductRowActions product={product} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-4 py-3">
              <p className="text-xs text-zinc-500">
                Showing {rangeStart}–{rangeEnd} of {filtered.length}
              </p>
              {filtered.length > PAGE_SIZE && (
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
              )}
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}

export default function AdminProductsView() {
  return (
    <RouteGuard step="admin">
      <ProductsContent />
    </RouteGuard>
  );
}
