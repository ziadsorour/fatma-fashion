"use client";

import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  ShoppingCart, DollarSign, Package, Users, TrendingUp, AlertTriangle,
  Clock, CheckCircle, Truck, ArrowUpRight
} from "lucide-react";

interface Props {
  stats: {
    totalOrders: number; pendingOrders: number; processingOrders: number; deliveredOrders: number;
    grossSales: number; netSales: number; avgOrderValue: number; totalCustomers: number;
    totalProducts: number; lowStockProducts: number; recentOrders: any[]; topProducts: any[];
  };
}

function StatCard({ title, value, icon: Icon, color, href }: { title: string; value: string | number; icon: any; color: string; href?: string }) {
  const Card = href ? Link : 'div';
  return (
    <Card href={href || '#'} className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {href && <ArrowUpRight className="h-4 w-4 text-gray-300" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </Card>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700', packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
};

export function AdminDashboardClient({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-blue-500" href="/admin/orders" />
        <StatCard title="Gross Sales" value={formatPrice(stats.grossSales, 'en')} icon={DollarSign} color="bg-green-500" href="/admin/reports" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="bg-amber-500" href="/admin/orders?status=pending" />
        <StatCard title="Avg. Order Value" value={formatPrice(stats.avgOrderValue, 'en')} icon={TrendingUp} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Processing" value={stats.processingOrders} icon={Package} color="bg-indigo-500" href="/admin/orders?status=processing" />
        <StatCard title="Delivered" value={stats.deliveredOrders} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="bg-pink-500" href="/admin/customers" />
        <StatCard title="Low Stock Items" value={stats.lowStockProducts} icon={AlertTriangle} color={stats.lowStockProducts > 0 ? "bg-red-500" : "bg-gray-400"} href="/admin/products?filter=low-stock" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{order.customer_name}</td>
                      <td className="px-5 py-3 font-medium">{formatPrice(order.total, 'en')}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDateTime(order.created_at, 'en')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="p-5 space-y-4">
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>
            ) : (
              stats.topProducts.map((product: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{product.name_en}</p>
                      <p className="text-xs text-gray-400">{product.total_sold} sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(product.total_revenue, 'en')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/products/new', label: 'Add Product', icon: Package, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          { href: '/admin/coupons', label: 'Create Coupon', icon: DollarSign, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { href: '/admin/content', label: 'Edit Homepage', icon: Truck, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${action.color}`}>
            <action.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
