import { db } from '@/lib/db';
import { OrdersListClient } from './orders-client';

export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    const sqlite = (db as any).$client;
    orders = sqlite.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 100
    `).all();
  } catch (e) { console.error(e); }
  return <OrdersListClient orders={orders} />;
}
