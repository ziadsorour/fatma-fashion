import { getProductBySlug, getPublishedProducts } from '@/lib/db/queries';
import { ProductDetailClient } from './product-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = getProductBySlug(slug);
    if (product?.category_id) {
      relatedProducts = getPublishedProducts({ limit: 4, categorySlug: product.category_slug });
      relatedProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);
    }
  } catch (e) {
    console.error('Error loading product:', e);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
