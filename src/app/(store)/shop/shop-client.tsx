"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  products: any[];
  categories: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  initialCategory: string;
  initialSort: string;
  initialSearch: string;
}

export function ShopClient({ products, categories, pagination, initialCategory, initialSort, initialSearch }: Props) {
  const { t, locale, dir } = useI18n();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  const buildUrl = (params: Record<string, string>) => {
    const url = new URL('/shop', window.location.origin);
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    return url.pathname + url.search;
  };

  const handleSort = (sort: string) => {
    router.push(buildUrl({ sort, category: initialCategory, q: initialSearch }));
  };

  const handleCategory = (slug: string) => {
    router.push(buildUrl({ category: slug === initialCategory ? '' : slug, sort: initialSort, q: initialSearch }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ q: search, sort: initialSort, category: initialCategory }));
  };

  const sortOptions = [
    { value: 'newest', label: t('product.newest') },
    { value: 'price_asc', label: t('product.priceLowToHigh') },
    { value: 'price_desc', label: t('product.priceHighToLow') },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-beige">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-charcoal/60">
            <Link href="/" className="hover:text-rose-gold">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal font-medium">{t('nav.shop')}</span>
            {initialCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-charcoal font-medium">
                  {categories.find((c: any) => c.slug === initialCategory)?.[locale === 'ar' ? 'name_ar' : 'name_en'] || initialCategory}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full h-10 ps-10 pe-4 rounded-lg border border-beige bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold"
            />
          </form>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 px-4 h-10 border border-beige rounded-lg text-sm bg-white hover:bg-beige/30"
            >
              <SlidersHorizontal className="h-4 w-4" /> {t('common.filter')}
            </button>
            <select
              value={initialSort}
              onChange={(e) => handleSort(e.target.value)}
              className="h-10 px-3 border border-beige rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-gold/30 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} md:block md:relative md:w-56 flex-shrink-0`}>
            {filtersOpen && (
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h3 className="font-semibold">{t('common.filter')}</h3>
                <button onClick={() => setFiltersOpen(false)}><X className="h-5 w-5" /></button>
              </div>
            )}

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-charcoal mb-3">{t('categories.shopByCategory')}</h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategory('')}
                  className={`block w-full text-start text-sm py-1.5 px-2 rounded transition-colors ${!initialCategory ? 'text-rose-gold font-medium bg-rose-gold/5' : 'text-charcoal/70 hover:text-rose-gold'}`}
                >
                  {t('common.all')}
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategory(cat.slug)}
                    className={`block w-full text-start text-sm py-1.5 px-2 rounded transition-colors ${initialCategory === cat.slug ? 'text-rose-gold font-medium bg-rose-gold/5' : 'text-charcoal/70 hover:text-rose-gold'}`}
                  >
                    {locale === 'ar' ? cat.name_ar : cat.name_en}
                  </button>
                ))}
              </div>
            </div>

            {filtersOpen && (
              <Button onClick={() => setFiltersOpen(false)} className="w-full md:hidden">{t('common.apply')}</Button>
            )}
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <p className="text-sm text-charcoal/60 mb-4">
              {t('product.showingResults', { count: String(pagination.total) })}
            </p>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    nameAr={product.nameAr}
                    nameEn={product.nameEn}
                    price={product.price}
                    salePrice={product.salePrice}
                    imageUrl={product.imageUrl}
                    isNew={Date.now() - product.createdAt < 7 * 24 * 60 * 60 * 1000}
                    isBestSeller={!!product.isBestseller}
                    isOnSale={!!product.salePrice}
                    lowStock={product.lowStock}
                    outOfStock={product.outOfStock}
                    firstVariantId={product.firstVariantId}
                    firstVariantSize={product.firstVariantSize}
                    firstVariantColor={product.firstVariantColor}
                    firstVariantColorAr={product.firstVariantColorAr}
                    firstVariantColorHex={product.firstVariantColorHex}
                    firstVariantSku={product.firstVariantSku}
                    firstVariantStock={product.firstVariantStock}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('product.noProductsFound')}
                description={locale === 'ar' ? 'جربي تغيير الفلتر أو البحث' : 'Try changing your filters or search'}
                actionLabel={t('common.clear')}
                onAction={() => router.push('/shop')}
              />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {pagination.page > 1 && (
                  <Link href={buildUrl({ page: String(pagination.page - 1), category: initialCategory, sort: initialSort, q: initialSearch })}>
                    <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                  </Link>
                )}
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={buildUrl({ page: String(p), category: initialCategory, sort: initialSort, q: initialSearch })}>
                    <Button variant={p === pagination.page ? "default" : "outline"} size="icon" className="w-10 h-10">{p}</Button>
                  </Link>
                ))}
                {pagination.page < pagination.totalPages && (
                  <Link href={buildUrl({ page: String(pagination.page + 1), category: initialCategory, sort: initialSort, q: initialSearch })}>
                    <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
