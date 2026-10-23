"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toast";

export default function CartPage() {
  const { t, locale, dir } = useI18n();
  const { items, removeItem, updateQuantity, getSubtotal, couponCode, couponDiscount, setCoupon, clearCart } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const discount = couponDiscount;
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(couponInput, data.discount);
        toast({ title: t('cart.couponApplied'), variant: 'success' });
      } else {
        toast({ title: t('cart.invalidCoupon'), variant: 'error' });
      }
    } catch {
      toast({ title: t('cart.invalidCoupon'), variant: 'error' });
    }
    setCouponLoading(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            icon={ShoppingBag}
            title={t('cart.empty')}
            description={t('cart.emptyDescription')}
            actionLabel={t('cart.continueShopping')}
            onAction={() => window.location.href = '/shop'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-6 md:py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-6">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice = item.salePrice ?? item.price;
              return (
                <div key={item.variantId} className="bg-white rounded-xl p-4 flex gap-4 border border-beige/50 shadow-sm">
                  <div className="relative w-20 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden bg-beige/30 flex-shrink-0">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={locale === 'ar' ? item.productNameAr : item.productName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-6 w-6 text-charcoal/20" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-charcoal text-sm md:text-base line-clamp-1">
                          {locale === 'ar' ? item.productNameAr : item.productName}
                        </h3>
                        <p className="text-xs text-charcoal/50 mt-0.5">
                          {item.size && <span>{locale === 'ar' ? 'المقاس' : 'Size'}: {item.size}</span>}
                          {item.colorName && <span className="ms-2">{locale === 'ar' ? 'اللون' : 'Color'}: {locale === 'ar' ? item.colorNameAr : item.colorName}</span>}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.variantId)} className="text-charcoal/40 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center gap-2 border border-beige rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-beige/50 rounded-s-lg disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="p-1.5 hover:bg-beige/50 rounded-e-lg disabled:opacity-30 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-bold text-charcoal">{formatPrice(itemPrice * item.quantity, locale)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-beige/50 shadow-sm sticky top-24">
              <h2 className="font-semibold text-charcoal mb-4">{locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t('cart.couponCode')}
                  className="flex-1 h-9 px-3 border border-beige rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30"
                  dir="ltr"
                />
                <Button size="sm" variant="outline" onClick={handleApplyCoupon} loading={couponLoading}>
                  <Tag className="h-3.5 w-3.5" />
                </Button>
              </div>
              {couponCode && (
                <div className="flex items-center justify-between text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-4">
                  <span>✓ {couponCode}</span>
                  <button onClick={() => setCoupon(null, 0)} className="text-red-500 text-xs">{t('common.delete')}</button>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/60">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatPrice(subtotal, locale)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('cart.discount')}</span>
                    <span>-{formatPrice(discount, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal/60">{t('cart.shipping')}</span>
                  <span className="text-charcoal/60">{t('cart.shippingCalculated')}</span>
                </div>
                <div className="border-t border-beige pt-3 flex justify-between font-bold text-base">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(total, locale)}</span>
                </div>
              </div>

              <Button asChild className="w-full mt-6 rounded-lg" size="lg">
                <Link href="/checkout">{t('cart.checkout')} <Arrow className="h-4 w-4" /></Link>
              </Button>

              <Link href="/shop" className="block text-center text-sm text-rose-gold hover:text-rose-gold-dark mt-3">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
