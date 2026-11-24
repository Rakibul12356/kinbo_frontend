"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useManagedCategories } from "@/hooks/use-categories";
import {
  addManagedCategory,
  addManagedSubcategory,
  deleteManagedCategory,
  deleteManagedSubcategory,
  updateManagedCategory,
  updateManagedSubcategory,
  type ManagedCategory,
} from "@/lib/categories/categories-store";
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
  | { type: "category-edit"; category: ManagedCategory }
  | { type: "sub-add"; category: ManagedCategory }
  | { type: "sub-edit"; category: ManagedCategory; subcategoryId: string; name: string };

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
  onDelete: () => void;
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
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="shrink-0 text-[#FF6B00] hover:text-[#E85D00] cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CategoriesContent() {
  const categories = useManagedCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !categories.some((c) => c.id === selectedId)) {
      setSelectedId(categories[0].id);
    }
  }, [categories, selectedId]);

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const openModal = (mode: ModalMode) => {
    if (mode.type === "category-add") {
      setName("");
      setDescription("");
    } else if (mode.type === "category-edit") {
      setName(mode.category.name);
      setDescription(mode.category.description);
    } else if (mode.type === "sub-add") {
      setName("");
      setDescription("");
    } else {
      setName(mode.name);
      setDescription("");
    }
    setModal(mode);
  };

  const closeModal = () => setModal(null);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!modal) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required.");
      return;
    }

    if (modal.type === "category-add") {
      const created = addManagedCategory({ name: trimmed, description });
      setSelectedId(created.id);
      toast.success(`Category “${created.name}” added.`);
    } else if (modal.type === "category-edit") {
      updateManagedCategory(modal.category.id, { name: trimmed, description });
      toast.success("Category updated.");
    } else if (modal.type === "sub-add") {
      addManagedSubcategory(modal.category.id, trimmed);
      toast.success("Subcategory added.");
    } else {
      updateManagedSubcategory(modal.category.id, modal.subcategoryId, trimmed);
      toast.success("Subcategory updated.");
    }
    closeModal();
  };

  const handleDeleteCategory = async (category: ManagedCategory) => {
    const ok = await confirmDelete(
      "Delete category?",
      `Delete “${category.name}” and its ${category.subcategories.length} subcategories?`
    );
    if (!ok) return;
    deleteManagedCategory(category.id);
    toast.success("Category removed.");
  };

  const handleDeleteSub = async (
    categoryId: string,
    subcategoryId: string,
    subName: string
  ) => {
    const ok = await confirmDelete(
      "Delete subcategory?",
      `Delete “${subName}”? This cannot be undone.`
    );
    if (!ok) return;
    deleteManagedSubcategory(categoryId, subcategoryId);
    toast.success("Subcategory removed.");
  };

  const modalTitle =
    modal?.type === "category-add"
      ? "Add category"
      : modal?.type === "category-edit"
        ? "Edit category"
        : modal?.type === "sub-add"
          ? "Add subcategory"
          : modal?.type === "sub-edit"
            ? "Edit subcategory"
            : "";

  return (
    <AdminShell
      title="Categories"
      description="Organise store categories. Pick a category to manage its subcategories."
    >
      <div className="space-y-5">
        {/* Category panel */}
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

          {categories.length === 0 ? (
            <p className="text-sm text-zinc-500">No categories yet. Add one to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <Pill
                  key={category.id}
                  label={category.name}
                  selected={category.id === selectedId}
                  onSelect={() => setSelectedId(category.id)}
                  onEdit={() => openModal({ type: "category-edit", category })}
                  onDelete={() => handleDeleteCategory(category)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sub-category panel */}
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
                <Pill
                  key={sub.id}
                  label={sub.name}
                  onEdit={() =>
                    openModal({
                      type: "sub-edit",
                      category: selected,
                      subcategoryId: sub.id,
                      name: sub.name,
                    })
                  }
                  onDelete={() => handleDeleteSub(selected.id, sub.id, sub.name)}
                />
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
                {modal.type.startsWith("sub")
                  ? `Under ${"category" in modal ? modal.category.name : ""}`
                  : "Top-level category only."}
              </p>
            </div>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                modal.type.startsWith("sub")
                  ? "e.g. Computer Accessories"
                  : "e.g. Electronics & Gadgets"
              }
              autoFocus
            />
            {(modal.type === "category-add" || modal.type === "category-edit") && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
                  placeholder="Short blurb for the category page"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm">
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
