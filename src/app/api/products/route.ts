import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProducts, getProductCount } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  const options = {
    limit,
    offset,
    categorySlug: searchParams.get('category') || undefined,
    featured: searchParams.get('featured') === 'true',
    bestseller: searchParams.get('bestseller') === 'true',
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
  };

  const products = getPublishedProducts(options);
  const total = getProductCount({ categorySlug: options.categorySlug, search: options.search });

  return NextResponse.json({
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
