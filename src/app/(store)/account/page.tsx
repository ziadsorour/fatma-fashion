'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, MapPin, Heart, Settings, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const { t, locale, dir } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const Arrow = dir === 'rtl' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    Promise.all([
      fetch('/api/account/profile').then(r => r.ok ? r.json() : null),
      fetch('/api/account/orders?limit=3').then(r => r.ok ? r.json() : { orders: [] }),
    ]).then(([profile, orders]) => {
      setUser(profile?.user || null);
      setRecentOrders(orders?.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  const quickLinks = [
    { href: '/account/orders', icon: ShoppingBag, label: t('account.orders'), desc: locale === 'ar' ? 'تتبع طلباتك' : 'Track your orders' },
    { href: '/account/addresses', icon: MapPin, label: t('account.addresses'), desc: locale === 'ar' ? 'إدارة عناوينك' : 'Manage addresses' },
    { href: '/account/wishlist', icon: Heart, label: t('account.wishlist'), desc: locale === 'ar' ? 'المنتجات المفضلة' : 'Saved items' },
    { href: '/account/settings', icon: Settings, label: t('account.settings'), desc: locale === 'ar' ? 'تعديل بياناتك' : 'Edit profile' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      {user && (
        <Card className="bg-gradient-to-r from-rose-gold/10 to-beige/30 border-none">
          <CardContent className="py-6">
            <h2 className="text-xl font-serif text-charcoal">
              {locale === 'ar' ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="py-4 text-center">
                <link.icon className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="font-medium text-sm text-charcoal">{link.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">{locale === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}</h3>
            <Link href="/account/orders" className="text-sm text-rose-gold hover:underline flex items-center gap-1">
              {t('common.viewAll')} <Arrow className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('order.noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-beige/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at * 1000).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">{t(`order.statuses.${order.status}`) || order.status}</Badge>
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
