"use client";

import { useSyncExternalStore } from "react";
import {
  getServerReviews,
  listAllReviews,
  subscribeReviews,
} from "@/lib/reviews/review-store";

export function useReviews() {
  return useSyncExternalStore(subscribeReviews, listAllReviews, getServerReviews);
}
