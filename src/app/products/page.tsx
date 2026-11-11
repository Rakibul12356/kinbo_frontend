import ProductListing from "@/components/modules/product/ProductListing";
import {
  DEFAULT_FILTER_SECTIONS,
  type FilterSectionConfig,
} from "@/components/filters/filter-config";

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
  return (
    <ProductListing
      title="All Products"
      description="Browse the full Kinbo catalog with filters for price, discount, rating and more."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "All Products" },
      ]}
      filterSections={FILTER_SECTIONS}
    />
  );
}
