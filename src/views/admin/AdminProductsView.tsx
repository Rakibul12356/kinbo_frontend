"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, PackagePlus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAddedProducts } from "@/hooks/use-catalog";
import { CATEGORIES } from "@/lib/categories";
import { addCatalogProduct, removeCatalogProduct } from "@/lib/catalog/catalog-store";
import { PRODUCTS_DATA } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import AdminShell from "./AdminShell";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  subcategory: string;
  stock: string;
  imageUrl: string;
  isFeatured: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: CATEGORIES[0]?.name ?? "",
  subcategory: "",
  stock: "10",
  imageUrl: "",
  isFeatured: false,
};

function ProductsContent() {
  const added = useAddedProducts();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const subcategories = useMemo(
    () => CATEGORIES.find((category) => category.name === form.category)?.subcategories ?? [],
    [form.category]
  );

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(form.price);
    const originalPrice = form.originalPrice.trim() ? Number(form.originalPrice) : undefined;
    const stock = Number(form.stock);
    const nextErrors: Partial<Record<keyof ProductForm, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.description.trim()) nextErrors.description = "Add a short description.";
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = "Enter a price greater than 0.";
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
      nextErrors.originalPrice = "Compare-at price must be higher than the selling price.";
    }
    if (!form.category) nextErrors.category = "Choose a category.";
    if (!Number.isInteger(stock) || stock < 0) nextErrors.stock = "Stock must be a whole number.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const product = addCatalogProduct({
      name: form.name,
      description: form.description,
      price,
      originalPrice,
      category: form.category,
      subcategory: form.subcategory,
      stock,
      imageUrl: form.imageUrl,
      isFeatured: form.isFeatured,
    });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success(`${product.name} is live on the store.`);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  return (
    <AdminShell
      title="Products"
      description="Add a product here. It shows up on the storefront right away."
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
              <PackagePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">New product</h2>
              <p className="text-xs text-zinc-500">Name, price, category and stock are enough to publish.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Product name"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Aura Pro Wireless Headphones"
              error={errors.name}
            />
            <div className="space-y-1.5">
              <label htmlFor="product-description" className="block text-xs font-semibold text-[#1F2937]">
                Description
              </label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                rows={4}
                placeholder="What makes this product worth buying?"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200"
                    : "border-[#E5E7EB] focus:border-[#082F6B] focus:ring-[#082F6B]/20"
                }`}
              />
              {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (৳)"
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) => setField("price", event.target.value)}
                placeholder="1450"
                error={errors.price}
              />
              <Input
                label="Compare-at price"
                type="number"
                min="1"
                step="1"
                value={form.originalPrice}
                onChange={(event) => setField("originalPrice", event.target.value)}
                placeholder="Optional"
                error={errors.originalPrice}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="product-category" className="block text-xs font-semibold text-[#1F2937]">
                  Category
                </label>
                <select
                  id="product-category"
                  value={form.category}
                  onChange={(event) => {
                    setField("category", event.target.value);
                    setField("subcategory", "");
                  }}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="product-subcategory" className="block text-xs font-semibold text-[#1F2937]">
                  Subcategory
                </label>
                <select
                  id="product-subcategory"
                  value={form.subcategory}
                  onChange={(event) => setField("subcategory", event.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
                >
                  <option value="">None</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => setField("stock", event.target.value)}
              error={errors.stock}
            />
            <Input
              label="Image URL"
              value={form.imageUrl}
              onChange={(event) => setField("imageUrl", event.target.value)}
              placeholder="https://..."
              leftIcon={<ImagePlus className="h-4 w-4" />}
            />

            <label className="flex items-center gap-2 text-sm text-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setField("isFeatured", event.target.checked)}
                className="h-4 w-4 rounded accent-[#082F6B]"
              />
              Feature this product on the storefront
            </label>

            <Button type="submit" className="w-full" isLoading={saving}>
              Publish product
            </Button>
          </div>
        </form>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Added by admin</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {added.length} new · {PRODUCTS_DATA.length + added.length} in the full catalog
              </p>
            </div>
          </div>
          {added.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F7FC] text-[#082F6B]">
                <PackagePlus className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#1F2937]">No products added yet</p>
              <p className="mt-1 text-xs text-zinc-500">Publish one from the form and it will land here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {added.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                    {/* Admin-supplied image URLs are not limited to a known host. */}
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="block truncate text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                    >
                      {product.name}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">
                      {product.category}
                      {product.subcategory ? ` · ${product.subcategory}` : ""} · {product.stock} in stock
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[#082F6B]">{formatPrice(product.price)}</p>
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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
