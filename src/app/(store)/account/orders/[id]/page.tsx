'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Package, Check, Clock, Truck, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { t, locale, dir } = useI18n();
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => { loadOrder(); }, [params.id]);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/account/orders/${params.id}`);
      if (res.ok) { const data = await res.json(); setOrder(data.order); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function cancelOrder() {
    if (!confirm(locale === 'ar' ? 'هل أنتِ متأكدة من إلغاء الطلب؟' : 'Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/account/orders/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) await loadOrder();
    } catch (e) { console.error(e); }
    finally { setCancelling(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">{locale === 'ar' ? 'الطلب غير موجود' : 'Order not found'}</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canReturn = order.status === 'delivered';

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-charcoal">
        <BackArrow className="w-4 h-4" /> {locale === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-serif text-charcoal">{t('order.orderDetails')}</h2>
          <p className="text-sm text-gray-400">{order.order_number} · {new Date(order.created_at * 1000).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          {canCancel && <Button variant="outline" size="sm" className="text-red-500 border-red-200" onClick={cancelOrder} disabled={cancelling}>{cancelling ? '...' : t('order.cancelOrder')}</Button>}
          {canReturn && <Button variant="outline" size="sm">{t('order.requestReturn')}</Button>}
        </div>
      </div>

      {/* Status Timeline */}
      {!['cancelled', 'returned', 'refunded', 'return_requested'].includes(order.status) && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${i <= currentStep ? 'bg-rose-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className={`text-[10px] sm:text-xs text-center ${i <= currentStep ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
                    {t(`order.statuses.${step}`)}
                  </p>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`hidden sm:block absolute h-0.5 w-full top-4 ${i < currentStep ? 'bg-rose-gold' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {['cancelled', 'returned', 'refunded', 'return_requested'].includes(order.status) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-center">
            <Badge className="bg-red-100 text-red-700">{t(`order.statuses.${order.status}`)}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('order.items')}</CardTitle></CardHeader>
        <CardContent>
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex gap-3 py-3 border-b last:border-0">
              <div className="w-16 h-16 bg-beige/30 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-charcoal truncate">{item.product_name_snapshot}</p>
                <p className="text-xs text-gray-400">{item.variant_info_snapshot} · {item.sku_snapshot}</p>
                <p className="text-xs text-gray-500">× {item.quantity}</p>
              </div>
              <p className="font-medium text-sm">{formatPrice(item.total)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" />{t('order.shippingAddress')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-charcoal">{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_governorate}</p>
            {order.shipping_building && <p>{order.shipping_building}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('checkout.orderSummary')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">{t('cart.subtotal')}</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between"><span className="text-gray-500">{t('cart.discount')}</span><span className="text-green-600">-{formatPrice(order.discount_amount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">{t('cart.shipping')}</span><span>{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : locale === 'ar' ? 'مجاني' : 'Free'}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-charcoal"><span>{t('cart.total')}</span><span>{formatPrice(order.total)}</span></div>
            <Separator />
            <div className="flex justify-between text-xs"><span className="text-gray-400">{t('checkout.paymentMethod')}</span><span>{order.payment_method === 'cod' ? t('checkout.cod') : order.payment_method}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-400">{t('order.paymentStatus')}</span><span className="capitalize">{order.payment_status}</span></div>
            {order.tracking_number && <div className="flex justify-between text-xs"><span className="text-gray-400">{t('order.trackingNumber')}</span><span className="font-mono">{order.tracking_number}</span></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
