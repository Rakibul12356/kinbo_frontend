"use client";

import { useSyncExternalStore } from "react";
import {
  getAddedProducts,
  getServerAddedProducts,
  subscribeCatalog,
} from "@/lib/catalog/catalog-store";

export function useAddedProducts() {
  return useSyncExternalStore(subscribeCatalog, getAddedProducts, getServerAddedProducts);
}
