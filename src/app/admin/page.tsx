import { db } from '@/lib/db';
import { AdminDashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

function getStats() {
  const sqlite = (db as any).$client;
  try {
    const totalOrders = sqlite.prepare("SELECT COUNT(*) as c FROM orders").get()?.c || 0;
    const pendingOrders = sqlite.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get()?.c || 0;
    const processingOrders = sqlite.prepare("SELECT COUNT(*) as c FROM orders WHERE status IN ('confirmed','processing','packed')").get()?.c || 0;
    const deliveredOrders = sqlite.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get()?.c || 0;
    const grossSales = sqlite.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status NOT IN ('cancelled','refunded')").get()?.s || 0;
    const netSales = sqlite.prepare("SELECT COALESCE(SUM(total - discount_amount), 0) as s FROM orders WHERE status = 'delivered'").get()?.s || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;
    const totalCustomers = sqlite.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get()?.c || 0;
    const totalProducts = sqlite.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'published'").get()?.c || 0;
    const lowStockProducts = sqlite.prepare("SELECT COUNT(DISTINCT p.id) as c FROM products p JOIN product_variants pv ON pv.product_id = p.id WHERE pv.quantity_on_hand - pv.quantity_reserved <= pv.low_stock_threshold AND pv.is_active = 1 AND p.status = 'published'").get()?.c || 0;

    const recentOrders = sqlite.prepare(`
      SELECT id, order_number, customer_name, total, status, payment_status, payment_method, created_at 
      FROM orders ORDER BY created_at DESC LIMIT 10
    `).all();

    const topProducts = sqlite.prepare(`
      SELECT p.name_en, p.name_ar, SUM(oi.quantity) as total_sold, SUM(oi.total) as total_revenue
      FROM order_items oi JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id WHERE o.status NOT IN ('cancelled','refunded')
      GROUP BY p.id ORDER BY total_sold DESC LIMIT 5
    `).all();

    return {
      totalOrders, pendingOrders, processingOrders, deliveredOrders,
      grossSales, netSales, avgOrderValue, totalCustomers, totalProducts,
      lowStockProducts, recentOrders, topProducts,
    };
  } catch (e) {
    return {
      totalOrders: 0, pendingOrders: 0, processingOrders: 0, deliveredOrders: 0,
      grossSales: 0, netSales: 0, avgOrderValue: 0, totalCustomers: 0, totalProducts: 0,
      lowStockProducts: 0, recentOrders: [], topProducts: [],
    };
  }
}

export default function AdminDashboard() {
  const stats = getStats();
  return <AdminDashboardClient stats={stats} />;
}
