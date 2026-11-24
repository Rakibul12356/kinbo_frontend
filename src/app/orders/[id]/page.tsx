import { Suspense } from "react";
import type { Metadata } from "next";
import OrderDetailClient from "./order-detail-client";

/** Client URL hooks block static prerender for this segment. */
export const instant = false;

export const metadata: Metadata = { title: "Order Details - Kinbo" };

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen w-full max-w-7xl bg-[#F3F7FC] px-4 py-10 sm:px-6">
          <p className="text-sm text-zinc-500">Loading order…</p>
        </main>
      }
    >
      <OrderDetailClient />
    </Suspense>
  );
}
