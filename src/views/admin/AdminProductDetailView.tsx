"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import RouteGuard from "@/components/auth/RouteGuard";
import { useProduct } from "@/hooks/use-products";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { productService } from "@/services/product.service";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import AdminShell from "./AdminShell";

function stockMeta(stock: number, isManualOut?: boolean) {
  if (isManualOut || stock <= 0) {
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
  const { data: product, isLoading } = useProduct(id);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return (
      <AdminShell title="Product details" description="Admin view of catalog items.">
        <p className="text-sm text-zinc-500">Loading product…</p>
      </AdminShell>
    );
  }

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
  const stock = stockMeta(product.stock, product.isOutOfStockManual);
  const discount = calculateDiscount(product.price, product.originalPrice);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const handleToggleStock = async () => {
    const nextManual = !Boolean(product.isOutOfStockManual);
    try {
      await productService.toggleOutOfStock(product.id, nextManual);
      await refresh();
      toast.success(
        nextManual
          ? `${product.name} marked out of stock.`
          : `${product.name} marked in stock.`
      );
    } catch (error) {
      toast.error(extractApiError(error, "Could not update stock status."));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${product.name}”?`)) return;
    try {
      await productService.deleteProduct(product.id);
      await refresh();
      toast.success("Product deleted.");
      router.push(ADMIN_ROUTES.products);
    } catch (error) {
      toast.error(extractApiError(error, "Could not delete product."));
    }
  };

  return (
    <AdminShell
      title="Product details"
      description="Admin inventory view."
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
              <span
                className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${stock.className}`}
              >
                {product.stock} · {stock.label}
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:p-5">
            <div className="space-y-3">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
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
              {product.brand && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    Brand
                  </dt>
                  <dd className="mt-0.5 text-[#1F2937]">{product.brand}</dd>
                </div>
              )}
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
                onClick={handleToggleStock}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
              >
                {product.isOutOfStockManual ? (
                  <>
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    Mark in stock
                  </>
                ) : (
                  <>
                    <PackageX className="h-4 w-4 text-zinc-500" />
                    Mark out of stock
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
              Preview how customers see this item.
            </p>
            <Link
              href={`/products/${product.slug || product.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#082F6B] hover:underline"
            >
              Open public page
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
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
