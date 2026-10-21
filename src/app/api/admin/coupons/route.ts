import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/admin/coupons — List all coupons with usage stats
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const coupons = (db as any).$client
      .prepare(
        `SELECT
           c.*,
           COUNT(cr.id) as redemption_count,
           COALESCE(SUM(cr.discount_amount), 0) as total_discount_given
         FROM coupons c
         LEFT JOIN coupon_redemptions cr ON cr.coupon_id = c.id
         GROUP BY c.id
         ORDER BY c.created_at DESC`
      )
      .all();

    return NextResponse.json({ coupons });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/coupons — Create coupon
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

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

    if (!code || !type || value == null) {
      return NextResponse.json({ error: 'code, type, and value are required' }, { status: 400 });
    }

    const validTypes = ['percentage', 'fixed', 'free_shipping'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Check code uniqueness
    const existingCode = (db as any).$client
      .prepare('SELECT id FROM coupons WHERE code = ?')
      .get(code.toUpperCase());

    if (existingCode) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `INSERT INTO coupons (id, code, type, value, min_order_value, max_discount, start_date, end_date, total_limit, per_customer_limit, usage_count, applies_to_products, applies_to_categories, new_customers_only, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        code.toUpperCase(),
        type,
        value,
        min_order_value ?? null,
        max_discount ?? null,
        start_date ?? null,
        end_date ?? null,
        total_limit ?? null,
        per_customer_limit ?? 1,
        applies_to_products ? (typeof applies_to_products === 'string' ? applies_to_products : JSON.stringify(applies_to_products)) : null,
        applies_to_categories ? (typeof applies_to_categories === 'string' ? applies_to_categories : JSON.stringify(applies_to_categories)) : null,
        new_customers_only ? 1 : 0,
        is_active != null ? (is_active ? 1 : 0) : 1,
        now,
        now
      );

    const coupon = (db as any).$client
      .prepare('SELECT * FROM coupons WHERE id = ?')
      .get(id);

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
