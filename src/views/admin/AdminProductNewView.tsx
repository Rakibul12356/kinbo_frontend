"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, PackagePlus } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useManagedCategories } from "@/hooks/use-categories";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { slugify } from "@/lib/categories";
import { productService } from "@/services/product.service";
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

function AddProductContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useManagedCategories();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    discountPercent: "0",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    stock: "10",
    imageUrl: "",
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const effectiveCategoryId = form.categoryId || categories[0]?.id || "";

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
    if (!form.imageUrl.trim()) nextErrors.imageUrl = "Image URL is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const product = await productService.createProduct({
        name: form.name.trim(),
        slug: `${slugify(form.name)}-${Date.now().toString(36)}`,
        description: form.description.trim(),
        price,
        discountPercent,
        stock,
        categoryId: effectiveCategoryId,
        subcategoryId: form.subcategoryId || undefined,
        brand: form.brand.trim() || undefined,
        isFeatured: form.isFeatured,
        images: [{ url: form.imageUrl.trim(), isPrimary: true }],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${product.name} is live on the store.`);
      router.push(ADMIN_ROUTES.products);
    } catch (error) {
      toast.error(extractApiError(error, "Could not create product."));
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Add product"
      description="Create a new product via the backend catalog API."
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
            <PackagePlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">New product</h2>
            <p className="text-xs text-zinc-500">Published immediately to the storefront.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Product name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Classic Denim Jacket"
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
              placeholder="Describe the product..."
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
              placeholder="2800"
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
              <label htmlFor="product-category" className="block text-xs font-semibold text-[#1F2937]">
                Category
              </label>
              <select
                id="product-category"
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
              <label htmlFor="product-subcategory" className="block text-xs font-semibold text-[#1F2937]">
                Subcategory
              </label>
              <select
                id="product-subcategory"
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
              label="Brand (optional)"
              value={form.brand}
              onChange={(event) => setField("brand", event.target.value)}
              placeholder="Kinbo Signature"
            />
          </div>

          <Input
            label="Primary Image URL"
            value={form.imageUrl}
            onChange={(event) => setField("imageUrl", event.target.value)}
            placeholder="https://... or /uploads/products/..."
            leftIcon={<ImagePlus className="h-4 w-4" />}
            error={errors.imageUrl}
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
              Publish product
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

export default function AdminProductNewView() {
  return (
    <RouteGuard step="admin">
      <AddProductContent />
    </RouteGuard>
  );
}
