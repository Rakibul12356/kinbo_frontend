import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductListing from "@/components/modules/product/ProductListing";
import type { FilterSectionConfig } from "@/components/filters/filter-config";
import {
  CATEGORIES,
  categoryHref,
  getCategoryBySlug,
} from "@/lib/categories";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category not found - Kinbo" };
  return {
    title: `${category.name} - Kinbo`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const filterSections: FilterSectionConfig[] = [
    {
      type: "links",
      title: category.name,
      links: [
        { label: `All ${category.name}`, href: categoryHref(category.slug), active: true },
        ...category.subcategories.map((sub) => ({
          label: sub.name,
          href: categoryHref(category.slug, sub.slug),
          active: false,
        })),
      ],
    },
    { type: "price" },
    { type: "discount" },
    { type: "rating" },
    { type: "facet", id: "subcategory", title: "Category", field: "subcategory" },
    {
      type: "facet",
      id: "tags",
      title: "Product Tags",
      field: "tags",
      searchable: true,
      searchPlaceholder: "Select Tags",
    },
    { type: "availability" },
  ];

  return (
    <ProductListing
      title={category.name}
      description={category.description}
      breadcrumbs={[{ label: category.name }]}
      query={{ category: category.name }}
      filterSections={filterSections}
    />
  );
}
