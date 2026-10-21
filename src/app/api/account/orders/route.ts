import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

// GET /api/account/orders — List orders for current user (paginated)
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    const total = (db as any).$client
      .prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?')
      .get(authUser.id);

    const orders = (db as any).$client
      .prepare(
        `SELECT id, order_number, status, payment_status, payment_method, subtotal, discount_amount, shipping_fee, tax_amount, total, created_at, updated_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(authUser.id, limit, offset);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: total.count,
        total_pages: Math.ceil(total.count / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
