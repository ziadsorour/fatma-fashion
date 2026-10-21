"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n";

export function StoreFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F4ECE6] border-t border-[#E8D7C9] text-charcoal pb-24 md:pb-8 pt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-block py-1">
              <Image
                src="/images/fatma-logo-transparent.png"
                alt="FATMA - Fashion For Girls"
                width={240}
                height={140}
                style={{ width: 'auto' }}
                className="h-[60px] sm:h-[68px] w-auto object-contain"
              />
            </Link>
            <p className="text-xs md:text-sm text-charcoal/70 leading-relaxed max-w-xs">
              {locale === 'ar'
                ? 'أزياء عصرية للبنات. ستايل يشبهك وراحة يومية مصنوعة لكل نسخة منكِ.'
                : 'Trendy looks, everyday comfort, made for every version of you.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="https://instagram.com"
                target="_blank"
                className="w-8 h-8 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-charcoal/80 hover:text-white hover:bg-[#A66B72] hover:border-[#A66B72] transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </Link>
              <Link
                href="https://tiktok.com"
                target="_blank"
                className="w-8 h-8 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-charcoal/80 hover:text-white hover:bg-[#A66B72] hover:border-[#A66B72] transition-colors shadow-sm"
                aria-label="TikTok"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.06a8.16 8.16 0 0 0 3.85.96V6.69z"/></svg>
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                className="w-8 h-8 rounded-full bg-white border border-[#E8D7C9] flex items-center justify-center text-charcoal/80 hover:text-white hover:bg-[#A66B72] hover:border-[#A66B72] transition-colors shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-charcoal mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-charcoal/70">
              <li>
                <Link href="/" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=featured" className="hover:text-[#A66B72] transition-colors">
                  {locale === 'ar' ? 'المجموعات' : 'Collections'}
                </Link>
              </li>
              <li>
                <Link href="/pages/about" className="hover:text-[#A66B72] transition-colors">
                  {locale === 'ar' ? 'عنّا' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-charcoal mb-4">
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-charcoal/70">
              <li>
                <Link href="/track-order" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.trackOrder')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.help')}
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-policy" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/pages/return-policy" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.returnPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/pages/size-guide" className="hover:text-[#A66B72] transition-colors">
                  {t('nav.sizeGuide')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Signature & Newsletter */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="font-script text-3xl md:text-4xl text-[#A66B72] mb-3">
                Fashion for Girls ♡
              </p>
              <p className="text-xs text-charcoal/70 mb-4">
                {locale === 'ar'
                  ? 'اشتركي لتصلك أحدث العروض والتشكيلات الحصرية أولاً بأول.'
                  : 'Subscribe to get the latest releases and exclusive offers.'}
              </p>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(locale === 'ar' ? 'شكراً لاشتراكك!' : 'Thank you for subscribing!');
                }}
              >
                <input
                  type="email"
                  placeholder={locale === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1 h-9 px-3 text-xs rounded-full border border-[#E8D7C9] bg-white focus:outline-none focus:border-[#A66B72]"
                  required
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-full bg-[#A66B72] text-white text-xs font-medium hover:bg-[#8F575E] transition-colors flex-shrink-0"
                >
                  {locale === 'ar' ? 'اشتراك' : 'Join'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E8D7C9] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal/60 gap-3">
          <p>© {year} FATMA. {t('footer.allRightsReserved')}</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/pages/privacy-policy" className="hover:text-charcoal transition-colors">
              {t('nav.privacyPolicy')}
            </Link>
            <span>•</span>
            <Link href="/pages/terms" className="hover:text-charcoal transition-colors">
              {t('nav.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
