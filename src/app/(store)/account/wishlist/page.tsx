'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { useWishlistStore } from '@/stores/wishlist-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const { t, locale } = useI18n();
  const { items: wishlistIds, toggleItem } = useWishlistStore();
  const addToCart = useCartStore(s => s.addItem);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) { setProducts([]); setLoading(false); return; }
    fetch(`/api/products?ids=${wishlistIds.join(',')}`)
      .then(r => r.ok ? r.json() : { products: [] })
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif text-charcoal">{t('account.wishlist')}</h2>

      {wishlistIds.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}</p>
          <Link href="/shop"><Button className="mt-4 bg-rose-gold hover:bg-rose-gold/90 text-white">{t('cart.continueShopping')}</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => {
            const price = product.sale_price || product.price;
            const hasDiscount = product.sale_price && product.sale_price < product.price;
            return (
              <Card key={product.id} className="overflow-hidden group">
                <Link href={`/product/${product.slug}`}>
                  <div className="aspect-[3/4] bg-beige/30 relative overflow-hidden">
                    {product.images?.[0] && (
                      <Image src={product.images[0].url} alt={locale === 'ar' ? product.name_ar : product.name_en} fill className="object-cover group-hover:scale-105 transition-transform" />
                    )}
                    {hasDiscount && <Badge className="absolute top-2 start-2 bg-rose-blush text-white text-xs">{t('product.sale')}</Badge>}
                  </div>
                </Link>
                <CardContent className="py-3">
                  <Link href={`/product/${product.slug}`}>
                    <p className="font-medium text-sm text-charcoal truncate">{locale === 'ar' ? product.name_ar : product.name_en}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm">{formatPrice(price)}</span>
                    {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toggleItem(product.id)}>
                      <Trash2 className="w-3 h-3 me-1" />{locale === 'ar' ? 'إزالة' : 'Remove'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
