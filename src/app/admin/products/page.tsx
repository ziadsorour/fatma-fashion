import { db } from '@/lib/db';
import { ProductsListClient } from './products-client';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  let products: any[] = [];
  try {
    const sqlite = (db as any).$client;
    products = sqlite.prepare(`
      SELECT p.*, c.name_en as category_name, pi.url as image_url,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
        (SELECT SUM(quantity_on_hand - quantity_reserved) FROM product_variants WHERE product_id = p.id AND is_active = 1) as total_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      ORDER BY p.created_at DESC
    `).all();
  } catch (e) { console.error(e); }

  return <ProductsListClient products={products} />;
}
