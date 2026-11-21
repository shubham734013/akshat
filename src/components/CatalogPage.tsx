import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { filterAndSortProducts, type ProductFilterOptions } from '../utils/commerce';
import { ProductCard } from './ProductCard';

const PAGE_SIZE = 8;

export const CatalogPage: React.FC = () => {
  const { route, navigate, categories, products } = useStore();

  const [categorySlug, setCategorySlug] = useState<string>(route.category || 'all');
  const [festivalSlug, setFestivalSlug] = useState<string>(route.festival || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(route.search || '');
  const [priceRange, setPriceRange] = useState<'all' | 'under-500' | '500-1500' | 'over-1500'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ProductFilterOptions['sortBy']>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setCategorySlug(route.category || 'all');
    setFestivalSlug(route.festival || 'all');
    setSearchQuery(route.search || '');
    setVisibleCount(PAGE_SIZE);
  }, [route.category, route.festival, route.search]);

  const coreCategories = categories.filter((c) => c.isActive && !c.isFestival);
  const festivalCategories = categories.filter((c) => c.isActive && c.isFestival);

  const filteredProducts = useMemo(() => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange === 'under-500') maxPrice = 499;
    if (priceRange === '500-1500') {
      minPrice = 500;
      maxPrice = 1500;
    }
    if (priceRange === 'over-1500') minPrice = 1501;

    return filterAndSortProducts(products, {
      categorySlug: categorySlug === 'festival-collections' ? 'all' : categorySlug,
      festivalSlug,
      searchQuery,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
    });
  }, [products, categorySlug, festivalSlug, searchQuery, priceRange, inStockOnly, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const activeHeading = useMemo(() => {
    if (festivalSlug && festivalSlug !== 'all') {
      const f = festivalCategories.find((c) => c.slug === festivalSlug);
      return f ? `${f.name} Collection` : 'Festival Collection';
    }
    if (categorySlug && categorySlug !== 'all') {
      const c = coreCategories.find((cat) => cat.slug === categorySlug);
      return c ? c.name : 'Collection';
    }
    if (searchQuery.trim()) return `Results for "${searchQuery.trim()}"`;
    return 'All Pooja Essentials';
  }, [categorySlug, festivalSlug, searchQuery, coreCategories, festivalCategories]);

  const resetAllFilters = () => {
    setCategorySlug('all');
    setFestivalSlug('all');
    setSearchQuery('');
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('featured');
    navigate({ page: 'shop' });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Page Header */}
      <div className="pb-8 border-b border-[#E5DCCB] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav aria-label="Breadcrumb" className="text-xs text-[#5C574F] flex items-center gap-2">
            <button type="button" onClick={() => navigate({ page: 'home' })} className="hover:text-[#702F32]">
              Home
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[#242320]">Shop</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320]">{activeHeading}</h1>
          <p className="text-sm text-[#5C574F] tabular-nums">
            Showing {displayedProducts.length} of {filteredProducts.length} products · All prices inclusive of GST
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <label htmlFor="catalog-search" className="sr-only">
              Search within products
            </label>
            <Search className="w-4 h-4 text-[#5C574F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or origin..."
              className="w-full sm:w-64 pl-9 pr-3 py-2.5 bg-white border border-[#E5DCCB] text-sm text-[#242320]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="catalog-sort" className="text-xs text-[#5C574F] whitespace-nowrap">
              Sort by
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductFilterOptions['sortBy'])}
              className="px-3 py-2.5 bg-white border border-[#E5DCCB] text-sm text-[#242320]"
            >
              <option value="featured">Featured & Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="py-6 border-b border-[#E5DCCB] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#5C574F] mr-2 inline-flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Category:
          </span>
          <button
            type="button"
            onClick={() => {
              setCategorySlug('all');
              setFestivalSlug('all');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              categorySlug === 'all' && festivalSlug === 'all'
                ? 'bg-[#702F32] text-[#FAF7F0]'
                : 'bg-[#F3EDE0] text-[#242320] hover:bg-[#E5DCCB]'
            }`}
          >
            All Products
          </button>
          {coreCategories
            .filter((c) => c.slug !== 'festival-collections')
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategorySlug(cat.slug);
                  setFestivalSlug('all');
                }}
                className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  categorySlug === cat.slug
                    ? 'bg-[#702F32] text-[#FAF7F0]'
                    : 'bg-[#F3EDE0] text-[#242320] hover:bg-[#E5DCCB]'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#5C574F] mr-1">Festival:</span>
            {festivalCategories.map((fest) => (
              <button
                key={fest.id}
                type="button"
                onClick={() => {
                  setFestivalSlug(festivalSlug === fest.slug ? 'all' : fest.slug);
                  setCategorySlug('all');
                }}
                className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap border ${
                  festivalSlug === fest.slug
                    ? 'bg-[#34483B] text-[#FAF7F0] border-[#34483B]'
                    : 'bg-white text-[#242320] border-[#E5DCCB] hover:border-[#34483B]'
                }`}
              >
                {fest.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="price-filter" className="text-[#5C574F]">
                Price:
              </label>
              <select
                id="price-filter"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                className="px-2.5 py-1.5 bg-white border border-[#E5DCCB] text-[#242320]"
              >
                <option value="all">All Prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1500">₹500 – ₹1,500</option>
                <option value="over-1500">Above ₹1,500</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-[#242320] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#702F32]"
              />
              <span>In stock only</span>
            </label>

            {(categorySlug !== 'all' || festivalSlug !== 'all' || searchQuery || priceRange !== 'all' || inStockOnly) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-[#702F32] hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {displayedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 border-b border-[#E5DCCB]">
          <h2 className="font-display text-3xl text-[#242320]">No matching essentials found</h2>
          <p className="text-sm text-[#5C574F] max-w-md mx-auto">
            Try clearing a price range, festival filter, or searching with a broader term like “kumkum”, “brass”, or
            “kit”.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="pt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-8 py-3 border border-[#242320] text-sm font-medium text-[#242320] hover:bg-[#242320] hover:text-[#FAF7F0] transition-colors"
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};
