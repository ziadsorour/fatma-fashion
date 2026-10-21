import { db } from '@/lib/db';
import { OrderDetailClient } from './order-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: any = null;
  let orderItems: any[] = [];
  let statusHistory: any[] = [];

  try {
    const sqlite = (db as any).$client;
    order = sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (order) {
      orderItems = sqlite.prepare(`
        SELECT oi.*, pi.url as image_url FROM order_items oi
        LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = 1
        WHERE oi.order_id = ?
      `).all(id);
      statusHistory = sqlite.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC').all(id);
    }
  } catch (e) { console.error(e); }

  if (!order) notFound();
  return <OrderDetailClient order={order} items={orderItems} history={statusHistory} />;
}
