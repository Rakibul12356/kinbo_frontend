"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import HeroBanner from "@/components/modules/home/HeroBanner";
import CategoryExpandSlider from "@/components/modules/home/CategoryExpandSlider";
import FeaturedSection from "@/components/modules/home/FeaturedSection";
import { useProducts } from "@/hooks/use-products";

export default function HomePage() {
  const router = useRouter();
  const { data: products = [] } = useProducts();

  return (
    <PageLayout>
      <main className="flex-1">
        <HeroBanner onExploreClick={() => router.push("/products")} />
        <CategoryExpandSlider />
        {products.length > 0 && <FeaturedSection products={products} />}
      </main>
    </PageLayout>
  );
}
