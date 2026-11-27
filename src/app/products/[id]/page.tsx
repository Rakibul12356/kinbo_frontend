import React, { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProductDetailClient from "./product-detail-client";

export default function ProductDetailPage() {
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Suspense fallback={<LoadingSpinner size="lg" label="Loading product..." />}>
          <ProductDetailClient />
        </Suspense>
      </main>
    </PageLayout>
  );
}
