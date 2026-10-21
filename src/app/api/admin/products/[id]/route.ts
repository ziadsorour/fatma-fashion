import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sqlite = (db as any).$client;

    const product = sqlite.prepare(`
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const variants = sqlite.prepare(`
      SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color_name_en
    `).all(id);

    const images = sqlite.prepare(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC
    `).all(id);

    return NextResponse.json({ product, variants, images });
  } catch (error: any) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nameEn, nameAr, descriptionEn, descriptionAr, sku, categoryId,
      price, salePrice, status, isFeatured, isBestseller, variants, images
    } = body;

    const sqlite = (db as any).$client;
    const now = Date.now();

    sqlite.transaction(() => {
      sqlite.prepare(`
        UPDATE products SET
          name_ar = ?, name_en = ?, description_ar = ?, description_en = ?,
          sku = ?, category_id = ?, price = ?, sale_price = ?,
          status = ?, is_featured = ?, is_bestseller = ?, updated_at = ?
        WHERE id = ?
      `).run(
        nameAr || nameEn, nameEn, descriptionAr || '', descriptionEn || '',
        sku, categoryId || null, price, salePrice || null,
        status || 'draft', isFeatured ? 1 : 0, isBestseller ? 1 : 0, now,
        id
      );

      // Handle variants update if supplied
      if (Array.isArray(variants)) {
        // Keep track of active variant IDs
        const existingVariants = sqlite.prepare('SELECT id FROM product_variants WHERE product_id = ?').all(id) as { id: string }[];
        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);

        // Delete removed variants
        for (const existing of existingVariants) {
          if (!incomingIds.includes(existing.id)) {
            sqlite.prepare('DELETE FROM product_variants WHERE id = ?').run(existing.id);
          }
        }

        // Upsert variants
        for (const v of variants) {
          if (v.id) {
            sqlite.prepare(`
              UPDATE product_variants SET
                size = ?, color_name_ar = ?, color_name_en = ?, color_hex = ?,
                quantity_on_hand = ?, sku = ?, updated_at = ?
              WHERE id = ?
            `).run(v.size, v.colorAr || '', v.colorEn || '', v.colorHex || '#000000', v.quantity || 0, v.sku, now, v.id);
          } else {
            const variantId = generateId();
            const variantSku = v.sku || `${sku}-${v.size}-${(v.colorEn || 'DEF').substring(0, 3).toUpperCase()}`;
            sqlite.prepare(`
              INSERT INTO product_variants (id, product_id, sku, size, color_name_ar, color_name_en, color_hex, quantity_on_hand, quantity_reserved, low_stock_threshold, is_active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 5, 1, ?, ?)
            `).run(variantId, id, variantSku, v.size, v.colorAr || '', v.colorEn || '', v.colorHex || '#000000', v.quantity || 0, now, now);
          }
        }
      }

      // Handle images update if supplied
      if (Array.isArray(images)) {
        sqlite.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
        images.forEach((img: any, idx: number) => {
          sqlite.prepare(`
            INSERT INTO product_images (id, product_id, url, alt_text_ar, alt_text_en, display_order, is_primary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            generateId(), id, img.url, img.altTextAr || '', img.altTextEn || '',
            idx, idx === 0 ? 1 : 0, now
          );
        });
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sqlite = (db as any).$client;

    sqlite.transaction(() => {
      sqlite.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
      sqlite.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      sqlite.prepare('DELETE FROM products WHERE id = ?').run(id);
    })();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
