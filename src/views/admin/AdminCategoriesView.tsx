"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useManagedCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/axios";
import { slugify } from "@/lib/categories";
import { productService } from "@/services/product.service";
import type { CategoryItem } from "@/types/ecommerce";
import AdminShell from "@/views/admin/AdminShell";

async function confirmDelete(title: string, text: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#FF6B00",
    cancelButtonColor: "#082F6B",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

type ModalMode =
  | { type: "category-add" }
  | { type: "category-edit"; category: CategoryItem }
  | { type: "sub-add"; category: CategoryItem };

function Pill({
  label,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        selected
          ? "border-2 border-[#082F6B] bg-[#E8EEF8] text-[#082F6B]"
          : "border border-transparent bg-[#F3F7FC] text-[#082F6B] hover:bg-[#E8EEF8]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onEdit}
        className="max-w-48 truncate text-left cursor-pointer"
        title={onEdit ? "Double-click to edit" : undefined}
      >
        {label}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${label}`}
          className="shrink-0 text-[#FF6B00] hover:text-[#E85D00] cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function CategoriesContent() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useManagedCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = categories.find((c) => c.id === selectedId) ?? categories[0] ?? null;
  const activeCategoryId = selected?.id ?? null;

  const openModal = (mode: ModalMode) => {
    if (mode.type === "category-add") {
      setName("");
      setDescription("");
      setImage("");
    } else if (mode.type === "category-edit") {
      setName(mode.category.name);
      setDescription(mode.category.description || "");
      setImage(mode.category.image || "");
    } else {
      setName("");
      setDescription("");
      setImage("");
    }
    setModal(mode);
  };

  const closeModal = () => setModal(null);

  const refreshCategories = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["products", "categories"] }),
    ]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!modal) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      if (modal.type === "category-add") {
        const created = await productService.createCategory({
          name: trimmed,
          slug: slugify(trimmed),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
        });
        await refreshCategories();
        setSelectedId(created.id);
        toast.success(`Category “${created.name}” created.`);
      } else if (modal.type === "category-edit") {
        await productService.updateCategory(modal.category.id, {
          name: trimmed,
          description: description.trim() || undefined,
          image: image.trim() || undefined,
        });
        await refreshCategories();
        toast.success("Category updated.");
      } else if (modal.type === "sub-add") {
        await productService.createSubcategory({
          categoryId: modal.category.id,
          name: trimmed,
          slug: slugify(trimmed),
        });
        await refreshCategories();
        toast.success("Subcategory added.");
      }
      closeModal();
    } catch (error) {
      toast.error(extractApiError(error, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: CategoryItem) => {
    const ok = await confirmDelete(
      "Delete category?",
      `Delete “${category.name}” and its ${category.subcategories.length} subcategories?`
    );
    if (!ok) return;
    try {
      await productService.deleteCategory(category.id);
      await refreshCategories();
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(extractApiError(error, "Could not delete category."));
    }
  };

  const modalTitle =
    modal?.type === "category-add"
      ? "Add category"
      : modal?.type === "category-edit"
        ? "Edit category"
        : modal?.type === "sub-add"
          ? "Add subcategory"
          : "";

  return (
    <AdminShell
      title="Categories"
      description="Organise store categories and subcategories via the backend API."
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#1F2937]">Category</h2>
            <button
              type="button"
              onClick={() => openModal({ type: "category-add" })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#E85D00] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-zinc-500">No categories yet. Add one to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <Pill
                  key={category.id}
                  label={category.name}
                  selected={category.id === activeCategoryId}
                  onSelect={() => setSelectedId(category.id)}
                  onEdit={() => openModal({ type: "category-edit", category })}
                  onDelete={() => handleDeleteCategory(category)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Sub-category</h2>
              {selected && (
                <p className="mt-0.5 text-xs text-zinc-500">Under {selected.name}</p>
              )}
            </div>
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && openModal({ type: "sub-add", category: selected })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#E85D00] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Sub-category
            </button>
          </div>

          {!selected ? (
            <p className="text-sm text-zinc-500">Select a category above.</p>
          ) : selected.subcategories.length === 0 ? (
            <p className="text-sm text-zinc-500">No subcategories yet for this category.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {selected.subcategories.map((sub) => (
                <Pill key={sub.id} label={sub.name} />
              ))}
            </div>
          )}
        </section>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
          >
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">{modalTitle}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                {modal.type === "sub-add"
                  ? `Under ${modal.category.name}`
                  : "Top-level category."}
              </p>
            </div>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                modal.type === "sub-add"
                  ? "e.g. Casual Shirts"
                  : "e.g. Electronics"
              }
              autoFocus
            />
            {(modal.type === "category-add" || modal.type === "category-edit") && (
              <>
                <Input
                  label="Image URL (optional)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
                    placeholder="Short blurb for the category"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={saving}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminCategoriesView() {
  return (
    <RouteGuard step="admin">
      <CategoriesContent />
    </RouteGuard>
  );
}
