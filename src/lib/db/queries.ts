import { db } from '@/lib/db';
import { products, productImages, productVariants, categories, cmsSections } from '@/lib/db/schema';
import { eq, desc, and, sql, asc } from 'drizzle-orm';

export interface ProductListItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  salePrice: number | null;
  status: string;
  isFeatured: number;
  isBestseller: number;
  categoryId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  createdAt: number;
  firstVariantId: string | null;
  firstVariantSize: string | null;
  firstVariantColor: string | null;
  firstVariantColorAr: string | null;
  firstVariantColorHex: string | null;
  firstVariantSku: string | null;
  firstVariantStock: number;
  lowStock: boolean;
  outOfStock: boolean;
}

export function getPublishedProducts(options?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
}): ProductListItem[] {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;
  const sort = options?.sort || 'newest';

  let orderBy = 'p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'p.price ASC';
  else if (sort === 'price_desc') orderBy = 'p.price DESC';
  else if (sort === 'name_asc') orderBy = 'p.name_en ASC';

  let where = "p.status = 'published'";
  const params: any[] = [];

  if (options?.categorySlug) {
    where += " AND c.slug = ?";
    params.push(options.categorySlug);
  }
  if (options?.featured) {
    where += " AND p.is_featured = 1";
  }
  if (options?.bestseller) {
    where += " AND p.is_bestseller = 1";
  }
  if (options?.search) {
    where += " AND (p.name_en LIKE ? OR p.name_ar LIKE ? OR p.sku LIKE ?)";
    const q = `%${options.search}%`;
    params.push(q, q, q);
  }
  if (options?.minPrice) {
    where += " AND COALESCE(p.sale_price, p.price) >= ?";
    params.push(options.minPrice);
  }
  if (options?.maxPrice) {
    where += " AND COALESCE(p.sale_price, p.price) <= ?";
    params.push(options.maxPrice);
  }

  const query = `
    SELECT 
      p.id, p.slug, p.name_ar as nameAr, p.name_en as nameEn, 
      p.price, p.sale_price as salePrice, p.status,
      p.is_featured as isFeatured, p.is_bestseller as isBestseller,
      p.category_id as categoryId, p.created_at as createdAt,
      pi.url as imageUrl, pi.alt_text_en as imageAlt,
      pv.id as firstVariantId, pv.size as firstVariantSize,
      pv.color_name_en as firstVariantColor, pv.color_name_ar as firstVariantColorAr,
      pv.color_hex as firstVariantColorHex, pv.sku as firstVariantSku,
      COALESCE(pv.quantity_on_hand - pv.quantity_reserved, 0) as firstVariantStock,
      CASE WHEN COALESCE(total_stock.total_available, 0) <= 5 AND COALESCE(total_stock.total_available, 0) > 0 THEN 1 ELSE 0 END as lowStock,
      CASE WHEN COALESCE(total_stock.total_available, 0) <= 0 THEN 1 ELSE 0 END as outOfStock
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = 1
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN (
      SELECT product_id, SUM(quantity_on_hand - quantity_reserved) as total_available
      FROM product_variants WHERE is_active = 1
      GROUP BY product_id
    ) total_stock ON total_stock.product_id = p.id
    WHERE ${where}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  try {
    const stmt = (db as any).$client.prepare(query);
    const rows = stmt.all(...params);
    return rows.map((r: any) => ({
      ...r,
      lowStock: !!r.lowStock,
      outOfStock: !!r.outOfStock,
    }));
  } catch (e) {
    console.error('Error fetching products:', e);
    return [];
  }
}

export function getProductCount(options?: { categorySlug?: string; search?: string }): number {
  let where = "status = 'published'";
  const params: any[] = [];
  if (options?.search) {
    where += " AND (name_en LIKE ? OR name_ar LIKE ?)";
    const q = `%${options.search}%`;
    params.push(q, q);
  }
  try {
    const stmt = (db as any).$client.prepare(`SELECT COUNT(DISTINCT id) as count FROM products WHERE ${where}`);
    return stmt.get(...params)?.count || 0;
  } catch {
    return 0;
  }
}

export function getProductBySlug(slug: string) {
  try {
    const product = (db as any).$client.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug
      FROM products p 
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ? AND p.status = 'published'
    `).get(slug);
    if (!product) return null;

    const images = (db as any).$client.prepare(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC`
    ).all(product.id);

    const variants = (db as any).$client.prepare(
      `SELECT *, (quantity_on_hand - quantity_reserved) as available FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY size ASC, color_name_en ASC`
    ).all(product.id);

    return { ...product, images, variants };
  } catch (e) {
    console.error('Error fetching product:', e);
    return null;
  }
}

export function getCategories() {
  try {
    return (db as any).$client.prepare(
      `SELECT * FROM categories WHERE is_visible = 1 ORDER BY display_order ASC`
    ).all();
  } catch {
    return [];
  }
}

export function getCmsSections(page: string = 'homepage') {
  try {
    return (db as any).$client.prepare(
      `SELECT * FROM cms_sections WHERE page = ? AND is_visible = 1 ORDER BY display_order ASC`
    ).all(page);
  } catch {
    return [];
  }
}

export function getCmsPage(slug: string) {
  try {
    return (db as any).$client.prepare(
      `SELECT * FROM cms_pages WHERE slug = ? AND is_published = 1`
    ).get(slug);
  } catch {
    return null;
  }
}
