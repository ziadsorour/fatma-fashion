import { db } from '@/lib/db';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  let customers: any[] = [];
  try {
    const sqlite = (db as any).$client;
    customers = sqlite.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.created_at, cp.lifetime_spent, cp.order_count
      FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'customer' ORDER BY u.created_at DESC LIMIT 100
    `).all();
  } catch {}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers ({customers.length})</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left">
            <th className="px-4 py-3 font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 font-medium text-gray-500">Email</th>
            <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
            <th className="px-4 py-3 font-medium text-gray-500">Orders</th>
            <th className="px-4 py-3 font-medium text-gray-500">Lifetime Spent</th>
          </tr></thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No customers yet</td></tr>
            ) : customers.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.order_count || 0}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(c.lifetime_spent || 0, 'en')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
