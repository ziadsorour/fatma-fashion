import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, reason } = await request.json();
    const sqlite = (db as any).$client;

    const order = sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const now = Date.now();

    sqlite.transaction(() => {
      // Update order status
      sqlite.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

      // Record status history
      sqlite.prepare(`
        INSERT INTO order_status_history (id, order_id, old_status, new_status, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(generateId(), id, order.status, status, reason || `Status changed to ${status}`, now);

      // Handle cancellation - restore stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        const items = sqlite.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
        for (const item of items) {
          sqlite.prepare('UPDATE product_variants SET quantity_reserved = MAX(0, quantity_reserved - ?) WHERE id = ?').run(item.quantity, item.variant_id);
          sqlite.prepare(`
            INSERT INTO inventory_movements (id, variant_id, type, quantity, reference_type, reference_id, notes, created_at)
            VALUES (?, ?, 'release', ?, 'order', ?, 'Stock released - order cancelled', ?)
          `).run(generateId(), item.variant_id, item.quantity, id, now);
        }
      }

      // Handle delivery - deduct from on_hand, release reservation
      if (status === 'delivered' && order.status !== 'delivered') {
        const items = sqlite.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
        for (const item of items) {
          sqlite.prepare('UPDATE product_variants SET quantity_on_hand = MAX(0, quantity_on_hand - ?), quantity_reserved = MAX(0, quantity_reserved - ?) WHERE id = ?').run(item.quantity, item.quantity, item.variant_id);
          sqlite.prepare(`
            INSERT INTO inventory_movements (id, variant_id, type, quantity, reference_type, reference_id, notes, created_at)
            VALUES (?, ?, 'sale', ?, 'order', ?, 'Stock sold - order delivered', ?)
          `).run(generateId(), item.variant_id, -item.quantity, id, now);
        }
        // Update payment status for COD
        if (order.payment_method === 'cod') {
          sqlite.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").run(id);
        }
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
