'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, Calendar, TrendingUp, ShoppingCart, Users, Tag } from 'lucide-react';

interface SalesReport {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
}

interface ProductReport {
  topByQuantity: { name: string; quantity: number; revenue: number }[];
  topByRevenue: { name: string; quantity: number; revenue: number }[];
}

interface CustomerReport {
  newCustomers: number;
  returningCustomers: number;
  topCustomers: { name: string; email: string; spent: number; orders: number }[];
}

interface CouponReport {
  totalUsed: number;
  totalDiscount: number;
  coupons: { code: string; usage: number; discount: number }[];
}

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<ProductReport | null>(null);
  const [customers, setCustomers] = useState<CustomerReport | null>(null);
  const [couponsReport, setCouponsReport] = useState<CouponReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'coupons'>('sales');

  useEffect(() => { loadReports(); }, [dateFrom, dateTo]);

  async function loadReports() {
    setLoading(true);
    try {
      const params = `from=${dateFrom}&to=${dateTo}`;
      const [s, p, c, cp] = await Promise.all([
        fetch(`/api/admin/reports?type=sales&${params}`).then(r => r.json()).catch(() => null),
        fetch(`/api/admin/reports?type=products&${params}`).then(r => r.json()).catch(() => null),
        fetch(`/api/admin/reports?type=customers&${params}`).then(r => r.json()).catch(() => null),
        fetch(`/api/admin/reports?type=coupons&${params}`).then(r => r.json()).catch(() => null),
      ]);
      setSales(s); setProducts(p); setCustomers(c); setCouponsReport(cp);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function setQuickRange(days: number) {
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  }

  function fmtEGP(piasters: number) { return `${(piasters / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })} EGP`; }

  function exportCSV(headers: string[], rows: string[][], filename: string) {
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const tabs = [
    { id: 'sales' as const, label: 'Sales', icon: TrendingUp },
    { id: 'products' as const, label: 'Products', icon: ShoppingCart },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'coupons' as const, label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track store performance and insights</p>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-auto" />
            <span className="text-gray-400">to</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-auto" />
            <div className="flex gap-1">
              {[{ label: 'Today', days: 0 }, { label: '7d', days: 7 }, { label: '30d', days: 30 }, { label: '90d', days: 90 }].map(q => (
                <Button key={q.label} variant="outline" size="sm" onClick={() => setQuickRange(q.days)}>{q.label}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
              ${activeTab === tab.id ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>
      ) : (
        <>
          {/* Sales Tab */}
          {activeTab === 'sales' && sales && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Total Orders</p><p className="text-3xl font-bold text-charcoal">{sales.totalOrders}</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Total Revenue</p><p className="text-3xl font-bold text-green-600">{fmtEGP(sales.totalRevenue)}</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Avg Order Value</p><p className="text-3xl font-bold text-charcoal">{fmtEGP(sales.avgOrderValue)}</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Orders by Status</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    const entries = Object.entries(sales.ordersByStatus);
                    exportCSV(['Status', 'Count'], entries.map(([s, c]) => [s, String(c)]), 'sales-by-status.csv');
                  }}><Download className="w-3 h-3 me-1" /> CSV</Button>
                </CardHeader>
                <CardContent>
                  {Object.entries(sales.ordersByStatus).map(([status, count]) => {
                    const max = Math.max(...Object.values(sales.ordersByStatus), 1);
                    return (
                      <div key={status} className="flex items-center gap-3 mb-2">
                        <span className="w-32 text-sm text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-rose-gold h-full rounded-full flex items-center justify-end pe-2 text-xs text-white font-medium transition-all"
                            style={{ width: `${Math.max((count / max) * 100, 8)}%` }}>{count}</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && products && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Top by Quantity</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    exportCSV(['Product', 'Quantity', 'Revenue'], products.topByQuantity.map(p => [p.name, String(p.quantity), String(p.revenue / 100)]), 'top-products-qty.csv');
                  }}><Download className="w-3 h-3 me-1" /> CSV</Button>
                </CardHeader>
                <CardContent>
                  {products.topByQuantity.length === 0 ? <p className="text-gray-400 text-sm">No data</p> :
                    products.topByQuantity.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">{p.quantity} sold</Badge>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Top by Revenue</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    exportCSV(['Product', 'Revenue', 'Quantity'], products.topByRevenue.map(p => [p.name, String(p.revenue / 100), String(p.quantity)]), 'top-products-rev.csv');
                  }}><Download className="w-3 h-3 me-1" /> CSV</Button>
                </CardHeader>
                <CardContent>
                  {products.topByRevenue.length === 0 ? <p className="text-gray-400 text-sm">No data</p> :
                    products.topByRevenue.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">{fmtEGP(p.revenue)}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && customers && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">New Customers</p><p className="text-3xl font-bold text-charcoal">{customers.newCustomers}</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Returning Customers</p><p className="text-3xl font-bold text-charcoal">{customers.returningCustomers}</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Top Customers</CardTitle></CardHeader>
                <CardContent>
                  {customers.topCustomers.length === 0 ? <p className="text-gray-400 text-sm">No data</p> :
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left py-2 font-medium text-gray-500">Customer</th><th className="text-left py-2 font-medium text-gray-500">Orders</th><th className="text-right py-2 font-medium text-gray-500">Total Spent</th></tr></thead>
                      <tbody>{customers.topCustomers.map((c, i) => (
                        <tr key={i} className="border-b last:border-0"><td className="py-2">{c.name}<span className="text-gray-400 text-xs block">{c.email}</span></td><td className="py-2">{c.orders}</td><td className="py-2 text-right font-medium">{fmtEGP(c.spent)}</td></tr>
                      ))}</tbody>
                    </table></div>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Coupons Tab */}
          {activeTab === 'coupons' && couponsReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Total Coupons Used</p><p className="text-3xl font-bold text-charcoal">{couponsReport.totalUsed}</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-sm text-gray-500">Total Discount Given</p><p className="text-3xl font-bold text-rose-blush">{fmtEGP(couponsReport.totalDiscount)}</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Coupon Performance</CardTitle></CardHeader>
                <CardContent>
                  {couponsReport.coupons.length === 0 ? <p className="text-gray-400 text-sm">No coupon usage</p> :
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left py-2 font-medium text-gray-500">Code</th><th className="text-left py-2 font-medium text-gray-500">Uses</th><th className="text-right py-2 font-medium text-gray-500">Total Discount</th></tr></thead>
                      <tbody>{couponsReport.coupons.map((c, i) => (
                        <tr key={i} className="border-b last:border-0"><td className="py-2"><code className="bg-gray-100 px-2 py-0.5 rounded">{c.code}</code></td><td className="py-2">{c.usage}</td><td className="py-2 text-right font-medium">{fmtEGP(c.discount)}</td></tr>
                      ))}</tbody>
                    </table></div>}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
