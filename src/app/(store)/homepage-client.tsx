"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { useCartStore, CartItem } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { ProductCard } from "@/components/store/product-card";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

interface Props {
  categories: any[];
  newArrivals: any[];
  bestSellers: any[];
  featuredProducts: any[];
  cmsSections: any[];
}

export function HomepageClient({
  categories,
  newArrivals,
  featuredProducts,
}: Props) {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean, high-resolution background with model on correct side and NO baked-in text
  const heroBackground =
    locale === "ar"
      ? "/images/mockup-assets/hero-bg-ar.jpg"
      : "/images/mockup-assets/hero-bg-en.jpg";

  // Mockup Featured Products (Striped Sweater, Cozy Set, Little Black Dress)
  const stripedSweater = featuredProducts.find((p) => p.slug === "striped-knit-sweater") || {
    id: "97cb9d96-fdfd-4870-a940-92582b00b10f",
    slug: "striped-knit-sweater",
    nameEn: "Striped Knit Sweater",
    nameAr: "سويتر تريكو مخطط",
    price: 65000,
    imageUrl: "/images/mockup-assets/product-striped-sweater.jpg",
    firstVariantId: "11bd1868-9ee5-4510-b4ab-e030992ec279",
    firstVariantSize: "M",
    firstVariantColor: "Striped",
    firstVariantColorAr: "مخطط",
    firstVariantSku: "FM-SWEATER-STRIPED-M",
    firstVariantStock: 15,
  };

  const cozySet = featuredProducts.find((p) => p.slug === "cozy-set") || {
    id: "efe503ff-3cf8-4719-8347-0fed4df21cfc",
    slug: "cozy-set",
    nameEn: "Cozy Set",
    nameAr: "طقم كوزي وردي",
    price: 85000,
    imageUrl: "/images/mockup-assets/product-cozy-set.jpg",
    firstVariantId: "dd1cb1fd-1cd5-4a08-952e-5e19a4661ada",
    firstVariantSize: "M",
    firstVariantColor: "Pink",
    firstVariantColorAr: "وردي",
    firstVariantSku: "FM-SET-COZY-PINK-M",
    firstVariantStock: 12,
  };

  const blackDress = featuredProducts.find((p) => p.slug === "little-black-dress") || {
    id: "28e683cc-58a8-414f-84bf-4dd85fd334cc",
    slug: "little-black-dress",
    nameEn: "Little Black Dress",
    nameAr: "فستان أسود قصير",
    price: 75000,
    imageUrl: "/images/mockup-assets/product-black-dress.jpg",
    firstVariantId: "c5512aef-17ed-43bf-b048-ef2a9d9b72af",
    firstVariantSize: "M",
    firstVariantColor: "Black",
    firstVariantColorAr: "أسود",
    firstVariantSku: "FM-DRESS-LBD-M",
    firstVariantStock: 8,
  };

  const mockupFeaturedCards = [stripedSweater, cozySet, blackDress];

  const handleQuickAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: CartItem = {
      id: `${p.id}-${p.firstVariantId || "default"}`,
      variantId: p.firstVariantId || "default",
      productId: p.id,
      productName: p.nameEn,
      productNameAr: p.nameAr,
      productImage: p.imageUrl || "/images/mockup-assets/product-striped-sweater.jpg",
      size: p.firstVariantSize || "M",
      colorName: p.firstVariantColor || "Default",
      colorNameAr: p.firstVariantColorAr || "افتراضي",
      colorHex: p.firstVariantColorHex || "#A66B72",
      sku: p.firstVariantSku || p.slug,
      price: p.price,
      salePrice: p.salePrice || null,
      quantity: 1,
      maxQuantity: p.firstVariantStock || 10,
    };
    addToCart(item);
    toast({
      title: locale === "ar" ? "تمت الإضافة للسلة بنجاح ♡" : "Added to cart ♡",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F1EB]">
      {/* 1. HERO BANNER - Responsive Mobile & Desktop Layout */}
      <section className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-[#E8D7C9]">
        <div className="relative w-full min-h-[260px] sm:min-h-[320px] md:min-h-[440px] lg:min-h-[500px] flex items-center">
          {/* Background image without any baked-in text */}
          <Image
            src={heroBackground}
            alt="FATMA - Style That Feels Like You"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Clean HTML Text Content - 100% Arabic in AR, 100% English in EN */}
          <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10 w-full py-5 sm:py-8 md:py-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Main Typography Column */}
              <div className="max-w-xs sm:max-w-md md:max-w-lg space-y-1.5 sm:space-y-2 md:space-y-4">
                <span className="inline-block text-[10px] sm:text-xs md:text-sm font-bold tracking-widest text-[#A66B72] uppercase">
                  {locale === "ar" ? "مجموعة جديدة" : "NEW COLLECTION"}
                </span>

                <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                  <span>{locale === "ar" ? "ستايل" : "Style That"}</span>
                  <span className="font-script text-[#A66B72] block text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-normal pt-0.5 sm:pt-1">
                    {locale === "ar" ? "يشبهكِ ♡" : "Feels Like You ♡"}
                  </span>
                </h1>

                <p className="text-xs md:text-base text-charcoal/80 max-w-md leading-relaxed hidden sm:block">
                  {locale === "ar"
                    ? "إطلالات عصرية، راحة يومية، صُنعت لكل نسخة منكِ."
                    : "Trendy looks, everyday comfort, made for every version of you."}
                </p>

                <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-[#A66B72] hover:bg-[#8F575E] text-white px-5 sm:px-7 md:px-9 py-2 sm:py-2.5 md:py-3.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{locale === "ar" ? "تسوقي الآن" : "Shop Now"}</span>
                    <Arrow className="w-3.5 h-3.5" />
                  </Link>

                  <p className="font-script text-base sm:text-xl md:text-2xl text-[#A66B72] select-none">
                    {locale === "ar"
                      ? "ملابس أنيقة لمزاج أفضل ♡"
                      : "Good Clothes Better Mood ♡"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES ROW - Responsive Circular Avatars */}
      <section className="py-5 sm:py-8 md:py-12 bg-[#FAF7F2] border-b border-[#E8D7C9]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-charcoal">
              {t("categories.shopByCategory")}
            </h2>
            <Link
              href="/shop"
              className="text-[11px] sm:text-xs md:text-sm text-charcoal/60 hover:text-[#A66B72] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{t("common.viewAll")}</span>
              <Arrow className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-8 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide justify-start md:justify-center">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center gap-1.5 sm:gap-2.5 flex-shrink-0 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 border-[#E8D7C9] p-0.5 sm:p-1 bg-white group-hover:border-[#A66B72] group-hover:shadow-md transition-all duration-300">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={cat.image_url || "/images/mockup-assets/category-tops.jpg"}
                      alt={locale === "ar" ? cat.name_ar : cat.name_en}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 70px, 120px"
                    />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-charcoal group-hover:text-[#A66B72] transition-colors flex items-center gap-0.5">
                  <span>{locale === "ar" ? cat.name_ar : cat.name_en}</span>
                  <Arrow className="w-2.5 h-2.5 text-charcoal/40 group-hover:text-[#A66B72]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION - 2 Columns on Mobile, 4 Columns on Desktop */}
      <section className="py-8 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-end justify-between mb-5 sm:mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#A66B72] uppercase block mb-0.5 sm:mb-1">
                {locale === "ar" ? "مجموعة مميزة" : "FEATURED COLLECTION"}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal flex items-center gap-1.5">
                <span>
                  {locale === "ar"
                    ? "إطلالتك المفضلة القادمة"
                    : "Your Next Favorite Look"}
                </span>
                <span className="font-script text-[#A66B72] text-2xl sm:text-3xl md:text-4xl">
                  ♡
                </span>
              </h2>
            </div>
            <Link
              href="/shop?collection=featured"
              className="text-[11px] sm:text-xs md:text-sm text-charcoal/70 hover:text-[#A66B72] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{locale === "ar" ? "استكشفي الكل" : "Explore All"}</span>
              <Arrow className="w-3 h-3" />
            </Link>
          </div>

          {/* Grid/Carousel: Smooth Horizontal Scroll on Mobile with Snap, 4 Columns on Desktop */}
          <div className="flex lg:grid lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {/* Promo Card: Boutique Clothing Rack (Hidden on small mobile to give products full priority, visible on desktop/large screens) */}
            <div className="hidden lg:flex relative rounded-2xl overflow-hidden shadow-sm border border-[#E8D7C9] group min-h-[380px] flex-col justify-end p-6 bg-white">
              <Image
                src="/images/mockup-assets/featured-collection-card.jpg"
                alt="FATMA Boutique Collection"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />

              <div className="relative z-10 w-full">
                <Link
                  href="/shop"
                  className="w-full bg-white/95 hover:bg-white text-charcoal hover:text-[#A66B72] font-semibold text-xs md:text-sm py-3 px-4 rounded-full shadow-lg text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>
                    {locale === "ar"
                      ? "استكشفي المجموعة"
                      : "Explore Collection"}
                  </span>
                  <Arrow className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 3 High-Res Product Cards (Smooth Carousel on Mobile, Grid on Desktop) */}
            {mockupFeaturedCards.map((p) => {
              const name = locale === "ar" ? p.nameAr : p.nameEn;
              const isWish = mounted ? isInWishlist(p.id) : false;

              return (
                <div
                  key={p.id}
                  className="w-[70vw] max-w-[260px] sm:w-[42vw] lg:w-auto flex-shrink-0 snap-center bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#EFE9DF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    {/* Image Container with Wishlist Heart */}
                    <div className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-[#FAF7F2] mb-2 sm:mb-3">
                      <Image
                        src={p.imageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />

                      {/* Heart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleItem(p.id);
                        }}
                        className="absolute top-2 end-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-charcoal/70 hover:text-[#A66B72] hover:bg-white transition-all"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            isWish ? "fill-[#A66B72] text-[#A66B72]" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm font-semibold text-charcoal mb-0.5 sm:mb-1 group-hover:text-[#A66B72] transition-colors line-clamp-1">
                      {name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm font-bold text-charcoal">
                        {formatPrice(p.price, locale)}
                      </span>
                    </div>
                  </Link>

                  {/* Full-width Mauve Add to Cart Button */}
                  <button
                    onClick={(e) => handleQuickAdd(p, e)}
                    className="w-full bg-[#A66B72] hover:bg-[#8F575E] text-white py-2 sm:py-2.5 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>
                      {locale === "ar" ? "أضيفي للسلة 🛒" : "Add to Cart 🛒"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS CATALOG SECTION (2 Columns on Mobile) */}
      {newArrivals.length > 0 && (
        <section className="py-8 sm:py-10 md:py-14 bg-white border-t border-[#E8D7C9]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#A66B72] uppercase block mb-0.5 sm:mb-1">
                  {locale === "ar" ? "وصل حديثاً" : "JUST IN"}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal">
                  {t("nav.newArrivals")}
                </h2>
              </div>
              <Link
                href="/shop?sort=newest"
                className="text-[11px] sm:text-xs md:text-sm text-charcoal/70 hover:text-[#A66B72] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{t("common.viewAll")}</span>
                <Arrow className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {newArrivals.slice(0, 4).map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  nameAr={product.nameAr}
                  nameEn={product.nameEn}
                  price={product.price}
                  salePrice={product.salePrice}
                  imageUrl={product.imageUrl}
                  imageAlt={product.imageAlt}
                  isNew={true}
                  isBestSeller={!!product.isBestseller}
                  isOnSale={!!product.salePrice}
                  lowStock={product.lowStock}
                  outOfStock={product.outOfStock}
                  firstVariantId={product.firstVariantId}
                  firstVariantSize={product.firstVariantSize}
                  firstVariantColor={product.firstVariantColor}
                  firstVariantColorAr={product.firstVariantColorAr}
                  firstVariantColorHex={product.firstVariantColorHex}
                  firstVariantSku={product.firstVariantSku}
                  firstVariantStock={product.firstVariantStock}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TRUST BADGES - Sleek Horizontal Strip */}
      <section className="py-4 sm:py-6 bg-[#FAF7F2] border-t border-b border-[#E8D7C9]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-center">
            {/* 1. Fast Shipping */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm flex-shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-[11px] sm:text-xs font-bold text-charcoal leading-tight">
                  {t("trust.fastShipping")}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-charcoal/60 leading-tight">
                  {t("trust.fastShippingDesc")}
                </p>
              </div>
            </div>

            {/* 2. Secure Payment */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-[11px] sm:text-xs font-bold text-charcoal leading-tight">
                  {t("trust.securePayment")}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-charcoal/60 leading-tight">
                  {t("trust.securePaymentDesc")}
                </p>
              </div>
            </div>

            {/* 3. Easy Returns */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm flex-shrink-0">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-[11px] sm:text-xs font-bold text-charcoal leading-tight">
                  {t("trust.easyReturns")}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-charcoal/60 leading-tight">
                  {t("trust.easyReturnsDesc")}
                </p>
              </div>
            </div>

            {/* 4. Customer Support */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm flex-shrink-0">
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-[11px] sm:text-xs font-bold text-charcoal leading-tight">
                  {t("trust.customerSupport")}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-charcoal/60 leading-tight">
                  {t("trust.customerSupportDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
