'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { User, ShoppingBag, MapPin, Heart, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const accountLinks = [
  { href: '/account', icon: User, labelKey: 'account.myAccount' },
  { href: '/account/orders', icon: ShoppingBag, labelKey: 'account.orders' },
  { href: '/account/addresses', icon: MapPin, labelKey: 'account.addresses' },
  { href: '/account/wishlist', icon: Heart, labelKey: 'account.wishlist' },
  { href: '/account/settings', icon: Settings, labelKey: 'account.settings' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { t, locale, dir } = useI18n();
  const pathname = usePathname();
  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif text-charcoal mb-6">{t('account.myAccount')}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {accountLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    isActive ? "bg-rose-gold/10 text-rose-gold font-medium" : "text-gray-600 hover:bg-beige/50 hover:text-charcoal")}>
                  <link.icon className="w-4 h-4" />
                  <span>{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {accountLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-full text-xs whitespace-nowrap transition-colors border",
                    isActive ? "bg-rose-gold text-white border-rose-gold" : "bg-white text-gray-600 border-gray-200")}>
                  <link.icon className="w-3 h-3" />
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
