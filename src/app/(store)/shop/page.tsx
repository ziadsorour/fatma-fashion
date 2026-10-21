import { getPublishedProducts, getProductCount, getCategories } from '@/lib/db/queries';
import { ShopClient } from './shop-client';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let products: any[] = [];
  let total = 0;
  let categories: any[] = [];

  try {
    products = getPublishedProducts({
      limit,
      offset,
      categorySlug: params.category,
      search: params.q,
      sort: params.sort || 'newest',
      featured: params.collection === 'featured',
      bestseller: params.collection === 'best-sellers',
    });
    total = getProductCount({ categorySlug: params.category, search: params.q });
    categories = getCategories();
  } catch (e) {
    console.log('Database not initialized');
  }

  return (
    <ShopClient
      products={products}
      categories={categories}
      pagination={{ page, limit, total, totalPages: Math.ceil(total / limit) }}
      initialCategory={params.category || ''}
      initialSort={params.sort || 'newest'}
      initialSearch={params.q || ''}
    />
  );
}
