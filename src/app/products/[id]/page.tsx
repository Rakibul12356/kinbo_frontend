import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import ProductDetailClient from "./product-detail-client";

export default function ProductDetailPage() {
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#082F6B]" aria-label="Loading product" />
            </div>
          }
        >
          <ProductDetailClient />
        </Suspense>
      </main>
    </PageLayout>
  );
}
