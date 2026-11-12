"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { CATEGORIES } from "@/lib/categories";
import { updateCatalogProduct } from "@/lib/catalog/catalog-store";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
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

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const products = useCatalogProducts();
  const product = products.find((item) => item.id === id);

  const [form, setForm] = useState<ProductForm | null>(() =>
    product
      ? {
          name: product.name,
          description: product.description,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          category: product.category,
          subcategory: product.subcategory ?? "",
          stock: String(product.stock),
          imageUrl: product.images[0] ?? "",
          isFeatured: Boolean(product.isFeatured),
        }
      : null
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) {
      setForm(null);
      return;
    }
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      subcategory: product.subcategory ?? "",
      stock: String(product.stock),
      imageUrl: product.images[0] ?? "",
      isFeatured: Boolean(product.isFeatured),
    });
    // Only re-hydrate when navigating to a different product id.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- product object identity can change; id is the real key
  }, [id, product?.id]);

  const subcategories = useMemo(
    () => CATEGORIES.find((category) => category.name === form?.category)?.subcategories ?? [],
    [form?.category]
  );

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;

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
    const updated = updateCatalogProduct(id, {
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
    if (!updated) {
      toast.error("Could not update this product.");
      setSaving(false);
      return;
    }
    toast.success(`${updated.name} updated.`);
    router.push(ADMIN_ROUTES.products);
  };

  if (!product || !form) {
    return (
      <AdminShell title="Edit product" description="Update product details.">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
          <p className="text-sm font-semibold text-[#1F2937]">Product not found</p>
          <p className="mt-1 text-xs text-zinc-500">It may have been deleted.</p>
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

  return (
    <AdminShell
      title="Edit product"
      description="Change name, price, stock and other details."
      actions={
        <Link
          href={ADMIN_ROUTES.products}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
            <Pencil className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-[#1F2937]">{product.name}</h2>
            <p className="font-mono text-[11px] text-zinc-400">{product.id}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Product name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            error={errors.name}
          />
          <div className="space-y-1.5">
            <label htmlFor="edit-product-description" className="block text-xs font-semibold text-[#1F2937]">
              Description
            </label>
            <textarea
              id="edit-product-description"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
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
              <label htmlFor="edit-product-category" className="block text-xs font-semibold text-[#1F2937]">
                Category
              </label>
              <select
                id="edit-product-category"
                value={form.category}
                onChange={(event) => {
                  setField("category", event.target.value);
                  setField("subcategory", "");
                }}
                className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-product-subcategory" className="block text-xs font-semibold text-[#1F2937]">
                Subcategory
              </label>
              <select
                id="edit-product-subcategory"
                value={form.subcategory}
                onChange={(event) => setField("subcategory", event.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
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

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1F2937]">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => setField("isFeatured", event.target.checked)}
              className="h-4 w-4 rounded accent-[#082F6B]"
            />
            Feature this product on the storefront
          </label>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" className="sm:flex-1" isLoading={saving}>
              Save changes
            </Button>
            <Link
              href={ADMIN_ROUTES.products}
              className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminProductEditView() {
  return (
    <RouteGuard step="admin">
      <EditProductContent />
    </RouteGuard>
  );
}
