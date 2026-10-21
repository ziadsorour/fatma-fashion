"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, ShoppingCart, Eye, Download } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700', packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700', out_for_delivery: 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  return_requested: 'bg-orange-100 text-orange-700', returned: 'bg-gray-100 text-gray-600',
  refunded: 'bg-gray-100 text-gray-600',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-600',
};

export function OrdersListClient({ orders }: { orders: any[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.customer_phone?.includes(q);
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Status', 'Payment', 'Total (EGP)', 'Date'];
    const rows = filtered.map(o => [o.order_number, o.customer_name, o.customer_phone, o.status, o.payment_status, (o.total / 100).toFixed(2), new Date(o.created_at).toISOString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders ({orders.length})</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order #, name, or phone..." className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">All Statuses</option>
          {['pending','confirmed','processing','packed','shipped','delivered','cancelled','refunded'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Order #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Governorate</th>
                <th className="px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.order_number}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.shipping_governorate}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.total, 'en')}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${paymentColors[o.payment_status] || 'bg-gray-100'}`}>{o.payment_status}</span>
                      <span className="text-[10px] text-gray-400">{o.payment_method}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(o.created_at, 'en')}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="p-1.5 text-gray-400 hover:text-blue-600"><Eye className="h-4 w-4" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders will appear here when customers place them" />
      )}
    </div>
  );
}
