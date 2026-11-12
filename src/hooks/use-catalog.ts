"use client";

import { useSyncExternalStore } from "react";
import {
  getAddedProducts,
  getCatalogProducts,
  getServerAddedProducts,
  subscribeCatalog,
} from "@/lib/catalog/catalog-store";
import { PRODUCTS_DATA } from "@/data/products";
import type { Product } from "@/types/ecommerce";

export function useAddedProducts() {
  return useSyncExternalStore(subscribeCatalog, getAddedProducts, getServerAddedProducts);
}

function getServerCatalogProducts(): Product[] {
  return PRODUCTS_DATA;
}

export function useCatalogProducts(): Product[] {
  return useSyncExternalStore(subscribeCatalog, getCatalogProducts, getServerCatalogProducts);
}
