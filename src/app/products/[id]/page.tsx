import React from "react";
import { productService } from "@/services/product.service";
import PageLayout from "@/components/layout/PageLayout";
import CatalogProductFallback from "./catalog-fallback";
import ProductDetailClient from "./product-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    return <CatalogProductFallback id={id} />;
  }

  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ProductDetailClient product={product} />
      </main>
    </PageLayout>
  );
}
