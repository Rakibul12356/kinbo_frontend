"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  PackagePlus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAddedProducts, useCatalogProducts } from "@/hooks/use-catalog";
import { CATEGORIES } from "@/lib/categories";
import { removeCatalogProduct } from "@/lib/catalog/catalog-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/ecommerce";
import AdminShell from "./AdminShell";

const PAGE_SIZE = 10;

type StockFilter = "all" | "in_stock" | "low" | "out";
type SourceFilter = "all" | "admin" | "catalog";

function isAdminProduct(product: Product) {
  return product.id.startsWith("prod-admin-") || product.tags?.includes("Admin");
}

function stockLabel(stock: number) {
  if (stock <= 0) return { text: "Out of stock", className: "bg-rose-50 text-rose-700 border-rose-200" };
  if (stock <= 5) return { text: "Low stock", className: "bg-amber-50 text-amber-700 border-amber-200" };
  return { text: "In stock", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function ProductsContent() {
  const products = useCatalogProducts();
  const added = useAddedProducts();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (sourceFilter === "admin" && !isAdminProduct(product)) return false;
      if (sourceFilter === "catalog" && isAdminProduct(product)) return false;
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
  }, [products, search, category, stockFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [search, category, stockFilter, sourceFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <AdminShell
      title="Products"
      description="Browse the full catalog, filter what you need, and add new items."
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
              ({filtered.length} shown · {products.length} total · {added.length} admin-added)
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, category…"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              aria-label="Filter by stock"
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="all">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="low">Low stock (1–5)</option>
              <option value="out">Out of stock</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              aria-label="Filter by source"
              className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="all">All sources</option>
              <option value="admin">Admin added</option>
              <option value="catalog">Demo catalog</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F7FC] text-[#082F6B]">
              <Package className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#1F2937]">No products match</p>
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
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paged.map((product) => {
                    const stock = stockLabel(product.stock);
                    const admin = isAdminProduct(product);
                    return (
                      <tr key={product.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/products/${product.id}`}
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
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                              admin
                                ? "border-[#082F6B]/20 bg-[#082F6B]/10 text-[#082F6B]"
                                : "border-[#E5E7EB] bg-[#F8FAFC] text-zinc-600"
                            }`}
                          >
                            {admin ? "Admin" : "Catalog"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {admin ? (
                            <button
                              type="button"
                              onClick={() => {
                                removeCatalogProduct(product.id);
                                queryClient.invalidateQueries({ queryKey: ["products"] });
                                toast.success("Product removed.");
                              }}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-300">—</span>
                          )}
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
