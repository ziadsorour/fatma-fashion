"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Globe,
  Home,
  LayoutGrid,
} from "lucide-react";

export function AnnouncementBar({ message }: { message?: string }) {
  const { t } = useI18n();
  const text = message || t('announcement.freeShipping', { amount: '1,000' });
  return (
    <div className="bg-[#FAF7F2] border-b border-[#EFE9DF] text-charcoal/80 text-[11px] sm:text-xs py-1.5 sm:py-2">
      <div className="container mx-auto px-4 flex items-center justify-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-charcoal/80 font-medium">
          <span>🚚</span>
          <span>{text}</span>
        </p>
        <div className="hidden sm:flex items-center gap-4 text-xs text-charcoal/60">
          <Link href="/track-order" className="hover:text-charcoal transition-colors">
            {t('nav.trackOrder')}
          </Link>
          <span className="text-charcoal/20">|</span>
          <Link href="/faq" className="hover:text-charcoal transition-colors">
            {t('nav.help')}
          </Link>
          <span className="text-charcoal/20">|</span>
          <div className="flex items-center gap-2.5">
            <Link href="https://instagram.com" target="_blank" aria-label="Instagram" className="hover:text-charcoal">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </Link>
            <Link href="https://tiktok.com" target="_blank" aria-label="TikTok" className="hover:text-charcoal">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.06a8.16 8.16 0 0 0 3.85.96V6.69z"/></svg>
            </Link>
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook" className="hover:text-charcoal">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreHeader() {
  const { t, locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  return (
    <>
      <AnnouncementBar />
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#EFE9DF]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Mobile: Hamburger Left (or Right in RTL) */}
            <div className="flex items-center md:hidden">
              <button
                className="p-2 -ms-2 text-charcoal hover:text-[#A66B72] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop Left: Search input + Links */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              {/* Search Pill */}
              <form action="/shop" method="GET" className="relative w-64">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal/40" />
                <input
                  type="search"
                  name="q"
                  placeholder={locale === 'ar' ? 'ابحثي عن ستايلك...' : 'Search for your favorite style...'}
                  className="w-full h-9 ps-8 pe-4 rounded-full border border-[#E8D7C9] bg-[#FAF7F2] text-xs text-charcoal focus:outline-none focus:border-charcoal/40 placeholder:text-charcoal/40"
                />
              </form>

              <nav className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-charcoal hover:text-[#A66B72] transition-colors border-b-2 border-charcoal pb-0.5">
                  {t('nav.home')}
                </Link>
                <Link href="/shop" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">
                  {t('nav.shop')}
                </Link>
                <Link href="/shop?collection=featured" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">
                  {locale === 'ar' ? 'المجموعات' : 'Collections'}
                </Link>
              </nav>
            </div>

            {/* Logo: Centered on both Mobile & Desktop */}
            <div className="flex items-center justify-center flex-shrink-0">
              <Link href="/" className="flex items-center justify-center">
                <Image
                  src="/images/fatma-logo-transparent.svg"
                  alt="FATMA - Fashion For Girls"
                  width={150}
                  height={48}
                  style={{ height: '40px', width: 'auto', maxHeight: '44px' }}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Right: About Us, Contact, Language, Account, Cart */}
            <div className="hidden md:flex items-center justify-end gap-5 flex-1">
              <nav className="flex items-center gap-6">
                <Link href="/pages/about" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">
                  {locale === 'ar' ? 'عنّا' : 'About Us'}
                </Link>
                <Link href="/contact" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">
                  {t('nav.contact')}
                </Link>
              </nav>

              <span className="text-charcoal/20">|</span>

              <button
                onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 text-xs text-charcoal/70 hover:text-charcoal transition-colors px-2 py-1 rounded border border-[#E8D7C9]"
                aria-label="Switch language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              <Link href="/account" className="text-charcoal hover:text-[#A66B72] transition-colors p-1" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>

              <Link href="/account/wishlist" className="text-charcoal hover:text-[#A66B72] transition-colors relative p-1" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -end-1 bg-[#A66B72] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="text-charcoal hover:text-[#A66B72] transition-colors relative p-1" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -end-1 bg-charcoal text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </Link>
            </div>

            {/* Mobile Right: Search, Wishlist, Cart */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-charcoal hover:text-[#A66B72]"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link href="/account/wishlist" className="p-1.5 text-charcoal relative" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -end-1 bg-[#A66B72] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="p-1.5 text-charcoal relative" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -end-1 bg-charcoal text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Search Input dropdown */}
          {searchOpen && (
            <div className="py-2.5 md:hidden border-t border-[#EFE9DF]">
              <form action="/shop" method="GET" className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                <input
                  type="search"
                  name="q"
                  placeholder={locale === 'ar' ? 'ابحثي عن ستايلك...' : 'Search for your favorite style...'}
                  className="w-full h-9 ps-9 pe-4 rounded-full border border-[#E8D7C9] bg-[#FAF7F2] text-xs focus:outline-none focus:border-charcoal"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EFE9DF] bg-white shadow-xl animate-slide-down">
            <nav className="container mx-auto px-5 py-4 space-y-2.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-charcoal hover:text-[#A66B72] border-b border-[#F4ECE6]"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-[#F4ECE6]"
              >
                {t('nav.shop')}
              </Link>
              <Link
                href="/shop?collection=featured"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-[#F4ECE6]"
              >
                {locale === 'ar' ? 'المجموعات' : 'Collections'}
              </Link>
              <Link
                href="/pages/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-[#F4ECE6]"
              >
                {locale === 'ar' ? 'عنّا' : 'About Us'}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-[#F4ECE6]"
              >
                {t('nav.contact')}
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal border-b border-[#F4ECE6]"
              >
                {t('nav.trackOrder')}
              </Link>
              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => {
                    setLocale(locale === 'ar' ? 'en' : 'ar');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-charcoal font-semibold px-3 py-1.5 rounded-full border border-[#E8D7C9] bg-[#FAF7F2]"
                >
                  <Globe className="h-3.5 w-3.5 text-[#A66B72]" />
                  <span>{locale === 'ar' ? 'Switch to English' : 'التحويل للعربية'}</span>
                </button>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-[#A66B72] font-bold"
                >
                  {t('common.account')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export function MobileBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  const navItems = [
    { href: "/", label: t('nav.home'), icon: Home, active: pathname === "/" },
    { href: "/shop", label: t('nav.shop'), icon: LayoutGrid, active: pathname.startsWith("/shop") },
    { href: "/account/wishlist", label: t('common.wishlist'), icon: Heart, badge: wishlistCount, active: pathname === "/account/wishlist" },
    { href: "/cart", label: t('common.cart'), icon: ShoppingBag, badge: cartCount, active: pathname === "/cart" },
    { href: "/account", label: t('common.account'), icon: User, active: pathname.startsWith("/account") && pathname !== "/account/wishlist" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8D7C9] z-40 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="grid grid-cols-5 text-center items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 relative py-1 transition-colors ${
                isActive ? "text-[#A66B72]" : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -end-2 bg-[#A66B72] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-bold text-[#A66B72]" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
