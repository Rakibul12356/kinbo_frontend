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
import { addCatalogProduct } from "@/lib/catalog/catalog-store";
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

function AddProductContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categories = useManagedCategories();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    stock: "10",
    imageUrl: "",
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!form.category && categories[0]) {
      setForm((current) => ({ ...current, category: categories[0].name }));
    }
  }, [categories, form.category]);

  const subcategories = useMemo(
    () => categories.find((category) => category.name === form.category)?.subcategories ?? [],
    [categories, form.category]
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
    router.push(ADMIN_ROUTES.products);
  };

  return (
    <AdminShell
      title="Add product"
      description="Name, price, category and stock are enough to publish."
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
            <p className="text-xs text-zinc-500">It shows up on the storefront right away.</p>
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
                className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-subcategory" className="block text-xs font-semibold text-[#1F2937]">
                Subcategory
              </label>
              <select
                id="product-subcategory"
                value={form.subcategory}
                onChange={(event) => setField("subcategory", event.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
              >
                <option value="">None</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.name}>
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
