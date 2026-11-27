"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useProduct } from "@/hooks/use-products";
import { useManagedCategories } from "@/hooks/use-categories";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { productService } from "@/services/product.service";
import type { CategoryItem, Product } from "@/types/ecommerce";
import AdminShell from "./AdminShell";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  stock: string;
  imageUrl: string;
  isFeatured: boolean;
}

function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const matchedCat =
    categories.find((c) => c.id === product.categoryId || c.name === product.category) ??
    categories[0];
  const matchedSub = matchedCat?.subcategories.find(
    (s) => s.id === product.subcategoryId || s.name === product.subcategory
  );

  const [form, setForm] = useState<ProductForm>({
    name: product.name,
    description: product.description,
    price: String(product.originalPrice ?? product.price),
    discountPercent: String(product.discountPercent ?? 0),
    categoryId: matchedCat?.id ?? "",
    subcategoryId: matchedSub?.id ?? "",
    brand: product.brand ?? "",
    stock: String(product.stock),
    imageUrl: product.images[0] ?? "",
    isFeatured: Boolean(product.isFeatured),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const effectiveCategoryId = form.categoryId || matchedCat?.id || "";

  const subcategories = useMemo(
    () => categories.find((cat) => cat.id === effectiveCategoryId)?.subcategories ?? [],
    [categories, effectiveCategoryId]
  );

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const price = Number(form.price);
    const discountPercent = Number(form.discountPercent || 0);
    const stock = Number(form.stock);
    const nextErrors: Partial<Record<keyof ProductForm, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.description.trim()) nextErrors.description = "Add a short description.";
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = "Enter a price greater than 0.";
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent >= 100) {
      nextErrors.discountPercent = "Discount must be between 0 and 99%.";
    }
    if (!effectiveCategoryId) nextErrors.categoryId = "Choose a category.";
    if (!Number.isInteger(stock) || stock < 0) nextErrors.stock = "Stock must be a whole number.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await productService.updateProduct(product.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        discountPercent,
        stock,
        categoryId: effectiveCategoryId,
        subcategoryId: form.subcategoryId || undefined,
        brand: form.brand.trim() || undefined,
        isFeatured: form.isFeatured,
        images: form.imageUrl.trim()
          ? [{ url: form.imageUrl.trim(), isPrimary: true }]
          : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${updated.name} updated.`);
      router.push(ADMIN_ROUTES.products);
    } catch (error) {
      toast.error(extractApiError(error, "Could not update this product."));
      setSaving(false);
    }
  };

  return (
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
            label="Base Price (৳)"
            type="number"
            min="1"
            step="1"
            value={form.price}
            onChange={(event) => setField("price", event.target.value)}
            error={errors.price}
          />
          <Input
            label="Discount (%)"
            type="number"
            min="0"
            max="99"
            step="1"
            value={form.discountPercent}
            onChange={(event) => setField("discountPercent", event.target.value)}
            error={errors.discountPercent}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="edit-product-category" className="block text-xs font-semibold text-[#1F2937]">
              Category
            </label>
            <select
              id="edit-product-category"
              value={effectiveCategoryId}
              onChange={(event) => {
                setField("categoryId", event.target.value);
                setField("subcategoryId", "");
              }}
              className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-rose-500">{errors.categoryId}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-product-subcategory" className="block text-xs font-semibold text-[#1F2937]">
              Subcategory
            </label>
            <select
              id="edit-product-subcategory"
              value={form.subcategoryId}
              onChange={(event) => setField("subcategoryId", event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
            >
              <option value="">None</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            label="Brand"
            value={form.brand}
            onChange={(event) => setField("brand", event.target.value)}
          />
        </div>

        <Input
          label="Primary Image URL"
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
  );
}

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { data: product, isLoading } = useProduct(id);
  const { data: categories = [] } = useManagedCategories();

  if (isLoading) {
    return (
      <AdminShell title="Edit product" description="Update product details.">
        <p className="text-sm text-zinc-500">Loading product…</p>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell title="Edit product" description="Update product details.">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
          <p className="text-sm font-semibold text-[#1F2937]">Product not found</p>
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
      <EditProductForm key={product.id} product={product} categories={categories} />
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
