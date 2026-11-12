"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  PackageX,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import RouteGuard from "@/components/auth/RouteGuard";
import { useCatalogProducts } from "@/hooks/use-catalog";
import {
  isAdminOwnedProduct,
  removeCatalogProduct,
  setCatalogProductOutOfStock,
} from "@/lib/catalog/catalog-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import AdminShell from "./AdminShell";

function stockMeta(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", className: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (stock <= 5) {
    return { label: "Low stock", className: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  return { label: "In stock", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function DetailContent() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const products = useCatalogProducts();
  const product = products.find((item) => item.id === id);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!product) {
    return (
      <AdminShell title="Product details" description="Admin view of catalog items.">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
          <p className="text-sm font-semibold text-[#1F2937]">Product not found</p>
          <p className="mt-1 text-xs text-zinc-500">It may have been deleted from the catalog.</p>
          <Link
            href={ADMIN_ROUTES.products}
            className="mt-4 inline-flex text-xs font-semibold text-[#082F6B] hover:underline"
          >
            Back to products
          </Link>
        </div>
      </AdminShell>
    );
  }

  const images = product.images.length > 0 ? product.images : ["/images/logo.png"];
  const activeImage = images[Math.min(activeIndex, images.length - 1)];
  const stock = stockMeta(product.stock);
  const discount = calculateDiscount(product.price, product.originalPrice);
  const adminOwned = isAdminOwnedProduct(product);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  return (
    <AdminShell
      title="Product details"
      description="Admin inventory view — stays inside the dashboard."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={ADMIN_ROUTES.products}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <Link
            href={ADMIN_ROUTES.productEdit(product.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#082F6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0a3a85]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-zinc-400">{product.id}</p>
                <h2 className="mt-0.5 text-lg font-bold text-[#1F2937] sm:text-xl">{product.name}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {product.category}
                  {product.subcategory ? ` · ${product.subcategory}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${stock.className}`}
                >
                  {product.stock} · {stock.label}
                </span>
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                    adminOwned
                      ? "border-[#082F6B]/20 bg-[#082F6B]/10 text-[#082F6B]"
                      : "border-[#E5E7EB] bg-white text-zinc-600"
                  }`}
                >
                  {adminOwned ? "Admin added" : "Demo catalog"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:p-5">
            <div className="space-y-3">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-14 w-14 overflow-hidden rounded-lg border cursor-pointer ${
                        index === activeIndex
                          ? "border-[#082F6B] ring-2 ring-[#082F6B]/20"
                          : "border-[#E5E7EB]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <dl className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Selling price
                </dt>
                <dd className="mt-0.5 text-xl font-bold text-[#082F6B]">{formatPrice(product.price)}</dd>
                {product.originalPrice != null && product.originalPrice > product.price && (
                  <p className="mt-1 text-xs text-zinc-500">
                    <span className="line-through">{formatPrice(product.originalPrice)}</span>
                    {discount > 0 && (
                      <span className="ms-2 font-semibold text-[#FF6B00]">-{discount}%</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Rating
                </dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-[#1F2937]">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)}
                  <span className="font-normal text-zinc-400">({product.reviewCount} reviews)</span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Unit / delivery
                </dt>
                <dd className="mt-0.5 text-[#1F2937]">
                  {product.unit ?? "Piece"}
                  {product.deliveryTime ? ` · ${product.deliveryTime}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Slug
                </dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-zinc-500">{product.slug}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-[#E5E7EB] px-4 py-4 sm:px-5">
            <h3 className="text-sm font-bold text-[#1F2937]">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#082F6B]" />
              <h3 className="text-sm font-bold text-[#1F2937]">Admin actions</h3>
            </div>
            <div className="space-y-2">
              <Link
                href={ADMIN_ROUTES.productEdit(product.id)}
                className="flex w-full items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
              >
                <Pencil className="h-4 w-4 text-zinc-500" />
                Edit details
              </Link>
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  setCatalogProductOutOfStock(product.id);
                  refresh();
                  toast.success(`${product.name} marked out of stock.`);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PackageX className="h-4 w-4 text-zinc-500" />
                Mark out of stock
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Delete “${product.name}”?`)) return;
                  removeCatalogProduct(product.id);
                  refresh();
                  toast.success("Product deleted.");
                  router.push(ADMIN_ROUTES.products);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete product
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <h3 className="text-sm font-bold text-[#1F2937]">Storefront</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Optional preview of how customers see this item.
            </p>
            <Link
              href={`/products/${product.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Open public page
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <h3 className="text-sm font-bold text-[#1F2937]">Flags</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-zinc-600">
              <li>Featured: {product.isFeatured ? "Yes" : "No"}</li>
              <li>New arrival: {product.isNewArrival ? "Yes" : "No"}</li>
              <li>Discount badge: {product.discountType ?? "None"}</li>
            </ul>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

export default function AdminProductDetailView() {
  return (
    <RouteGuard step="admin">
      <DetailContent />
    </RouteGuard>
  );
}
