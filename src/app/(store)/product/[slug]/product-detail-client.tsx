"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { useCartStore, CartItem } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatPrice, cn } from "@/lib/utils";
import { Heart, ShoppingBag, Share2, Minus, Plus, Truck, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface Props {
  product: any;
  relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const { t, locale, dir } = useI18n();
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const description = locale === 'ar' ? product.description_ar : product.description_en;

  // Get unique sizes and colors
  const sizes = useMemo(() => [...new Set(product.variants.map((v: any) => v.size))] as string[], [product.variants]);
  const colors = useMemo(() => {
    const seen = new Map();
    product.variants.forEach((v: any) => {
      if (!seen.has(v.color_name_en)) {
        seen.set(v.color_name_en, { nameEn: v.color_name_en, nameAr: v.color_name_ar, hex: v.color_hex });
      }
    });
    return Array.from(seen.values());
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0]?.nameEn || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find((v: any) => v.size === selectedSize && v.color_name_en === selectedColor);
  }, [product.variants, selectedSize, selectedColor]);

  const availableStock = selectedVariant ? selectedVariant.available : 0;
  const displayPrice = product.sale_price || product.price;
  const variantPrice = selectedVariant?.price_override || displayPrice;
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  const images = product.images.length > 0 ? product.images : [{ url: '/images/fatma-logo.jpg', alt_text_en: name }];

  // Check which sizes are available for selected color
  const availableSizesForColor = useMemo(() => {
    return product.variants
      .filter((v: any) => v.color_name_en === selectedColor && v.available > 0)
      .map((v: any) => v.size);
  }, [product.variants, selectedColor]);

  const handleAddToCart = () => {
    if (!selectedVariant || availableStock <= 0) return;
    const item: CartItem = {
      id: `${product.id}-${selectedVariant.id}`,
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name_en,
      productNameAr: product.name_ar,
      productImage: images[0]?.url || '',
      size: selectedSize,
      colorName: selectedColor,
      colorNameAr: selectedVariant.color_name_ar || '',
      colorHex: selectedVariant.color_hex || '',
      sku: selectedVariant.sku,
      price: product.price,
      salePrice: product.sale_price,
      quantity,
      maxQuantity: availableStock,
    };
    addToCart(item);
    toast({ title: locale === 'ar' ? 'تمت الإضافة للسلة ♡' : 'Added to cart ♡', variant: 'success' });
  };

  const handleToggleWishlist = () => {
    toggleItem(product.id);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-beige">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-charcoal/60">
            <Link href="/" className="hover:text-rose-gold">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-rose-gold">{t('nav.shop')}</Link>
            {product.category_name_en && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/shop?category=${product.category_slug}`} className="hover:text-rose-gold">
                  {locale === 'ar' ? product.category_name_ar : product.category_name_en}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-charcoal">{name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-beige/30">
              <Image
                src={images[activeImage]?.url || '/images/fatma-logo.jpg'}
                alt={images[activeImage]?.alt_text_en || name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute start-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white"
                  >
                    {dir === 'rtl' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white"
                  >
                    {dir === 'rtl' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </>
              )}
              {/* Sale Badge */}
              {discount > 0 && (
                <span className="absolute top-3 start-3 bg-rose-blush text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                      activeImage === i ? "border-rose-gold" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">{name}</h1>
            <p className="text-xs text-charcoal/40 mb-4">{t('product.sku')}: {product.sku}</p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-charcoal">{formatPrice(variantPrice, locale)}</span>
              {product.sale_price && (
                <span className="text-lg text-charcoal/40 line-through">{formatPrice(product.price, locale)}</span>
              )}
              {discount > 0 && (
                <span className="bg-rose-blush/10 text-rose-blush text-sm font-medium px-2 py-0.5 rounded">
                  {t('product.discount', { percent: String(discount) })}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-charcoal mb-2">
                  {t('product.selectColor')}: <span className="text-charcoal/60">{locale === 'ar' ? colors.find(c => c.nameEn === selectedColor)?.nameAr : selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.nameEn}
                      onClick={() => setSelectedColor(color.nameEn)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor === color.nameEn ? "border-rose-gold ring-2 ring-rose-gold/30" : "border-beige hover:border-charcoal/30"
                      )}
                      style={{ backgroundColor: color.hex || '#ccc' }}
                      title={locale === 'ar' ? color.nameAr : color.nameEn}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-charcoal">{t('product.selectSize')}</p>
                  <Link href="/pages/size-guide" className="text-xs text-rose-gold hover:underline">{t('product.sizeGuide')}</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => {
                    const available = availableSizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={cn(
                          "min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-all",
                          selectedSize === size
                            ? "bg-charcoal text-white border-charcoal"
                            : available
                            ? "border-beige text-charcoal hover:border-charcoal"
                            : "border-beige/50 text-charcoal/30 line-through cursor-not-allowed"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-5">
              {availableStock > 0 ? (
                availableStock <= 5 ? (
                  <p className="text-sm text-amber-600">⚡ {t('product.lowStock')} — {availableStock} {locale === 'ar' ? 'فقط' : 'left'}</p>
                ) : (
                  <p className="text-sm text-green-600">✓ {t('product.inStock')}</p>
                )
              ) : (
                <p className="text-sm text-red-500">✕ {t('product.outOfStock')}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-charcoal mb-2">{t('product.quantity')}</p>
              <div className="flex items-center gap-3 border border-beige rounded-lg w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-beige/50 rounded-s-lg"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} disabled={quantity >= availableStock} className="p-2.5 hover:bg-beige/50 rounded-e-lg disabled:opacity-30"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button onClick={handleAddToCart} disabled={availableStock <= 0} className="flex-1 rounded-lg" size="lg">
                <ShoppingBag className="h-5 w-5" /> {t('product.addToCart')}
              </Button>
              <Button
                onClick={handleToggleWishlist}
                variant="outline"
                size="lg"
                className="rounded-lg"
              >
                <Heart className={cn("h-5 w-5", wishlisted && "fill-rose-blush text-rose-blush")} />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-lg"
                onClick={() => navigator.share?.({ title: name, url: window.location.href }).catch(() => {})}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-charcoal/60 bg-beige/30 rounded-lg p-3">
                <Truck className="h-4 w-4 text-rose-gold" />
                {t('trust.fastShipping')}
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal/60 bg-beige/30 rounded-lg p-3">
                <RotateCcw className="h-4 w-4 text-rose-gold" />
                {t('trust.easyReturns')}
              </div>
            </div>

            {/* Details Accordion */}
            <Accordion type="multiple" className="w-full">
              {description && (
                <AccordionItem value="description">
                  <AccordionTrigger>{t('product.description')}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-charcoal/70 leading-relaxed whitespace-pre-line">{description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="delivery">
                <AccordionTrigger>{t('product.deliveryInfo')}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-charcoal/70">
                    {locale === 'ar'
                      ? 'التوصيل خلال ٣-٥ أيام عمل. شحن مجاني للطلبات فوق ١,٠٠٠ ج.م.'
                      : 'Delivery within 3-5 business days. Free shipping on orders above EGP 1,000.'}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>{t('product.returnInfo')}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-charcoal/70">
                    {locale === 'ar'
                      ? 'إرجاع واستبدال خلال ٧ أيام من الاستلام. المنتج لازم يكون بحالته الأصلية.'
                      : 'Returns and exchanges within 7 days of delivery. Product must be in original condition.'}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold text-charcoal mb-6">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  nameAr={p.nameAr}
                  nameEn={p.nameEn}
                  price={p.price}
                  salePrice={p.salePrice}
                  imageUrl={p.imageUrl}
                  firstVariantId={p.firstVariantId}
                  firstVariantSize={p.firstVariantSize}
                  firstVariantColor={p.firstVariantColor}
                  firstVariantColorAr={p.firstVariantColorAr}
                  firstVariantColorHex={p.firstVariantColorHex}
                  firstVariantSku={p.firstVariantSku}
                  firstVariantStock={p.firstVariantStock}
                  lowStock={p.lowStock}
                  outOfStock={p.outOfStock}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
