'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const { t, locale, dir } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  useEffect(() => { loadOrders(); }, [page]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/account/orders?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-blue-100 text-blue-700', packed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700', out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
    return_requested: 'bg-amber-100 text-amber-700', returned: 'bg-gray-100 text-gray-700',
    refunded: 'bg-gray-100 text-gray-600',
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif text-charcoal">{t('account.orders')}</h2>

      {orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">{t('order.noOrders')}</p>
          <Link href="/shop"><Button className="mt-4 bg-rose-gold hover:bg-rose-gold/90 text-white">{t('cart.continueShopping')}</Button></Link>
        </CardContent></Card>
      ) : (
        <>
          {orders.map(order => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow mb-3">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">{order.order_number}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at * 1000).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {order.items_count && <p className="text-xs text-gray-500 mt-1">{order.items_count} {locale === 'ar' ? 'منتج' : 'items'}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`order.statuses.${order.status}`) || order.status}
                      </Badge>
                      <span className="font-semibold text-charcoal">{formatPrice(order.total)}</span>
                      <Arrow className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous')}</Button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next')}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
