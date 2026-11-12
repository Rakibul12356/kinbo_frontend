"use client";

import { useSyncExternalStore } from "react";
import {
  getAddedProducts,
  getServerAddedProducts,
  subscribeCatalog,
} from "@/lib/catalog/catalog-store";
import { PRODUCTS_DATA } from "@/data/products";
import type { Product } from "@/types/ecommerce";

export function useAddedProducts() {
  return useSyncExternalStore(subscribeCatalog, getAddedProducts, getServerAddedProducts);
}

export function useCatalogProducts(): Product[] {
  const added = useAddedProducts();
  return [...added, ...PRODUCTS_DATA];
}
