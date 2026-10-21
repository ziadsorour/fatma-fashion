"use client";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Search, CheckCircle, Clock } from "lucide-react";

const statusSteps = ['pending','confirmed','processing','packed','shipped','delivered'];

export default function TrackOrderPage() {
  const { t, locale } = useI18n();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?number=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.order) setOrder(data.order); else setError(locale === 'ar' ? 'لم يتم العثور على الطلب' : 'Order not found');
    } catch { setError(locale === 'ar' ? 'حصل خطأ' : 'Error'); }
    setLoading(false);
  };

  const idx = order ? statusSteps.indexOf(order.status) : -1;
  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-charcoal text-center mb-8">{t('order.trackOrder')}</h1>
        <form onSubmit={handleTrack} className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm mb-8 space-y-4">
          <Input label={t('account.enterOrderNumber')} value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="FM-XXXXX" dir="ltr" required />
          <Input label={t('account.enterPhone')} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" required />
          <Button type="submit" className="w-full" loading={loading}><Search className="h-4 w-4" /> {t('order.trackOrder')}</Button>
        </form>
        {error && <p className="text-center text-red-600 mb-4">{error}</p>}
        {order && (
          <div className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm">
            <p className="text-center text-sm text-charcoal/60 mb-1">{t('order.orderNumber')}</p>
            <p className="text-center text-xl font-bold font-mono mb-6" dir="ltr">{order.order_number}</p>
            {order.status !== 'cancelled' && (
              <div className="flex items-center justify-between mb-6 relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-beige" />
                <div className="absolute top-4 left-0 h-0.5 bg-rose-gold" style={{ width: `${Math.max(0,(idx/(statusSteps.length-1))*100)}%` }} />
                {statusSteps.map((s,i) => (
                  <div key={s} className="relative flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i<=idx?'bg-rose-gold text-white':'bg-beige text-charcoal/40'}`}>
                      {i<=idx?<CheckCircle className="h-4 w-4" />:<Clock className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] mt-1 ${i<=idx?'text-charcoal font-medium':'text-charcoal/40'}`}>{t(`order.statuses.${s}`)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-beige pt-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-charcoal/60">{t('cart.total')}</span><span className="font-bold">{formatPrice(order.total, locale)}</span></div>
              <div className="flex justify-between"><span className="text-charcoal/60">{t('checkout.paymentMethod')}</span><span>{order.payment_method === 'cod' ? t('checkout.cod') : order.payment_method}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
