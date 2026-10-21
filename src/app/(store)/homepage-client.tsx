"use client";

import React from "react";
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
  bestSellers,
  featuredProducts,
}: Props) {
  const { t, locale, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

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
      {/* 1. HERO BANNER - High-Resolution, Dedicated Clean Background for each Language */}
      <section className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-[#E8D7C9]">
        <div className="relative w-full min-h-[340px] md:min-h-[460px] lg:min-h-[520px] flex items-center">
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
          <div className="container mx-auto px-6 md:px-12 relative z-10 w-full py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Main Typography Column */}
              <div className="max-w-lg space-y-3 md:space-y-4">
                <span className="inline-block text-xs md:text-sm font-bold tracking-widest text-[#A66B72] uppercase">
                  {locale === "ar" ? "مجموعة جديدة" : "NEW COLLECTION"}
                </span>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                  <span>{locale === "ar" ? "ستايل" : "Style That"}</span>
                  <span className="font-script text-[#A66B72] block text-4xl md:text-6xl lg:text-7xl font-normal pt-1.5">
                    {locale === "ar" ? "يشبهكِ ♡" : "Feels Like You ♡"}
                  </span>
                </h1>

                <p className="text-xs md:text-base text-charcoal/80 max-w-md leading-relaxed">
                  {locale === "ar"
                    ? "إطلالات عصرية، راحة يومية، صُنعت لكل نسخة منكِ."
                    : "Trendy looks, everyday comfort, made for every version of you."}
                </p>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2.5 bg-[#A66B72] hover:bg-[#8F575E] text-white px-7 md:px-9 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{locale === "ar" ? "تسوقي الآن" : "Shop Now"}</span>
                    <Arrow className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Decorative script quote on opposite side */}
              <div className="hidden lg:block">
                <p className="font-script text-2xl lg:text-3xl text-charcoal/70 drop-shadow-sm select-none">
                  {locale === "ar"
                    ? "ملابس أنيقة لمزاج أفضل ♡"
                    : "Good Clothes Better Mood ♡"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES ROW - High-Resolution 800x800 Photographic Circles */}
      <section className="py-8 md:py-12 bg-[#FAF7F2] border-b border-[#E8D7C9]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-charcoal">
              {t("categories.shopByCategory")}
            </h2>
            <Link
              href="/shop"
              className="text-xs md:text-sm text-charcoal/60 hover:text-[#A66B72] font-medium flex items-center gap-1 transition-colors"
            >
              <span>{t("common.viewAll")}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center gap-2.5 flex-shrink-0 group"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-[#E8D7C9] p-1 bg-white group-hover:border-[#A66B72] group-hover:shadow-lg transition-all duration-300">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={cat.image_url || "/images/mockup-assets/category-tops.jpg"}
                      alt={locale === "ar" ? cat.name_ar : cat.name_en}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="120px"
                    />
                  </div>
                </div>
                <span className="text-xs md:text-sm font-semibold text-charcoal group-hover:text-[#A66B72] transition-colors flex items-center gap-1">
                  <span>{locale === "ar" ? cat.name_ar : cat.name_en}</span>
                  <Arrow className="w-3 h-3 text-charcoal/40 group-hover:text-[#A66B72]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION - High-Res Boutique Card + 3 High-Res Products */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#A66B72] uppercase block mb-1">
                {locale === "ar" ? "مجموعة مميزة" : "FEATURED COLLECTION"}
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal flex items-center gap-2">
                <span>
                  {locale === "ar"
                    ? "إطلالتك المفضلة القادمة"
                    : "Your Next Favorite Look"}
                </span>
                <span className="font-script text-[#A66B72] text-3xl md:text-4xl">
                  ♡
                </span>
              </h2>
            </div>
            <Link
              href="/shop?collection=featured"
              className="text-xs md:text-sm text-charcoal/70 hover:text-[#A66B72] font-medium flex items-center gap-1 transition-colors"
            >
              <span>{locale === "ar" ? "استكشفي الكل" : "Explore All"}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Cards Grid: 1 Promo Card on Left + 3 High-Res Products on Right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Promo Card: Boutique Clothing Rack */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#E8D7C9] group min-h-[380px] flex flex-col justify-end p-6 bg-white">
              <Image
                src="/images/mockup-assets/featured-collection-card.jpg"
                alt="FATMA Boutique Collection"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 25vw"
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

            {/* 3 High-Res Product Cards */}
            {mockupFeaturedCards.map((p) => {
              const name = locale === "ar" ? p.nameAr : p.nameEn;
              const isWish = isInWishlist(p.id);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-[#EFE9DF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    {/* Image Container with Wishlist Heart */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2] mb-3">
                      <Image
                        src={p.imageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />

                      {/* Heart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleItem(p.id);
                        }}
                        className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-charcoal/70 hover:text-[#A66B72] hover:bg-white transition-all"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWish ? "fill-[#A66B72] text-[#A66B72]" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-semibold text-charcoal mb-1 group-hover:text-[#A66B72] transition-colors line-clamp-1">
                      {name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-charcoal">
                        {formatPrice(p.price, locale)}
                      </span>
                    </div>
                  </Link>

                  {/* Full-width Mauve Add to Cart Button */}
                  <button
                    onClick={(e) => handleQuickAdd(p, e)}
                    className="w-full bg-[#A66B72] hover:bg-[#8F575E] text-white py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
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

      {/* 4. NEW ARRIVALS CATALOG SECTION (If more products exist) */}
      {newArrivals.length > 0 && (
        <section className="py-10 md:py-14 bg-white border-t border-[#E8D7C9]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#A66B72] uppercase block mb-1">
                  {locale === "ar" ? "وصل حديثاً" : "JUST IN"}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
                  {t("nav.newArrivals")}
                </h2>
              </div>
              <Link
                href="/shop?sort=newest"
                className="text-xs md:text-sm text-charcoal/70 hover:text-[#A66B72] font-medium flex items-center gap-1 transition-colors"
              >
                <span>{t("common.viewAll")}</span>
                <Arrow className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* 5. TRUST BADGES */}
      <section className="py-10 bg-[#FAF7F2] border-t border-b border-[#E8D7C9]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* 1. Fast Shipping */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-charcoal">
                {t("trust.fastShipping")}
              </h4>
              <p className="text-xs text-charcoal/60">
                {t("trust.fastShippingDesc")}
              </p>
            </div>

            {/* 2. Secure Payment */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-charcoal">
                {t("trust.securePayment")}
              </h4>
              <p className="text-xs text-charcoal/60">
                {t("trust.securePaymentDesc")}
              </p>
            </div>

            {/* 3. Easy Returns */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-charcoal">
                {t("trust.easyReturns")}
              </h4>
              <p className="text-xs text-charcoal/60">
                {t("trust.easyReturnsDesc")}
              </p>
            </div>

            {/* 4. Customer Support */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-[#A66B72] shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-charcoal">
                {t("trust.customerSupport")}
              </h4>
              <p className="text-xs text-charcoal/60">
                {t("trust.customerSupportDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
