"use client";

import ProductListing from "@/components/modules/product/ProductListing";
import {
  DEFAULT_FILTER_SECTIONS,
  type FilterSectionConfig,
} from "@/components/filters/filter-config";
import { useT } from "@/hooks/use-t";

const FILTER_SECTIONS: FilterSectionConfig[] = [
  {
    type: "facet",
    id: "category",
    title: "Category",
    field: "category",
    searchable: true,
    searchPlaceholder: "Search category",
  },
  ...DEFAULT_FILTER_SECTIONS,
];

export default function ProductsPage() {
  const t = useT();

  return (
    <ProductListing
      title={t("products.title")}
      description={t("products.subtitle")}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: t("products.title") },
      ]}
      filterSections={FILTER_SECTIONS}
    />
  );
}
