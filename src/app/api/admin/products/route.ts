import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId, slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameEn, nameAr, descriptionEn, descriptionAr, sku, categoryId, price, salePrice, status, isFeatured, isBestseller, variants } = body;

    if (!nameEn || !price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 });

    const sqlite = (db as any).$client;
    const id = generateId();
    const slug = slugify(nameEn) + '-' + id.substring(0, 6);
    const now = Date.now();
    const productSku = sku || `FM-${id.substring(0, 8).toUpperCase()}`;

    sqlite.transaction(() => {
      sqlite.prepare(`
        INSERT INTO products (id, name_ar, name_en, slug, description_ar, description_en, sku, category_id, price, sale_price, status, is_featured, is_bestseller, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, nameAr || nameEn, nameEn, slug, descriptionAr || '', descriptionEn || '', productSku, categoryId || null, price, salePrice || null, status || 'draft', isFeatured ? 1 : 0, isBestseller ? 1 : 0, now, now);

      if (variants?.length) {
        for (const v of variants) {
          const variantId = generateId();
          const variantSku = v.sku || `${productSku}-${v.size}-${v.colorEn?.substring(0, 3).toUpperCase() || 'DEF'}`;
          sqlite.prepare(`
            INSERT INTO product_variants (id, product_id, sku, size, color_name_ar, color_name_en, color_hex, quantity_on_hand, quantity_reserved, low_stock_threshold, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 5, 1, ?, ?)
          `).run(variantId, id, variantSku, v.size, v.colorAr || '', v.colorEn || '', v.colorHex || '#000000', v.quantity || 0, now, now);

          if (v.quantity > 0) {
            sqlite.prepare(`
              INSERT INTO inventory_movements (id, variant_id, type, quantity, reference_type, reference_id, notes, created_at)
              VALUES (?, ?, 'receipt', ?, 'manual', ?, 'Initial stock', ?)
            `).run(generateId(), variantId, v.quantity, id, now);
          }
        }
      }
    })();

    return NextResponse.json({ success: true, id, slug });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sqlite = (db as any).$client;
    const products = sqlite.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
