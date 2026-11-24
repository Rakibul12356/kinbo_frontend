"use client";

import { useSyncExternalStore } from "react";
import {
  getManagedCategories,
  getServerManagedCategories,
  subscribeCategories,
  type ManagedCategory,
} from "@/lib/categories/categories-store";

export function useManagedCategories(): ManagedCategory[] {
  return useSyncExternalStore(
    subscribeCategories,
    getManagedCategories,
    getServerManagedCategories
  );
}
