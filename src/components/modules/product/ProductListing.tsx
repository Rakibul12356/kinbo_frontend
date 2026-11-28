"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/common/Breadcrumbs";
import ProductGrid from "@/components/modules/product/ProductGrid";
import FilterSidebar from "@/components/filters/FilterSidebar";
import {
  DEFAULT_FILTER_SECTIONS,
  EMPTY_FILTER_STATE,
  applyFilters,
  type FilterSectionConfig,
  type FilterState,
} from "@/components/filters/filter-config";
import { useProducts } from "@/hooks/use-products";
import type { ProductFilterParams } from "@/services/product.service";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useT } from "@/hooks/use-t";

export { DEFAULT_FILTER_SECTIONS };

const PAGE_SIZE = 12;

interface ProductListingProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  /** Server-side product query, e.g. `{ category, subcategory }`. */
  query?: ProductFilterParams;
  /** Sidebar sections in display order; defaults to price, discount, rating, tags, availability. */
  filterSections?: FilterSectionConfig[];
}

export default function ProductListing(props: ProductListingProps) {
  return (
    <Suspense fallback={<ProductListingFallback title={props.title} />}>
      <ProductListingContent {...props} />
    </Suspense>
  );
}

function ProductListingFallback({ title }: { title: string }) {
  const t = useT();
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{t("products.loading")}</p>
      </main>
    </PageLayout>
  );
}

function ProductListingContent({
  title,
  description,
  breadcrumbs,
  query,
  filterSections = DEFAULT_FILTER_SECTIONS,
}: ProductListingProps) {
  const t = useT();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";

  const [searchDraft, setSearchDraft] = useState<{ query: string; base: string } | null>(null);
  const searchQuery =
    searchDraft && searchDraft.base === initialQuery ? searchDraft.query : initialQuery;
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER_STATE);
  const [page, setPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProducts({
    ...query,
    search: searchQuery || undefined,
  });

  const visibleProducts = useMemo(() => {
    return applyFilters(products, filterSections, filters).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [products, filterSections, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = visibleProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchDraft({ query: value, base: initialQuery });
    setPage(1);
  };

  const rangeStart = visibleProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, visibleProducts.length);

  const sidebar = (
    <FilterSidebar
      sections={filterSections}
      products={products}
      state={filters}
      onChange={handleFiltersChange}
    />
  );

  return (
    <PageLayout onSearchChange={handleSearchChange} className="bg-[#F8FAFC]">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:self-start lg:sticky lg:top-24">
            {sidebar}
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">{title}</h1>
                {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
                <p className="mt-1 text-xs text-zinc-500">
                  {isLoading
                    ? t("products.loading")
                    : visibleProducts.length === 0
                      ? t("products.showing", { from: 0, to: 0, total: 0 })
                      : t("products.showing", {
                          from: rangeStart,
                          to: rangeEnd,
                          total: visibleProducts.length,
                        })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-[#1F2937] cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("products.filters")}
                </button>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="hidden sm:block w-4 h-4 text-zinc-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Sort products"
                    className="text-sm bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#1F2937] outline-none focus:border-[#082F6B] cursor-pointer"
                  >
                    <option value="featured">{t("products.featured")}</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-12 text-center">
                <p className="text-sm font-bold text-rose-800">Could not load products</p>
                <p className="mt-1 text-xs text-rose-600">
                  Check that the API is reachable, then try again.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-4 inline-flex rounded-xl bg-[#082F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#062452] disabled:opacity-60 cursor-pointer"
                >
                  {isFetching ? "Retrying…" : "Retry"}
                </button>
              </div>
            ) : (
              <ProductGrid products={pagedProducts} isLoading={isLoading} />
            )}

            {!isLoading && !isError && visibleProducts.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={currentPage <= 1}
                  aria-label="First page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  const active = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition cursor-pointer ${
                        active
                          ? "bg-[#082F6B] text-white"
                          : "border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F3F7FC]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  aria-label="Last page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#082F6B] transition enabled:hover:bg-[#F3F7FC] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-[#F8FAFC] p-4 shadow-xl">
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-lg hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
