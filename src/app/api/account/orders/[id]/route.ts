import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/account/orders/[id] — Get order detail for current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = (db as any).$client
      .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(id, authUser.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = (db as any).$client
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(id);

    const statusHistory = (db as any).$client
      .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC')
      .all(id);

    return NextResponse.json({ order, items, status_history: statusHistory });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/account/orders/[id] — Cancel order or request return
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = (db as any).$client
      .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(id, authUser.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, reason } = body;

    if (!action || !['cancel', 'request_return'].includes(action)) {
      return NextResponse.json({ error: "action must be 'cancel' or 'request_return'" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);

    if (action === 'cancel') {
      // Can only cancel if pending or confirmed
      const cancellableStatuses = ['pending', 'confirmed'];
      if (!cancellableStatuses.includes(order.status)) {
        return NextResponse.json(
          { error: `Cannot cancel order with status '${order.status}'. Only pending or confirmed orders can be cancelled.` },
          { status: 400 }
        );
      }

      (db as any).$client
        .prepare(
          `UPDATE orders SET status = 'cancelled', cancellation_reason = ?, updated_at = ? WHERE id = ?`
        )
        .run(reason || null, now, id);

      // Record status history
      (db as any).$client
        .prepare(
          `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, reason, created_at)
           VALUES (?, ?, ?, 'cancelled', ?, ?, ?)`
        )
        .run(crypto.randomUUID(), id, order.status, authUser.id, reason || 'Customer cancelled', now);

    } else if (action === 'request_return') {
      // Can only request return if delivered
      if (order.status !== 'delivered') {
        return NextResponse.json(
          { error: `Cannot request return for order with status '${order.status}'. Only delivered orders can be returned.` },
          { status: 400 }
        );
      }

      (db as any).$client
        .prepare(
          `UPDATE orders SET status = 'return_requested', updated_at = ? WHERE id = ?`
        )
        .run(now, id);

      // Record status history
      (db as any).$client
        .prepare(
          `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, reason, created_at)
           VALUES (?, ?, 'delivered', 'return_requested', ?, ?, ?)`
        )
        .run(crypto.randomUUID(), id, authUser.id, reason || 'Customer requested return', now);
    }

    const updatedOrder = (db as any).$client
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(id);

    return NextResponse.json({ order: updatedOrder });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
