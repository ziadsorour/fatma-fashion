"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, GOVERNORATES, GOVERNORATES_EN } from "@/lib/utils";
import { ShoppingBag, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { t, locale, dir } = useI18n();
  const router = useRouter();
  const { items, getSubtotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', governorate: '', city: '', address: '', building: '',
    deliveryInstructions: '', paymentMethod: 'cod', notes: '', termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const shippingFee = form.governorate ? 5000 : 0; // Estimated, server calculates actual
  const discount = couponDiscount;
  const total = subtotal - discount + shippingFee;
  const govs = locale === 'ar' ? GOVERNORATES : GOVERNORATES_EN;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = t('common.required');
    if (!form.phone.trim() || !/^01[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = locale === 'ar' ? 'رقم موبايل غير صحيح' : 'Invalid phone number';
    if (!form.governorate) e.governorate = t('common.required');
    if (!form.address.trim()) e.address = t('common.required');
    if (!form.termsAccepted) e.terms = locale === 'ar' ? 'يجب الموافقة على الشروط' : 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
          customer: {
            fullName: form.fullName, phone: form.phone, email: form.email,
            governorate: form.governorate, city: form.city, address: form.address,
            building: form.building, deliveryInstructions: form.deliveryInstructions,
          },
          paymentMethod: form.paymentMethod,
          couponCode,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderComplete(data.order);
        clearCart();
      } else {
        toast({ title: data.error || (locale === 'ar' ? 'حصل خطأ' : 'Error occurred'), variant: 'error' });
      }
    } catch {
      toast({ title: locale === 'ar' ? 'حصل خطأ في الاتصال' : 'Connection error', variant: 'error' });
    }
    setLoading(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-beige/50">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">{t('order.confirmation')}</h1>
          <p className="text-charcoal/60 mb-6">{t('order.confirmationDescription')}</p>
          <div className="bg-beige/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-charcoal/60">{t('order.orderNumber')}</p>
            <p className="text-xl font-bold text-charcoal font-mono" dir="ltr">{orderComplete.orderNumber}</p>
            <div className="mt-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-charcoal/60">{t('cart.subtotal')}</span><span>{formatPrice(orderComplete.subtotal, locale)}</span></div>
              {orderComplete.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>{t('cart.discount')}</span><span>-{formatPrice(orderComplete.discountAmount, locale)}</span></div>}
              <div className="flex justify-between"><span className="text-charcoal/60">{t('cart.shipping')}</span><span>{formatPrice(orderComplete.shippingFee, locale)}</span></div>
              <div className="flex justify-between font-bold border-t border-beige pt-2 mt-2"><span>{t('cart.total')}</span><span>{formatPrice(orderComplete.total, locale)}</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1"><Link href="/track-order">{t('order.trackOrder')}</Link></Button>
            <Button asChild className="flex-1"><Link href="/shop">{t('cart.continueShopping')}</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-charcoal mb-2">{t('cart.empty')}</h2>
          <Button asChild><Link href="/shop">{t('cart.continueShopping')}</Link></Button>
        </div>
      </div>
    );
  }

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-cream py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-6">{t('checkout.title')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm">
                <h2 className="font-semibold text-charcoal mb-4">{t('checkout.shippingInfo')}</h2>
                <div className="space-y-4">
                  <Input label={t('checkout.fullName')} value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} error={errors.fullName} required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t('checkout.phone')} type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} error={errors.phone} placeholder="01xxxxxxxxx" dir="ltr" required />
                    <Input label={t('checkout.email')} type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder={`(${t('common.optional')})`} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1.5">{t('checkout.governorate')} *</label>
                      <select value={form.governorate} onChange={e => updateForm('governorate', e.target.value)} className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold ${errors.governorate ? 'border-red-400' : 'border-beige'}`} required>
                        <option value="">{t('checkout.selectGovernorate')}</option>
                        {govs.map((g, i) => <option key={i} value={g}>{g}</option>)}
                      </select>
                      {errors.governorate && <p className="mt-1 text-xs text-red-500">{errors.governorate}</p>}
                    </div>
                    <Input label={t('checkout.city')} value={form.city} onChange={e => updateForm('city', e.target.value)} />
                  </div>
                  <Input label={t('checkout.address')} value={form.address} onChange={e => updateForm('address', e.target.value)} error={errors.address} required />
                  <Input label={t('checkout.building')} value={form.building} onChange={e => updateForm('building', e.target.value)} placeholder={`(${t('common.optional')})`} />
                  <Textarea label={t('checkout.deliveryInstructions')} value={form.deliveryInstructions} onChange={e => updateForm('deliveryInstructions', e.target.value)} rows={2} placeholder={`(${t('common.optional')})`} />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm">
                <h2 className="font-semibold text-charcoal mb-4">{t('checkout.paymentMethod')}</h2>
                <div className="space-y-2">
                  {[
                    { value: 'cod', label: t('checkout.cod'), icon: '💵' },
                    { value: 'online', label: t('checkout.onlinePayment'), icon: '💳', disabled: true, note: locale === 'ar' ? 'قريباً' : 'Coming soon' },
                    { value: 'instapay', label: t('checkout.instapay'), icon: '📱', disabled: true, note: locale === 'ar' ? 'قريباً' : 'Coming soon' },
                  ].map(method => (
                    <label key={method.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.paymentMethod === method.value ? 'border-rose-gold bg-rose-gold/5' : 'border-beige hover:border-charcoal/20'} ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={e => !method.disabled && updateForm('paymentMethod', e.target.value)} disabled={method.disabled} className="accent-rose-gold" />
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-sm font-medium">{method.label}</span>
                      {method.note && <span className="text-xs text-charcoal/40 ms-auto">{method.note}</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.termsAccepted} onChange={e => updateForm('termsAccepted', e.target.checked)} className="mt-1 accent-rose-gold" />
                <span className="text-sm text-charcoal/70">
                  {t('checkout.termsConsent')}{' '}
                  <Link href="/pages/terms" className="text-rose-gold hover:underline" target="_blank">{t('nav.terms')}</Link>{' & '}
                  <Link href="/pages/privacy-policy" className="text-rose-gold hover:underline" target="_blank">{t('nav.privacyPolicy')}</Link>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-500 -mt-2">{errors.terms}</p>}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm sticky top-24">
                <h2 className="font-semibold text-charcoal mb-4">{t('checkout.orderSummary')}</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.variantId} className="flex gap-3 text-sm">
                      <div className="w-12 h-14 rounded bg-beige/30 flex-shrink-0 overflow-hidden relative">
                        {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal truncate">{locale === 'ar' ? item.productNameAr : item.productName}</p>
                        <p className="text-xs text-charcoal/50">{item.size} / {locale === 'ar' ? item.colorNameAr : item.colorName} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice((item.salePrice ?? item.price) * item.quantity, locale)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-beige pt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-charcoal/60">{t('cart.subtotal')}</span><span>{formatPrice(subtotal, locale)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>{t('cart.discount')}</span><span>-{formatPrice(discount, locale)}</span></div>}
                  <div className="flex justify-between"><span className="text-charcoal/60">{t('cart.shipping')}</span><span>{shippingFee > 0 ? formatPrice(shippingFee, locale) : (locale === 'ar' ? 'مجاني' : 'Free')}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-beige pt-2"><span>{t('cart.total')}</span><span>{formatPrice(total, locale)}</span></div>
                </div>
                <Button type="submit" className="w-full mt-6 rounded-lg" size="lg" loading={loading} disabled={loading}>
                  {t('checkout.placeOrder')} <Arrow className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
