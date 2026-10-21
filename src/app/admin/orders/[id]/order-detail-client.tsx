"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, Printer } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700', packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-600',
};

const statusFlow = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderDetailClient({ order, items, history }: { order: any; items: any[]; history: any[] }) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
        toast({ title: `Order updated to ${newStatus}`, variant: 'success' });
      } else {
        toast({ title: data.error || 'Failed to update', variant: 'error' });
      }
    } catch { toast({ title: 'Error updating order', variant: 'error' }); }
    setUpdating(false);
  };

  const currentIdx = statusFlow.indexOf(status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.created_at, 'en')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100'}`}>{status.replace('_', ' ')}</span>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Order Items</h3>
            <div className="space-y-3">
              {items.map((item: any) => {
                const variantInfo = item.variant_info_snapshot ? JSON.parse(item.variant_info_snapshot) : {};
                return (
                  <div key={item.id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0">
                    <div className="w-12 h-14 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.image_url ? <Image src={item.image_url} alt="" width={48} height={56} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product_name_snapshot}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku_snapshot} | Size: {variantInfo.size} | Color: {variantInfo.color}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.unit_price, 'en')}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(item.total, 'en')}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal, 'en')}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount, 'en')}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPrice(order.shipping_fee, 'en')}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span>{formatPrice(order.total, 'en')}</span></div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> Status History</h3>
            <div className="space-y-3">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {h.old_status ? `${h.old_status} → ` : ''}{h.new_status}
                    </p>
                    {h.reason && <p className="text-xs text-gray-500">{h.reason}</p>}
                    <p className="text-xs text-gray-400">{formatDateTime(h.created_at, 'en')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          {status !== 'delivered' && status !== 'cancelled' && status !== 'refunded' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {nextStatus && (
                  <Button onClick={() => handleStatusUpdate(nextStatus)} loading={updating} size="sm">
                    Move to: {nextStatus.replace('_', ' ')}
                  </Button>
                )}
                {status !== 'cancelled' && (
                  <Button onClick={() => handleStatusUpdate('cancelled')} variant="destructive" size="sm" loading={updating}>
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-gray-600">{order.customer_phone}</p>
              {order.customer_email && <p className="text-gray-600">{order.customer_email}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Shipping</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{order.shipping_governorate}, {order.shipping_city}</p>
              <p>{order.shipping_address}</p>
              {order.shipping_building && <p>{order.shipping_building}</p>}
              {order.shipping_instructions && <p className="text-gray-400 italic">{order.shipping_instructions}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Method:</span> <span className="font-medium">{order.payment_method}</span></p>
              <p><span className="text-gray-500">Status:</span> <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.payment_status}</span></p>
            </div>
          </div>

          {order.customer_notes && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Customer Notes</h3>
              <p className="text-sm text-gray-600">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
