"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, MoreHorizontal, PackageCheck, PackageX, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/ecommerce";

export default function ProductRowActions({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
      setOpen(false);
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
      setOpen(false);
    } catch (error) {
      toast.error(extractApiError(error, "Could not delete product."));
    }
  };

  return (
    <div className="relative inline-flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${product.name}`}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-[#F3F7FC] hover:text-[#082F6B] cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          <Link
            href={ADMIN_ROUTES.productDetail(product.id)}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F3F7FC]"
          >
            <Eye className="h-4 w-4 text-zinc-500" />
            View
          </Link>
          <Link
            href={ADMIN_ROUTES.productEdit(product.id)}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F3F7FC]"
          >
            <Pencil className="h-4 w-4 text-zinc-500" />
            Edit
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleToggleStock}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-[#1F2937] hover:bg-[#F3F7FC]"
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
            role="menuitem"
            onClick={handleDelete}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
