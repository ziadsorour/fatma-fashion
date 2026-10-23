"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useI18n } from "@/i18n";
import { useCartStore, CartItem } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface ProductCardProps {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number; // piasters
  salePrice?: number | null;
  imageUrl?: string;
  imageAlt?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  lowStock?: boolean;
  outOfStock?: boolean;
  firstVariantId?: string;
  firstVariantSize?: string;
  firstVariantColor?: string;
  firstVariantColorAr?: string;
  firstVariantColorHex?: string;
  firstVariantSku?: string;
  firstVariantStock?: number;
  className?: string;
}

export function ProductCard({
  id, slug, nameAr, nameEn, price, salePrice,
  imageUrl, imageAlt, isNew, isBestSeller, isFeatured, isOnSale, lowStock, outOfStock,
  firstVariantId, firstVariantSize, firstVariantColor, firstVariantColorAr,
  firstVariantColorHex, firstVariantSku, firstVariantStock,
  className,
}: ProductCardProps) {
  const { t, locale } = useI18n();
  const name = locale === 'ar' ? nameAr : nameEn;
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wishlisted = mounted ? isInWishlist(id) : false;

  const displayPrice = salePrice || price;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || !firstVariantId) return;
    const item: CartItem = {
      id: `${id}-${firstVariantId}`,
      variantId: firstVariantId,
      productId: id,
      productName: nameEn,
      productNameAr: nameAr,
      productImage: imageUrl || '/images/placeholder.jpg',
      size: firstVariantSize || '',
      colorName: firstVariantColor || '',
      colorNameAr: firstVariantColorAr || '',
      colorHex: firstVariantColorHex || '',
      sku: firstVariantSku || '',
      price,
      salePrice: salePrice || null,
      quantity: 1,
      maxQuantity: firstVariantStock || 10,
    };
    addToCart(item);
    toast({ title: locale === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart', variant: 'success' });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id);
  };

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/product/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-beige/30 mb-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt || name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/20">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {isNew && <span className="bg-charcoal text-white text-[10px] px-2 py-0.5 rounded-full font-medium">{t('product.new')}</span>}
            {isBestSeller && <span className="bg-rose-gold text-white text-[10px] px-2 py-0.5 rounded-full font-medium">{t('product.bestSeller')}</span>}
            {isOnSale && discount > 0 && <span className="bg-rose-blush text-white text-[10px] px-2 py-0.5 rounded-full font-medium">-{discount}%</span>}
            {lowStock && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">{t('product.lowStock')}</span>}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label={wishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')}
          >
            <Heart className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-rose-blush text-rose-blush" : "text-charcoal/60")} />
          </button>

          {/* Out of Stock Overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-charcoal text-white text-sm px-4 py-1.5 rounded-full">{t('product.outOfStock')}</span>
            </div>
          )}

          {/* Quick Add Button */}
          {!outOfStock && firstVariantId && (
            <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full bg-rose-gold hover:bg-rose-gold-dark text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {t('product.addToCart')}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-charcoal line-clamp-2 mb-1 group-hover:text-rose-gold transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-charcoal">{formatPrice(displayPrice, locale)}</span>
          {salePrice && (
            <span className="text-xs text-charcoal/40 line-through">{formatPrice(price, locale)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
