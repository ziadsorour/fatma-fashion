import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// PUT /api/admin/coupons/[id] — Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM coupons WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      code,
      type,
      value,
      min_order_value,
      max_discount,
      start_date,
      end_date,
      total_limit,
      per_customer_limit,
      applies_to_products,
      applies_to_categories,
      new_customers_only,
      is_active,
    } = body;

    // Check code uniqueness if changing
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = (db as any).$client
        .prepare('SELECT id FROM coupons WHERE code = ? AND id != ?')
        .get(code.toUpperCase(), id);
      if (codeExists) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
      }
    }

    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `UPDATE coupons
         SET code = COALESCE(?, code),
             type = COALESCE(?, type),
             value = COALESCE(?, value),
             min_order_value = ?,
             max_discount = ?,
             start_date = ?,
             end_date = ?,
             total_limit = ?,
             per_customer_limit = COALESCE(?, per_customer_limit),
             applies_to_products = ?,
             applies_to_categories = ?,
             new_customers_only = COALESCE(?, new_customers_only),
             is_active = COALESCE(?, is_active),
             updated_at = ?
         WHERE id = ?`
      )
      .run(
        code ? code.toUpperCase() : null,
        type ?? null,
        value ?? null,
        min_order_value !== undefined ? min_order_value : existing.min_order_value,
        max_discount !== undefined ? max_discount : existing.max_discount,
        start_date !== undefined ? start_date : existing.start_date,
        end_date !== undefined ? end_date : existing.end_date,
        total_limit !== undefined ? total_limit : existing.total_limit,
        per_customer_limit ?? null,
        applies_to_products !== undefined
          ? (applies_to_products ? (typeof applies_to_products === 'string' ? applies_to_products : JSON.stringify(applies_to_products)) : null)
          : existing.applies_to_products,
        applies_to_categories !== undefined
          ? (applies_to_categories ? (typeof applies_to_categories === 'string' ? applies_to_categories : JSON.stringify(applies_to_categories)) : null)
          : existing.applies_to_categories,
        new_customers_only != null ? (new_customers_only ? 1 : 0) : null,
        is_active != null ? (is_active ? 1 : 0) : null,
        now,
        id
      );

    const coupon = (db as any).$client
      .prepare('SELECT * FROM coupons WHERE id = ?')
      .get(id);

    return NextResponse.json({ coupon });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] — Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM coupons WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    (db as any).$client
      .prepare('DELETE FROM coupons WHERE id = ?')
      .run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
