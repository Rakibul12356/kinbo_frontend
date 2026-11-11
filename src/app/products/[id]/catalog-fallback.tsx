"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { findCatalogProduct } from "@/lib/catalog/catalog-store";
import ProductDetailClient from "./product-detail-client";

export default function CatalogProductFallback({ id }: { id: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#082F6B]" aria-label="Loading product" />
      </div>
    );
  }

  const product = findCatalogProduct(id);
  if (!product) notFound();

  return (
    <PageLayout>
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10">
        <ProductDetailClient product={product} />
      </main>
    </PageLayout>
  );
}
